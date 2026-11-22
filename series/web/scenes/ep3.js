/* Episode 3 - Classification and metrics. Contract: OUTLINE.md. N = episodes/ep3.py nums(). */
SCENES_BY_EP.ep3 = (() => {
  const reveal = els => gsap.set(els, { autoAlpha: 1 });
  let PAY, DEF;                    // set when a builder runs: this file loads before the engine defines C
  const sig = z => 1 / (1 + Math.exp(-z));
  const logit = p => Math.log(p / (1 - p));
  function title(sc, text, key) { write(H(sc, text, { y: 78, size: 56, font: "serif", weight: 600 }), at(key, 0.1), 1.0); }
  function loanPlot(sc, N) {
    const ax = axes(sc, {
      x: 150, y: 170, w: 850, h: 580, xr: [0, 65], yr: [450, 850], grid: true,
      xticks: [0, 10, 20, 30, 40, 50, 60], yticks: [500, 600, 700, 800],
      xlabel: "debt ratio (% of income)", ylabel: "credit score",
    });
    const T = N.test, i0 = [], i1 = [];
    T.y.forEach((c, i) => (c ? i1 : i0).push(i));
    const pay = dots(sc, ax, i0.map(i => T.debt[i]), i0.map(i => T.score[i]), { r: 8, color: PAY });
    const def = dots(sc, ax, i1.map(i => T.debt[i]), i1.map(i => T.score[i]), { r: 8, color: DEF });
    return { ax, pay, def, all: [...ax.all, ...pay, ...def] };
  }
  /* a small tree icon (7 nodes) centred on (cx, cy) */
  function treeIcon(sc, cx, cy, col, s = 1) {
    const g = S(sc.svg, "g");
    const P = [[0, -34], [-22, 0], [22, 0], [-33, 34], [-11, 34], [11, 34], [33, 34]].map(([x, y]) => [cx + x * s, cy + y * s]);
    [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]].forEach(([a, b]) => S(g, "line", { x1: P[a][0], y1: P[a][1], x2: P[b][0], y2: P[b][1] }, { stroke: col, strokeWidth: 2.5 }));
    P.forEach(([x, y], i) => S(g, "circle", { cx: x, cy: y, r: (i < 3 ? 7 : 6) * s }, { fill: i < 3 ? col : C.stage, stroke: col, strokeWidth: 2.5 }));
    gsap.set(g, { autoAlpha: 0 });
    return g;
  }

  /* ---------------------------------------------------------------- 1 number or class */
  function classify(sc, N) {
    title(sc, "Number or class", "c1");
    const lab1 = H(sc, "Regression · episodes 1 and 2", { anchor: "left", x: 110, y: 200, size: 26, color: C.dim, weight: 600 });
    const in1 = chip(sc, "area", C.orange, { x: 330, y: 290, size: 28 });
    const m1 = box(sc, 800, 290, 220, 86, C.yellow, "model");
    const o1 = chip(sc, "price: a number", C.green, { x: 1270, y: 290, size: 28 });
    const a1 = arrow(sc, 400, 290, 682, 290, C.dim, 3, 14), a2 = arrow(sc, 918, 290, 1140, 290, C.dim, 3, 14);
    fadeIn(lab1, at("c1", 0.3), 0.5, { dy: 0, dx: -12 });
    fadeIn(in1, at("c1", 1.0), 0.4);
    drawArrow(a1, at("c1", 1.4), 0.4);
    fadeIn(m1.els, at("c1", 1.7), 0.4, { dy: 0 });
    drawArrow(a2, at("c1", 2.2), 0.4);
    fadeIn(o1, frac("c1", 0.45), 0.5, { dy: 0, dx: -12 });

    const lab2 = H(sc, "Classification · this episode", { anchor: "left", x: 110, y: 450, size: 26, color: C.dim, weight: 600 });
    const in2 = chip(sc, "customer", C.orange, { x: 330, y: 560, size: 28 });
    const m2 = box(sc, 800, 560, 220, 86, C.yellow, "model");
    const oP = chip(sc, "pays back", PAY, { x: 1270, y: 500, size: 28 });
    const oD = chip(sc, "default", DEF, { x: 1270, y: 620, size: 28 });
    const b1 = arrow(sc, 430, 560, 682, 560, C.dim, 3, 14);
    const b2 = arrow(sc, 918, 548, 1160, 505, C.dim, 3, 14), b3 = arrow(sc, 918, 572, 1180, 615, C.dim, 3, 14);
    const yn = H(sc, "yes or no?", { x: 1270, y: 712, size: 24, color: C.dim });
    fadeIn(lab2, at("c2", 0.3), 0.5, { dy: 0, dx: -12 });
    fadeIn(in2, frac("c2", 0.35), 0.4);
    drawArrow(b1, frac("c2", 0.42), 0.4);
    fadeIn(m2.els, frac("c2", 0.48), 0.4, { dy: 0 });
    drawArrow(b2, frac("c2", 0.55), 0.4);
    drawArrow(b3, frac("c2", 0.55), 0.4);
    fadeIn([oP, oD], frac("c2", 0.6), 0.4, { stagger: 0.15 });
    fadeIn(yn, frac("c2", 0.8), 0.4);
    const rows = [lab1, in1, ...m1.els, o1, a1.line, a1.tip, a2.line, a2.tip, lab2, in2, ...m2.els, oP, oD, b1.line, b1.tip, b2.line, b2.tip, b3.line, b3.tip, yn];
    fadeOut(rows, at("c3", 0), 0.5);

    // the data: two features, two classes
    const { ax, pay, def } = loanPlot(sc, N);
    ax.show(at("c3", 0.6), 1.0);
    const one = H(sc, "one point = one customer", { x: 1310, y: 250, size: 26 });
    const f1 = chip(sc, "debt ratio", C.orange, { y: 320, size: 24 }), f2 = chip(sc, "credit score", C.orange, { y: 320, size: 24 });
    rowLayout([f1, f2], 1310, 14);
    fadeIn(one, frac("c3", 0.35), 0.5);
    fadeIn(f1, frac("c3", 0.62), 0.4);
    pulse(ax.labels[0], frac("c3", 0.62), 1.2, 0.6);
    fadeIn(f2, frac("c3", 0.8), 0.4);
    pulse(ax.labels[1], frac("c3", 0.8), 1.2, 0.6);

    tl.to(pay, { autoAlpha: 1, duration: 0.2, stagger: 0.03 }, at("c4", 0.2));
    tl.to(def, { autoAlpha: 1, duration: 0.2, stagger: 0.04 }, frac("c4", 0.42));
    const lgP = S(sc.svg, "circle", { cx: 1200, cy: 420, r: 9 }, { fill: PAY }), lgD = S(sc.svg, "circle", { cx: 1200, cy: 470, r: 9 }, { fill: DEF });
    gsap.set([lgP, lgD], { autoAlpha: 0 });
    const tP = H(sc, "paid back", { anchor: "left", x: 1222, y: 420, size: 24, color: PAY });
    const tD = H(sc, "default: did not pay", { anchor: "left", x: 1222, y: 470, size: 24, color: DEF });
    show(lgP, at("c4", 0.3), 0.3); fadeIn(tP, at("c4", 0.3), 0.3, { dy: 0 });
    show(lgD, frac("c4", 0.45), 0.3); fadeIn(tD, frac("c4", 0.45), 0.3, { dy: 0 });
    const cnt = H(sc, `${N.n_test} customers: ${N.n_test - N.test_defaults} paid, ${N.test_defaults} default`, { x: 1310, y: 530, size: 22, color: C.dim });
    fadeIn(cnt, frac("c4", 0.8), 0.4);

    // a new customer
    const nx = ax.X(33), ny = ax.Y(790);
    const nc = S(sc.svg, "circle", { cx: nx, cy: ny, r: 13 }, { fill: C.stage, stroke: C.yellow, strokeWidth: 4 });
    gsap.set(nc, { autoAlpha: 0 });
    const nl = H(sc, "new customer", { x: nx, y: ny - 34, size: 22, color: C.yellow, weight: 600 });
    const q = H(sc, "P(default) = ?", { x: 1310, y: 640, size: 36, color: C.yellow, font: "mono" });
    show(nc, at("c5", 0.2), 0.3);
    pulse(nc, at("c5", 0.5), 1.4, 0.6);
    fadeIn(nl, at("c5", 0.4), 0.4, { dy: 0 });
    fadeIn(q, frac("c5", 0.5), 0.5);
  }

  /* ---------------------------------------------------------------- 2 logistic regression */
  function sigmoid(sc, N) {
    title(sc, "Logistic regression", "s1");
    const f1 = H(sc, "z = w₁ × debt + w₂ × score + b", { y: 180, size: 36, font: "mono" });
    const sgn = v => (v < 0 ? `− ${Math.abs(v)}` : `+ ${v}`);
    const f2 = H(sc, `z = ${N.w1} × debt ${sgn(N.w2)} × score ${sgn(N.b)}`, { y: 232, size: 24, color: C.dim, font: "mono" });
    const like = H(sc, "a weighted sum, as in linear regression", { y: 180, size: 30, color: C.dim });
    fadeIn(like, frac("s1", 0.45), 0.5);
    fadeOut(like, at("s2", 0), 0.3);
    write(f1, at("s2", 0.2), 1.2);
    fadeIn(f2, frac("s2", 0.5), 0.5);
    const zc = chip(sc, "score z", C.orange, { x: 1390, y: 180, size: 24 });
    fadeIn(zc, frac("s2", 0.82), 0.4, { dy: 0, dx: -10 });

    const ax = axes(sc, {
      x: 200, y: 300, w: 1200, h: 380, xr: [-8, 6], yr: [0, 1], grid: true,
      xticks: [-8, -6, -4, -2, 0, 2, 4, 6], yticks: [0, 0.5, 1], xfmt: v => (v < 0 ? `−${-v}` : String(v)),
      xlabel: "score z", ylabel: "probability of default",
    });
    const nx = 16;                                         // 8 x-ticks, two marks each
    draw(ax.xa, at("s3", 0.2), 0.7);
    tl.to(ax.marks.slice(0, nx), { autoAlpha: 1, duration: 0.4 }, at("s3", 0.6));
    fadeIn(ax.labels[0], at("s3", 0.6), 0.4, { dy: 0 });
    const ds = N.z.map((z, i) => {
      const c = S(sc.svg, "circle", { cx: ax.X(z), cy: ax.Y(0) - 16 - (i % 4) * 13, r: 7 }, { fill: N.test.y[i] ? DEF : PAY, opacity: 0.9 });
      gsap.set(c, { autoAlpha: 0 });
      return c;
    });
    tl.to(ds, { autoAlpha: 1, duration: 0.15, stagger: 0.015 }, at("s3", 0.8));
    const any = H(sc, "z: any number", { x: 1210, y: 360, size: 26, color: C.orange });
    fadeIn(any, at("s3", 1.4), 0.4, { dy: 0 });
    draw(ax.ya, frac("s3", 0.55), 0.6);
    tl.to([...ax.marks.slice(nx), ...ax.grid], { autoAlpha: 1, duration: 0.4 }, frac("s3", 0.65));
    fadeIn(ax.labels[1], frac("s3", 0.65), 0.4, { dy: 0 });
    const zo = H(sc, "a probability: from 0 to 1", { x: 1210, y: 405, size: 26, color: C.yellow });
    fadeIn(zo, frac("s3", 0.7), 0.4, { dy: 0 });
    fadeOut([any, zo], at("s4", 0), 0.3);

    const cv = curve(sc, ax, sig, -8, 6, { color: C.yellow, width: 5 });
    draw(cv, at("s4", 0.4), 1.6);
    const sf = H(sc, "sigmoid(z) = 1 / (1 + e^(−z))", { x: 520, y: 400, size: 30, color: C.yellow, font: "mono" });
    write(sf, frac("s4", 0.3), 1.2);
    ds.forEach((c, i) => tl.to(c, { attr: { cy: ax.Y(sig(N.z[i])) }, duration: 1.0, ease: "power2.inOut" }, frac("s4", 0.62) + (i % 10) * 0.03));

    function mark(z, t, side) {
      const p = sig(z), x = ax.X(z), y = ax.Y(p);
      const v = S(sc.svg, "line", { x1: x, y1: ax.Y(0), x2: x, y2: y }, { stroke: C.fg, strokeWidth: 2, strokeDasharray: "6 6" });
      const h = S(sc.svg, "line", { x1: ax.x, y1: y, x2: x, y2: y }, { stroke: C.fg, strokeWidth: 2, strokeDasharray: "6 6" });
      const d = S(sc.svg, "circle", { cx: x, cy: y, r: 10 }, { fill: "none", stroke: C.fg, strokeWidth: 3 });
      gsap.set([v, h, d], { autoAlpha: 0 });
      const zt = z < 0 ? `−${-z}` : `+${z}`;
      const l = H(sc, `z = ${zt}  →  p = ${p.toFixed(2)}`, side === "r"
        ? { anchor: "left", x: x + 20, y: y + 34, size: 24, weight: 600 }
        : { x, y: y - 44, size: 24, weight: 600 });
      show([v, h, d], t, 0.4);
      fadeIn(l, t + 0.2, 0.4, { dy: 0 });
    }
    mark(4, at("s5", 0.3), "r");
    mark(-4, frac("s5", 0.55), "c");

    const tr = H(sc, "Training: gradient descent, as in episode 1", { y: 790, size: 28, weight: 600 });
    const ll = H(sc, "loss = log loss = −mean[ y·log(p) + (1 − y)·log(1 − p) ]", { y: 840, size: 24, color: C.dim, font: "mono" });
    fadeIn(tr, at("s6", 0.3), 0.5);
    fadeIn(ll, frac("s6", 0.6), 0.5);
  }

  /* ---------------------------------------------------------------- 3 threshold */
  function threshold(sc, N) {
    title(sc, "Threshold", "t1");
    const { ax, all } = loanPlot(sc, N);
    reveal(all);
    const tag = H(sc, `test data: ${N.n_test} customers`, { anchor: "left", x: ax.x + 12, y: ax.y + 14, size: 20, color: C.dim });
    reveal(tag);

    // probability scale with a threshold
    const BX = 1120, TOP = 250, BOT = 610, P = p => BOT - (BOT - TOP) * p;
    const head = H(sc, "probability of default", { x: 1300, y: 190, size: 24, color: C.dim });
    const up = S(sc.svg, "rect", { x: BX - 12, y: TOP, width: 24, height: P(0.5) - TOP }, { fill: hexA(DEF, 0.35) });
    const dn = S(sc.svg, "rect", { x: BX - 12, y: P(0.5), width: 24, height: BOT - P(0.5) }, { fill: hexA(PAY, 0.35) });
    const frame = S(sc.svg, "rect", { x: BX - 12, y: TOP, width: 24, height: BOT - TOP }, { fill: "none", stroke: C.dim, strokeWidth: 2 });
    gsap.set([up, dn, frame], { autoAlpha: 0 });
    const tk = [1, 0.5, 0].map(v => H(sc, String(v), { anchor: "right", x: BX - 22, y: P(v), size: 20, color: C.dim, font: "mono" }));
    fadeIn(head, at("t1", 0.3), 0.4);
    show(frame, at("t1", 0.5), 0.4);
    fadeIn(tk, at("t1", 0.6), 0.4, { dy: 0 });
    const yes = H(sc, "decision: yes or no", { x: 1300, y: 690, size: 26, color: C.fg });
    fadeIn(yes, frac("t1", 0.55), 0.4);
    fadeOut(yes, at("t2", 0), 0.3);

    const mk = S(sc.svg, "line", { x1: BX - 26, y1: P(0.5), x2: BX + 26, y2: P(0.5) }, { stroke: C.yellow, strokeWidth: 5 });
    gsap.set(mk, { autoAlpha: 0 });
    const ml = H(sc, "", { anchor: "left", x: BX + 38, y: P(0.5), size: 24, color: C.yellow, font: "mono", weight: 600 });
    counter(ml, at("t2", 0), 0.5, 0.5, 0.01, v => `threshold ${v.toFixed(2)}`);
    const rD = H(sc, "predict: default", { anchor: "left", x: BX + 38, y: TOP + 18, size: 22, color: DEF, weight: 600 });
    const rP = H(sc, "predict: pays back", { anchor: "left", x: BX + 38, y: BOT - 18, size: 22, color: PAY, weight: 600 });
    show([up, dn], at("t2", 0.5), 0.5);
    show(mk, frac("t2", 0.3), 0.3);
    fadeIn(ml, frac("t2", 0.3), 0.4, { dy: 0 });
    fadeIn(rD, frac("t2", 0.55), 0.4, { dy: 0 });
    fadeIn(rP, frac("t2", 0.62), 0.4, { dy: 0 });

    // the decision boundary on the plot: w1*debt + w2*score + b = logit(threshold)
    const sAt = (d, t) => (logit(t) - N.b - N.w1 * d) / N.w2;
    const pts = t => `${ax.X(0)},${ax.Y(sAt(0, t))} ${ax.X(65)},${ax.Y(sAt(65, t))} ${ax.X(65)},${ax.Y(450)} ${ax.X(0)},${ax.Y(450)}`;
    const zone = S(sc.svg, "polygon", { points: pts(0.5), "clip-path": ax.clip }, { fill: hexA(DEF, 0.12) });
    const bl = S(sc.svg, "line", { x1: ax.X(0), y1: ax.Y(sAt(0, 0.5)), x2: ax.X(65), y2: ax.Y(sAt(65, 0.5)), "clip-path": ax.clip }, { stroke: C.yellow, strokeWidth: 5 });
    gsap.set(zone, { autoAlpha: 0 });
    draw(bl, at("t3", 0.3), 1.0);
    show(zone, at("t3", 1.2), 0.6);
    const ang = Math.atan2(ax.Y(sAt(65, 0.5)) - ax.Y(sAt(0, 0.5)), ax.X(65) - ax.X(0)) * 180 / Math.PI;
    const bLab = chip(sc, "decision boundary", C.yellow, { x: ax.X(13), y: ax.Y(sAt(13, 0.5)) - 30, size: 20 });
    bLab.style.background = C.stage;
    gsap.set(bLab, { rotation: ang });
    fadeIn(bLab, frac("t3", 0.5), 0.4, { dy: 0 });
    const c5 = N.cm05, c3 = N.cm03;
    const found = H(sc, `defaults found: ${c5.tp} of ${c5.tp + c5.fn}`, { x: 1310, y: 690, size: 24, font: "mono" });
    const alarm = H(sc, `false alarms: ${c5.fp}`, { x: 1310, y: 730, size: 24, font: "mono", color: C.orange });
    fadeIn([found, alarm], frac("t3", 0.7), 0.4, { stagger: 0.15 });

    // threshold 0.5 -> 0.3
    const tM = frac("t4", 0.22), d = 1.8;
    const lt = 0.3;
    tl.to(mk, { attr: { y1: P(lt), y2: P(lt) }, duration: d, ease: "power2.inOut" }, tM);
    tl.to(ml, { top: P(lt) + "px", duration: d, ease: "power2.inOut" }, tM);
    counter(ml, tM, 0.5, lt, d, v => `threshold ${v.toFixed(2)}`);
    tl.to(up, { attr: { height: P(lt) - TOP }, duration: d, ease: "power2.inOut" }, tM);
    tl.to(dn, { attr: { y: P(lt), height: BOT - P(lt) }, duration: d, ease: "power2.inOut" }, tM);
    tl.to(bl, { attr: { y1: ax.Y(sAt(0, lt)), y2: ax.Y(sAt(65, lt)) }, duration: d, ease: "power2.inOut" }, tM);
    tl.to(zone, { attr: { points: pts(lt) }, duration: d, ease: "power2.inOut" }, tM);
    tl.to(bLab, { y: ax.Y(sAt(13, lt)) - ax.Y(sAt(13, 0.5)), duration: d, ease: "power2.inOut" }, tM);
    swapText(found, frac("t4", 0.5), `defaults found: ${c3.tp} of ${c3.tp + c3.fn}`);
    swapText(alarm, frac("t4", 0.72), `false alarms: ${c3.fp}`);
    pulse(found, frac("t4", 0.5), 1.12, 0.5);
    pulse(alarm, frac("t4", 0.72), 1.12, 0.5);

    const cost = H(sc, "A missed default or a false alarm: which costs the bank more?", { x: 1310, y: 820, size: 23, wrap: 470, color: C.fg });
    fadeIn(cost, at("t5", 0.2), 0.5);
  }

  /* ---------------------------------------------------------------- 4 confusion matrix */
  function metrics(sc, N) {
    title(sc, "Confusion matrix", "m1");
    const cm = N.cm05;
    const sub = H(sc, `test data: ${N.n_test} customers · threshold 0.5`, { x: 570, y: 170, size: 24, color: C.dim });
    fadeIn(sub, at("m1", 0.5), 0.5);
    const CX = [450, 690], CY = [370, 530];
    const colH = ["predicted: default", "predicted: pays back"].map((s, i) => H(sc, s, { x: CX[i], y: 268, size: 21, color: C.dim, weight: 600 }));
    const rowH = ["actual: default", "actual: pays back"].map((s, i) => H(sc, s, { anchor: "right", x: 316, y: CY[i], size: 21, color: C.dim, weight: 600 }));
    const spec = [
      [0, 0, "tp", "true positive", C.green], [1, 0, "fn", "false negative", C.orange],
      [0, 1, "fp", "false positive", C.orange], [1, 1, "tn", "true negative", C.blue],
    ];
    const cells = {};
    spec.forEach(([c, r, k, name, col]) => {
      const rc = S(sc.svg, "rect", { x: CX[c] - 116, y: CY[r] - 76, width: 232, height: 152, rx: 12 }, { fill: hexA(col, 0.1), stroke: col, strokeWidth: 3 });
      gsap.set(rc, { autoAlpha: 0 });
      const n = H(sc, "", { x: CX[c], y: CY[r] - 14, size: 56, color: col, font: "mono", weight: 500 });
      const l = H(sc, name, { x: CX[c], y: CY[r] + 44, size: 20, color: col, weight: 600 });
      cells[k] = { rc, n, l };
    });
    fadeIn([...colH, ...rowH], frac("m1", 0.55), 0.5, { stagger: 0.1 });
    ["tp", "fn", "fp", "tn"].forEach((k, i) => {
      const t = at("m2", 0.2 + i * 0.35);
      draw(cells[k].rc, t, 0.5);
      counter(cells[k].n, t, 0, cm[k], 0.8);
      show(cells[k].n, t + 0.1, 0.3);
    });
    fadeIn(cells.tn.l, frac("m2", 0.8), 0.4, { dy: 0 });
    [["tp", 0.02], ["fp", 0.33], ["fn", 0.62]].forEach(([k, f]) => {
      fadeIn(cells[k].l, frac("m3", f), 0.4, { dy: 0 });
      pulse(cells[k].rc, frac("m3", f), 1.06, 0.6);
    });
    const ex = H(sc, "", { x: 570, y: 690, size: 24 });
    counter(ex, at("m3", 0), 0, 0, 0.01, () => "found default");
    show(ex, at("m3", 0.3), 0.3);
    swapText(ex, frac("m3", 0.33), "false alarm");
    swapText(ex, frac("m3", 0.62), "default that the model does not find");
    fadeOut(ex, at("m4", 0), 0.3);

    // precision, recall, F1
    const colBox = S(sc.svg, "rect", { x: CX[0] - 126, y: CY[0] - 86, width: 252, height: 332, rx: 16 }, { fill: "none", stroke: C.yellow, strokeWidth: 4 });
    const rowBox = S(sc.svg, "rect", { x: CX[0] - 126, y: CY[0] - 86, width: 492, height: 172, rx: 16 }, { fill: "none", stroke: C.yellow, strokeWidth: 4 });
    gsap.set([colBox, rowBox], { autoAlpha: 0 });
    const RX = 1215;
    const pH = H(sc, "precision = TP / (TP + FP)", { x: RX, y: 300, size: 28, weight: 600 });
    const pV = H(sc, `= ${cm.tp} / (${cm.tp} + ${cm.fp}) = ${N.precision.toFixed(3)}`, { x: RX, y: 345, size: 26, color: C.yellow, font: "mono" });
    const rH = H(sc, "recall = TP / (TP + FN)", { x: RX, y: 440, size: 28, weight: 600 });
    const rV = H(sc, `= ${cm.tp} / (${cm.tp} + ${cm.fn}) = ${N.recall.toFixed(3)}`, { x: RX, y: 485, size: 26, color: C.yellow, font: "mono" });
    const fH = H(sc, "F1 = 2 × precision × recall / (precision + recall)", { x: RX, y: 590, size: 22, weight: 600 });
    const fV = H(sc, `= ${N.f1.toFixed(3)}`, { x: RX, y: 635, size: 30, color: C.yellow, font: "mono" });
    show(colBox, at("m4", 0.3), 0.4);
    fadeIn(pH, at("m4", 0.3), 0.4);
    fadeIn(pV, at("m4", 1.2), 0.4);
    fadeOut(colBox, frac("m4", 0.5), 0.3);
    show(rowBox, frac("m4", 0.52), 0.4);
    fadeIn(rH, frac("m4", 0.52), 0.4);
    fadeIn(rV, frac("m4", 0.66), 0.4);
    fadeOut(rowBox, end("m4", 0), 0.3);
    fadeIn(fH, at("m5", 0.3), 0.4);
    fadeIn(fV, frac("m5", 0.55), 0.4);

    // the accuracy trap
    const matrix = [sub, ...colH, ...rowH, ...Object.values(cells).flatMap(c => [c.rc, c.n, c.l]), pH, pV, rH, rV, fH, fV];
    fadeOut(matrix, at("m6", 0), 0.5);
    const T = N.trap, per = T.n / 100, redIdx = new Set([13, 47, 82].slice(0, T.defaults / per));
    const sq = [];
    for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
      const k = r * 10 + c, red = redIdx.has(k);
      const e = S(sc.svg, "rect", { x: 200 + c * 46, y: 220 + r * 46, width: 38, height: 38, rx: 5 }, { fill: red ? DEF : hexA(PAY, 0.55) });
      gsap.set(e, { autoAlpha: 0 });
      sq.push(e);
    }
    tl.to(sq, { autoAlpha: 1, duration: 0.15, stagger: 0.012 }, at("m6", 0.4));
    const sqL = H(sc, `${T.n} customers, ${T.defaults} defaults · 1 square = ${per} customers`, { x: 427, y: 720, size: 22, color: C.dim });
    fadeIn(sqL, frac("m6", 0.5), 0.4);
    sq.filter((_, k) => redIdx.has(k)).forEach(e => pulse(e, frac("m6", 0.7), 1.3, 0.6));

    const al = H(sc, "A model that always says: no default", { x: 1130, y: 300, size: 30, weight: 600 });
    const acc = H(sc, `accuracy = ${(T.acc * 100).toFixed(1)} %`, { x: 1130, y: 400, size: 44, color: C.green, font: "mono" });
    const rec = H(sc, `recall = ${(T.recall * 100).toFixed(0)} %`, { x: 1130, y: 480, size: 44, color: DEF, font: "mono" });
    const fnd = H(sc, `It finds 0 of ${T.defaults} defaults.`, { x: 1130, y: 550, size: 26, color: C.dim });
    fadeIn(al, at("m7", 0.3), 0.5);
    fadeIn(acc, frac("m7", 0.25), 0.5);
    fadeIn(rec, frac("m7", 0.6), 0.5);
    fadeIn(fnd, frac("m7", 0.75), 0.5);
    tl.to(sq.filter((_, k) => redIdx.has(k)), { fill: hexA(PAY, 0.55), stroke: DEF, strokeWidth: 3, duration: 0.5 }, frac("m7", 0.62));
  }

  /* ---------------------------------------------------------------- 5 trees and ensembles */
  function trees(sc, N) {
    title(sc, "Trees and ensembles", "d1");
    const { ax, all } = loanPlot(sc, N);
    reveal(all);

    // layout of the fitted tree: leaves evenly spaced, parents above the middle of their children
    const nodes = N.tree, pos = {};
    let leafN = 0;
    const leaves = nodes.filter(n => n.f < 0).length;
    (function place(i, depth) {
      const n = nodes[i];
      if (n.f < 0) { pos[i] = { x: 1090 + (leafN++) * (410 / Math.max(1, leaves - 1)), y: 250 + depth * 150 }; return; }
      place(n.l, depth + 1); place(n.r, depth + 1);
      pos[i] = { x: (pos[n.l].x + pos[n.r].x) / 2, y: 250 + depth * 150 };
    })(0, 0);
    const fname = n => (n.f === 0 ? `debt ≤ ${n.thr} %?` : `score ≤ ${n.thr}?`);
    const nodeEls = {}, edgeEls = [];
    nodes.forEach((n, i) => {
      const p = pos[i], leaf = n.f < 0;
      const col = leaf ? (n.cls ? DEF : PAY) : C.fg;
      nodeEls[i] = box(sc, p.x, p.y, leaf ? 124 : 210, leaf ? 52 : 62, col, leaf ? (n.cls ? "default" : "pays back") : fname(n), { size: leaf ? 20 : 22, fill: leaf ? 0.15 : 0.06, sw: 2.5, weight: 600 });
      if (!leaf) [[n.l, "yes"], [n.r, "no"]].forEach(([c, word]) => {
        const q = pos[c];
        const ln = S(sc.svg, "line", { x1: p.x, y1: p.y + 31, x2: q.x, y2: q.y - (nodes[c].f < 0 ? 26 : 31) }, { stroke: C.dim, strokeWidth: 2.5 });
        gsap.set(ln, { autoAlpha: 0 });
        const wl = H(sc, word, { x: (p.x + q.x) / 2 + (word === "yes" ? -24 : 24), y: (p.y + q.y) / 2 + 2, size: 18, color: C.dim });
        edgeEls.push({ ln, wl, depth: (p.y - 250) / 150, from: i });
      });
    });
    const byDepth = d => nodes.map((n, i) => i).filter(i => (pos[i].y - 250) / 150 === d);
    fadeIn(nodeEls[0].els, at("d1", 0.8), 0.5);
    edgeEls.filter(e => e.depth === 0).forEach(e => { draw(e.ln, at("d2", 0.3), 0.4); fadeIn(e.wl, at("d2", 0.5), 0.3, { dy: 0 }); });
    byDepth(1).forEach(i => fadeIn(nodeEls[i].els, at("d2", 0.7), 0.4));
    edgeEls.filter(e => e.depth === 1).forEach(e => { draw(e.ln, frac("d2", 0.45), 0.4); fadeIn(e.wl, frac("d2", 0.5), 0.3, { dy: 0 }); });
    byDepth(2).forEach(i => fadeIn(nodeEls[i].els, frac("d2", 0.55), 0.4));
    // one customer travels down the tree: root -> left -> left leaf
    let path = [0];
    while (nodes[path[path.length - 1]].f >= 0) path.push(nodes[path[path.length - 1]].l);
    const tok = S(sc.svg, "circle", { cx: pos[0].x, cy: pos[0].y - 44, r: 10 }, { fill: C.yellow });
    gsap.set(tok, { autoAlpha: 0 });
    show(tok, frac("d2", 0.65), 0.2);
    path.slice(1).forEach((i, k) => tl.to(tok, { attr: { cx: pos[i].x, cy: pos[i].y - 40 }, duration: 0.6, ease: "power2.inOut" }, frac("d2", 0.7) + k * 0.7));
    fadeOut(tok, at("d3", 0), 0.3);

    // the questions cut the plot into rectangles
    const cuts = [], rects = [];
    (function cut(i, x0, x1, y0, y1, depth) {
      const n = nodes[i];
      if (n.f < 0) { rects.push({ x0, x1, y0, y1, cls: n.cls }); return; }
      const l = n.f === 0
        ? S(sc.svg, "line", { x1: ax.X(n.thr), y1: ax.Y(y0), x2: ax.X(n.thr), y2: ax.Y(y1) }, { stroke: C.yellow, strokeWidth: 4 })
        : S(sc.svg, "line", { x1: ax.X(x0), y1: ax.Y(n.thr), x2: ax.X(x1), y2: ax.Y(n.thr) }, { stroke: C.yellow, strokeWidth: 4 });
      gsap.set(l, { autoAlpha: 0 });
      cuts.push({ l, depth });
      if (n.f === 0) { cut(n.l, x0, n.thr, y0, y1, depth + 1); cut(n.r, n.thr, x1, y0, y1, depth + 1); }
      else { cut(n.l, x0, x1, y0, n.thr, depth + 1); cut(n.r, x0, x1, n.thr, y1, depth + 1); }
    })(0, 0, 65, 450, 850, 0);
    cuts.forEach(c => draw(c.l, at("d3", 0.3) + c.depth * 1.2, 0.8));
    const shades = rects.map(q => {
      const e = S(sc.svg, "rect", { x: ax.X(q.x0), y: ax.Y(q.y1), width: ax.X(q.x1) - ax.X(q.x0), height: ax.Y(q.y0) - ax.Y(q.y1) }, { fill: hexA(q.cls ? DEF : PAY, 0.14) });
      sc.svg.insertBefore(e, sc.svg.firstChild);
      gsap.set(e, { autoAlpha: 0 });
      return e;
    });
    tl.to(shades, { autoAlpha: 1, duration: 0.5, stagger: 0.15 }, frac("d3", 0.6));
    const ta = H(sc, `depth 2 · test accuracy ${N.tree_acc.toFixed(3)}`, { x: 1320, y: 650, size: 22, color: C.dim, font: "mono" });
    fadeIn(ta, frac("d3", 0.75), 0.4);

    // ensembles
    const treePart = [...all, ...cuts.map(c => c.l), ...shades, ...Object.values(nodeEls).flatMap(b => b.els), ...edgeEls.flatMap(e => [e.ln, e.wl]), ta];
    fadeOut(treePart, at("d4", 0), 0.5);
    const one = treeIcon(sc, 800, 300, C.fg, 1.3);
    const oneL = H(sc, "one tree: easy to read, but it can overfit", { y: 400, size: 26 });
    show(one, at("d4", 0.5), 0.4);
    fadeIn(oneL, at("d4", 0.7), 0.4);
    fadeOut([one, oneL], frac("d4", 0.5), 0.3);
    const XS = [400, 500, 600, 700, 800, 900, 1000, 1100, 1200];
    const forest = XS.map(x => treeIcon(sc, x, 300, C.green));
    tl.to(forest, { autoAlpha: 1, duration: 0.3, stagger: 0.08 }, frac("d4", 0.55));
    const ens = H(sc, "ensemble: many trees together", { y: 205, size: 28, color: C.green, weight: 600 });
    fadeIn(ens, frac("d4", 0.75), 0.4);

    const rfL = H(sc, "Random forest", { anchor: "left", x: 90, y: 300, size: 28, color: C.green, weight: 700 });
    const rfS = H(sc, "random samples", { anchor: "left", x: 90, y: 336, size: 20, color: C.dim });
    fadeIn([rfL, rfS], at("d5", 0.2), 0.4, { dy: 0, dx: -10 });
    const votes = [1, 1, 0, 1, 0, 1, 1, 0, 1];                // a schematic vote, not data
    const vd = XS.map((x, i) => { const c = S(sc.svg, "circle", { cx: x, cy: 380, r: 11 }, { fill: votes[i] ? DEF : PAY }); gsap.set(c, { autoAlpha: 0 }); return c; });
    tl.to(vd, { autoAlpha: 1, duration: 0.2, stagger: 0.1 }, frac("d5", 0.55));
    const maj = chip(sc, "majority vote → default", DEF, { x: 800, y: 450, size: 24 });
    fadeIn(maj, frac("d5", 0.8), 0.4);

    const gbL = H(sc, "Gradient boosting", { anchor: "left", x: 90, y: 640, size: 28, color: C.purple, weight: 700 });
    fadeIn(gbL, at("d6", 0.2), 0.4, { dy: 0, dx: -10 });
    const BX = [480, 680, 880, 1080];
    const chain = BX.map(x => treeIcon(sc, x, 640, C.purple));
    const plus = BX.slice(1).map(x => H(sc, "+", { x: x - 100, y: 640, size: 40, color: C.dim, weight: 700 }));
    const dots3 = H(sc, "+  …", { x: 1210, y: 640, size: 36, color: C.dim });
    chain.forEach((g, i) => show(g, at("d6", 0.5) + i * 0.7, 0.3));
    plus.forEach((p, i) => fadeIn(p, at("d6", 0.9) + i * 0.7, 0.3, { dy: 0 }));
    fadeIn(dots3, at("d6", 3.3), 0.3, { dy: 0 });
    const gbS = H(sc, "each new tree corrects the errors of the trees before it", { y: 740, size: 24, color: C.dim });
    fadeIn(gbS, frac("d6", 0.6), 0.4);

    // curved data: straight boundary against boosting
    const ens2 = [one, ...forest, ens, rfL, rfS, ...vd, maj, gbL, ...chain, ...plus, dots3, gbS];
    fadeOut(ens2, at("d7", 0), 0.5);
    const M = N.moons;
    function panel(x0, gridRows, name, accv, col, t) {
      const [gx0, gx1, nx] = M.gx, [gy0, gy1, ny] = M.gy, dx = (gx1 - gx0) / (nx - 1), dy = (gy1 - gy0) / (ny - 1);
      const pa = axes(sc, { x: x0, y: 250, w: 620, h: 400, xr: [gx0 - dx / 2, gx1 + dx / 2], yr: [gy0 - dy / 2, gy1 + dy / 2] });
      const g = S(sc.svg, "g");
      gridRows.forEach((row, r) => {
        let s = 0;
        for (let i = 1; i <= row.length; i++) {
          if (i === row.length || row[i] !== row[s]) {
            const xa = gx0 + (s - 0.5) * dx, xb = gx0 + (i - 0.5) * dx, ya = gy0 + (r - 0.5) * dy, yb = gy0 + (r + 0.5) * dy;
            S(g, "rect", { x: pa.X(xa), y: pa.Y(yb), width: pa.X(xb) - pa.X(xa) + 0.6, height: pa.Y(ya) - pa.Y(yb) + 0.6 }, { fill: hexA(row[s] === "1" ? DEF : PAY, 0.2) });
            s = i;
          }
        }
      });
      gsap.set(g, { autoAlpha: 0 });
      const pts = M.x.map((x, i) => { const c = S(sc.svg, "circle", { cx: pa.X(x), cy: pa.Y(M.y[i]), r: 5 }, { fill: M.c[i] ? DEF : PAY }); gsap.set(c, { autoAlpha: 0 }); return c; });
      const nm = H(sc, name, { x: x0 + 310, y: 205, size: 28, color: col, weight: 700 });
      const ac = H(sc, `test accuracy ${accv.toFixed(3)}`, { x: x0 + 310, y: 695, size: 26, color: col, font: "mono" });
      fadeIn(nm, t, 0.4);
      tl.to(pts, { autoAlpha: 1, duration: 0.1, stagger: 0.004 }, t + 0.2);
      show(g, t + 0.9, 0.6);
      fadeIn(ac, t + 1.4, 0.4);
      return [nm, ac, g, ...pts];
    }
    panel(110, M.lr_grid, "Logistic regression", M.lr_acc, C.blue, at("d7", 0.3));
    panel(870, M.gb_grid, "Gradient boosting", M.gb_acc, C.purple, frac("d7", 0.45));
    const nxt = H(sc, "Next · Episode 4 · Neural networks", { y: 800, size: 30, color: LEVEL_COLOR.Intermediate, weight: 600 });
    fadeIn(nxt, at("d8", 0.3), 0.5);
  }

  const withColors = f => (sc, N) => { PAY = C.blue; DEF = C.red; return f(sc, N); };
  return { classify: withColors(classify), sigmoid: withColors(sigmoid), threshold: withColors(threshold), metrics: withColors(metrics), trees: withColors(trees) };
})();
