/* Episode 1 - Learn from data. Contract: OUTLINE.md. N = episodes/ep1.py nums(). */
SCENES_BY_EP.ep1 = (() => {
  const PER = 100;                                     // nums use x = area / 100; the screen shows w per m²
  const fw = w => (w / PER).toFixed(2);
  const k = v => Math.round(v).toLocaleString("en-US");
  const reveal = els => gsap.set(els, { autoAlpha: 1 });   // visible for the whole scene
  function title(sc, text, key) { write(H(sc, text, { y: 78, size: 56, font: "serif", weight: 600 }), at(key, 0.1), 1.0); }
  function housePlot(sc, N, o = {}) {
    const ax = axes(sc, Object.assign({
      x: 150, y: 170, w: 850, h: 580, xr: [0, 180], yr: [0, 450], grid: true,
      xticks: [0, 40, 80, 120, 160], yticks: [0, 100, 200, 300, 400],
      xlabel: "area (m²)", ylabel: "price (thousand $)",
    }, o));
    return { ax, ds: dots(sc, ax, N.area, N.price, { r: o.r || 8 }) };
  }

  /* ---------------------------------------------------------------- 1 rules or examples */
  function rules(sc, N) {
    title(sc, "Learn from data", "r1");
    const cards = DATA.series.slice(0, 7).map((s, i) => {      // the core course; the later episodes are deep dives
      const cx = 800 + (i - 3) * 216, col = LEVEL_COLOR[s.level];
      const r = S(sc.svg, "rect", { x: cx - 100, y: 250, width: 200, height: 136, rx: 12 }, { fill: hexA(col, 0.08), stroke: col, strokeWidth: 2.5 });
      gsap.set(r, { autoAlpha: 0 });
      const n = H(sc, `Episode ${s.n}`, { x: cx, y: 280, size: 18, color: C.dim, font: "mono" });
      const t = H(sc, s.title, { x: cx, y: 336, size: 24, weight: 600, wrap: 180 });
      return { r, n, t, cx, col };
    });
    cards.forEach((c, i) => fadeIn([c.r, c.n, c.t], at("r1", 1.0 + i * 0.22), 0.45, { dy: 12 }));
    const groups = [[0, 1, "Base"], [2, 3, "Intermediate"], [4, 5, "Advanced"], [6, 6, "AI engineering"]];
    const gEls = groups.map(([a, b, name], gi) => {
      const col = LEVEL_COLOR[name], x1 = cards[a].cx - 96, x2 = cards[b].cx + 96;
      const ln = S(sc.svg, "path", { d: `M${x1},404 L${x1},414 L${x2},414 L${x2},404` }, { fill: "none", stroke: col, strokeWidth: 2.5 });
      gsap.set(ln, { autoAlpha: 0 });
      const lab = H(sc, name, { x: (x1 + x2) / 2, y: 444, size: 22, color: col, weight: 600 });
      const t = gi === 0 ? frac("r1", 0.45) : gi < 3 ? frac("r1", 0.62) + (gi - 1) * 0.3 : frac("r1", 0.8);
      draw(ln, t, 0.5);
      fadeIn(lab, t + 0.2, 0.4, { dy: 0 });
      return [ln, lab];
    }).flat();
    tl.to(cards[0].r, { fill: hexA(C.yellow, 0.18), stroke: C.yellow, duration: 0.5 }, end("r1", -0.6));
    const series = [...cards.flatMap(c => [c.r, c.n, c.t]), ...gEls];
    fadeOut(series, at("r2", 0), 0.5);

    // normal software
    const lab1 = H(sc, "Normal software", { anchor: "left", x: 110, y: 190, size: 28, color: C.dim, weight: 600 });
    const rules1 = box(sc, 330, 270, 240, 86, C.orange, "Rules", { sub: "written by a person" });
    const data1 = box(sc, 330, 385, 240, 70, C.blue, "Data");
    const comp1 = box(sc, 800, 328, 250, 100, C.fg, "Computer", { fill: 0.05 });
    const ans1 = box(sc, 1270, 328, 240, 86, C.green, "Answers");
    const a11 = arrow(sc, 456, 272, 668, 314, C.dim, 3, 14);
    const a12 = arrow(sc, 456, 385, 668, 342, C.dim, 3, 14);
    const a13 = arrow(sc, 932, 328, 1142, 328, C.dim, 3, 14);
    fadeIn(lab1, at("r2", 0.4), 0.5, { dy: 0, dx: -12 });
    fadeIn(rules1.els, at("r2", 0.8), 0.5);
    fadeIn(data1.els, frac("r2", 0.45), 0.5);
    fadeIn(comp1.els, frac("r2", 0.5), 0.5);
    drawArrow(a11, frac("r2", 0.6), 0.5);
    drawArrow(a12, frac("r2", 0.6), 0.5);
    drawArrow(a13, frac("r2", 0.78), 0.5);
    fadeIn(ans1.els, frac("r2", 0.85), 0.5, { dy: 0, dx: -12 });

    // machine learning
    const lab2 = H(sc, "Machine learning", { anchor: "left", x: 110, y: 520, size: 28, color: C.dim, weight: 600 });
    const exR = S(sc.svg, "rect", { x: 200, y: 565, width: 260, height: 200, rx: 14 }, { fill: hexA(C.blue, 0.1), stroke: C.blue, strokeWidth: 3 });
    gsap.set(exR, { autoAlpha: 0 });
    const exT = H(sc, "Examples", { x: 330, y: 597, size: 28, color: C.blue, weight: 700 });
    const exH = H(sc, "input → answer", { x: 330, y: 638, size: 18, color: C.dim, font: "mono" });
    const exRows = [0, 1, 2].map(i => H(sc, `${Math.round(N.area[i])} m² → ${Math.round(N.price[i])}`, { x: 330, y: 674 + i * 30, size: 21, font: "mono" }));
    const comp2 = box(sc, 800, 665, 250, 100, C.fg, "Computer", { fill: 0.05 });
    const a21 = arrow(sc, 468, 665, 668, 665, C.dim, 3, 14);
    fadeIn(lab2, at("r3", 0.3), 0.5, { dy: 0, dx: -12 });
    fadeIn([exR, exT], at("r3", 1.0), 0.5);
    fadeIn(comp2.els, at("r3", 1.6), 0.5);
    drawArrow(a21, at("r3", 2.1), 0.5);
    fadeIn(exH, frac("r3", 0.5), 0.4, { dy: 0 });
    fadeIn(exRows, frac("r3", 0.6), 0.4, { dy: 6, stagger: 0.3 });

    const rules2 = box(sc, 1270, 665, 240, 100, C.yellow, "Rules", { sub: "found by the computer" });
    const a22 = arrow(sc, 932, 665, 1142, 665, C.dim, 3, 14);
    const model = H(sc, "= the model", { x: 1270, y: 750, size: 30, color: C.yellow, weight: 700 });
    drawArrow(a22, at("r4", 0.3), 0.6);
    fadeIn(rules2.els, at("r4", 0.8), 0.5, { dy: 0, dx: -12 });
    pulse([rules1.r], frac("r4", 0.4), 1.06, 0.6);
    pulse([rules2.r], frac("r4", 0.4), 1.06, 0.6);
    fadeIn(model, frac("r4", 0.62), 0.5);
  }

  /* ---------------------------------------------------------------- 2 a model is a function */
  function model(sc, N) {
    title(sc, "A model is a function", "f1");
    const { ax, ds } = housePlot(sc, N);
    ax.show(at("f1", 0.3), 1.0);
    tl.to(ds, { autoAlpha: 1, duration: 0.3, stagger: 0.05 }, at("f1", 1.4));
    pulse(ax.labels[0], frac("f1", 0.5), 1.25, 0.7);
    pulse(ax.labels[1], frac("f1", 0.75), 1.25, 0.7);
    const i0 = 9, hx = ax.X(N.area[i0]), hy = ax.Y(N.price[i0]);
    const ring = S(sc.svg, "circle", { cx: hx, cy: hy, r: 17 }, { fill: "none", stroke: C.yellow, strokeWidth: 3 });
    const gx = S(sc.svg, "line", { x1: hx, y1: hy + 17, x2: hx, y2: ax.y + ax.h }, { stroke: C.yellow, strokeWidth: 2, strokeDasharray: "6 7" });
    const gy = S(sc.svg, "line", { x1: hx - 17, y1: hy, x2: ax.x, y2: hy }, { stroke: C.yellow, strokeWidth: 2, strokeDasharray: "6 7" });
    gsap.set([ring, gx, gy], { autoAlpha: 0 });
    const hl = H(sc, `one house: ${Math.round(N.area[i0])} m², ${Math.round(N.price[i0])} thousand $`, { anchor: "left", x: hx + 26, y: hy + 40, size: 22, color: C.yellow });
    show([ring, gx, gy], frac("f1", 0.88), 0.4);
    fadeIn(hl, frac("f1", 0.9), 0.4, { dy: 0 });
    fadeOut([ring, gx, gy, hl], at("f2", 0), 0.4);

    // area -> model -> price
    const cA = chip(sc, "area", C.orange, { x: 1310, y: 215, size: 28 });
    const mB = box(sc, 1310, 320, 210, 74, C.yellow, "model", { size: 30 });
    const cP = chip(sc, "price", C.green, { x: 1310, y: 425, size: 28 });
    const fa1 = arrow(sc, 1310, 240, 1310, 280, C.dim, 3, 12);
    const fa2 = arrow(sc, 1310, 359, 1310, 398, C.dim, 3, 12);
    fadeIn(cA, at("f2", 0.2), 0.4);
    drawArrow(fa1, at("f2", 0.5), 0.3);
    fadeIn(mB.els, at("f2", 0.7), 0.4, { dy: 0 });
    drawArrow(fa2, at("f2", 1.1), 0.3);
    fadeIn(cP, at("f2", 1.3), 0.4);
    const nx = ax.X(130);
    const q1 = S(sc.svg, "line", { x1: nx, y1: ax.y + ax.h, x2: nx, y2: ax.Y(400) }, { stroke: C.orange, strokeWidth: 2.5, strokeDasharray: "7 7" });
    gsap.set(q1, { autoAlpha: 0 });
    const q2 = H(sc, "?", { x: nx, y: ax.Y(425), size: 40, color: C.orange, weight: 700 });
    const q3 = H(sc, "a new house", { x: nx, y: ax.y + ax.h - 22, size: 18, color: C.orange });
    show(q1, at("f2", 1.6), 0.4);
    fadeIn([q2, q3], at("f2", 1.8), 0.4, { dy: 0 });
    fadeOut([q1, q2, q3], at("f3", 0.2), 0.4);

    // a line: price = w * area + b
    const c0 = N.cand[0], c1 = N.cand[1];
    const ln = lineWB(sc, ax, c0.w / PER, c0.b, 0, 180, { color: C.yellow });
    draw(ln, at("f3", 0.4), 1.0);
    const fml = H(sc, "price = w × area + b", { x: 1310, y: 540, size: 34, font: "mono" });
    write(fml, frac("f3", 0.4), 1.0);
    const xa = 60, xb = 110, ya = c0.w / PER * xa + c0.b, yb = c0.w / PER * xb + c0.b;
    const tri = S(sc.svg, "path", { d: `M${ax.X(xa)},${ax.Y(ya)} L${ax.X(xb)},${ax.Y(ya)} L${ax.X(xb)},${ax.Y(yb)}` }, { fill: "none", stroke: C.orange, strokeWidth: 3 });
    gsap.set(tri, { autoAlpha: 0 });
    const tw = H(sc, "w", { x: ax.X(xb) + 24, y: (ax.Y(ya) + ax.Y(yb)) / 2, size: 30, color: C.orange, weight: 700, font: "mono" });
    draw(tri, frac("f3", 0.62), 0.6);
    fadeIn(tw, frac("f3", 0.7), 0.3, { dy: 0 });
    const bDot = S(sc.svg, "circle", { cx: ax.X(0), cy: ax.Y(c0.b), r: 9 }, { fill: C.orange });
    gsap.set(bDot, { autoAlpha: 0 });
    const tb = H(sc, "b", { x: ax.X(0) + 28, y: ax.Y(c0.b) - 26, size: 30, color: C.orange, weight: 700, font: "mono" });
    show(bDot, frac("f3", 0.85), 0.3);
    fadeIn(tb, frac("f3", 0.85), 0.3, { dy: 0 });

    // parameters
    const pl = H(sc, "parameters", { x: 1310, y: 610, size: 24, color: C.orange, weight: 600 });
    const vw = H(sc, "", { x: 1310, y: 655, size: 30, font: "mono" });
    const vb = H(sc, "", { x: 1310, y: 700, size: 30, font: "mono" });
    counter(vw, at("f4", 0), c0.w / PER, c0.w / PER, 0.01, v => `w = ${v.toFixed(2)}`);
    counter(vb, at("f4", 0), c0.b, c0.b, 0.01, v => `b = ${Math.round(v)}`);
    fadeIn(pl, at("f4", 0.3), 0.4);
    fadeIn([vw, vb], at("f4", 0.6), 0.4, { stagger: 0.15 });
    const tM = frac("f4", 0.5);
    fadeOut([tri, tw, bDot, tb], tM - 0.3, 0.3);
    moveLineWB(ln, ax, c1.w / PER, c1.b, 0, 180, tM, 1.6);
    counter(vw, tM, c0.w / PER, c1.w / PER, 1.6, v => `w = ${v.toFixed(2)}`);
    counter(vb, tM, c0.b, c1.b, 1.6, v => `b = ${Math.round(v)}`);

    // feature
    const fc = chip(sc, "feature", C.orange, { x: ax.x + ax.w / 2 + 150, y: ax.y + ax.h + 68, size: 20 });
    fadeIn(fc, at("f5", 0.4), 0.4, { dy: 0, dx: -10 });
    pulse(cA, at("f5", 0.6), 1.2, 0.6);
    fadeOut([fml, pl, vw, vb], frac("f5", 0.5), 0.4);
    const many = H(sc, "Real models use many features", { x: 1310, y: 560, size: 26, color: C.dim });
    const fchips = ["area", "rooms", "age", "location"].map((w, i) => chip(sc, w, i ? C.dim : C.orange, { y: 625, size: 22 }));
    rowLayout(fchips, 1310, 10);
    fadeIn(many, frac("f5", 0.6), 0.4);
    fadeIn(fchips, frac("f5", 0.68), 0.4, { stagger: 0.15 });
  }

  /* ---------------------------------------------------------------- 3 loss */
  function loss(sc, N) {
    title(sc, "Loss", "l1");
    const { ax, ds } = housePlot(sc, N);
    reveal([...ax.all, ...ds]);
    const A = N.cand[0], B = N.cand[1], fA = a => A.w / PER * a + A.b;
    const lA = lineWB(sc, ax, A.w / PER, A.b, 0, 180, { color: C.teal });
    const lB = lineWB(sc, ax, B.w / PER, B.b, 0, 180, { color: C.purple });
    const tA = H(sc, "line A", { anchor: "left", x: ax.X(172) + 6, y: ax.Y(fA(172)) - 28, size: 22, color: C.teal, weight: 600 });
    const tB = H(sc, "line B", { anchor: "right", x: ax.X(138) - 14, y: ax.Y(B.w / PER * 138 + B.b), size: 22, color: C.purple, weight: 600 });
    draw(lA, at("l1", 0.3), 0.7);
    fadeIn(tA, at("l1", 0.8), 0.3, { dy: 0 });
    draw(lB, at("l1", 1.0), 0.7);
    fadeIn(tB, at("l1", 1.5), 0.3, { dy: 0 });
    const q = H(sc, "Which line is the best?", { x: 1310, y: 230, size: 32, weight: 600 });
    const q2 = H(sc, "We need a number: how bad is a line?", { x: 1310, y: 280, size: 22, color: C.dim });
    fadeIn(q, at("l1", 0.6), 0.5);
    fadeIn(q2, frac("l1", 0.55), 0.5);

    // errors
    fadeOut([q, q2], at("l2", 0), 0.4);
    tl.to([lB, tB], { opacity: 0.15, duration: 0.5 }, at("l2", 0.2));
    const res = N.area.map((a, i) => {
      const r = S(sc.svg, "line", { x1: ax.X(a), y1: ax.Y(N.price[i]), x2: ax.X(a), y2: ax.Y(fA(a)) }, { stroke: C.red, strokeWidth: 3 });
      gsap.set(r, { autoAlpha: 0 });
      return r;
    });
    const i0 = 9, e0 = H(sc, "error", { anchor: "left", x: ax.X(N.area[i0]) + 14, y: (ax.Y(N.price[i0]) + ax.Y(fA(N.area[i0]))) / 2, size: 22, color: C.red, weight: 600 });
    draw(res[i0], frac("l2", 0.3), 0.5);
    fadeIn(e0, frac("l2", 0.38), 0.3, { dy: 0 });
    tl.to(res.filter((_, i) => i !== i0), { autoAlpha: 1, duration: 0.25, stagger: 0.04 }, frac("l2", 0.55));
    const er = H(sc, "error = real price − predicted price", { x: 1310, y: 230, size: 24 });
    fadeIn(er, frac("l2", 0.5), 0.5);

    // squares and the mean
    const sq = N.area.map((a, i) => {
      const y1 = ax.Y(N.price[i]), y2 = ax.Y(fA(a)), s = Math.abs(y1 - y2);
      const r = S(sc.svg, "rect", { x: ax.X(a) - s, y: Math.min(y1, y2), width: s, height: s }, { fill: hexA(C.red, 0.14), stroke: hexA(C.red, 0.55), strokeWidth: 1.5 });
      gsap.set(r, { autoAlpha: 0, scale: 0.2, transformOrigin: "100% 50%" });
      return r;
    });
    fadeOut(e0, at("l3", 0), 0.3);
    tl.to(sq, { autoAlpha: 1, scale: 1, duration: 0.35, stagger: 0.05 }, at("l3", 0.4));
    const lf = H(sc, "loss = mean( error² )", { x: 1310, y: 320, size: 34, color: C.yellow, font: "mono" });
    const ls = H(sc, "the mean squared error (MSE)", { x: 1310, y: 366, size: 22, color: C.dim });
    write(lf, frac("l3", 0.45), 1.0);
    fadeIn(ls, frac("l3", 0.8), 0.4);

    // compare: smaller is better
    const BAR = 300 / Math.max(A.loss, B.loss), X0 = 1190;
    function row(label, col, val, y, t) {
      const lb = H(sc, label, { anchor: "left", x: 1080, y, size: 22, color: col, weight: 600 });
      const br = S(sc.svg, "rect", { x: X0, y: y - 14, width: Math.max(4, val * BAR), height: 28 }, { fill: col });
      gsap.set(br, { scaleX: 0, transformOrigin: "0% 50%" });
      const v = H(sc, k(val), { anchor: "left", x: X0 + Math.max(4, val * BAR) + 12, y, size: 22, color: col, font: "mono" });
      fadeIn(lb, t, 0.3, { dy: 0 });
      tl.to(br, { scaleX: 1, duration: 0.7, ease: "power2.out" }, t);
      fadeIn(v, t + 0.5, 0.3, { dy: 0 });
      return [lb, br, v];
    }
    const lossHead = H(sc, "loss", { anchor: "left", x: 1080, y: 440, size: 20, color: C.dim, font: "mono" });
    fadeIn(lossHead, at("l4", 0.2), 0.3, { dy: 0 });
    row("line A", C.teal, A.loss, 480, at("l4", 0.3));
    tl.to([lB, tB], { opacity: 1, duration: 0.4 }, at("l4", 1.0));
    tl.to([...res, ...sq], { opacity: 0.25, duration: 0.4 }, at("l4", 1.0));
    const rB = row("line B", C.purple, B.loss, 530, at("l4", 1.1));
    const better = H(sc, "smaller loss = better fit", { anchor: "left", x: 1080, y: 590, size: 22, color: C.green });
    fadeIn(better, frac("l4", 0.62), 0.4, { dy: 0 });
    pulse(rB[1], frac("l4", 0.65), 1.08, 0.5);

    // the best line
    fadeOut(better, at("l5", 0), 0.3);
    tl.to([...res, ...sq, lA, tA, lB, tB], { opacity: 0.12, duration: 0.5 }, at("l5", 0.1));
    const best = lineWB(sc, ax, N.w_star / PER, N.b_star, 0, 180, { color: C.yellow, width: 5 });
    draw(best, at("l5", 0.3), 0.9);
    row("best line", C.yellow, N.loss_star, 590, at("l5", 1.0));
    const goal = H(sc, "Training: find the w and b that give the smallest loss", { x: 1310, y: 700, size: 28, color: C.yellow, weight: 600, wrap: 440 });
    fadeIn(goal, frac("l5", 0.4), 0.5);
  }

  /* ---------------------------------------------------------------- 4 gradient descent */
  function descent(sc, N) {
    title(sc, "Gradient descent", "g1");
    const [qa, qb, qc] = N.Lw, L = w => qa * w * w + qb * w + qc, G = w => 2 * qa * w + qb;
    const bs = N.b_star, path = N.good;
    const left = axes(sc, { x: 110, y: 200, w: 560, h: 420, xr: [0, 180], yr: [0, 450], xticks: [0, 80, 160], yticks: [0, 200, 400], xlabel: "area (m²)", ylabel: "price" });
    const lds = dots(sc, left, N.area, N.price, { r: 6 });
    const lineL = lineWB(sc, left, path[0] / PER, bs, 0, 180, { color: C.yellow });
    left.show(at("g1", 0.5), 0.8);
    tl.to(lds, { autoAlpha: 1, duration: 0.2, stagger: 0.03 }, at("g1", 1.0));
    draw(lineL, at("g1", 2.0), 0.7);

    const right = axes(sc, {
      x: 880, y: 190, w: 620, h: 450, xr: [0, 500], yr: [0, 80000], grid: true,
      xticks: [0, 100, 200, 300, 400, 500], xfmt: v => String(v / PER),
      yticks: [0, 20000, 40000, 60000, 80000], yfmt: v => (v ? `${v / 1000}k` : "0"),
      xlabel: "w  (slope of the line)", ylabel: "loss",
    });
    const cv = curve(sc, right, L, 0, 500, { color: C.blue });
    right.show(at("g2", 0.2), 0.8);
    draw(cv, at("g2", 0.9), 1.6);
    const bx = right.X(N.w_star), by = right.Y(L(N.w_star));
    const bm = S(sc.svg, "circle", { cx: bx, cy: by, r: 8 }, { fill: C.green });
    gsap.set(bm, { autoAlpha: 0 });
    const bl = H(sc, "best w", { x: bx, y: by - 40, size: 22, color: C.green, weight: 600 });
    show(bm, frac("g2", 0.7), 0.3);
    fadeIn(bl, frac("g2", 0.72), 0.4, { dy: 0 });

    // start, tangent, gradient
    const w0 = path[0];
    const ball = S(sc.svg, "circle", { cx: right.X(w0), cy: right.Y(L(w0)), r: 13 }, { fill: C.yellow });
    gsap.set(ball, { autoAlpha: 0 });
    const proxy = { w: w0 };
    const place = () => { ball.setAttribute("cx", right.X(proxy.w)); ball.setAttribute("cy", right.Y(L(proxy.w))); };
    const st = H(sc, "start", { anchor: "right", x: right.X(w0) - 20, y: right.Y(L(w0)) + 16, size: 22, color: C.yellow });
    show(ball, at("g3", 0.4), 0.3);
    fadeIn(st, at("g3", 0.5), 0.3, { dy: 0 });
    const ta = w0 - 14, tb = w0 + 80;
    const tan = S(sc.svg, "line", { x1: right.X(ta), y1: right.Y(L(w0) + G(w0) * (ta - w0)), x2: right.X(tb), y2: right.Y(L(w0) + G(w0) * (tb - w0)) }, { stroke: C.orange, strokeWidth: 3.5 });
    gsap.set(tan, { autoAlpha: 0 });
    draw(tan, frac("g3", 0.35), 0.7);
    const gl = H(sc, `gradient = slope at the start = ${Math.round(N.good_grad[0])}`, { x: right.X(290), y: right.Y(68000), size: 24, color: C.orange });
    fadeIn(gl, frac("g3", 0.72), 0.4, { dy: 0 });

    // uphill, then a step the other way
    const px = right.X(w0), py = right.Y(L(w0));
    const s0 = -G(w0) * (450 / 80000) / (620 / 500);            // tangent slope in screen units (y down)
    const nrm = Math.hypot(1, s0), ux = -1 / nrm, uy = -s0 / nrm;
    const up = arrow(sc, px, py, px + ux * 92, py - Math.abs(uy) * 92, C.red, 4, 16);
    const upl = H(sc, "uphill", { anchor: "left", x: px + ux * 92 + 14, y: py - Math.abs(uy) * 92 - 4, size: 22, color: C.red, weight: 600 });
    drawArrow(up, at("g4", 0.3), 0.5);
    fadeIn(upl, at("g4", 0.7), 0.3, { dy: 0 });
    const stp = arrow(sc, px + 18, py, px + 120, py, C.green, 4, 16);
    const stl = H(sc, "step", { x: px + 70, y: py - 26, size: 22, color: C.green, weight: 600 });
    drawArrow(stp, frac("g4", 0.5), 0.5);
    fadeIn(stl, frac("g4", 0.55), 0.3, { dy: 0 });
    const status = H(sc, "", { x: right.x + right.w / 2, y: 800, size: 26, font: "mono" });
    counter(status, at("g3", 0.4), 0, 0, 0.01, () => `step 0   loss ${k(N.good_loss[0])}`);
    show(status, at("g3", 0.5), 0.3);
    fadeOut([tan, gl, up.line, up.tip, upl, stp.line, stp.tip, stl, st], frac("g4", 0.78), 0.3);

    function stepTo(i, t, d) {
      tl.to(proxy, { w: path[i], duration: d, ease: "power2.inOut", onUpdate: place }, t);
      moveLineWB(lineL, left, path[i] / PER, bs, 0, 180, t, d);
      swapText(status, t + d * 0.6, `step ${i}   loss ${k(N.good_loss[i])}`);
    }
    stepTo(1, frac("g4", 0.8), 0.9);
    for (let i = 2; i < path.length; i++) stepTo(i, at("g5", 0.2 + (i - 2) * 0.7), 0.55);

    // the line follows
    const ghosts = path.slice(0, -1).map(w => {
      const g = lineWB(sc, left, w / PER, bs, 0, 180, { color: C.dim, width: 2 });
      return g;
    });
    tl.to(ghosts, { autoAlpha: 0.55, duration: 0.3, stagger: 0.25 }, at("g6", 0.6));
    tl.to(lineL, { strokeWidth: 9, duration: 0.3, yoyo: true, repeat: 1 }, frac("g6", 0.55));
    const closer = H(sc, "after each step: closer to the points", { x: left.x + left.w / 2, y: 770, size: 24, color: C.yellow });
    fadeIn(closer, frac("g6", 0.5), 0.5);
    tl.to(lds, { attr: { r: 9 }, duration: 0.25, yoyo: true, repeat: 1, stagger: 0.02 }, at("g7", 0.3));
    const ep = H(sc, `1 step uses all ${N.area.length} houses = 1 epoch`, { x: 800, y: 850, size: 28, color: C.teal, weight: 600 });
    fadeIn(ep, at("g7", 0.4), 0.5);
  }

  /* ---------------------------------------------------------------- 5 learning rate */
  function rate(sc, N) {
    title(sc, "Learning rate", "k1");
    const [qa, qb, qc] = N.Lw, L = w => qa * w * w + qb * w + qc;
    const f1 = H(sc, "new w  =  w  −", { y: 215, size: 36, font: "mono" });
    const f2 = chip(sc, "learning rate", C.yellow, { y: 215, size: 32 });
    const f3 = H(sc, "×  gradient", { y: 215, size: 36, font: "mono" });
    rowLayout([f1, f2, f3], 800, 18);
    fadeIn([f1, f2, f3], at("k1", 0.3), 0.5, { stagger: 0.2 });
    pulse(f2, frac("k1", 0.7), 1.12, 0.6);

    const last = a => a[a.length - 1];
    const cfg = [
      { cx: 290, key: "k2", col: C.blue, name: "too small", lr: N.small_lr, path: N.small, xr: [0, 500], yr: [0, 80000],
        note: `${N.small.length - 1} steps: w = ${fw(last(N.small))}  (best: ${fw(N.w_star)})` },
      { cx: 800, key: "k3", col: C.red, name: "too large", lr: N.big_lr, path: N.big, xr: [100, 400], yr: [0, 16000],
        note: `loss grows: ${k(L(N.big[0]))} → ${k(L(last(N.big)))}` },
      { cx: 1310, key: "k4", col: C.green, name: "good", lr: N.good_lr, path: N.good, xr: [0, 500], yr: [0, 80000],
        note: `${N.good.length - 1} steps: w = ${fw(last(N.good))}  (best: ${fw(N.w_star)})` },
    ];
    const panels = cfg.map(p => {
      const head = H(sc, p.name, { x: p.cx, y: 310, size: 30, color: p.col, weight: 700 });
      const sub = H(sc, `learning rate ${p.lr}`, { x: p.cx, y: 348, size: 20, color: C.dim, font: "mono" });
      const ax = axes(sc, { x: p.cx - 190, y: 395, w: 380, h: 270, xr: p.xr, yr: p.yr });
      const cv = curve(sc, ax, L, p.xr[0], p.xr[1], { color: C.grid, width: 3 });
      const pts = p.path.map(w => [ax.X(w), ax.Y(L(w))]);
      const zig = S(sc.svg, "path", { d: pathD(pts), "clip-path": ax.clip }, { fill: "none", stroke: p.col, strokeWidth: 3 });
      gsap.set(zig, { autoAlpha: 0 });
      const pd = pts.map(([x, y]) => { const c = S(sc.svg, "circle", { cx: x, cy: y, r: 7, "clip-path": ax.clip }, { fill: p.col }); gsap.set(c, { autoAlpha: 0 }); return c; });
      const note = H(sc, p.note, { x: p.cx, y: 755, size: 21, color: p.col });
      const t = at(p.key, 0.3), d = dur(p.key);
      fadeIn([head, sub], t, 0.4, { stagger: 0.1 });
      ax.show(t + 0.3, 0.5);
      draw(cv, t + 0.6, 0.6);
      draw(zig, t + 1.3, d * 0.45);
      tl.to(pd, { autoAlpha: 1, duration: 0.15, stagger: (d * 0.45) / pd.length }, t + 1.3);
      fadeIn(note, t + 1.3 + d * 0.45, 0.4, { dy: 0 });
      return [head, sub, ...ax.all, cv, zig, ...pd, note];
    });

    // summary
    fadeOut([f1, f2, f3, ...panels.flat()], at("k5", 0), 0.6);
    const s1 = H(sc, "A model is a function with parameters.", { y: 250, size: 40, weight: 600 });
    const s2 = H(sc, "Training: loss + gradient  →  good parameters", { y: 330, size: 34, color: C.yellow });
    fadeIn(s1, at("k5", 0.5), 0.6);
    fadeIn(s2, frac("k5", 0.42), 0.6);

    // next episode: a curve that fits old data and fails on new data
    const nxt = H(sc, "Next · Episode 2 · Generalization", { y: 450, size: 30, color: LEVEL_COLOR.Base, weight: 600 });
    const ax = axes(sc, { x: 560, y: 510, w: 480, h: 260, xr: [30, 170], yr: [50, 450] });
    const order = N.area.map((a, i) => i).sort((i, j) => N.area[i] - N.area[j]);
    const oldI = order.filter((_, r) => r % 3 === 0), newI = order.filter((_, r) => r % 3 !== 0);
    const ox = oldI.map(i => N.area[i]), oy = oldI.map(i => N.price[i]);
    const lag = x => ox.reduce((s, xi, i) => s + oy[i] * ox.reduce((p, xj, j) => (j === i ? p : p * (x - xj) / (xi - xj)), 1), 0);
    const wig = curve(sc, ax, lag, Math.min(...ox), Math.max(...ox), { color: C.blue, width: 3, n: 300 });
    const od = dots(sc, ax, ox, oy, { r: 7, color: C.blue });
    const nd = dots(sc, ax, newI.map(i => N.area[i]), newI.map(i => N.price[i]), { r: 7, color: C.orange, hollow: true });
    const lo = H(sc, "old data", { anchor: "left", x: 1080, y: 590, size: 22, color: C.blue });
    const ln = H(sc, "new data", { anchor: "left", x: 1080, y: 640, size: 22, color: C.orange });
    const t6 = at("k6", 0.3);
    fadeIn(nxt, t6, 0.5);
    tl.to([ax.xa, ax.ya], { autoAlpha: 1, duration: 0.4 }, t6 + 0.4);
    tl.to(od, { autoAlpha: 1, duration: 0.2, stagger: 0.06 }, t6 + 0.6);
    draw(wig, t6 + 1.2, 1.4);
    fadeIn(lo, t6 + 1.2, 0.4, { dy: 0 });
    tl.to(nd, { autoAlpha: 1, duration: 0.2, stagger: 0.05 }, frac("k6", 0.6));
    fadeIn(ln, frac("k6", 0.6), 0.4, { dy: 0 });
  }

  return { rules, model, loss, descent, rate };
})();
