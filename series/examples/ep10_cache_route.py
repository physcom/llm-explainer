"""Three ways to cut the cost of requests: prompt caching, semantic caching, routing. No network, no API key.

Part 1: the price of an input prefix that many requests share. The prices are the Anthropic list prices
        (platform.claude.com/docs/en/about-claude/pricing), read on 2026-11-22. Prices change: check the page.
        The request pattern (20,000-token prefix, 50 requests) is an EXAMPLE, not a measurement.
Part 2: a semantic cache on a TOY. TF-IDF stands in for an embedding model. The questions are chosen to
        show one correct hit and one wrong hit.
Part 3: a router on a TOY. A simple rule sends short prompts to a small model. The "easy" labels are made up.
"""
from sklearn.feature_extraction.text import TfidfVectorizer

# ---------------------------------------------------------------- part 1: prompt caching
PRICE = {                                   # US dollars per million tokens (list prices, 2026-11-22)
    "claude-opus-5-5": {"input": 4.00, "output": 20.00, "cache_write_5m": 5.00, "cache_read": 0.20},
    "claude-haiku-5-5": {"input": 0.10, "output": 0.50, "cache_write_5m": 0.125, "cache_read": 0.01},
}
PREFIX_TOKENS = 20_000      # the part that never changes: tools, system prompt, documents
NEW_TOKENS = 500            # the part that changes in each request
REQUESTS = 50               # requests that follow each other within the 5-minute lifetime of the cache


def prefix_cost(model="claude-opus-5-5", prefix=PREFIX_TOKENS, new=NEW_TOKENS, n=REQUESTS):
    """Input cost in US dollars, without and with prompt caching."""
    p = PRICE[model]
    per_m = 1e6
    without = n * (prefix + new) * p["input"] / per_m
    first = prefix * p["cache_write_5m"] / per_m                 # the first request writes the cache
    rest = (n - 1) * prefix * p["cache_read"] / per_m            # later requests read it
    fresh = n * new * p["input"] / per_m                         # the new part always costs the normal price
    return {"without": without, "with": first + rest + fresh, "first": first, "rest": rest, "fresh": fresh}


# ---------------------------------------------------------------- part 2: semantic cache
STORED = [
    ("How do I cancel my order?", "Open My orders, choose the order, and select Cancel order."),
    ("What is your return policy?", "You can return an item within 30 days."),
    ("How long does delivery take?", "Standard delivery takes 3 to 5 days."),
]
# (question, does a stored answer really answer it?) The second column is the label that a person gives.
QUERIES = [
    ("How can I cancel my order?", True),
    ("How do I cancel my subscription?", False),     # similar words, different request
    ("Where is my parcel?", False),
]
THRESHOLD = 0.60


def semantic_cache(stored=STORED, queries=QUERIES, threshold=THRESHOLD):
    vec = TfidfVectorizer().fit([q for q, _ in stored] + [q for q, _ in queries])
    S = vec.transform([q for q, _ in stored])
    rows = []
    for text, same in queries:
        sims = (vec.transform([text]) @ S.T).toarray()[0]          # TF-IDF vectors have length 1: dot = cosine
        best = int(sims.argmax())
        hit = bool(sims[best] >= threshold)
        rows.append({"query": text, "match": stored[best][0], "similarity": float(sims[best]), "hit": hit,
                     "right": (hit and same), "wrong": (hit and not same), "answer": stored[best][1] if hit else None})
    return rows


# ---------------------------------------------------------------- part 3: routing
PROMPTS = [                                   # (prompt, a person says it is easy)
    ("Translate 'good morning' into French.", True),
    ("Is this review positive or negative? 'Great bike, fast delivery.'", True),
    ("Extract the order id from: 'My order A-1042 is late.'", True),
    ("Fix the spelling: 'recieve the pakage'.", True),
    ("Summarize this contract and list every clause that changes the refund rules, with a reason for each.", False),
    ("Find the bug in this function and explain why the test fails on the second call.", False),
]
IN_TOKENS, OUT_TOKENS = 1_000, 300            # tokens per request (an example)


def route(prompt):
    """A toy rule. A real router is a small classifier or a small model."""
    return "claude-haiku-5-5" if len(prompt.split()) <= 12 else "claude-opus-5-5"


def request_cost(model):
    p = PRICE[model]
    return (IN_TOKENS * p["input"] + OUT_TOKENS * p["output"]) / 1e6


def routing_demo(prompts=PROMPTS):
    rows = [{"prompt": t, "easy": e, "model": route(t), "cost": request_cost(route(t))} for t, e in prompts]
    all_large = len(prompts) * request_cost("claude-opus-5-5")
    routed = sum(r["cost"] for r in rows)
    sent_small_but_hard = sum(1 for r in rows if r["model"] == "claude-haiku-5-5" and not r["easy"])
    return {"rows": rows, "all_large": all_large, "routed": routed, "hard_to_small": sent_small_but_hard}


if __name__ == "__main__":
    print(f"PART 1  prompt caching: {REQUESTS} requests, {PREFIX_TOKENS:,} shared prefix tokens + {NEW_TOKENS} new tokens each")
    for m in PRICE:
        c = prefix_cost(m)
        print(f"{m:17s} input cost without cache ${c['without']:.3f}, with cache ${c['with']:.3f} "
              f"({(1 - c['with'] / c['without']) * 100:.0f} % less)")
    print()
    print(f"PART 2  semantic cache (TOY: TF-IDF instead of embeddings), a stored answer is used when similarity >= {THRESHOLD}")
    for r in semantic_cache():
        verdict = "cache miss: ask the model" if not r["hit"] else ("hit, answer is right" if r["right"] else "hit, answer is WRONG")
        print(f"  '{r['query']}'\n     closest stored: '{r['match']}'  similarity {r['similarity']:.2f}  -> {verdict}")
    print()
    d = routing_demo()
    print(f"PART 3  routing (TOY rule: {IN_TOKENS:,} input + {OUT_TOKENS} output tokens per request)")
    for r in d["rows"]:
        print(f"  {r['model']:17s} ${r['cost']:.5f}  {r['prompt'][:60]}")
    print(f"all prompts to claude-opus-5-5: ${d['all_large']:.5f}   routed: ${d['routed']:.5f}   "
          f"hard prompts sent to the small model: {d['hard_to_small']}")
