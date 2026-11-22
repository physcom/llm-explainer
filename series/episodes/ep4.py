"""Episode 4 - Neural networks (intermediate)."""
import numpy as np

EPISODE = {
    "id": "ep4",
    "n": 4,
    "level": "Intermediate",
    "title": "Neural networks",
    "blurb": "Layers of simple neurons can learn a curved boundary. Backpropagation finds the gradient for every weight.",
}

CHAPTERS = [
    ("neuron", "A neuron"),
    ("layers", "Layers"),
    ("nonlinear", "Why the activation matters"),
    ("backprop", "Backpropagation"),
    ("train", "Training"),
]

SEGMENTS = [
    ("neuron", "n1", "In episode three, logistic regression separated two classes with a straight line. Some data needs a curved boundary."),
    ("neuron", "n2", "Here are two moons, one for each class. The best straight line still puts many points on the wrong side."),
    ("neuron", "n3", "A neural network can learn a curved boundary. Its basic part is the neuron."),
    ("neuron", "n4", "A neuron multiplies each input by a weight. Then it adds the products and a bias. The result is a weighted sum."),
    ("neuron", "n5", "Then it applies an activation function. ReLU changes negative values to zero and keeps positive values."),

    ("layers", "y1", "We connect neurons in layers. Each neuron gets all of the outputs from the layer before it."),
    ("layers", "y2", "This network has three layers. The input layer holds the two coordinates of a point."),
    ("layers", "y3", "The hidden layer has eight neurons. Each hidden neuron finds a different simple feature in the input."),
    ("layers", "y4", "The output layer has one neuron. A sigmoid changes its value into a probability, as in episode three."),
    ("layers", "y5", "A forward pass sends a point through the layers, from left to right. The result is the prediction."),
    ("layers", "y6", "The weights and the biases are the parameters. This small network has 33 parameters."),

    ("nonlinear", "a1", "Why do we need the activation function? Let us remove it and see the result."),
    ("nonlinear", "a2", "Without it, each layer only multiplies by weights and adds biases. That is a linear function."),
    ("nonlinear", "a3", "A linear function of a linear function is also linear. Thus, all of the layers act as one layer."),
    ("nonlinear", "a4", "We trained this network without activation functions. Its boundary is a straight line again."),
    ("nonlinear", "a5", "Now we put ReLU back. Each hidden neuron adds a bend, and together the bends make a curve."),
    ("nonlinear", "a6", "With the same data and the same training, the boundary now follows the two moons."),

    ("backprop", "b1", "How does the network find good weights? It uses gradient descent, as in episode one."),
    ("backprop", "b2", "But each weight changes the loss through several layers. We need the gradient for every weight."),
    ("backprop", "b3", "Backpropagation calculates these gradients. It starts at the loss and moves back, one layer at a time."),
    ("backprop", "b4", "At each layer, it applies the chain rule. It multiplies the local slopes along the path from the weight to the loss."),
    ("backprop", "b5", "Here is one weight in the first layer, before training. Backpropagation gives this gradient."),
    ("backprop", "b6", "We can check it: we change the weight by a tiny amount and measure the loss again. The two values agree."),

    ("train", "t1", "Now we train the network. Each step uses only a small part of the training data."),
    ("train", "t2", "We split the 150 training points into mini-batches of 16. Each mini-batch gives one step of gradient descent."),
    ("train", "t3", "Thus, one epoch has ten steps. Small batches make each step fast, but a little noisy."),
    ("train", "t4", "This curve shows the loss after each epoch. It goes down fast at first, and then more slowly."),
    ("train", "t5", "Now look at the boundary. At the start, the random weights give a boundary that is almost useless."),
    ("train", "t6", "After a few epochs, the boundary bends. After 300 epochs, it follows the shape of the moons."),
    ("train", "t7", "Then we measure the accuracy on test points that the network never saw."),
    ("train", "t8", "Remember: a network is layers of neurons. The activation makes curves, and backpropagation finds the gradients."),
    ("train", "t9", "In the next episode, we take a trained model out of the notebook and into production."),
]

# TTS only; subtitles keep the written form.
SPOKEN = [
    ("ReLU", "ray loo"),
    ("Backpropagation", "Back propagation"),
    ("backpropagation", "back propagation"),
    ("mini-batches", "mini batches"),
    ("mini-batch", "mini batch"),
]

EXAMPLES = [
    {
        "title": "A neural network from scratch",
        "file": "ep4_mlp_numpy.py",
        "ran": True,
        "about": "The network on screen: 2 inputs, 8 ReLU neurons, 1 sigmoid output. The forward pass, the backward pass and the mini-batch steps are all written out in NumPy.",
    },
    {
        "title": "The same task with scikit-learn",
        "file": "ep4_mlp_sklearn.py",
        "ran": True,
        "about": "MLPClassifier builds the same shape of network. It runs three times with different random start weights, next to logistic regression. A small network can stop in a poor place, so the seed matters.",
    },
]

