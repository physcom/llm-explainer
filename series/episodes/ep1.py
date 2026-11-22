"""Episode 1 - Learn from data (base)."""
import numpy as np


def r(v, n=3):
    if isinstance(v, (list, tuple, np.ndarray)):
        return [r(x, n) for x in v]
    return round(float(v), n)


EPISODE = {
    "id": "ep1",
    "n": 1,
    "level": "Base",
    "title": "Learn from data",
    "blurb": "A model is a function with parameters. Training finds the parameters that give the smallest loss.",
}

CHAPTERS = [
    ("rules", "Rules or examples"),
    ("model", "A model is a function"),
    ("loss", "Loss"),
    ("descent", "Gradient descent"),
    ("rate", "Learning rate"),
]

SEGMENTS = [
    ("rules", "r1", "This series starts with the base of machine learning. It goes up to AI engineering."),
    ("rules", "r2", "In normal software, a person writes the rules. The computer applies the rules to the data."),
    ("rules", "r3", "In machine learning, you give the computer examples. Each example has an input and the correct answer."),
    ("rules", "r4", "The computer finds the rules from the examples. We call the result a model."),

    ("model", "f1", "Here is an example. Each point is one house. The horizontal axis shows the area, and the vertical axis shows the price."),
    ("model", "f2", "We want a model that predicts the price from the area."),
    ("model", "f3", "A simple model is a line. The line has two numbers: the slope w and the intercept b."),
    ("model", "f4", "We call w and b the parameters of the model. Different parameters give different lines."),
    ("model", "f5", "The input of the model is a feature. Here, the area is the only feature. Real models use many features."),

    ("loss", "l1", "Which line is the best? We need a number that tells us how bad a line is."),
    ("loss", "l2", "For each house, we measure the distance between the real price and the predicted price. This distance is the error."),
    ("loss", "l3", "We square each error. Then we calculate the mean of the squares. The result is the mean squared error."),
    ("loss", "l4", "We call this number the loss. A small loss means a good fit."),
    ("loss", "l5", "Thus, training has one goal: find the parameters that give the smallest loss."),

    ("descent", "g1", "How do we find these parameters? We use gradient descent."),
    ("descent", "g2", "This curve shows the loss for each value of w. The best value is at the bottom of the curve."),
    ("descent", "g3", "We start with a random value. Then we measure the slope of the curve at that point. This slope is the gradient."),
    ("descent", "g4", "The gradient points uphill. Thus, we move w a small step in the opposite direction."),
    ("descent", "g5", "We do this again and again. Each step makes the loss smaller."),
    ("descent", "g6", "On the left, you can see the line. After each step, the line is closer to the points."),
    ("descent", "g7", "One pass through all of the training data is one epoch."),

    ("rate", "k1", "The size of each step comes from a number: the learning rate."),
    ("rate", "k2", "If the learning rate is too small, the steps are very small. Training is slow."),
    ("rate", "k3", "If the learning rate is too large, each step jumps over the bottom. The loss can increase."),
    ("rate", "k4", "A good learning rate gets to the bottom in a small number of steps."),
    ("rate", "k5", "Remember: a model is a function with parameters. Training uses the loss and the gradient to find good parameters."),
    ("rate", "k6", "In the next episode, we examine a new problem: a model that is good on old data but bad on new data."),
]

EXAMPLES = [
    {
        "title": "Gradient descent from scratch",
        "file": "ep1_gradient_descent.py",
        "ran": True,
        "about": "Fits price = w × area + b to the 24 houses on screen with plain NumPy. It scales the feature first, then takes 200 gradient steps on both w and b.",
    },
    {
        "title": "The same fit with scikit-learn",
        "file": "ep1_sklearn_fit.py",
        "ran": True,
        "about": "In practice you call a library. LinearRegression solves the same problem directly and gives the same line.",
    },
]

SOURCES = [
    {"label": "Linear regression, loss, gradient descent, learning rate",
     "text": "Google Machine Learning Crash Course, Linear regression module.",
     "url": "https://developers.google.com/machine-learning/crash-course/linear-regression"},
    {"label": "Numbers on screen",
     "text": "The 24 houses are synthetic data (seed 7). The build script computes every loss value and step that you see.",
     "url": None},
]


# Every number that the scenes show. Nothing on screen is typed by hand.
def nums() -> dict:
    rng = np.random.default_rng(7)
    area = rng.uniform(40, 160, size=24)
    price = 2.5 * area + 30 + rng.normal(0, 20, size=24)
    x = area / 100

    # least-squares line (joint optimum of w and b, in x = area/100 units)
    A = np.c_[x, np.ones_like(x)]
    w_star, b_star = np.linalg.lstsq(A, price, rcond=None)[0]

    def loss(w, b):
        return float(np.mean((w * x + b - price) ** 2))

    # two hand-picked "candidate" lines for the model scene, and their losses
    cand = [(120.0, 150.0), (330.0, -40.0)]

    # 1-D descent on w with b fixed at b_star
    c = 2 * np.mean(x ** 2)                    # curvature of L(w)

    def path(lr, w0, steps):
        ws = [w0]
        for _ in range(steps):
            w = ws[-1]
            g = 2 * np.mean((w * x + b_star - price) * x)
            ws.append(w - lr * g)
        return ws

    w0 = 60.0                                  # away from the axis so the labels have room
    good_lr = 0.2
    small_lr = 0.03
    big_lr = round(2.15 / c, 2)
    good = path(good_lr, w0, 6)
    small = path(small_lr, w0, 6)
    big = path(big_lr, 200.0, 5)              # start near the bottom so the jumps stay on screen
    grads = [2 * np.mean((w * x + b_star - price) * x) for w in good]

    return {
        "area": r(area, 1), "price": r(price, 1),
        "w_star": r(w_star, 2), "b_star": r(b_star, 2),
        "loss_star": r(loss(w_star, b_star), 1),
        "cand": [{"w": w, "b": b, "loss": r(loss(w, b), 0)} for w, b in cand],
        "curv": r(c, 4),
        # L(w) = A*w^2 + B*w + C with b fixed at b_star (the curve in the descent and rate scenes)
        "Lw": [r(np.mean(x ** 2), 6), r(2 * np.mean(x * (b_star - price)), 4), r(np.mean((b_star - price) ** 2), 2)],
        "w0": w0,
        "good_lr": good_lr, "small_lr": small_lr, "big_lr": float(big_lr),
        "good": r(good, 2), "small": r(small, 2), "big": r(big, 2),
        "good_loss": [r(loss(w, b_star), 0) for w in good],
        "good_grad": r(grads, 1),
    }
