"""Episode 11 - Agents in depth (deep dive). Episode 12 closes the series."""
import importlib.util
import sys

import numpy as np

from common import EXAMPLES as EXAMPLES_DIR

EPISODE = {
    "id": "ep11",
    "n": 11,
    "level": "Deep dive",
    "title": "Agents in depth",
    "blurb": "An agent repeats a loop of thought, action and observation. A plan, a managed context, a memory and "
             "a team of workers make the loop work on bigger tasks.",
}

CHAPTERS = [
    ("loop", "The agent loop"),
    ("plan", "Planning"),
    ("context", "Context engineering"),
    ("memory", "Memory"),
    ("team", "Many agents"),
]

SEGMENTS = [
    ("loop", "a1", "In episode 7, you built a loop. The model asks for a tool, and your code runs it."),
    ("loop", "a2", "ReAct is a standard form of this loop. The model writes a thought and an action. Your code runs the action and adds the observation."),
    ("loop", "a3", "The loop ends when the model writes a final answer. Here, the answer comes after four tool calls."),
    ("loop", "a4", "Always set a step limit. Then a confused model cannot repeat one action forever."),
    ("loop", "a5", "A workflow has fixed steps. A router lets the model pick a path. An agent chooses its own steps. Many agents share the work."),
    ("loop", "a6", "More freedom means more risk, so start at the lowest level that works."),

    ("plan", "p1", "ReAct picks one step at a time. On a long task, the model can forget the goal."),
    ("plan", "p2", "Another pattern is a plan. The model writes a list of steps, and your code runs them in order."),
    ("plan", "p3", "Sometimes a step fails. Here, express delivery is not available in this city. Your code asks the model for a new plan."),
    ("plan", "p4", "The new plan uses standard delivery. Use ReAct for short or uncertain tasks. Use a plan for long tasks."),

    ("context", "c1", "The context is the text that the model reads in one request. Its size limit is a budget."),
    ("context", "c2", "Many parts compete for this budget: the system prompt, the tool definitions, the memory, the history, and the retrieved text."),
    ("context", "c3", "The history grows with each round. When the budget is full, your code must trim or summarize old messages."),
    ("context", "c4", "Put the stable text first, so that a cache can reuse it, as in episode 10."),
    ("context", "c5", "Put key facts at the start or at the end. A model often misses facts in the middle."),
    ("context", "c6", "The harness does this work. It is the code around the model, and it builds the context."),

    ("memory", "m1", "The conversation in the prompt is short-term memory. The context limit caps its size."),
    ("memory", "m2", "Long-term memory is storage outside the model. Your code saves notes, finds the notes that fit a question, and adds them to the prompt."),
    ("memory", "m3", "There are three kinds of notes. An episodic note records an event. A semantic note holds a fact. A procedural note says how to do a task."),
    ("memory", "m4", "Frame size finds a fact. An old return finds an event. The return process finds a procedure."),
    ("memory", "m5", "A store can be a list, files, a vector index, or a graph. Each fixes one problem and shows another. A vector index can miss an answer that needs two linked notes."),

    ("team", "t1", "Some tasks have parts that do not need each other. Many agents can share them."),
    ("team", "t2", "One agent is the orchestrator. It gives each part to a worker, an agent with one job. A worker sees only its own job."),
    ("team", "t3", "A worker sends back only its result. The orchestrator joins the results."),
    ("team", "t4", "Workers are specialists, and they can run at the same time. Each context stays small."),
    ("team", "t5", "It also has costs. You make more model calls, and errors are harder to trace. If one agent is enough, use one agent."),
    ("team", "t6", "Test every change with evals, as in episode 7."),
    ("team", "t7", "You have now seen eleven of the twelve episodes. You went from a line and a loss to classifiers, networks, and production."),
    ("team", "t8", "You looked inside an LLM and built with one. Then you went deeper: fine-tuning, alignment, fast inference, and agents."),
    ("team", "t9", "One episode is left: advanced RAG and evals. It shows how to find the right text and how to measure the result."),
]

# TTS only: the subtitles keep the written form.
SPOKEN = [
    ("ReAct", "re act"),
    ("evals", "ee vals"),
]

