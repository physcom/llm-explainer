# Episode 12 notes: advanced RAG and evals

Collected 2026-11-22. Rules: see `README.md` (paraphrased digests, topic map and cross-check only, no numbers on screen
unless an example in `examples/` reproduces them, primary sources in SOURCES).
Pages were fetched with curl and the visible text was read. Paywall status is per page.

## dailydoseofds.com pages

| Page | Status | What it covers (paraphrase) |
|------|--------|-----------------------------|
| blog.dailydoseofds.com/p/jev-for-rag-clearly-explained | Fully readable (newsletter, 2026-09-30). The RAG part is one section of three. | Build a wide candidate list first: keyword search and dense search, joined by reciprocal rank fusion, about the top 20. The goal of this stage is recall: retrieval sets the upper limit, and a later stage cannot bring back a passage that is not in the list. A second stage scores each candidate as evidence for the question, all in one request. Code (not the model) applies a threshold. A last check asks whether the kept passages can answer at all, and if not, the app says "not in the documents". The page promotes one product; only the pipeline idea is used. |
| blog.dailydoseofds.com/p/5-chunking-strategies-for-rag | Fully readable. | Five ways to split: fixed size (with overlap, because a plain cut can split an idea), semantic (merge neighbours while their embeddings stay similar; needs a threshold), recursive (split by separators, then split again if too long), document structure (headings and sections; needs a clear structure), LLM-based (best meaning, highest cost). The author says to test, because the best choice depends on the content. |
| blog.dailydoseofds.com/p/most-llm-powered-evals-are-broken | Fully readable (2025-10-22). Half of the page is an unrelated production-testing question. | A score for one output alone does not tell you which of two prompts is better. Compare A with B directly and pick the better one (pairwise). The page names a DeepEval feature for this. |
| blog.dailydoseofds.com/p/a-better-way-to-build-llm-as-a-judge | Fully readable (sponsored, 2026-07-01). | A frontier model as a judge costs money on every call, adds delay, and may miss domain details. The page promotes training a small judge. The three problems are used as a cross-check; the product is not used. |
| blog.dailydoseofds.com/p/the-hands-on-ai-engineer-playbook | Fully readable (2026-08-03). | In a RAG request the model reading the retrieved text (prefill) costs more time than embedding, search and rerank together. Numbers are the site's claims and are not used. Related to episode 10, not repeated. |
| www.dailydoseofds.com/building-rag-systems-course-part-16-with-implementation/ | PARTLY readable. Cut off by the paywall ("This lesson is for paying subscribers only") before the implementation. | The free part: agentic retrieval (the model chooses the search), why short queries lose the constraints that identify the target, BM25 with inverse document frequency on a three-document example, mean reciprocal rank as the metric that punishes buried answers, why semantic search still helps when query and document use different words. Not cited in SOURCES (not read in full). |
| www.dailydoseofds.com/llmops-crash-course-part-10 and part-11 | PARTLY readable: the recap and the first sections only; the paywall cuts the rest. | The recaps list the RAG metrics Recall@K, Precision@K and MRR; groundedness (faithfulness) by splitting the answer into claims and checking each against the context; LLM judges depend on the prompt and the rubric; pairwise comparison. Not cited (not read in full). |
| www.dailydoseofds.com/a-crash-course-on-building-rag-systems-part-1-with-implementations/ | PARTLY readable; paywall after the intro. | Not used. |

The sidebar of the RAG Systems Course (lesson titles are free) confirms the topic map: foundations, chunking, embedding and
ranking, reranking, graph retrieval, latency and prefill, context limits, vector databases. Episode 12 covers the part that
a beginner needs: chunking, hybrid search, reranking and how to evaluate. It leaves out graph retrieval, ColBERT,
agentic retrieval (episode 11 covers the loop) and vector-database sizing.

## Conflicts and gaps

- Promotional claims that "fixing chunking gives 10x" appear in one search snippet of a vendor post. We do not repeat it.
  A 2026 SemEval paper found that other chunk methods did not beat a fixed window. Our own run measures one small corpus
  and says so; it does not claim a general rule.
- Reranking figures (latency of about a hundred milliseconds; accuracy tables of 65-80 percent vs 85-90 percent) are claims
  of the sites. We do not put any of them on screen. Our reranker is a stand-in and is labelled as one.
- The Anthropic post reports its own numbers for contextual retrieval (a 49 percent drop in failed top-20 retrievals,
  and a larger drop with a reranker). They come from its own data sets. We show the idea and measure a cheap
  version (the section title as the context line) on our own corpus.
- No page gave a way to run an LLM judge offline. The judge in the example is a toy that is built to show the swap test.

## Primary sources (every URL fetched on 2026-11-22)

- BM25: Robertson and Zaragoza 2009, "The Probabilistic Relevance Framework: BM25 and Beyond", Foundations and Trends in
  Information Retrieval 3(4), pages 333-389. PDF of the review at https://staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf
  (fetched, 200, a PDF). The publisher page blocks scripts with a bot check.
- Reciprocal rank fusion: Cormack, Clarke and Buettcher 2009, SIGIR, pages 758-759.
  https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf (fetched, 200, a PDF). RRF score of a document =
  sum over the ranked lists of 1 / (k + rank), with k = 60 in the paper.
- Reranking with a cross-encoder: Nogueira and Cho 2019, "Passage Re-ranking with BERT", https://arxiv.org/abs/1901.04085
  (fetched, 200, title checked). The query and the passage are read together by one model.
- Contextual Retrieval: Anthropic, https://www.anthropic.com/news/contextual-retrieval (fetched, read). The method adds a
  short, chunk-specific line of context to each chunk before the embedding and the BM25 index. It names chunk boundaries,
  chunk size and overlap as choices that change results, and says to always run evals. It also says that with a knowledge
  base under about 200,000 tokens you can put it all in the prompt.
- LLM judges: Zheng et al. 2023, "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena", https://arxiv.org/abs/2306.05685
  (fetched, 200, title checked). Names position bias, verbosity bias and self-enhancement bias, and measures how often
  a strong judge agrees with humans.
- RAG metrics: Es et al. 2023, "Ragas: Automated Evaluation of Retrieval Augmented Generation",
  https://arxiv.org/abs/2309.15217 (fetched, 200, title checked). Faithfulness, answer relevance and context relevance.
- Retrieval-augmented generation: Lewis et al. 2020, https://arxiv.org/abs/2005.11401 (already cited in episode 7).

## Offline example plan

A hand-written bike-shop handbook of 42 short paragraphs in 14 sections, 21 questions, each with the sentence that holds the
answer. The same questions test the chunk sizes, the retrievers (TF-IDF as in episode 7, BM25, a dense stand-in with
latent semantic analysis, the fusion of the two) and a stand-in reranker. The result holds for this corpus only.
