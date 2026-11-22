"""Logistic regression on synthetic loan customers: probabilities, a threshold, and the metrics."""
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix

# 380 synthetic customers: debt-to-income ratio (%) and credit score. Label 1 = default.
rng = np.random.default_rng(11)
n = 380
debt = rng.uniform(5, 60, n)
score = np.clip(rng.normal(670, 75, n), 450, 850)
z_true = 0.11 * (debt - 32) - 0.022 * (score - 660) - 0.6
y = (rng.uniform(size=n) < 1 / (1 + np.exp(-z_true))).astype(int)
X = np.c_[debt, score]

# Train on the first 300 customers, test on 80 customers that the model never saw.
X_train, y_train, X_test, y_test = X[:300], y[:300], X[300:], y[300:]

model = LogisticRegression(max_iter=5000).fit(X_train, y_train)
w1, w2 = model.coef_[0]
print(f"z = {w1:.4f} * debt + {w2:.5f} * score + {model.intercept_[0]:.3f}")

p = model.predict_proba(X_test)[:, 1]        # probability of default for each test customer
print("first 5 probabilities:", np.round(p[:5], 3))

for threshold in (0.5, 0.3):
    pred = (p > threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_test, pred).ravel()
    print(f"\nthreshold {threshold}:  TP {tp}  FP {fp}  FN {fn}  TN {tn}")
    print(classification_report(y_test, pred, target_names=["pays back", "default"], digits=3))
