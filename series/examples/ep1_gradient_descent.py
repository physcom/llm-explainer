"""Fit price = w * area + b with gradient descent, using only NumPy."""
import numpy as np

# 24 synthetic houses: area in m², price in thousands of dollars.
rng = np.random.default_rng(7)
area = rng.uniform(40, 160, size=24)
price = 2.5 * area + 30 + rng.normal(0, 20, size=24)

# Feature scaling: work in units of 100 m², so one learning rate suits w and b.
x = area / 100

w, b = 0.0, 0.0          # start values
lr = 0.2                 # learning rate
for epoch in range(200):
    pred = w * x + b
    err = pred - price
    loss = np.mean(err ** 2)            # mean squared error
    grad_w = 2 * np.mean(err * x)       # d(loss)/dw
    grad_b = 2 * np.mean(err)           # d(loss)/db
    w -= lr * grad_w                    # step against the gradient
    b -= lr * grad_b
    if epoch in (0, 1, 2, 5, 20, 199):
        print(f"epoch {epoch:3d}  loss {loss:9.1f}  w {w:6.1f}  b {b:6.1f}")

print(f"price = {w / 100:.2f} * area + {b:.1f}   (thousand $)")
