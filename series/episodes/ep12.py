"""Episode 12 - Advanced RAG and evals (deep dive). The last episode of the series."""
import importlib.util
import sys

import numpy as np

from common import EXAMPLES as EXAMPLES_DIR

EPISODE = {
    "id": "ep12",
    "n": 12,
    "level": "Deep dive",
    "title": "Advanced RAG and evals",
    "blurb": "Basic RAG can fail in the split, the search and the order of the results. Better chunks, hybrid search "
             "and a reranker help, and evals measure the search and the answer.",
}

CHAPTERS = [
    ("fail", "Where basic RAG fails"),
    ("chunk", "Chunks"),
    ("hybrid", "Hybrid search"),
    ("rerank", "Reranker"),
    ("evals", "Evals for RAG"),
]

SEGMENTS = [
    ("fail", "f1", "In episode 7, you built a simple RAG system. One test failed."),
    ("fail", "f2", "The question said fix. The right chunk said repairs. Its score was zero."),
    ("fail", "f3", "Basic RAG can fail in four places. The split can cut a fact. The search can miss the right chunk. The chunk can rank too low."),
    ("fail", "f4", "The worst failure is that nobody measures it."),

    ("chunk", "c1", "First, the split. A fixed split cuts the text every 40 words. Here, it cuts an answer in two."),
    ("chunk", "c2", "Now no chunk holds the whole fact. At 40 words, this happens to 7 of the 21 answers."),
    ("chunk", "c3", "Small chunks cut more facts. Big chunks cut fewer, but add more words. At 160 words, the top three add 451 words."),
    ("chunk", "c4", "Two fixes work. An overlap repeats the end of one chunk at the start of the next. Or split at paragraphs. A title line helps too: with it, 20 questions, not 19, find the right chunk."),

    ("hybrid", "h1", "Now the search. BM25 matches the exact words. A dense search compares vectors, so it can link words that mean the same. Ours is a small stand-in for an embedding model."),
    ("hybrid", "h2", "Reciprocal rank fusion, or RRF, merges the two lists. In each list, a chunk scores 1 divided by the sum of 60 and its rank. Add the scores."),
    ("hybrid", "h3", "Here, BM25 puts the right chunk 4th. The dense search puts it 1st. After fusion, it is 2nd."),
    ("hybrid", "h4", "A weak search can also hurt. For the fix question, BM25 is right, but the dense stand-in ranks the right chunk 24th. Fusion moves it to 8th."),
    ("hybrid", "h5", "You can also rewrite the question in the words of the documents. Here, try becomes test ride, and the rank goes from 8th to 1st."),

    ("rerank", "r1", "A reranker reads the question and one chunk together. It scores better than search, but it is slow. So search finds 10 chunks, and the reranker re-orders them."),
    ("rerank", "r2", "For the fix question, the right chunk moves from 8th to 2nd. Over all 21 questions, 20 reach the top three, not 19."),
    ("rerank", "r3", "Our reranker is a stand-in that counts shared words. It cannot see that try means test ride. A real one is a neural model, so it costs a model run for each chunk."),

    ("evals", "e1", "A change should prove itself. Measure the search and the answer separately."),
    ("evals", "e2", "Each question has a known right chunk. Recall at 3 counts the questions with it in the top 3. MRR averages 1 divided by its rank."),
    ("evals", "e3", "Here are six versions on 21 questions, one square for each. BM25 with a title line scores best. Each version misses different questions."),
    ("evals", "e4", "Now the answer. A simple grader checks each number and word against the retrieved text. This answer says 60 days, but the text says 30."),
    ("evals", "e5", "A judge model can grade what a rule cannot. But it can prefer the first answer. So ask twice, with the order swapped."),
    ("evals", "e6", "This toy judge has that bias: its verdict changes for 4 of 8 pairs. Also compare any judge with a human."),
    ("evals", "e7", "Last, log a trace for each request: question, chunks, prompt and answer. Here, it shows that the right chunk is not there."),
    ("evals", "e8", "This is the end of the series. You went from a line and a loss to classifiers, networks, and production."),
    ("evals", "e9", "You looked inside an LLM and built with one. Then you went deeper: fine-tuning, alignment, fast inference, agents, and now retrieval and evals."),
    ("evals", "e10", "Now pick one task. Write ten test cases. Build the simplest agent that passes them."),
]

