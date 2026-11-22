"""Episode 9 - Alignment and reasoning (deep dive)."""
import importlib.util
import sys

import numpy as np

from common import EXAMPLES as EXAMPLES_DIR

EPISODE = {
    "id": "ep9",
    "n": 9,
    "level": "Deep dive",
    "title": "Alignment and reasoning",
    "blurb": "Supervised fine-tuning copies examples. A reward model, RLHF, verifiable rewards and GRPO let a model "
             "learn from a score, and this is how reasoning models learn.",
}

CHAPTERS = [
    ("imitate", "Beyond imitation"),
    ("reward", "The reward model"),
    ("rlhf", "RLHF with PPO"),
    ("verify", "Verifiable rewards"),
    ("grpo", "GRPO and reasoning models"),
]

SEGMENTS = [
    ("imitate", "i1", "In episode 8, you saw supervised fine-tuning. The model learns from examples of good answers."),
    ("imitate", "i2", "But a model that copies examples cannot become better than its examples."),
    ("imitate", "i3", "It is easier to pick the better of two answers than to write a perfect answer."),
    ("imitate", "i4", "So people see two answers to one prompt and pick the better one. Each pick gives a pair: a chosen answer and a rejected answer."),

    ("reward", "w1", "A reward model reads a prompt and an answer. It gives one number, the reward."),
    ("reward", "w2", "A real reward model is an LLM with a new output layer. Here, we use a toy with three features."),
    ("reward", "w3", "The chance that answer A beats answer B is the sigmoid of the difference between the two rewards."),
    ("reward", "w4", "The loss is small when the chosen answer gets the higher reward. It is large in the other case."),
    ("reward", "w5", "Training changes the weights to lower the loss. On new pairs, the model then agrees with people most of the time."),

    ("rlhf", "l1", "In RLHF, the model is the policy. It writes an answer, and the reward model scores it. The update raises the score."),
    ("rlhf", "l2", "But the reward model is not perfect. The policy can find answers that fool it. This is a reward hack."),
    ("rlhf", "l3", "So we subtract a penalty from the reward. It grows when the policy moves away from the reference model, a copy from before RL."),
    ("rlhf", "l4", "A number, beta, sets the strength. A strong penalty keeps the policy near the reference. A weak one lets it chase the bad answer."),
    ("rlhf", "l5", "PPO takes small steps. It clips the change in the probability of each answer."),
    ("rlhf", "l6", "A typical PPO setup holds four models. The policy and the critic learn. The critic predicts the reward. The reward model and the reference stay fixed."),
    ("rlhf", "l7", "DPO is a shortcut. It trains on the pairs directly, with no separate reward model and no RL loop."),

    ("verify", "v1", "For maths and code, a program can check the answer. This is a verifiable reward. It needs no reward model."),
    ("verify", "v2", "Here the question is 17 times 6. The program reads the number in the answer tag and compares it with 102."),
    ("verify", "v3", "A second reward checks the format. The steps go in the think tag, and the result in the answer tag."),
    ("verify", "v4", "The total reward is the sum. Only a right answer in the right format gets the highest total."),
    ("verify", "v5", "These two rewards score only the final answer. This is outcome reward."),
    ("verify", "v6", "Process reward scores each step, so it finds the first wrong step."),

    ("grpo", "g1", "GRPO is a simpler way to do RL. It has no critic."),
    ("grpo", "g2", "For each prompt, the policy writes a group of G answers. Here, G is 8."),
    ("grpo", "g3", "The verifier gives each answer a reward, 1 or 0. The mean reward of the group is the baseline."),
    ("grpo", "g4", "The advantage of an answer is its reward minus the mean, divided by the standard deviation."),
    ("grpo", "g5", "A better answer gets a positive advantage, so it becomes more likely. A worse answer gets a negative advantage."),
    ("grpo", "g6", "Now take a group with only wrong answers. All advantages are 0, so there is no signal."),
    ("grpo", "g7", "Repeat for many groups. The chance of the right answer rises with every step."),
    ("grpo", "g8", "DeepSeek-R1 used GRPO with rule-based rewards. Its model learned to write longer answers that check their own work."),
    ("grpo", "g9", "Next, in episode 10, you learn how to run the model fast and at low cost."),
]

# TTS only: the subtitles keep the written form.
SPOKEN = [
    ("DeepSeek-R1", "Deep Seek R 1"),
    ("GRPO", "G R P O"),
    ("PPO", "P P O"),
    ("DPO", "D P O"),
    ("RL", "R L"),
    ("answer A", "answer ay"),
    ("answer B", "answer bee"),
    ("verifiable", "verify able"),
]

