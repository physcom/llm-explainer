"""An orchestrator and two workers. The orchestrator splits a task into two jobs. Each worker has its own
context and its own tool, and sends back only a short result. Then the example runs the same task with
one agent, so that you can compare the context sizes and the number of model calls.

The "model" in every agent is a scripted stand-in (it follows fixed rules), so that the file runs
offline with no API key. The tools run for real.
"""
import math

# The data behind the tools. In a real application: a database or an API.
ORDERS = [("A-1041", "delivered", 0), ("A-1042", "out for delivery", 0),
          ("A-1043", "in the warehouse", 2), ("A-1044", "in the warehouse", 3)]
TICKETS = [
    "Can I return a bike that I bought two weeks ago?",
    "Where is my order A-1043? It is late.",
    "How do I return the helmet? The box is open.",
    "Do you have the Trail bike in size large?",
    "I want to return my bike. The frame is too big for me.",
    "What does a basic service cost?",
]
TASK = "Write a short report for the shop owner: which orders are late, and how many customers ask about returns."


def tokens(text: str) -> int:
    """A simple rule for this demo: 1 token for every 4 characters."""
    return math.ceil(len(text) / 4)


def late_orders(min_days: str) -> str:
    """Tool 1: the orders that are at least min_days days late."""
    return "\n".join(f"{oid}: {status}, {days} days late" for oid, status, days in ORDERS if days >= int(min_days))


def search_tickets(word: str) -> str:
    """Tool 2: the support tickets that contain a word."""
    return "\n".join(f"- {t}" for t in TICKETS if word in t.lower())


def summarize_orders(observation: str) -> str:
    rows = observation.splitlines()
    return f"{len(rows)} orders are late: " + "; ".join(f"{r.split(':')[0]} ({r.split(', ')[1]})" for r in rows) + "."


def summarize_tickets(observation: str) -> str:
    return f"{len(observation.splitlines())} of {len(TICKETS)} tickets ask about returns."


class Agent:
    """An agent has a name and a context: the list of messages that it can see."""

    def __init__(self, name: str, system: str):
        self.name, self.context, self.model_calls = name, [("system", system)], 0

    def see(self, role: str, text: str) -> None:
        self.context.append((role, text))

    def write(self, text: str) -> None:                              # one model call: the agent writes one message
        self.model_calls += 1
        self.see("assistant", text)

    def context_tokens(self) -> int:
        return sum(tokens(t) for _, t in self.context)


class Worker(Agent):
    """A worker is an agent with one job and one tool. It sees only its own job."""

    def __init__(self, name, system, tool_name, tool, tool_input, summarize):
        super().__init__(name, system)
        self.tool_name, self.tool, self.tool_input, self.summarize = tool_name, tool, tool_input, summarize

    def run(self, job: str) -> str:
        self.see("user", job)
        self.write(f"tool call: {self.tool_name}({self.tool_input!r})")
        observation = self.tool(self.tool_input)                     # your code runs the tool
        self.see("tool", observation)
        result = self.summarize(observation)
        self.write(result)
        return result                                                # only the result goes back


def orchestrate(task: str) -> dict:
    boss = Agent("orchestrator", "You split a task into jobs, give each job to a worker, and join the results.")
    boss.see("user", task)
    workers = [
        ("Find the late orders.", Worker("order_worker", "You check orders. Use the tool, then answer in one sentence.",
                                         "late_orders", late_orders, "1", summarize_orders)),
        ("Count the tickets that ask about returns.", Worker("support_worker", "You read support tickets. Use the tool, then answer in one sentence.",
                                                             "search_tickets", search_tickets, "return", summarize_tickets)),
    ]
    boss.write("plan: job 1 for order_worker, job 2 for support_worker")
    flow, results = [], []
    for job, worker in workers:
        flow.append({"from": "orchestrator", "to": worker.name, "text": job})
        result = worker.run(job)
        flow.append({"from": worker.name, "to": "orchestrator", "text": result})
        boss.see("worker result", result)
        results.append(result)
    report = " ".join(results)
    boss.write("Report: " + report)
    agents = [boss] + [w for _, w in workers]
    return {"flow": flow, "agents": agents, "report": report, "model_calls": sum(a.model_calls for a in agents)}


def single_agent(task: str) -> Agent:
    """The same task in one context: the agent sees every tool call and every observation."""
    a = Agent("one agent", "You check orders and read support tickets. Use the tools, then write the report.")
    a.see("user", task)
    a.write("tool call: late_orders('1')")
    a.see("tool", late_orders("1"))
    a.write("tool call: search_tickets('return')")
    a.see("tool", search_tickets("return"))
    a.write("Report: " + summarize_orders(late_orders("1")) + " " + summarize_tickets(search_tickets("return")))
    return a


if __name__ == "__main__":
    out = orchestrate(TASK)
    print(f"Task: {TASK}\n")
    print("Message flow:")
    for m in out["flow"]:
        print(f"  {m['from']:14} -> {m['to']:14} {m['text']}")
    print(f"\nReport: {out['report']}\n")
    one = single_agent(TASK)
    print("What each agent can see (context size, model calls):")
    for a in out["agents"] + [one]:
        print(f"  {a.name:14} {a.context_tokens():4d} tokens  {len(a.context):2d} messages  {a.model_calls} model calls")
    print(f"\nTotal model calls: {out['model_calls']} with workers, {one.model_calls} with one agent")
