"""Episode 7 - Build with LLMs (AI engineering)."""
import ast
import importlib.util
import json
import sys

import numpy as np

from common import EXAMPLES as EXAMPLES_DIR

EPISODE = {
    "id": "ep7",
    "n": 7,
    "level": "AI engineering",
    "title": "Build with LLMs",
    "blurb": "An application sends prompts to an LLM, adds your own data with RAG, lets the model use tools, "
             "and proves each change with evals.",
}

CHAPTERS = [
    ("api", "One API call"),
    ("prompt", "The prompt"),
    ("rag", "RAG: your own data"),
    ("tools", "Tools and agents"),
    ("evals", "Evals"),
]

SEGMENTS = [
    ("api", "a1", "In the last episode, you saw how an LLM works inside. Now we use one to build an application."),
    ("api", "a2", "Most AI engineering does not train a model. Your code sends text to a model API and gets text back."),
    ("api", "a3", "Each request has two parts. The system prompt gives the rules. The messages hold the conversation, and the model writes the next reply."),
    ("api", "a4", "The API counts tokens. Input tokens are the text that you send. Output tokens are the text that the model writes."),
    ("api", "a5", "The price and the time of each request depend on these two numbers. Output tokens cost more and take more time."),

    ("prompt", "p1", "The text that you send is the prompt. A good prompt gives clear instructions, as for a new colleague."),
    ("prompt", "p2", "Give the model the context and the goal. Tell it the format of the answer."),
    ("prompt", "p3", "Examples help. Put one or two examples of a good answer into the prompt."),
    ("prompt", "p4", "Code often needs data, not free text. Thus, ask for JSON with fixed fields."),
    ("prompt", "p5", "Do not trust the output without a check. Your code reads the JSON and checks each field."),
    ("prompt", "p6", "If a check fails, your code can send the error back and ask again."),

    ("rag", "r1", "A model knows only its training data. It does not know your documents or the news of today."),
    ("rag", "r2", "RAG adds this knowledge at the time of the question. RAG means retrieval-augmented generation."),
    ("rag", "r3", "First, split your documents into small chunks. Then turn each chunk into a vector, as in episode six."),
    ("rag", "r4", "When a question comes in, turn the question into a vector too."),
    ("rag", "r5", "Find the chunks with the vectors closest to the question. Here, the score is the cosine similarity."),
    ("rag", "r6", "Put the best chunks into the prompt. Tell the model to answer only from these chunks."),
    ("rag", "r7", "Now the answer comes from your data. The model can also show which chunk supports each fact."),

    ("tools", "t1", "A model can only write text. To act in the world, it needs tools."),
    ("tools", "t2", "You describe each tool to the model: a name, a description, and a JSON schema for the input."),
    ("tools", "t3", "The model decides when a tool can help. Then it asks for a tool call with a name and an input."),
    ("tools", "t4", "Your code runs the tool and sends the result back. The model reads it, and then it asks for another tool or gives the final answer."),
    ("tools", "t5", "This loop is an agent. The model chooses the steps, and your code does the work."),
    ("tools", "t6", "MCP is an open standard that connects tools and data to models. One MCP server can serve many applications."),

    ("evals", "e1", "How do you know that a change to the prompt makes the application better? You need evals."),
    ("evals", "e2", "An eval is a fixed set of test questions. Each question has an expected answer."),
    ("evals", "e3", "A script sends every question to the application and gives a score. Run it after each change."),
    ("evals", "e4", "This is the same idea as the validation set in episode two. Do not trust a result that you did not measure."),
    ("evals", "e5", "Here, one case fails. The question uses the word fix, but the document uses the word repairs. The failure shows what to fix next."),
    ("evals", "e6", "This is the end of the core course. You started with a line, a loss and gradient descent."),
    ("evals", "e7", "Then you measured on new data, trained classifiers and networks, put models into production, and looked inside an LLM. Today you built on top of one."),
    ("evals", "e8", "Next come five deep dives: fine-tuning, alignment, fast inference, agents, and advanced RAG."),
]

# TTS only: the subtitles keep the written form.
SPOKEN = [
    ("evals", "ee vals"),
    ("eval", "ee val"),
    ("retrieval-augmented", "retrieval augmented"),
]