EXAMPLES = [
    {
        "title": "A ReAct loop",
        "file": "ep11_react_loop.py",
        "ran": True,
        "about": "The loop from the video in about 60 lines. The model writes a thought and an action, your code runs the "
                 "action (a lookup tool and a calculator, both real) and adds the observation to the prompt. A step limit "
                 "stops a confused loop. The model is ScriptedModel, a stand-in that follows fixed rules, so the file runs "
                 "offline. Replace it with one LLM call to use a real model.",
    },
    {
        "title": "Plan, run, re-plan",
        "file": "ep11_plan_execute.py",
        "ran": True,
        "about": "The planner writes a list of steps once. Plain code runs them. When a step fails, the planner writes a "
                 "new plan for the steps that are left. The planner is a scripted stand-in, and it counts its calls.",
    },
    {
        "title": "Short-term and long-term memory",
        "file": "ep11_memory.py",
        "ran": True,
        "about": "Short-term: trim the conversation to a token budget (the oldest messages go first). Long-term: six notes "
                 "of three kinds, found by TF-IDF similarity (as in episode 7) and added to the prompt. Tokens are counted "
                 "with a simple rule of 4 characters for each token, not with a real tokenizer.",
    },
    {
        "title": "An orchestrator and two workers",
        "file": "ep11_orchestrator.py",
        "ran": True,
        "about": "One orchestrator splits a task and gives two jobs to two workers. Each worker has its own context and "
                 "sends back only a result. The same task then runs with one agent, so you can compare the context sizes "
                 "and the number of model calls. All models are scripted stand-ins.",
    },
]