SOURCES = [
    {"label": "Neurons, layers, activation functions, backpropagation",
     "text": "Google Machine Learning Crash Course, Neural networks module.",
     "url": "https://developers.google.com/machine-learning/crash-course/neural-networks"},
    {"label": "Backpropagation",
     "text": "Rumelhart, Hinton and Williams, Learning representations by back-propagating errors, Nature 323 (1986).",
     "url": "https://www.nature.com/articles/323533a0"},
    {"label": "Two moons data, MLPClassifier",
     "text": "scikit-learn user guide: make_moons and Neural network models (supervised).",
     "url": "https://scikit-learn.org/stable/modules/neural_networks_supervised.html"},
    {"label": "Numbers on screen",
     "text": "200 points from make_moons (noise 0.2, seed 0): 150 for training, 50 for the test. The build script trains the network on screen and computes every boundary, loss and gradient that you see.",
     "url": None},
]

# ---------------------------------------------------------------- numbers for the scenes
NOISE, DATA_SEED, INIT_SEED = 0.2, 0, 1
H, LR, BATCH, EPOCHS = 8, 0.5, 16, 300
SNAP = [0, 5, 20, 60, 300]                      # epochs at which the scenes show the boundary
EXT = (-1.5, 2.5, -1.1, 1.6)                    # x0, x1, y0, y1 of the boundary images
GW, GH = 40, 27                                 # boundary image size in cells (kept small for the page)


def r(v, n=3):
    if isinstance(v, (list, tuple, np.ndarray)):
        return [r(x, n) for x in v]
    return round(float(v), n)


def data():
    from sklearn.datasets import make_moons
    from sklearn.model_selection import train_test_split
    X, y = make_moons(n_samples=200, noise=NOISE, random_state=DATA_SEED)
    return train_test_split(X, y, test_size=50, random_state=0)


def _sig(z):
    return 1 / (1 + np.exp(-z))


def _loss(p, y):
    p = np.clip(p, 1e-7, 1 - 1e-7)
    return float(-np.mean(y * np.log(p) + (1 - y) * np.log(1 - p)))


def train(relu=True):
    """Same steps as examples/ep4_mlp_numpy.py. Returns the snapshots, the loss after each epoch and the test accuracy."""
    X_tr, X_te, y_tr, y_te = data()
    rng = np.random.default_rng(INIT_SEED)
    P = {"W1": rng.normal(0, np.sqrt(2 / 2), (2, H)), "b1": np.zeros(H),
         "W2": rng.normal(0, np.sqrt(2 / H), (H, 1)), "b2": np.zeros(1)}

    def forward(X):
        z1 = X @ P["W1"] + P["b1"]
        a1 = np.maximum(z1, 0) if relu else z1
        return z1, a1, _sig((a1 @ P["W2"] + P["b2"])[:, 0])

    gx = np.linspace(EXT[0], EXT[1], GW)
    gy = np.linspace(EXT[3], EXT[2], GH)          # top row first
    G = np.array([[x, y] for y in gy for x in gx])

    def snap(epoch):
        p_tr = forward(X_tr)[2]
        return {"epoch": epoch, "acc": r(np.mean((p_tr > 0.5) == y_tr), 3),
                "grid": [int(round(v * 100)) for v in forward(G)[2]]}

    init = {k: v.copy() for k, v in P.items()}
    losses, snaps = [_loss(forward(X_tr)[2], y_tr)], [snap(0)]
    for epoch in range(1, EPOCHS + 1):
        order = rng.permutation(len(X_tr))
        for start in range(0, len(X_tr), BATCH):
            idx = order[start:start + BATCH]
            xb, yb = X_tr[idx], y_tr[idx]
            z1, a1, p = forward(xb)
            dz2 = (p - yb)[:, None] / len(xb)
            dW2, db2 = a1.T @ dz2, dz2.sum(axis=0)
            dz1 = (dz2 @ P["W2"].T) * ((z1 > 0) if relu else 1)
            dW1, db1 = xb.T @ dz1, dz1.sum(axis=0)
            for k, g in (("W1", dW1), ("b1", db1), ("W2", dW2), ("b2", db2)):
                P[k] -= LR * g
        losses.append(_loss(forward(X_tr)[2], y_tr))
        if epoch in SNAP:
            snaps.append(snap(epoch))
    test_acc = float(np.mean((forward(X_te)[2] > 0.5) == y_te))
    return {"P": P, "init": init, "snaps": snaps, "losses": losses, "test_acc": test_acc}


