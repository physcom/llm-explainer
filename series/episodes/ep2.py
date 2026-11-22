"""Episode 2 - Generalization (base)."""
import warnings

import numpy as np
from numpy.polynomial import Polynomial

EPISODE = {
    "id": "ep2",
    "n": 2,
    "level": "Base",
    "title": "Generalization",
    "blurb": "A model must work on data that it did not see. Split the data, watch the validation error, keep the weights small, and use cross-validation.",
}

CHAPTERS = [
    ("split", "Train, validation, test"),
    ("overfit", "Underfitting and overfitting"),
    ("curve", "Model complexity"),
    ("regular", "Regularization"),
    ("cv", "Cross-validation"),
]

SEGMENTS = [
    ("split", "s1", "In the last episode, a model learned a line from 24 houses. Today, we ask a new question: does the model work on new data?"),
    ("split", "s2", "Thus, before training, we divide the examples into three sets: the training set, the validation set, and the test set."),
    ("split", "s3", "The model learns its parameters from the training set only. We use the validation set to compare and select models."),
    ("split", "s4", "We keep the test set until the end. We use it one time, to measure the final result."),

    ("overfit", "o1", "Here is a new data set. The points come from a smooth curve, plus some random noise."),
    ("overfit", "o2", "A straight line is too simple for this data. Its error is large on all sets. This is underfitting."),
    ("overfit", "o3", "A polynomial of degree 3 has four parameters. It follows the shape of the curve, but not the noise."),
    ("overfit", "o4", "A polynomial of degree 15 has sixteen parameters. It goes through almost every training point."),
    ("overfit", "o5", "But between the points, the curve makes large jumps. It learned the noise, not the pattern."),
    ("overfit", "o6", "On the validation set, its error is very large. This is overfitting: good on old data, bad on new data."),

    ("curve", "c1", "Now we train one model for each degree from 1 to 15, and we measure two errors."),
    ("curve", "c2", "The blue curve shows the training error. It becomes smaller when the degree increases."),
    ("curve", "c3", "The orange curve shows the validation error. At first, it decreases. Then it increases again."),
    ("curve", "c4", "On the left, the model is too simple. Both errors are high. This is the underfitting region."),
    ("curve", "c5", "On the right, the model is too complex. The training error is low, but the validation error is high. This is the overfitting region."),
    ("curve", "c6", "The best model is at the bottom of the validation curve."),

    ("regular", "g1", "Sometimes we want a large model, but we do not want it to overfit. Regularization helps."),
    ("regular", "g2", "Overfit models often have very large parameters. The large values make the curve jump up and down."),
    ("regular", "g3", "Ridge regression adds a penalty to the loss. The penalty is the sum of the squared parameters, times a number lambda."),
    ("regular", "g4", "Now a large parameter makes the loss larger. Thus, training keeps the parameters small."),
    ("regular", "g5", "Here is the degree 15 model again, with a small penalty. The curve is smooth, and the validation error is low."),
    ("regular", "g6", "If lambda is too large, the model becomes too simple and underfits. Thus, we select lambda with the validation set."),

    ("cv", "v1", "A small validation set can give a result that depends on luck. Cross-validation gives a more stable result."),
    ("cv", "v2", "We put the test set aside. Then we divide the other data into five equal parts. We call each part a fold."),
    ("cv", "v3", "We train five times. Each time, one fold is the validation set, and the other four folds are the training set."),
    ("cv", "v4", "We get five validation errors. Their mean is the cross-validation score."),
    ("cv", "v5", "We calculate this score for each value of lambda. Then we select the value with the lowest score."),
    ("cv", "v6", "At the end, we measure the selected model one time on the test set. This number tells us how well the model works on new data."),
    ("cv", "v7", "In the next episode, the answer is not a number but a class: yes or no, spam or not spam. We examine classification and its metrics."),
]

SPOKEN = [
    ("MSE", "M S E"),
]

EXAMPLES = [
    {
        "title": "Train and validation error for each degree",
        "file": "ep2_poly_degree.py",
        "ran": True,
        "about": "Fits polynomials of degree 1 to 15 to the 18 training points on screen with NumPy, and prints the training and validation error of each. The training error only goes down; the validation error goes down, then up.",
    },
    {
        "title": "Ridge penalty selected by 5-fold cross-validation",
        "file": "ep2_ridge_cv.py",
        "ran": True,
        "about": "A scikit-learn pipeline: features x to x^15, scaling, then Ridge. scikit-learn calls the penalty strength alpha (lambda in the video). cross_val_score gives five fold errors for each alpha; the best alpha is then measured once on the test set.",
    },
]

