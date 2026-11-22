"""Episode 5 - Production ML (advanced)."""
import numpy as np

EPISODE = {
    "id": "ep5",
    "n": 5,
    "level": "Advanced",
    "title": "Production ML",
    "blurb": "A model must work for real users after training. One pipeline, a web service, a watch for drift, and versions you can roll back.",
}

CHAPTERS = [
    ("lifecycle", "The model lifecycle"),
    ("pipeline", "One pipeline"),
    ("serve", "Serve predictions"),
    ("monitor", "Watch for drift"),
    ("ops", "Versions and tests"),
]

SEGMENTS = [
    ("lifecycle", "c1", "In episode four, we trained a network that works on test data. Now real users must get its predictions."),
    ("lifecycle", "c2", "Our example is a food delivery service. The model predicts if an order will arrive late."),
    ("lifecycle", "c3", "It uses two features: the distance to the customer and the number of orders in the kitchen queue."),
    ("lifecycle", "c4", "Production work is a loop. We collect data, train, evaluate, and deploy. Then we watch the model and train it again when its results get worse."),
    ("lifecycle", "c6", "In real systems, the model code is only a small part. The other parts move data and keep the system correct."),

    ("pipeline", "p1", "Before the model sees the data, we prepare it. A scaler puts each feature on the same scale."),
    ("pipeline", "p2", "The service must prepare new data in the same way. If the steps are different, the predictions are wrong."),
    ("pipeline", "p3", "Thus, we put all of the steps into one pipeline. We save the pipeline as one file."),
    ("pipeline", "p4", "A pipeline also prevents a dangerous error: data leakage. Leakage occurs when information from the test data gets into training."),
    ("pipeline", "p5", "Here is an example. We make 200 rows with 2000 random features. The labels are also random."),
    ("pipeline", "p6", "First, we select the 20 best features with all of the rows. Then, cross-validation shows a high accuracy."),
    ("pipeline", "p7", "That result is false, because the selection saw the test rows. Inside a pipeline, each fold selects with its own training rows."),
    ("pipeline", "p8", "Now the accuracy is close to one half. For random labels, that is the correct result."),

    ("serve", "s1", "Now we serve the model. A small web service loads the pipeline file one time, when it starts."),
    ("serve", "s2", "An application sends a request with the two features in JSON. The service sends back the prediction in JSON."),
    ("serve", "s3", "The service checks each request. If a feature is not in the request, it returns an error and no prediction."),
    ("serve", "s4", "This is online prediction: one request gets one answer immediately. A checkout page needs this."),
    ("serve", "s5", "Batch prediction is different. A job predicts many rows at one time, for example each night, and stores the results."),

    ("monitor", "m2", "After we deploy the model, the world changes. Here, the service starts to deliver to new suburbs, so the trips get longer."),
    ("monitor", "m4", "We call this change data drift. The population stability index, PSI, measures it. It compares the two distributions, bin by bin."),
    ("monitor", "m5", "A common rule of thumb says that a PSI above 0.25 shows a large change. The queue feature did not move."),
    ("monitor", "m6", "A K S test gives a second check. It finds the largest gap between the two cumulative distributions."),
    ("monitor", "m7", "The correct answers arrive later. Then we see that the accuracy decreased, because long trips now go by car. The model never saw a car trip."),

    ("ops", "o2", "To fix the model, we train a new version with recent data. We keep versions of the code, the data, and the model file."),
    ("ops", "o3", "We record each experiment: its settings, its data version, and its result. We also set the random seeds, so the same run gives the same model."),
    ("ops", "o5", "Before we deploy, a test compares the new model with the old model on the same recent data."),
    ("ops", "o6", "If the new model is better, we deploy it. If it fails in production, we roll back to the old version."),
    ("ops", "o7", "In the next episode, we go from these small models to large language models. We start with tokens."),
]

SPOKEN = [
    ("JSON", "Jason"),
    ("PSI", "P S I"),
    ("K S", "K S"),
    ("cross-validation", "cross validation"),
]

