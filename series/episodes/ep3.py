"""Episode 3 - Classification and metrics (intermediate)."""
import numpy as np

EPISODE = {
    "id": "ep3",
    "n": 3,
    "level": "Intermediate",
    "title": "Classification and metrics",
    "blurb": "When the answer is a class, a model gives a probability, a threshold turns it into a decision, and the confusion matrix shows the cost of each type of error.",
}

CHAPTERS = [
    ("classify", "Number or class"),
    ("sigmoid", "Logistic regression"),
    ("threshold", "Threshold"),
    ("metrics", "Confusion matrix"),
    ("trees", "Trees and ensembles"),
]

SEGMENTS = [
    ("classify", "c1", "In the first two episodes, the model predicted a number, for example a price. We call this type of task regression."),
    ("classify", "c2", "In this episode, the answer is a class. For example: will a customer pay back a loan, yes or no?"),
    ("classify", "c3", "This type of task is classification. Each customer is one example with two features: the debt ratio and the credit score."),
    ("classify", "c4", "Blue points show customers that paid back the loan. Red points show customers that did not pay. We call this a default."),
    ("classify", "c5", "For a new customer, we want a model that gives the probability of a default."),

    ("sigmoid", "s1", "Logistic regression is a simple model for classification. It starts like linear regression."),
    ("sigmoid", "s2", "It multiplies each feature by a weight, and it adds a bias. The result is a score, z."),
    ("sigmoid", "s3", "The score can be any number. But a probability must be between zero and one."),
    ("sigmoid", "s4", "Thus, the model puts the score into the sigmoid function. The sigmoid changes any number into a value between zero and one."),
    ("sigmoid", "s5", "A large positive score gives a probability near one. A large negative score gives a probability near zero."),
    ("sigmoid", "s6", "Training finds the weights with gradient descent, as in episode one. Here, the loss is the log loss."),

    ("threshold", "t1", "The model gives a probability. But the bank must make a decision: yes or no."),
    ("threshold", "t2", "Thus, we use a threshold. If the probability is more than 0.5, the model predicts a default."),
    ("threshold", "t3", "On the plot, the threshold gives a line. This line is the decision boundary."),
    ("threshold", "t4", "If we decrease the threshold to 0.3, the line moves. The model finds more defaults, but it also gives more false alarms."),
    ("threshold", "t5", "The correct threshold depends on the cost of each type of error."),

    ("metrics", "m1", "How good is the model? We compare its predictions with the true classes on test data."),
    ("metrics", "m2", "The confusion matrix counts the four possible results."),
    ("metrics", "m3", "A true positive is a default that the model finds. A false positive is a false alarm. A false negative is a default that the model does not find."),
    ("metrics", "m4", "Precision tells us how many of the predicted defaults are correct. Recall tells us how many of the real defaults the model finds."),
    ("metrics", "m5", "The F1 score combines precision and recall into one number."),
    ("metrics", "m6", "Be careful with accuracy. In this example, only 3 customers in 100 do not pay."),
    ("metrics", "m7", "A model that always predicts no default has an accuracy of 97 percent. But its recall is zero: it finds no defaults."),

    ("trees", "d1", "Another type of model is the decision tree. It asks a series of simple questions about the features."),
    ("trees", "d2", "Each question compares one feature with a limit. The answer sends the customer to the left or to the right."),
    ("trees", "d3", "Each question cuts the plot with a vertical or horizontal line. The result is a set of rectangles."),
    ("trees", "d4", "One tree is easy to read, but it can overfit. Thus, we often use many trees together. We call this an ensemble."),
    ("trees", "d5", "A random forest trains many trees on random samples of the data. Then the trees vote."),
    ("trees", "d6", "Gradient boosting adds trees one after another. Each new tree corrects the errors of the trees before it."),
    ("trees", "d7", "On tables of data, gradient boosting is often the strongest model. On this curved data, it is better than logistic regression."),
    ("trees", "d8", "In the next episode, we build neural networks. They can learn curved boundaries without trees."),
]

SPOKEN = [
    ("F1", "F 1"),
    ("0.5", "zero point five"),
    ("0.3", "zero point three"),
    ("z", "zee"),
]

EXAMPLES = [
    {
        "title": "Logistic regression and its metrics",
        "file": "ep3_logistic.py",
        "ran": True,
        "about": "Trains logistic regression on 300 synthetic loan customers, then tests it on 80 new ones. It prints the weights, the confusion matrix and the classification report, then shows what changes when the threshold goes from 0.5 to 0.3.",
    },
    {
        "title": "Gradient boosting against logistic regression",
        "file": "ep3_boosting.py",
        "ran": True,
        "about": "On curved data (two interleaved half-moons), a straight decision boundary cannot separate the classes. Gradient boosting, an ensemble of small trees, can.",
    },
]

SOURCES = [
    {"label": "Logistic regression, sigmoid, log loss",
     "text": "Google Machine Learning Crash Course, Logistic regression module.",
     "url": "https://developers.google.com/machine-learning/crash-course/logistic-regression"},
    {"label": "Threshold, confusion matrix, precision, recall",
     "text": "Google Machine Learning Crash Course, Classification module.",
     "url": "https://developers.google.com/machine-learning/crash-course/classification"},
    {"label": "Decision trees, random forests, gradient boosting",
     "text": "scikit-learn user guide: decision trees and ensemble methods.",
     "url": "https://scikit-learn.org/stable/modules/ensemble.html"},
    {"label": "Trees are strong on tabular data",
     "text": "Grinsztajn, Oyallon and Varoquaux (2022), Why do tree-based models still outperform deep learning on tabular data?",
     "url": "https://arxiv.org/abs/2207.08815"},
    {"label": "Numbers on screen",
     "text": "The loan customers and the half-moons are synthetic data. The build script fits the models and computes every count, weight and accuracy that you see.",
     "url": None},
]