EXAMPLES = [
    {
        "title": "A reward model from pairs",
        "file": "ep9_reward_model.py",
        "ran": True,
        "about": "A toy reward model: an answer is three numbers, and a hidden rule with noise picks the better answer of each "
                 "pair. The model learns a reward from 400 pairs with the loss -log sigmoid(chosen - rejected). The script "
                 "prints how often it agrees with the people on 400 new pairs, and the limit that the noise sets.",
    },
    {
        "title": "The KL penalty and the PPO clip",
        "file": "ep9_rlhf_kl.py",
        "ran": True,
        "about": "One prompt with five candidate answers. One answer fools the reward model. For three values of beta the script "
                 "computes the best policy (a closed form that it checks against 20,000 random policies), then prints the "
                 "reward model score and the true quality. It also prints the PPO clipped objective.",
    },
    {
        "title": "A verifiable reward",
        "file": "ep9_verifier.py",
        "ran": True,
        "about": "A rule-based accuracy reward (the number in the answer tag) and a format reward (think tag, then answer tag), "
                 "run on five replies. A step checker then does a process reward: it checks the arithmetic in every line.",
    },
    {
        "title": "GRPO on a toy policy",
        "file": "ep9_grpo_toy.py",
        "ran": True,
        "about": "A policy over six candidate answers to 17 * 6. Each step samples a group of 8 answers, rewards them with the "
                 "verifier, computes group-relative advantages, and updates the policy. It prints how the chance of the right "
                 "answer grows, and what happens to a group where all rewards are equal.",
    },
]

SOURCES = [
    {"label": "Reward model from human comparisons; PPO with a KL penalty",
     "text": "Ouyang et al. 2022, Training language models to follow instructions with human feedback (InstructGPT). "
             "The reward model learns which output people prefer. PPO adds a per-token KL penalty from the SFT model.",
     "url": "https://arxiv.org/abs/2203.02155"},
    {"label": "Chance that answer A beats answer B",
     "text": "Bradley and Terry 1952, Rank analysis of incomplete block designs: the method of paired comparisons (Biometrika 39). "
             "The reward model in RLHF uses this model of pairwise choices.",
     "url": None},
    {"label": "PPO and the clipped objective",
     "text": "Schulman et al. 2017, Proximal Policy Optimization Algorithms. Table 1 compares clip ranges: 0.2 gave the best "
             "average score of the values that the paper tried.",
     "url": "https://arxiv.org/abs/1707.06347"},
    {"label": "GRPO: group-relative advantage, no critic",
     "text": "Shao et al. 2024, DeepSeekMath. GRPO is a variant of PPO that uses the scores of a group of sampled answers as the baseline.",
     "url": "https://arxiv.org/abs/2402.03300"},
    {"label": "Rule-based rewards and reasoning models",
     "text": "DeepSeek-AI 2025, DeepSeek-R1. Two rule-based rewards (accuracy and format), GRPO, and longer answers "
             "with verification and reflection.",
     "url": "https://arxiv.org/abs/2501.12948"},
    {"label": "DPO",
     "text": "Rafailov et al. 2023, Direct Preference Optimization. It trains on preference pairs with a simple classification "
             "loss and has no sampling loop.",
     "url": "https://arxiv.org/abs/2305.18290"},
    {"label": "Topic map and cross-check (not a source of any number)",
     "text": "Daily Dose of Data Science, Build a reasoning LLM using GRPO. We used the public article to check the order "
             "of the GRPO steps. The course lessons on the same site are for paid members, so we did not use them.",
     "url": "https://www.dailydoseofds.com/p/build-a-reasoning-llm-using-grpo/"},
    {"label": "Numbers on screen",
     "text": "Every number comes from running the four example files during the build. All of them are toys: three features, "
             "five candidate answers, six candidate answers. They show the method, not the size of a real run. The text of "
             "the example answers (the tide, 17 * 6) is only an illustration.",
     "url": None},
]


def r(v, n=3):
    if isinstance(v, (list, tuple, np.ndarray)):
        return [r(x, n) for x in v]
    return round(float(v), n)


