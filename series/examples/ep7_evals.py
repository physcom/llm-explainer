"""An eval: a fixed set of test questions with expected answers, and a script that gives a score.

The "model" here is a stub, so the eval runs offline: it answers with the best chunk from the
retrieval step of ep7_rag_tfidf.py. To evaluate a real application, replace stub_model with the
function that calls the LLM. Run the eval after each change to the prompt, the chunks or the model.
"""
from ep7_rag_tfidf import CHUNKS, retrieve

# Each case: a question and a fact that a correct answer must contain.
CASES = [
    ("How many days do I have to return a bike?", "30 days"),
    ("How much does express delivery cost?", "15 dollars"),
    ("How long is the warranty on the frame?", "5-year"),
    ("What frame size do I need at 170 cm?", "medium"),
    ("How much is a basic service?", "60 dollars"),
    ("What does it cost to fix my bike?", "60 dollars"),
]


def stub_model(question: str) -> tuple[str, str]:
    """Stand-in for an LLM call: return (answer, title of the chunk that it used)."""
    i, _ = retrieve(question, k=1)[0]
    return CHUNKS[i][1], CHUNKS[i][0]


def run_evals() -> list[dict]:
    results = []
    for question, expected in CASES:
        answer, source = stub_model(question)
        results.append({"question": question, "expected": expected, "source": source,
                        "passed": expected.lower() in answer.lower()})       # the grader: a simple check
    return results


if __name__ == "__main__":
    results = run_evals()
    for r in results:
        mark = "PASS" if r["passed"] else "FAIL"
        print(f"{mark}  {r['question']:<44} expected '{r['expected']}', used chunk '{r['source']}'")
    passed = sum(r["passed"] for r in results)
    print(f"\nscore: {passed} / {len(results)}")
