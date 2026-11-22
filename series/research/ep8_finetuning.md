# ep8 research: fine-tuning (LoRA, QLoRA, SFT, fine-tune vs RAG)

Base: https://www.dailydoseofds.com (paths below). Status of each page:

| id | path | status |
|----|------|--------|
| P1 | /p/5-llm-fine-tuning-techniques/ | full |
| P2 | /implementing-lora-from-scratch-for-fine-tuning-llms/ | partial, paywall from "How LoRA works?" |
| P3 | /understanding-lora-derived-techniques-for-optimal-llm-fine-tuning/ | partial, paywall after LoRA section |
| P4 | /p/lora-qlora-explained-from-a-business-lens/ | full |
| P5 | /augmenting-llms-fine-tuning-or-rag/ | partial, paywall after RAG pipeline intro |
| P6 | /llmops-crash-course-part-12/ | partial, paywall from "Alignment fine-tuning: RLHF, DPO, GRPO" |
| P7 | /implementing-dora-an-improved-lora-from-scratch/ | teaser: DoRA method NOT readable |

## Concepts the pages teach (own-word digest)

- Fine-tuning = adjust a pre-trained model's weights on new data (P2, P3, P5, P6).
- Why full fine-tuning is hard at LLM scale: the models are huge, and each customer's fine-tuned copy must be stored
  and served (P2, P4). Storage story (P4): one full copy of a 175B model in fp16 is about 350 GB; 10 users = 3,500 GB,
  1,000 users = 350,000 GB. (This is arithmetic from 175B x 2 bytes; reproduce it in code.)
- LoRA core idea (P2-P6): freeze the pre-trained matrix W. Train two small matrices A and B whose product is the
  update. W' = W + (alpha/r) * B A. Few trainable parameters, quality near full fine-tuning.
- Parameter-count example (P6): a 4096 x 4096 matrix has 16,777,216 parameters. With r = 8, A and B together hold
  65,536 parameters, about 0.4 % of the matrix. (Reproduce in code.)
- Initialization (P6): A random (Gaussian), B zeros, so the update starts at exactly zero. Scale alpha / r.
- Where applied (P6): mostly the attention projections (query, value). Works with small data sets (a few thousand
  examples).
- Inference (P3, P6): merge the update into W for zero extra latency, or keep adapters apart and swap per task.
- Quantization (P6): 32-bit to 16-bit halves memory; 16-bit to 4-bit is about 4x more.
- QLoRA (P6, P4 by name): keep the frozen base model in 4-bit, de-quantize to 16-bit on the fly for the compute,
  train only 16-bit LoRA adapters. One strong GPU does what once needed a cluster. NF4 = a 4-bit format whose levels
  are spaced for normally distributed weights.
- Variants named in one line in P1: LoRA-FA (freeze A, train B), VeRA (shared frozen random A and B, train small
  scaling vectors), Delta-LoRA, LoRA+ (higher learning rate for B). Details are paywalled. DoRA: no readable text.
- SFT (P6): supervised fine-tuning on (instruction, response) pairs of high quality, to turn a base model into a helpful one.
- Fine-tune vs RAG (P5, P6): not a strict either-or; they can be combined. RAG: put retrieved text in the prompt; no
  training pipeline. Fine-tuning: needs data, a training pipeline, and serving. P6: try prompting and RAG first;
  fine-tuning is a later step. Risks of fine-tuning (P6): forgetting of old skills (over-specialization), stale
  knowledge, data cost, compute cost.

Explanation order the pages use: problem (size/cost) -> idea (low-rank update) -> shapes and counts -> init/scale ->
inference merge -> quantization -> QLoRA -> when to use.

## Conflicts and gaps (do not copy these numbers)

- Typical rank: P4 says single digit, P6 says 8 or 16. Say "small, such as 8 or 16" and show the count for r = 8 / 16.
- Adapter size: P3 says 35 MB (10,000x smaller), P4 says 20-25 MB. Compute your own from a stated config, or skip.
- Matrix notation differs between pages. Pick one and state it: W is d_out x d_in; B is d_out x r; A is r x d_in.
- "25 % training speedup" and "10,000x checkpoint cut" are attributed to the LoRA paper: verify against the paper
  (arXiv 2106.09685) before you use them. Prefer to compute.
- Not readable: DoRA method, implementation code, the fine-tune-vs-RAG decision criteria after the paywall.

## Primary sources to cite

- Hu et al. 2021, LoRA: https://arxiv.org/abs/2106.09685
- Dettmers et al. 2023, QLoRA: https://arxiv.org/abs/2305.14314
- (SFT/instruction tuning) Ouyang et al. 2022, InstructGPT: https://arxiv.org/abs/2203.02155
- Anthropic or Hugging Face PEFT docs for the library API, if an example uses it (check it runs offline first).

## Offline example ideas (the build has no GPU, network or API key)

- NumPy: "pre-train" a small model on task A; adapt to task B with (a) full fine-tuning, (b) a rank-r LoRA update on
  the same weight matrix. Print trainable parameter counts and the loss on B and on A (forgetting).
- NumPy: take a weight change dW that is truly low rank (plus noise). SVD it. Show that rank r captures most of it.
- Pure arithmetic: parameters and memory of full fine-tuning vs LoRA vs QLoRA for a stated 7B config (weights, grads,
  optimizer state). State the assumptions on screen.
- Quantize a weight matrix to 4-bit levels (uniform vs NF4-style levels) and print the error.
