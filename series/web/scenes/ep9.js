/* Episode 9 - Alignment and reasoning. Contract: OUTLINE.md. N = episodes/ep9.py nums(). */
SCENES_BY_EP.ep9 = (() => {
  const f1 = v => v.toFixed(1), f2 = v => v.toFixed(2), f3 = v => v.toFixed(3);
  const sgn = v => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(2);
  const hide = els => gsap.set(els, { autoAlpha: 0 });
  const aEls = a => [a.line, a.tip];
  function title(sc, text, key) { write(H(sc, text, { y: 78, size: 56, font: "serif", weight: 600 }), at(key, 0.1), 1.0); }
  /* a plain rectangle (no label), hidden until shown */
  function rect(sc, x, y, w, h, color, o = {}) {
    const r = S(sc.svg, "rect", { x, y, width: w, height: h, rx: o.rx ?? 12 },
      { fill: o.fill === undefined ? hexA(color, 0.08) : o.fill, stroke: color, strokeWidth: o.sw || 2.5, strokeDasharray: o.dash || "" });
    hide(r);
    return r;
  }
  /* a text block that keeps its line breaks and wraps at width w; top-left at (x, y) */
  function para(sc, text, x, y, w, o = {}) {
    const e = H(sc, text, { anchor: "left", x, y, size: o.size || 20, color: o.color || C.fg, font: o.font || "mono", wrap: w, align: "left" });
    e.style.whiteSpace = "pre-wrap";
    e.style.lineHeight = "1.45";
    gsap.set(e, { yPercent: 0 });
    return e;
  }
  function mark(sc, ok, x, y, size = 30) { return H(sc, ok ? "✓" : "✗", { x, y, size, color: ok ? C.green : C.red, weight: 700 }); }
  /* an arrow along a polyline; the last segment carries the head */
  function elbow(sc, pts, color, w = 4, head = 16) {
    const n = pts.length, [x2, y2] = pts[n - 1], [x1, y1] = pts[n - 2];
    const ang = Math.atan2(y2 - y1, x2 - x1), ux = Math.cos(ang), uy = Math.sin(ang);
    const body = pts.slice(0, n - 1).concat([[x2 - ux * head, y2 - uy * head]]);
    const line = S(sc.svg, "path", { d: pathD(body) }, { fill: "none", stroke: color, strokeWidth: w, strokeLinejoin: "round" });
    const px = -uy * head * 0.55, py = ux * head * 0.55;
    const tip = S(sc.svg, "polygon", { points: `${x2},${y2} ${x2 - ux * head + px},${y2 - uy * head + py} ${x2 - ux * head - px},${y2 - uy * head - py}` }, { fill: color });
    gsap.set([line, tip], { autoAlpha: 0 });
    return { line, tip };
  }
  /* call fn(p) with p from 0 to 1 while the playhead moves from t to t + d (safe under scrubbing) */
  function scrub(t, d, fn) {
    const o = { p: 0 };
    tl.to(o, { p: 1, duration: d, ease: "none", onUpdate: () => fn(o.p) }, t);
  }
  /* a clip rectangle that opens from left to right; use it to draw a curve in step with scrub() */
  let revN = 0;
  function reveal(sc, x, y, w, h) {
    const id = `rv9-${++revN}`;
    const cp = S(sc.svg, "clipPath", { id });
    const rc = S(cp, "rect", { x, y, width: 0, height: h });
    return { url: `url(#${id})`, run(t, d) { tl.to(rc, { attr: { width: w }, duration: d, ease: "none" }, t); } };
  }
  function line(sc, pts, color, width, clip) {
    const p = S(sc.svg, "path", Object.assign({ d: pathD(pts) }, clip ? { "clip-path": clip } : {}),
      { fill: "none", stroke: color, strokeWidth: width, strokeLinecap: "round", strokeLinejoin: "round" });
    hide(p);
    return p;
  }
  function dot(sc, x, y, color, r = 10) { const c = S(sc.svg, "circle", { cx: x, cy: y, r }, { fill: color }); hide(c); return c; }
  function person(sc, cx, cy) {
    const head = S(sc.svg, "circle", { cx, cy, r: 26 }, { fill: "none", stroke: C.dim, strokeWidth: 4 });
    const body = S(sc.svg, "path", { d: `M${cx - 52},${cy + 100} Q${cx},${cy + 24} ${cx + 52},${cy + 100}` }, { fill: "none", stroke: C.dim, strokeWidth: 4, strokeLinecap: "round" });
    hide([head, body]);
    return [head, body];
  }

  /* ---------------------------------------------------------------- 1 beyond imitation */
  function imitate(sc, N) {
    title(sc, "Beyond imitation", "i1");

    // i1: examples go into the model
    const cards = [0, 1, 2].map(i => {
      const y = 260 + i * 100;
      return { r: rect(sc, 120, y - 36, 540, 72, C.green), t: H(sc, `example ${i + 1}:  prompt → good answer`, { anchor: "left", x: 148, y, size: 24, font: "mono" }), y };
    });
    const model = box(sc, 1140, 360, 320, 130, C.purple, "model", { size: 40, sub: "supervised fine-tuning" });
    const arrs = cards.map(c => arrow(sc, 676, c.y, 968, 360 + (c.y - 360) * 0.25, C.dim, 3, 14));
    const copy = H(sc, "the model learns to copy them", { x: 1140, y: 480, size: 24, color: C.dim });
    cards.forEach((c, i) => { show(c.r, at("i1", 0.4 + i * 0.3), 0.4); fadeIn(c.t, at("i1", 0.45 + i * 0.3), 0.4, { dy: 0 }); });
    fadeIn(model.els, frac("i1", 0.5), 0.5, { dy: 0 });
    arrs.forEach((a, i) => drawArrow(a, frac("i1", 0.55) + i * 0.15, 0.4));
    fadeIn(copy, frac("i1", 0.8), 0.4, { dy: 0 });
    fadeOut([...cards.flatMap(c => [c.r, c.t]), ...model.els, ...arrs.flatMap(aEls), copy], at("i2", 0), 0.4);

    // i2: the model stops at the level of its examples
    const base = 740, top = 420;
    const ya = S(sc.svg, "line", { x1: 300, y1: base, x2: 300, y2: 260 }, { stroke: C.grid, strokeWidth: 2.5 });
    const xa = S(sc.svg, "line", { x1: 300, y1: base, x2: 1300, y2: base }, { stroke: C.grid, strokeWidth: 2.5 });
    const bEx = S(sc.svg, "rect", { x: 450, y: top, width: 160, height: base - top, rx: 6 }, { fill: hexA(C.green, 0.5), stroke: C.green, strokeWidth: 2.5 });
    const bMo = S(sc.svg, "rect", { x: 800, y: base, width: 160, height: 0, rx: 6 }, { fill: hexA(C.purple, 0.5), stroke: C.purple, strokeWidth: 2.5 });
    const dash = S(sc.svg, "line", { x1: 330, y1: top, x2: 1250, y2: top }, { stroke: C.yellow, strokeWidth: 3, strokeDasharray: "12 9" });
    hide([ya, xa, bEx, bMo, dash]);
    const ql = H(sc, "quality", { anchor: "left", x: 316, y: 250, size: 22, color: C.dim });
    const dl = H(sc, "quality of the examples", { anchor: "left", x: 1010, y: top - 26, size: 24, color: C.yellow });
    const l1 = H(sc, "examples", { x: 530, y: base + 36, size: 26, color: C.green });
    const l2 = H(sc, "model", { x: 880, y: base + 36, size: 26, color: C.purple });
    const up = arrow(sc, 880, top - 10, 880, 300, C.red, 4, 16);
    const no = H(sc, "cannot go higher", { x: 880, y: 272, size: 24, color: C.red });
    const note = H(sc, "an illustration", { x: 800, y: 850, size: 20, color: C.dim });
    draw(ya, at("i2", 0.1), 0.5); draw(xa, at("i2", 0.1), 0.5);
    fadeIn([ql, note], at("i2", 0.3), 0.4, { dy: 0 });
    fadeIn([bEx, l1], at("i2", 0.5), 0.5, { dy: 0 });
    tl.set(bMo, { autoAlpha: 1 }, frac("i2", 0.3));
    tl.to(bMo, { attr: { y: top, height: base - top }, duration: 1.3, ease: "power2.out" }, frac("i2", 0.3));
    fadeIn(l2, frac("i2", 0.3), 0.4, { dy: 0 });
    draw(dash, frac("i2", 0.55), 0.6); fadeIn(dl, frac("i2", 0.6), 0.4, { dy: 0 });
    drawArrow(up, frac("i2", 0.7), 0.4);
    const x2 = cross(sc, 880, 350, 26, 26, frac("i2", 0.78));
    fadeIn(no, frac("i2", 0.8), 0.3, { dy: 0 });
    const g2 = [ya, xa, bEx, bMo, dash, ql, dl, l1, l2, ...aEls(up), no, ...x2];
    fadeOut(g2, at("i3", 0), 0.4);

    // i3: picking is easier than writing
    const hard = box(sc, 440, 320, 560, 120, C.red, "write a perfect answer", { size: 30 });
    const easy = box(sc, 1160, 320, 560, 120, C.green, "pick the better of two", { size: 30 });
    const hb = rect(sc, 160, 470, 480, 36, C.red, { fill: hexA(C.red, 0.5), rx: 6 });
    const eb = rect(sc, 880, 470, 160, 36, C.green, { fill: hexA(C.green, 0.5), rx: 6 });
    gsap.set([hb, eb], { scaleX: 0, transformOrigin: "0% 50%" });
    const hl = H(sc, "a lot of effort", { x: 400, y: 545, size: 24, color: C.red });
    const el3 = H(sc, "little effort", { x: 960, y: 545, size: 24, color: C.green });
    fadeIn(hard.els, at("i3", 0.2), 0.5, { dy: 0 });
    tl.set(hb, { autoAlpha: 1 }, frac("i3", 0.3)); tl.to(hb, { scaleX: 1, duration: 0.8, ease: "power2.out" }, frac("i3", 0.3));
    fadeIn(hl, frac("i3", 0.45), 0.4, { dy: 0 });
    fadeIn(easy.els, frac("i3", 0.45), 0.5, { dy: 0 });
    tl.set(eb, { autoAlpha: 1 }, frac("i3", 0.6)); tl.to(eb, { scaleX: 1, duration: 0.5, ease: "power2.out" }, frac("i3", 0.6));
    fadeIn(el3, frac("i3", 0.75), 0.4, { dy: 0 });
    fadeOut([...hard.els, ...easy.els, hb, eb, hl, el3, note], at("i4", 0), 0.4);

    // i4: a person compares two answers; each pick is a pair
    const T4 = N.tide;
    const pc = rect(sc, 380, 150, 840, 70, C.fg, { fill: hexA(C.fg, 0.04) });
    const pt = H(sc, `prompt:  ${T4.prompt}`, { x: 800, y: 185, size: 30, font: "mono" });
    const ca = rect(sc, 120, 270, 640, 210, C.blue), cb = rect(sc, 840, 270, 640, 210, C.orange);
    const la = H(sc, "answer A", { anchor: "left", x: 146, y: 300, size: 24, color: C.blue, weight: 700 });
    const lb = H(sc, "answer B", { anchor: "left", x: 866, y: 300, size: 24, color: C.orange, weight: 700 });
    const ta = para(sc, T4.a, 146, 335, 590, { size: 24, font: "body" });
    const tb = para(sc, T4.b, 866, 335, 590, { size: 24, font: "body" });
    const pp = person(sc, 800, 590);
    const pl = H(sc, "a person", { x: 800, y: 718, size: 22, color: C.dim });
    const pick = arrow(sc, 758, 580, 590, 500, C.green, 4, 16);
    const tick = S(sc.svg, "path", { d: "M690,296 l16,16 l30,-34" }, { fill: "none", stroke: C.green, strokeWidth: 6, strokeLinecap: "round" });
    gsap.set(tick, { autoAlpha: 0 });
    const chosen = chip(sc, "chosen", C.green, { x: 440, y: 520, size: 24 });
    const rejected = chip(sc, "rejected", C.red, { x: 1160, y: 520, size: 24 });
    const pairs = H(sc, `pairs collected: 0`, { x: 800, y: 810, size: 32, color: C.yellow, font: "mono" });
    show(pc, at("i4", 0.3), 0.4); fadeIn(pt, at("i4", 0.4), 0.4, { dy: 0 });
    show([ca, cb], frac("i4", 0.15), 0.4); fadeIn([la, lb, ta, tb], frac("i4", 0.17), 0.5, { dy: 0 });
    fadeIn([...pp, pl], frac("i4", 0.34), 0.4, { dy: 0 });
    drawArrow(pick, frac("i4", 0.45), 0.4); draw(tick, frac("i4", 0.5), 0.4);
    fadeIn([chosen, rejected], frac("i4", 0.58), 0.4, { dy: 0 });
    fadeIn(pairs, frac("i4", 0.68), 0.3, { dy: 0 });
    counter(pairs, frac("i4", 0.7), 0, N.rm.n_train, 2.0, v => `pairs collected: ${Math.round(v)}`);
  }

  /* ---------------------------------------------------------------- 2 the reward model */
  function reward(sc, N) {
    const R = N.rm;
    title(sc, "The reward model", "w1");

    // w1: prompt + answer in, one number out
    const inp = chip(sc, "prompt + answer", C.blue, { x: 300, y: 430, size: 30 });
    const rmb = box(sc, 800, 430, 340, 140, C.purple, "reward model", { size: 36 });
    const a1 = arrow(sc, 440, 430, 624, 430, C.dim, 4, 16), a2 = arrow(sc, 972, 430, 1118, 430, C.dim, 4, 16);
    const out = H(sc, f2(R.r_a), { x: 1270, y: 430, size: 64, color: C.yellow, font: "mono", weight: 600 });
    const outL = H(sc, "the reward: one number", { x: 1270, y: 505, size: 24, color: C.dim });
    fadeIn(inp, at("w1", 0.4), 0.4, { dy: 0 });
    drawArrow(a1, frac("w1", 0.28), 0.4); fadeIn(rmb.els, frac("w1", 0.32), 0.5, { dy: 0 });
    drawArrow(a2, frac("w1", 0.55), 0.4); fadeIn(out, frac("w1", 0.62), 0.4, { dy: 0 });
    fadeIn(outL, frac("w1", 0.78), 0.4, { dy: 0 });
    fadeOut([inp, ...rmb.els, ...aEls(a1), ...aEls(a2), out, outL], at("w2", 0), 0.4);

    // w2: a real reward model, and the toy of this episode
    const rl = H(sc, "a real reward model", { anchor: "left", x: 110, y: 205, size: 26, color: C.dim, weight: 600 });
    const llm = box(sc, 420, 300, 240, 100, C.blue, "LLM", { size: 36 });
    const head = box(sc, 800, 300, 300, 100, C.yellow, "new output layer", { size: 26 });
    const ra1 = arrow(sc, 544, 300, 646, 300, C.dim, 4, 14), ra2 = arrow(sc, 954, 300, 1056, 300, C.dim, 4, 14);
    const rr = chip(sc, "reward", C.purple, { x: 1190, y: 300, size: 28 });
    const tl2 = H(sc, "the toy in this video", { anchor: "left", x: 110, y: 465, size: 26, color: C.dim, weight: 600 });
    const feats = R.features.map((nm, i) => chip(sc, `${nm}   ${f2(R.feat_a[i])}`, C.teal, { x: 330, y: 560 + i * 80, size: 26 }));
    const fa = feats.map((_, i) => arrow(sc, 496, 560 + i * 80, 640, 640 + (i - 1) * 24, C.dim, 3, 12));
    const tb = box(sc, 780, 640, 280, 120, C.purple, "r = w · x", { size: 34, sub: "3 weights" });
    const ra3 = arrow(sc, 930, 640, 1036, 640, C.dim, 4, 14);
    const rr2 = chip(sc, "reward", C.purple, { x: 1190, y: 640, size: 28 });
    fadeIn(rl, at("w2", 0.2), 0.4, { dy: 0 });
    fadeIn(llm.els, frac("w2", 0.1), 0.5, { dy: 0 }); drawArrow(ra1, frac("w2", 0.17), 0.3);
    fadeIn(head.els, frac("w2", 0.21), 0.5, { dy: 0 }); drawArrow(ra2, frac("w2", 0.3), 0.3);
    fadeIn(rr, frac("w2", 0.34), 0.4, { dy: 0 });
    fadeIn(tl2, frac("w2", 0.52), 0.4, { dy: 0 });
    fadeIn(feats, frac("w2", 0.56), 0.4, { stagger: 0.18, dy: 0 });
    fa.forEach((a, i) => drawArrow(a, frac("w2", 0.72) + i * 0.1, 0.3));
    fadeIn(tb.els, frac("w2", 0.76), 0.5, { dy: 0 });
    drawArrow(ra3, frac("w2", 0.86), 0.3); fadeIn(rr2, frac("w2", 0.9), 0.4, { dy: 0 });
    fadeOut([rl, ...llm.els, ...head.els, ...aEls(ra1), ...aEls(ra2), rr, tl2, ...feats, ...fa.flatMap(aEls), ...tb.els, ...aEls(ra3), rr2], at("w3", 0), 0.4);

    // w3: the chance that A beats B
    const cA = box(sc, 380, 250, 420, 130, C.blue, "answer A", { size: 34, sub: `reward ${f2(R.r_a)}` });
    const cB = box(sc, 1220, 250, 420, 130, C.orange, "answer B", { size: 34, sub: `reward ${f2(R.r_b)}` });
    const ft = H(sc, "chance that A beats B  =  sigmoid( r_A − r_B )", { x: 800, y: 430, size: 34, font: "mono" });
    const nt = H(sc, `= sigmoid( ${f2(R.r_a)} − ${f2(R.r_b)} )  =  sigmoid( ${f2(R.diff)} )  =  ${f2(R.p_a)}`, { x: 800, y: 500, size: 34, font: "mono", color: C.yellow });
    const track = rect(sc, 400, 590, 800, 40, C.grid, { fill: "none", rx: 8 });
    const fill = S(sc.svg, "rect", { x: 400, y: 590, width: 800 * R.p_a, height: 40, rx: 8 }, { fill: hexA(C.yellow, 0.55), stroke: C.yellow, strokeWidth: 2.5 });
    gsap.set(fill, { autoAlpha: 0, scaleX: 0, transformOrigin: "0% 50%" });
    const t0 = H(sc, "0", { x: 400, y: 660, size: 22, color: C.dim, font: "mono" }), t1 = H(sc, "1", { x: 1200, y: 660, size: 22, color: C.dim, font: "mono" });
    const pl2 = H(sc, `chance that A beats B: ${f2(R.p_a)}`, { x: 800, y: 715, size: 30, color: C.yellow });
    fadeIn([...cA.els, ...cB.els], at("w3", 0.2), 0.5, { dy: 0, stagger: 0.15 });
    fadeIn(ft, frac("w3", 0.25), 0.5);
    fadeIn(nt, frac("w3", 0.5), 0.5);
    show(track, frac("w3", 0.68), 0.4); fadeIn([t0, t1], frac("w3", 0.7), 0.3, { dy: 0 });
    tl.set(fill, { autoAlpha: 1 }, frac("w3", 0.74)); tl.to(fill, { scaleX: 1, duration: 0.7, ease: "power2.out" }, frac("w3", 0.74));
    fadeIn(pl2, frac("w3", 0.88), 0.4, { dy: 0 });
    fadeOut([...cA.els, ...cB.els, ft, nt, track, fill, t0, t1, pl2], at("w4", 0), 0.4);

    // w4: the loss
    const ax = axes(sc, { x: 300, y: 190, w: 1000, h: 460, xr: [-4, 4], yr: [0, 4.2], grid: true,
      xticks: [-4, -2, 0, 2, 4], yticks: [0, 1, 2, 3, 4], xlabel: "reward of the chosen answer − reward of the rejected answer", ylabel: "loss" });
    const cv = line(sc, R.curve_x.map((x, i) => [ax.X(x), ax.Y(R.curve_y[i])]), C.blue, 5, ax.clip);
    const dGood = dot(sc, ax.X(R.diff), ax.Y(R.loss_right), C.green), dBad = dot(sc, ax.X(-R.diff), ax.Y(R.loss_wrong), C.red);
    const lGood = H(sc, `chosen is higher: loss ${f2(R.loss_right)}`, { anchor: "left", x: ax.X(R.diff) - 30, y: ax.Y(R.loss_right) - 62, size: 24, color: C.green, weight: 600 });
    const lBad = H(sc, `rejected is higher: loss ${f2(R.loss_wrong)}`, { anchor: "left", x: ax.X(-R.diff) + 22, y: ax.Y(R.loss_wrong) - 32, size: 24, color: C.red, weight: 600 });
    ax.show(at("w4", 0.1), 0.8);
    draw(cv, at("w4", 0.5), 1.0);
    fadeIn([dGood, lGood], frac("w4", 0.4), 0.4, { dy: 0 });
    fadeIn([dBad, lBad], frac("w4", 0.68), 0.4, { dy: 0 });
    fadeOut([...ax.all, cv, dGood, dBad, lGood, lBad], at("w5", 0), 0.4);

    // w5: training lowers the loss; the weights grow; the result on new pairs
    const bx = axes(sc, { x: 150, y: 220, w: 700, h: 420, xr: [0, R.epochs], yr: [0.4, 0.72], grid: true,
      xticks: [0, 40, 80, 120], yticks: [0.4, 0.5, 0.6, 0.7], yfmt: v => v.toFixed(1), xlabel: "training step", ylabel: "loss" });
    const rv = reveal(sc, bx.x, bx.y - 6, bx.w, bx.h + 12);
    const lc = line(sc, R.hist_loss.map((v, i) => [bx.X(i), bx.Y(v)]), C.blue, 5, rv.url);
    const wh = H(sc, "learned weights", { anchor: "left", x: 960, y: 240, size: 24, color: C.dim, weight: 600 });
    const WX = 1210, WS = 85;
    const wrows = R.features.map((nm, i) => {
      const y = 320 + i * 80;
      const lab = H(sc, nm, { anchor: "left", x: 960, y, size: 26 });
      const b = S(sc.svg, "rect", { x: WX, y: y - 17, width: 0, height: 34, rx: 5 }, { fill: hexA(C.teal, 0.55), stroke: C.teal, strokeWidth: 2 });
      const v = H(sc, "0.00", { anchor: "left", x: WX + 10, y, size: 24, font: "mono", color: C.teal });
      hide(b);
      return { lab, b, v };
    });
    const agL = H(sc, "agrees with people on new pairs", { anchor: "left", x: 960, y: 580, size: 22, color: C.dim });
    const agV = H(sc, `${f1(R.hist_acc[0])} %`, { anchor: "left", x: 960, y: 645, size: 60, color: C.yellow, font: "mono", weight: 600 });
    const lim = H(sc, `limit: ${f1(R.ceiling)} %. The people are noisy, so no model reaches 100 %.`, { anchor: "left", x: 960, y: 740, size: 22, color: C.dim, wrap: 560, align: "left" });
    const rd = H(sc, `step 0   loss ${f3(R.hist_loss[0])}`, { x: 500, y: 775, size: 26, font: "mono" });
    bx.show(at("w5", 0.1), 0.7);
    fadeIn([wh, ...wrows.flatMap(r => [r.lab, r.v]), agL, agV, rd], at("w5", 0.3), 0.4, { dy: 0 });
    show(wrows.map(r => r.b), at("w5", 0.3), 0.3);
    gsap.set(lc, { autoAlpha: 1 });
    const t5 = at("w5", 0.5), d5 = dur("w5") * 0.55;
    rv.run(t5, d5);
    scrub(t5, d5, p => {
      const i = Math.round(p * R.epochs);
      rd.textContent = `step ${i}   loss ${f3(R.hist_loss[i])}`;
      agV.textContent = `${f1(R.hist_acc[i])} %`;
      wrows.forEach((r, j) => {
        const w = R.hist_w[i][j], len = Math.max(0, w) * WS;
        r.b.setAttribute("width", len);
        r.v.textContent = f2(w);
        r.v.style.left = (WX + len + 10) + "px";
      });
    });
    fadeIn(lim, frac("w5", 0.82), 0.4, { dy: 0 });
  }

  /* ---------------------------------------------------------------- 3 RLHF with PPO */
  function rlhf(sc, N) {
    const K = N.kl, NC = K.cands.length;
    title(sc, "RLHF with PPO", "l1");

    // l1: the loop: policy -> answer -> reward model -> score -> update
    const prompt = chip(sc, "prompt", C.orange, { x: 190, y: 290, size: 26 });
    const pol = box(sc, 530, 290, 240, 110, C.blue, "policy", { size: 36 });
    const ans = chip(sc, "answer", C.teal, { x: 860, y: 290, size: 26 });
    const rmb = box(sc, 1210, 290, 300, 110, C.purple, "reward model", { size: 30 });
    const score = chip(sc, "score", C.yellow, { x: 1210, y: 480, size: 26 });
    const e1 = arrow(sc, 256, 290, 404, 290, C.dim, 4, 14), e2 = arrow(sc, 652, 290, 792, 290, C.dim, 4, 14);
    const e3 = arrow(sc, 930, 290, 1056, 290, C.dim, 4, 14), e4 = arrow(sc, 1210, 348, 1210, 442, C.dim, 4, 14);
    const upd = elbow(sc, [[1140, 480], [530, 480], [530, 354]], C.yellow, 5, 16);
    const updL = H(sc, "update: make the score go up", { x: 835, y: 525, size: 26, color: C.yellow, weight: 600 });
    fadeIn(pol.els, at("l1", 0.3), 0.5, { dy: 0 });
    fadeIn(prompt, frac("l1", 0.1), 0.4, { dy: 0 }); drawArrow(e1, frac("l1", 0.12), 0.3);
    drawArrow(e2, frac("l1", 0.26), 0.3); fadeIn(ans, frac("l1", 0.3), 0.4, { dy: 0 });
    drawArrow(e3, frac("l1", 0.38), 0.3); fadeIn(rmb.els, frac("l1", 0.42), 0.5, { dy: 0 });
    drawArrow(e4, frac("l1", 0.52), 0.3); fadeIn(score, frac("l1", 0.56), 0.4, { dy: 0 });
    drawArrow(upd, frac("l1", 0.72), 0.9); fadeIn(updL, frac("l1", 0.8), 0.4, { dy: 0 });
    fadeOut([prompt, ...pol.els, ans, ...rmb.els, score, ...[e1, e2, e3, e4, upd].flatMap(aEls), updL], at("l2", 0), 0.4);

    // l2-l4: five candidate answers; one fools the reward model; the KL penalty
    const ROW = i => 270 + i * 72, NAMEX = 110, RMX = 470, TRX = 980, PX = 1300, sRM = 150, sTR = 200, sP = 180;
    const hackIdx = K.cands.reduce((m, c, i, a) => (c.rm - c.true > a[m].rm - a[m].true ? i : m), 0);
    const hdr = (txt, x, color) => H(sc, txt, { anchor: "left", x, y: 205, size: 22, color, weight: 600 });
    const hRM = hdr("reward model score", RMX, C.purple), hTR = hdr("what people want", TRX, C.green), hPol = hdr("reference model", PX, C.blue);
    const bar = (x, y, w, color) => { const b = S(sc.svg, "rect", { x, y: y - 15, width: w, height: 30, rx: 4 }, { fill: hexA(color, 0.7) }); hide(b); return b; };
    const rows = K.cands.map((c, i) => {
      const y = ROW(i), hk = i === hackIdx;
      return {
        nm: H(sc, c.name, { anchor: "left", x: NAMEX, y, size: 24, color: hk ? C.red : C.fg, weight: hk ? 700 : 500 }),
        b1: bar(RMX, y, c.rm * sRM, C.purple),
        v1: H(sc, f2(c.rm), { anchor: "left", x: RMX + c.rm * sRM + 12, y, size: 22, font: "mono", color: C.purple }),
        b2: bar(TRX, y, c.true * sTR, C.green),
        v2: H(sc, f2(c.true), { anchor: "left", x: TRX + c.true * sTR + 12, y, size: 22, font: "mono", color: C.green }),
        b3: bar(PX, y, 0, hk ? C.red : C.blue),
        v3: H(sc, "", { anchor: "left", x: PX + 12, y, size: 22, font: "mono", color: hk ? C.red : C.blue }),
      };
    });
    const hackBox = rect(sc, 96, ROW(hackIdx) - 34, 1450, 68, C.red, { fill: "none", sw: 3, rx: 10 });
    const hackL = H(sc, "high score, low quality: the reward model is fooled", { x: 800, y: 607, size: 22, color: C.red });
    const rd1 = H(sc, "", { anchor: "left", x: RMX, y: 665, size: 26, font: "mono", color: C.purple });
    const rd2 = H(sc, "", { anchor: "left", x: RMX, y: 710, size: 26, font: "mono", color: C.green });
    const objF = H(sc, "objective  =  reward  −  β · KL( policy ‖ reference )", { x: 800, y: 800, size: 32, font: "mono" });
    const setTxt = (el, txt) => { el.textContent = txt; el._txt = txt; };
    setTxt(rd1, `average score of the reward model: ${f2(K.settings[0].rm)}`);
    setTxt(rd2, `average of what people want: ${f2(K.settings[0].true)}`);
    rows.forEach((r, i) => setTxt(r.v3, f2(K.settings[0].p2[i])));

    // l2: the table, then the blind spot
    fadeIn([hRM, hTR], at("l2", 0.3), 0.4, { dy: 0 });
    rows.forEach((r, i) => {
      fadeIn(r.nm, at("l2", 0.4 + i * 0.12), 0.3, { dy: 0 });
      show([r.b1, r.b2], at("l2", 0.5 + i * 0.12), 0.3);
      fadeIn([r.v1, r.v2], at("l2", 0.6 + i * 0.12), 0.3, { dy: 0 });
    });
    draw(hackBox, frac("l2", 0.5), 0.6);
    fadeIn(hackL, frac("l2", 0.62), 0.4, { dy: 0 });
    fadeOut(hackL, at("l3", 0), 0.3);

    // l3: the penalty and the reference model
    fadeIn(objF, at("l3", 0.3), 0.5);
    fadeIn([hPol, ...rows.map(r => r.v3)], frac("l3", 0.55), 0.4, { dy: 0 });
    rows.forEach((r, i) => {
      show(r.b3, frac("l3", 0.55), 0.3);
      tl.to(r.b3, { attr: { width: K.settings[0].p[i] * sP }, duration: 0.7, ease: "power2.out" }, frac("l3", 0.55));
      tl.to(r.v3, { left: PX + K.settings[0].p[i] * sP + 12, duration: 0.7, ease: "power2.out" }, frac("l3", 0.55));
    });
    fadeIn([rd1, rd2], frac("l3", 0.75), 0.4, { dy: 0 });

    // l4: three values of beta
    function setPolicy(k, t, head) {
      const s = K.settings[k];
      swapText(hPol, t, head);
      rows.forEach((r, i) => {
        const w = s.p[i] * sP;
        tl.to(r.b3, { attr: { width: w }, duration: 0.7, ease: "power2.out" }, t);
        swapText(r.v3, t, f2(s.p2[i]));
        tl.to(r.v3, { left: PX + w + 12, duration: 0.7, ease: "power2.out" }, t);
      });
      swapText(rd1, t, `average score of the reward model: ${f2(s.rm)}`);
      swapText(rd2, t, `average of what people want: ${f2(s.true)}`);
    }
    pulse(objF, frac("l4", 0.06), 1.04, 0.6);
    setPolicy(1, frac("l4", 0.27), `policy, β = ${K.settings[1].beta}  (strong)`);
    setPolicy(2, frac("l4", 0.6), `policy, β = ${K.settings[2].beta}`);
    setPolicy(3, frac("l4", 0.78), `policy, β = ${K.settings[3].beta}  (weak)`);
    tl.to(rows[hackIdx].v3, { scale: 1.2, transformOrigin: "0% 50%", duration: 0.3, yoyo: true, repeat: 1 }, frac("l4", 0.9));
    const tbl = [hRM, hTR, hPol, hackBox, rd1, rd2, objF, ...rows.flatMap(r => [r.nm, r.b1, r.v1, r.b2, r.v2, r.b3, r.v3])];
    fadeOut(tbl, at("l5", 0), 0.4);

    // l5: the PPO clip
    const ax = axes(sc, { x: 300, y: 200, w: 1000, h: 450, xr: [0.4, 1.6], yr: [-1.8, 1.4], grid: true,
      xticks: [0.4, 1 - K.eps, 1, 1 + K.eps, 1.6], yticks: [-1, 0, 1], xfmt: v => v.toFixed(1), yfmt: v => v.toFixed(0),
      xlabel: "probability of the answer: new policy ÷ old policy", ylabel: "objective" });
    const band = rect(sc, ax.X(1 - K.eps), ax.y, ax.X(1 + K.eps) - ax.X(1 - K.eps), ax.h, C.yellow, { fill: hexA(C.yellow, 0.08), sw: 2, dash: "8 6", rx: 4 });
    const bandL = H(sc, "clip range", { x: (ax.X(1 - K.eps) + ax.X(1 + K.eps)) / 2, y: ax.y + 20, size: 22, color: C.yellow });
    const zline = S(sc.svg, "line", { x1: ax.x, y1: ax.Y(0), x2: ax.x + ax.w, y2: ax.Y(0) }, { stroke: C.grid, strokeWidth: 2, strokeDasharray: "6 6" });
    hide(zline);
    const cPos = line(sc, K.ratio.map((x, i) => [ax.X(x), ax.Y(K.clip_pos[i])]), C.green, 5, ax.clip);
    const cNeg = line(sc, K.ratio.map((x, i) => [ax.X(x), ax.Y(K.clip_neg[i])]), C.red, 5, ax.clip);
    const lPos = H(sc, "answer better than average", { anchor: "left", x: ax.X(0.42), y: ax.Y(1.25), size: 22, color: C.green, weight: 600 });
    const lNeg = H(sc, "answer worse than average", { anchor: "left", x: ax.X(0.42), y: ax.Y(-1.5), size: 22, color: C.red, weight: 600 });
    const flat = H(sc, "outside the clip range, a bigger change gives no extra gain", { x: 800, y: 800, size: 26, color: C.yellow });
    ax.show(at("l5", 0.2), 0.7);
    draw(zline, at("l5", 0.5), 0.5);
    draw(cPos, frac("l5", 0.2), 0.8); fadeIn(lPos, frac("l5", 0.25), 0.4, { dy: 0 });
    draw(cNeg, frac("l5", 0.3), 0.8); fadeIn(lNeg, frac("l5", 0.35), 0.4, { dy: 0 });
    show(band, frac("l5", 0.5), 0.5); fadeIn(bandL, frac("l5", 0.52), 0.4, { dy: 0 });
    fadeIn(flat, frac("l5", 0.72), 0.5);
    fadeOut([...ax.all, band, bandL, zline, cPos, cNeg, lPos, lNeg, flat], at("l6", 0), 0.4);

    // l6: four models in memory
    const defs = [
      ["policy", "writes answers", C.blue, true], ["critic", "predicts the reward", C.orange, true],
      ["reward model", "scores answers", C.purple, false], ["reference", "copy from before RL", C.teal, false]];
    const mb = defs.map(([nm, sub, col], i) => box(sc, 305 + i * 330, 340, 290, 130, col, nm, { size: 32, sub, subSize: 20 }));
    const st = defs.map(([, , , learns], i) => chip(sc, learns ? "learns" : "fixed", learns ? C.green : C.dim, { x: 305 + i * 330, y: 470, size: 24 }));
    const mem = H(sc, "four models in memory", { x: 800, y: 620, size: 34, color: C.yellow, weight: 600 });
    mb.forEach((b, i) => fadeIn(b.els, at("l6", 0.3 + i * 0.35), 0.5, { dy: 0 }));
    fadeIn(mem, frac("l6", 0.2), 0.5);
    fadeIn([st[0], st[1]], frac("l6", 0.3), 0.4, { stagger: 0.2, dy: 0 });
    pulse(mb[1].r, frac("l6", 0.5), 1.05, 0.7);
    fadeIn([st[2], st[3]], frac("l6", 0.68), 0.4, { stagger: 0.2, dy: 0 });
    fadeOut([...mb.flatMap(b => b.els), ...st, mem], at("l7", 0), 0.4);

    // l7: DPO
    const dpoL = H(sc, "DPO: direct preference optimization", { x: 800, y: 190, size: 32, color: C.blue, weight: 600 });
    const pairs = chip(sc, "pairs: chosen / rejected", C.orange, { x: 380, y: 480, size: 28 });
    const dpol = box(sc, 1130, 480, 300, 120, C.blue, "policy", { size: 36 });
    const da = arrow(sc, 590, 480, 970, 480, C.dim, 4, 16);
    const dl = H(sc, "simple loss", { x: 780, y: 445, size: 24, color: C.dim });
    const g1 = box(sc, 520, 700, 300, 90, C.dim, "reward model", { size: 28, fill: 0.03 }), g2 = box(sc, 1080, 700, 300, 90, C.dim, "RL loop", { size: 28, fill: 0.03 });
    fadeIn(dpoL, at("l7", 0.2), 0.5);
    fadeIn(pairs, frac("l7", 0.3), 0.4, { dy: 0 }); drawArrow(da, frac("l7", 0.36), 0.5); fadeIn(dl, frac("l7", 0.4), 0.4, { dy: 0 });
    fadeIn(dpol.els, frac("l7", 0.5), 0.5, { dy: 0 });
    fadeIn(g1.els, frac("l7", 0.62), 0.4, { dy: 0 }); const c1 = cross(sc, 520, 700, 130, 36, frac("l7", 0.7));
    fadeIn(g2.els, frac("l7", 0.76), 0.4, { dy: 0 }); cross(sc, 1080, 700, 130, 36, frac("l7", 0.84));
  }

  /* ---------------------------------------------------------------- 4 verifiable rewards */
  function verify(sc, N) {
    const V = N.ver, good = V.replies[0], bad = V.replies[1];
    title(sc, "Verifiable rewards", "v1");

    // v1: a program checks the answer
    const kinds = [chip(sc, "maths: compare the number", C.orange, { x: 330, y: 290, size: 28 }), chip(sc, "code: run the tests", C.orange, { x: 330, y: 400, size: 28 })];
    const prog = box(sc, 820, 345, 260, 120, C.blue, "program", { size: 36 });
    const ka = [arrow(sc, 560, 290, 690, 335, C.dim, 4, 14), arrow(sc, 520, 400, 690, 360, C.dim, 4, 14)];
    const outA = arrow(sc, 960, 345, 1086, 345, C.dim, 4, 14);
    const outC = chip(sc, "reward: 1 or 0", C.green, { x: 1260, y: 345, size: 30 });
    const ghost = box(sc, 820, 620, 340, 100, C.dim, "reward model", { size: 30, fill: 0.03 });
    const noRm = H(sc, "not needed", { x: 820, y: 700, size: 24, color: C.dim });
    fadeIn(kinds, at("v1", 0.5), 0.4, { stagger: 0.2, dy: 0 });
    ka.forEach(a => drawArrow(a, frac("v1", 0.3), 0.4)); fadeIn(prog.els, frac("v1", 0.34), 0.5, { dy: 0 });
    drawArrow(outA, frac("v1", 0.45), 0.3); fadeIn(outC, frac("v1", 0.5), 0.4, { dy: 0 });
    fadeIn(ghost.els, frac("v1", 0.66), 0.4, { dy: 0 }); const xg = cross(sc, 820, 620, 150, 40, frac("v1", 0.74));
    fadeIn(noRm, frac("v1", 0.8), 0.4, { dy: 0 });
    fadeOut([...kinds, ...prog.els, ...ka.flatMap(aEls), ...aEls(outA), outC, ...ghost.els, ...xg, noRm], at("v2", 0), 0.4);

    // v2: accuracy reward on the right reply
    const lines = good.text.split("\n");
    const LH = 38, CX = 110, CY = 240;
    const qc = chip(sc, V.question, C.yellow, { x: 800, y: 175, size: 30, font: "mono" });
    const card = rect(sc, CX, CY, 720, (lines.length - 1) * LH + 84, C.fg, { fill: hexA(C.fg, 0.03), rx: 14 });
    const rowsT = lines.map((t, i) => H(sc, t, { anchor: "left", x: CX + 26, y: CY + 32 + i * LH, size: 24, font: "mono", color: i === lines.length - 1 ? C.fg : C.dim }));
    const lastY = CY + 32 + (lines.length - 1) * LH;
    const hiA = rect(sc, CX + 10, lastY - 20, 700, 40, C.yellow, { fill: hexA(C.yellow, 0.14), rx: 6 });
    const hiT = rect(sc, CX + 10, CY + 32 - 20, 700, (lines.length - 1) * LH + 2, C.blue, { fill: hexA(C.blue, 0.08), rx: 6 });
    const tagT = H(sc, "think: the steps", { anchor: "right", x: CX + 704, y: CY + 32 + 2, size: 20, color: C.blue });
    const tagA = H(sc, "answer: the result", { anchor: "right", x: CX + 704, y: lastY + 36, size: 20, color: C.yellow });
    const rd = chip(sc, `reads: ${V.truth}`, C.yellow, { x: 1230, y: 300, size: 30, font: "mono" });
    const known = H(sc, `known answer: ${V.truth}`, { x: 1230, y: 375, size: 24, color: C.dim });
    const eq = H(sc, `${V.truth} = ${V.truth}   ✓`, { x: 1230, y: 450, size: 40, color: C.green, font: "mono", weight: 600 });
    const acc = H(sc, `accuracy reward = ${f1(V.replies[0].accuracy * V.acc_w)}`, { x: 1230, y: 530, size: 28, color: C.green, weight: 600 });
    const toRd = arrow(sc, 836, lastY, 1118, 300, C.yellow, 3, 14);
    fadeIn(qc, at("v2", 0.2), 0.4, { dy: 0 });
    show(card, frac("v2", 0.18), 0.4); fadeIn(rowsT, frac("v2", 0.2), 0.5, { dy: 0, stagger: 0.06 });
    show(hiA, frac("v2", 0.4), 0.4);
    drawArrow(toRd, frac("v2", 0.5), 0.4); fadeIn(rd, frac("v2", 0.56), 0.4, { dy: 0 });
    fadeIn([known, eq], frac("v2", 0.66), 0.4, { dy: 0, stagger: 0.2 });
    fadeIn(acc, frac("v2", 0.82), 0.4, { dy: 0 });

    // v3: format reward
    const fmt = H(sc, `format reward = ${f1(V.replies[0].format * V.fmt_w)}`, { x: 1230, y: 600, size: 28, color: C.blue, weight: 600 });
    const fmtN = H(sc, "think tag, then answer tag", { x: 1230, y: 640, size: 22, color: C.dim });
    show(hiT, at("v3", 0.6), 0.4); fadeIn([tagT, tagA], at("v3", 0.7), 0.4, { dy: 0 });
    fadeIn([fmt, fmtN], frac("v3", 0.62), 0.4, { dy: 0, stagger: 0.2 });
    fadeOut([qc, card, ...rowsT, hiA, hiT, tagT, tagA, rd, known, eq, acc, ...aEls(toRd), fmt, fmtN], at("v4", 0), 0.4);

    // v4: five replies, two rewards, the sum
    const COL = { acc: 880, fmt: 1060, tot: 1240 };
    const hd = [["reply", 130, "left"], ["accuracy", COL.acc, "mid"], ["format", COL.fmt, "mid"], ["total", COL.tot, "mid"]]
      .map(([t, x, al]) => H(sc, t, { anchor: al === "left" ? "left" : undefined, x, y: 200, size: 22, color: C.dim, weight: 600 }));
    const best = V.replies.reduce((m, r, i, a) => (r.total > a[m].total ? i : m), 0);
    const trs = V.replies.map((rp, i) => {
      const y = 280 + i * 78;
      return [
        H(sc, rp.label, { anchor: "left", x: 130, y, size: 26, color: i === best ? C.fg : C.dim }),
        H(sc, f1(rp.accuracy), { x: COL.acc, y, size: 28, font: "mono", color: rp.accuracy > 0 ? C.green : C.dim }),
        H(sc, f1(rp.format), { x: COL.fmt, y, size: 28, font: "mono", color: rp.format > 0 ? C.blue : C.dim }),
        H(sc, f1(rp.total), { x: COL.tot, y, size: 32, font: "mono", weight: 700, color: i === best ? C.yellow : C.fg }),
      ];
    });
    const sumF = H(sc, `total  =  ${V.acc_w} × accuracy  +  ${V.fmt_w} × format`, { x: 800, y: 730, size: 30, font: "mono" });
    const bestBox = rect(sc, 110, 280 + best * 78 - 34, 1300, 68, C.yellow, { fill: hexA(C.yellow, 0.07), sw: 3, rx: 10 });
    fadeIn(hd, at("v4", 0.2), 0.4, { dy: 0 });
    trs.forEach((r, i) => fadeIn(r, at("v4", 0.4 + i * 0.25), 0.4, { dy: 0 }));
    fadeIn(sumF, at("v4", 0.3), 0.5);
    show(bestBox, frac("v4", 0.72), 0.5);
    fadeOut([...hd, ...trs.flat(), sumF, bestBox], at("v5", 0), 0.4);

    // v5-v6: outcome reward scores the answer; process reward scores each step
    const steps = V.steps_bad.map(s => s.step);
    const ansVal = (/<answer>(.*?)<\/answer>/.exec(bad.text) || [])[1];
    const RY = i => 270 + i * 95, RX = 250, RW = 900;
    const mode = H(sc, "outcome reward", { x: 800, y: 190, size: 32, color: C.yellow, weight: 600 });
    const srows = steps.map((s, i) => ({ r: rect(sc, RX, RY(i) - 36, RW, 72, C.fg, { fill: hexA(C.fg, 0.03) }),
      t: H(sc, `step ${i + 1}:   ${s}`, { anchor: "left", x: RX + 24, y: RY(i), size: 24, font: "mono" }) }));
    const nA = steps.length;
    const arow = rect(sc, RX, RY(nA) - 36, RW, 72, C.yellow, { fill: hexA(C.yellow, 0.1) });
    const at_ = H(sc, `answer:   ${ansVal}`, { anchor: "left", x: RX + 24, y: RY(nA), size: 26, font: "mono", weight: 700 });
    const sc5 = H(sc, `accuracy reward = ${f1(bad.accuracy * V.acc_w)}`, { anchor: "left", x: RX + RW + 30, y: RY(nA), size: 24, color: C.red, weight: 600 });
    const only = H(sc, "scores only this row", { anchor: "left", x: RX + RW + 30, y: RY(nA) + 34, size: 20, color: C.dim });
    fadeIn(mode, at("v5", 0.2), 0.4, { dy: 0 });
    srows.forEach((s, i) => { show(s.r, at("v5", 0.3 + i * 0.15), 0.3); fadeIn(s.t, at("v5", 0.35 + i * 0.15), 0.3, { dy: 0 }); });
    show(arow, frac("v5", 0.4), 0.4); fadeIn(at_, frac("v5", 0.42), 0.4, { dy: 0 });
    fadeIn([sc5, only], frac("v5", 0.6), 0.4, { dy: 0, stagger: 0.2 });
    tl.to(srows.map(s => s.r), { opacity: 0.35, duration: 0.3 }, frac("v5", 0.6));
    // v6
    fadeOut([sc5, only], at("v6", 0), 0.3);
    swapText(mode, at("v6", 0.05), "process reward");
    tl.to(srows.map(s => s.r), { opacity: 1, duration: 0.3 }, at("v6", 0.1));
    tl.to(arow, { opacity: 0.35, duration: 0.3 }, at("v6", 0.1));
    const marks = V.steps_bad.map((s, i) => mark(sc, s.ok, RX + RW + 50, RY(i)));
    marks.forEach((m, i) => fadeIn(m, at("v6", 0.9 + i * 0.7), 0.3, { dy: 0 }));
    const badI = V.steps_bad.findIndex(s => !s.ok);
    const badBox = rect(sc, RX - 6, RY(badI) - 42, RW + 12, 84, C.red, { fill: "none", sw: 3, rx: 10 });
    const firstL = H(sc, "first wrong step", { anchor: "left", x: RX + RW + 90, y: RY(badI), size: 24, color: C.red, weight: 600 });
    draw(badBox, at("v6", 0.9 + badI * 0.7), 0.5);
    fadeIn(firstL, at("v6", 1.3 + badI * 0.7), 0.4, { dy: 0 });
  }

  /* ---------------------------------------------------------------- 5 GRPO and reasoning models */
  /* a group of answers with rewards, mean, std and advantages; nothing is visible until the caller shows it */
  function groupView(sc, g) {
    const X = i => 800 + (i - 3.5) * 180, BASE = 600, KS = 40;
    const chips = g.answers.map((a, i) => chip(sc, a, C.blue, { x: X(i), y: 330, size: 30, font: "mono" }));
    const rew = g.rewards.map((v, i) => H(sc, String(v), { x: X(i), y: 410, size: 34, font: "mono", color: v ? C.green : C.dim, weight: 700 }));
    const meanT = H(sc, `mean = ${f2(g.mean)}`, { anchor: "left", x: 330, y: 480, size: 28, font: "mono", color: C.yellow });
    const stdT = H(sc, `std = ${f2(g.std)}`, { anchor: "left", x: 840, y: 480, size: 28, font: "mono", color: C.yellow });
    const zero = S(sc.svg, "line", { x1: 100, y1: BASE, x2: 1500, y2: BASE }, { stroke: C.grid, strokeWidth: 2 });
    hide(zero);
    const bars = g.adv.map((a, i) => {
      if (Math.abs(a) < 1e-9) return null;
      const h = Math.abs(a) * KS, y = a > 0 ? BASE - h : BASE, col = a > 0 ? C.green : C.red;
      const b = S(sc.svg, "rect", { x: X(i) - 26, y, width: 52, height: h, rx: 4 }, { fill: hexA(col, 0.65), stroke: col, strokeWidth: 2 });
      gsap.set(b, { autoAlpha: 0, scaleY: 0, transformOrigin: a > 0 ? "50% 100%" : "50% 0%" });
      return b;
    });
    const vals = g.adv.map((a, i) => H(sc, sgn(a), { x: X(i), y: 680, size: 26, font: "mono", color: a > 0 ? C.green : a < 0 ? C.red : C.dim }));
    const all = [...chips, ...rew, meanT, stdT, zero, ...bars.filter(Boolean), ...vals];
    return { X, chips, rew, meanT, stdT, zero, bars, vals, all };
  }

  function grpo(sc, N) {
    const Gp = N.grpo, V = N.ver, nxt = DATA.series.find(s => s.id === "ep10");
    title(sc, "GRPO and reasoning models", "g1");

    // g1: no critic
    const row = (y, label, defs) => {
      const lab = H(sc, label, { anchor: "left", x: 110, y, size: 34, color: C.dim, weight: 700 });
      const bx = defs.map(([nm, col, ghost], i) => box(sc, 480 + i * 310, y, 270, 100, col, nm, { size: 28, fill: ghost ? 0.02 : 0.1 }));
      return { lab, bx };
    };
    const ppo = row(300, "PPO", [["policy", C.blue], ["critic", C.orange], ["reward model", C.purple], ["reference", C.teal]]);
    const gr = row(560, "GRPO", [["policy", C.blue], ["critic", C.dim, true], ["verifier", C.purple], ["reference", C.teal]]);
    fadeIn(ppo.lab, at("g1", 0.2), 0.4, { dy: 0 });
    ppo.bx.forEach((b, i) => fadeIn(b.els, at("g1", 0.3 + i * 0.15), 0.4, { dy: 0 }));
    fadeIn(gr.lab, frac("g1", 0.4), 0.4, { dy: 0 });
    gr.bx.forEach((b, i) => fadeIn(b.els, frac("g1", 0.42 + i * 0.06), 0.4, { dy: 0 }));
    const xc = cross(sc, 790, 560, 115, 34, frac("g1", 0.72));
    fadeOut([ppo.lab, gr.lab, ...ppo.bx.flatMap(b => b.els), ...gr.bx.flatMap(b => b.els), ...xc], at("g2", 0), 0.4);

    // g2: a group of G answers
    const A = groupView(sc, Gp.demo), Z = groupView(sc, Gp.zero);
    const qc = chip(sc, V.question, C.yellow, { x: 800, y: 175, size: 30, font: "mono" });
    const gl = H(sc, `G = ${Gp.G} answers from the policy`, { x: 800, y: 250, size: 26, color: C.dim });
    fadeIn(qc, at("g2", 0.2), 0.4, { dy: 0 });
    fadeIn(A.chips, frac("g2", 0.22), 0.35, { stagger: 0.14, dy: 0 });
    fadeIn(gl, frac("g2", 0.7), 0.4, { dy: 0 });

    // g3: rewards and the mean
    fadeOut(gl, at("g3", 0), 0.3);
    fadeIn(A.rew, at("g3", 0.4), 0.3, { stagger: 0.12, dy: 0 });
    Gp.demo.rewards.forEach((v, i) => { if (v) tl.to(A.chips[i], { borderColor: C.green, backgroundColor: hexA(C.green, 0.15), duration: 0.4 }, at("g3", 0.5)); });
    fadeIn(A.meanT, frac("g3", 0.62), 0.4, { dy: 0 });

    // g4: the advantage
    const form = H(sc, "advantage  =  ( reward − mean )  /  ( std + ε )", { x: 800, y: 760, size: 32, font: "mono" });
    fadeIn(form, at("g4", 0.2), 0.5);
    fadeIn(A.stdT, frac("g4", 0.35), 0.4, { dy: 0 });
    show(A.zero, frac("g4", 0.5), 0.3);
    tl.to(A.bars.filter(Boolean), { autoAlpha: 1, scaleY: 1, duration: 0.5, ease: "power2.out", stagger: 0.08 }, frac("g4", 0.55));
    fadeIn(A.vals, frac("g4", 0.6), 0.3, { stagger: 0.06, dy: 0 });

    // g5: better answers become more likely
    fadeOut(form, at("g5", 0), 0.3);
    const good = Gp.demo.rewards.map((v, i) => (v ? i : -1)).filter(i => i >= 0);
    const ups = good.map(i => arrow(sc, A.X(i), 292, A.X(i), 262, C.green, 4, 12));
    const upL = good.map(i => H(sc, "more likely", { x: A.X(i), y: 238, size: 22, color: C.green, weight: 600 }));
    const legP = H(sc, "positive advantage: more likely", { x: 470, y: 810, size: 24, color: C.green });
    const legN = H(sc, "negative advantage: less likely", { x: 1130, y: 810, size: 24, color: C.red });
    const pr = H(sc, `chance of the right answer:  ${f3(Gp.demo.p_before)}  →  ${f3(Gp.demo.p_after)}`, { x: 800, y: 755, size: 28, font: "mono", color: C.yellow });
    ups.forEach(a => drawArrow(a, at("g5", 0.4), 0.4)); fadeIn(upL, at("g5", 0.5), 0.4, { dy: 0 });
    fadeIn(legP, frac("g5", 0.3), 0.4, { dy: 0 }); fadeIn(legN, frac("g5", 0.6), 0.4, { dy: 0 });
    fadeIn(pr, frac("g5", 0.75), 0.4, { dy: 0 });
    good.forEach(i => pulse(A.bars[i], frac("g5", 0.3), 1.12, 0.6));

    // g6: a group with only wrong answers: no signal
    fadeOut([...A.all, ...ups.flatMap(aEls), ...upL, legP, legN, pr], at("g6", 0), 0.4);
    const none = H(sc, "no signal: this group teaches nothing", { x: 800, y: 760, size: 32, color: C.red, weight: 600 });
    fadeIn(Z.chips, at("g6", 0.3), 0.3, { stagger: 0.08, dy: 0 });
    fadeIn(Z.rew, frac("g6", 0.2), 0.3, { stagger: 0.08, dy: 0 });
    fadeIn([Z.meanT, Z.stdT], frac("g6", 0.38), 0.4, { dy: 0 });
    show(Z.zero, frac("g6", 0.5), 0.3);
    fadeIn(Z.vals, frac("g6", 0.52), 0.3, { stagger: 0.05, dy: 0 });
    fadeIn(none, frac("g6", 0.72), 0.5);
    fadeOut([qc, ...Z.all, none], at("g7", 0), 0.4);

    // g7: the chance of the right answer over many steps
    const ax = axes(sc, { x: 230, y: 220, w: 1000, h: 430, xr: [0, Gp.steps], yr: [0, 1], grid: true,
      xticks: [0, 20, 40, 60].filter(v => v <= Gp.steps), yticks: [0, 0.5, 1], yfmt: v => v.toFixed(1),
      xlabel: "step (one group of answers for each step)", ylabel: "chance of the right answer" });
    const rv = reveal(sc, ax.x, ax.y - 6, ax.w, ax.h + 12);
    const pc = line(sc, Gp.p_hist.map((v, i) => [ax.X(i), ax.Y(v)]), C.green, 5, rv.url);
    gsap.set(pc, { autoAlpha: 1 });
    const bigL = H(sc, "chance of the right answer", { x: 1420, y: 380, size: 22, color: C.dim });
    const big = H(sc, f3(Gp.p_hist[0]), { x: 1420, y: 450, size: 60, font: "mono", color: C.green, weight: 600 });
    const toy = H(sc, `a toy: ${Gp.answers.length} possible answers, G = ${Gp.G}`, { x: 1420, y: 520, size: 20, color: C.dim });
    const nosig = H(sc, `${Gp.all_wrong} of ${Gp.steps} groups had only wrong answers`, { x: 1420, y: 580, size: 20, color: C.dim, wrap: 300 });
    ax.show(at("g7", 0.1), 0.6);
    fadeIn([bigL, big, toy], at("g7", 0.3), 0.4, { dy: 0 });
    const t7 = at("g7", 0.5), d7 = dur("g7") * 0.6;
    rv.run(t7, d7);
    scrub(t7, d7, p => { big.textContent = f3(Gp.p_hist[Math.round(p * Gp.steps)]); });
    fadeIn(nosig, frac("g7", 0.85), 0.4, { dy: 0 });
    fadeOut([...ax.all, pc, bigL, big, toy, nosig], at("g8", 0), 0.4);

    // g8: DeepSeek-R1 (an illustration of the finding, not model output)
    const before = rect(sc, 110, 280, 360, 150, C.blue);
    const bl = H(sc, "before RL", { anchor: "left", x: 134, y: 308, size: 22, color: C.blue, weight: 700 });
    const bt = para(sc, `<answer>${V.truth}</answer>`, 134, 350, 320, { size: 22 });
    const arr = arrow(sc, 490, 355, 790, 355, C.yellow, 5, 18);
    const arL = H(sc, "GRPO + rule-based rewards", { x: 640, y: 318, size: 20, color: C.yellow });
    const after = rect(sc, 810, 220, 680, 380, C.green);
    const al = H(sc, "after RL", { anchor: "left", x: 834, y: 248, size: 22, color: C.green, weight: 700 });
    const code = ["<think>", "17 * 6 = 17 * 5 + 17 = 85 + 17 = 102.", "Check: 100 + 2 = 102. Yes.", "Check: 6 * 10 = 60, 6 * 7 = 42, 102.", "</think>", `<answer>${V.truth}</answer>`];
    const at2 = code.map((t, i) => H(sc, t, { anchor: "left", x: 834, y: 300 + i * 46, size: 22, font: "mono", color: i === 2 || i === 3 ? C.green : C.fg }));
    const note = H(sc, "an illustration of the paper's finding, not real model output", { x: 800, y: 665, size: 22, color: C.dim });
    const paper = H(sc, "DeepSeek-R1 paper: longer answers with verification and reflection", { x: 800, y: 730, size: 26, color: C.yellow });
    show(before, at("g8", 0.3), 0.4); fadeIn([bl, bt], at("g8", 0.4), 0.4, { dy: 0 });
    drawArrow(arr, frac("g8", 0.2), 0.5); fadeIn(arL, frac("g8", 0.25), 0.4, { dy: 0 });
    show(after, frac("g8", 0.42), 0.4); fadeIn(al, frac("g8", 0.44), 0.3, { dy: 0 });
    fadeIn(at2, frac("g8", 0.5), 0.4, { stagger: 0.35, dy: 0 });
    fadeIn(note, frac("g8", 0.82), 0.4, { dy: 0 });
    fadeIn(paper, frac("g8", 0.9), 0.4, { dy: 0 });
    fadeOut([before, bl, bt, ...aEls(arr), arL, after, al, ...at2, note, paper], at("g9", 0), 0.4);

    // g9: next episode
    const nx = H(sc, `Next · Episode ${nxt.n} · ${nxt.title}`, { y: 330, size: 36, color: LEVEL_COLOR["Deep dive"], weight: 600 });
    const m1 = chip(sc, "trained model", C.green, { x: 330, y: 520, size: 28 });
    const m2 = box(sc, 800, 520, 280, 100, C.orange, "run it", { size: 34 });
    const m3 = chip(sc, "fast  ·  low cost", C.yellow, { x: 1280, y: 520, size: 28 });
    const n1 = arrow(sc, 460, 520, 654, 520, C.dim, 4, 16), n2 = arrow(sc, 946, 520, 1120, 520, C.dim, 4, 16);
    fadeIn(nx, at("g9", 0.3), 0.5);
    fadeIn(m1, frac("g9", 0.35), 0.4, { dy: 0 }); drawArrow(n1, frac("g9", 0.42), 0.3);
    fadeIn(m2.els, frac("g9", 0.5), 0.4, { dy: 0 }); drawArrow(n2, frac("g9", 0.62), 0.3);
    fadeIn(m3, frac("g9", 0.68), 0.4, { dy: 0 });
  }

  return { imitate, reward, rlhf, verify, grpo };
})();
