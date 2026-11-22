# ep11 research: agents in depth (ReAct, planning, memory, context engineering, multi-agent, harness)

Base: https://www.dailydoseofds.com (paths below). Status:

| id | path | status |
|----|------|--------|
| A | /p/5-agentic-ai-design-patterns/ | full |
| B | /p/5-levels-of-agentic-ai-systems/ | full |
| C | /p/the-anatomy-of-an-agent-harness/ | full |
| D | /p/building-a-context-engineering-workflow/ | full (code linked out) |
| E | /p/build-agents-that-never-forget/ | full |
| F | /p/hands-on-agent-memory-is-only-as-good-as-its-schema/ | full (code in embeds) |
| G | /p/why-your-agent-remembers-everything-and-understands-nothing-2/ | full |
| H | /p/claude-subagents-vs-agent-teams/ | full |
| I | /p/advisor-strategy-in-agents/ | full |
| J | /ai-agents-crash-course-part-10-with-implementation/ (ReAct) | partial, paywall after the concept section |
| K | /ai-agents-crash-course-part-11-with-implementation/ (planning) | partial, paywall after "Why planning?" |
| L | /ai-agents-crash-course-part-12-with-implementation/ (multi-agent) | partial, paywall after internals intro |
| M | /llmops-crash-course-part-8/ (memory, temporal context) | partial, paywall after "Memory aging" |

E, F, G promote products (Cognee, Zep); I describes Anthropic's API. Treat their benchmark claims as the authors' claims.

## Concepts (own-word digest)

- Agent harness (C): the software layer around the LLM: loop, tools, memory, context management, state, error
  handling, guardrails. The agent is the behaviour that results; the harness is the machinery. Analogy (C): LLM = CPU,
  context window = RAM, external store = disk, tools = drivers, harness = operating system.
- Three nested disciplines (C): prompt engineering (the instructions), context engineering (what the model sees, and
  when), harness engineering (the rest: orchestration, recovery, verification, safety).
- Context engineering (D, C, E): build a system that supplies the right information, tools and format. The context is
  a limited budget; content in the middle of a long window is used less well than content at the start or end.
- Levels of agency (B): 1 basic responder (a human guides the flow); 2 router (the LLM picks a path); 3 tool calling
  (the LLM picks the tool and the arguments); 4 multi-agent (a manager agent coordinates workers); 5 autonomous (the
  LLM writes and runs new code).
- Patterns (A): reflection (the model reviews and improves its own output), tool use, ReAct, planning, multi-agent.
- ReAct (A, J, C): a loop of Thought, Action, Observation, repeated until a final answer. It works through a prompt
  template plus output parsing, not a special model feature. C calls the same cycle assemble prompt, call LLM, parse,
  run tools, feed results back, repeat.
- Planning (A, K): write a roadmap first (split the task, set sub-goals), then execute; plans may change on the way.
  ReAct suits simple or uncertain steps; planning suits multi-step tasks where a global view stops wandering.
- Multi-agent (A, H, L): several agents, each with a role, a task and tools; benefits: modularity, specialization,
  traceable errors. Orchestration patterns (H): prompt chaining, routing, parallelization (sectioning or voting),
  orchestrator-worker, evaluator-optimizer. H: sub-agents are short-lived workers that return only a result and cannot
  talk to each other; agent teams are persistent and message each other through a shared task list.
  H also says: do not use multi-agent when one agent is enough.
- Memory (E, M, C): short-term = the history in the prompt (fast, limited; trim or summarize). Long-term = external
  storage that must be retrieved and put into the prompt (like RAM vs disk). Long-term kinds (E): episodic (events),
  semantic (facts), procedural (skills/workflows). Storage ladder (E): a list, then files, then vector search, then a
  knowledge graph; each step fixes one problem and shows another (vector search misses multi-hop links).
  Memory management (M): when to retrieve, what to cache, prune and de-duplicate, keep full logs vs summaries.
- Advisor strategy (I): a cheaper executor model asks a stronger advisor only when stuck.

Explanation order the pages use: levels / patterns -> harness and context -> memory -> multi-agent -> when not to.

## Conflicts and gaps (do not copy numbers)

- The ReAct, planning and multi-agent implementations are paywalled. Write your own small loop; do not imitate a
  vendor's framework API.
- Numbers on these pages (">30 % accuracy drop mid-context", "3.6x speedup", "41.2 % vs 19.7 %") are second-hand claims.
  Do not use them.
- Two terms vary: "agent team" vs "crew"; "harness". Define each term once on screen, then keep to it.

## Primary sources to cite

- Yao et al. 2022, ReAct: https://arxiv.org/abs/2210.03629
- Wang et al. 2023, Plan-and-Solve prompting: https://arxiv.org/abs/2305.04091
- Shinn et al. 2023, Reflexion: https://arxiv.org/abs/2303.11366
- Anthropic, Building effective agents: https://www.anthropic.com/engineering/building-effective-agents
- Anthropic docs, tool use: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
- Liu et al. 2023, Lost in the Middle: https://arxiv.org/abs/2307.03172
- Park et al. 2023, Generative Agents (memory stream): https://arxiv.org/abs/2304.03442
- Verify each id/title with a fetch before you cite it.

## Offline example ideas (no API key, no network: use a clearly named scripted "model" stub)

- A ReAct loop in about 40 lines with a scripted stub model that emits Thought / Action / Observation text; real tools
  (a calculator, a lookup over a small dict) run for real; print the full trace.
- Plan-and-execute with the same stub: a plan list, executing step by step, a re-plan after a failed step.
- A memory store: short-term window with trimming to a token budget; long-term store with TF-IDF retrieval
  (reuse the idea from ep7); print what is retrieved for three questions.
- A context-budget packer: choose which items fit in N tokens (system, tools, memory, history); print what is dropped.
- Orchestrator-worker with two stub workers; print the message flow.
- Anything that needs a real model API: label it "not run" with why_not_run, as ep7 does.
