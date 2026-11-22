# ep9 research: alignment and reasoning (SFT -> reward model -> PPO -> GRPO, verifiable rewards)

Base: https://www.dailydoseofds.com (paths below). Status:

| id | path | status |
|----|------|--------|
| P-GRPO | /p/build-a-reasoning-llm-using-grpo/ | full text; code/configs are images (unread) |
| P-GEPA | /p/how-to-beat-grpo-without-touching-model-weights/ | full text; diagrams unread |
| P-R1 | /p/build-a-reasoning-model-like-deepseek-r1/ | full text; hyperparameters are images |
| P-SRFT | /p/supervised-reinforcement-fine-tuning-in-llms/ | full, short, conceptual |
| P-HANDS | /p/hands-on-build-your-reasoning-llm/ | full text; code images unread |
| P-CoT | /p/3-prompting-techniques-for-reasoning-in-llms/ | full; prompting only, not RL |
| RL9 | /rl-course-part-9/ (RLHF) | partial: paywall after the start of the reward-model section |
| RL10 | /rl-course-part-10/ (verifiable rewards, GRPO) | partial: paywall from "The GRPO objective" |
| RL8 | /rl-course-part-8/ (PPO) | partial: paywall from "Importance ratio" |

## Concepts (own-word digest)

1. Imitation ceiling (RL9): SFT on demonstrations cannot beat the demonstrators and treats every token error alike.
   Judging an answer is easier than writing one, so RLHF collects human comparisons. Relative judgments are more
   consistent between labelers than absolute scores.
2. SFT stage (RL9): ordinary language-model loss on curated (prompt, ideal response) pairs. The frozen SFT copy is the
   reference model that anchors the update.
3. Reward model (RL9, partial): a copy of the SFT model with the vocabulary head replaced by a small linear head that
   reads the last token's hidden state and outputs one scalar score r(x, y). Trained on pairwise comparisons
   (Bradley-Terry; named only in the RL10 recap).
4. PPO with a critic (RL8/RL9/RL10 recaps): four models in memory: policy and critic (trained), reward model and
   reference (frozen). The critic turns one end-of-answer score into per-token advantages. Failure mode: reward hacking
   (the policy exploits blind spots of the reward model). DPO skips the RL loop (body paywalled).
5. Trust region (RL8): data goes stale as the policy changes; big steps can collapse training; so limit how far the
   behaviour moves per update (PPO clip, a KL penalty against the reference).
6. RLVR (RL10): when a rule or program can check the answer (string match, symbolic check, compiler, unit tests), use
   that check as the reward. No learned reward model. Limit: it cannot judge politeness or faithfulness.
7. Reward design (RL10, P-HANDS, P-GRPO): total reward = accuracy term (verifier) + format term (e.g. the reasoning
   is inside the right tags). The format term helps early, when accuracy is nearly always 0.
8. Outcome vs process supervision (RL10): outcome rewards only the final answer (the default); process supervision
   scores intermediate steps.
9. Critic-free baseline (RL10): sample a group of G answers for each prompt; the group mean is the expected reward.
   A cheap verifier makes this affordable.
10. Group-relative advantage (RL10, formula was an image): advantage_i = (r_i - mean(r)) / (std(r) + eps).
    If every answer in a group gets the same reward, all advantages are 0: no signal. Mixed groups push up the
    better answers and push down the worse ones. (This formula is also in the DeepSeekMath paper: reproduce it
    yourself in code from the paper.)
11. GRPO pipeline (P-GRPO, P-R1, P-HANDS): data set + reasoning system prompt -> sample several answers -> score each
    with deterministic reward functions -> advantages -> policy update (with LoRA to save memory).
12. SFT vs RFT (P-SRFT, P-HANDS): SFT fits a static labelled set and can memorize; RFT (reinforcement fine-tuning) is
    online: sample, score, update.
13. CoT, self-consistency, Tree of Thoughts (P-CoT): prompting tricks for reasoning, no weight update.
14. GEPA (P-GEPA): improve a prompt by letting an LLM reflect on full traces, instead of updating weights. Claims
    large savings in rollouts; headline numbers are not backed in the body. Optional side note only.

Order the pages use: why imitation is not enough -> reward model -> RL loop (PPO) -> why PPO is heavy -> verifiable
rewards -> group-relative advantage (GRPO) -> reward functions in practice.

## Conflicts and gaps (do not copy numbers)

- Not readable: reward-model loss, PPO objective, DPO, GRPO objective + KL term. Take these from the primary papers.
- "GEPA beat GRPO by 10 points with 35x fewer rollouts" is a subtitle claim, not shown in the body: do not use.
- Group size: the RL10 page says typically 4-64; DeepSeekMath used 64. Check the paper before you state a number.
- P-R1's title overstates: it is GRPO on a small model, not a full recipe for DeepSeek-R1.

## Primary sources to cite

- Ouyang et al. 2022, InstructGPT (RLHF): https://arxiv.org/abs/2203.02155
- Schulman et al. 2017, PPO: https://arxiv.org/abs/1707.06347
- Shao et al. 2024, DeepSeekMath (GRPO): https://arxiv.org/abs/2402.03300
- DeepSeek-AI 2025, DeepSeek-R1 (verifiable rewards, GRPO at scale): https://arxiv.org/abs/2501.12948
- Rafailov et al. 2023, DPO: https://arxiv.org/abs/2305.18290
- Verify each id/title with a fetch before you cite it.

## Offline example ideas

- NumPy: a toy "policy" over 3-5 answer choices with a softmax; a hidden verifier gives reward 1 for the right answer.
  Sample groups of G, compute group-relative advantages, run policy-gradient steps, print how the probability of the
  right answer grows. Show the all-equal group case (advantage 0).
- NumPy: a Bradley-Terry reward model on toy 2-feature answers, trained on pairwise preferences; print accuracy.
- Show the effect of a KL penalty (policy drift from the reference) in the same toy.
- A real verifier: a few lines that check the final number in a string against a known answer (RLVR in 10 lines).