# TTS only: the subtitles keep the written form.
SPOKEN = [
    ("BM25", "B M 25"),
    ("RRF", "R R F"),
    ("MRR", "M R R"),
    ("24th", "twenty fourth"),
    ("8th", "eighth"),
    ("2nd", "second"),
    ("4th", "fourth"),
    ("evals", "ee vals"),
]

EXAMPLES = [
    {
        "title": "The corpus: a small bike-shop handbook",
        "file": "ep12_corpus.py",
        "ran": True,
        "about": "42 short paragraphs in 14 sections, written by hand for this episode (it includes the six chunks of "
                 "episode 7), and 21 test questions. Each question has the text that holds its answer. A chunk is "
                 "'right' for a question when it holds that text completely. Every result in the episode is "
                 "measured on this corpus only.",
    },
    {
        "title": "Retrievers: TF-IDF, BM25, a dense stand-in, fusion and a reranker",
        "file": "ep12_retrieval.py",
        "ran": True,
        "about": "BM25 written in plain numpy; the TF-IDF search of episode 7; a dense stand-in (latent semantic analysis: "
                 "TF-IDF cut down to 15 dimensions with an SVD, not an embedding model); reciprocal rank fusion; and a "
                 "stand-in reranker that reads the question and a chunk together but only counts words. Running the file "
                 "prints recall@3 and MRR for three of the searches.",
    },
    {
        "title": "Chunking: fixed sizes, overlap, paragraphs, sections, a title line",
        "file": "ep12_chunking.py",
        "ran": True,
        "about": "The same BM25 search and the same 21 questions over seven ways to split the handbook. It prints how many "
                 "answers stay whole inside one chunk, how many right chunks reach the top 3, and how many words the top 3 "
                 "put into the prompt. The last lines add the section title in front of each paragraph.",
    },
    {
        "title": "Hybrid search with reciprocal rank fusion",
        "file": "ep12_hybrid.py",
        "ran": True,
        "about": "The failed question of episode 7, the two ranked lists and their fusion for one question, the questions "
                 "that each search misses, and a question that a hand-written rewrite fixes. The dense search is a "
                 "stand-in (latent semantic analysis), so it is much weaker than a real embedding model.",
    },
    {
        "title": "Two-stage search: a stand-in reranker",
        "file": "ep12_rerank.py",
        "ran": True,
        "about": "Hybrid search finds 10 candidates; the stand-in reranker re-orders them; the top 3 would go to the "
                 "prompt. The output shows the scores for the failed question of episode 7, the effect over all 21 "
                 "questions, and the cost in scored question-chunk pairs.",
    },
    {
        "title": "Evals for RAG: metrics, a groundedness check, a swap test, a trace",
        "file": "ep12_rag_eval.py",
        "ran": True,
        "about": "Six versions of the pipeline scored with recall@1, recall@3 and MRR; a simple groundedness grader on two "
                 "answers that were written by hand; a swap test of a TOY judge that is built with a bias toward the first "
                 "answer (replace toy_judge with a call to a real model to test a real judge); and one trace of a request "
                 "whose model is a stub that copies a sentence.",
    },
]

