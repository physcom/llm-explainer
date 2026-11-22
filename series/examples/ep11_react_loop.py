"""A ReAct loop: the model writes a thought and an action, this code runs the action and adds the
observation to the prompt, and the loop repeats until the model writes a final answer.

The model here is ScriptedModel, a small stand-in that reads the transcript and writes the next
step, as an LLM would. So the file runs offline with no API key. The two tools run for real.
To use a real model, replace ScriptedModel.__call__ with one LLM call (see episode 7).
"""
import ast
import operator
import re

# The data behind the lookup tool. In a real application: a database or an API.
FACTS = {
    "trail_bike_price": 480,
    "member_discount_percent": 15,
    "express_delivery_fee": 15,
}

SYSTEM = (
    "You answer questions about a bike shop. Write one step at a time.\n"
    "Thought: what you think and what you need.\n"
    "Action: tool[input]   (tools: lookup[fact name], calculate[expression])\n"
    "You get an Observation back. When you know the answer, write: Final Answer: ..."
)

OPS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul, ast.Div: operator.truediv}


def lookup(key: str) -> str:
    """Tool 1: read one fact."""
    return str(FACTS[key]) if key in FACTS else f"error: there is no fact named {key}"


def _eval(node: ast.AST) -> float:
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    if isinstance(node, ast.BinOp) and type(node.op) in OPS:
        return OPS[type(node.op)](_eval(node.left), _eval(node.right))
    raise ValueError("only numbers and + - * / are allowed")


def calculate(expression: str) -> str:
    """Tool 2: a calculator for + - * / and brackets. It never runs other code."""
    try:
        return f"{_eval(ast.parse(expression, mode='eval').body):.2f}"
    except (ValueError, SyntaxError, ZeroDivisionError) as err:
        return f"error: {err}"


TOOLS = {"lookup": lookup, "calculate": calculate}


class ScriptedModel:
    """Stand-in for an LLM. It knows which facts the question needs (a real model reads this from the question)."""

    def __init__(self, needs: list[str]):
        self.needs = needs

    def __call__(self, transcript: str) -> str:
        known = dict(re.findall(r"Action: lookup\[(\w+)\]\nObservation: ([0-9.]+)", transcript))
        for key in self.needs:
            if key not in known:                                   # a fact is missing: ask for it (again, if it failed)
                return f"Thought: I need the {key.replace('_', ' ')}.\nAction: lookup[{key}]"
        if "Action: calculate" not in transcript:
            price, percent, fee = (known[k] for k in self.needs)
            return (f"Thought: I have all three facts. Now I compute the total.\n"
                    f"Action: calculate[{price} * (1 - {percent} / 100) + {fee}]")
        total = re.findall(r"Observation: ([0-9.]+)", transcript)[-1]
        return f"Thought: The calculation gives the total.\nFinal Answer: {total} dollars"


def run(question: str, model: ScriptedModel, max_steps: int = 8) -> dict:
    transcript = f"{SYSTEM}\n\nQuestion: {question}\n"
    steps = []
    for n in range(1, max_steps + 1):                              # the step limit: a confused loop cannot run forever
        reply = model(transcript)                                  # one model call
        thought = re.search(r"Thought: (.*)", reply).group(1)
        final = re.search(r"Final Answer: (.*)", reply)
        if final:
            steps.append({"n": n, "thought": thought, "final": final.group(1)})
            return {"steps": steps, "answer": final.group(1), "stopped": "final answer",
                    "model_calls": n, "tool_calls": n - 1}
        name, arg = re.search(r"Action: (\w+)\[(.*)\]", reply).groups()
        observation = TOOLS[name](arg)                             # your code runs the action
        steps.append({"n": n, "thought": thought, "action": f"{name}[{arg}]", "observation": observation})
        transcript += f"{reply}\nObservation: {observation}\n"     # add the observation to the prompt
    return {"steps": steps, "answer": None, "stopped": "step limit",
            "model_calls": max_steps, "tool_calls": max_steps}


QUESTION = "What does a Trail bike cost for a member, with express delivery?"
NEEDS = ["trail_bike_price", "member_discount_percent", "express_delivery_fee"]
STUCK_QUESTION = "What does a Ghost bike cost?"                    # there is no such fact: the model asks again and again


def show(result: dict) -> None:
    for s in result["steps"]:
        print(f"{s['n']}  Thought: {s['thought']}")
        if "final" in s:
            print(f"   Final Answer: {s['final']}")
        else:
            print(f"   Action: {s['action']}")
            print(f"   Observation: {s['observation']}")
    print(f"=> stopped: {result['stopped']} | model calls: {result['model_calls']} | tool calls: {result['tool_calls']}")


if __name__ == "__main__":
    print(f"Q: {QUESTION}")
    show(run(QUESTION, ScriptedModel(NEEDS)))
    print(f"\nQ: {STUCK_QUESTION}  (step limit 5)")
    show(run(STUCK_QUESTION, ScriptedModel(["ghost_bike_price"]), max_steps=5))
