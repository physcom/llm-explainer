"""The retrieval step of RAG: find the chunks closest to a question and put them into the prompt.

TF-IDF vectors keep the example small and offline. A real application usually uses an
embedding model for the vectors (see episode 6); the steps stay the same.
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# The documents of a small bike shop, already split into chunks (one topic per chunk).
CHUNKS = [
    ("Returns", "You can return a bike within 30 days of delivery. The bike must be unused and "
                "in the original box. We refund the full price to your card."),
    ("Delivery", "Standard delivery takes 3 to 5 working days. Express delivery takes 1 day "
                 "and costs 15 dollars."),
    ("Warranty", "Every frame has a 5-year warranty. Brakes, chains and tires have a 1-year warranty."),
    ("Payment", "We accept cards and bank transfer. You pay when you place the order."),
    ("Repairs", "Our workshop repairs bikes from any shop. A basic service costs 60 dollars "
                "and takes 2 days."),
    ("Sizes", "Choose the frame size from your height. Riders from 165 to 175 cm need a medium frame."),
]

# 1. Turn each chunk into a vector (one number for each word of the vocabulary).
vectorizer = TfidfVectorizer(stop_words="english")
chunk_vectors = vectorizer.fit_transform(text for _, text in CHUNKS)


def retrieve(question: str, k: int = 2) -> list[tuple[int, float]]:
    """Return the k chunks closest to the question as (chunk index, cosine similarity)."""
    q = vectorizer.transform([question])                     # 2. the question becomes a vector too
    scores = cosine_similarity(q, chunk_vectors)[0]          # 3. compare it with every chunk
    best = sorted(range(len(CHUNKS)), key=lambda i: -scores[i])[:k]
    return [(i, float(scores[i])) for i in best]


def build_prompt(question: str, k: int = 2) -> str:
    """4. Put the best chunks into the prompt, and tell the model to answer only from them."""
    context = "\n".join(f"[{CHUNKS[i][0]}] {CHUNKS[i][1]}" for i, _ in retrieve(question, k))
    return ("Answer the question with the information below only. "
            "If the answer is not there, say that you do not know.\n\n"
            f"{context}\n\nQuestion: {question}")


if __name__ == "__main__":
    for question in ["Can I return a bike after two weeks?", "How long does express delivery take?"]:
        print(f"Q: {question}")
        for i, score in retrieve(question):
            print(f"   {score:.2f}  {CHUNKS[i][0]}")
        print()
    print("Prompt sent to the model for the first question:")
    print("-" * 60)
    print(build_prompt("Can I return a bike after two weeks?"))
