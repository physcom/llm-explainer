"""Detect data drift, measure the damage when the labels arrive, then train version 2 and compare before a deploy."""
import warnings

import numpy as np
from scipy.stats import ks_2samp
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore")


def make_orders(n, rng, dist_scale=1.2):
    """Synthetic food deliveries: distance (km), kitchen queue (orders) -> late (1) or on time (0)."""
    dist = rng.gamma(3.0, dist_scale, n)
    queue = rng.poisson(6.0, n).astype(float)
    travel = np.where(dist <= 6, 4.0 * dist, 6.0 + 1.2 * dist)   # bike up to 6 km, then a car
    minutes = 8 + 1.2 * queue + travel + rng.normal(0, 4, n)
    return np.c_[dist, queue], (minutes > 35).astype(int)


def psi(base, new, bins=10):
    """Population stability index over 10 bins cut at the quantiles of the base (training) data."""
    edges = np.quantile(base, np.linspace(0, 1, bins + 1))
    edges[0], edges[-1] = -np.inf, np.inf
    pb = np.clip(np.histogram(base, edges)[0] / len(base), 1e-4, None)
    pn = np.clip(np.histogram(new, edges)[0] / len(new), 1e-4, None)
    return float(np.sum((pn - pb) * np.log(pn / pb)))


def net(hidden=(16,), seed=0):
    return make_pipeline(StandardScaler(), MLPClassifier(hidden_layer_sizes=hidden, max_iter=2000, random_state=seed))


rng = np.random.default_rng(5)
X, y = make_orders(2000, rng)              # training data
X_test, y_test = make_orders(1000, rng)    # test data from the same time
X_prod, y_prod = make_orders(1000, rng, 2.2)   # production: the service now delivers to the suburbs
X_new, y_new = make_orders(2000, rng, 2.2)     # recent orders with labels, for version 2

v1 = net().fit(X, y)

# 1. Watch the inputs. No labels are needed for this step.
print("feature      train mean  prod mean    PSI   KS stat  KS p-value")
for i, name in enumerate(["distance_km", "queue"]):
    ks = ks_2samp(X[:, i], X_prod[:, i])
    flag = "large change" if psi(X[:, i], X_prod[:, i]) > 0.25 else "no large change"
    print(f"{name:<12} {X[:, i].mean():>10.2f} {X_prod[:, i].mean():>10.2f} {psi(X[:, i], X_prod[:, i]):>6.2f}"
          f" {ks.statistic:>8.3f} {ks.pvalue:>11.2g}   {flag}")

# 2. Later, the true answers arrive.
print(f"v1 accuracy: test data {v1.score(X_test, y_test):.3f}, production data {v1.score(X_prod, y_prod):.3f}")

# 3. Train candidates on old + recent rows; choose on a validation slice of recent rows (not on the final test rows).
X_all, y_all = np.r_[X, X_new[:1500]], np.r_[y, y_new[:1500]]
for hidden in [(4,), (16,), (32, 16)]:
    print(f"experiment hidden={hidden!s:<9} validation accuracy {net(hidden).fit(X_all, y_all).score(X_new[1500:], y_new[1500:]):.3f}")
v2 = net((32, 16)).fit(X_all, y_all)

# 4. Test before deploy: both versions on the same production rows.
a1, a2 = v1.score(X_prod, y_prod), v2.score(X_prod, y_prod)
print(f"on production rows: v1 {a1:.3f}  v2 {a2:.3f}  ->", "deploy v2" if a2 > a1 else "keep v1")
