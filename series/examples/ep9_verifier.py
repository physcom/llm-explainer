"""Verifiable rewards: a program, not a reward model, scores the answer. A TOY with real code.

Question: "What is 17 * 6?"  The known answer is 102.
  accuracy reward  1.0 if the number inside <answer> ... </answer> equals the known answer, else 0.
  format reward    0.5 if the reply has <think> ... </think> and then <answer> ... </answer>, else 0.
  total            the sum. (The weights 1.0 and 0.5 are our choice for this toy.)
These two rewards score only the final answer: outcome reward.
check_steps() is a process reward: it checks every line of the reasoning with arithmetic.
"""
import ast
import operator
import re

QUESTION = "What is 17 * 6?"
TRUTH = 102
ACC_W, FMT_W = 1.0, 0.5

OPS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul, ast.Div: operator.truediv}
FORMAT_RE = re.compile(r"^\s*<think>.+?</think>\s*<answer>.+?</answer>\s*$", re.S)
ANSWER_RE = re.compile(r"<answer>(.*?)</answer>", re.S)
THINK_RE = re.compile(r"<think>(.*?)</think>", re.S)


def accuracy_reward(reply: str, truth: int = TRUTH) -> float:
    m = ANSWER_RE.search(reply)
    nums = re.findall(r"-?\d+(?:\.\d+)?", m.group(1)) if m else []
    return 1.0 if nums and float(nums[-1]) == truth else 0.0


def format_reward(reply: str) -> float:
    return 1.0 if FORMAT_RE.match(reply) else 0.0


def total_reward(reply: str, truth: int = TRUTH) -> dict:
    acc, fmt = accuracy_reward(reply, truth), format_reward(reply)
    return {"accuracy": acc, "format": fmt, "total": ACC_W * acc + FMT_W * fmt}


def _eval(node):
    if isinstance(node, ast.Expression):
        return _eval(node.body)
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    if isinstance(node, ast.BinOp) and type(node.op) in OPS:
        return OPS[type(node.op)](_eval(node.left), _eval(node.right))
    raise ValueError("not plain arithmetic")


def calc(expr: str):
    return _eval(ast.parse(expr.strip(), mode="eval"))


def check_steps(reply: str) -> list[dict]:
    """Process reward: one row for each line 'left = right' in the <think> part."""
    m = THINK_RE.search(reply)
    rows = []
    for line in (m.group(1) if m else "").strip().splitlines():
        left, _, right = line.partition("=")
        try:
            ok = abs(calc(left) - calc(right)) < 1e-9
        except (ValueError, SyntaxError, ZeroDivisionError):
            ok = False
        rows.append({"step": line.strip(), "ok": ok})
    return rows


# Replies that a model could write. The first line of each is a label for people.
REPLIES = [
    ("right, in format",
     "<think>\n17 * 6 = (10 + 7) * 6\n(10 + 7) * 6 = 10 * 6 + 7 * 6\n10 * 6 + 7 * 6 = 60 + 42\n60 + 42 = 102\n</think>"
     "<answer>102</answer>"),
    ("wrong, in format",
     "<think>\n17 * 6 = 17 + 17 + 17 + 17 + 17 + 17\n17 + 17 + 17 = 51\n51 + 51 = 112\n</think><answer>112</answer>"),
    ("right, no tags", "17 * 6 is 102."),
    ("right, no think", "<answer>102</answer>"),
    ("words, not a number", "<think>\n60 + 42 = 102\n</think><answer>one hundred two</answer>"),
]

if __name__ == "__main__":
    print(f"question: {QUESTION}   known answer: {TRUTH}   total = {ACC_W} * accuracy + {FMT_W} * format")
    print(f"{'reply':<22} {'accuracy':>8} {'format':>7} {'total':>6}")
    for label, reply in REPLIES:
        r = total_reward(reply)
        print(f"{label:<22} {r['accuracy']:>8.1f} {r['format']:>7.1f} {r['total']:>6.1f}")
    print()
    print("process reward: check each step")
    for label, reply in REPLIES[:2]:
        print(f"  {label}")
        for row in check_steps(reply):
            print(f"    {'ok ' if row['ok'] else 'BAD'}  {row['step']}")
