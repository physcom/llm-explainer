"""The same task with scikit-learn: a straight boundary against a small neural network."""
from sklearn.datasets import make_moons
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier

X, y = make_moons(n_samples=200, noise=0.2, random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=50, random_state=0)

line = LogisticRegression().fit(X_tr, y_tr)
print(f"logistic regression (straight line)   test accuracy {line.score(X_te, y_te):.0%}")

# The start weights are random. A small network can stop in a poor place, so try a few seeds.
for seed in (0, 1, 2):
    mlp = MLPClassifier(hidden_layer_sizes=(8,), activation="relu", learning_rate_init=0.01,
                        max_iter=3000, random_state=seed).fit(X_tr, y_tr)
    n_params = sum(w.size for w in mlp.coefs_) + sum(b.size for b in mlp.intercepts_)
    print(f"MLP, 8 ReLU neurons, seed {seed} ({n_params} parameters)   test accuracy {mlp.score(X_te, y_te):.0%}")
