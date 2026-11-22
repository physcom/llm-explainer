"""A reward model trained on pairs of answers. This is a TOY.

People saw two answers to one prompt and picked the better one. Here, an answer is only three numbers
(its features, each from 0 to 1), and the "people" are a hidden rule with some noise. A real reward model
is a language model with a new output layer that reads the prompt and the answer. The training idea is the same.

Model:  reward r(x) = w . x                      (one number for each answer)
Chance that answer A beats answer B:  sigmoid(r(A) - r(B))        (the Bradley-Terry model)
Loss for one pair:  -log sigmoid(r(chosen) - r(rejected))
"""
import numpy as np

FEATURES = ["facts right", "clear", "polite"]
PEOPLE_W = np.array([4.0, 2.0, 1.0])      # what the people really prefer (hidden from the model)
N_TRAIN, N_TEST, EPOCHS, LR = 400, 400, 120, 0.5


def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))


def make_pairs(n: int, rng: np.random.Generator):
    """n pairs of random answers. A person picks A with chance sigmoid(people_reward(A) - people_reward(B))."""
    a, b = rng.random((n, 3)), rng.random((n, 3))
    a_wins = rng.random(n) < sigmoid((a - b) @ PEOPLE_W)
    chosen = np.where(a_wins[:, None], a, b)
    rejected = np.where(a_wins[:, None], b, a)
    return chosen, rejected


def pair_loss(w, chosen, rejected):
    d = (chosen - rejected) @ w
    return float(np.mean(np.log1p(np.exp(-d))))


def accuracy(w, chosen, rejected):
    """Share of pairs where the chosen answer gets the higher reward. A tie counts as half."""
    d = (chosen - rejected) @ w
    return float(np.mean((d > 0) + 0.5 * (d == 0)))


def ceiling(n: int = 200_000, seed: int = 99) -> float:
    """Accuracy of the hidden people rule on a very large set of new pairs. The people are noisy,
    so no reward model can reach 100 %: this is the practical limit."""
    chosen, rejected = make_pairs(n, np.random.default_rng(seed))
    return accuracy(PEOPLE_W, chosen, rejected)


def train(seed: int = 7):
    rng = np.random.default_rng(seed)
    tr_c, tr_r = make_pairs(N_TRAIN, rng)
    te_c, te_r = make_pairs(N_TEST, rng)
    w = np.zeros(3)                                       # start: every answer gets reward 0
    hist = []
    for epoch in range(EPOCHS + 1):                      # epoch 0 = before the first update
        hist.append({"epoch": epoch, "loss": pair_loss(w, tr_c, tr_r),
                     "train_acc": accuracy(w, tr_c, tr_r), "test_acc": accuracy(w, te_c, te_r), "w": w.tolist()})
        if epoch == EPOCHS:                               # the last row is the model that we keep
            break
        diff = tr_c - tr_r
        grad = -np.mean((1.0 - sigmoid(diff @ w))[:, None] * diff, axis=0)   # gradient of the mean loss
        w = w - LR * grad
    return {"w": w, "hist": hist, "train": (tr_c, tr_r), "test": (te_c, te_r)}


if __name__ == "__main__":
    out = train()
    h = out["hist"]
    te_c, te_r = out["test"]
    print(f"pairs: {N_TRAIN} to train, {N_TEST} new pairs to test      (TOY: an answer = {len(FEATURES)} features)")
    print(f"{'epoch':>5} {'loss':>7} {'agree on new pairs':>19}")
    for e in (0, 10, 30, 60, EPOCHS):
        print(f"{e:>5} {h[e]['loss']:>7.3f} {h[e]['test_acc']:>19.1%}")
    print()
    print(f"{'feature':<12} {'learned w':>10} {'people w':>9}")
    for name, lw, pw in zip(FEATURES, out["w"], PEOPLE_W):
        print(f"{name:<12} {lw:>10.2f} {pw:>9.2f}")
    print()
    print(f"limit: the hidden people rule agrees with the people on {ceiling():.1%} of 200,000 new pairs; "
          "the people are noisy, so no reward model reaches 100 %")
