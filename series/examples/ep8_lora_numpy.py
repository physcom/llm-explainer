"""LoRA against full fine-tuning on a toy model: one weight matrix, NumPy only.

The "model" is one linear layer, y = W x. It is a toy: a real LLM has many such matrices.
Task A is what the pre-trained model already does: W_A. Task B is a new behaviour: W_B = W_A + a change
that is close to low rank. We have only a few noisy examples of task B (fewer than the 32 input features).
Full fine-tuning trains all 1,024 weights. LoRA freezes W_A and trains B and A: update = (alpha / r) * B @ A.
Shapes: W is d_out x d_in, B is d_out x r, A is r x d_in.
"""
import numpy as np

D_OUT, D_IN = 32, 32
N_TRAIN = 24          # examples of task B (fewer than d_in on purpose)
NOISE = 0.3           # noise in the task B examples
STEPS, LR = 150, 0.01  # Adam, full batch
RANK, ALPHA = 4, 8     # LoRA rank and scale: the update is multiplied by alpha / rank
RANKS = [1, 2, 4, 8, 16]


def make_task(seed=8):
    rng = np.random.default_rng(seed)
    W_A = rng.normal(0, 1 / np.sqrt(D_IN), (D_OUT, D_IN))
    # the change that task B needs: three directions, with decreasing strength, plus a little noise (close to low rank)
    U = np.linalg.qr(rng.normal(size=(D_OUT, 3)))[0]
    V = np.linalg.qr(rng.normal(size=(D_IN, 3)))[0]
    delta = U @ np.diag([2.5, 1.5, 0.8]) @ V.T + 0.02 * rng.normal(size=(D_OUT, D_IN))
    W_B = W_A + delta
    X_tr = rng.normal(size=(N_TRAIN, D_IN))
    Y_tr = X_tr @ W_B.T + NOISE * rng.normal(size=(N_TRAIN, D_OUT))
    X_te = rng.normal(size=(2000, D_IN))                  # new inputs, same distribution: task A and task B tests
    return dict(W_A=W_A, W_B=W_B, delta=delta, X_tr=X_tr, Y_tr=Y_tr, X_te=X_te)


def mse(W, X, Y):
    return float(np.mean((X @ W.T - Y) ** 2))


class Adam:
    def __init__(self, params, lr):
        self.p, self.lr = params, lr
        self.m = [np.zeros_like(p) for p in params]
        self.v = [np.zeros_like(p) for p in params]
        self.t = 0

    def step(self, grads):
        self.t += 1
        for i, (p, g) in enumerate(zip(self.p, grads)):
            self.m[i] = 0.9 * self.m[i] + 0.1 * g
            self.v[i] = 0.999 * self.v[i] + 0.001 * g * g
            mh = self.m[i] / (1 - 0.9 ** self.t)
            vh = self.v[i] / (1 - 0.999 ** self.t)
            p -= self.lr * mh / (np.sqrt(vh) + 1e-8)


def grad_W(W, X, Y):
    """Gradient of the mean squared error with respect to the full weight matrix."""
    return 2.0 * (X @ W.T - Y).T @ X / (X.shape[0] * D_OUT)


def evaluate(W, T):
    return {
        "train_B": mse(W, T["X_tr"], T["Y_tr"]),
        "test_B": mse(W, T["X_te"], T["X_te"] @ T["W_B"].T),    # on new inputs, against the true task B
        "test_A": mse(W, T["X_te"], T["X_te"] @ T["W_A"].T),    # does it still do task A?
    }


def full_finetune(T, steps=STEPS, lr=LR):
    W = T["W_A"].copy()
    opt = Adam([W], lr)
    curve = [mse(W, T["X_te"], T["X_te"] @ T["W_B"].T)]
    for _ in range(steps):
        opt.step([grad_W(W, T["X_tr"], T["Y_tr"])])
        curve.append(mse(W, T["X_te"], T["X_te"] @ T["W_B"].T))
    return W, curve, W.size


def init_A(r, seed=0):
    """A starts random (small normal numbers); B starts at zero, so B @ A = 0 before training."""
    return np.random.default_rng(seed).normal(0, 1 / np.sqrt(D_IN), (r, D_IN))


def lora_finetune(T, r=RANK, alpha=ALPHA, steps=STEPS, lr=LR, seed=0):
    B = np.zeros((D_OUT, r))                                   # B starts at zero: the update starts at zero
    A = init_A(r, seed)                                        # A starts random
    s = alpha / r
    W0 = T["W_A"]
    opt = Adam([B, A], lr)
    curve = [mse(W0 + s * B @ A, T["X_te"], T["X_te"] @ T["W_B"].T)]
    for _ in range(steps):
        G = grad_W(W0 + s * B @ A, T["X_tr"], T["Y_tr"])       # gradient with respect to the merged W
        opt.step([s * G @ A.T, s * B.T @ G])                   # chain rule: only B and A are trained
        curve.append(mse(W0 + s * B @ A, T["X_te"], T["X_te"] @ T["W_B"].T))
    return W0 + s * B @ A, curve, B.size + A.size, B, A


def run():
    T = make_task()
    out = {"T": T}
    out["before"] = evaluate(T["W_A"], T)
    out["ideal"] = evaluate(T["W_B"], T)                      # the true task B matrix, for reference
    W_f, curve_f, n_f = full_finetune(T)
    out["full"] = {**evaluate(W_f, T), "params": n_f, "curve": curve_f}
    W_l, curve_l, n_l, B, A = lora_finetune(T)
    out["lora"] = {**evaluate(W_l, T), "params": n_l, "curve": curve_l, "B": B, "A": A}
    # how much of the true change is in the top-r directions (singular value energy)
    sv = np.linalg.svd(T["delta"], compute_uv=False)
    out["energy"] = {r: float((sv[:r] ** 2).sum() / (sv ** 2).sum()) for r in RANKS}
    out["sweep"] = []
    for r in RANKS:
        W_r, _, n_r, _, _ = lora_finetune(T, r=r)
        out["sweep"].append({"r": r, "params": n_r, **evaluate(W_r, T)})
    return out


if __name__ == "__main__":
    o = run()
    print(f"toy model: one {D_OUT} x {D_IN} weight matrix, {N_TRAIN} noisy task B examples, {STEPS} Adam steps, lr {LR}")
    print(f"{'':26s}{'trainable':>10s}{'train B':>10s}{'test B':>10s}{'test A':>10s}")
    for name, key in [("before (W_A)", "before"), ("full fine-tuning", "full"), (f"LoRA r={RANK}, alpha={ALPHA}", "lora"),
                      ("ideal (true W_B)", "ideal")]:
        d = o[key]
        n = d.get("params", 0)
        print(f"{name:26s}{(n if n else '-'):>10}{d['train_B']:10.4f}{d['test_B']:10.4f}{d['test_A']:10.4f}")
    print()
    print("share of the true change inside the top-r directions: " +
          ", ".join(f"r={r}: {e:.1%}" for r, e in o["energy"].items()))
    print(f"{'rank r':>8s}{'trainable':>10s}{'test B':>10s}{'test A':>10s}")
    for row in o["sweep"]:
        print(f"{row['r']:8d}{row['params']:10d}{row['test_B']:10.4f}{row['test_A']:10.4f}")
    B0 = np.zeros((D_OUT, RANK))
    print(f"at step 0, B is all zeros, so the update is zero: max |B @ A| = {np.abs(B0 @ o['lora']['A']).max():.1f}")