def _load(name: str):
    """Import an example file (examples/ is not a package)."""
    if str(EXAMPLES_DIR) not in sys.path:
        sys.path.insert(0, str(EXAMPLES_DIR))
    spec = importlib.util.spec_from_file_location(name, EXAMPLES_DIR / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def nums() -> dict:
    rm = _load("ep9_reward_model")
    kl = _load("ep9_rlhf_kl")
    ver = _load("ep9_verifier")
    gr = _load("ep9_grpo_toy")

    # The narration says "17 times 6", "102" and "G is 8": keep it in step with the examples.
    assert ver.TRUTH == 102 and "17 * 6" in ver.QUESTION, "narration v2 says 17 times 6 and 102"
    assert gr.G == 8, "narration g2 says G is 8"

    # --- reward model: train, then pick one new pair for the worked example
    out = rm.train()
    hist, w = out["hist"], out["w"]
    te_c, te_r = out["test"]
    d = (te_c - te_r) @ w
    k = next(i for i in range(len(d)) if 0.8 <= d[i] <= 1.4)
    feat_a, feat_b = te_c[k], te_r[k]                      # answer A = the chosen one, answer B = the rejected one
    r_a, r_b = float(feat_a @ w), float(feat_b @ w)
    xs = np.linspace(-4, 4, 81)
    rmod = {
        "features": rm.FEATURES, "n_train": rm.N_TRAIN, "n_test": rm.N_TEST, "epochs": rm.EPOCHS,
        "feat_a": r(feat_a, 2), "feat_b": r(feat_b, 2), "r_a": r(r_a, 2), "r_b": r(r_b, 2),
        "diff": r(r_a - r_b, 2), "p_a": r(rm.sigmoid(r_a - r_b), 2),
        "loss_right": r(np.log1p(np.exp(-(r_a - r_b))), 2), "loss_wrong": r(np.log1p(np.exp(r_a - r_b)), 2),
        "curve_x": r(xs, 2), "curve_y": r(np.log1p(np.exp(-xs)), 3),
        "hist_loss": r([h["loss"] for h in hist], 3),                   # rounded once, to the digits that the screen shows
        "hist_acc": r([h["test_acc"] * 100 for h in hist], 1),           # percent
        "hist_w": r([h["w"] for h in hist], 2),
        "w": r(w, 2), "acc_start": r(hist[0]["test_acc"] * 100, 1), "acc_end": r(hist[-1]["test_acc"] * 100, 1),
        "ceiling": r(rm.ceiling() * 100, 1),
    }

    # --- RLHF: the KL toy and the PPO clip
    rows = [{"label": "reference", "beta": None, **kl.summary(kl.REF)}]
    rows += [{"label": f"beta = {b}", "beta": b, **kl.summary(kl.best_policy(b))} for b in kl.BETAS]
    ratios = np.linspace(0.4, 1.6, 61)
    kln = {
        "cands": [{"name": n, "true": r(t, 2), "rm": r(s, 2), "ref": r(p, 2)} for n, t, s, p in kl.CANDIDATES],
        "settings": [{"label": x["label"], "beta": x["beta"], "p": r(x["p"], 4), "p2": r(x["p"], 2), "rm": r(x["rm"], 2),
                      "true": r(x["true"], 2), "kl": r(x["kl"], 2)} for x in rows],
        "eps": kl.PPO_EPS, "ratio": r(ratios, 2),
        "clip_pos": r(kl.ppo_clip(ratios, 1.0), 3), "clip_neg": r(kl.ppo_clip(ratios, -1.0), 3),
    }
    assert kln["settings"][-1]["rm"] > kln["settings"][0]["rm"] and kln["settings"][-1]["true"] < kln["settings"][0]["true"], \
        "narration l2/l4: a weak penalty raises the reward model score and lowers the true quality"

    # --- verifiable rewards
    replies = []
    for label, text in ver.REPLIES:
        replies.append({"label": label, "text": text, **{k2: r(v, 1) for k2, v in ver.total_reward(text).items()}})
    vern = {
        "question": ver.QUESTION, "truth": ver.TRUTH, "acc_w": ver.ACC_W, "fmt_w": ver.FMT_W, "replies": replies,
        "steps_bad": ver.check_steps(ver.REPLIES[1][1]), "steps_good": ver.check_steps(ver.REPLIES[0][1]),
        "answer_bad": ver.REPLIES[1][0],
    }
    assert [x["ok"] for x in vern["steps_bad"]].count(False) == 1 and all(x["ok"] for x in vern["steps_good"])

    # --- GRPO toy
    run = gr.run()
    steps = run["steps"]
    demo = next(s for s in steps if sum(s["rewards"]) == 2)             # a group with 2 right answers
    zero = next(s for s in steps if s["zero_signal"] and s["mean"] == 0)  # a group with no right answer

    def group(s):
        return {"step": s["step"], "answers": [gr.ANSWERS[i] for i in s["picks"]], "rewards": r(s["rewards"], 1),
                "mean": r(s["mean"], 2), "std": r(s["std"], 2), "adv": r(s["adv"], 2),
                "p_before": r(s["p_correct"], 3), "p_after": r(s["p_after"], 3)}

    grn = {
        "G": gr.G, "steps": gr.STEPS, "answers": gr.ANSWERS, "correct": gr.ANSWERS[gr.CORRECT], "eps": gr.EPS,
        "demo": group(demo), "zero": group(zero),
        "p_hist": r([s["p_correct"] for s in steps] + [run["p_final"]], 3),
        "p_start": r(steps[0]["p_correct"], 3), "p_end": r(run["p_final"], 3),
        "all_wrong": int(sum(s["zero_signal"] and s["mean"] == 0 for s in steps)),
        "all_right": int(sum(s["zero_signal"] and s["mean"] == 1 for s in steps)),
    }
    assert grn["p_end"] > grn["p_start"], "narration g7: the chance rises"

    return {"rm": rmod, "kl": kln, "ver": vern, "grpo": grn,
            "tide": {"prompt": "What is a tide?",
                     "a": "The sea rises and falls. The pull of the moon is the main cause.",
                     "b": "Tides come from the wind that blows over the sea."}}