EXAMPLES = [
    {
        "title": "One pipeline, saved as one file",
        "file": "ep5_pipeline.py",
        "ran": True,
        "about": "Bundles StandardScaler and a small neural network into one scikit-learn Pipeline, saves it with joblib, loads it again and checks that the predictions are identical. The second part shows the leakage trap from the video: feature selection before the split makes random labels look predictable.",
    },
    {
        "title": "Serve the model with FastAPI",
        "file": "ep5_serve.py",
        "ran": True,
        "about": "A web service with /health and /predict. FastAPI checks each request against a schema. TestClient sends real HTTP requests to the app inside the same process, so the example runs offline. The last part is a batch job: one call predicts many rows.",
    },
    {
        "title": "Detect drift, then retrain and compare",
        "file": "ep5_drift.py",
        "ran": True,
        "about": "Compares training data with production data feature by feature (PSI and the two-sample KS test from SciPy), measures the accuracy drop once the labels arrive, then trains version 2 on recent data and compares both versions on the same recent orders before a deploy.",
    },
]

SOURCES = [
    {"label": "The model code is a small part of an ML system",
     "text": "Sculley et al., Hidden Technical Debt in Machine Learning Systems, NeurIPS 2015 (Figure 1).",
     "url": "https://proceedings.neurips.cc/paper/2015/file/86df7dcfd896fcaf2674f757a2463eba-Paper.pdf"},
    {"label": "Pipelines and data leakage",
     "text": "scikit-learn user guide, Common pitfalls and recommended practices: preprocessing and feature selection must use only training data; a Pipeline does this inside cross-validation.",
     "url": "https://scikit-learn.org/stable/common_pitfalls.html"},
    {"label": "Request checks and offline tests of the service",
     "text": "FastAPI documentation: request bodies are validated against a Pydantic model; TestClient calls the app without a running server.",
     "url": "https://fastapi.tiangolo.com/tutorial/testing/"},
    {"label": "PSI and the 0.1 / 0.25 rule of thumb",
     "text": "The cutoffs go back to Lewis (1994) and are an industry rule of thumb. Yurdakul and Naranjo, Statistical properties of the population stability index, note that the cutoffs have no statistical basis and that PSI depends on bins and sample sizes.",
     "url": "https://www.risk.net/journal-of-risk-model-validation/7725371/statistical-properties-of-the-population-stability-index"},
    {"label": "Two-sample Kolmogorov-Smirnov test",
     "text": "SciPy reference, scipy.stats.ks_2samp.",
     "url": "https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ks_2samp.html"},
    {"label": "Numbers on screen",
     "text": "The deliveries are synthetic data (seed 5): bike trips up to 6 km, car trips after the drift. The build script computes every count, PSI, KS statistic and accuracy that you see.",
     "url": None},
]


# ---------------------------------------------------------------- numbers on screen
def r(v, n=3):
    if isinstance(v, (list, tuple, np.ndarray)):
        return [r(x, n) for x in v]
    return round(float(v), n)


def make_orders(n, rng, dist_scale=1.2):
    """Synthetic food deliveries: distance (km), kitchen queue (orders) -> late (1) or on time (0).
    The same function is in examples/ep5_*.py."""
    dist = rng.gamma(3.0, dist_scale, n)
    queue = rng.poisson(6.0, n).astype(float)
    travel = np.where(dist <= 6, 4.0 * dist, 6.0 + 1.2 * dist)   # bike up to 6 km, then a car
    minutes = 8 + 1.2 * queue + travel + rng.normal(0, 4, n)
    return np.c_[dist, queue], (minutes > 35).astype(int)       # promised: 35 minutes


def psi(base, new, bins=10):
    edges = np.quantile(base, np.linspace(0, 1, bins + 1))
    edges[0], edges[-1] = -np.inf, np.inf
    pb = np.clip(np.histogram(base, edges)[0] / len(base), 1e-4, None)
    pn = np.clip(np.histogram(new, edges)[0] / len(new), 1e-4, None)
    return float(np.sum((pn - pb) * np.log(pn / pb)))


