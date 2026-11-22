# ML to AI Engineering — narrated series

Twelve narrated, animated HTML episodes (3Blue1Brown style): a seven-episode core course and five deep dives. Narration follows ASD-STE100 writing rules.
Voice: Windows SAPI ("Microsoft David Desktop"). One page with an episode picker; one audio file per episode.

## Outline (episodes 1-7 frozen; 8-12 added)

| # | Level | Title | Chapters (scene ids) | Runnable examples |
|---|-------|-------|----------------------|-------------------|
| 1 | Base | Learn from data | rules, model, loss, descent, rate | NumPy gradient descent; scikit-learn LinearRegression |
| 2 | Base | Generalization | split, overfit, curve, regular, cv | polynomial degree vs train/validation error; Ridge + cross-validation |
| 3 | Intermediate | Classification and metrics | classify, sigmoid, threshold, metrics, trees | LogisticRegression + confusion matrix; gradient boosting vs logistic |
| 4 | Intermediate | Neural networks | neuron, layers, nonlinear, backprop, train | NumPy MLP with backprop on two moons; scikit-learn MLPClassifier |
| 5 | Advanced | Production ML | lifecycle, pipeline, serve, monitor, ops | sklearn Pipeline + joblib; FastAPI endpoint tested with TestClient; drift check |
| 6 | Advanced | From ML to LLMs | tokens, embed, attention, predict, train | NumPy attention; character bigram model + temperature sampling |
| 7 | AI engineering | Build with LLMs | api, prompt, rag, tools, evals | TF-IDF retrieval (RAG core); eval harness; Claude API + tool-use loop (needs API key: not run) |
| 8 | Deep dive | Fine-tuning | why, sft, lora, qlora, choose | NumPy LoRA vs full fine-tuning on a toy model; memory budget table |
| 9 | Deep dive | Alignment and reasoning | imitate, reward, rlhf, verify, grpo | Bradley-Terry reward model; GRPO toy policy; rule verifier |
| 10 | Deep dive | Inference and serving | phases, kvcache, batching, speed, cost | KV cache vs none; batching + paged memory simulation; speculative sampling; quantization |
| 11 | Deep dive | Agents in depth | loop, plan, context, memory, team | ReAct loop with a stub model; plan-and-execute; memory + TF-IDF; orchestrator |
| 12 | Deep dive | Advanced RAG and evals | fail, chunk, hybrid, rerank, evals | chunk size vs recall; BM25 + dense (LSA) + RRF; reranker; recall@k / MRR / grounding checks |

Episodes 1-7 are the core course (frozen). Episodes 8-12 ("Deep dive", orange) were added 2026-11-21/22 from the topic map of
https://www.dailydoseofds.com (its course lessons are members-only: only freely readable pages were used, as a cross-check;
the notes are in `research/`). All narration and code are original; sources are primary papers and docs.
ep1 r1 and ep7 e6 were reworded and ep7 got a new last line e8 (teaser for the deep dives); ep1 and ep7 scenes show only the first 7 series cards.
ep12 closes the series: ep11 t7-t9 hand off to it, and ep12's last lines hold the series wrap-up and the call to action.

ep2 is fixed: ep1's last narration line (k6) announces "a model that is good on old data but bad on new data".

## Episode contract

`episodes/epN.py` must expose:

- `EPISODE = {"id", "n", "level", "title", "blurb"}`
- `CHAPTERS = [(chapter_id, title), ...]` — one scene per chapter.
- `SEGMENTS = [(chapter_id, key, text), ...]` — `key` unique inside the episode; audio is `audio/<ep>/<key>.wav`.
- `EXAMPLES = [{"title", "file", "ran": bool, "about", "why_not_run"?}]` — files in `examples/`.
  The build runs every example with `ran: True` and puts its real stdout on the page. Never type output by hand.
- `SOURCES = [{"label", "text", "url" | None}]`
- optional `SPOKEN = [(written, spoken), ...]` — extra TTS replacements, applied before `common.SPOKEN_REPLACEMENTS`.
- optional `def nums() -> dict` — JSON-safe numbers the scenes show. Nothing on screen is typed by hand.

`web/scenes/epN.js` registers the scene builders:

```js
SCENES_BY_EP.epN = {
  chapter_id(sc, N) { /* sc = makeScene(...) result, N = nums() dict */ },
  ...
};
```

Inside a builder, the engine globals refer to the episode being shown: `tl`, `at(key, offset)`, `dur(key)`,
and the helpers `H, S, chip, arrow, rowLayout, centers, fadeIn, fadeOut, write, draw, drawArrow, pulse, cross,
axes, codeBox` (see `web/series.src.html`). Only one episode timeline exists at a time.