EXAMPLES = [
    {
        "title": "RAG retrieval with TF-IDF",
        "file": "ep7_rag_tfidf.py",
        "ran": True,
        "about": "The retrieval step of RAG on the bike-shop chunks from the video: each chunk and the question become "
                 "TF-IDF vectors, cosine similarity ranks the chunks, and the best ones go into the prompt. "
                 "A real application usually uses an embedding model for the vectors; the steps are the same.",
    },
    {
        "title": "An eval harness",
        "file": "ep7_evals.py",
        "ran": True,
        "about": "Six test questions, each with a fact that a correct answer must contain. The model is a clearly named "
                 "stub (it answers with the best chunk), so the eval runs offline. Replace stub_model with your LLM call.",
    },
    {
        "title": "One Claude API call",
        "file": "ep7_claude_call.py",
        "ran": False,
        "about": "A system prompt and one message in; the text and the input and output token counts out, with the cost "
                 "of the call. Server-side fallbacks are on: if the model declines, the API runs the request again on a "
                 "fallback model.",
        "why_not_run": "It needs the anthropic package and an Anthropic API credential (ANTHROPIC_API_KEY or "
                       "`ant auth login`). The page build has neither, so there is no real output to show. "
                       "The file was type-checked with mypy --strict against anthropic 2.12.0.",
    },
    {
        "title": "A tool-use loop (an agent)",
        "file": "ep7_tool_loop.py",
        "ran": False,
        "about": "One tool, get_order_status, described by a name, a description and a JSON schema. The loop sends the "
                 "conversation, runs each tool call that the model asks for, sends all results back in one message, and "
                 "stops when the model gives its final answer.",
        "why_not_run": "It needs the anthropic package and an Anthropic API credential (ANTHROPIC_API_KEY or "
                       "`ant auth login`). The page build has neither, so there is no real output to show. "
                       "The file was type-checked with mypy --strict against anthropic 2.12.0.",
    },
]

SOURCES = [
    {"label": "Messages API: system prompt, messages, usage",
     "text": "Anthropic API reference, Create a Message.",
     "url": "https://platform.claude.com/docs/en/api/messages/create"},
    {"label": "Price per token (claude-opus-5-5: $4 input, $20 output per million tokens)",
     "text": "Anthropic pricing page, checked 2026-11-21.",
     "url": "https://platform.claude.com/docs/en/about-claude/pricing"},
    {"label": "JSON output and checks",
     "text": "Anthropic docs, Structured outputs.",
     "url": "https://platform.claude.com/docs/en/build-with-claude/structured-outputs"},
    {"label": "Retrieval-augmented generation (RAG)",
     "text": "Lewis et al. 2020, Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks.",
     "url": "https://arxiv.org/abs/2005.11401"},
    {"label": "Tools: name, description, input schema, the tool-use loop",
     "text": "Anthropic docs, Tool use overview.",
     "url": "https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview"},
    {"label": "Model Context Protocol (MCP)",
     "text": "The open standard and its specification.",
     "url": "https://modelcontextprotocol.io"},
    {"label": "Evals: test cases and automatic grading",
     "text": "Anthropic docs, Create strong empirical evaluations.",
     "url": "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests"},
    {"label": "Numbers on screen",
     "text": "The chunk scores, the vector cells, the eval results and the JSON checks come from running the example "
             "files during the build. The token counts in the cost example (1,200 in, 300 out) are an example, "
             "not a measurement.",
     "url": None},
]


def r(v, n=3):
    if isinstance(v, (list, tuple, np.ndarray)):
        return [r(x, n) for x in v]
    return round(float(v), n)


