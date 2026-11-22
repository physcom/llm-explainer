# ep10 research: inference and serving (KV cache, paged attention, batching, speculative decoding, quantization, caching, routing)

Base: https://www.dailydoseofds.com (paths below). Status:

| id | path | status |
|----|------|--------|
| KV | /p/kv-caching-in-llms-explained-visually/ | full |
| PA | /p/paged-attention-in-llms/ | full |
| SD | /p/speculative-decoding-in-llms/ | full |
| Q | /p/5-llm-quantization-techniques/ | full |
| CB | /guides/continuous-batching-in-llms/ | full |
| PC | /p/prompt-caching-in-llms/ | full |
| CMP | /p/kv-vs-prefix-vs-prompt-vs-semantic-caching/ | full |
| MR | /p/how-to-reduce-llm-costs-by-50-60-using-model-routing/ | full |
| GPU | /p/how-a-gpu-actually-works/ | full |
| L13 | /llmops-crash-course-part-13/ | partial, paywall after prefill/decode |
| L14 | /llmops-crash-course-part-14/ | partial, paywall before vLLM content |

## Concepts (own-word digest)

- Two phases of one request. Prefill: process the whole prompt at once; compute-bound. Decode: produce one token per
  step; memory-bound, because each step must read all the weights and the cache (SD, CMP, GPU, L13).
- KV cache: at every layer, store the keys and values of all earlier tokens. Queries are not stored (each is used
  once). Each decode step appends one key/value pair per layer. Past K/V never change, so reuse is valid (KV, CMP).
- Why memory fragments (PA): engines reserved one contiguous block per request, sized for the maximum length. Unused
  space is lost; a shared system prompt is stored once per request. Paged attention: fixed-size blocks (often 16
  tokens), a block table per request, like OS virtual memory; requests with a shared prefix point to the same blocks.
- Continuous batching (CB): a static batch runs at the pace of its longest request. Continuous batching decides the
  batch members at every forward pass; a scheduler uses a per-step token budget and a cap on sequences; if KV blocks
  run out, a request is preempted and its prefill is recomputed.
- Speculative decoding (SD): a small draft model proposes several tokens; the large model checks them in one forward
  pass; keep the accepted prefix; at the first rejection use the large model's token. The output distribution equals
  the large model's. Typical acceptance is high for easy text.
- Quantization (Q): round weights to a low-bit grid with scale factors. Methods compared: RTN, GPTQ, AWQ, LLM.int8(),
  QAT. A few outlier features (large values) make naive rounding hurt; AWQ protects the important channels.
- Caching layers (CMP, PC): KV cache = per request. Prefix caching = keep blocks after the request ends and reuse
  them when a later request starts with the same tokens (reuse stops at the first difference). Prompt caching = the
  API provider's billed version (exact prefix match, minimum length, read price lower than normal input price).
  Semantic caching = return a stored answer when a new question is similar enough; can return wrong answers.
  Advice: stable content first, changing content last.
- Routing (MR): a layer classifies each prompt and sends it to a cheaper or stronger model.
- GPU basics (GPU): arithmetic is cheap, moving data is expensive; memory hierarchy (registers, shared memory/L1, L2,
  HBM); threads run in groups of 32 (warps). Decode at batch size 1 is limited by memory bandwidth, so a bigger
  batch gives more tokens per second for free, up to the compute limit.

Explanation order the pages use: problem -> mechanism -> worked example -> production caveats.

## Conflicts and gaps (do not copy these numbers)

- KV size per token: KV says about 2.5 MB/token for a 70B-class model; CMP implies about 0.31 MB/token (about 40 GB at
  128K tokens). Both are right for different configs: 2 x layers x kv_heads x head_dim x bytes. With 80 layers,
  128 head dim, fp16: 64 kv-heads gives 2.6 MB/token (full multi-head); 8 kv-heads gives 0.33 MB/token
  (grouped-query attention). Compute this in code from a stated config. That is the example to show.
- Speedups, throughput and price numbers on those pages are the authors' claims from specific setups. Do not quote
  them. Compute from stated configs, or cite the primary papers.
- Prompt-caching prices change. If you quote a price multiplier, take it from the provider's current pricing page
  and state the date.
- Not readable: the vLLM serving content in L13/L14.

## Primary sources to cite

- Kwon et al. 2023, PagedAttention / vLLM: https://arxiv.org/abs/2309.06180
- Leviathan et al. 2022, speculative decoding: https://arxiv.org/abs/2211.17192
- Chen et al. 2023, speculative sampling: https://arxiv.org/abs/2302.01318
- Yu et al. 2022, Orca (continuous batching): https://www.usenix.org/conference/osdi22/presentation/yu
- Dettmers et al. 2022, LLM.int8(): https://arxiv.org/abs/2208.07339
- Frantar et al. 2022, GPTQ: https://arxiv.org/abs/2210.17323 ; Lin et al. 2023, AWQ: https://arxiv.org/abs/2306.00978
- Shazeer 2019 (multi-query attention) https://arxiv.org/abs/1911.02150 ; Ainslie et al. 2023 (GQA) https://arxiv.org/abs/2305.13245
- Anthropic docs, prompt caching: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- Verify each id/title with a fetch before you cite it.

## Offline example ideas

- NumPy: a tiny single-head attention decoder loop; decode N tokens with and without a KV cache; count multiply-adds
  and the measured wall time. Check that the outputs are identical.
- Pure arithmetic: KV-cache bytes per token and per request for a stated config; show multi-head vs grouped-query.
- Python: a block-table allocator (fixed 16-token blocks) vs contiguous max-length allocation; print the wasted memory
  for a made-up (but labelled) list of request lengths.
- Python: static vs continuous batching scheduler simulation with a list of request lengths; print steps and GPU
  "slots" idle.
- NumPy: speculative decoding with two toy next-token distributions (draft and target); implement the accept/reject
  rule; check the sampled distribution matches the target; print the acceptance rate.
- NumPy: int8 / 4-bit quantization of a random weight matrix with and without an outlier; print the error and the
  memory.