## Commands (run from `series/`)

```
../.venv/Scripts/python.exe ste_check.py epN        # STE rules: 0 problems required
../.venv/Scripts/python.exe make_voice.py epN       # SAPI WAVs (only changed lines)
../.venv/Scripts/python.exe build.py --release ep1 ep2 ep3 ep4 ep5 ep6 ep7 ep8 ep9 ep10 ep11 ep12  # reviewed episodes -> web/dist/series.html + local/ (offline copy)
../.venv/Scripts/python.exe build.py --eps epN      # one episode (test build)
../.venv/Scripts/python.exe tools/sheet.py epN      # contact sheet PNG for visual check
```

## Status

Published (private until shared): https://claude.ai/artifact/CkSbxPqooRw3GHvX2vQpsQ
Republish: Artifact publish `web/dist/series.html` with `files` = every `web/dist/epN.mp4`, `url` = the link above.

- [x] All 7 episodes built, reviewed (contact sheets for every narration line) and published 2026-11-21 (version 2).
      Total 207 narration lines, about 27 minutes; STE check 0 problems in every episode.
- [x] Offline copy: `series/local/index.html` + `ep1.mp4`…`ep7.mp4` + vendored `gsap.min.js` (works without internet;
      fonts fall back to system fonts). Rebuilt by every `build.py --release …`.
- [x] Episodes 8-11 built by four parallel forks, reviewed by the main session (contact sheets, STE check, numbers re-computed),
      released with `build.py --release ep1 … ep11` and published 2026-11-22 (version 3) to the link above.
      11 episodes, 327 narration lines, about 45 minutes; STE check 0 problems in every episode; the offline page loads all
      11 episodes with no scene errors (headless Edge check). Only changed files were sent (page, ep1, ep7, ep8-ep11 mp4).
      Rollback copy of version 2 (page, ep1, ep7): the session scratchpad `backup-v2/` (may be cleaned).
- [x] Episode 12 (Advanced RAG and evals) built by one fork, reviewed by the main session (contact sheets for every line, STE,
      `nums()` asserts), released with `build.py --release ep1 … ep12` and published 2026-11-22 (version 4). ep7 e8 (teaser: five
      deep dives, chips in two rows) and ep11 t7/t9 (hand-off to ep12, dashed "next" card) were reworded and re-recorded;
      the series wrap-up and the call to action moved to the end of ep12 (e8-e10). 12 episodes, 353 narration lines,
      about 49 minutes; STE 0 problems; the offline page loads all 12 episodes with no scene errors. Sent: page, ep7, ep11, ep12.
      Rollback copy of version 3 (page, ep7, ep11): the session scratchpad `backup-v3/` (may be cleaned).
- Episode lengths: ep8 4:14, ep9 4:02, ep10 4:10, ep11 4:13, ep12 4:30 (over the 4:00 target; ep12 is the longest).
- ep12 known flaws: voice not auditioned (BM25, RRF, MRR and the ordinals "eighth", "twenty fourth" are respelled for the
  voice); 21 questions on a 42-paragraph hand-written handbook, so one question is 4.8 points and the results hold for that
  corpus only; the dense search is LSA (a real SVD method, not an embedding model), the reranker counts shared words (not a
  cross-encoder), the judge is a toy built with a bias to show the swap test; hybrid does not beat plain BM25 on MRR here (the
  narration says so); the groundedness grader says "grounded: true" next to a wrong answer (the scene says so, the narration
  does not).
- ep8-ep11 known flaws: voice not auditioned (B/A/W respelled phonetically in ep8); ep9 R1 before/after and "tide answers"
  scenes are labelled illustrations; ep10 batch-throughput chart is a bandwidth upper limit, not a measurement; ep11 token
  counts use a 4-characters-per-token rule (stated on screen). Toy models are labelled as toys on screen.
- If the Anthropic price table changes, re-check `examples/ep10_cache_route.py` PRICE (read 2026-11-22: Opus 5.5 input $4,
  cache write $5, cache read $0.20 per million tokens).
- Engine notes: scene files load before the engine, but `C`, `LEVEL_COLOR`, `hexA` are defined in an early script;
  a top-level error in a scene file shows as a notice. Scenes rebuild once when the web fonts arrive late.
- Known small flaws (see fork reports): ep4 loss curve is noisy by design (mini-batches); ep3 random-forest vote dots
  are a drawing; ep7 cost example uses made-up token counts (labelled); several episodes run 1–7 s over 4:00.
