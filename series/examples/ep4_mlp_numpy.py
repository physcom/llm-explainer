"""A neural network with one hidden layer, on the two-moons data, with NumPy only.

Forward pass, backward pass (backpropagation with the chain rule), mini-batch gradient descent.
"""
import numpy as np
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split

X, y = make_moons(n_samples=200, noise=0.2, random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=50, random_state=0)

rng = np.random.default_rng(1)
H = 8                                          # neurons in the hidden layer
W1 = rng.normal(0, np.sqrt(2 / 2), (2, H))     # He initialisation, a good start for ReLU
b1 = np.zeros(H)
W2 = rng.normal(0, np.sqrt(2 / H), (H, 1))
b2 = np.zeros(1)


def forward(X):
    z1 = X @ W1 + b1                           # weighted sums of the hidden layer
    a1 = np.maximum(z1, 0)                     # ReLU activation
    z2 = a1 @ W2 + b2                          # weighted sum of the output neuron
    p = 1 / (1 + np.exp(-z2[:, 0]))            # sigmoid: probability of class 1
    return z1, a1, p


def log_loss(p, y):
    p = np.clip(p, 1e-7, 1 - 1e-7)
    return -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))


lr, batch, epochs = 0.5, 16, 300
for epoch in range(1, epochs + 1):
    order = rng.permutation(len(X_tr))         # new mini-batches in each epoch
    for start in range(0, len(X_tr), batch):
        idx = order[start:start + batch]
        xb, yb = X_tr[idx], y_tr[idx]
        z1, a1, p = forward(xb)
        # backward pass: from the loss back to every weight (chain rule)
        dz2 = (p - yb)[:, None] / len(xb)      # d(loss)/d(z2) for sigmoid + log loss
        dW2 = a1.T @ dz2
        db2 = dz2.sum(axis=0)
        da1 = dz2 @ W2.T                       # send the gradient back through W2
        dz1 = da1 * (z1 > 0)                   # ReLU lets the gradient pass only where z1 > 0
        dW1 = xb.T @ dz1
        db1 = dz1.sum(axis=0)
        W1 -= lr * dW1
        b1 -= lr * db1
        W2 -= lr * dW2
        b2 -= lr * db2
    if epoch in (1, 5, 20, 60, 300):
        _, _, p_tr = forward(X_tr)
        acc = np.mean((p_tr > 0.5) == y_tr)
        print(f"epoch {epoch:3d}  loss {log_loss(p_tr, y_tr):.3f}  train accuracy {acc:.0%}")

_, _, p_te = forward(X_te)
print(f"test accuracy {np.mean((p_te > 0.5) == y_te):.0%}  ({len(X_te)} points the network never saw)")
