"""Train and validation error for polynomial degrees 1 to 15, using only NumPy."""
import warnings

import numpy as np
from numpy.polynomial import Polynomial

# 30 points from a smooth curve plus noise (the same data as on screen).
rng = np.random.default_rng(34)
x = rng.uniform(0, 1, 30)
y = np.sin(2 * np.pi * x) + rng.normal(0, 0.25, 30)

# Split one time: 18 points to train, 6 to validate, 6 for the final test.
idx = rng.permutation(30)
train, val, test = idx[:18], idx[18:24], idx[24:]


def mse(p, i):
    return np.mean((p(x[i]) - y[i]) ** 2)


warnings.simplefilter("ignore")              # degree 15 on 18 points is badly conditioned
print("degree  train MSE  validation MSE")
best = None
for d in range(1, 16):
    p = Polynomial.fit(x[train], y[train], d)    # least squares on the training set only
    tr, va = mse(p, train), mse(p, val)
    print(f"{d:6d}  {tr:9.4f}  {va:14.4f}")
    if best is None or va < best[1]:
        best = (d, va)

print(f"best degree on the validation set: {best[0]}")