SOURCES = [
    {"label": "Training, validation and test sets",
     "text": "Google Machine Learning Crash Course, Datasets: Dividing the original dataset.",
     "url": "https://developers.google.com/machine-learning/crash-course/overfitting/dividing-datasets"},
    {"label": "Overfitting and model complexity",
     "text": "Google Machine Learning Crash Course, Overfitting: Model complexity.",
     "url": "https://developers.google.com/machine-learning/crash-course/overfitting/model-complexity"},
    {"label": "Degree 1, 4 and 15 polynomials on noisy data",
     "text": "scikit-learn example: Underfitting vs. Overfitting.",
     "url": "https://scikit-learn.org/stable/auto_examples/model_selection/plot_underfitting_overfitting.html"},
    {"label": "Ridge regression (L2 penalty)",
     "text": "scikit-learn user guide, Linear models: Ridge regression.",
     "url": "https://scikit-learn.org/stable/modules/linear_model.html#ridge-regression-and-classification"},
    {"label": "k-fold cross-validation",
     "text": "scikit-learn user guide, Cross-validation: evaluating estimator performance.",
     "url": "https://scikit-learn.org/stable/modules/cross_validation.html"},
    {"label": "Numbers on screen",
     "text": "30 synthetic points: y = sin(2πx) + noise (σ = 0.25, seed 34). The build computes every error, curve and score that you see, with the same code as the two examples.",
     "url": None},
]


def r(v, n=4):
    if isinstance(v, (list, tuple, np.ndarray)):
        return [r(x, n) for x in v]
    return round(float(v), n)


SEED, N = 34, 30
DEG = 15
ALPHAS = [0.0001, 0.001, 0.01, 0.1, 1, 10]
BIG_ALPHA = 10


def data():
    """The same data and split as examples/ep2_*.py."""
    rng = np.random.default_rng(SEED)
    x = rng.uniform(0, 1, N)
    y = np.sin(2 * np.pi * x) + rng.normal(0, 0.25, N)
    idx = rng.permutation(N)
    return x, y, idx[:18], idx[18:24], idx[24:]


# Every number that the scenes show. Nothing on screen is typed by hand.
def nums() -> dict:
    from sklearn.linear_model import Ridge
    from sklearn.model_selection import KFold, cross_val_score
    from sklearn.pipeline import make_pipeline
    from sklearn.preprocessing import PolynomialFeatures, StandardScaler

    x, y, tr, va, te = data()
    gx = np.linspace(0, 1, 161)
    clip = lambda a: np.clip(a, -9, 9)              # values far off screen; the plot clips them

    def mse(f, i):
        return float(np.mean((f(x[i]) - y[i]) ** 2))

    # polynomial fits, least squares on the training set (as ep2_poly_degree.py)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        polys = {d: Polynomial.fit(x[tr], y[tr], d) for d in range(1, DEG + 1)}
    err_tr = [mse(polys[d], tr) for d in range(1, DEG + 1)]
    err_va = [mse(polys[d], va) for d in range(1, DEG + 1)]
    best_deg = int(np.argmin(err_va)) + 1

    # ridge on degree-15 features (as ep2_ridge_cv.py)
    X = x.reshape(-1, 1)

    def model(alpha):
        return make_pipeline(PolynomialFeatures(DEG, include_bias=False), StandardScaler(), Ridge(alpha=alpha))

    dev = np.concatenate([tr, va])                 # = idx[:24] in the example
    folds = KFold(n_splits=5, shuffle=True, random_state=0)
    cv = {a: -cross_val_score(model(a), X[dev], y[dev], cv=folds, scoring="neg_mean_squared_error") for a in ALPHAS}
    best_alpha = min(ALPHAS, key=lambda a: cv[a].mean())
    fold_sizes = [len(t) for _, t in folds.split(X[dev])]
    # which of the 24 points sit in which fold (positions in dev order), for the fold diagram
    fold_of = np.zeros(len(dev), int)
    for k, (_, t) in enumerate(folds.split(X[dev])):
        fold_of[t] = k
    final = model(best_alpha).fit(X[dev], y[dev])
    test_mse = float(np.mean((final.predict(X[te]) - y[te]) ** 2))

    def ridge_fit(alpha):
        m = model(alpha).fit(X[tr], y[tr])
        f = lambda v: m.predict(np.asarray(v).reshape(-1, 1))
        return {"alpha": alpha, "curve": r(clip(f(gx)), 3), "train": r(mse(f, tr)), "val": r(mse(f, va)),
                "sumw2": r(np.sum(m[-1].coef_ ** 2), 3)}

    # sum of squared weights of the unpenalized degree-15 fit, in the same scaled-feature basis as Ridge:
    # p(x) = c0 + sum a_k x^k  and  z_k = (x^k - mean_k) / std_k  =>  w_k = a_k * std_k
    raw = polys[DEG].convert().coef[1:]
    std = np.std(np.vstack([x[tr] ** k for k in range(1, DEG + 1)]), axis=1)
    sumw2_none = float(np.sum((raw * std) ** 2))

    return {
        "x": r(x, 4), "y": r(y, 4), "tr": tr.tolist(), "va": va.tolist(), "te": te.tolist(),
        "gx": r(gx, 4), "truth": r(np.sin(2 * np.pi * gx), 3),
        "fits": {str(d): r(clip(polys[d](gx)), 3) for d in (1, 3, DEG)},
        "err_tr": r(err_tr), "err_va": r(err_va), "best_deg": best_deg,
        "ridge_good": ridge_fit(best_alpha), "ridge_big": ridge_fit(BIG_ALPHA),
        "sumw2_none": r(sumw2_none, 0),
        "alphas": ALPHAS, "cv_mean": [r(cv[a].mean()) for a in ALPHAS], "best_alpha": best_alpha,
        "cv_folds": r(cv[best_alpha]), "fold_sizes": fold_sizes, "fold_of": fold_of.tolist(),
        "dev": dev.tolist(), "test_mse": r(test_mse),
    }