def nums() -> dict:
    from sklearn.linear_model import LogisticRegression
    X_tr, X_te, y_tr, y_te = data()
    n_params = 2 * H + H + H * 1 + 1
    steps = -(-len(X_tr) // BATCH)
    # the narration says these numbers; keep them true
    assert n_params == 33 and len(X_tr) == 150 and BATCH == 16 and steps == 10 and EPOCHS == 300 and H == 8

    lr_model = LogisticRegression().fit(X_tr, y_tr)
    w, b = lr_model.coef_[0], lr_model.intercept_[0]

    net = train(relu=True)
    lin = train(relu=False)
    P = net["P"]

    # One hidden neuron and one point (its coordinates rounded to 2 decimals), for the neuron and forward-pass
    # scenes. Choose a point where the arithmetic on screen (2 decimals) adds up exactly.
    j = int(np.argmax(np.abs(P["W1"]).sum(axis=0)))
    wj, bj = P["W1"][:, j], float(P["b1"][j])

    def shown(x):
        prods = [round(float(wj[i] * x[i]), 2) for i in range(2)]
        z = float(x @ wj + bj)
        ok = (abs(round(sum(prods) + round(bj, 2), 2) - round(z, 2)) < 1e-9
              and all(abs(round(round(float(wj[i]), 2) * x[i], 2) - prods[i]) < 1e-9 for i in range(2)))
        return prods, z, ok

    z_all = X_tr @ wj + bj
    x0 = x_neg = None
    for k in np.argsort(-z_all):                   # large positive sums first
        xr = np.round(X_tr[k], 2)
        prods, z, ok = shown(xr)
        if ok and 1.0 < z < 2.5:
            x0, z0, prods0 = xr, z, prods
            break
    for k in np.argsort(z_all):                    # a point with a negative sum, for ReLU -> 0
        xr = np.round(X_tr[k], 2)
        z = float(xr @ wj + bj)
        if -1.5 < z < -0.4:
            x_neg, z_neg = xr, z
            break
    assert x0 is not None and x_neg is not None
    z1f = x0 @ P["W1"] + P["b1"]                   # forward pass of x0 through the trained network
    a1f = np.maximum(z1f, 0)
    pf = float(_sig(a1f @ P["W2"][:, 0] + P["b2"][0]))

    # backprop vs a numerical check, at the start (whole training set), for the first-layer weight
    # with the largest gradient
    I = net["init"]

    def full_loss(W1):
        z1 = X_tr @ W1 + I["b1"]
        a1 = np.maximum(z1, 0)
        return _loss(_sig((a1 @ I["W2"] + I["b2"])[:, 0]), y_tr)

    z1 = X_tr @ I["W1"] + I["b1"]
    a1 = np.maximum(z1, 0)
    p = _sig((a1 @ I["W2"] + I["b2"])[:, 0])
    dz2 = (p - y_tr)[:, None] / len(X_tr)
    dW1 = X_tr.T @ ((dz2 @ I["W2"].T) * (z1 > 0))
    gi, gj = (int(v) for v in np.unravel_index(np.argmax(np.abs(dW1)), dW1.shape))
    eps = 1e-5
    Wp, Wm = I["W1"].copy(), I["W1"].copy()
    Wp[gi, gj] += eps
    Wm[gi, gj] -= eps
    num_grad = (full_loss(Wp) - full_loss(Wm)) / (2 * eps)

    return {
        "X": r(X_tr, 2), "y": [int(v) for v in y_tr],
        "X_te": r(X_te, 2), "y_te": [int(v) for v in y_te],
        "ext": list(EXT), "gw": GW, "gh": GH,
        "lr_w": r(w, 4), "lr_b": r(b, 4),
        "lr_train_acc": r(lr_model.score(X_tr, y_tr), 3), "lr_test_acc": r(lr_model.score(X_te, y_te), 3),
        "neuron": {"j": j, "w": r(wj, 2), "b": r(bj, 2), "x": r(x0, 2), "prods": prods0,
                   "z": r(z0, 2), "a": r(max(z0, 0.0), 2), "x_neg": r(x_neg, 2), "z_neg": r(z_neg, 2)},
        "fwd": {"x": r(x0, 2), "a1": r(a1f, 2), "p": r(pf, 3)},
        "W1": r(P["W1"], 3), "b1": r(P["b1"], 3),
        "n_params": n_params, "hidden": H, "batch": BATCH, "n_train": len(X_tr), "steps": steps,
        "epochs": EPOCHS, "lr": LR,
        "snaps": net["snaps"], "losses": r(net["losses"], 3), "test_acc": r(net["test_acc"], 3),
        "lin_grid": lin["snaps"][-1]["grid"], "lin_train_acc": lin["snaps"][-1]["acc"], "lin_test_acc": r(lin["test_acc"], 3),
        "grad_w": [gi, gj], "grad_w0": r(I["W1"][gi, gj], 3),
        "grad_bp": r(dW1[gi, gj], 7), "grad_num": r(num_grad, 7), "eps": eps,
    }
