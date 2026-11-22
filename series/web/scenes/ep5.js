/* Episode 5 - Production ML. Contract: OUTLINE.md. N = episodes/ep5.py nums(). */
SCENES_BY_EP.ep5 = (() => {
  const f3 = v => v.toFixed(3), f2 = v => v.toFixed(2);
  const pFmt = p => (p < 0.001 ? "p < 0.001" : `p = ${f2(p)}`);
  function title(sc, text, key) { write(H(sc, text, { y: 78, size: 56, font: "serif", weight: 600 }), at(key, 0.1), 1.0); }
  function hide(els) { gsap.set(els, { autoAlpha: 0 }); return els; }
  function person(sc, cx, cy, col) {
    const g = S(sc.svg, "g");
    S(g, "circle", { cx, cy: cy - 22, r: 15 }, { fill: "none", stroke: col, strokeWidth: 3 });
    S(g, "path", { d: `M${cx - 26},${cy + 26} Q${cx - 26},${cy} ${cx},${cy} Q${cx + 26},${cy} ${cx + 26},${cy + 26}` }, { fill: "none", stroke: col, strokeWidth: 3 });
    gsap.set(g, { autoAlpha: 0 });
    return g;
  }
  function fileIcon(sc, cx, cy, col, label) {
    const g = S(sc.svg, "g");
    S(g, "path", { d: `M${cx - 24},${cy - 32} h34 l14,14 v50 h-48 z` }, { fill: hexA(col, 0.12), stroke: col, strokeWidth: 3 });
    S(g, "path", { d: `M${cx + 10},${cy - 32} v14 h14` }, { fill: "none", stroke: col, strokeWidth: 3 });
    gsap.set(g, { autoAlpha: 0 });
    const t = H(sc, label, { x: cx, y: cy + 52, size: 20, color: col, font: "mono" });
    return { g, t, els: [g, t] };
  }
  const arrowEls = a => [a.line, a.tip];

  /* ---------------------------------------------------------------- 1 the model lifecycle */
  function lifecycle(sc, N) {
    title(sc, "Production ML", "c1");
    // a notebook model and real users
    const nb = box(sc, 430, 400, 380, 190, C.blue, "notebook", { sub: `test accuracy ${f3(N.acc_test)}` });
    const users = [1110, 1210, 1310].map(x => person(sc, x, 400, C.fg));
    const ul = H(sc, "real users", { x: 1210, y: 480, size: 24, color: C.dim });
    const a1 = arrow(sc, 640, 400, 1050, 400, C.orange, 4, 16);
    const q = H(sc, "predictions?", { x: 845, y: 365, size: 26, color: C.orange, weight: 600 });
    fadeIn(nb.els, at("c1", 0.6), 0.5);
    fadeIn(users, frac("c1", 0.55), 0.4, { stagger: 0.15 });
    fadeIn(ul, frac("c1", 0.6), 0.4);
    drawArrow(a1, frac("c1", 0.7), 0.6);
    fadeIn(q, frac("c1", 0.78), 0.4, { dy: 0 });
    const part1 = [...nb.els, ...users, ul, ...arrowEls(a1), q];
    fadeOut(part1, at("c2", 0), 0.5);

    // the example: an order
    const card = S(sc.svg, "rect", { x: 260, y: 250, width: 520, height: 300, rx: 16 }, { fill: hexA(C.fg, 0.04), stroke: C.fg, strokeWidth: 2.5 });
    hide(card);
    const ct = H(sc, "Food delivery order", { anchor: "left", x: 295, y: 295, size: 30, weight: 700 });
    const cp = H(sc, "promised: 35 minutes", { anchor: "left", x: 295, y: 340, size: 22, color: C.dim });
    const r0 = N.reqs[0];
    const f1 = H(sc, `distance  ${r0.distance_km} km`, { anchor: "left", x: 295, y: 420, size: 28, font: "mono" });
    const f2r = H(sc, `kitchen queue  ${r0.queue} orders`, { anchor: "left", x: 295, y: 475, size: 28, font: "mono" });
    const k1 = chip(sc, "feature 1", C.orange, { x: 870, y: 420, size: 20 });
    const k2 = chip(sc, "feature 2", C.orange, { x: 870, y: 475, size: 20 });
    const mdl = box(sc, 1170, 320, 200, 90, C.yellow, "model", { size: 30 });
    const a2 = arrow(sc, 790, 320, 1062, 320, C.dim, 3, 14);
    const outQ = H(sc, "late or on time?", { x: 1170, y: 420, size: 24, color: C.yellow });
    const outP = H(sc, `P(late) = ${f3(r0.p)}  →  on time`, { x: 1170, y: 470, size: 24, color: C.green, font: "mono" });
    fadeIn([card, ct, cp], at("c2", 0.4), 0.5);
    fadeIn(mdl.els, frac("c2", 0.55), 0.5, { dy: 0 });
    drawArrow(a2, frac("c2", 0.6), 0.5);
    fadeIn(outQ, frac("c2", 0.7), 0.4);
    fadeIn([f1, k1], at("c3", 0.6), 0.4, { dy: 0 });
    fadeIn([f2r, k2], frac("c3", 0.45), 0.4, { dy: 0 });
    fadeIn(outP, frac("c3", 0.8), 0.4);
    fadeOut([card, ct, cp, f1, f2r, k1, k2, ...mdl.els, ...arrowEls(a2), outQ, outP], at("c4", 0), 0.5);

    // the loop
    const names = [["collect data", C.blue], ["train", C.teal], ["evaluate", C.green], ["deploy", C.yellow], ["watch", C.orange]];
    const R = 250, CX = 800, CY = 480;
    const nodes = names.map(([n, col], i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / names.length;
      return box(sc, CX + R * 1.35 * Math.cos(a), CY + R * Math.sin(a), 210, 70, col, n, { size: 26 });
    });
    const links = nodes.map((nd, i) => {
      const nx = nodes[(i + 1) % nodes.length];
      const dx = nx.cx - nd.cx, dy = nx.cy - nd.cy, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      const sh = (Math.abs(ux) * 110 + Math.abs(uy) * 40);
      return arrow(sc, nd.cx + ux * sh, nd.cy + uy * sh, nx.cx - ux * sh, nx.cy - uy * sh, i === 4 ? C.orange : C.dim, 3, 14);
    });
    const center = H(sc, "the ML loop", { x: CX, y: CY, size: 32, font: "serif", weight: 600, color: C.dim });
    const ts = [0.12, 0.25, 0.36, 0.47, 0.66];
    nodes.forEach((nd, i) => {
      fadeIn(nd.els, frac("c4", ts[i]), 0.4, { dy: 0 });
      if (i > 0) drawArrow(links[i - 1], frac("c4", ts[i]) - 0.25, 0.3);
    });
    fadeIn(center, frac("c4", 0.5), 0.5);
    drawArrow(links[4], frac("c4", 0.82), 0.6);
    const again = H(sc, "results get worse → train again", { anchor: "right", x: 610, y: 258, size: 22, color: C.orange });
    fadeIn(again, frac("c4", 0.86), 0.4, { dy: 0 });
    fadeOut([...nodes.flatMap(n => n.els), ...links.flatMap(arrowEls), center, again], at("c6", 0), 0.5);

    // the model code is a small part (after Sculley et al. 2015, Figure 1)
    const parts = [
      ["configuration", 300, 230, 170, 520], ["data collection", 490, 230, 280, 160], ["data verification", 490, 410, 280, 160],
      ["feature extraction", 490, 590, 280, 160], ["machine resource management", 890, 230, 410, 100],
      ["analysis tools", 890, 350, 195, 200], ["process management tools", 1105, 350, 195, 200],
      ["serving infrastructure", 890, 570, 410, 80], ["monitoring", 890, 670, 410, 80],
    ];
    const pe = parts.map(([n, x, y, w, h]) => {
      const r = S(sc.svg, "rect", { x, y, width: w, height: h, rx: 8 }, { fill: hexA(C.grid, 0.25), stroke: C.grid, strokeWidth: 2 });
      hide(r);
      const t = H(sc, n, { x: x + w / 2, y: y + h / 2, size: 20, color: C.dim, wrap: w - 20 });
      return [r, t];
    }).flat();
    const ml = S(sc.svg, "rect", { x: 800, y: 465, width: 70, height: 50, rx: 6 }, { fill: C.yellow, stroke: C.yellow, strokeWidth: 2 });
    hide(ml);
    const mlt = H(sc, "ML code", { x: 835, y: 440, size: 20, color: C.yellow, weight: 700 });
    const cap = H(sc, "In a real ML system, the model code is a small part.", { y: 805, size: 28, weight: 600 });
    const src = H(sc, "after Sculley et al., Hidden Technical Debt in Machine Learning Systems, NeurIPS 2015", { y: 848, size: 18, color: C.dim });
    show([ml], at("c6", 0.4), 0.4);
    fadeIn(mlt, at("c6", 0.5), 0.4, { dy: 0 });
    tl.to(pe, { autoAlpha: 1, duration: 0.3, stagger: 0.12 }, at("c6", 1.2));
    pulse(ml, frac("c6", 0.45), 1.4, 0.6);
    fadeIn([cap, src], frac("c6", 0.5), 0.5, { stagger: 0.2 });
  }

  /* ---------------------------------------------------------------- 2 one pipeline */
  function pipeline(sc, N) {
    title(sc, "One pipeline", "p1");
    // the scaler
    const raw = chip(sc, `${N.sample[0]} km · ${N.sample[1]} orders`, C.fg, { x: 250, y: 260, size: 24, font: "mono" });
    const scl = box(sc, 720, 260, 300, 90, C.teal, "scaler", { sub: "z = (x − mean) / std" });
    const out = chip(sc, `${f2(N.sample_z[0])} · ${f2(N.sample_z[1])}`, C.teal, { x: 1180, y: 260, size: 24, font: "mono" });
    const sa1 = arrow(sc, 420, 260, 562, 260, C.dim, 3, 14), sa2 = arrow(sc, 878, 260, 1070, 260, C.dim, 3, 14);
    const msd = H(sc, `mean and std come from the training data:  distance ${N.mean[0]} / ${N.std[0]},  queue ${N.mean[1]} / ${N.std[1]}`, { y: 345, size: 20, color: C.dim });
    fadeIn(raw, at("p1", 0.5), 0.4);
    drawArrow(sa1, at("p1", 1.0), 0.4);
    fadeIn(scl.els, at("p1", 1.3), 0.4, { dy: 0 });
    drawArrow(sa2, frac("p1", 0.55), 0.4);
    fadeIn(out, frac("p1", 0.62), 0.4);
    fadeIn(msd, frac("p1", 0.75), 0.4);

    // training path and service path
    function row(y, label, first, col, withScaler) {
      const lab = H(sc, label, { anchor: "left", x: 110, y, size: 24, color: C.dim, weight: 600 });
      const b1 = box(sc, 420, y, 200, 70, col, first, { size: 24 });
      const b2 = withScaler ? box(sc, 720, y, 200, 70, C.teal, "scaler", { size: 24 })
        : box(sc, 720, y, 200, 70, C.red, "no scaler", { size: 24, fill: 0.04 });
      const b3 = box(sc, 1020, y, 200, 70, C.yellow, "model", { size: 24 });
      const e1 = arrow(sc, 522, y, 616, y, C.dim, 3, 12), e2 = arrow(sc, 822, y, 916, y, C.dim, 3, 12);
      return { lab, b1, b2, b3, e1, e2, els: [lab, ...b1.els, ...b2.els, ...b3.els, ...arrowEls(e1), ...arrowEls(e2)] };
    }
    const tr = row(470, "training", "data", C.blue, true);
    const sv = row(620, "service", "request", C.orange, false);
    gsap.set(sv.b2.r, { strokeDasharray: "9 8" });
    const res1 = H(sc, "good prediction", { anchor: "left", x: 1140, y: 470, size: 22, color: C.green });
    const res2 = H(sc, "wrong prediction", { anchor: "left", x: 1140, y: 620, size: 22, color: C.red, weight: 600 });
    fadeIn(tr.els, at("p2", 0.4), 0.5, { dy: 0 });
    fadeIn(res1, at("p2", 1.0), 0.4, { dy: 0 });
    fadeIn(sv.els, frac("p2", 0.4), 0.5, { dy: 0 });
    const cr = cross(sc, 720, 620, 60, 26, frac("p2", 0.7));
    fadeIn(res2, frac("p2", 0.75), 0.4, { dy: 0 });

    // one pipeline, one file
    fadeOut([raw, ...scl.els, out, ...arrowEls(sa1), ...arrowEls(sa2), msd, ...tr.els, ...sv.els, res1, res2, ...cr], at("p3", 0), 0.5);
    const pipe = S(sc.svg, "rect", { x: 520, y: 220, width: 560, height: 170, rx: 20 }, { fill: hexA(C.purple, 0.06), stroke: C.purple, strokeWidth: 3 });
    hide(pipe);
    const pl = H(sc, "pipeline", { anchor: "left", x: 540, y: 245, size: 22, color: C.purple, weight: 700 });
    const ps = box(sc, 680, 320, 200, 70, C.teal, "scaler", { size: 24 });
    const pm = box(sc, 920, 320, 200, 70, C.yellow, "model", { size: 24 });
    const pa = arrow(sc, 782, 320, 816, 320, C.dim, 3, 10);
    const file = fileIcon(sc, 800, 520, C.purple, "late_model_v1.joblib");
    const fa = arrow(sc, 800, 398, 800, 478, C.purple, 3, 12);
    const tj = H(sc, "training job saves it", { anchor: "right", x: 740, y: 540, size: 22, color: C.dim });
    const ws = H(sc, "web service loads it", { anchor: "left", x: 860, y: 540, size: 22, color: C.dim });
    fadeIn([pipe, pl], at("p3", 0.4), 0.5, { dy: 0 });
    fadeIn([...ps.els, ...pm.els], at("p3", 0.7), 0.5, { dy: 0 });
    drawArrow(pa, at("p3", 1.0), 0.3);
    drawArrow(fa, frac("p3", 0.6), 0.4);
    fadeIn(file.els, frac("p3", 0.65), 0.4);
    fadeIn([tj, ws], frac("p3", 0.8), 0.4, { dy: 0, stagger: 0.2 });

    // leakage
    fadeOut([pipe, pl, ...ps.els, ...pm.els, ...arrowEls(pa), ...file.els, ...arrowEls(fa), tj, ws], at("p4", 0), 0.5);
    const trB = box(sc, 560, 430, 600, 220, C.blue, "training data", { fill: 0.08 });
    const teB = box(sc, 1160, 430, 300, 220, C.orange, "test data", { fill: 0.08 });
    const leak = arrow(sc, 1080, 480, 760, 480, C.red, 5, 20);
    const ll = H(sc, "information from the test data", { x: 920, y: 600, size: 24, color: C.red, weight: 600 });
    const lk = H(sc, "data leakage", { y: 220, size: 40, color: C.red, weight: 700 });
    fadeIn(lk, at("p4", 0.5), 0.5);
    fadeIn([...trB.els, ...teB.els], frac("p4", 0.45), 0.5, { dy: 0 });
    drawArrow(leak, frac("p4", 0.7), 0.6);
    fadeIn(ll, frac("p4", 0.76), 0.4);
    fadeOut([lk, ...trB.els, ...teB.els, ...arrowEls(leak), ll], at("p5", 0), 0.5);

    // random matrix
    const L = N.leak, ROWS = 20, COLS = 50, CW = 15, X0 = 170, Y0 = 220;
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const cells = S(sc.svg, "g");
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const v = 0.25 + 0.55 * rnd();
      S(cells, "rect", { x: X0 + c * CW, y: Y0 + r * CW, width: CW - 2, height: CW - 2 }, { fill: `rgba(138,145,157,${v.toFixed(2)})` });
    }
    hide(cells);
    const labs = S(sc.svg, "g");
    for (let r = 0; r < ROWS; r++) S(labs, "rect", { x: X0 + COLS * CW + 14, y: Y0 + r * CW, width: 26, height: CW - 2 }, { fill: rnd() < 0.5 ? C.blue : C.orange });
    hide(labs);
    const mW = COLS * CW;
    const mt = H(sc, `${L.rows} rows × ${L.features} random features`, { x: X0 + mW / 2, y: Y0 + ROWS * CW + 34, size: 24 });
    const lt = H(sc, "random labels", { anchor: "left", x: X0 + mW + 50, y: Y0 + ROWS * CW / 2, size: 22, color: C.dim });
    show(cells, at("p5", 1.0), 0.8);
    fadeIn(mt, at("p5", 1.4), 0.4);
    show(labs, frac("p5", 0.7), 0.5);
    fadeIn(lt, frac("p5", 0.72), 0.4, { dy: 0 });

    // CV accuracy chart
    const ax = axes(sc, { x: 1230, y: 250, w: 250, h: 300, xr: [0, 2], yr: [0, 1], yticks: [0, 0.5, 1], yfmt: v => String(v) });
    const chance = S(sc.svg, "line", { x1: ax.X(0), y1: ax.Y(0.5), x2: ax.X(2), y2: ax.Y(0.5) }, { stroke: C.dim, strokeWidth: 2, strokeDasharray: "6 6" });
    hide(chance);
    const chl = H(sc, "chance", { anchor: "left", x: ax.X(2) + 8, y: ax.Y(0.5), size: 18, color: C.dim });
    const ch = H(sc, "cross-validation accuracy", { x: ax.x + ax.w / 2, y: 210, size: 20, color: C.dim });
    function bar(i, v, col, label, t) {
      const b = S(sc.svg, "rect", { x: ax.X(i + 0.2), y: ax.Y(v), width: ax.X(0.6) - ax.X(0), height: ax.Y(0) - ax.Y(v) }, { fill: col });
      gsap.set(b, { scaleY: 0, transformOrigin: "50% 100%" });
      const vt = H(sc, f2(v), { x: ax.X(i + 0.5), y: ax.Y(Math.abs(v - 0.5) < 0.08 ? 0.5 : v) - 22, size: 24, color: col, font: "mono", weight: 600 });
      const lb = H(sc, label, { x: ax.X(i + 0.5), y: ax.Y(0) + 28, size: 20, color: col });
      tl.to(b, { scaleY: 1, duration: 0.7, ease: "power2.out" }, t);
      fadeIn([vt, lb], t + 0.5, 0.3, { dy: 0 });
      return [b, vt, lb];
    }
    // wrong: select with all rows
    const picks = [3, 9, 14, 22, 27, 31, 38, 44];
    const colHi = picks.map(c => S(sc.svg, "rect", { x: X0 + c * CW - 1, y: Y0 - 4, width: CW, height: ROWS * CW + 6, rx: 2 }, { fill: "none", stroke: C.yellow, strokeWidth: 2.5 }));
    hide(colHi);
    const sel = H(sc, `select the ${L.k} best features with ALL rows`, { x: X0 + mW / 2, y: Y0 - 34, size: 22, color: C.yellow });
    fadeIn(sel, at("p6", 0.6), 0.4, { dy: 0 });
    tl.to(colHi, { autoAlpha: 1, duration: 0.2, stagger: 0.1 }, at("p6", 1.0));
    ax.show(frac("p6", 0.45), 0.5);
    show(chance, frac("p6", 0.5), 0.3);
    fadeIn([chl, ch], frac("p6", 0.5), 0.3, { dy: 0 });
    bar(0, L.wrong, C.red, "leak", frac("p6", 0.62));

    // right: inside the pipeline, per fold
    fadeOut([sel, ...colHi], at("p7", 0), 0.3);
    const fold = S(sc.svg, "rect", { x: X0 - 4, y: Y0 - 3, width: mW + 4, height: (ROWS / L.folds) * CW + 2 }, { fill: hexA(C.orange, 0.25), stroke: C.orange, strokeWidth: 2.5 });
    hide(fold);
    const fl = H(sc, "test fold: not used for the selection", { anchor: "left", x: X0, y: Y0 - 34, size: 22, color: C.orange });
    const picks2 = [[5, 12, 19, 33, 41, 47], [1, 8, 17, 25, 36, 45]];
    const colHi2 = picks2.map(ps => ps.map(c => S(sc.svg, "rect", { x: X0 + c * CW - 1, y: Y0 - 4, width: CW, height: ROWS * CW + 6, rx: 2 }, { fill: "none", stroke: C.green, strokeWidth: 2.5 })));
    colHi2.flat().forEach(hide);
    const tp = frac("p7", 0.55);
    show(fold, tp, 0.3);
    fadeIn(fl, tp, 0.3, { dy: 0 });
    tl.to(colHi2[0], { autoAlpha: 1, duration: 0.2, stagger: 0.06 }, tp + 0.4);
    tl.to(fold, { attr: { y: Y0 - 3 + (ROWS / L.folds) * CW }, duration: 0.6 }, tp + 1.6);
    tl.to(colHi2[0], { autoAlpha: 0, duration: 0.2 }, tp + 1.6);
    tl.to(colHi2[1], { autoAlpha: 1, duration: 0.2, stagger: 0.06 }, tp + 2.2);
    const right = bar(1, L.right, C.green, "pipeline", at("p8", 0.3));
    tl.to(chance, { strokeWidth: 5, duration: 0.3, yoyo: true, repeat: 1 }, frac("p8", 0.5));
    const note = H(sc, "random labels: the true accuracy is 0.5", { x: X0 + mW / 2, y: 720, size: 26, color: C.green, weight: 600 });
    fadeIn(note, frac("p8", 0.45), 0.5);
    pulse(right[1], frac("p8", 0.6), 1.25, 0.6);
  }

  /* ---------------------------------------------------------------- 3 serve predictions */
  function serve(sc, N) {
    title(sc, "Serve predictions", "s1");
    const svc = box(sc, 1250, 420, 360, 230, C.purple, "web service", { sub: "FastAPI", fill: 0.07 });
    const file = fileIcon(sc, 300, 420, C.purple, "late_model_v1.joblib");
    const load = H(sc, "load once, when the service starts", { x: 1250, y: 575, size: 20, color: C.dim });
    fadeIn(svc.els, at("s1", 0.6), 0.5, { dy: 0 });
    fadeIn(file.els, at("s1", 1.2), 0.4);
    tl.to([svc.t, svc.s], { y: -70, duration: 0.5 }, frac("s1", 0.42));
    tl.to(file.els, { x: 1250 - 300, y: 40, scale: 0.8, duration: 1.2, ease: "power2.inOut" }, frac("s1", 0.55));
    fadeIn(load, frac("s1", 0.7), 0.4, { dy: 0 });

    // request and response
    const app = box(sc, 230, 420, 240, 150, C.blue, "app", { sub: "checkout page" });
    const r0 = N.reqs[0];
    const req = codeBox(sc, ["POST /predict", `{"distance_km": ${r0.distance_km}, "queue": ${r0.queue}}`], { x: 420, y: 215, size: 22 });
    const res = codeBox(sc, [`{"late_probability": ${r0.p},`, ` "late": ${r0.p >= 0.5},`, ' "model_version": "late-v1"}'], { x: 520, y: 520, size: 22 });
    const aq = arrow(sc, 355, 380, 1065, 380, C.dim, 3, 14), ar = arrow(sc, 1065, 470, 355, 470, C.dim, 3, 14);
    const jq = H(sc, "request (JSON)", { anchor: "left", x: 420, y: 190, size: 20, color: C.dim });
    const jr = H(sc, "response (JSON)", { anchor: "left", x: 520, y: 497, size: 20, color: C.dim });
    fadeIn(app.els, at("s2", 0.3), 0.4, { dy: 0 });
    drawArrow(aq, at("s2", 1.0), 0.6);
    fadeIn([req.el, jq], at("s2", 1.2), 0.4);
    drawArrow(ar, frac("s2", 0.65), 0.6);
    fadeIn([res.el, jr], frac("s2", 0.7), 0.4);

    // a bad request
    const bad = codeBox(sc, ["POST /predict", `{"distance_km": ${r0.distance_km}}`], { x: 420, y: 215, size: 22 });
    const err = codeBox(sc, ["422", '{"detail": [{"type": "missing",', '  "loc": ["body", "queue"]}]}'], { x: 520, y: 520, size: 22 });
    bad.el.style.borderColor = C.red; err.el.style.borderColor = C.red;
    err.rows[0].style.color = C.red;
    const chk = H(sc, "checks each request", { x: 1250, y: 610, size: 22, color: C.red, weight: 600 });
    const nop = H(sc, "error, no prediction", { anchor: "left", x: 1010, y: 610, size: 22, color: C.red });
    fadeOut([req.el, res.el], at("s3", 0.1), 0.3);
    fadeIn(bad.el, at("s3", 0.4), 0.4);
    fadeIn(chk, at("s3", 0.8), 0.4, { dy: 0 });
    fadeIn(err.el, frac("s3", 0.6), 0.4);
    fadeOut(chk, frac("s3", 0.95), 0.2);

    // online
    fadeOut([bad.el, err.el], at("s4", 0), 0.3);
    const r1 = N.reqs[1];
    const req2 = codeBox(sc, ["POST /predict", `{"distance_km": ${r1.distance_km}, "queue": ${r1.queue}}`], { x: 420, y: 215, size: 22 });
    const res2 = codeBox(sc, [`{"late_probability": ${r1.p},`, ` "late": ${r1.p >= 0.5},`, ' "model_version": "late-v1"}'], { x: 520, y: 520, size: 22 });
    const dot = S(sc.svg, "circle", { cx: 360, cy: 380, r: 10 }, { fill: C.yellow });
    hide(dot);
    fadeIn(req2.el, at("s4", 0.2), 0.3);
    show(dot, at("s4", 0.5), 0.1);
    tl.to(dot, { attr: { cx: 1060 }, duration: 0.8, ease: "none" }, at("s4", 0.5));
    tl.to(dot, { attr: { cy: 470 }, duration: 0.2 }, at("s4", 1.3));
    tl.to(dot, { attr: { cx: 360 }, duration: 0.8, ease: "none" }, at("s4", 1.5));
    tl.to(dot, { autoAlpha: 0, duration: 0.2 }, at("s4", 2.3));
    fadeIn(res2.el, at("s4", 1.6), 0.3);
    const on = H(sc, "online: one request → one answer, immediately", { x: 800, y: 700, size: 28, color: C.yellow, weight: 600 });
    fadeIn(on, frac("s4", 0.45), 0.5);

    // batch
    fadeOut([req2.el, res2.el, jq, jr], at("s5", 0.2), 0.4);
    tl.to([...app.els, ...svc.els, ...file.els, load, ...arrowEls(aq), ...arrowEls(ar)], { opacity: 0.25, duration: 0.5 }, at("s5", 0.2));
    tl.to(on, { y: 150 - 700, scale: 0.8, duration: 0.6 }, at("s5", 0.2));
    const tbl = S(sc.svg, "g");
    for (let i = 0; i < 7; i++) S(tbl, "rect", { x: 150, y: 640 + i * 18, width: 200, height: 13, rx: 2 }, { fill: hexA(C.blue, 0.5) });
    hide(tbl);
    const tbt = H(sc, `${N.batch_n} orders`, { x: 250, y: 790, size: 22, color: C.blue });
    const job = box(sc, 800, 700, 300, 110, C.teal, "batch job", { sub: "each night" });
    const outT = S(sc.svg, "g");
    for (let i = 0; i < 7; i++) S(outT, "rect", { x: 1250, y: 640 + i * 18, width: 200, height: 13, rx: 2 }, { fill: hexA(C.green, i % 3 === 1 ? 0.9 : 0.4) });
    hide(outT);
    const ott = H(sc, `${N.batch_n} predictions stored`, { x: 1350, y: 790, size: 22, color: C.green });
    const ott2 = H(sc, `${N.batch_late} late`, { x: 1350, y: 822, size: 20, color: C.dim, font: "mono" });
    const b1 = arrow(sc, 365, 700, 642, 700, C.dim, 3, 14), b2 = arrow(sc, 958, 700, 1235, 700, C.dim, 3, 14);
    const bt = H(sc, "batch: many rows at one time", { x: 800, y: 590, size: 28, color: C.teal, weight: 600 });
    fadeIn(bt, at("s5", 0.6), 0.5);
    fadeIn([tbl, tbt], frac("s5", 0.3), 0.4);
    drawArrow(b1, frac("s5", 0.38), 0.4);
    fadeIn(job.els, frac("s5", 0.42), 0.4, { dy: 0 });
    drawArrow(b2, frac("s5", 0.7), 0.4);
    fadeIn([outT, ott, ott2], frac("s5", 0.75), 0.4);
  }

  /* ---------------------------------------------------------------- 4 watch for drift */
  function monitor(sc, N) {
    title(sc, "Watch for drift", "m2");
    const ax = axes(sc, { x: 150, y: 200, w: 850, h: 420, xr: [0, 20], yr: [0, 0.25], grid: true,
      xticks: [0, 5, 10, 15, 20], yticks: [0, 0.1, 0.2], yfmt: v => `${Math.round(v * 100)}%`,
      xlabel: "distance to the customer (km)", ylabel: "share of orders" });
    ax.show(at("m2", 0.3), 0.7);
    const bw = (ax.X(1) - ax.X(0)) / 2 - 2;
    const mk = (h, k, col) => h.map((v, i) => {
      const b = S(sc.svg, "rect", { x: ax.X(i) + 2 + k * bw, y: ax.Y(v), width: bw, height: ax.Y(0) - ax.Y(v) }, { fill: col });
      gsap.set(b, { scaleY: 0, transformOrigin: "50% 100%" });
      return b;
    });
    const btr = mk(N.h_train, 0, hexA(C.blue, 0.85)), bpr = mk(N.h_prod, 1, hexA(C.orange, 0.85));
    const lg1 = H(sc, `training data · mean ${N.mean_dist_train} km`, { anchor: "left", x: 640, y: 230, size: 22, color: C.blue });
    const lg2 = H(sc, `production · mean ${N.mean_dist_prod} km`, { anchor: "left", x: 640, y: 266, size: 22, color: C.orange });
    tl.to(btr, { scaleY: 1, duration: 0.5, stagger: 0.04 }, at("m2", 1.0));
    fadeIn(lg1, at("m2", 1.2), 0.4, { dy: 0 });
    tl.to(bpr, { scaleY: 1, duration: 0.5, stagger: 0.04 }, frac("m2", 0.55));
    fadeIn(lg2, frac("m2", 0.6), 0.4, { dy: 0 });

    // PSI
    const dr = H(sc, "data drift", { x: 1300, y: 210, size: 36, color: C.orange, weight: 700 });
    const psiF = H(sc, "PSI = Σ (p_prod − p_train) × ln(p_prod / p_train)", { x: 575, y: 790, size: 24, font: "mono" });
    const psiS = H(sc, "summed over 10 bins of the training data", { x: 575, y: 830, size: 19, color: C.dim });
    const h1 = H(sc, "PSI", { anchor: "left", x: 1270, y: 290, size: 20, color: C.dim, font: "mono" });
    const pd = H(sc, "distance", { anchor: "left", x: 1110, y: 330, size: 24 });
    const pq = H(sc, "queue", { anchor: "left", x: 1110, y: 372, size: 24 });
    const vd = H(sc, "", { anchor: "left", x: 1270, y: 330, size: 26, color: C.red, font: "mono", weight: 600 });
    const vq = H(sc, "", { anchor: "left", x: 1270, y: 372, size: 26, color: C.green, font: "mono", weight: 600 });
    fadeIn(dr, at("m4", 0.3), 0.5);
    write(psiF, frac("m4", 0.45), 1.2);
    fadeIn(psiS, frac("m4", 0.6), 0.4);
    fadeIn([h1, pd, pq], frac("m4", 0.62), 0.4, { dy: 0 });
    counter(vd, frac("m4", 0.7), 0, N.psi_dist, 1.0, f2);
    counter(vq, frac("m4", 0.7), 0, N.psi_queue, 1.0, f2);
    fadeIn([vd, vq], frac("m4", 0.7), 0.3, { dy: 0 });

    // rule of thumb scale
    const SX = 1110, SW = 400, SMAX = 1.0, SY = 470;
    const sxp = v => SX + Math.min(v, SMAX) / SMAX * SW;
    const segs = [[0, 0.1, C.green], [0.1, 0.25, C.yellow], [0.25, SMAX, C.red]].map(([a, b, col]) => {
      const r = S(sc.svg, "rect", { x: sxp(a), y: SY, width: sxp(b) - sxp(a), height: 22 }, { fill: hexA(col, 0.55) });
      hide(r);
      return r;
    });
    const ticks = [0.1, 0.25].map(v => H(sc, String(v), { x: sxp(v), y: SY + 40, size: 16, color: C.dim, font: "mono" }));
    const legend = [["below 0.1 small", C.green], ["0.1–0.25 moderate", C.yellow], ["above 0.25 large", C.red]].map(([n, col]) => H(sc, n, { y: SY + 74, size: 17, color: col }));
    rowLayout(legend, SX + SW / 2, 16);
    const md = S(sc.svg, "path", { d: `M${sxp(N.psi_dist)},${SY - 4} l-9,-14 h18 z` }, { fill: C.red });
    const mq = S(sc.svg, "path", { d: `M${sxp(N.psi_queue)},${SY - 4} l-9,-14 h18 z` }, { fill: C.green });
    hide([md, mq]);
    const mdl = H(sc, "distance", { x: sxp(N.psi_dist), y: SY - 34, size: 17, color: C.red });
    const mql = H(sc, "queue", { anchor: "left", x: sxp(N.psi_queue) - 6, y: SY - 34, size: 17, color: C.green });
    const rt = H(sc, "PSI rule of thumb (Lewis, 1994)", { x: SX + SW / 2, y: SY + 104, size: 18, color: C.dim });
    tl.to(segs, { autoAlpha: 1, duration: 0.3, stagger: 0.1 }, at("m5", 0.5));
    fadeIn([...ticks, ...legend, rt], at("m5", 0.8), 0.4, { dy: 0 });
    show(md, frac("m5", 0.4), 0.3);
    fadeIn(mdl, frac("m5", 0.4), 0.3, { dy: 0 });
    pulse(vd, frac("m5", 0.42), 1.2, 0.5);
    show(mq, frac("m5", 0.75), 0.3);
    fadeIn(mql, frac("m5", 0.75), 0.3, { dy: 0 });
    pulse(vq, frac("m5", 0.77), 1.2, 0.5);

    // KS: cumulative distributions on the same distance axis
    fadeOut([...btr, ...bpr, lg1, lg2, psiF, psiS, ...ax.grid, ...ax.marks.filter((_, i) => i >= 10), ax.labels[1]], at("m6", 0), 0.4);
    const cy = v => ax.Y(v * 0.25);              // map 0..1 onto the same plot height
    const ptsT = N.cdf_grid.map((g, i) => [ax.X(g), cy(N.cdf_train[i])]);
    const ptsP = N.cdf_grid.map((g, i) => [ax.X(g), cy(N.cdf_prod[i])]);
    const cT = S(sc.svg, "path", { d: pathD(ptsT) }, { fill: "none", stroke: C.blue, strokeWidth: 4 });
    const cP = S(sc.svg, "path", { d: pathD(ptsP) }, { fill: "none", stroke: C.orange, strokeWidth: 4 });
    hide([cT, cP]);
    const gi = N.cdf_grid.indexOf(N.ks_at);
    const gap = S(sc.svg, "line", { x1: ax.X(N.ks_at), y1: cy(N.cdf_train[gi]), x2: ax.X(N.ks_at), y2: cy(N.cdf_prod[gi]) }, { stroke: C.red, strokeWidth: 4 });
    hide(gap);
    const yl = H(sc, "share of orders ≤ distance", { anchor: "left", x: 144, y: 162, size: 22, color: C.dim });
    const y1 = H(sc, "100%", { anchor: "right", x: 134, y: ax.Y(0.25), size: 18, color: C.dim });
    const lt1 = H(sc, "training", { anchor: "left", x: ax.X(9), y: cy(N.cdf_train[45]) - 26, size: 22, color: C.blue });
    const lt2 = H(sc, "production", { anchor: "left", x: ax.X(10.5), y: cy(N.cdf_prod[52]) + 30, size: 22, color: C.orange });
    const gl = H(sc, `largest gap D = ${f3(N.ks_dist)}`, { anchor: "left", x: ax.X(N.ks_at + 0.8), y: cy(0.2), size: 22, color: C.red, weight: 600 });
    fadeIn([yl, y1], at("m6", 0.4), 0.4, { dy: 0 });
    draw(cT, at("m6", 0.6), 1.0);
    draw(cP, at("m6", 0.9), 1.0);
    fadeIn([lt1, lt2], at("m6", 1.6), 0.4, { dy: 0 });
    draw(gap, frac("m6", 0.6), 0.5);
    fadeIn(gl, frac("m6", 0.66), 0.4, { dy: 0 });
    const ks1 = H(sc, `KS distance  D ${f3(N.ks_dist)}  ${pFmt(N.ks_dist_p)}`, { anchor: "left", x: 1110, y: 640, size: 21, color: C.red, font: "mono" });
    const ks2 = H(sc, `KS queue     D ${f3(N.ks_queue)}  ${pFmt(N.ks_queue_p)}`, { anchor: "left", x: 1110, y: 676, size: 21, color: C.green, font: "mono" });
    fadeIn([ks1, ks2], frac("m6", 0.75), 0.4, { dy: 0, stagger: 0.2 });

    // the accuracy drop, when the answers arrive
    fadeOut([...ax.all, cT, cP, gap, yl, y1, lt1, lt2, gl], at("m7", 0), 0.5);
    const BX = 260, BW = 560, bars = [[`test data, before`, N.acc_test, C.blue, 300], [`production, after`, N.acc_prod, C.red, 400]];
    const bels = bars.map(([n, v, col, y], i) => {
      const lb = H(sc, n, { anchor: "left", x: 150, y: y - 34, size: 22, color: col });
      const b = S(sc.svg, "rect", { x: BX - 110, y: y - 14, width: BW * v, height: 34 }, { fill: col });
      gsap.set(b, { scaleX: 0, transformOrigin: "0% 50%" });
      const vt = H(sc, f3(v), { anchor: "left", x: BX - 110 + BW * v + 14, y: y + 3, size: 26, color: col, font: "mono", weight: 600 });
      const t = i === 0 ? at("m7", 0.6) : frac("m7", 0.35);
      fadeIn(lb, t, 0.3, { dy: 0 });
      tl.to(b, { scaleX: 1, duration: 0.7, ease: "power2.out" }, t);
      fadeIn(vt, t + 0.5, 0.3, { dy: 0 });
      return [lb, b, vt];
    });
    const al = H(sc, "accuracy (late or on time)", { anchor: "left", x: 150, y: 220, size: 22, color: C.dim });
    fadeIn(al, at("m7", 0.3), 0.4, { dy: 0 });
    const why = H(sc, "trips over 6 km now go by car: the model never saw a car trip", { x: 575, y: 520, size: 24, color: C.orange, wrap: 820 });
    fadeIn(why, frac("m7", 0.55), 0.5);
    const lab = H(sc, "the correct answers arrive later", { x: 575, y: 580, size: 20, color: C.dim });
    fadeIn(lab, at("m7", 0.8), 0.4, { dy: 0 });
    void bels;
  }

  /* ---------------------------------------------------------------- 5 versions and tests */
  function ops(sc, N) {
    title(sc, "Versions and tests", "o2");
    const v = [["code", "git commit", C.blue], ["data", "snapshot + hash", C.teal], ["model", "late_model_v2.joblib", C.purple]]
      .map(([n, s, col], i) => box(sc, 400 + i * 400, 230, 330, 100, col, n, { sub: s }));
    const nv = H(sc, "version 2 = recent data + the old training data", { y: 320, size: 22, color: C.dim });
    fadeIn(nv, at("o2", 0.4), 0.4);
    v.forEach((b, i) => fadeIn(b.els, frac("o2", 0.55 + i * 0.12), 0.4, { dy: 0 }));
    tl.to(nv, { autoAlpha: 0, duration: 0.3 }, frac("o2", 0.5));

    // experiments
    const eh = H(sc, "experiments (validation accuracy)", { anchor: "left", x: 150, y: 400, size: 22, color: C.dim });
    const rows = N.runs.map((r, i) => {
      const best = JSON.stringify(r.hidden) === JSON.stringify(N.best);
      const a = H(sc, `run ${i + 1}   hidden layers ${JSON.stringify(r.hidden)}`, { anchor: "left", x: 150, y: 450 + i * 46, size: 22, font: "mono", color: best ? C.yellow : C.fg });
      const b = H(sc, f3(r.val), { anchor: "left", x: 640, y: 450 + i * 46, size: 22, font: "mono", color: best ? C.yellow : C.fg, weight: best ? 600 : 400 });
      return { a, b, best };
    });
    fadeIn(eh, at("o3", 0.4), 0.4, { dy: 0 });
    rows.forEach((r, i) => fadeIn([r.a, r.b], at("o3", 0.8 + i * 0.4), 0.3, { dy: 0 }));
    const bestRow = rows.find(r => r.best);
    const ring = S(sc.svg, "rect", { x: 136, y: 450 + rows.indexOf(bestRow) * 46 - 20, width: 600, height: 40, rx: 8 }, { fill: "none", stroke: C.yellow, strokeWidth: 2.5 });
    hide(ring);
    show(ring, frac("o3", 0.35), 0.3);

    // seeds
    const sh = H(sc, "same settings, set the seed", { anchor: "left", x: 900, y: 400, size: 22, color: C.dim });
    const s0 = N.seeds[0].val;
    const srows = N.seeds.map((s, i) => {
      const same = i > 0 && s.val === s0 && s.seed === N.seeds[0].seed;
      const col = i === 0 ? C.fg : same ? C.green : C.orange;
      const note = i === 0 ? "" : same ? "  same model" : "  other seed, other model";
      return H(sc, `seed ${s.seed}  →  ${f3(s.val)}${note}`, { anchor: "left", x: 900, y: 450 + i * 46, size: 22, font: "mono", color: col });
    });
    fadeIn(sh, frac("o3", 0.52), 0.4, { dy: 0 });
    srows.forEach((r, i) => fadeIn(r, frac("o3", 0.6 + i * 0.1), 0.3, { dy: 0 }));

    // test before deploy
    fadeOut([eh, ...rows.flatMap(r => [r.a, r.b]), ring, sh, ...srows], at("o5", 0), 0.4);
    const th = H(sc, "test before deploy: the same recent production orders", { y: 400, size: 24, color: C.dim });
    const BX = 420, BW = 700;
    const tb = [["v1", N.v1_prod, C.red, 470], ["v2", N.v2_prod, C.green, 530]].map(([n, val, col, y]) => {
      const lb = H(sc, n, { anchor: "right", x: BX - 16, y, size: 26, color: col, weight: 700, font: "mono" });
      const b = S(sc.svg, "rect", { x: BX, y: y - 17, width: BW * val, height: 34 }, { fill: col });
      gsap.set(b, { scaleX: 0, transformOrigin: "0% 50%" });
      const vt = H(sc, f3(val), { anchor: "left", x: BX + BW * val + 14, y, size: 26, color: col, font: "mono", weight: 600 });
      return [lb, b, vt];
    });
    fadeIn(th, at("o5", 0.3), 0.4);
    tb.forEach(([lb, b, vt], i) => {
      const t = at("o5", 0.8 + i * 0.9);
      fadeIn(lb, t, 0.3, { dy: 0 });
      tl.to(b, { scaleX: 1, duration: 0.6, ease: "power2.out" }, t);
      fadeIn(vt, t + 0.4, 0.3, { dy: 0 });
    });

    // deploy and roll back
    const dY = 700;
    const d1 = box(sc, 520, dY, 200, 80, C.red, "v1", { size: 30, font: "mono" });
    const d2 = box(sc, 1000, dY, 200, 80, C.green, "v2", { size: 30, font: "mono" });
    const dep = arrow(sc, 625, dY - 14, 895, dY - 14, C.green, 4, 16);
    const back = arrow(sc, 895, dY + 22, 625, dY + 22, C.orange, 4, 16);
    const depL = H(sc, "better: deploy", { x: 760, y: dY - 46, size: 22, color: C.green, weight: 600 });
    const backL = H(sc, "fails in production: roll back", { x: 760, y: dY + 58, size: 22, color: C.orange, weight: 600 });
    fadeIn(d1.els, at("o6", 0.3), 0.4, { dy: 0 });
    drawArrow(dep, at("o6", 0.7), 0.5);
    fadeIn([...d2.els, depL], at("o6", 1.0), 0.4, { dy: 0 });
    drawArrow(back, frac("o6", 0.6), 0.6);
    fadeIn(backL, frac("o6", 0.66), 0.4, { dy: 0 });

    // next episode
    const all = [...v.flatMap(b => b.els), th, ...tb.flat(), ...d1.els, ...d2.els, ...arrowEls(dep), ...arrowEls(back), depL, backL];
    fadeOut(all, at("o7", 0), 0.5);
    const nx = H(sc, "Next · Episode 6 · From ML to LLMs", { y: 330, size: 40, color: LEVEL_COLOR.Advanced, weight: 600 });
    const toks = ["Large", " language", " models", " predict", " the", " next", " token"].map((w, i) => chip(sc, w.trim(), [C.blue, C.teal, C.green, C.yellow, C.orange, C.purple, C.red][i], { y: 470, size: 30 }));
    rowLayout(toks, 800, 12);
    fadeIn(nx, at("o7", 0.4), 0.6);
    fadeIn(toks, frac("o7", 0.5), 0.4, { stagger: 0.15 });
  }

  return { lifecycle, pipeline, serve, monitor, ops };
})();
