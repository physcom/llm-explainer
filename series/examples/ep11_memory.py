"""Two kinds of memory for an agent.

Short-term memory: the conversation in the prompt. Your code trims it to a token budget.
Long-term memory: notes outside the model. Your code retrieves the notes that fit a new question
and adds them to the prompt. TF-IDF keeps the retrieval small and offline (see episode 7);
a real application usually uses an embedding model.
"""
import math

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def tokens(text: str) -> int:
    """A simple rule for this demo: 1 token for every 4 characters (a real tokenizer gives other counts)."""
    return math.ceil(len(text) / 4)


# ---- short-term memory: keep the newest messages that fit the budget ----------------------------------
SYSTEM = "You help the customers of a small bike shop. Use the notes from memory."
BUDGET = 80                                                        # tokens for the system prompt and the history

HISTORY = [
    ("user", "Hello, I want to look at the Trail bike."),
    ("assistant", "Welcome. The Trail bike is a good all-round bike. What do you want to know?"),
    ("user", "What is the price, and does it come with lights?"),
    ("assistant", "The price is 480 dollars. Lights are not in the box, but we sell a set for 25 dollars."),
    ("user", "OK. Is express delivery possible to my city?"),
    ("assistant", "Yes, express delivery takes 1 day and costs 15 dollars."),
    ("user", "Good. And which frame size fits me?"),
]


def trim(history: list[tuple[str, str]], budget: int) -> list[bool]:
    """For each message: True if it stays in the prompt. The newest messages stay, the oldest go first."""
    keep = [False] * len(history)
    used = tokens(SYSTEM)
    for i in range(len(history) - 1, -1, -1):
        cost = tokens(history[i][1])
        if used + cost > budget:
            break
        keep[i] = True
        used += cost
    return keep


# ---- long-term memory: notes with a kind, found by similarity -----------------------------------------
NOTES = [
    ("episodic", "On 3 March the customer asked to return order A-1001. We refunded the full price."),
    ("episodic", "On 12 April the customer bought a Trail bike and chose express delivery."),
    ("semantic", "The customer is 172 cm tall and rides on gravel roads. A medium frame size fits."),
    ("semantic", "The customer pays by card and wants the receipt by email."),
    ("procedural", "To handle a return: check the order date, check that the box is original, then refund the card."),
    ("procedural", "To book a repair: ask for the bike model, then offer a free date in the workshop."),
]

# What the agent asks its memory before it answers (not the words of the customer).
QUESTIONS = [
    "Which frame size fits this customer?",
    "Did this customer return an order before?",
    "How do we handle a return?",
]


def recall(question: str, k: int = 1) -> list[tuple[int, float]]:
    """Return the k notes closest to the question as (note index, cosine similarity)."""
    vectorizer = TfidfVectorizer(stop_words="english")
    note_vectors = vectorizer.fit_transform(text for _, text in NOTES)
    scores = cosine_similarity(vectorizer.transform([question]), note_vectors)[0]
    best = sorted(range(len(NOTES)), key=lambda i: -scores[i])[:k]
    return [(i, float(scores[i])) for i in best]


def build_prompt(memory_question: str) -> str:
    """The prompt: system text, the notes that fit the memory question, then the trimmed history."""
    notes = "\n".join(f"[{NOTES[i][0]}] {NOTES[i][1]}" for i, _ in recall(memory_question))
    keep = trim(HISTORY, BUDGET)
    history = "\n".join(f"{role}: {text}" for (role, text), k in zip(HISTORY, keep) if k)
    return f"{SYSTEM}\n\nNotes from memory:\n{notes}\n\n{history}"


if __name__ == "__main__":
    print(f"Short-term memory: budget {BUDGET} tokens, system prompt {tokens(SYSTEM)} tokens")
    keep = trim(HISTORY, BUDGET)
    for (role, text), k in zip(HISTORY, keep):
        print(f"  {'keep' if k else 'drop'}  {tokens(text):3d} tokens  {role}: {text[:52]}")
    print(f"  total kept: {tokens(SYSTEM) + sum(tokens(t) for (_, t), k in zip(HISTORY, keep) if k)} tokens\n")

    print("Long-term memory:")
    for q in QUESTIONS:
        i, score = recall(q)[0]
        print(f"  Q: {q}")
        print(f"     {score:.2f}  [{NOTES[i][0]}] {NOTES[i][1]}")
    print("\nPrompt for the first question:")
    print("-" * 60)
    print(build_prompt(QUESTIONS[0]))
