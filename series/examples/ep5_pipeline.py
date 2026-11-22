"""One pipeline for training and serving, saved as one file. Then: the leakage that a pipeline prevents."""
import tempfile
import warnings
from pathlib import Path

import joblib
import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore")  # keep the output short


def make_orders(n, rng, dist_scale=1.2):
    """Synthetic food deliveries: distance (km), kitchen queue (orders) -> late (1) or on time (0)."""
    dist = rng.gamma(3.0, dist_scale, n)
    queue = rng.poisson(6.0, n).astype(float)
    travel = np.where(dist <= 6, 4.0 * dist, 6.0 + 1.2 * dist)   # bike up to 6 km, then a car
    minutes = 8 + 1.2 * queue + travel + rng.normal(0, 4, n)
    return np.c_[dist, queue], (minutes > 35).astype(int)       # promised: 35 minutes


rng = np.random.default_rng(5)
X_train, y_train = make_orders(2000, rng)
X_test, y_test = make_orders(1000, rng)

# 1. Preprocessing and model in ONE object: training and serving run the same steps.
model = make_pipeline(StandardScaler(), MLPClassifier(hidden_layer_sizes=(16,), max_iter=2000, random_state=0))
model.fit(X_train, y_train)
scaler = model.named_steps["standardscaler"]
print("steps:", [name for name, _ in model.steps])
print("scaler learned  mean", scaler.mean_.round(2), " std", scaler.scale_.round(2), " (from training rows only)")
print(f"test accuracy: {model.score(X_test, y_test):.3f}")

# 2. Save the whole pipeline as one file, load it again (a service does this when it starts).
with tempfile.TemporaryDirectory() as d:
    path = Path(d) / "late_model_v1.joblib"
    joblib.dump(model, path)
    print(f"saved {path.name}")
    loaded = joblib.load(path)
same = np.array_equal(loaded.predict_proba(X_test), model.predict_proba(X_test))
print("loaded pipeline gives the same probabilities:", same)

# 3. Leakage. 200 rows, 2000 features of pure noise, random labels: the true accuracy is 0.5.
rl = np.random.default_rng(3)
Xr = rl.normal(size=(200, 2000))
yr = rl.integers(0, 2, size=200)

# Wrong: select the 20 "best" features with ALL rows, then cross-validate. The test folds took part in the selection.
X_sel = SelectKBest(f_classif, k=20).fit_transform(Xr, yr)
wrong = cross_val_score(LogisticRegression(), X_sel, yr, cv=5).mean()
# Right: the selection is a pipeline step, so each fold selects with its own training rows only.
right = cross_val_score(make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression()), Xr, yr, cv=5).mean()
print(f"selection before the split (leak):  CV accuracy {wrong:.2f}")
print(f"selection inside the pipeline:      CV accuracy {right:.2f}")
