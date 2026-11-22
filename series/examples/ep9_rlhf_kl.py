"""The KL penalty and the PPO clip, on a toy with five possible answers.

A TOY: one prompt, five candidate answers. The reward model (RM) scores each answer. One answer is a
"blind spot": flattering and padded. The RM likes it, but people do not (its true quality is low).
The reference model is the policy before RL. RLHF maximises

    J(policy) = expected RM score  -  beta * KL(policy || reference)

For this objective the best policy has a closed form:  policy(a) ~ reference(a) * exp(score(a) / beta).
The script checks the closed form against 20,000 random policies, then prints what different beta values give.
"""
import numpy as np

# name, true quality (what people want, hidden), reward model score, reference probability
CANDIDATES = [
    ("short and right", 0.95, 1.0, 0.40),
    ("right, but long", 0.80, 1.3, 0.30),
    ("vague", 0.35, 0.4, 0.18),
    ("wrong, sounds sure", 0.10, 0.8, 0.09),
    ("flattering and padded", 0.15, 2.6, 0.03),     # the blind spot of the reward model
]
NAMES = [c[0] for c in CANDIDATES]
TRUE = np.array([c[1] for c in CANDIDATES])
RM = np.array([c[2] for c in CANDIDATES])
REF = np.array([c[3] for c in CANDIDATES])
BETAS = [2.0, 0.5, 0.2]                # strong, medium, weak penalty
PPO_EPS = 0.2                          # the clip range of the PPO paper


def kl(p, q):
    return float(np.sum(p * np.log(p / q)))


def objective(p, beta):
    return float(np.sum(p * RM) - beta * kl(p, REF))


def best_policy(beta: float):
    w = REF * np.exp(RM / beta)
    return w / w.sum()


def summary(p) -> dict:
    return {"p": p.tolist(), "rm": float(p @ RM), "true": float(p @ TRUE), "kl": kl(p, REF)}


def ppo_clip(ratio, adv, eps: float = PPO_EPS):
    """The PPO clipped objective for one answer: ratio = new probability / old probability."""
    ratio = np.asarray(ratio, dtype=float)
    return np.minimum(ratio * adv, np.clip(ratio, 1 - eps, 1 + eps) * adv)


if __name__ == "__main__":
    rng = np.random.default_rng(0)
    print("check: the closed-form policy beats 20,000 random policies (J = score - beta * KL)")
    for beta in BETAS:
        best = objective(best_policy(beta), beta)
        rand = max(objective(p, beta) for p in rng.dirichlet(np.ones(len(REF)), 20000))
        print(f"  beta {beta:<4}  J(best) = {best:.4f}   best random J = {rand:.4f}   {'ok' if best >= rand else 'FAIL'}")
        assert best >= rand
    print()
    print(f"{'':<24}" + "".join(f"{n[:14]:>16}" for n in NAMES) + f"{'RM score':>10}{'true':>7}{'KL':>7}")
    rows = [("reference (start)", REF)] + [(f"beta = {b} ", best_policy(b)) for b in BETAS]
    for label, p in rows:
        s = summary(p)
        print(f"{label:<24}" + "".join(f"{x:>16.2f}" for x in p) + f"{s['rm']:>10.2f}{s['true']:>7.2f}{s['kl']:>7.2f}")
    print()
    print(f"PPO clip (eps = {PPO_EPS}): objective for ratio = new probability / old probability")
    print(f"{'ratio':>6} {'adv +1':>8} {'adv -1':>8}")
    for ratio in (0.6, 0.8, 1.0, 1.2, 1.4):
        print(f"{ratio:>6.1f} {float(ppo_clip(ratio, 1.0)):>8.2f} {float(ppo_clip(ratio, -1.0)):>8.2f}")
