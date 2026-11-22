"""Plan, then execute: the model writes the whole plan first, plain code runs the steps in order,
and the model writes a new plan only when a step fails.

ScriptedPlanner is a stand-in for an LLM, so that the file runs offline with no API key.
The tools run for real. To use a real model, replace the two methods of ScriptedPlanner with LLM calls
that return a list of steps (for example as JSON, see episode 7).
"""

# The data behind the tools. In a real application: a database or an API.
STOCK = {("trail_bike", "medium"): 3}
PRICES = {"trail_bike": 480}
DELIVERY_FEES = {("standard", "Oakville"): 5, ("express", "Midtown"): 15}     # express is not offered everywhere
MEMBER_DISCOUNT_PERCENT = 15


def check_stock(item: str, size: str) -> int:
    return STOCK.get((item, size), 0)


def get_price(item: str) -> int:
    return PRICES[item]


def get_delivery_fee(speed: str, city: str) -> int:
    if (speed, city) not in DELIVERY_FEES:
        raise LookupError(f"{speed} delivery is not available in {city}")
    return DELIVERY_FEES[(speed, city)]


def total(price: int, fee: int) -> float:
    return round(price * (1 - MEMBER_DISCOUNT_PERCENT / 100) + fee, 2)


TOOLS = {"check_stock": check_stock, "get_price": get_price, "get_delivery_fee": get_delivery_fee, "total": total}

TASK = "Quote a Trail bike, size medium, for a member. The customer wants express delivery to Oakville."


class ScriptedPlanner:
    """Stand-in for an LLM that writes plans. It counts its calls, because each call costs time and money."""

    def __init__(self):
        self.calls = 0

    def plan(self, task: str) -> list[dict]:
        self.calls += 1
        return [
            {"tool": "check_stock", "args": {"item": "trail_bike", "size": "medium"}, "save": "stock"},
            {"tool": "get_price", "args": {"item": "trail_bike"}, "save": "price"},
            {"tool": "get_delivery_fee", "args": {"speed": "express", "city": "Oakville"}, "save": "fee"},
            {"tool": "total", "args": {"price": "$price", "fee": "$fee"}, "save": "answer"},
        ]

    def replan(self, task: str, remaining: list[dict], error: str) -> list[dict]:
        """Read the error and rewrite the steps that are left. Here: use standard delivery."""
        self.calls += 1
        fixed = dict(remaining[0], args={**remaining[0]["args"], "speed": "standard"})
        return [fixed] + remaining[1:]


def label(step: dict) -> str:
    args = ", ".join(str(v) for v in step["args"].values())
    return f"{step['tool']}({args})"


def execute(task: str, planner: ScriptedPlanner, max_replans: int = 2) -> dict:
    plan = planner.plan(task)                                      # one model call
    plans, events, state, replans, i = [plan], [], {}, 0, 0
    while i < len(plan):
        step = plan[i]
        args = {k: state[v[1:]] if isinstance(v, str) and v.startswith("$") else v for k, v in step["args"].items()}
        try:
            state[step["save"]] = TOOLS[step["tool"]](**args)      # plain code runs the step: no model call
            events.append({"step": label(step), "status": "ok", "result": state[step["save"]]})
            i += 1
        except LookupError as err:
            events.append({"step": label(step), "status": "failed", "result": str(err)})
            replans += 1
            if replans > max_replans:
                return {"plans": plans, "events": events, "answer": None, "model_calls": planner.calls}
            plan = plan[:i] + planner.replan(task, plan[i:], str(err))   # a second model call
            plans.append(plan)
    return {"plans": plans, "events": events, "answer": state["answer"], "model_calls": planner.calls}


if __name__ == "__main__":
    print(f"Task: {TASK}\n")
    result = execute(TASK, ScriptedPlanner())
    for k, plan in enumerate(result["plans"], start=1):
        print(f"Plan {k}:")
        for n, step in enumerate(plan, start=1):
            print(f"  {n}. {label(step)}")
    print("\nRun:")
    for e in result["events"]:
        print(f"  {e['status']:6} {e['step']}  ->  {e['result']}")
    print(f"\nAnswer: {result['answer']:.2f} dollars | model calls: {result['model_calls']} (1 plan + {result['model_calls'] - 1} new plan)")