def nums() -> dict:
    from scipy.stats import ks_2samp
    from sklearn.feature_selection import SelectKBest, f_classif
    from sklearn.linear_model import LogisticRegression
    from sklearn.model_selection import cross_val_score
    from sklearn.neural_network import MLPClassifier
    from sklearn.pipeline import make_pipeline
    from sklearn.preprocessing import StandardScaler

    def net(hidden=(16,), seed=0):
        return make_pipeline(StandardScaler(), MLPClassifier(hidden_layer_sizes=hidden, max_iter=2000, random_state=seed))

    rng = np.random.default_rng(5)
    X, y = make_orders(2000, rng)                  # training data (bike era)
    Xt, yt = make_orders(1000, rng)                # test data, same era
    Xp, yp = make_orders(1000, rng, 2.2)           # production, after the move to the suburbs
    Xn, yn = make_orders(2000, rng, 2.2)           # recent labelled orders, for version 2

    v1 = net().fit(X, y)
    sc = v1.named_steps["standardscaler"]
    sample = np.array([[4.2, 9.0]])
    reqs = [[3.5, 4.0], [5.5, 9.0]]
    probs = v1.predict_proba(np.array(reqs))[:, 1]

    # leakage demo (same code as examples/ep5_pipeline.py)
    rl = np.random.default_rng(3)
    Xr = rl.normal(size=(200, 2000))
    yr = rl.integers(0, 2, size=200)
    X_sel = SelectKBest(f_classif, k=20).fit_transform(Xr, yr)
    wrong = cross_val_score(LogisticRegression(), X_sel, yr, cv=5).mean()
    right = cross_val_score(make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression()), Xr, yr, cv=5).mean()

    # drift: histograms of distance (1 km bins), PSI, KS
    edges = np.arange(0, 21, 1.0)
    h_tr = np.histogram(np.clip(X[:, 0], 0, 19.99), edges)[0] / len(X)
    h_pr = np.histogram(np.clip(Xp[:, 0], 0, 19.99), edges)[0] / len(Xp)
    ks_d, ks_q = ks_2samp(X[:, 0], Xp[:, 0]), ks_2samp(X[:, 1], Xp[:, 1])
    grid = np.linspace(0, 20, 101)
    cdf_tr = [float(np.mean(X[:, 0] <= g)) for g in grid]
    cdf_pr = [float(np.mean(Xp[:, 0] <= g)) for g in grid]
    gap_i = int(np.argmax(np.abs(np.array(cdf_tr) - np.array(cdf_pr))))

    # version 2: experiments on recent data (validated on the last 500 recent rows), seeds, final test on production rows
    Xa, ya = np.r_[X, Xn[:1500]], np.r_[y, yn[:1500]]
    runs = []
    for hidden in [(4,), (16,), (32, 16)]:
        m = net(hidden).fit(Xa, ya)
        runs.append({"hidden": list(hidden), "val": r(m.score(Xn[1500:], yn[1500:]))})
    best = max(runs, key=lambda d: d["val"])
    seeds = []
    for s in (0, 0, 1):
        m = net(tuple(best["hidden"]), seed=s).fit(Xa, ya)
        seeds.append({"seed": s, "val": r(m.score(Xn[1500:], yn[1500:]))})
    v2 = net(tuple(best["hidden"])).fit(Xa, ya)

    return {
        "n_train": len(X), "n_prod": len(Xp), "late_train": r(y.mean()), "late_prod": r(yp.mean()),
        "mean": r(sc.mean_, 2), "std": r(sc.scale_, 2), "sample": r(sample[0], 1), "sample_z": r(sc.transform(sample)[0], 2),
        "reqs": [{"distance_km": a, "queue": int(b), "p": r(p)} for (a, b), p in zip(reqs, probs)],
        # batch job in examples/ep5_serve.py: the next 1000 orders from the same generator (= Xt here)
        "batch_n": len(Xt), "batch_late": int((v1.predict_proba(Xt)[:, 1] >= 0.5).sum()),
        "leak": {"rows": 200, "features": 2000, "k": 20, "folds": 5, "wrong": r(wrong, 2), "right": r(right, 2)},
        "edges": r(edges, 1), "h_train": r(h_tr, 4), "h_prod": r(h_pr, 4),
        "mean_dist_train": r(X[:, 0].mean(), 1), "mean_dist_prod": r(Xp[:, 0].mean(), 1),
        "psi_dist": r(psi(X[:, 0], Xp[:, 0]), 2), "psi_queue": r(psi(X[:, 1], Xp[:, 1]), 2),
        "ks_dist": r(ks_d.statistic), "ks_dist_p": float(f"{ks_d.pvalue:.1e}"), "ks_queue": r(ks_q.statistic), "ks_queue_p": r(ks_q.pvalue, 2),
        "cdf_grid": r(grid, 1), "cdf_train": r(cdf_tr), "cdf_prod": r(cdf_pr), "ks_at": r(grid[gap_i], 1),
        "acc_test": r(v1.score(Xt, yt)), "acc_prod": r(v1.score(Xp, yp)),
        "runs": runs, "best": best["hidden"], "seeds": seeds,
        "v1_prod": r(v1.score(Xp, yp)), "v2_prod": r(v2.score(Xp, yp)), "v2_test": r(v2.score(Xt, yt)),
    }
