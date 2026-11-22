"""GRPO on a toy: one prompt, six possible answers. This is a TOY, not a language model.

The policy is a softmax over six candidate answers to "What is 17 * 6?". A verifier gives reward 1 to the
right answer (102) and 0 to the others. At each step:
  1. sample a group of G answers from the policy,
  2. reward each answer with the verifier,
  3. advantage = (reward - group mean) / (group std + eps),            (no critic: the group is the baseline)
  4. policy-gradient step:  logits += lr * mean_i( advantage_i * (onehot(answer_i) - policy) ).
std is the population standard deviation of the group. If all rewards in a group are equal, std = 0,
all advantages are 0, and the step changes nothing.
"""
import numpy as np

ANSWERS = ["96", "100", "102", "107", "108", "112"]
CORRECT = ANSWERS.index("102")
G, STEPS, LR, EPS = 8, 60, 0.6, 1e-4
P_START = 0.10                              # the chance of the right answer at the start


def verifier(i: int) -> float:
    return 1.0 if i == CORRECT else 0.0


def softmax(z):
    e = np.exp(z - z.max())
    return e / e.sum()


def group_advantages(rewards, eps: float = EPS):
    r = np.asarray(rewards, dtype=float)
    return (r - r.mean()) / (r.std() + eps)


def run(seed: int = 3):
    rng = np.random.default_rng(seed)
    p0 = np.full(len(ANSWERS), (1 - P_START) / (len(ANSWERS) - 1))
    p0[CORRECT] = P_START
    z = np.log(p0)
    steps = []
    for step in range(STEPS):
        p = softmax(z)
        picks = rng.choice(len(ANSWERS), size=G, p=p)
        rewards = np.array([verifier(i) for i in picks])
        adv = group_advantages(rewards)
        grad = np.zeros_like(z)
        for i, a in zip(picks, adv):
            onehot = np.zeros_like(z)
            onehot[i] = 1.0
            grad += a * (onehot - p)
        z = z + LR * grad / G
        steps.append({"step": step, "p_correct": float(p[CORRECT]), "p_after": float(softmax(z)[CORRECT]),
                      "picks": [int(i) for i in picks], "rewards": rewards.tolist(), "adv": adv.tolist(),
                      "mean": float(rewards.mean()), "std": float(rewards.std()),
                      "zero_signal": bool(rewards.std() == 0)})
    return {"steps": steps, "p_final": float(softmax(z)[CORRECT])}


if __name__ == "__main__":
    out = run()
    steps = out["steps"]
    print(f"toy policy over {len(ANSWERS)} answers, group size G = {G}, {STEPS} steps; the right answer is {ANSWERS[CORRECT]}")
    print(f"{'step':>4} {'right answers in group':>23} {'advantage of a right answer':>28} {'P(right)':>9}")
    for s in steps[:6] + steps[-2:]:
        k = int(sum(s["rewards"]))
        adv = max(s["adv"]) if k and k < G else 0.0
        print(f"{s['step']:>4} {k:>16} of {G:<4} {adv:>28.2f} {s['p_correct']:>9.3f}")
    print()
    all_wrong = sum(s["zero_signal"] and s["mean"] == 0 for s in steps)
    all_right = sum(s["zero_signal"] and s["mean"] == 1 for s in steps)
    print(f"P(right answer): {steps[0]['p_correct']:.3f} at the start, {out['p_final']:.3f} after {STEPS} steps")
    print(f"steps with no signal (every reward in the group equal, all advantages 0): "
          f"{all_wrong} all wrong, {all_right} all right, of {STEPS}")
    demo = group_advantages([0] * G)
    print(f"all {G} answers wrong: advantages = {demo.tolist()}")
