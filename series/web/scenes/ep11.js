/* Episode 11 - Agents in depth. Contract: OUTLINE.md. N = episodes/ep11.py nums(). */
SCENES_BY_EP.ep11 = (() => {
  const THOUGHT = C.blue, ACTION = C.yellow, OBS = C.green;
  const KIND = { episodic: C.blue, semantic: C.teal, procedural: C.orange };
  const hide = els => gsap.set(els, { autoAlpha: 0 });
  const cut = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
  function title(sc, text, key) {
    const e = H(sc, text, { y: 78, size: 56, font: "serif", weight: 600 });
    write(e, at(key, 0.1), 1.0);
    return e;
  }
  /* a plain rectangle (no label), hidden until shown */
  function rect(sc, x, y, w, h, color, o = {}) {
    const r = S(sc.svg, "rect", { x, y, width: w, height: h, rx: o.rx ?? 12 },
      { fill: o.fill === undefined ? hexA(color, 0.08) : o.fill, stroke: color, strokeWidth: o.sw || 2.5, strokeDasharray: o.dash || "" });
    hide(r);
    return r;
  }
  function line(sc, x1, y1, x2, y2, color, w = 3, dash = "") {
    const l = S(sc.svg, "line", { x1, y1, x2, y2 }, { stroke: color, strokeWidth: w, strokeDasharray: dash, strokeLinecap: "round" });
    hide(l);
    return l;
  }
  function circle(sc, x, y, r, color, o = {}) {
    const c = S(sc.svg, "circle", { cx: x, cy: y, r }, { fill: o.fill === undefined ? hexA(color, 0.15) : o.fill, stroke: color, strokeWidth: o.sw || 3, strokeDasharray: o.dash || "" });
    hide(c);
    return c;
  }
  /* a text block that keeps its line breaks and wraps at width w; top-left at (x, y) */
  function para(sc, text, x, y, w, o = {}) {
    const e = H(sc, text, { anchor: "left", x, y, size: o.size || 20, color: o.color || C.fg, font: o.font || "mono", wrap: w, align: "left", weight: o.weight });
    e.style.whiteSpace = "pre-wrap";
    e.style.lineHeight = "1.4";
    gsap.set(e, { yPercent: 0 });
    return e;
  }
  const mark = (sc, ok, x, y, size = 28) => H(sc, ok ? "✓" : "✗", { x, y, size, color: ok ? C.green : C.red, weight: 700 });
  const flat = a => a.flat(Infinity);

  /* ---------------------------------------------------------------- 1 the agent loop */
  function loop(sc, N) {
    title(sc, "Agents in depth", "a1");
    const R = N.react;

    // a1: the tool loop of episode 7
    const M = box(sc, 330, 450, 280, 120, C.purple, "model", { size: 36 });
    const Y = box(sc, 1270, 450, 280, 120, C.blue, "your code", { size: 36 });
    const aU = arrow(sc, 480, 420, 1120, 420, C.yellow, 4, 16);
    const aR = arrow(sc, 1120, 480, 480, 480, C.green, 4, 16);
    const lU = H(sc, "tool call", { x: 800, y: 382, size: 26, color: C.yellow });
    const lR = H(sc, "result", { x: 800, y: 522, size: 26, color: C.green });
    const toolChip = chip(sc, "tool", C.orange, { x: 1270, y: 670, size: 28 });
    const aT = arrow(sc, 1270, 515, 1270, 626, C.dim, 3, 12);
    const rec = H(sc, "recap of episode 7: the tool loop", { x: 800, y: 195, size: 26, color: C.dim });
    fadeIn(rec, at("a1", 0.3), 0.4);
    fadeIn(M.els, at("a1", 0.5), 0.5, { dy: 0 });
    fadeIn(Y.els, frac("a1", 0.25), 0.5, { dy: 0 });
    drawArrow(aU, frac("a1", 0.42), 0.6);
    fadeIn(lU, frac("a1", 0.48), 0.3, { dy: 0 });
    drawArrow(aT, frac("a1", 0.68), 0.4);
    fadeIn(toolChip, frac("a1", 0.76), 0.3, { dy: 0 });
    drawArrow(aR, frac("a1", 0.86), 0.5);
    fadeIn(lR, frac("a1", 0.9), 0.3, { dy: 0 });
    fadeOut([...M.els, ...Y.els, aU.line, aU.tip, aR.line, aR.tip, lU, lR, toolChip, aT.line, aT.tip, rec], at("a2", 0), 0.5);

    // a2: ReAct, one round: thought, action, observation
    const re = H(sc, "ReAct", { x: 340, y: 340, size: 120, color: C.yellow, font: "serif", weight: 600 });
    const rs = H(sc, "reason + act", { x: 340, y: 448, size: 30, color: C.dim });
    const card = rect(sc, 640, 190, 800, 450, C.fg, { fill: hexA(C.fg, 0.03), rx: 16 });
    const s0 = R.steps[0];
    const defs = [["Thought", THOUGHT, s0.thought, "model", "body"], ["Action", ACTION, s0.action, "model", "mono"], ["Observation", OBS, s0.observation, "your code", "mono"]];
    const roundRows = defs.map(([label, col, text, who, fnt], i) => {
      const y = 270 + i * 130;
      const c1 = chip(sc, label, col, { x: 770, y, size: 24 });
      const t = para(sc, text, 910, y - 17, 320, { size: 22, font: fnt, color: C.fg });
      const w = chip(sc, who, who === "model" ? C.purple : C.blue, { x: 1360, y, size: 18 });
      return [c1, t, w];
    });
    const loopPath = S(sc.svg, "path", { d: "M1440,520 C1540,520 1540,270 1440,270" }, { fill: "none", stroke: C.dim, strokeWidth: 3 });
    const loopTip = S(sc.svg, "polygon", { points: "1440,270 1458,260 1458,280" }, { fill: C.dim });
    hide([loopPath, loopTip]);
    const again = H(sc, "repeat", { x: 1555, y: 395, size: 20, color: C.dim });
    gsap.set(again, { rotation: 90 });
    fadeIn(re, at("a2", 0.3), 0.5);
    fadeIn(rs, frac("a2", 0.12), 0.4, { dy: 0 });
    show(card, frac("a2", 0.24), 0.4);
    fadeIn(roundRows[0], frac("a2", 0.33), 0.4, { dy: 0, stagger: 0.12 });
    fadeIn(roundRows[1], frac("a2", 0.45), 0.4, { dy: 0, stagger: 0.12 });
    fadeIn(roundRows[2], frac("a2", 0.7), 0.4, { dy: 0, stagger: 0.12 });
    draw(loopPath, frac("a2", 0.88), 0.5);
    show(loopTip, frac("a2", 0.88) + 0.45, 0.15);
    fadeIn(again, frac("a2", 0.9), 0.3, { dy: 0 });
    fadeOut([re, rs, card, ...flat(roundRows), loopPath, loopTip, again], at("a3", 0), 0.4);

    // a3: the whole trace; the loop ends with a final answer
    const CX = { n: 130, th: 175, ac: 650, ob: 1120 }, RY0 = 262, RH = 84;
    const qline = H(sc, `question: ${R.question}`, { anchor: "left", x: 110, y: 150, size: 22, color: C.dim });
    const hd = [["thought", CX.th, THOUGHT], ["action", CX.ac, ACTION], ["observation", CX.ob, OBS]].map(([t, x, col]) => H(sc, t, { anchor: "left", x, y: 200, size: 20, color: col, font: "mono", weight: 500 }));
    const rule = line(sc, 110, 224, 1490, 224, C.grid, 2);
    fadeIn([qline, ...hd], at("a3", 0.15), 0.4, { dy: 0 });
    show(rule, at("a3", 0.15), 0.4);
    const trace = R.steps.map((s, i) => {
      const y = RY0 + i * RH, isFinal = s.final !== undefined;
      const els = [H(sc, String(s.n), { x: CX.n, y: y + 14, size: 26, color: C.dim, font: "mono" }),
        para(sc, s.thought, CX.th, y - 8, 450, { size: 20, font: "body" })];
      if (isFinal) els.push(para(sc, "Final Answer: " + s.final, CX.ac, y - 8, 800, { size: 24, color: C.green, weight: 600 }));
      else els.push(para(sc, s.action, CX.ac, y - 8, 450, { size: 20, color: ACTION }), para(sc, s.observation, CX.ob, y - 8, 380, { size: 20, color: OBS }));
      const t = isFinal ? frac("a3", 0.4) : at("a3", 0.4 + i * 0.4);
      fadeIn(els, t, 0.35, { dy: 0 });
      return els;
    });
    const finalBox = rect(sc, 112, RY0 + 4 * RH - 18, 1376, 66, C.green, { rx: 10 });
    show(finalBox, frac("a3", 0.42), 0.4);
    const brace = S(sc.svg, "path", { d: `M1512,${RY0 - 18} L1522,${RY0 - 18} L1522,${RY0 + 4 * RH - 30} L1512,${RY0 + 4 * RH - 30}` }, { fill: "none", stroke: C.yellow, strokeWidth: 3 });
    hide(brace);
    const braceL = H(sc, `${R.tool_calls} tool calls`, { x: 1552, y: RY0 + 1.5 * RH, size: 20, color: C.yellow, weight: 600 });
    gsap.set(braceL, { rotation: 90 });
    draw(brace, frac("a3", 0.78), 0.5);
    fadeIn(braceL, frac("a3", 0.82), 0.3, { dy: 0 });
    const sum = H(sc, `model calls: ${R.model_calls}   ·   tool calls: ${R.tool_calls}`, { x: 800, y: 700, size: 26, color: C.dim, font: "mono" });
    fadeIn(sum, frac("a3", 0.86), 0.4);
    fadeOut([qline, ...hd, rule, ...flat(trace), finalBox, brace, braceL, sum], at("a4", 0), 0.4);

    // a4: a confused loop and the step limit
    const S4 = N.stuck, SX = { n: 130, th: 175, ac: 540, ob: 870 }, SY0 = 270, SH = 70;
    const sq = H(sc, `question: ${S4.question}`, { anchor: "left", x: 110, y: 150, size: 22, color: C.dim });
    const lim = chip(sc, `step limit = ${S4.limit}`, C.red, { x: 1340, y: 150, size: 24 });
    const hd4 = [["thought", SX.th, THOUGHT], ["action", SX.ac, ACTION], ["observation", SX.ob, OBS]].map(([t, x, col]) => H(sc, t, { anchor: "left", x, y: 200, size: 20, color: col, font: "mono", weight: 500 }));
    const rule4 = line(sc, 110, 224, 1490, 224, C.grid, 2);
    fadeIn([sq, ...hd4], at("a4", 0.1), 0.4, { dy: 0 });
    show(rule4, at("a4", 0.1), 0.4);
    fadeIn(lim, at("a4", 0.4), 0.4);
    const stuck = S4.steps.map((s, i) => {
      const y = SY0 + i * SH;
      const els = [H(sc, String(s.n), { x: SX.n, y: y + 12, size: 24, color: C.dim, font: "mono" }),
        para(sc, s.thought, SX.th, y - 4, 340, { size: 18, font: "body" }),
        para(sc, s.action, SX.ac, y - 4, 320, { size: 18, color: ACTION }),
        para(sc, s.observation, SX.ob, y - 4, 620, { size: 18, color: C.red })];
      fadeIn(els, frac("a4", 0.34 + i * 0.1), 0.3, { dy: 0 });
      return els;
    });
    const stop = chip(sc, "step limit reached: your code stops the loop", C.red, { x: 800, y: 690, size: 28 });
    fadeIn(stop, frac("a4", 0.88), 0.4);
    fadeOut([sq, lim, ...hd4, rule4, ...flat(stuck), stop], at("a5", 0), 0.4);

    // a5: four levels of freedom
    const LV = [
      { name: "workflow", sub: "you write the steps", col: C.blue },
      { name: "router", sub: "the model picks a path", col: C.teal },
      { name: "agent", sub: "the model picks the steps", col: C.yellow },
      { name: "many agents", sub: "agents share the work", col: C.orange },
    ];
    const LX = i => 260 + i * 360;
    function sq2(x, y, col, w = 46) { return rect(sc, x - w / 2, y - w / 2, w, w, col, { fill: hexA(col, 0.18), rx: 8, sw: 3 }); }
    const icons = [
      () => { const g = [-100, 0, 100].map(dx => sq2(LX(0) + dx, 365, C.blue)); g.push(line(sc, LX(0) - 75, 365, LX(0) - 25, 365, C.blue), line(sc, LX(0) + 25, 365, LX(0) + 75, 365, C.blue)); return g; },
      () => [sq2(LX(1) - 90, 365, C.teal), sq2(LX(1) + 80, 315, C.teal), sq2(LX(1) + 80, 415, C.teal),
        line(sc, LX(1) - 66, 355, LX(1) + 56, 320, C.teal, 5), line(sc, LX(1) - 66, 375, LX(1) + 56, 410, C.grid, 3, "6 6")],
      () => { const c = circle(sc, LX(2), 365, 52, C.yellow, { dash: "14 9", sw: 4 }); const t = H(sc, "loop", { x: LX(2), y: 365, size: 26, color: C.yellow, font: "mono" }); return [c, t]; },
      () => { const g = [circle(sc, LX(3), 310, 24, C.orange), ...[-90, 0, 90].map(dx => circle(sc, LX(3) + dx, 415, 24, C.orange))];
        [-90, 0, 90].forEach(dx => g.push(line(sc, LX(3), 334, LX(3) + dx, 391, C.orange))); return g; },
    ];
    const lv = LV.map((l, i) => {
      const cardE = rect(sc, LX(i) - 160, 190, 320, 340, l.col, { fill: hexA(l.col, 0.06), rx: 16 });
      const nm = H(sc, l.name, { x: LX(i), y: 238, size: 30, color: l.col, weight: 700 });
      const sub = H(sc, l.sub, { x: LX(i), y: 495, size: 20, color: C.dim });
      const g = icons[i]();
      const t = frac("a5", [0.03, 0.27, 0.5, 0.76][i]);
      show(cardE, t, 0.4);
      fadeIn([nm, sub], t + 0.1, 0.4, { dy: 0 });
      fadeIn(g, t + 0.2, 0.4, { dy: 0 });
      return [cardE, nm, sub, ...g];
    });

    // a6: more freedom, more risk
    const fa = arrow(sc, 160, 610, 1440, 610, C.dim, 4, 18);
    const left = H(sc, "you decide", { anchor: "left", x: 320, y: 650, size: 24, color: C.dim });
    const right = H(sc, "the model decides", { anchor: "right", x: 1440, y: 650, size: 24, color: C.yellow });
    const risk = H(sc, "more risk", { anchor: "right", x: 1440, y: 700, size: 28, color: C.red, weight: 700 });
    const start = chip(sc, "start here", C.teal, { x: 260, y: 740, size: 26 });
    const sa = arrow(sc, 260, 706, 260, 548, C.teal, 4, 14);
    drawArrow(fa, at("a6", 0.2), 0.8);
    fadeIn([left, right], at("a6", 0.5), 0.4, { dy: 0 });
    fadeIn(risk, frac("a6", 0.4), 0.4);
    drawArrow(sa, frac("a6", 0.62), 0.5);
    fadeIn(start, frac("a6", 0.7), 0.4);
    void lv;
  }

  /* ---------------------------------------------------------------- 2 planning */
  function plan(sc, N) {
    title(sc, "Planning", "p1");
    const P = N.plan;

    // p1: ReAct decides one step at a time; the goal gets far away
    const goal = chip(sc, "goal", C.green, { x: 190, y: 420, size: 32 });
    const xs = [...Array(7)].map((_, i) => 400 + i * 165);
    const steps = xs.map((x, i) => [circle(sc, x, 420, 36, C.yellow), H(sc, String(i + 1), { x, y: 420, size: 26, color: C.yellow, font: "mono", weight: 600 })]);
    const arrs = xs.slice(0, -1).map((x, i) => arrow(sc, x + 42, 420, xs[i + 1] - 42, 420, C.dim, 3, 12));
    const cap1 = H(sc, "ReAct chooses each step after the last observation", { x: 800, y: 560, size: 26, color: C.dim });
    const cap2 = H(sc, "the goal is far back in the prompt", { x: 800, y: 560, size: 26, color: C.red });
    const q = H(sc, "?", { x: 1390, y: 330, size: 54, color: C.red, weight: 700 });
    fadeIn(goal, at("p1", 0.3), 0.4);
    fadeIn(cap1, at("p1", 0.5), 0.4);
    xs.forEach((x, i) => {
      const t = at("p1", 0.6 + i * 0.4);
      fadeIn(steps[i], t, 0.3, { dy: 0 });
      if (i > 0) drawArrow(arrs[i - 1], t - 0.25, 0.3);
    });
    tl.to(goal, { opacity: 0.15, duration: dur("p1") * 0.4, ease: "none" }, frac("p1", 0.45));
    fadeOut(cap1, frac("p1", 0.62), 0.3);
    fadeIn(cap2, frac("p1", 0.68), 0.4);
    fadeIn(q, frac("p1", 0.86), 0.3);
    fadeOut([goal, ...flat(steps), ...arrs.flatMap(a => [a.line, a.tip]), cap2, q], at("p2", 0), 0.4);

    // p2: the model writes a plan; code runs the steps
    const CXp = 560, CYp = 190, CWp = 900;
    const mdl = box(sc, 240, 400, 240, 100, C.purple, "model", { size: 34 });
    const calls = H(sc, "model calls: 1", { x: 240, y: 490, size: 24, color: C.purple, font: "mono" });
    const aPlan = arrow(sc, 372, 400, 548, 400, C.purple, 4, 14);
    const cardP = rect(sc, CXp, CYp, CWp, 350, C.fg, { fill: hexA(C.fg, 0.03), rx: 16 });
    const head = H(sc, "plan 1: a list of steps", { anchor: "left", x: CXp + 26, y: CYp + 32, size: 22, color: C.dim, font: "mono" });
    const RYp = i => CYp + 100 + i * 62;
    const rows1 = P.plans[0].map((s, i) => [H(sc, String(i + 1), { x: CXp + 44, y: RYp(i), size: 24, color: C.dim, font: "mono" }),
      H(sc, s.label, { anchor: "left", x: CXp + 84, y: RYp(i), size: 24, font: "mono" })]);
    const fmt = (e, i, last) => (last && typeof e.result === "number" ? e.result.toFixed(2) : String(e.result));
    function result(e, i, t, ok = true, last = false) {
      const m = mark(sc, ok, CXp + 650, RYp(i));
      const v = H(sc, ok ? fmt(e, i, last) : "", { anchor: "left", x: CXp + 690, y: RYp(i), size: 22, color: C.dim, font: "mono" });
      fadeIn([m, v], t, 0.3, { dy: 0 });
      return [m, v];
    }
    fadeIn(mdl.els, at("p2", 0.3), 0.4, { dy: 0 });
    fadeIn(calls, at("p2", 0.5), 0.3, { dy: 0 });
    drawArrow(aPlan, frac("p2", 0.2), 0.5);
    show(cardP, frac("p2", 0.24), 0.4);
    fadeIn(head, frac("p2", 0.3), 0.3, { dy: 0 });
    rows1.forEach((r, i) => fadeIn(r, frac("p2", 0.34 + i * 0.07), 0.3, { dy: 0 }));
    const ok1 = [result(P.events[0], 0, frac("p2", 0.68)), result(P.events[1], 1, frac("p2", 0.82))];
    const runNote = H(sc, "plain code runs each step: no model call", { x: CXp + 24, y: CYp + 395, size: 22, color: C.dim, anchor: "left" });
    fadeIn(runNote, frac("p2", 0.62), 0.4, { dy: 0 });

    // p3: step 3 fails; the model writes a new plan
    const failRow = rect(sc, CXp + 14, RYp(2) - 28, CWp - 28, 56, C.red, { rx: 10, fill: hexA(C.red, 0.1) });
    const bad = result({ result: "" }, 2, at("p3", 0.5), false);
    const err = H(sc, `error: ${P.events[2].result}`, { anchor: "left", x: CXp + 26, y: CYp + 395, size: 24, color: C.red, font: "mono" });
    show(failRow, at("p3", 0.5), 0.4);
    fadeOut(runNote, at("p3", 0.3), 0.3);
    fadeIn(err, frac("p3", 0.35), 0.4, { dy: 0 });
    const aBack = arrow(sc, 548, 460, 372, 430, C.red, 4, 14);
    const lBack = H(sc, "new plan", { x: 460, y: 495, size: 22, color: C.red, weight: 600 });
    drawArrow(aBack, frac("p3", 0.72), 0.5);
    fadeIn(lBack, frac("p3", 0.76), 0.3, { dy: 0 });
    swapText(calls, frac("p3", 0.82), "model calls: 2");
    pulse(calls, frac("p3", 0.82), 1.1, 0.5);

    // p4: plan 2 runs to the end; when to use which pattern
    fadeOut([...flat(rows1), ...flat(ok1), ...bad, failRow, err, aBack.line, aBack.tip, lBack], at("p4", 0), 0.4);
    swapText(head, at("p4", 0.2), "plan 2: step 3 rewritten by the model");
    const rows2 = P.plans[1].map((s, i) => [H(sc, String(i + 1), { x: CXp + 44, y: RYp(i), size: 24, color: C.dim, font: "mono" }),
      H(sc, s.label, { anchor: "left", x: CXp + 84, y: RYp(i), size: 24, font: "mono", color: i === 2 ? C.yellow : C.fg })]);
    const newRow = rect(sc, CXp + 14, RYp(2) - 28, CWp - 28, 56, C.yellow, { rx: 10, fill: hexA(C.yellow, 0.1) });
    fadeIn(rows2, at("p4", 0.45), 0.4, { dy: 0, stagger: 0.1 });
    show(newRow, at("p4", 0.8), 0.4);
    const idx = [0, 1, 3, 4];
    const ok2 = idx.map((ei, i) => result(P.events[ei], i, frac("p4", 0.25 + i * 0.1), true, i === 3));
    const ans = H(sc, `answer: ${P.answer.toFixed(2)} dollars`, { anchor: "left", x: CXp + 26, y: CYp + 395, size: 26, color: C.green, font: "mono", weight: 600 });
    fadeIn(ans, frac("p4", 0.5), 0.4, { dy: 0 });
    const c1 = chip(sc, "ReAct: short or uncertain tasks", C.yellow, { x: 480, y: 700, size: 26 });
    const c2 = chip(sc, "plan: long tasks with many steps", C.teal, { x: 1130, y: 700, size: 26 });
    fadeIn(c1, frac("p4", 0.6), 0.4);
    fadeIn(c2, frac("p4", 0.8), 0.4);
    void ok2;
  }

  /* ---------------------------------------------------------------- 3 context engineering */
  function context(sc, N) {
    title(sc, "Context engineering", "c1");
    const MM = N.mem;

    // c1: the context window is a budget
    const WX = 200, WY = 300, WW = 1200, WH = 130;
    const win = rect(sc, WX, WY, WW, WH, C.fg, { fill: hexA(C.fg, 0.03), rx: 18, sw: 3 });
    const wl = H(sc, "the context: the text that the model reads in one request", { x: 800, y: 250, size: 26 });
    const limit = line(sc, WX + WW, WY - 34, WX + WW, WY + WH + 34, C.red, 5);
    const ll = H(sc, "size limit = the budget", { x: WX + WW - 130, y: WY + WH + 70, size: 26, color: C.red, weight: 600 });
    fadeIn(wl, at("c1", 0.3), 0.4);
    draw(win, at("c1", 0.5), 1.0);
    show(limit, frac("c1", 0.62), 0.4);
    fadeIn(ll, frac("c1", 0.7), 0.4);

    // c2: five parts compete for the budget
    const parts = [["system prompt", C.purple], ["tool definitions", C.orange], ["memory", C.teal], ["history", C.green], ["retrieved text", C.blue]];
    const BW = 228, BG = 8;
    const blocks = parts.map(([t, col], i) => {
      const r2 = rect(sc, WX + 12 + i * (BW + BG), WY + 12, BW, WH - 24, col, { fill: hexA(col, 0.22), rx: 10, sw: 2 });
      const l2 = H(sc, t, { x: WX + 12 + i * (BW + BG) + BW / 2, y: WY + WH / 2, size: 22, color: col, weight: 600 });
      const tt = frac("c2", [0.32, 0.44, 0.56, 0.66, 0.78][i]);
      show(r2, tt, 0.3);
      fadeIn(l2, tt + 0.05, 0.3, { dy: 0 });
      return [r2, l2];
    });
    const schem = H(sc, "a drawing: the parts have different sizes in a real request", { x: 800, y: 590, size: 22, color: C.dim });
    fadeIn(schem, at("c2", 0.3), 0.4);
    fadeOut([wl, win, limit, ll, ...flat(blocks), schem], at("c3", 0), 0.4);

    // c3: the history grows; trim the oldest messages
    const X0 = 200, PX = 9, TY = 400, TH = 100;
    const segs = [{ role: "system", tokens: MM.system_tokens, keep: true }, ...MM.history];
    const colOf = r2 => (r2 === "system" ? C.purple : r2 === "user" ? C.blue : C.green);
    let acc = 0, dropW = 0;
    const tape = segs.map((s, i) => {
      const x = X0 + acc * PX, w = s.tokens * PX;
      acc += s.tokens;
      const r2 = rect(sc, x + 1, TY, w - 2, TH, colOf(s.role), { fill: hexA(colOf(s.role), 0.28), rx: 6, sw: 2 });
      const l2 = H(sc, String(s.tokens), { x: x + w / 2, y: TY + TH / 2, size: 24, color: C.fg, font: "mono" });
      const t = at("c3", 0.25 + i * 0.2);
      show(r2, t, 0.25); fadeIn(l2, t + 0.05, 0.25, { dy: 0 });
      return { ...s, x, w, els: [r2, l2] };
    });
    const leg = [["system prompt", C.purple], ["user message", C.blue], ["assistant message", C.green]].map(([t, col], i) => {
      const lx = 340 + i * 320;
      const sw = rect(sc, lx - 40, 566, 26, 26, col, { fill: hexA(col, 0.4), rx: 5 });
      const lt = H(sc, t, { anchor: "left", x: lx, y: 579, size: 22, color: C.dim });
      fadeIn([sw, lt], at("c3", 0.3), 0.4, { dy: 0 });
      return [sw, lt];
    });
    const bud = line(sc, X0 + MM.budget * PX, TY - 50, X0 + MM.budget * PX, TY + TH + 50, C.red, 5, "10 7");
    const budL = H(sc, `budget: ${MM.budget} tokens`, { x: X0 + MM.budget * PX, y: TY - 76, size: 26, color: C.red, weight: 600 });
    const total = H(sc, `${MM.all_tokens} tokens: too many`, { x: 800, y: 690, size: 28, color: C.red, font: "mono" });
    show(bud, frac("c3", 0.34), 0.4);
    fadeIn([budL, total], frac("c3", 0.36), 0.4, { dy: 0 });
    // trim: the oldest messages go; the others slide left
    const dropped = tape.filter(s => !s.keep);
    dropW = dropped.reduce((a, s) => a + s.w, 0);
    const lastDropX = Math.max(...dropped.map(s => s.x));
    dropped.forEach(s => { tl.to(s.els, { y: 110, duration: 0.7, ease: "power2.in" }, frac("c3", 0.6)); tl.to(s.els, { autoAlpha: 0.0, duration: 0.5 }, frac("c3", 0.6) + 0.35); });
    tape.filter(s => s.keep && s.x > lastDropX).forEach(s => tl.to(s.els, { x: -dropW, duration: 0.8, ease: "power2.inOut" }, frac("c3", 0.6) + 0.5));
    swapText(total, frac("c3", 0.62), `${MM.kept_tokens} tokens: fits`);
    tl.to(total, { color: C.green, duration: 0.3 }, frac("c3", 0.62));
    const trimL = H(sc, "trim: the oldest messages go first", { x: 800, y: 760, size: 24, color: C.yellow });
    const sumL = H(sc, "or: summarize them in one short note", { x: 800, y: 805, size: 24, color: C.dim });
    fadeIn(trimL, frac("c3", 0.7), 0.4);
    fadeIn(sumL, frac("c3", 0.84), 0.4);
    fadeOut([...flat(tape.map(s => s.els)), ...flat(leg), bud, budL, total, trimL, sumL], at("c4", 0), 0.4);

    // c4: stable text first (a cache can reuse it)
    const stack = [["system prompt", C.purple, true], ["tool definitions", C.orange, true], ["memory notes", C.teal, false], ["history", C.green, false], ["new question", C.yellow, false]];
    const SX = 470, SW = 480, SY = i => 200 + i * 98;
    const blocks4 = stack.map(([t, col], i) => {
      const r2 = rect(sc, SX, SY(i), SW, 80, col, { fill: hexA(col, 0.18), rx: 12, sw: 2.5 });
      const l2 = H(sc, t, { x: SX + SW / 2, y: SY(i) + 40, size: 28, color: col, weight: 600 });
      return [r2, l2];
    });
    fadeIn(blocks4.map(b => b[0]), at("c4", 0.3), 0.4, { stagger: 0.1 });
    fadeIn(blocks4.map(b => b[1]), at("c4", 0.4), 0.4, { stagger: 0.1 });
    const br = (y1, y2, col) => { const p = S(sc.svg, "path", { d: `M${SX + SW + 24},${y1} L${SX + SW + 36},${y1} L${SX + SW + 36},${y2} L${SX + SW + 24},${y2}` }, { fill: "none", stroke: col, strokeWidth: 4 }); hide(p); return p; };
    const b1 = br(SY(0), SY(1) + 80, C.teal), b2 = br(SY(2), SY(4) + 80, C.orange);
    const t1 = H(sc, "stable: the same in every request", { anchor: "left", x: SX + SW + 62, y: SY(0) + 55, size: 26, color: C.teal, weight: 600 });
    const t1b = H(sc, "a cache can reuse it (episode 10)", { anchor: "left", x: SX + SW + 62, y: SY(0) + 95, size: 22, color: C.dim });
    const t2 = H(sc, "changes in every request", { anchor: "left", x: SX + SW + 62, y: SY(3) + 8, size: 26, color: C.orange, weight: 600 });
    draw(b1, frac("c4", 0.3), 0.5);
    fadeIn([t1, t1b], frac("c4", 0.38), 0.4, { dy: 0, stagger: 0.15 });
    draw(b2, frac("c4", 0.7), 0.5);
    fadeIn(t2, frac("c4", 0.76), 0.4, { dy: 0 });
    fadeOut([...flat(blocks4), b1, b2, t1, t1b, t2], at("c5", 0), 0.4);

    // c5: key facts at the start or the end
    const LXc = 200, LWc = 1200, BYc = 640;
    const bar = [["key facts", C.yellow, LXc, 170], ["other text", C.grid, LXc + 170, LWc - 340], ["key facts", C.yellow, LXc + LWc - 170, 170]].map(([t, col, x, w]) => {
      const r2 = rect(sc, x, BYc, w, 70, col, { fill: hexA(col, col === C.yellow ? 0.25 : 0.12), rx: 8, sw: 2 });
      const l2 = H(sc, t, { x: x + w / 2, y: BYc + 35, size: 24, color: col === C.yellow ? C.yellow : C.dim, weight: 600 });
      return [r2, l2];
    });
    const pos = [["start", LXc + 85], ["middle", 800], ["end", LXc + LWc - 85]].map(([t, x]) => H(sc, t, { x, y: BYc + 100, size: 22, color: C.dim }));
    const axisL = H(sc, "how well the model uses a fact", { anchor: "left", x: LXc, y: 215, size: 24, color: C.dim });
    const best = H(sc, "well", { anchor: "right", x: LXc - 20, y: 290, size: 22, color: C.green });
    const worst = H(sc, "misses it", { anchor: "right", x: LXc - 20, y: 470, size: 22, color: C.red });
    const uPath = S(sc.svg, "path", { d: `M${LXc},290 C${LXc + 260},290 ${LXc + 330},470 800,470 C${LXc + LWc - 330},470 ${LXc + LWc - 260},290 ${LXc + LWc},290` }, { fill: "none", stroke: C.blue, strokeWidth: 5, strokeLinecap: "round" });
    hide(uPath);
    const note = H(sc, "a drawing of the idea, not a measurement (Liu et al. 2023)", { x: 800, y: 540, size: 22, color: C.dim });
    fadeIn(bar.map(b => b[0]), at("c5", 0.3), 0.4, { dy: 0 });
    fadeIn(bar.map(b => b[1]), at("c5", 0.35), 0.4, { dy: 0 });
    fadeIn(pos, at("c5", 0.5), 0.4, { dy: 0 });
    fadeIn([axisL, best, worst], frac("c5", 0.4), 0.4, { dy: 0 });
    draw(uPath, frac("c5", 0.5), 1.2);
    fadeIn(note, frac("c5", 0.85), 0.4);
    fadeOut([...flat(bar), ...pos, axisL, best, worst, uPath, note], at("c6", 0), 0.4);

    // c6: the harness builds the context
    const mdl = box(sc, 800, 470, 260, 110, C.purple, "model", { size: 36 });
    const frame = rect(sc, 240, 220, 1120, 500, C.yellow, { fill: "none", dash: "14 10", rx: 28, sw: 3 });
    const fl = H(sc, "harness: the code around the model", { anchor: "left", x: 270, y: 255, size: 28, color: C.yellow, weight: 700 });
    const tasks = [["trim the history", 400, 360], ["add the memory", 400, 580], ["run the tools", 1200, 360], ["check the output", 1200, 580]].map(([t, x, y]) => chip(sc, t, C.blue, { x, y, size: 24 }));
    const links = tasks.map((c, i) => line(sc, i < 2 ? 520 : 1080, i % 2 ? 580 : 360, i < 2 ? 668 : 932, 470, C.grid, 3));
    const ctxL = H(sc, "context", { x: 800, y: 390, size: 22, color: C.dim });
    draw(frame, at("c6", 0.3), 1.0);
    fadeIn(fl, at("c6", 0.5), 0.4, { dy: 0 });
    fadeIn(mdl.els, frac("c6", 0.35), 0.4, { dy: 0 });
    tasks.forEach((c, i) => { fadeIn(c, frac("c6", 0.42 + i * 0.1), 0.4); show(links[i], frac("c6", 0.45 + i * 0.1), 0.4); });
    fadeIn(ctxL, frac("c6", 0.85), 0.4, { dy: 0 });
  }

  /* ---------------------------------------------------------------- 4 memory */
  function memory(sc, N) {
    title(sc, "Memory", "m1");
    const MM = N.mem;
    const kept = MM.history.filter(h => h.keep);

    // m1: short-term memory = the conversation in the prompt
    const PXm = 110, PYm = 190, PWm = 530, PHm = 450;
    const card = rect(sc, PXm, PYm, PWm, PHm, C.blue, { fill: hexA(C.blue, 0.05), rx: 16 });
    const cl = H(sc, "short-term memory: the conversation in the prompt", { anchor: "left", x: PXm, y: 158, size: 22, color: C.blue, weight: 600 });
    const ph = H(sc, "prompt", { anchor: "left", x: PXm + 22, y: PYm + 30, size: 20, color: C.dim, font: "mono" });
    const slot = rect(sc, PXm + 14, PYm + 62, PWm - 28, 86, C.yellow, { fill: hexA(C.yellow, 0.1), rx: 10 });
    const msgs = kept.map((h, i) => [
      H(sc, h.role, { anchor: "left", x: PXm + 24, y: PYm + 190 + i * 60, size: 17, color: C.dim, font: "mono" }),
      para(sc, cut(h.text, 62), PXm + 130, PYm + 190 + i * 60 - 12, 380, { size: 18, font: "body" })]);
    const bl = H(sc, `fast, but the budget limits it: ${MM.budget} tokens`, { anchor: "left", x: PXm, y: 676, size: 22, color: C.dim });
    show(card, at("m1", 0.3), 0.4);
    fadeIn([cl, ph], at("m1", 0.4), 0.4, { dy: 0 });
    msgs.forEach((m, i) => fadeIn(m, at("m1", 0.8 + i * 0.35), 0.35, { dy: 0 }));
    fadeIn(bl, frac("m1", 0.7), 0.4);

    // m2: long-term memory = notes outside the model
    const SXm = 1000, SWm = 490;
    const store = rect(sc, SXm, PYm, SWm, PHm, C.purple, { fill: hexA(C.purple, 0.05), rx: 16 });
    const sl = H(sc, "long-term memory: notes outside the model", { anchor: "left", x: SXm, y: 158, size: 22, color: C.purple, weight: 600 });
    const noteRows = MM.notes.map((n, i) => {
      const y = PYm + 52 + i * 62;
      const dot = circle(sc, SXm + 30, y, 9, KIND[n.kind], { fill: KIND[n.kind] });
      const t = H(sc, cut(n.text, 34), { anchor: "left", x: SXm + 52, y, size: 18, color: C.fg });
      return [dot, t];
    });
    const aSave = arrow(sc, 660, 300, 990, 300, C.purple, 4, 14);
    const lSave = H(sc, "save a note", { x: 825, y: 268, size: 22, color: C.purple, weight: 600 });
    const aFind = arrow(sc, 990, 440, 660, 440, C.yellow, 4, 14);
    const lFind = H(sc, "find the notes that fit", { x: 825, y: 402, size: 22, color: C.yellow, weight: 600 });
    const lFind2 = H(sc, "a question", { x: 825, y: 475, size: 22, color: C.yellow, weight: 600 });
    const lAdd = H(sc, "add them to the prompt", { x: 825, y: 520, size: 22, color: C.yellow });
    const q0 = MM.queries[0], n0 = MM.notes[q0.top];
    const inj = para(sc, `[${n0.kind}] ${cut(n0.text, 78)}`, PXm + 26, PYm + 72, PWm - 56, { size: 18, font: "body", color: C.yellow });
    show(store, at("m2", 0.4), 0.4);
    fadeIn(sl, at("m2", 0.5), 0.4, { dy: 0 });
    noteRows.forEach((r2, i) => fadeIn(r2, at("m2", 0.7 + i * 0.12), 0.3, { dy: 0 }));
    drawArrow(aSave, frac("m2", 0.33), 0.5);
    fadeIn(lSave, frac("m2", 0.38), 0.3, { dy: 0 });
    drawArrow(aFind, frac("m2", 0.52), 0.5);
    fadeIn([lFind, lFind2], frac("m2", 0.58), 0.3, { dy: 0 });
    show(slot, frac("m2", 0.78), 0.4);
    fadeIn(lAdd, frac("m2", 0.78), 0.3, { dy: 0 });
    fadeIn(inj, frac("m2", 0.84), 0.4, { dy: 0 });
    fadeOut([card, cl, ph, slot, ...flat(msgs), bl, store, sl, ...flat(noteRows), aSave.line, aSave.tip, lSave, aFind.line, aFind.tip, lFind, lFind2, lAdd, inj], at("m3", 0), 0.5);

    // m3: three kinds of notes
    const kinds = [["episodic", "records an event", C.blue], ["semantic", "holds a fact", C.teal], ["procedural", "says how to do a task", C.orange]];
    const kinds3 = kinds.map(([k, means, col], i) => {
      const cx = 300 + i * 500, ex = MM.notes.find(n => n.kind === k);
      const c2 = rect(sc, cx - 215, 200, 430, 420, col, { fill: hexA(col, 0.06), rx: 16 });
      const nm = H(sc, k, { x: cx, y: 255, size: 36, color: col, weight: 700 });
      const mn = H(sc, `a note that ${means}`, { x: cx, y: 315, size: 24, color: C.fg });
      const ex2 = H(sc, `“${ex.text}”`, { x: cx, y: 470, size: 21, color: C.dim, wrap: 370 });
      const t = frac("m3", [0.05, 0.3, 0.52][i] + 0.02);
      show(c2, t, 0.4);
      fadeIn([nm, mn], t + 0.15, 0.4, { dy: 0 });
      fadeIn(ex2, t + 0.5, 0.5, { dy: 0 });
      return [c2, nm, mn, ex2];
    });
    const sg = H(sc, "an example note of each kind", { x: 800, y: 665, size: 22, color: C.dim });
    fadeIn(sg, at("m3", 0.5), 0.4);
    fadeOut([...flat(kinds3), sg], at("m4", 0), 0.5);

    // m4: three questions find three kinds of notes
    const RYm = i => 300 + i * 70, BXm = 1010, BSc = 560;
    const qLab = H(sc, "memory question:", { anchor: "left", x: 110, y: 185, size: 22, color: C.dim, font: "mono" });
    const qTxt = H(sc, MM.queries[0].q, { anchor: "left", x: 330, y: 185, size: 26, color: C.yellow, weight: 600 });
    const scH = H(sc, "similarity", { anchor: "left", x: BXm, y: 250, size: 20, color: C.dim, font: "mono" });
    const hi = rect(sc, 100, RYm(0) - 30, 1400, 60, C.yellow, { rx: 10, fill: hexA(C.yellow, 0.1) });
    const bars = MM.notes.map((n, i) => {
      const dot = circle(sc, 130, RYm(i), 9, KIND[n.kind], { fill: KIND[n.kind] });
      const kd = H(sc, n.kind, { anchor: "left", x: 155, y: RYm(i), size: 17, color: KIND[n.kind], font: "mono" });
      const tx = H(sc, cut(n.text, 52), { anchor: "left", x: 290, y: RYm(i), size: 19, color: C.fg });
      const b = S(sc.svg, "rect", { x: BXm, y: RYm(i) - 13, width: BSc, height: 26, rx: 4 }, { fill: C.yellow });
      gsap.set(b, { scaleX: 0, transformOrigin: "0% 50%", autoAlpha: 0 });
      const v = H(sc, "", { anchor: "left", x: BXm + 12, y: RYm(i), size: 20, color: C.dim, font: "mono" });
      return { dot, kd, tx, b, v, i };
    });
    fadeIn([qLab, qTxt, scH], at("m4", 0.15), 0.4, { dy: 0 });
    bars.forEach((r2, i) => fadeIn([r2.dot, r2.kd, r2.tx], at("m4", 0.3 + i * 0.06), 0.3, { dy: 0 }));
    show(hi, at("m4", 0.4), 0.3);
    const qT = [0.1, 0.38, 0.68];
    MM.queries.forEach((q, k) => {
      const t = frac("m4", qT[k]);
      if (k > 0) swapText(qTxt, t - 0.1, q.q);
      tl.to(hi, { attr: { y: RYm(q.top) - 30 }, duration: 0.5, ease: "power2.inOut" }, t);
      bars.forEach(b => {
        const s = q.scores[b.i];
        tl.to(b.b, { scaleX: Math.max(0.004, s), autoAlpha: 1, duration: 0.6, ease: "power2.out" }, t);
        tl.to(b.b, { fill: b.i === q.top ? C.yellow : C.grid, duration: 0.3 }, t);
        swapText(b.v, t + 0.2, s.toFixed(2));
        tl.to(b.v, { autoAlpha: 1, x: Math.max(0.004, s) * BSc, duration: 0.6, ease: "power2.out" }, t);
      });
    });
    fadeOut([qLab, qTxt, scH, hi, ...bars.flatMap(b => [b.dot, b.kd, b.tx, b.b, b.v])], at("m5", 0), 0.5);

    // m5: four kinds of store, each fixes one problem and shows another
    const stores = [
      ["list", "simple to start", "lost when the program stops", C.blue],
      ["files", "kept after a restart", "slow to search", C.teal],
      ["vector index", "finds close notes fast", "can miss facts that need two notes", C.yellow],
      ["graph", "keeps the links between notes", "more work to build", C.orange],
    ];
    const LXs = i => 260 + i * 360;
    const sc5 = stores.map(([nm, fix, but, col], i) => {
      const c2 = rect(sc, LXs(i) - 160, 190, 320, 300, col, { fill: hexA(col, 0.06), rx: 16 });
      const n2 = H(sc, nm, { x: LXs(i), y: 235, size: 30, color: col, weight: 700 });
      const f2 = H(sc, `fixes: ${fix}`, { x: LXs(i), y: 330, size: 21, color: C.green, wrap: 280 });
      const b2 = H(sc, `but: ${but}`, { x: LXs(i), y: 425, size: 21, color: C.red, wrap: 280 });
      const t = frac("m5", 0.04 + i * 0.07);
      show(c2, t, 0.4);
      fadeIn(n2, t + 0.1, 0.4, { dy: 0 });
      fadeIn(f2, frac("m5", 0.3 + i * 0.05), 0.4, { dy: 0 });
      fadeIn(b2, frac("m5", 0.45 + i * 0.05), 0.4, { dy: 0 });
      return [c2, n2, f2, b2];
    });
    // two linked notes: the question finds only the closest one
    const qC = chip(sc, "question", C.yellow, { x: 290, y: 690, size: 24 });
    const nA = box(sc, 720, 690, 220, 84, C.green, "note A", { size: 26, sub: "found" });
    const nB = box(sc, 1210, 690, 220, 84, C.red, "note B", { size: 26, sub: "missed" });
    const lk = line(sc, 832, 690, 1098, 690, C.dim, 3, "8 8");
    const lkL = H(sc, "linked", { x: 965, y: 655, size: 20, color: C.dim });
    const qa = arrow(sc, 364, 690, 604, 690, C.yellow, 3, 12);
    const vi = rect(sc, LXs(2) - 164, 186, 328, 308, C.yellow, { fill: "none", rx: 18, sw: 4 });
    show(vi, frac("m5", 0.64), 0.4);
    fadeIn(qC, frac("m5", 0.68), 0.4);
    drawArrow(qa, frac("m5", 0.72), 0.4);
    fadeIn(nA.els, frac("m5", 0.76), 0.4, { dy: 0 });
    show(lk, frac("m5", 0.82), 0.4);
    fadeIn(lkL, frac("m5", 0.84), 0.3, { dy: 0 });
    fadeIn(nB.els, frac("m5", 0.88), 0.4, { dy: 0 });
    void sc5;
  }

  /* ---------------------------------------------------------------- 5 many agents */
  function team(sc, N) {
    const ttl = title(sc, "Many agents", "t1");
    const O = N.orch;
    const [boss, ow, sw] = O.agents;
    const jobA = O.flow[0].text, jobB = O.flow[2].text;

    // t1: a task with two independent parts
    const task = H(sc, `task: ${O.task}`, { x: 800, y: 215, size: 26, wrap: 1200 });
    const pA = box(sc, 420, 470, 460, 120, C.blue, jobA, { size: 26, fill: 0.08 });
    const pB = box(sc, 1180, 470, 560, 120, C.teal, jobB, { size: 26, fill: 0.08 });
    const noLink = line(sc, 654, 470, 896, 470, C.dim, 3, "8 8");
    const nl = H(sc, "no link", { x: 775, y: 435, size: 22, color: C.dim });
    const pl = H(sc, "part 1", { x: 420, y: 395, size: 20, color: C.blue, font: "mono" });
    const pl2 = H(sc, "part 2", { x: 1180, y: 395, size: 20, color: C.teal, font: "mono" });
    fadeIn(task, at("t1", 0.3), 0.5);
    fadeIn([...pA.els, pl], frac("t1", 0.36), 0.4, { dy: 0 });
    fadeIn([...pB.els, pl2], frac("t1", 0.44), 0.4, { dy: 0 });
    show(noLink, frac("t1", 0.5), 0.4);
    fadeIn(nl, frac("t1", 0.52), 0.3, { dy: 0 });
    fadeOut([task, ...pA.els, ...pB.els, pl, pl2, noLink, nl], at("t2", 0), 0.4);

    // t2: the orchestrator gives each part to a worker; a worker sees only its own job
    const orch = box(sc, 800, 215, 360, 100, C.purple, "orchestrator", { size: 32 });
    const wA = box(sc, 400, 400, 300, 76, C.blue, ow.name, { size: 24, font: "mono" });
    const wB = box(sc, 1200, 400, 300, 76, C.teal, sw.name, { size: 24, font: "mono" });
    const dA = arrow(sc, 690, 266, 530, 360, C.yellow, 4, 14);
    const dB = arrow(sc, 910, 266, 1070, 360, C.yellow, 4, 14);
    const jl = H(sc, "job", { x: 676, y: 330, size: 22, color: C.yellow, weight: 600 });
    const jl2 = H(sc, "job", { x: 924, y: 330, size: 22, color: C.yellow, weight: 600 });
    fadeIn(orch.els, at("t2", 0.3), 0.4, { dy: 0 });
    fadeIn([...wA.els, ...wB.els], frac("t2", 0.2), 0.4, { dy: 0, stagger: 0.1 });
    drawArrow(dA, frac("t2", 0.3), 0.5);
    drawArrow(dB, frac("t2", 0.34), 0.5);
    fadeIn([jl, jl2], frac("t2", 0.4), 0.3, { dy: 0 });
    // the context of each worker
    function panel(ag, x, col, tShow) {
      const PW = 600, PY = 470;
      const bx = rect(sc, x, PY, PW, 330, col, { fill: hexA(col, 0.05), rx: 14 });
      const hl = H(sc, `context of ${ag.name}: ${ag.tokens} tokens`, { anchor: "left", x: x + 18, y: PY + 28, size: 20, color: col, font: "mono", weight: 500 });
      const rows = ag.messages.map((m, i) => {
        const y = PY + 72 + i * 50;
        const rl = H(sc, m.role, { anchor: "left", x: x + 18, y, size: 16, color: C.dim, font: "mono" });
        const tx = H(sc, cut(m.text.split("\n")[0], 44), { anchor: "left", x: x + 112, y, size: 18, color: i === ag.messages.length - 1 ? C.green : C.fg });
        const tk = H(sc, String(m.tokens), { anchor: "right", x: x + PW - 16, y, size: 16, color: C.dim, font: "mono" });
        return [rl, tx, tk];
      });
      show(bx, tShow, 0.4);
      fadeIn(hl, tShow + 0.1, 0.4, { dy: 0 });
      return { bx, hl, rows };
    }
    const pAnl = panel(ow, 130, C.blue, frac("t2", 0.62));
    const pBnl = panel(sw, 870, C.teal, frac("t2", 0.62));
    [pAnl, pBnl].forEach(p => {
      fadeIn(p.rows[0], frac("t2", 0.66), 0.3, { dy: 0 });
      fadeIn(p.rows[1], frac("t2", 0.74), 0.3, { dy: 0 });
    });
    const only = H(sc, "each worker sees only its own job", { x: 800, y: 835, size: 24, color: C.yellow });
    fadeIn(only, frac("t2", 0.82), 0.4);

    // t3: a worker sends back only its result
    fadeOut(only, at("t3", 0), 0.3);
    [pAnl, pBnl].forEach((p, k) => {
      p.rows.slice(2).forEach((r2, i) => fadeIn(r2, at("t3", 0.2 + i * 0.35 + k * 0.1), 0.3, { dy: 0 }));
    });
    const uA = arrow(sc, 430, 358, 640, 268, C.green, 4, 14);
    const uB = arrow(sc, 1170, 358, 960, 268, C.green, 4, 14);
    const rA = H(sc, "result", { x: 470, y: 296, size: 22, color: C.green, weight: 600 });
    const rB = H(sc, "result", { x: 1130, y: 296, size: 22, color: C.green, weight: 600 });
    drawArrow(uA, frac("t3", 0.3), 0.5);
    drawArrow(uB, frac("t3", 0.36), 0.5);
    fadeIn([rA, rB], frac("t3", 0.42), 0.3, { dy: 0 });
    const rep = H(sc, `report: ${O.report}`, { x: 800, y: 134, size: 18, color: C.green, wrap: 1400, font: "mono" });
    fadeIn(rep, frac("t3", 0.68), 0.5, { dy: 0 });
    fadeOut([...orch.els, ...wA.els, ...wB.els, dA.line, dA.tip, dB.line, dB.tip, jl, jl2, uA.line, uA.tip, uB.line, uB.tip, rA, rB, rep,
      pAnl.bx, pAnl.hl, ...flat(pAnl.rows), pBnl.bx, pBnl.hl, ...flat(pBnl.rows)], at("t4", 0), 0.4);

    // t4: benefits: workers run at the same time; each context stays small
    const lane = (y, label, bars, col) => {
      const l = H(sc, label, { anchor: "right", x: 560, y, size: 22, color: C.dim });
      const bs = bars.map(([x, w, yy]) => rect(sc, x, yy ?? y - 16, w, 28, col, { fill: hexA(col, 0.3), rx: 6, sw: 2 }));
      return [l, ...bs];
    };
    const seq = lane(200, "one agent: one after the other", [[600, 240], [840, 240]], C.orange);
    const par = H(sc, "two workers: at the same time", { anchor: "right", x: 560, y: 290, size: 22, color: C.dim });
    const parBars = [[600, 240, 262], [600, 240, 298]].map(([x, w, y], i) => rect(sc, x, y, w, 28, i ? C.teal : C.blue, { fill: hexA(i ? C.teal : C.blue, 0.3), rx: 6, sw: 2 }));
    const timeL = H(sc, "time →", { anchor: "left", x: 1110, y: 245, size: 20, color: C.dim });
    const dr = H(sc, "a drawing", { anchor: "left", x: 1110, y: 285, size: 20, color: C.dim });
    fadeIn(seq, at("t4", 0.2), 0.4, { dy: 0 });
    fadeIn([par, ...parBars], frac("t4", 0.2), 0.4, { dy: 0 });
    fadeIn([timeL, dr], frac("t4", 0.3), 0.4, { dy: 0 });
    const cs = [[boss, "orchestrator", C.purple], [ow, ow.name, C.blue], [sw, sw.name, C.teal], [O.one, "one agent, same task", C.orange]];
    const ch = H(sc, "context size, in tokens (this example)", { anchor: "left", x: 110, y: 400, size: 22, color: C.dim, font: "mono" });
    fadeIn(ch, frac("t4", 0.55), 0.4, { dy: 0 });
    const PXt = 6.2;
    const bars4 = cs.map(([ag, nm, col], i) => {
      const y = 480 + i * 78;
      const l = H(sc, nm, { anchor: "right", x: 560, y, size: 22, color: col, font: "mono" });
      const b = S(sc.svg, "rect", { x: 590, y: y - 20, width: ag.tokens * PXt, height: 40, rx: 6 }, { fill: col });
      gsap.set(b, { scaleX: 0, transformOrigin: "0% 50%", autoAlpha: 0 });
      const v = H(sc, String(ag.tokens), { anchor: "left", x: 590 + ag.tokens * PXt + 14, y, size: 24, color: col, font: "mono", weight: 600 });
      fadeIn(l, frac("t4", 0.6 + i * 0.07), 0.3, { dy: 0 });
      tl.to(b, { scaleX: 1, autoAlpha: 1, duration: 0.6, ease: "power2.out" }, frac("t4", 0.62 + i * 0.07));
      fadeIn(v, frac("t4", 0.62 + i * 0.07) + 0.5, 0.3, { dy: 0 });
      return [l, b, v];
    });
    fadeOut([...flat(seq), par, ...parBars, timeL, dr, ch, ...flat(bars4)], at("t5", 0), 0.4);

    // t5: costs: more model calls; errors are harder to trace; use one agent when it is enough
    const callsRow = (y, label, n, col) => {
      const l = H(sc, label, { anchor: "right", x: 560, y, size: 22, color: col, font: "mono" });
      const sqs = [...Array(n)].map((_, i) => rect(sc, 590 + i * 62, y - 24, 48, 48, col, { fill: hexA(col, 0.3), rx: 8, sw: 2.5 }));
      const v = H(sc, `${n} model calls`, { anchor: "left", x: 590 + n * 62 + 14, y, size: 24, color: col, font: "mono", weight: 600 });
      return { l, sqs, v };
    };
    const rowW = callsRow(250, "orchestrator + workers", O.calls, C.purple);
    const rowO = callsRow(350, "one agent", O.calls_one, C.orange);
    fadeIn(rowW.l, at("t5", 0.3), 0.3, { dy: 0 });
    tl.to(rowW.sqs, { autoAlpha: 1, duration: 0.2, stagger: 0.12 }, at("t5", 0.5));
    fadeIn(rowW.v, at("t5", 0.5) + rowW.sqs.length * 0.12, 0.3, { dy: 0 });
    fadeIn(rowO.l, at("t5", 0.9), 0.3, { dy: 0 });
    tl.to(rowO.sqs, { autoAlpha: 1, duration: 0.2, stagger: 0.12 }, at("t5", 1.1));
    fadeIn(rowO.v, at("t5", 1.1) + rowO.sqs.length * 0.12, 0.3, { dy: 0 });
    const chain = ["orchestrator", ow.name, "tool"].map((t, i) => chip(sc, t, i === 2 ? C.red : C.dim, { x: 430 + i * 370, y: 530, size: 24, font: "mono" }));
    const ca = [arrow(sc, 548, 530, 688, 530, C.dim, 3, 12), arrow(sc, 912, 530, 1112, 530, C.dim, 3, 12)];
    const ex = H(sc, "✗", { x: 1262, y: 530, size: 44, color: C.red, weight: 700 });
    const hard = H(sc, "an error can start in any step: more places to look", { x: 800, y: 600, size: 24, color: C.red });
    fadeIn(chain, frac("t5", 0.42), 0.4, { stagger: 0.12 });
    ca.forEach((a, i) => drawArrow(a, frac("t5", 0.46 + i * 0.05), 0.4));
    fadeIn(ex, frac("t5", 0.56), 0.3);
    fadeIn(hard, frac("t5", 0.58), 0.4);
    const useOne = chip(sc, "if one agent is enough: use one agent", C.green, { x: 800, y: 730, size: 30 });
    fadeIn(useOne, frac("t5", 0.8), 0.5);
    fadeOut([...flat([rowW.l, rowW.sqs, rowW.v, rowO.l, rowO.sqs, rowO.v]), ...chain, ...ca.flatMap(a => [a.line, a.tip]), ex, hard, useOne], at("t6", 0), 0.4);

    // t6: evals check every change
    const ev = [["change the agent", C.blue, 330], ["run the evals", C.yellow, 800], ["compare the score", C.green, 1270]].map(([t, col, x]) => chip(sc, t, col, { x, y: 430, size: 30 }));
    const ea = [arrow(sc, 520, 430, 640, 430, C.dim, 4, 14), arrow(sc, 960, 430, 1070, 430, C.dim, 4, 14)];
    const back = S(sc.svg, "path", { d: "M1270,480 C1270,600 330,600 330,480" }, { fill: "none", stroke: C.dim, strokeWidth: 3 });
    const backTip = S(sc.svg, "polygon", { points: "330,478 321,498 339,498" }, { fill: C.dim });
    hide([back, backTip]);
    const e7 = H(sc, "episode 7: evals", { x: 800, y: 650, size: 26, color: C.yellow, weight: 600 });
    fadeIn(ev, at("t6", 0.3), 0.4, { stagger: 0.4 });
    ea.forEach((a, i) => drawArrow(a, at("t6", 0.55 + i * 0.4), 0.4));
    draw(back, frac("t6", 0.6), 0.8);
    show(backTip, frac("t6", 0.6) + 0.7, 0.2);
    fadeIn(e7, frac("t6", 0.75), 0.4);
    fadeOut([...ev, ...ea.flatMap(a => [a.line, a.tip]), back, backTip, e7], at("t7", 0), 0.4);

    // t7, t8: the series so far (episodes 1-11); t9: one episode is left (the dashed card)
    const end1 = H(sc, "The series so far", { y: 78, size: 56, font: "serif", weight: 600 });
    gsap.set(end1, { autoAlpha: 0 });
    fadeOut(ttl, at("t7", 0), 0.4);
    fadeIn(end1, at("t7", 0.3), 0.6);
    const ser = DATA.series;
    const pos2 = i => (i < 6 ? { x: 800 + (i - 2.5) * 250, y: 270 } : { x: 800 + (i - 6 - 2.5) * 250, y: 470 });
    const cards = ser.map((s, i) => {
      const { x, y } = pos2(i), col = LEVEL_COLOR[s.level], nx = i === 11;
      const r2 = rect(sc, x - 110, y - 70, 220, 140, col, { fill: hexA(col, nx ? 0.04 : 0.08), rx: 12, sw: 2.5, dash: nx ? "9 7" : "" });
      const n = H(sc, nx ? `Episode ${s.n} · next` : `Episode ${s.n}`, { x, y: y - 40, size: 18, color: C.dim, font: "mono" });
      const t = H(sc, s.title, { x, y: y + 12, size: 23, weight: 600, wrap: 196 });
      return { r2, n, t, col, x, y };
    });
    const showCard = (i, t) => { show(cards[i].r2, t, 0.4); fadeIn([cards[i].n, cards[i].t], t + 0.05, 0.4, { dy: 8 }); };
    [0, 1, 2, 3, 4].forEach((i, k) => showCard(i, frac("t7", [0.34, 0.44, 0.54, 0.64, 0.84][k])));
    showCard(5, at("t8", 0.3));
    showCard(6, frac("t8", 0.2));
    [7, 8, 9, 10].forEach((i, k) => { showCard(i, frac("t8", [0.48, 0.62, 0.74, 0.88][k])); });

    // t9: one episode is left; the five deep dives
    showCard(11, at("t9", 0.3));
    const bx = cards[7].x - 110, bx2 = cards[11].x + 110;
    const brk = S(sc.svg, "path", { d: `M${bx},572 L${bx},584 L${bx2},584 L${bx2},572` }, { fill: "none", stroke: LEVEL_COLOR["Deep dive"], strokeWidth: 3 });
    hide(brk);
    const brkL = H(sc, "five deep dives", { x: (bx + bx2) / 2, y: 620, size: 24, color: LEVEL_COLOR["Deep dive"], weight: 600 });
    draw(brk, frac("t9", 0.55), 0.8);
    fadeIn(brkL, frac("t9", 0.65), 0.4, { dy: 0 });
    const what = H(sc, "Advanced RAG and evals: find the right text, and measure the result", { x: 800, y: 740, size: 28, color: LEVEL_COLOR["Deep dive"] });
    fadeIn(what, frac("t9", 0.72), 0.5);
  }

  return { loop, plan, context, memory, team };
})();
