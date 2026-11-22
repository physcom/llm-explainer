"""Curved data: a straight boundary (logistic regression) against an ensemble of trees (gradient boosting)."""
from sklearn.datasets import make_moons
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

# Two interleaved half-moons with noise: no straight line separates them.
X, y = make_moons(n_samples=600, noise=0.3, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

models = {
    "logistic regression": LogisticRegression(),
    "random forest (100 trees)": RandomForestClassifier(n_estimators=100, random_state=0),
    "gradient boosting (100 trees)": GradientBoostingClassifier(random_state=0),
}
for name, model in models.items():
    model.fit(X_train, y_train)
    print(f"{name:30s} test accuracy {model.score(X_test, y_test):.3f}")
