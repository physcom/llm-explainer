"""A degree-15 polynomial with a ridge (L2) penalty. 5-fold cross-validation selects the penalty."""
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.model_selection import KFold, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

# The same 30 points and the same split as on screen.
rng = np.random.default_rng(34)
x = rng.uniform(0, 1, 30)
y = np.sin(2 * np.pi * x) + rng.normal(0, 0.25, 30)
idx = rng.permutation(30)
dev, test = idx[:24], idx[24:]      # training + validation points for cross-validation; test kept aside
X = x.reshape(-1, 1)                # scikit-learn wants a 2-D feature table


def model(alpha):
    # x, x^2, ..., x^15  ->  scale each feature  ->  linear model; loss + alpha * sum(w^2)
    return make_pipeline(PolynomialFeatures(15, include_bias=False), StandardScaler(), Ridge(alpha=alpha))


folds = KFold(n_splits=5, shuffle=True, random_state=0)
print("alpha    mean CV MSE   five fold MSEs")
scores = {}
for alpha in [0.0001, 0.001, 0.01, 0.1, 1, 10]:
    s = -cross_val_score(model(alpha), X[dev], y[dev], cv=folds, scoring="neg_mean_squared_error")
    scores[alpha] = s.mean()
    print(f"{alpha:<7g}  {s.mean():11.4f}   " + " ".join(f"{v:.3f}" for v in s))

best = min(scores, key=scores.get)
final = model(best).fit(X[dev], y[dev])             # train again on all 24 points
test_mse = np.mean((final.predict(X[test]) - y[test]) ** 2)
print(f"selected alpha = {best}, test MSE = {test_mse:.4f}")