SOURCES = [
    {"label": "BM25",
     "text": "Robertson and Zaragoza 2009, The Probabilistic Relevance Framework: BM25 and Beyond (Foundations and Trends "
             "in Information Retrieval 3(4)). PDF of the review.",
     "url": "https://staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf"},
    {"label": "Reciprocal rank fusion (RRF)",
     "text": "Cormack, Clarke and Buettcher 2009, Reciprocal rank fusion outperforms Condorcet and individual rank learning "
             "methods (SIGIR). A chunk scores the sum of 1 / (k + rank) over the lists; the paper uses k = 60.",
     "url": "https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf"},
    {"label": "Rerank with a model that reads the question and the chunk together",
     "text": "Nogueira and Cho 2019, Passage Re-ranking with BERT. The reranker on screen is a stand-in for this kind of model.",
     "url": "https://arxiv.org/abs/1901.04085"},
    {"label": "A context line for each chunk; chunk size and overlap; always run evals",
     "text": "Anthropic, Contextual Retrieval. A model writes a short line for each chunk. On screen, the line is only the "
             "section title.",
     "url": "https://www.anthropic.com/news/contextual-retrieval"},
    {"label": "RAG metrics: faithfulness and context relevance",
     "text": "Es et al. 2023, Ragas: Automated Evaluation of Retrieval Augmented Generation.",
     "url": "https://arxiv.org/abs/2309.15217"},
    {"label": "LLM judges and their biases (position bias)",
     "text": "Zheng et al. 2023, Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena. The judge on screen is a toy built "
             "to show the swap test, not a model.",
     "url": "https://arxiv.org/abs/2306.05685"},
    {"label": "Topic map and cross-check: chunk strategies",
     "text": "Daily Dose of Data Science, 5 Chunking Strategies For RAG. Read in full. Used to check the topic list, not as a "
             "source of numbers.",
     "url": "https://blog.dailydoseofds.com/p/5-chunking-strategies-for-rag"},
    {"label": "Topic map and cross-check: a wide first stage, then a second stage",
     "text": "Daily Dose of Data Science, Jev for RAG, clearly explained! Read in full (the page promotes one product; only the "
             "pipeline idea was used). Used to check the topic list, not as a source of numbers.",
     "url": "https://blog.dailydoseofds.com/p/jev-for-rag-clearly-explained"},
    {"label": "Numbers on screen",
     "text": "Every number comes from running the example files during the build, on ONE small hand-written corpus (42 "
             "paragraphs, 21 questions). They show how the metrics work. They do not show how well a method works on your "
             "documents: one question is almost 5 points. The dense search is latent semantic analysis, not an embedding "
             "model; the reranker is a stand-in that counts words; the judge is a toy with a built-in bias; the sample "
             "answers and the rewrite were written by hand; the model of the trace is a stub. The drawings of the "
             "pipeline are drawings. Real published tests of these methods use much larger data.",
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


def nums() -> dict:
    corpus = _load("ep12_corpus")
    ret = _load("ep12_retrieval")
    chk = _load("ep12_chunking")
    hyb = _load("ep12_hybrid")
    rer = _load("ep12_rerank")
    ev = _load("ep12_rag_eval")
    Q = corpus.QUESTIONS
    nq = len(Q)
    n_chunks = len(hyb.CHUNKS)
    assert (n_chunks, nq, len(corpus.HANDBOOK)) == (42, 21, 14), "e2/e3 say 21 questions; the notes say 42 paragraphs in 14 sections"

    # --- fail: the failed question of episode 7
    iq = next(i for i, (q, _) in enumerate(Q) if q == "What does it cost to fix my bike?")
    fq, fans = Q[iq]
    right = next(iter(hyb.relevant(fans)))
    analyzer = hyb.tfidf.vec.build_analyzer()
    q_words = [w for w in analyzer(fq) if w not in hyb.tfidf.vec.get_stop_words() and w not in ret.STOP]
    c_words = [w for w in analyzer(hyb.CHUNKS[right]) if w not in hyb.tfidf.vec.get_stop_words()]
    assert not set(q_words) & set(c_words), "f2: the question and the right chunk share no word (TF-IDF as in episode 7)"
    # The words that almost match (display pairs): each must really occur in its list.
    pairs = [("fix", "repairs"), ("bike", "bikes"), ("cost", "costs")]
    assert all(a in q_words and b in c_words for a, b in pairs), "the display pairs come from the two word lists"
    tf_score = float(hyb.tfidf.scores(fq)[right])
    assert tf_score == 0.0, "f2: the score is zero"
    ranks_fix = hyb.rank_of(fq, fans)
    assert ranks_fix["tfidf"] is None and ranks_fix["bm25"] == 1 and ranks_fix["dense"] == 24 and ranks_fix["fused"] == 8, \
        "h4: BM25 first, dense 24th, fusion 8th"
    two = rer.two_stage(fq)
    assert two["first"].index(right) + 1 == 8 and two["second"].index(right) + 1 == 2, "r2: the right chunk moves from 8th to 2nd"

    # --- chunk: the seven splits, a cut example, the title line
    splits = []
    for name, chunks in chk.splits().items():
        e = chk.evaluate(chunks)
        splits.append({"name": name, "chunks": e["chunks"], "avg_words": r(e["avg_words"], 1), "whole": e["whole"],
                       "top3": e["top3"], "words": round(e["words"])})
    by = {s["name"]: s for s in splits}
    assert nq - by["fixed 40 words"]["whole"] == 7, "c2: 7 of the 21 answers are cut at 40 words"
    assert by["fixed 160 words"]["words"] == 451, "c3: 451 words in the top 3 at 160 words"
    assert by["fixed 20 words"]["whole"] < by["fixed 40 words"]["whole"] < by["fixed 80 words"]["whole"] \
        < by["fixed 160 words"]["whole"], "c3: small chunks cut more facts"
    assert by["fixed 20 words"]["words"] < by["fixed 40 words"]["words"] < by["fixed 80 words"]["words"] \
        < by["fixed 160 words"]["words"], "c3: big chunks put more words into the prompt"
    assert by["fixed 40, overlap 10"]["whole"] == nq and by["by paragraph"]["whole"] == nq, "c4: the two fixes keep every answer whole"
    handbook_words = len(corpus.flat_text().split())
    assert by["fixed 160 words"]["words"] > handbook_words * 0.4, "narration: a big share of the handbook"
    cuts = chk.cut_examples(40)
    assert len(cuts) == 7, "the cut examples are the 7 answers of c2"
    cut = next(c for c in cuts if c[0].startswith("How many points"))
    chunks40 = chk.fixed_chunks(40)
    ia = next(i for i, c in enumerate(chunks40) if c.endswith(cut[1]) and chunks40[i + 1].startswith(cut[2]))
    chunks_ov = chk.fixed_chunks(40, 10)
    ov_whole = next(c for c in chunks_ov if corpus.QUESTIONS[next(i for i, (q, _) in enumerate(Q) if q == cut[0])][1] in c)
    title = chk.with_title_line()
    assert (title["plain"]["top3"], title["titled"]["top3"]) == (19, 20), "c4: 19 -> 20"
    assert title["titled"]["mrr"] > title["plain"]["mrr"]

    # --- hybrid: the fusion example, the misses, the rewrite
    iq1 = 0
    q1, a1 = Q[iq1]
    res1 = hyb.search_all(q1)
    right1 = next(iter(hyb.relevant(a1)))
    pos = {n: res1[n].index(right1) + 1 for n in ("bm25", "dense", "fused")}
    assert pos == {"bm25": 4, "dense": 1, "fused": 2}, "h3: 4th, first, second"
    fails = hyb.failures_at(3)
    assert len(fails["bm25"]) == 2 and len(fails["fused"]) == 2 and not set(fails["bm25"]) & set(fails["fused"]), \
        "e3: BM25 and hybrid search each miss 2 questions at rank 3, and they are different questions"
    before, after = hyb.REWRITE
    ans_rw = next(a for qq, a in Q if qq == before)
    rk_b, rk_a = hyb.rank_of(before, ans_rw), hyb.rank_of(after, ans_rw)
    assert rk_b["fused"] == 8 and rk_a["fused"] == 1, "h5: 8th -> first"
    matrix = []
    for qi, (q, a) in enumerate(Q):
        rk = hyb.rank_of(q, a)
        matrix.append({n: rk[n] for n in ("tfidf", "bm25", "dense", "fused")})

    # --- rerank
    summ = rer.summary()
    assert round(summ["before"]["recall@3"] * nq) == 19 and round(summ["after"]["recall@3"] * nq) == 20, "r2: 19 -> 20"
    assert summ["ceiling"] == nq, "the right chunk is in the top 10 for every question"
    assert (summ["pairs"], summ["pairs_all"]) == (210, 882)
    rk_try = summ["ranks_after"][next(i for i, (q, _) in enumerate(Q) if q == before)]
    assert rk_try is not None and rk_try > 3, "r3: the stand-in cannot see that try means test ride"
    rer_list = [{"id": i, "title": hyb.TITLES[i], "score": two["scores"][i], "text": hyb.CHUNKS[i]} for i in two["first"]]

    # --- evals
    rows = ev.evaluate_versions()
    by_v = {x["version"]: x for x in rows}
    V = ev.VERSIONS
    assert by_v[V[5]]["recall@3"] == 20 and by_v[V[4]]["recall@3"] == 20 and by_v[V[3]]["recall@3"] == 19
    assert max(rows, key=lambda x: x["mrr"])["version"] == V[5], "e4: BM25 with a title line has the best MRR"
    assert by_v[V[1]]["mrr"] > by_v[V[3]]["mrr"], "e4: hybrid alone is below BM25 on MRR"
    assert abs(100 / nq - 4.8) < 0.05, "screen: one question is almost 5 points"
    samples = []
    ctx = hyb.CHUNKS[0]
    for question, answer in ev.SAMPLES:
        g = ev.grounded(answer, ctx)
        samples.append({"answer": answer, "checks": [{"sentence": c["sentence"], "supported": c["supported"],
                                                      "missing": c["missing_numbers"], "cover": r(c["cover"], 2)} for c in g]})
    assert all(c["supported"] for c in samples[0]["checks"]), "the true answer passes"
    assert any(c["missing"] == ["60"] for c in samples[1]["checks"]), "e4: the answer with 60 days fails"
    swap = ev.swap_test()
    assert sum(not x["consistent"] for x in swap) == 4 and len(swap) == 8, "e6: the verdict changes for 4 of 8 pairs"
    agree = (sum(x["agrees_AB"] for x in swap), sum(x["agrees_BA"] for x in swap))
    tr = ev.trace(Q[19][0])
    assert right_try_missing(tr, hyb, Q), "e7: the right chunk is not in the trace"
    tr_right = next(iter(hyb.relevant(next(a for q, a in Q if q == tr["question"]))))
    assert len({tuple(x["missed"]) for x in rows}) >= 4, "e3: the versions miss different questions"

    return {
        "corpus": {"chunks": n_chunks, "words": handbook_words, "questions": nq, "sections": len(corpus.HANDBOOK)},
        "fix": {"question": fq, "answer": fans, "right": right, "right_text": hyb.CHUNKS[right], "right_title": hyb.TITLES[right],
                "q_words": q_words, "c_words": c_words, "tfidf_score": tf_score, "ranks": ranks_fix,
                "pairs": pairs,
                "rerank_rank": two["second"].index(right) + 1},
        "splits": splits, "handbook_words": handbook_words,
        "cut": {"question": cut[0], "first": cut[1], "second": cut[2], "a": chunks40[ia], "b": chunks40[ia + 1],
                "index": ia, "overlap": ov_whole},
        "title": {"plain": {"top3": title["plain"]["top3"], "mrr": r(title["plain"]["mrr"]), "words": round(title["plain"]["words"])},
                  "titled": {"top3": title["titled"]["top3"], "mrr": r(title["titled"]["mrr"]), "words": round(title["titled"]["words"])}},
        "fusion": {"question": q1, "right": right1, "pos": pos,
                   "bm25": [{"id": i, "title": hyb.TITLES[i]} for i in res1["bm25"][:5]],
                   "dense": [{"id": i, "title": hyb.TITLES[i]} for i in res1["dense"][:5]],
                   "fused": [{"id": i, "title": hyb.TITLES[i], "score": r(res1["fused_scores"][i], 4)} for i in res1["fused"][:5]]},
        "misses": {k: v for k, v in fails.items()}, "matrix": matrix, "questions": [q for q, _ in Q],
        "rewrite": {"before": before, "after": after, "rank_before": rk_b["fused"], "rank_after": rk_a["fused"]},
        "rerank": {"list": rer_list, "second": two["second"][:3], "order": two["second"], "right": right,
                   "before": {"r3": round(summ["before"]["recall@3"] * nq), "mrr": r(summ["before"]["mrr"])},
                   "after": {"r3": round(summ["after"]["recall@3"] * nq), "mrr": r(summ["after"]["mrr"])},
                   "pairs": summ["pairs"], "pairs_all": summ["pairs_all"], "candidates": rer.CANDIDATES,
                   "ceiling": summ["ceiling"]},
        "versions": [{"version": x["version"], "r1": x["recall@1"], "r3": x["recall@3"], "mrr": r(x["mrr"]),
                      "ranks": x["ranks"], "missed": x["missed"]} for x in rows],
        "samples": samples, "context": ctx,
        "swap": swap, "agree": {"ab": agree[0], "ba": agree[1]},
        "trace": tr,
        "trace_right": {"id": tr_right, "title": hyb.TITLES[tr_right], "text": hyb.CHUNKS[tr_right]},
    }


def right_try_missing(tr: dict, hyb, Q) -> bool:
    """True when the right chunk of the 'try a bike' question is not among the chunks of the trace."""
    rel = hyb.relevant(next(a for q, a in Q if q == tr["question"]))
    return not (set(tr["chunks"]) & rel)