def _load(name: str):
    """Import an example file (examples/ is not a package)."""
    if str(EXAMPLES_DIR) not in sys.path:
        sys.path.insert(0, str(EXAMPLES_DIR))
    spec = importlib.util.spec_from_file_location(name, EXAMPLES_DIR / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _literals(filename: str, names: set[str]) -> dict:
    """Read top-level literal assignments from a file without importing it (the file needs anthropic)."""
    tree = ast.parse((EXAMPLES_DIR / filename).read_text(encoding="utf-8"))
    out = {}
    for node in tree.body:
        target = node.target if isinstance(node, ast.AnnAssign) else (node.targets[0] if isinstance(node, ast.Assign) else None)
        if isinstance(target, ast.Name) and target.id in names:
            out[target.id] = ast.literal_eval(node.value)
    return out


# The JSON check from the prompt chapter: the fields and the allowed values.
INTENTS = ["return", "delivery", "warranty", "repair", "other"]


def check_reply(text: str) -> list[dict]:
    """Check a model reply against the format that the prompt asked for. One row per check."""
    try:
        data = json.loads(text)
    except json.JSONDecodeError as err:
        return [{"field": "JSON", "ok": False, "note": f"not valid JSON ({err.msg})"}]
    rows = [{"field": "JSON", "ok": True, "note": "valid JSON"}]
    rows.append({"field": "intent", "ok": data.get("intent") in INTENTS,
                 "note": "one of the allowed values" if data.get("intent") in INTENTS else f"{data.get('intent')!r} is not allowed"})
    oid = data.get("order_id")
    ok = isinstance(oid, str) and oid.startswith("A-")
    rows.append({"field": "order_id", "ok": ok, "note": "a text like A-1042" if ok else f"{oid!r} is not an order id"})
    ok = isinstance(data.get("urgent"), bool)
    rows.append({"field": "urgent", "ok": ok, "note": "true or false" if ok else "missing"})
    return rows


# Every number that the scenes show. Nothing on screen is typed by hand.
def nums() -> dict:
    # --- API: price of an example request (token counts are an example, see SOURCES)
    price_in, price_out = 4.00, 20.00
    tok_in, tok_out = 1200, 300
    cost_in, cost_out = tok_in * price_in / 1e6, tok_out * price_out / 1e6

    # --- prompt: two example replies through the same check
    good = '{"intent": "return", "order_id": "A-1042", "urgent": false}'
    bad = '{"intent": "money back", "order_id": 1042}'

    # --- RAG: the real vectors and scores from the example file
    rag = _load("ep7_rag_tfidf")
    question = "How long does express delivery take?"
    vocab = rag.vectorizer.get_feature_names_out()
    M = rag.chunk_vectors.toarray()
    qv = rag.vectorizer.transform([question]).toarray()[0]
    scores = (qv @ M.T) / (np.linalg.norm(qv) * np.linalg.norm(M, axis=1) + 1e-12)
    top = [i for i, _ in rag.retrieve(question)]
    assert [round(s, 6) for _, s in rag.retrieve(question)] == [round(float(scores[i]), 6) for i in top]
    q_terms = [j for j in np.argsort(-qv) if qv[j] > 0]
    others = [j for j in np.argsort(-M.max(axis=0)) if j not in q_terms]
    cols = (q_terms + others)[:12]
    cols = sorted(cols, key=lambda j: vocab[j])

    # --- tools: the tool definition and the data, read from the example file
    lit = _literals("ep7_tool_loop.py", {"TOOLS", "ORDERS"})
    tool = lit["TOOLS"][0]

    # --- evals: run the real harness
    ev = _load("ep7_evals")
    results = ev.run_evals()
    fails = [x for x in results if not x["passed"]]
    assert len(fails) == 1 and "fix" in fails[0]["question"], "narration e5 says one case fails on 'fix'"

    return {
        "price_in": price_in, "price_out": price_out, "tok_in": tok_in, "tok_out": tok_out,
        "cost_in": r(cost_in, 4), "cost_out": r(cost_out, 4), "cost": r(cost_in + cost_out, 4),
        "out_ratio": r(price_out / price_in, 1),
        "reply_good": good, "reply_bad": bad,
        "check_good": check_reply(good), "check_bad": check_reply(bad), "intents": INTENTS,
        "chunks": [{"title": t, "text": x} for t, x in rag.CHUNKS],
        "question": question,
        "terms": [str(vocab[j]) for j in cols],
        "vecs": r(M[:, cols], 3),
        "qvec": r(qv[cols], 3),
        "scores": r(scores, 3),
        "top": [int(i) for i in top],
        "prompt": rag.build_prompt(question),
        "tool": {"name": tool["name"], "description": tool["description"],
                 "schema": json.dumps(tool["input_schema"]["properties"])},
        "order_id": "A-1042", "order": lit["ORDERS"]["A-1042"],
        "evals": results,
        "passed": sum(x["passed"] for x in results), "total": len(results),
    }
