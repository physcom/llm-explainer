/* Episode 2 - Generalization. Contract: OUTLINE.md. N = episodes/ep2.py nums(). */
SCENES_BY_EP.ep2 = (() => {
  const reveal = els => gsap.set(els, { autoAlpha: 1 });
  const sig = v => String(Number(v.toPrecision(3)));
  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const sci = v => {
    if (v < 1e4) return sig(v);
    const e = Math.floor(Math.log10(v));
    return `${(v / 10 ** e).toFixed(1)} × 10${String(e).split("").map(d => SUP[+d]).join("")}`;
  };
  // getters: scene files load before the engine script defines C, so read C only when a builder runs
  const COL = { get tr() { return C.blue; }, get va() { return C.orange; }, get te() { return C.purple; } };
  function title(sc, text, key) { write(H(sc, text, { y: 78, size: 56, font: "serif", weight: 600 }), at(key, 0.1), 1.0); }

  /* the x-y plot of the 30 points (left two thirds) */
  function xyPlot(sc) {
    return axes(sc, {
      x: 150, y: 170, w: 820, h: 560, xr: [0, 1], yr: [-2, 2], grid: true,
      xticks: [0, 0.5, 1], yticks: [-2, -1, 0, 1, 2], xlabel: "x", ylabel: "y",
    });
  }
  function pointsOf(sc, ax, N) {
    const tr = dots(sc, ax, N.tr.map(i => N.x[i]), N.tr.map(i => N.y[i]), { r: 8, color: COL.tr });
    const va = dots(sc, ax, N.va.map(i => N.x[i]), N.va.map(i => N.y[i]), { r: 8, color: COL.va, hollow: true });
    return { tr, va };
  }
  function fitPath(sc, ax, N, ys, o = {}) {
    const p = S(sc.svg, "path", { d: pathD(N.gx.map((v, i) => [ax.X(v), ax.Y(ys[i])])), "clip-path": ax.clip },
      { fill: "none", stroke: o.color || C.yellow, strokeWidth: o.width || 4, strokeLinecap: "round", strokeLinejoin: "round" });
    gsap.set(p, { autoAlpha: 0 });
    return p;
  }

  /* ---------------------------------------------------------------- 1 train, validation, test */
  function split(sc, N) {
    title(sc, "Generalization", "s1");
    const recap = H(sc, "Episode 1: a line learned from 24 houses", { y: 220, size: 28, color: C.dim });
    const q = H(sc, "Does the model work on new data?", { y: 300, size: 42, color: C.yellow, weight: 600 });
    fadeIn(recap, at("s1", 0.6), 0.5);
    fadeIn(q, frac("s1", 0.5), 0.6);
    const gen = H(sc, "Generalization = good answers on data that the model did not see", { y: 400, size: 30 });
    fadeIn(gen, frac("s1", 0.72), 0.6);
    fadeOut([recap, q, gen], at("s2", 0), 0.4);

    // 30 examples in a row, then three sets
    const group = {};
    N.tr.forEach(i => { group[i] = "tr"; });
    N.va.forEach(i => { group[i] = "va"; });
    N.te.forEach(i => { group[i] = "te"; });
    const n = N.x.length;
    const blocks = {
      tr: { ids: N.tr, cx: 380, cols: 6 }, va: { ids: N.va, cx: 860, cols: 3 }, te: { ids: N.te, cx: 1240, cols: 3 },
    };
    const target = {};
    for (const k in blocks) {
      const b = blocks[k], rows = Math.ceil(b.ids.length / b.cols);
      b.ids.forEach((id, j) => {
        const c = j % b.cols, r = Math.floor(j / b.cols);
        target[id] = [b.cx + (c - (b.cols - 1) / 2) * 42, 470 + (r - (rows - 1) / 2) * 42];
      });
    }
    const ds = [];
    for (let i = 0; i < n; i++) {
      const d = S(sc.svg, "circle", { cx: 800 + (i - (n - 1) / 2) * 40, cy: 300, r: 13 }, { fill: C.dim });
      gsap.set(d, { autoAlpha: 0 });
      ds.push(d);
    }
    const allLab = H(sc, `${n} examples`, { y: 245, size: 26, color: C.dim });
    tl.to(ds, { autoAlpha: 1, duration: 0.2, stagger: 0.03 }, at("s2", 0.3));
    fadeIn(allLab, at("s2", 0.5), 0.4);
    const tMove = frac("s2", 0.4);
    fadeOut(allLab, tMove, 0.3);
    ds.forEach((d, i) => {
      const [tx, ty] = target[i];
      tl.to(d, { attr: { cx: tx, cy: ty }, fill: COL[group[i]], duration: 1.1, ease: "power2.inOut" }, tMove + (i % 10) * 0.03);
    });
    const names = { tr: "training set", va: "validation set", te: "test set" };
    const labs = [], counts = [];
    for (const k in blocks) {
      const b = blocks[k];
      labs.push(H(sc, names[k], { x: b.cx, y: 385, size: 28, color: COL[k], weight: 700 }));
      counts.push(H(sc, `${b.ids.length} examples · ${Math.round(100 * b.ids.length / n)}%`, { x: b.cx, y: 555, size: 22, color: C.dim, font: "mono" }));
    }
    labs.forEach((l, i) => fadeIn([l, counts[i]], frac("s2", 0.55) + i * 0.6, 0.4, { stagger: 0.1 }));

    const u1 = H(sc, "learns the parameters", { x: blocks.tr.cx, y: 630, size: 26, color: COL.tr });
    const u2 = H(sc, "compares and selects models", { x: blocks.va.cx, y: 630, size: 26, color: COL.va });
    fadeIn(u1, at("s3", 0.3), 0.5);
    pulse(N.tr.map(i => ds[i]), at("s3", 0.5), 1.25, 0.6);
    fadeIn(u2, frac("s3", 0.5), 0.5);
    pulse(N.va.map(i => ds[i]), frac("s3", 0.55), 1.25, 0.6);

    const lock = S(sc.svg, "rect", { x: blocks.te.cx - 92, y: 405, width: 184, height: 130, rx: 14 }, { fill: "none", stroke: COL.te, strokeWidth: 2.5, strokeDasharray: "8 7" });
    gsap.set(lock, { autoAlpha: 0 });
    const u3 = H(sc, "kept until the end", { x: blocks.te.cx, y: 630, size: 26, color: COL.te });
    const u4 = H(sc, "used one time: the final result", { x: blocks.te.cx, y: 672, size: 22, color: C.dim });
    show(lock, at("s4", 0.3), 0.5);
    fadeIn(u3, at("s4", 0.5), 0.5);
    fadeIn(u4, frac("s4", 0.55), 0.5);
  }

  /* ---------------------------------------------------------------- 2 underfitting and overfitting */
  function overfit(sc, N) {
    title(sc, "Underfitting and overfitting", "o1");
    const ax = xyPlot(sc);
    ax.show(at("o1", 0.3), 0.9);
    const truth = fitPath(sc, ax, N, N.truth, { color: C.dim, width: 3 });
    truth.style.strokeDasharray = "10 9";
    show(truth, at("o1", 1.2), 0.6);
    const { tr, va } = pointsOf(sc, ax, N);
    tl.to([...tr, ...va], { autoAlpha: 1, duration: 0.2, stagger: 0.04 }, frac("o1", 0.55));
    // legend
    const lgY = [610, 655, 700];
    const lg1 = S(sc.svg, "line", { x1: 1080, y1: lgY[0], x2: 1130, y2: lgY[0] }, { stroke: C.dim, strokeWidth: 3, strokeDasharray: "10 9" });
    const lg2 = S(sc.svg, "circle", { cx: 1105, cy: lgY[1], r: 8 }, { fill: COL.tr });
    const lg3 = S(sc.svg, "circle", { cx: 1105, cy: lgY[2], r: 8 }, { fill: C.stage, stroke: COL.va, strokeWidth: 3 });
    gsap.set([lg1, lg2, lg3], { autoAlpha: 0 });
    const lt = [
      H(sc, "smooth curve, no noise", { anchor: "left", x: 1150, y: lgY[0], size: 22, color: C.dim }),
      H(sc, `training points (${N.tr.length})`, { anchor: "left", x: 1150, y: lgY[1], size: 22, color: COL.tr }),
      H(sc, `validation points (${N.va.length})`, { anchor: "left", x: 1150, y: lgY[2], size: 22, color: COL.va }),
    ];
    show(lg1, at("o1", 1.3), 0.4); fadeIn(lt[0], at("o1", 1.3), 0.4, { dy: 0 });
    show([lg2, lg3], frac("o1", 0.6), 0.4); fadeIn(lt.slice(1), frac("o1", 0.6), 0.4, { dy: 0, stagger: 0.15 });

    // error table
    const head = [
      H(sc, "degree", { anchor: "left", x: 1080, y: 230, size: 20, color: C.dim, font: "mono" }),
      H(sc, "train", { anchor: "right", x: 1340, y: 230, size: 20, color: COL.tr, font: "mono" }),
      H(sc, "validation", { anchor: "right", x: 1530, y: 230, size: 20, color: COL.va, font: "mono" }),
    ];
    const rowY = { 1: 280, 3: 328, 15: 376 };
    function row(d, t, tVal = null) {
      const els = [
        H(sc, String(d), { anchor: "left", x: 1080, y: rowY[d], size: 24, font: "mono" }),
        H(sc, sig(N.err_tr[d - 1]), { anchor: "right", x: 1340, y: rowY[d], size: 24, font: "mono", color: COL.tr }),
        H(sc, sig(N.err_va[d - 1]), { anchor: "right", x: 1530, y: rowY[d], size: 24, font: "mono", color: COL.va }),
      ];
      fadeIn(els.slice(0, 2), t, 0.4, { dy: 0, stagger: 0.15 });
      fadeIn(els[2], tVal ?? t + 0.3, 0.4, { dy: 0 });
      return els;
    }
    const verdict = (txt, col) => H(sc, txt, { x: 1305, y: 460, size: 34, color: col, weight: 700 });

    // degree 1
    const f1 = fitPath(sc, ax, N, N.fits["1"], { color: C.yellow });
    draw(f1, at("o2", 0.4), 1.0);
    fadeIn(head, at("o2", 0.6), 0.4, { dy: 0 });
    row(1, frac("o2", 0.45));
    const v1 = verdict("underfitting", C.red);
    fadeIn(v1, frac("o2", 0.85), 0.4);

    // degree 3
    fadeOut([f1, v1], at("o3", 0.1), 0.4);
    const f3 = fitPath(sc, ax, N, N.fits["3"], { color: C.yellow });
    draw(f3, at("o3", 0.4), 1.2);
    row(3, frac("o3", 0.4));
    const v3 = verdict("good fit", C.green);
    fadeIn(v3, frac("o3", 0.6), 0.4);

    // degree 15
    fadeOut([f3, v3], at("o4", 0.1), 0.4);
    const f15 = fitPath(sc, ax, N, N.fits["15"], { color: C.yellow });
    draw(f15, at("o4", 0.4), 1.8);
    const r15 = row(15, frac("o4", 0.6), at("o6", 0.6));   // the validation value waits for o6
    tl.to(tr, { attr: { r: 11 }, duration: 0.25, yoyo: true, repeat: 1, stagger: 0.03 }, frac("o4", 0.7));
    const jumps = H(sc, "large jumps between the points", { x: 1305, y: 460, size: 28, color: C.red, weight: 600 });
    tl.to(f15, { stroke: C.red, duration: 0.5 }, at("o5", 0.3));
    fadeIn(jumps, at("o5", 0.4), 0.4);
    const noise = H(sc, "it learned the noise", { x: 1305, y: 505, size: 24, color: C.dim });
    fadeIn(noise, frac("o5", 0.6), 0.4);

    // validation error
    fadeOut([jumps, noise], at("o6", 0.1), 0.3);
    tl.to(va, { attr: { r: 12 }, duration: 0.3, yoyo: true, repeat: 1, stagger: 0.05 }, at("o6", 0.3));
    pulse(r15[2], at("o6", 1.1), 1.25, 0.6);
    const v15 = verdict("overfitting", C.red);
    fadeIn(v15, frac("o6", 0.45), 0.4);
    const v15b = H(sc, "good on old data, bad on new data", { x: 1305, y: 505, size: 24, color: C.dim });
    fadeIn(v15b, frac("o6", 0.6), 0.4);
  }

  /* ---------------------------------------------------------------- 3 model complexity */
  function curve(sc, N) {
    title(sc, "Model complexity", "c1");
    const L = v => Math.log10(v);
    const ax = axes(sc, {
      x: 170, y: 190, w: 1000, h: 500, xr: [0.5, 15.5], yr: [-2.5, 1.5], grid: true,
      xticks: [1, 3, 5, 7, 9, 11, 13, 15], yticks: [-2, -1, 0, 1], yfmt: v => String(10 ** v),
      xlabel: "polynomial degree  (more parameters →)", ylabel: "error (MSE), log scale",
    });
    ax.show(at("c1", 0.3), 0.9);
    const one = H(sc, "one model for each degree", { anchor: "left", x: 1230, y: 250, size: 24, color: C.dim });
    fadeIn(one, frac("c1", 0.35), 0.5);
    const degs = N.err_tr.map((_, i) => i + 1);
    function series(vals, col) {
      const pts = degs.map((d, i) => [ax.X(d), ax.Y(L(vals[i]))]);
      const p = S(sc.svg, "path", { d: pathD(pts), "clip-path": ax.clip }, { fill: "none", stroke: col, strokeWidth: 4, strokeLinejoin: "round" });
      gsap.set(p, { autoAlpha: 0 });
      const ds = pts.map(([x, y]) => { const c = S(sc.svg, "circle", { cx: x, cy: y, r: 7, "clip-path": ax.clip }, { fill: col }); gsap.set(c, { autoAlpha: 0 }); return c; });
      return { p, ds };
    }
    const sTr = series(N.err_tr, COL.tr), sVa = series(N.err_va, COL.va);
    fadeOut(one, at("c2", 0), 0.3);
    draw(sTr.p, at("c2", 0.4), 2.0);
    tl.to(sTr.ds, { autoAlpha: 1, duration: 0.15, stagger: 2.0 / 15 }, at("c2", 0.4));
    const lTr = H(sc, "training error", { anchor: "left", x: 1230, y: 300, size: 26, color: COL.tr, weight: 600 });
    fadeIn(lTr, at("c2", 1.0), 0.4, { dy: 0 });
    draw(sVa.p, at("c3", 0.4), dur("c3") * 0.75);
    tl.to(sVa.ds, { autoAlpha: 1, duration: 0.15, stagger: dur("c3") * 0.75 / 15 }, at("c3", 0.4));
    const lVa = H(sc, "validation error", { anchor: "left", x: 1230, y: 345, size: 26, color: COL.va, weight: 600 });
    fadeIn(lVa, at("c3", 1.0), 0.4, { dy: 0 });

    // regions, from the numbers: underfit = training error still high, overfit = validation error > 3x its minimum
    const vmin = Math.min(...N.err_va);
    const under = degs.filter((d, i) => N.err_tr[i] > 3 * N.err_tr[N.best_deg - 1]);
    const over = degs.filter((d, i) => d > N.best_deg && N.err_va[i] > 3 * vmin);
    const uEnd = Math.max(...under) + 0.5, oStart = Math.min(...over) - 0.5;
    const ru = S(sc.svg, "rect", { x: ax.X(0.5), y: ax.y, width: ax.X(uEnd) - ax.X(0.5), height: ax.h }, { fill: hexA(C.red, 0.12) });
    const ro = S(sc.svg, "rect", { x: ax.X(oStart), y: ax.y, width: ax.X(15.5) - ax.X(oStart), height: ax.h }, { fill: hexA(C.red, 0.12) });
    gsap.set([ru, ro], { autoAlpha: 0 });
    const lu = H(sc, "underfitting", { anchor: "left", x: ax.X(0.5) + 12, y: ax.y + 30, size: 24, color: C.red, weight: 700 });
    const lu2 = H(sc, "too simple", { anchor: "left", x: ax.X(0.5) + 12, y: ax.y + 62, size: 20, color: C.dim });
    const lo = H(sc, "overfitting", { x: (ax.X(oStart) + ax.X(15.5)) / 2, y: ax.y + 30, size: 24, color: C.red, weight: 700 });
    const lo2 = H(sc, "too complex", { x: (ax.X(oStart) + ax.X(15.5)) / 2, y: ax.y + 62, size: 20, color: C.dim });
    show(ru, at("c4", 0.3), 0.5);
    fadeIn([lu, lu2], frac("c4", 0.55), 0.4, { dy: 0, stagger: 0.15 });
    show(ro, at("c5", 0.3), 0.5);
    tl.to([...sTr.ds, ...sVa.ds].filter((_, i) => degs[i % 15] >= oStart), { attr: { r: 10 }, duration: 0.25, yoyo: true, repeat: 1 }, frac("c5", 0.45));
    fadeIn([lo, lo2], frac("c5", 0.5), 0.4, { dy: 0, stagger: 0.15 });

    const bi = N.best_deg - 1, bx = ax.X(N.best_deg), by = ax.Y(L(N.err_va[bi]));
    const ring = S(sc.svg, "circle", { cx: bx, cy: by, r: 18 }, { fill: "none", stroke: C.green, strokeWidth: 3.5 });
    gsap.set(ring, { autoAlpha: 0 });
    const lb = H(sc, `best: degree ${N.best_deg}`, { x: bx, y: ax.y + ax.h - 34, size: 26, color: C.green, weight: 700 });
    const lb2 = H(sc, `validation MSE ${sig(N.err_va[bi])}`, { anchor: "left", x: 1230, y: 420, size: 24, color: C.green, font: "mono" });
    show(ring, at("c6", 0.4), 0.4);
    pulse(ring, at("c6", 0.8), 1.3, 0.6);
    fadeIn(lb, at("c6", 0.6), 0.4);
    fadeIn(lb2, frac("c6", 0.5), 0.4, { dy: 0 });
  }

  /* ---------------------------------------------------------------- 4 regularization */
  function regular(sc, N) {
    title(sc, "Regularization", "g1");
    const ax = xyPlot(sc);
    reveal(ax.all);
    const { tr, va } = pointsOf(sc, ax, N);
    reveal([...tr, ...va]);
    const G = N.ridge_good, B = N.ridge_big;
    const f15 = fitPath(sc, ax, N, N.fits["15"], { color: C.red });
    draw(f15, at("g1", 0.4), 1.6);
    const big = H(sc, "a large model: degree 15", { x: 1305, y: 230, size: 26, color: C.dim });
    fadeIn(big, frac("g1", 0.4), 0.5);

    // the table
    const cols = { lab: 1075, w: 1395, v: 1540 };
    const head = [
      H(sc, "sum of w²", { anchor: "right", x: cols.w, y: 390, size: 20, color: C.dim, font: "mono" }),
      H(sc, "val MSE", { anchor: "right", x: cols.v, y: 390, size: 20, color: COL.va, font: "mono" }),
    ];
    function row(label, col, w2, v, y, t) {
      const els = [
        H(sc, label, { anchor: "left", x: cols.lab, y, size: 23, color: col, weight: 600 }),
        H(sc, sci(w2), { anchor: "right", x: cols.w, y, size: 23, color: col, font: "mono" }),
        H(sc, sig(v), { anchor: "right", x: cols.v, y, size: 23, color: col, font: "mono" }),
      ];
      fadeIn(els, t, 0.4, { dy: 0, stagger: 0.2 });
      return els;
    }
    fadeIn(head, at("g2", 0.3), 0.4, { dy: 0 });
    const rNone = row("no penalty", C.red, N.sumw2_none, N.err_va[N.err_va.length - 1], 435, at("g2", 0.5));
    pulse(rNone[1], frac("g2", 0.45), 1.2, 0.6);
    tl.to(f15, { strokeWidth: 7, duration: 0.3, yoyo: true, repeat: 1 }, frac("g2", 0.6));

    // the penalty
    fadeOut(big, at("g3", 0), 0.3);
    // anchored, not measured: the edges stay apart whatever the font metrics are
    const p1 = H(sc, "loss = MSE +", { anchor: "right", x: 1238, y: 230, size: 30, font: "mono" });
    const p2 = chip(sc, "λ × sum of w²", C.orange, { x: 1254, y: 230, size: 28, font: "mono" });
    gsap.set(p2, { xPercent: 0 });
    const p3 = H(sc, "penalty", { x: 1254 + p2.offsetWidth / 2, y: 282, size: 22, color: C.orange, weight: 600 });
    fadeIn(p1, at("g3", 0.4), 0.5);
    fadeIn(p2, frac("g3", 0.25), 0.5);
    fadeIn(p3, frac("g3", 0.45), 0.4);
    const lam = H(sc, "λ (lambda): how strong the penalty is", { x: 1305, y: 325, size: 21, color: C.dim });
    fadeIn(lam, frac("g3", 0.75), 0.4);
    const k1 = H(sc, "large w  →  larger loss", { x: 1305, y: 620, size: 26, color: C.orange });
    const k2 = H(sc, "training keeps w small", { x: 1305, y: 665, size: 26, color: C.green, weight: 600 });
    fadeIn(k1, at("g4", 0.4), 0.5);
    fadeIn(k2, frac("g4", 0.55), 0.5);

    // a small penalty
    fadeOut([k1, k2], at("g5", 0), 0.3);
    tl.to(f15, { opacity: 0.25, duration: 0.5 }, at("g5", 0.3));
    const fg = fitPath(sc, ax, N, G.curve, { color: C.green });
    draw(fg, at("g5", 0.5), 1.4);
    row(`λ = ${G.alpha}`, C.green, G.sumw2, G.val, 480, frac("g5", 0.35));
    const smooth = H(sc, "smooth curve, low validation error", { x: 1305, y: 620, size: 24, color: C.green });
    fadeIn(smooth, frac("g5", 0.7), 0.5);

    // too much penalty
    fadeOut(smooth, at("g6", 0), 0.3);
    const fb = fitPath(sc, ax, N, B.curve, { color: C.purple });
    draw(fb, at("g6", 0.4), 1.2);
    row(`λ = ${B.alpha}`, C.purple, B.sumw2, B.val, 525, at("g6", 0.8));
    const flat = H(sc, "λ too large: too simple, underfitting", { x: 1305, y: 620, size: 24, color: C.purple });
    fadeIn(flat, frac("g6", 0.35), 0.5);
    const pick = H(sc, "select λ with the validation set", { x: 1305, y: 675, size: 26, color: C.yellow, weight: 600 });
    fadeIn(pick, frac("g6", 0.72), 0.5);
  }

  /* ---------------------------------------------------------------- 5 cross-validation */
  function cv(sc, N) {
    title(sc, "Cross-validation", "v1");
    const luck = H(sc, `${N.va.length} validation points  →  one noisy number`, { y: 250, size: 30, color: C.dim });
    const cvc = chip(sc, "Cross-validation: a more stable result", C.yellow, { y: 330, size: 30 });
    fadeIn(luck, at("v1", 0.5), 0.5);
    fadeIn(cvc, frac("v1", 0.55), 0.5);
    fadeOut([luck, cvc], at("v2", 0), 0.4);

    // 24 cells in a row + the test set aside, then five folds
    const nd = N.dev.length, K = N.fold_sizes.length, CW = 34, CG = 6;
    const cells = [];
    for (let i = 0; i < nd; i++) {
      const c = S(sc.svg, "rect", { x: 140 + i * (CW + CG), y: 200, width: CW, height: CW, rx: 5 }, { fill: C.grid });
      gsap.set(c, { autoAlpha: 0 });
      cells.push(c);
    }
    const tcells = N.te.map((_, j) => {
      const c = S(sc.svg, "rect", { x: 1330 + j * (CW + CG), y: 200, width: CW, height: CW, rx: 5 }, { fill: COL.te });
      gsap.set(c, { autoAlpha: 0 });
      return c;
    });
    const tlab = H(sc, "test set: aside", { x: 1330 + 3 * (CW + CG) - CG / 2, y: 262, size: 22, color: COL.te, weight: 600 });
    tl.to([...cells, ...tcells], { autoAlpha: 1, duration: 0.15, stagger: 0.02 }, at("v2", 0.3));
    fadeIn(tlab, at("v2", 1.0), 0.4, { dy: 0 });
    // fold blocks: fold k at x = FX(k)
    const FW = 5 * CW + 4 * CG + 0, FG = 40, FX = k => 140 + k * (FW + FG);
    const slot = Array(K).fill(0);
    const tFold = frac("v2", 0.55);
    cells.forEach((c, i) => {
      const k = N.fold_of[i], s = slot[k]++;
      tl.to(c, { attr: { x: FX(k) + s * (CW + CG) }, duration: 0.9, ease: "power2.inOut" }, tFold + i * 0.02);
    });
    const flabs = [...Array(K)].map((_, k) => H(sc, `fold ${k + 1}`, { x: FX(k) + FW / 2, y: 262, size: 22, color: C.dim }));
    fadeIn(flabs, tFold + 1.0, 0.4, { dy: 0, stagger: 0.1 });

    // five runs: one fold validates, four folds train
    const RY = k => 330 + k * 62, BW = FW;
    const runs = [];
    for (let r = 0; r < K; r++) {
      const lab = H(sc, `run ${r + 1}`, { anchor: "right", x: 125, y: RY(r) + 18, size: 22, color: C.dim });
      const bl = [...Array(K)].map((_, k) => {
        const on = k === r;
        const b = S(sc.svg, "rect", { x: FX(k), y: RY(r), width: BW, height: 36, rx: 6 }, { fill: hexA(on ? COL.va : COL.tr, on ? 0.75 : 0.35), stroke: on ? COL.va : COL.tr, strokeWidth: 2 });
        gsap.set(b, { autoAlpha: 0 });
        return b;
      });
      runs.push({ lab, bl });
    }
    const key1 = H(sc, "train", { anchor: "left", x: FX(K - 1) + FW + 30, y: 300, size: 20, color: COL.tr, weight: 600 });
    const key2 = H(sc, "validate", { anchor: "left", x: FX(K - 1) + FW + 100, y: 300, size: 20, color: COL.va, weight: 600 });
    runs.forEach((ru, r) => {
      const t = at("v3", 0.3) + r * (dur("v3") * 0.75 / K);
      fadeIn(ru.lab, t, 0.3, { dy: 0 });
      tl.to(ru.bl, { autoAlpha: 1, duration: 0.3, stagger: 0.04 }, t);
    });
    fadeIn([key1, key2], at("v3", 0.6), 0.4, { dy: 0 });

    // five errors and their mean
    const EX = FX(K - 1) + FW + 30, maxE = Math.max(...N.cv_folds), EB = 170;
    const eh = H(sc, `validation MSE (λ = ${N.best_alpha})`, { anchor: "left", x: EX, y: 300, size: 20, color: COL.va });
    const errs = N.cv_folds.map((e, r) => {
      const b = S(sc.svg, "rect", { x: EX, y: RY(r) + 6, width: Math.max(3, e / maxE * EB), height: 24 }, { fill: COL.va });
      gsap.set(b, { scaleX: 0, transformOrigin: "0% 50%" });
      const v = H(sc, sig(e), { anchor: "left", x: EX + Math.max(3, e / maxE * EB) + 10, y: RY(r) + 18, size: 21, color: COL.va, font: "mono" });
      return { b, v };
    });
    fadeOut([key1, key2], at("v4", 0), 0.3);
    fadeIn(eh, at("v4", 0.2), 0.3, { dy: 0 });
    errs.forEach((e, r) => {
      tl.to(e.b, { scaleX: 1, duration: 0.4, ease: "power2.out" }, at("v4", 0.3) + r * 0.25);
      fadeIn(e.v, at("v4", 0.5) + r * 0.25, 0.3, { dy: 0 });
    });
    const mean = N.cv_mean[N.alphas.indexOf(N.best_alpha)];
    const ml = S(sc.svg, "line", { x1: EX, y1: RY(K) - 4, x2: EX + EB + 80, y2: RY(K) - 4 }, { stroke: C.fg, strokeWidth: 2 });
    gsap.set(ml, { autoAlpha: 0 });
    const mv = H(sc, `mean ${sig(mean)}`, { anchor: "left", x: EX, y: RY(K) + 26, size: 24, color: C.yellow, font: "mono", weight: 500 });
    const ms = H(sc, "= cross-validation score", { anchor: "left", x: EX, y: RY(K) + 62, size: 21, color: C.yellow });
    show(ml, frac("v4", 0.6), 0.3);
    fadeIn([mv, ms], frac("v4", 0.65), 0.4, { dy: 0, stagger: 0.2 });

    // the score for each lambda
    const gone = [...cells, ...flabs, ...runs.flatMap(r => [r.lab, ...r.bl]), eh, ...errs.flatMap(e => [e.b, e.v]), ml, mv, ms];
    fadeOut(gone, at("v5", 0), 0.5);
    const bx = i => 330 + i * 150, base = 700, maxM = Math.max(...N.cv_mean), BH = 330;
    const bh = H(sc, "cross-validation score (mean MSE of 5 folds)", { x: 705, y: 300, size: 24, color: C.dim });
    const bars = N.alphas.map((a, i) => {
      const best = a === N.best_alpha, h = Math.max(3, N.cv_mean[i] / maxM * BH);
      const b = S(sc.svg, "rect", { x: bx(i) - 45, y: base - h, width: 90, height: h, rx: 4 }, { fill: best ? C.green : C.grid });
      gsap.set(b, { scaleY: 0, transformOrigin: "50% 100%" });
      const v = H(sc, sig(N.cv_mean[i]), { x: bx(i), y: base - h - 22, size: 20, font: "mono", color: best ? C.green : C.fg });
      const l = H(sc, `λ = ${a}`, { x: bx(i), y: base + 26, size: 20, font: "mono", color: best ? C.green : C.dim });
      return { b, v, l, best };
    });
    fadeIn(bh, at("v5", 0.4), 0.4);
    bars.forEach((b, i) => {
      tl.to(b.b, { scaleY: 1, duration: 0.45, ease: "power2.out" }, at("v5", 0.6) + i * 0.25);
      fadeIn([b.v, b.l], at("v5", 0.8) + i * 0.25, 0.3, { dy: 0 });
    });
    const win = bars.find(b => b.best);
    const lowest = H(sc, "lowest score: select this λ", { x: bx(N.alphas.indexOf(N.best_alpha)) + 40, y: base + 64, size: 22, color: C.green, weight: 600 });
    pulse(win.b, frac("v5", 0.72), 1.08, 0.5);
    fadeIn(lowest, frac("v5", 0.72), 0.4);

    // the test set, one time
    const final = H(sc, `selected model, measured one time on the test set:  MSE ${sig(N.test_mse)}`, { x: 800, y: 820, size: 26, color: COL.te, weight: 600 });
    pulse(tcells, at("v6", 0.4), 1.3, 0.6);
    fadeIn(final, frac("v6", 0.3), 0.5);

    // next episode
    const all = [...tcells, tlab, bh, lowest, final, ...bars.flatMap(b => [b.b, b.v, b.l])];
    fadeOut(all, at("v7", 0), 0.5);
    const nxt = H(sc, "Next · Episode 3 · Classification and metrics", { y: 330, size: 34, color: LEVEL_COLOR.Intermediate, weight: 600 });
    const ex = [chip(sc, "yes / no", C.green, { y: 450, size: 30 }), chip(sc, "spam / not spam", C.red, { y: 450, size: 30 })];
    rowLayout(ex, 800, 40);
    const cls = H(sc, "the answer is a class, not a number", { y: 540, size: 26, color: C.dim });
    fadeIn(nxt, at("v7", 0.4), 0.5);
    fadeIn(ex, frac("v7", 0.4), 0.4, { stagger: 0.3 });
    fadeIn(cls, frac("v7", 0.55), 0.4);
  }

  return { split, overfit, curve, regular, cv };
})();