SOURCES = [
    {"label": "ReAct: thought, action, observation",
     "text": "Yao et al. 2022, ReAct: Synergizing Reasoning and Acting in Language Models.",
     "url": "https://arxiv.org/abs/2210.03629"},
    {"label": "Plan first, then run the steps",
     "text": "Wang et al. 2023, Plan-and-Solve Prompting: first a plan that divides the task into subtasks, then the subtasks.",
     "url": "https://arxiv.org/abs/2305.04091"},
    {"label": "Workflow, router, agent, orchestrator and workers",
     "text": "Anthropic, Building effective agents. It defines workflows (predefined code paths) and agents (the model directs its own process).",
     "url": "https://www.anthropic.com/engineering/building-effective-agents"},
    {"label": "Tools and the agent loop",
     "text": "Anthropic docs, Tool use with Claude.",
     "url": "https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview"},
    {"label": "Facts in the middle of a long context",
     "text": "Liu et al. 2023, Lost in the Middle: How Language Models Use Long Contexts. The curve on screen is a drawing of this idea, not a measurement.",
     "url": "https://arxiv.org/abs/2307.03172"},
    {"label": "Episodic, semantic and procedural memory",
     "text": "Sumers et al. 2023, Cognitive Architectures for Language Agents. It divides long-term memory into these three types.",
     "url": "https://arxiv.org/abs/2309.02427"},
    {"label": "Topic map and cross-check: the harness",
     "text": "Daily Dose of Data Science, The Anatomy of an Agent Harness. Read in full. Used to check the topic list, not as a source of numbers.",
     "url": "https://www.dailydoseofds.com/p/the-anatomy-of-an-agent-harness/"},
    {"label": "Topic map and cross-check: levels of agency",
     "text": "Daily Dose of Data Science, 5 Levels of Agentic AI Systems. Read in full. Used to check the topic list, not as a source of numbers.",
     "url": "https://www.dailydoseofds.com/p/5-levels-of-agentic-ai-systems/"},
    {"label": "Topic map and cross-check: agent memory",
     "text": "Daily Dose of Data Science, Build Agents That Never Forget. Read in full. Used to check the topic list, not as a source of numbers.",
     "url": "https://www.dailydoseofds.com/p/build-agents-that-never-forget/"},
    {"label": "Numbers on screen",
     "text": "The traces, the plans, the token counts, the note scores and the model-call counts come from running the example files "
             "during the build. In every example the model is a scripted stand-in with fixed rules, not an LLM; the tools run for real. "
             "Tokens use a rule of 4 characters for each token, not a real tokenizer. The schematic blocks, the lanes and the "
             "context-position curve are drawings.",
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
    # --- loop: two real runs of the ReAct loop (a scripted model, real tools)
    rl = _load("ep11_react_loop")
    ok = rl.run(rl.QUESTION, rl.ScriptedModel(rl.NEEDS))
    stuck = rl.run(rl.STUCK_QUESTION, rl.ScriptedModel(["ghost_bike_price"]), max_steps=5)
    assert ok["stopped"] == "final answer" and ok["tool_calls"] == 4, "narration a3 says four tool calls"
    assert stuck["stopped"] == "step limit", "narration a4: the loop stops at the step limit"

    # --- plan: the plan, the failed step, the new plan
    pe = _load("ep11_plan_execute")
    planner = pe.ScriptedPlanner()
    plan = pe.execute(pe.TASK, planner)
    assert len(plan["plans"]) == 2 and [e["status"] for e in plan["events"]] == ["ok", "ok", "failed", "ok", "ok"], \
        "narration p3/p4: one step fails, one new plan fixes it"
    assert "express" in plan["events"][2]["result"] and "standard" in plan["events"][3]["step"]

    # --- memory: the trimmed history and the retrieval for three questions
    mem = _load("ep11_memory")
    keep = mem.trim(mem.HISTORY, mem.BUDGET)
    assert not all(keep) and keep[-1], "c3: some old messages go, the newest stays"
    queries = []
    for q in mem.QUESTIONS:
        ranked = mem.recall(q, k=len(mem.NOTES))
        scores = [0.0] * len(mem.NOTES)
        for i, s in ranked:
            scores[i] = s
        queries.append({"q": q, "scores": r(scores, 3), "top": ranked[0][0]})
    kinds = [mem.NOTES[x["top"]][0] for x in queries]
    assert kinds == ["semantic", "episodic", "procedural"], "narration m4: semantic, episodic, procedural"
    system_tokens = mem.tokens(mem.SYSTEM)
    history = [{"role": role, "text": text, "tokens": mem.tokens(text), "keep": bool(k)}
               for (role, text), k in zip(mem.HISTORY, keep)]

    # --- team: the orchestrator run and the one-agent run
    oc = _load("ep11_orchestrator")
    out = oc.orchestrate(oc.TASK)
    one = oc.single_agent(oc.TASK)
    workers = [a for a in out["agents"] if a.name.endswith("worker")]
    assert all(w.context_tokens() < one.context_tokens() for w in workers), "t5: each worker context is smaller"
    assert out["model_calls"] > one.model_calls, "t6: more model calls with workers"

    def agent(a):
        return {"name": a.name, "tokens": a.context_tokens(), "calls": a.model_calls,
                "messages": [{"role": role, "text": text, "tokens": oc.tokens(text)} for role, text in a.context]}

    return {
        "react": {"question": rl.QUESTION, "steps": ok["steps"], "answer": ok["answer"],
                  "model_calls": ok["model_calls"], "tool_calls": ok["tool_calls"]},
        "stuck": {"question": rl.STUCK_QUESTION, "steps": stuck["steps"], "limit": 5, "stopped": stuck["stopped"]},
        "plan": {"task": pe.TASK,
                 "plans": [[{"label": pe.label(s), "tool": s["tool"]} for s in p] for p in plan["plans"]],
                 "events": plan["events"], "answer": r(plan["answer"], 2), "model_calls": plan["model_calls"]},
        "mem": {"budget": mem.BUDGET, "system_tokens": system_tokens, "history": history,
                "kept_tokens": system_tokens + sum(h["tokens"] for h in history if h["keep"]),
                "all_tokens": system_tokens + sum(h["tokens"] for h in history),
                "notes": [{"kind": k, "text": t} for k, t in mem.NOTES], "queries": queries},
        "orch": {"task": oc.TASK, "flow": out["flow"], "report": out["report"],
                 "agents": [agent(a) for a in out["agents"]], "one": agent(one),
                 "calls": out["model_calls"], "calls_one": one.model_calls},
    }