def r(v, n=3):
    if isinstance(v, (list, tuple, np.ndarray)):
        return [r(x, n) for x in v]
    return round(float(v), n)


def loans(n: int, seed: int):
    """Synthetic loan customers: debt-to-income ratio (%), credit score; label 1 = default."""
    rng = np.random.default_rng(seed)
    debt = rng.uniform(5, 60, n)
    score = np.clip(rng.normal(670, 75, n), 450, 850)
    z = 0.11 * (debt - 32) - 0.022 * (score - 660) - 0.6
    y = (rng.uniform(size=n) < 1 / (1 + np.exp(-z))).astype(int)
    return np.c_[debt, score], y


def counts(y, pred) -> dict:
    tp = int(((pred == 1) & (y == 1)).sum())
    fp = int(((pred == 1) & (y == 0)).sum())
    fn = int(((pred == 0) & (y == 1)).sum())
    tn = int(((pred == 0) & (y == 0)).sum())
    return {"tp": tp, "fp": fp, "fn": fn, "tn": tn}


# Every number that the scenes show. Nothing on screen is typed by hand.
def nums() -> dict:
    from sklearn.datasets import make_moons
    from sklearn.ensemble import GradientBoostingClassifier
    from sklearn.linear_model import LogisticRegression
    from sklearn.model_selection import train_test_split
    from sklearn.tree import DecisionTreeClassifier

    X, y = loans(380, seed=11)
    Xtr, ytr, Xte, yte = X[:300], y[:300], X[300:], y[300:]
    lr = LogisticRegression(max_iter=5000).fit(Xtr, ytr)
    w1, w2 = lr.coef_[0]
    b = lr.intercept_[0]
    p = lr.predict_proba(Xte)[:, 1]
    c5, c3 = counts(yte, (p > 0.5).astype(int)), counts(yte, (p > 0.3).astype(int))
    prec = c5["tp"] / (c5["tp"] + c5["fp"])
    rec = c5["tp"] / (c5["tp"] + c5["fn"])

    # the accuracy trap: 1000 customers, 30 defaults, a model that always says "no default"
    n_all, n_def = 1000, 30
    assert n_def / n_all == 0.03          # the narration says "3 customers in 100"

    # a depth-2 decision tree on the same training data
    tree = DecisionTreeClassifier(max_depth=2, random_state=0).fit(Xtr, ytr)
    t = tree.tree_
    nodes = []
    for i in range(t.node_count):
        leaf = t.children_left[i] == -1
        nodes.append({
            "f": int(t.feature[i]) if not leaf else -1,
            "thr": r(t.threshold[i], 1) if not leaf else None,
            "l": int(t.children_left[i]), "r": int(t.children_right[i]),
            "cls": int(np.argmax(t.value[i][0])), "n": int(t.n_node_samples[i]),
        })
    tree_acc = float((tree.predict(Xte) == yte).mean())

    # curved data: logistic regression against gradient boosting (same split as ep3_boosting.py)
    Xm, ym = make_moons(n_samples=600, noise=0.3, random_state=0)
    Xa, Xb, ya, yb = train_test_split(Xm, ym, test_size=0.3, random_state=0)
    mlr = LogisticRegression().fit(Xa, ya)
    gb = GradientBoostingClassifier(random_state=0).fit(Xa, ya)
    lo, hi = Xm.min(axis=0) - 0.1, Xm.max(axis=0) + 0.1      # the region grid covers every point
    gx, gy = np.linspace(lo[0], hi[0], 56), np.linspace(lo[1], hi[1], 40)
    G = np.array([[x, yy] for yy in gy for x in gx])
    grid = lambda m: ["".join(str(v) for v in row) for row in m.predict(G).reshape(len(gy), len(gx))]

    return {
        "test": {"debt": r(Xte[:, 0], 1), "score": r(Xte[:, 1], 0), "y": yte.tolist()},
        "n_train": len(ytr), "n_test": len(yte), "test_defaults": int(yte.sum()),
        "w1": r(w1, 4), "w2": r(w2, 5), "b": r(b, 3),
        "z": r(Xte @ lr.coef_[0] + b, 3), "p": r(p, 3),
        "cm05": c5, "cm03": c3,
        "precision": r(prec, 3), "recall": r(rec, 3), "f1": r(2 * prec * rec / (prec + rec), 3),
        "acc05": r((c5["tp"] + c5["tn"]) / len(yte), 3),
        "trap": {"n": n_all, "defaults": n_def, "acc": r((n_all - n_def) / n_all, 3), "recall": 0.0},
        "tree": nodes, "tree_acc": r(tree_acc, 3),
        "moons": {
            "x": r(Xb[:, 0], 2), "y": r(Xb[:, 1], 2), "c": yb.tolist(),
            "gx": [r(gx[0], 3), r(gx[-1], 3), len(gx)], "gy": [r(gy[0], 3), r(gy[-1], 3), len(gy)],
            "lr_grid": grid(mlr), "gb_grid": grid(gb),
            "lr_acc": r(mlr.score(Xb, yb), 3), "gb_acc": r(gb.score(Xb, yb), 3),
        },
    }
