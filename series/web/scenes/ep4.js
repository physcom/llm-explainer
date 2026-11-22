/* Episode 4 - Neural networks. Contract: OUTLINE.md. N = episodes/ep4.py nums(). */
SCENES_BY_EP.ep4 = (() => {
  const sgn = (v, d = 2) => (v < 0 ? "−" : "") + Math.abs(v).toFixed(d);
  const pct = v => `${Math.round(v * 100)}%`;
  const clsCol = c => (c ? C.orange : C.blue);
  function title(sc, text, key) { write(H(sc, text, { y: 78, size: 56, font: "serif", weight: 600 }), at(key, 0.1), 1.0); }

  /* ---------------------------------------------------------------- plotting helpers */
  function moonAxes(sc, N, o) {
    const [x0, x1, y0, y1] = N.ext;
    return axes(sc, Object.assign({ xr: [x0, x1], yr: [y0, y1] }, o));
  }
  function moonDots(sc, ax, X, y, o = {}) {
    const g = S(sc.svg, "g");
    const ds = X.map((p, i) => S(g, "circle", { cx: ax.X(p[0]), cy: ax.Y(p[1]), r: o.r || 6 },
      o.hollow ? { fill: C.stage, stroke: clsCol(y[i]), strokeWidth: 2.5 } : { fill: clsCol(y[i]) }));
    gsap.set(ds, { autoAlpha: 0 });
    return ds;
  }
  /* the network's probability as a soft image under the SVG (one canvas pixel per grid point, scaled smoothly) */
  function probImage(sc, ax, N, grid) {
    const gw = N.gw, gh = N.gh;
    const cvs = document.createElement("canvas");
    cvs.width = gw;
    cvs.height = gh;
    const ctx = cvs.getContext("2d"), img = ctx.createImageData(gw, gh);
    const rgb = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const cb = rgb(C.blue), co = rgb(C.orange);
    grid.forEach((v, i) => {
      const p = v / 100, d = Math.abs(p - 0.5) * 2, c = p >= 0.5 ? co : cb;
      img.data.set([c[0], c[1], c[2], Math.round(255 * (0.05 + 0.33 * d))], i * 4);
    });
    ctx.putImageData(img, 0, 0);
    const cw = ax.w / (gw - 1), ch = ax.h / (gh - 1);   // grid points sit on the plot edges: extend half a cell
    Object.assign(cvs.style, { position: "absolute", left: `${-cw / 2}px`, top: `${-ch / 2}px`, width: `${gw * cw}px`, height: `${gh * ch}px` });
    const wrap = document.createElement("div");
    Object.assign(wrap.style, { position: "absolute", left: `${ax.x}px`, top: `${ax.y}px`, width: `${ax.w}px`, height: `${ax.h}px`, overflow: "hidden" });
    wrap.appendChild(cvs);
    sc.el.insertBefore(wrap, sc.svg);
    gsap.set(wrap, { autoAlpha: 0 });
    return wrap;
  }
  /* marching squares: the p = 0.5 line of a grid, as polylines in data units */
  function contour(N, grid, level = 50) {
    const gw = N.gw, gh = N.gh, [x0, x1, y0, y1] = N.ext;
    const g = (r, c) => grid[r * gw + c];
    const X = c => x0 + (x1 - x0) * c / (gw - 1), Y = r => y1 - (y1 - y0) * r / (gh - 1);
    const segs = [];
    for (let r = 0; r < gh - 1; r++) for (let c = 0; c < gw - 1; c++) {
      const v = [g(r, c), g(r, c + 1), g(r + 1, c + 1), g(r + 1, c)];      // corners tl tr br bl; edges top right bottom left
      const P = [[c, r], [c + 1, r], [c + 1, r + 1], [c, r + 1]];
      const pts = [];
      for (let e = 0; e < 4; e++) {
        const a = v[e], b = v[(e + 1) % 4];
        if ((a >= level) !== (b >= level)) {
          const t = (level - a) / (b - a), pa = P[e], pb = P[(e + 1) % 4];
          pts.push([X(pa[0] + (pb[0] - pa[0]) * t), Y(pa[1] + (pb[1] - pa[1]) * t)]);
        }
      }
      if (pts.length === 2) segs.push(pts);
      else if (pts.length === 4) {
        const mid = (v[0] + v[1] + v[2] + v[3]) / 4;
        if ((mid >= level) === (v[0] >= level)) { segs.push([pts[0], pts[1]], [pts[2], pts[3]]); }
        else { segs.push([pts[0], pts[3]], [pts[1], pts[2]]); }
      }
    }
    // chain the segments into polylines, so that draw() follows the curve
    const key = p => `${p[0].toFixed(5)},${p[1].toFixed(5)}`;
    const ends = new Map();
    segs.forEach((s, i) => s.forEach(p => { const k = key(p); if (!ends.has(k)) ends.set(k, []); ends.get(k).push(i); }));
    const used = segs.map(() => false), lines = [];
    const next = k => (ends.get(k) || []).find(i => !used[i]);
    const other = (i, k) => (key(segs[i][0]) === k ? segs[i][1] : segs[i][0]);
    segs.forEach((s, i) => {
      if (used[i]) return;
      used[i] = true;
      const line = [s[0], s[1]];
      for (let k = key(line[line.length - 1]), j = next(k); j !== undefined; k = key(line[line.length - 1]), j = next(k)) { used[j] = true; line.push(other(j, k)); }
      for (let k = key(line[0]), j = next(k); j !== undefined; k = key(line[0]), j = next(k)) { used[j] = true; line.unshift(other(j, k)); }
      lines.push(line);
    });
    return lines.sort((a, b) => b.length - a.length);
  }
  function contourPath(sc, ax, N, grid, o = {}) {
    const d = contour(N, grid).map(l => pathD(l.map(p => [ax.X(p[0]), ax.Y(p[1])]))).join("");
    const p = S(sc.svg, "path", { d, "clip-path": ax.clip }, { fill: "none", stroke: o.color || C.yellow, strokeWidth: o.width || 4, strokeLinecap: "round", strokeLinejoin: "round" });
    gsap.set(p, { autoAlpha: 0 });
    return p;
  }
  /* the part of the data rectangle where w1*x + w2*y + b > 0, and the cut line itself */
  function halfPlane(N, w1, w2, b) {
    const [x0, x1, y0, y1] = N.ext;
    const poly = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], f = p => w1 * p[0] + w2 * p[1] + b;
    const out = [], cut = [];
    for (let i = 0; i < 4; i++) {
      const p = poly[i], q = poly[(i + 1) % 4], fp = f(p), fq = f(q);
      if (fp > 0) out.push(p);
      if ((fp > 0) !== (fq > 0)) {
        const t = fp / (fp - fq), m = [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
        out.push(m);
        cut.push(m);
      }
    }
    return { poly: out, cut };
  }
  function lrLine(sc, ax, N, o = {}) {
    const [x0, x1] = N.ext, [wa, wb] = N.lr_w, b = N.lr_b, f = x => -(wa * x + b) / wb;
    return lineWB(sc, ax, -wa / wb, -b / wb, x0, x1, { color: o.color || C.fg, width: o.width || 4 });
  }

  /* ---------------------------------------------------------------- 1 a neuron */
  function neuron(sc, N) {
    title(sc, "Neural networks", "n1");
    const ax = moonAxes(sc, N, { x: 170, y: 175, w: 760, h: 513, xlabel: "x₁", ylabel: "x₂" });
    const ds = moonDots(sc, ax, N.X, N.y);
    ax.show(at("n1", 0.5), 0.8);
    tl.to(ds, { autoAlpha: 1, duration: 0.2, stagger: 0.012 }, at("n1", 1.2));
    const ep3 = H(sc, "Episode 3: one straight line", { x: 1270, y: 230, size: 26, color: C.dim });
    fadeIn(ep3, at("n1", 0.6), 0.5);

    // two moons, the best straight line, its mistakes
    const k0 = chip(sc, "class 0", C.blue, { x: 1180, y: 300, size: 24 });
    const k1 = chip(sc, "class 1", C.orange, { x: 1360, y: 300, size: 24 });
    fadeIn([k0, k1], at("n2", 0.4), 0.4, { stagger: 0.25 });
    const ln = lrLine(sc, ax, N);
    draw(ln, frac("n2", 0.42), 0.9);
    const [wa, wb] = N.lr_w, wrong = N.X.map((p, i) => ((wa * p[0] + wb * p[1] + N.lr_b > 0 ? 1 : 0) !== N.y[i]));
    const rings = N.X.filter((_, i) => wrong[i]).map(p => S(sc.svg, "circle", { cx: ax.X(p[0]), cy: ax.Y(p[1]), r: 12 }, { fill: "none", stroke: C.red, strokeWidth: 2.5 }));
    gsap.set(rings, { autoAlpha: 0 });
    tl.to(rings, { autoAlpha: 1, duration: 0.2, stagger: 0.04 }, frac("n2", 0.62));
    const acc1 = H(sc, `best straight line: ${pct(N.lr_train_acc)} correct`, { x: 1270, y: 380, size: 26 });
    const acc1b = H(sc, `${wrong.filter(Boolean).length} of ${N.X.length} points on the wrong side`, { x: 1270, y: 420, size: 22, color: C.red });
    fadeIn(acc1, frac("n2", 0.7), 0.4);
    fadeIn(acc1b, frac("n2", 0.78), 0.4);

    // a network can curve
    const last = N.snaps[N.snaps.length - 1];
    const cv = contourPath(sc, ax, N, last.grid, { color: C.yellow });
    tl.to([ln, ...rings], { opacity: 0.2, duration: 0.4 }, at("n3", 0.2));
    draw(cv, at("n3", 0.4), 1.4);
    const acc2 = H(sc, `neural network: ${pct(last.acc)} correct`, { x: 1270, y: 490, size: 26, color: C.yellow });
    fadeIn(acc2, at("n3", 1.2), 0.4);
    const plot = [...ax.all, ...ds, ln, ...rings, cv, ep3, k0, k1, acc1, acc1b, acc2];
    fadeOut(plot, frac("n3", 0.72), 0.6);

    // the neuron
    const nb = N.neuron, IX = 330, IY = [300, 520], NX = 780, NY = 410, NR = 78;
    const ins = IY.map((y, i) => {
      const c = S(sc.svg, "circle", { cx: IX, cy: y, r: 36 }, { fill: hexA(C.blue, 0.12), stroke: C.blue, strokeWidth: 3 });
      gsap.set(c, { autoAlpha: 0 });
      return [c, H(sc, i ? "x₂" : "x₁", { x: IX, y, size: 30, color: C.blue, weight: 600 }), H(sc, sgn(nb.x[i]), { anchor: "right", x: IX - 52, y, size: 28, font: "mono" })];
    });
    const edges = IY.map(y => S(sc.svg, "line", { x1: IX + 36, y1: y, x2: NX - NR + 4, y2: NY + (y - NY) * 0.35 }, { stroke: C.dim, strokeWidth: 3 }));
    gsap.set(edges, { autoAlpha: 0 });
    const wl = IY.map((y, i) => H(sc, `w${i ? "₂" : "₁"} = ${sgn(nb.w[i])}`, { x: (IX + NX) / 2 - 10, y: (y + NY + (y - NY) * 0.35) / 2 + (i ? 30 : -30), size: 24, color: C.orange, font: "mono" }));
    const body = S(sc.svg, "circle", { cx: NX, cy: NY, r: NR }, { fill: hexA(C.yellow, 0.1), stroke: C.yellow, strokeWidth: 3.5 });
    gsap.set(body, { autoAlpha: 0 });
    const sig = H(sc, "Σ", { x: NX, y: NY - 4, size: 64, color: C.yellow });
    const ba = arrow(sc, NX, 225, NX, NY - NR - 4, C.dim, 3, 14);
    const bl = H(sc, `b = ${sgn(nb.b)}`, { x: NX, y: 205, size: 24, color: C.orange, font: "mono" });
    fadeIn(ins.flat(), at("n4", 0.1), 0.4, { stagger: 0.08 });
    fadeIn([body, sig], at("n4", 0.3), 0.4, { dy: 0 });
    tl.to(edges, { autoAlpha: 1, duration: 0.4 }, at("n4", 0.5));
    fadeIn(wl, at("n4", 0.8), 0.4, { stagger: 0.2 });
    const m1 = H(sc, `${sgn(nb.w[0])} × ${sgn(nb.x[0])} = ${sgn(nb.prods[0])}`, { anchor: "left", x: 240, y: 660, size: 26, font: "mono" });
    const m2 = H(sc, `${sgn(nb.w[1])} × ${sgn(nb.x[1])} = ${sgn(nb.prods[1])}`, { anchor: "left", x: 240, y: 705, size: 26, font: "mono" });
    fadeIn([m1, m2], at("n4", 1.3), 0.4, { stagger: 0.4 });
    drawArrow(ba, frac("n4", 0.5), 0.4);
    fadeIn(bl, frac("n4", 0.52), 0.3, { dy: 0 });
    const m3 = H(sc, `z = ${sgn(nb.prods[0])} + (${sgn(nb.prods[1])}) + ${sgn(nb.b)} = ${sgn(nb.z)}`, { anchor: "left", x: 240, y: 770, size: 28, color: C.yellow, font: "mono" });
    write(m3, frac("n4", 0.58), 1.0);
    const ws = H(sc, "weighted sum", { x: NX, y: NY + NR + 28, size: 22, color: C.dim });
    fadeIn(ws, frac("n4", 0.82), 0.4);

    // ReLU
    const RX = 1170, RY = 410, RW = 230, RH = 190;
    const za = arrow(sc, NX + NR + 4, NY, RX - RW / 2 - 6, RY, C.dim, 3, 14);
    const zl = H(sc, `z = ${sgn(nb.z)}`, { x: (NX + NR + RX - RW / 2) / 2, y: NY - 26, size: 22, font: "mono", color: C.yellow });
    const rbox = S(sc.svg, "rect", { x: RX - RW / 2, y: RY - RH / 2, width: RW, height: RH, rx: 14 }, { fill: hexA(C.teal, 0.08), stroke: C.teal, strokeWidth: 3 });
    gsap.set(rbox, { autoAlpha: 0 });
    const rt = H(sc, "ReLU", { x: RX, y: RY - RH / 2 - 26, size: 28, color: C.teal, weight: 700 });
    const rax = axes(sc, { x: RX - 90, y: RY - 70, w: 180, h: 130, xr: [-3, 3], yr: [-0.5, 3] });
    const rc = curve(sc, rax, v => Math.max(0, v), -3, 3, { color: C.teal, width: 4, clip: false });
    const rf = H(sc, "ReLU(z) = max(0, z)", { x: RX, y: RY + RH / 2 + 32, size: 22, font: "mono" });
    drawArrow(za, at("n5", 0.2), 0.4);
    fadeIn(zl, at("n5", 0.4), 0.3, { dy: 0 });
    fadeIn([rbox, rt], at("n5", 0.5), 0.4, { dy: 0 });
    tl.to([rax.xa, rax.ya], { autoAlpha: 1, duration: 0.3 }, at("n5", 0.7));
    draw(rc, at("n5", 0.8), 0.8);
    fadeIn(rf, frac("n5", 0.35), 0.4);
    const pn = S(sc.svg, "circle", { cx: rax.X(Math.max(-3, nb.z_neg)), cy: rax.Y(0), r: 8 }, { fill: C.blue });
    const pp = S(sc.svg, "circle", { cx: rax.X(Math.min(3, nb.z)), cy: rax.Y(Math.max(0, nb.z)), r: 8 }, { fill: C.yellow });
    gsap.set([pn, pp], { autoAlpha: 0 });
    const lneg = H(sc, `${sgn(nb.z_neg)} → 0`, { x: RX - 48, y: RY - 42, size: 20, font: "mono", color: C.blue });
    show(pn, frac("n5", 0.45), 0.3);
    fadeIn(lneg, frac("n5", 0.47), 0.3, { dy: 0 });
    show(pp, frac("n5", 0.68), 0.3);
    const oa = arrow(sc, RX + RW / 2 + 6, RY, 1410, RY, C.dim, 3, 14);
    const out = H(sc, `a = ${sgn(nb.a)}`, { anchor: "left", x: 1424, y: RY, size: 28, color: C.yellow, font: "mono" });
    drawArrow(oa, frac("n5", 0.72), 0.4);
    fadeIn(out, frac("n5", 0.78), 0.4, { dy: 0 });
  }

  /* ---------------------------------------------------------------- 2 layers */
  function layers(sc, N) {
    title(sc, "Layers", "y1");
    const IN = [350, 570].map(y => ({ x: 330, y })), OX = 1220, OY = 457, HX = 800, SW = 84, SH = 57;
    const HY = [...Array(N.hidden)].map((_, i) => 170 + i * 82);
    const e1 = [], e2 = [];
    IN.forEach(p => HY.forEach(y => e1.push(S(sc.svg, "line", { x1: p.x + 34, y1: p.y, x2: HX - SW / 2, y2: y }, { stroke: C.grid, strokeWidth: 1.6 }))));
    HY.forEach(y => e2.push(S(sc.svg, "line", { x1: HX + SW / 2, y1: y, x2: OX - 40, y2: OY }, { stroke: C.grid, strokeWidth: 1.6 })));
    gsap.set([...e1, ...e2], { autoAlpha: 0 });
    const inC = IN.map((p, i) => {
      const c = S(sc.svg, "circle", { cx: p.x, cy: p.y, r: 34 }, { fill: C.stage, stroke: C.blue, strokeWidth: 3 });
      gsap.set(c, { autoAlpha: 0 });
      return [c, H(sc, i ? "x₂" : "x₁", { x: p.x, y: p.y, size: 28, color: C.blue, weight: 600 })];
    });
    // each hidden neuron as a small picture of its feature: the side of one straight cut where ReLU is not zero
    const [x0, x1, y0, y1] = N.ext;
    const hid = HY.map((cy, i) => {
      const mx = v => HX - SW / 2 + (v - x0) / (x1 - x0) * SW, my = v => cy + SH / 2 - (v - y0) / (y1 - y0) * SH;
      const g = S(sc.svg, "g");
      const frame = S(g, "rect", { x: HX - SW / 2, y: cy - SH / 2, width: SW, height: SH, rx: 6 }, { fill: C.stage, stroke: C.teal, strokeWidth: 2.5 });
      const feat = S(sc.svg, "g");
      const hp = halfPlane(N, N.W1[0][i], N.W1[1][i], N.b1[i]);
      if (hp.poly.length > 2) S(feat, "polygon", { points: hp.poly.map(p => `${mx(p[0])},${my(p[1])}`).join(" ") }, { fill: hexA(C.teal, 0.35) });
      N.X.forEach((p, k) => { if (k % 2 === 0) S(feat, "circle", { cx: mx(p[0]), cy: my(p[1]), r: 1.6 }, { fill: clsCol(N.y[k]) }); });
      if (hp.cut.length === 2) S(feat, "line", { x1: mx(hp.cut[0][0]), y1: my(hp.cut[0][1]), x2: mx(hp.cut[1][0]), y2: my(hp.cut[1][1]) }, { stroke: C.teal, strokeWidth: 2 });
      gsap.set([g, feat], { autoAlpha: 0 });
      return { g, frame, feat, cy };
    });
    const oc = S(sc.svg, "circle", { cx: OX, cy: OY, r: 40 }, { fill: C.stage, stroke: C.yellow, strokeWidth: 3 });
    gsap.set(oc, { autoAlpha: 0 });
    const ol = H(sc, "σ", { x: OX, y: OY - 3, size: 36, color: C.yellow });

    // y1: neurons in layers, all connected
    fadeIn(inC.flat(), at("y1", 0.3), 0.4, { dy: 0 });
    tl.to(hid.map(h => h.g), { autoAlpha: 1, duration: 0.3, stagger: 0.08 }, at("y1", 0.5));
    fadeIn([oc, ol], at("y1", 1.2), 0.4, { dy: 0 });
    tl.to(e1, { autoAlpha: 1, duration: 0.25, stagger: 0.05 }, frac("y1", 0.45));
    tl.to(e2, { autoAlpha: 1, duration: 0.25, stagger: 0.05 }, frac("y1", 0.45) + 0.9);

    // y2: three layers; the input is one point
    const labs = [[IN[0].x, "input layer", C.blue], [HX, `hidden layer · ${N.hidden} neurons`, C.teal], [OX, "output layer", C.yellow]]
      .map(([x, t, c]) => H(sc, t, { x, y: 830, size: 24, color: c, weight: 600 }));
    fadeIn(labs, at("y2", 0.4), 0.4, { stagger: 0.35 });
    const xv = IN.map((p, i) => H(sc, `${sgn(N.fwd.x[i])}`, { anchor: "right", x: p.x - 50, y: p.y, size: 26, font: "mono" }));
    const ptl = H(sc, "one point", { anchor: "right", x: IN[0].x - 50, y: 460, size: 22, color: C.dim });
    fadeIn([...xv, ptl], frac("y2", 0.6), 0.4, { dx: 10, dy: 0 });

    // y3: eight different features
    hid.forEach((h, i) => pulse(h.g, at("y3", 0.3 + i * 0.08), 1.12, 0.4));
    tl.to(hid.map(h => h.feat), { autoAlpha: 1, duration: 0.35, stagger: 0.18 }, frac("y3", 0.42));
    const fl = H(sc, "each picture: where that neuron is not zero", { anchor: "left", x: 930, y: 175, size: 20, color: C.teal });
    fadeIn(fl, frac("y3", 0.55), 0.4, { dy: 0 });

    // y4: one output neuron, a probability
    pulse([oc], at("y4", 0.3), 1.15, 0.6);
    const pa = arrow(sc, OX + 44, OY, OX + 110, OY, C.dim, 3, 12);
    const pl = H(sc, "p: probability of class 1", { anchor: "left", x: OX + 122, y: OY, size: 22, color: C.yellow });
    drawArrow(pa, frac("y4", 0.45), 0.3);
    fadeIn(pl, frac("y4", 0.5), 0.4, { dy: 0 });
    fadeOut(fl, at("y4", 0), 0.3);

    // y5: a forward pass of the point
    const t5 = at("y5", 0.2);
    const moving = [];
    IN.forEach(p => HY.forEach(y => {
      const d = S(sc.svg, "circle", { cx: p.x + 34, cy: p.y, r: 5 }, { fill: C.yellow });
      gsap.set(d, { autoAlpha: 0 });
      tl.set(d, { autoAlpha: 1 }, t5);
      tl.to(d, { attr: { cx: HX - SW / 2, cy: y }, duration: 1.0, ease: "power1.inOut" }, t5);
      tl.set(d, { autoAlpha: 0 }, t5 + 1.0);
      moving.push(d);
    }));
    const vals = HY.map((y, i) => {
      const v = N.fwd.a1[i], on = v > 0;
      const c = chip(sc, on ? sgn(v) : "0", on ? C.yellow : C.dim, { x: HX + SW / 2 + 40, y, size: 18, font: "mono" });
      fadeIn(c, t5 + 1.1 + i * 0.05, 0.3, { dy: 0 });
      if (!on) tl.to(hid[i].g, { opacity: 0.35, duration: 0.3 }, t5 + 1.1);
      if (!on) tl.to(hid[i].feat, { opacity: 0.25, duration: 0.3 }, t5 + 1.1);
      return c;
    });
    const t6 = t5 + 2.1;
    HY.forEach((y, i) => {
      if (!(N.fwd.a1[i] > 0)) return;
      const d = S(sc.svg, "circle", { cx: HX + SW / 2, cy: y, r: 6 }, { fill: C.yellow });
      gsap.set(d, { autoAlpha: 0 });
      tl.set(d, { autoAlpha: 1 }, t6);
      tl.to(d, { attr: { cx: OX - 40, cy: OY }, duration: 0.8, ease: "power1.inOut" }, t6);
      tl.set(d, { autoAlpha: 0 }, t6 + 0.8);
    });
    const pv = chip(sc, `p = ${N.fwd.p.toFixed(3)}  →  class 0`, C.blue, { x: OX + 60, y: OY + 75, size: 22, font: "mono" });
    fadeIn(pv, t6 + 0.9, 0.4, { dy: 0 });

    // y6: parameters
    fadeOut([...vals, pv], at("y6", 0), 0.4);
    tl.to(hid.map(h => h.g), { opacity: 1, duration: 0.3 }, at("y6", 0));
    tl.to(hid.map(h => h.feat), { opacity: 1, duration: 0.3 }, at("y6", 0));
    tl.to([...e1, ...e2], { stroke: C.orange, strokeWidth: 2.5, duration: 0.4 }, at("y6", 0.3));
    const H8 = N.hidden;
    const pw = H(sc, `weights: 2×${H8} + ${H8}×1 = ${2 * H8 + H8}`, { anchor: "left", x: 1030, y: 610, size: 24, color: C.orange, font: "mono" });
    const pb = H(sc, `biases:  ${H8} + 1 = ${H8 + 1}`, { anchor: "left", x: 1030, y: 652, size: 24, color: C.teal, font: "mono" });
    const pt = H(sc, `${N.n_params} parameters`, { anchor: "left", x: 1030, y: 712, size: 34, weight: 700 });
    fadeIn(pw, at("y6", 0.4), 0.4, { dy: 0 });
    tl.to([...hid.map(h => h.frame), oc], { stroke: C.teal, strokeWidth: 4, duration: 0.3 }, frac("y6", 0.3));
    fadeIn(pb, frac("y6", 0.32), 0.4, { dy: 0 });
    fadeIn(pt, frac("y6", 0.62), 0.5);
  }

  /* ---------------------------------------------------------------- 3 why the activation matters */
  function nonlinear(sc, N) {
    title(sc, "Why the activation matters", "a1");
    const f0 = H(sc, "h = ReLU(W₁x + b₁)", { y: 195, size: 34, font: "mono" });
    fadeIn(f0, at("a1", 0.4), 0.5);
    const cr = cross(sc, 800, 195, 190, 24, frac("a1", 0.62));
    fadeOut([f0, ...cr], at("a2", 0), 0.4);
    const f1 = H(sc, "layer 1:  h = W₁x + b₁", { y: 185, size: 30, font: "mono" });
    const f2 = H(sc, "layer 2:  z = W₂h + b₂", { y: 232, size: 30, font: "mono" });
    fadeIn(f1, at("a2", 0.4), 0.4);
    fadeIn(f2, frac("a2", 0.3), 0.4);
    const lin = H(sc, "each: linear", { anchor: "left", x: 1030, y: 208, size: 26, color: C.yellow });
    fadeIn(lin, frac("a2", 0.72), 0.4, { dy: 0 });
    const f3 = H(sc, "z = W₂(W₁x + b₁) + b₂ = (W₂W₁)x + (W₂b₁ + b₂)", { y: 295, size: 28, font: "mono" });
    const f4 = H(sc, "= W x + b   →  one linear layer", { y: 345, size: 28, font: "mono", color: C.yellow });
    write(f3, at("a3", 0.2), 1.6);
    fadeIn(f4, frac("a3", 0.6), 0.5);

    // two trained networks, side by side
    function panel(x, label, col, grid, acc, key, rel) {
      const ax = moonAxes(sc, N, { x, y: 430, w: 540, h: 365 });
      const lb = H(sc, label, { x: x + 270, y: 405, size: 26, color: col, weight: 700 });
      const im = probImage(sc, ax, N, grid);
      const ds = moonDots(sc, ax, N.X, N.y, { r: 4.5 });
      const cv = contourPath(sc, ax, N, grid, { color: C.fg, width: 3.5 });
      const ac = H(sc, `${pct(acc)} of the training points correct`, { x: x + 270, y: 830, size: 24, color: col });
      const t = at(key, 0.2);
      fadeIn(lb, t, 0.4);
      tl.to([ax.xa, ax.ya], { autoAlpha: 1, duration: 0.3 }, t);
      tl.to(ds, { autoAlpha: 1, duration: 0.2, stagger: 0.005 }, t + 0.2);
      show(im, rel ? frac(key, rel) : t + 0.8, 0.6);
      draw(cv, rel ? frac(key, rel) + 0.2 : t + 1.0, 1.0);
      return { ax, ac, cv };
    }
    const L = panel(150, "no activation", C.red, N.lin_grid, N.lin_train_acc, "a4");
    fadeIn(L.ac, frac("a4", 0.55), 0.4);
    const last = N.snaps[N.snaps.length - 1];
    const R = panel(910, "with ReLU", C.green, last.grid, last.acc, "a5", 0.62);
    // the eight cuts of the hidden neurons: one bend each
    const cuts = N.b1.map((b, i) => {
      const c = halfPlane(N, N.W1[0][i], N.W1[1][i], b).cut;
      if (c.length !== 2) return null;
      const l = S(sc.svg, "line", { x1: R.ax.X(c[0][0]), y1: R.ax.Y(c[0][1]), x2: R.ax.X(c[1][0]), y2: R.ax.Y(c[1][1]), "clip-path": R.ax.clip }, { stroke: C.teal, strokeWidth: 2, strokeDasharray: "8 6" });
      gsap.set(l, { autoAlpha: 0 });
      return l;
    }).filter(Boolean);
    tl.to(cuts, { autoAlpha: 0.8, duration: 0.25, stagger: 0.15 }, frac("a5", 0.3));
    tl.to(cuts, { autoAlpha: 0.25, duration: 0.4 }, frac("a5", 0.85));
    fadeIn(R.ac, at("a6", 0.3), 0.4);
    pulse(R.ac, frac("a6", 0.55), 1.1, 0.5);
  }

  /* ---------------------------------------------------------------- 4 backpropagation */
  function backprop(sc, N) {
    title(sc, "Backpropagation", "b1");
    const upd = H(sc, "w  ←  w − learning rate × gradient", { y: 180, size: 30, font: "mono" });
    fadeIn(upd, frac("b1", 0.45), 0.5);

    const Y = 330, boxes = [
      ["x", 160, 90], ["z₁ = W₁x + b₁", 405, 240], ["a₁ = ReLU(z₁)", 690, 230], ["z₂ = W₂a₁ + b₂", 975, 250], ["p = σ(z₂)", 1235, 180], ["loss", 1440, 130],
    ].map(([t, cx, w], i) => box(sc, cx, Y, w, 64, i === 5 ? C.red : C.blue, t, { size: 23, font: "mono", weight: 500, color: C.fg, fill: 0.08, sw: 2.5 }));
    const fw = [];
    for (let i = 0; i < 5; i++) fw.push(arrow(sc, boxes[i].rt + 6, Y, boxes[i + 1].l - 6, Y, C.blue, 3, 12));
    fadeIn(boxes.flatMap(b => b.els), at("b1", 0.6), 0.4, { stagger: 0.12 });

    // each weight reaches the loss through several layers
    pulse(boxes[1].r, at("b2", 0.2), 1.08, 0.6);
    fw.forEach((a, i) => drawArrow(a, at("b2", 0.6 + i * 0.35), 0.3));
    const q = H(sc, "∂loss / ∂W₁ = ?", { x: 405, y: 250, size: 24, color: C.yellow, font: "mono" });
    fadeIn(q, frac("b2", 0.62), 0.4, { dy: 0 });

    // back from the loss, one layer at a time: one long arrow that stops at each box
    const YB = 418, names = ["∂z₁/∂W₁", "∂a₁/∂z₁", "∂z₂/∂a₁", "∂p/∂z₂", "∂loss/∂p"];
    const xa = boxes[5].cx, xb = boxes[1].cx, span = xa - xb;
    const back = arrow(sc, xa, YB, xb - 18, YB, C.orange, 4, 16);
    const tb = frac("b3", 0.36), D = dur("b3") * 0.55, L = back.line.getTotalLength();
    gsap.set(back.line, { strokeDasharray: L + 1, strokeDashoffset: L + 1, autoAlpha: 0 });
    tl.set(back.line, { autoAlpha: 1 }, tb);
    tl.to(back.line, { strokeDashoffset: 0, duration: D, ease: "none" }, tb);
    tl.to(back.tip, { autoAlpha: 1, duration: 0.2 }, tb + D);
    const when = x => tb + D * (xa - x) / span;
    for (let i = 5; i >= 1; i--) {
      const ticks = S(sc.svg, "line", { x1: boxes[i].cx, y1: Y + 34, x2: boxes[i].cx, y2: YB - 6 }, { stroke: C.orange, strokeWidth: 2, strokeDasharray: "4 5" });
      gsap.set(ticks, { autoAlpha: 0 });
      show(ticks, when(boxes[i].cx), 0.2);
    }
    for (let i = 4; i >= 0; i--) {
      const x = i ? (boxes[i + 1].l + boxes[i].rt) / 2 : boxes[1].cx;
      const l = H(sc, names[i], { x, y: YB + 34, size: 19, color: C.orange, font: "mono" });
      fadeIn(l, when(i ? x : boxes[1].cx + 40), 0.3, { dy: 0 });
    }

    // the chain rule
    const ch = H(sc, "chain rule", { x: 800, y: 530, size: 24, color: C.dim });
    const fml = H(sc, "∂loss/∂W₁ = ∂loss/∂p × ∂p/∂z₂ × ∂z₂/∂a₁ × ∂a₁/∂z₁ × ∂z₁/∂W₁", { x: 800, y: 578, size: 26, font: "mono", color: C.orange });
    fadeIn(ch, at("b4", 0.3), 0.4);
    write(fml, frac("b4", 0.35), 2.0);

    // one real weight: backpropagation against a numerical check
    const [gi, gj] = N.grad_w;
    const r1 = H(sc, `one weight of W₁ (x${gi ? "₂" : "₁"} → hidden neuron ${gj + 1}), before training: ${N.grad_w0.toFixed(3)}`, { x: 800, y: 660, size: 22, color: C.dim });
    const l1 = H(sc, "backpropagation:", { anchor: "right", x: 900, y: 715, size: 28 });
    const v1 = H(sc, sgn(N.grad_bp, 7), { anchor: "left", x: 930, y: 715, size: 30, color: C.orange, font: "mono" });
    fadeIn(r1, at("b5", 0.3), 0.4);
    fadeIn(l1, frac("b5", 0.55), 0.4, { dy: 0 });
    fadeIn(v1, frac("b5", 0.62), 0.4, { dy: 0 });
    const l2 = H(sc, "tiny change of the weight:", { anchor: "right", x: 900, y: 770, size: 28 });
    const v2 = H(sc, sgn(N.grad_num, 7), { anchor: "left", x: 930, y: 770, size: 30, color: C.teal, font: "mono" });
    const l3 = H(sc, `(loss(w + ε) − loss(w − ε)) / 2ε,   ε = ${N.eps}`, { x: 800, y: 818, size: 20, color: C.dim, font: "mono" });
    fadeIn(l2, at("b6", 0.3), 0.4, { dy: 0 });
    fadeIn(l3, frac("b6", 0.3), 0.4, { dy: 0 });
    fadeIn(v2, frac("b6", 0.55), 0.4, { dy: 0 });
    const ok = H(sc, "✓ the same", { anchor: "left", x: 1170, y: 742, size: 30, color: C.green, weight: 700 });
    fadeIn(ok, frac("b6", 0.82), 0.4, { dx: -10, dy: 0 });
  }

  /* ---------------------------------------------------------------- 5 training */
  function train(sc, N) {
    title(sc, "Training", "t1");
    const ax = moonAxes(sc, N, { x: 110, y: 170, w: 600, h: 405 });
    const ds = moonDots(sc, ax, N.X, N.y, { r: 5 });
    tl.to([ax.xa, ax.ya], { autoAlpha: 1, duration: 0.4 }, at("t1", 0.4));
    tl.to(ds, { autoAlpha: 1, duration: 0.2, stagger: 0.008 }, at("t1", 0.6));

    // mini-batches
    const n = N.n_train, B = N.batch, W = 8, GAP = 14, total = n * W + (N.steps - 1) * GAP, sx = 800 - total / 2;
    const bx = i => sx + i * W + Math.floor(i / B) * GAP;
    const cells = N.y.map((c, i) => {
      const r = S(sc.svg, "rect", { x: bx(i), y: 690, width: W - 1.5, height: 24, rx: 1.5 }, { fill: clsCol(c) });
      gsap.set(r, { autoAlpha: 0 });
      return r;
    });
    const sl = H(sc, `${n} training points`, { x: 800, y: 660, size: 22, color: C.dim });
    fadeIn(sl, at("t2", 0.3), 0.4);
    tl.to(cells, { autoAlpha: 1, duration: 0.15, stagger: 0.006 }, at("t2", 0.4));
    const br = S(sc.svg, "path", { d: `M${bx(0)},724 L${bx(0)},732 L${bx(B - 1) + W - 1.5},732 L${bx(B - 1) + W - 1.5},724` }, { fill: "none", stroke: C.yellow, strokeWidth: 2.5 });
    gsap.set(br, { autoAlpha: 0 });
    const bl = H(sc, `1 mini-batch = ${B} points → 1 step`, { anchor: "left", x: bx(0), y: 756, size: 22, color: C.yellow });
    draw(br, frac("t2", 0.42), 0.4);
    fadeIn(bl, frac("t2", 0.5), 0.4, { dy: 0 });

    // ten steps = one epoch
    const groups = [...Array(N.steps)].map((_, s) => cells.slice(s * B, (s + 1) * B));
    const stepTxt = H(sc, "", { anchor: "left", x: bx(n - 1) - 150, y: 756, size: 22, font: "mono", color: C.teal });
    fadeOut(bl, at("t3", 0), 0.3);
    groups.forEach((g, s) => {
      tl.to(g, { y: -10, duration: 0.15, yoyo: true, repeat: 1 }, at("t3", 0.2 + s * 0.28));
      swapText(stepTxt, at("t3", 0.2 + s * 0.28), `step ${s + 1}`);
    });
    show(stepTxt, at("t3", 0.2), 0.2);
    const ep = H(sc, `1 epoch = ${N.steps} steps`, { x: 800, y: 800, size: 26, color: C.teal, weight: 600 });
    fadeIn(ep, at("t3", 0.2 + N.steps * 0.28), 0.4);
    const noisy = H(sc, "small batches: fast steps, a little noisy", { x: 800, y: 840, size: 20, color: C.dim });
    fadeIn(noisy, frac("t3", 0.68), 0.4);

    // the loss after each epoch
    const lax = axes(sc, { x: 880, y: 180, w: 600, h: 340, xr: [0, N.epochs], yr: [0, 0.8], xticks: [0, 100, 200, 300], yticks: [0, 0.2, 0.4, 0.6, 0.8], grid: true, xlabel: "epoch", ylabel: "loss" });
    const lp = S(sc.svg, "path", { d: pathD(N.losses.map((v, e) => [lax.X(e), lax.Y(v)])) }, { fill: "none", stroke: C.yellow, strokeWidth: 3.5, strokeLinejoin: "round" });
    gsap.set(lp, { autoAlpha: 0 });
    lax.show(at("t4", 0.1), 0.6);
    draw(lp, at("t4", 0.6), dur("t4") * 0.6);
    const l0 = H(sc, N.losses[0].toFixed(3), { anchor: "left", x: lax.X(0) + 14, y: lax.Y(N.losses[0]) - 4, size: 20, color: C.yellow, font: "mono" });
    const lN = H(sc, N.losses[N.epochs].toFixed(3), { anchor: "left", x: lax.X(N.epochs) + 30, y: lax.Y(N.losses[N.epochs]) - 22, size: 20, color: C.yellow, font: "mono" });
    fadeIn(l0, at("t4", 0.7), 0.3, { dy: 0 });
    fadeIn(lN, at("t4", 0.6) + dur("t4") * 0.6, 0.3, { dy: 0 });

    // the boundary over the epochs
    fadeOut([...cells, br, sl, stepTxt, ep, noisy], at("t5", 0), 0.4);
    const imgs = N.snaps.map(s => probImage(sc, ax, N, s.grid));
    const cvs = N.snaps.map(s => contourPath(sc, ax, N, s.grid, { color: C.fg, width: 3.5 }));
    const st = H(sc, "", { x: ax.x + ax.w / 2, y: 615, size: 24, font: "mono" });
    const lab = s => `epoch ${s.epoch}  ·  ${pct(s.acc)} correct`;
    counter(st, at("t5", 0.3), 0, 0, 0.01, () => lab(N.snaps[0]));
    const mk = S(sc.svg, "circle", { cx: lax.X(0), cy: lax.Y(N.losses[0]), r: 9 }, { fill: C.fg, stroke: C.stage, strokeWidth: 2 });
    gsap.set(mk, { autoAlpha: 0 });
    const proxy = { e: 0 };
    const place = () => {
      const e = Math.max(0, Math.min(N.epochs, proxy.e)), i = Math.floor(e), f = e - i, v = N.losses[i] + (N.losses[Math.min(N.epochs, i + 1)] - N.losses[i]) * f;
      mk.setAttribute("cx", lax.X(e));
      mk.setAttribute("cy", lax.Y(v));
    };
    show(imgs[0], frac("t5", 0.45), 0.5);
    draw(cvs[0], frac("t5", 0.5), 0.8);
    show([st, mk], frac("t5", 0.45), 0.4);
    const times = [frac("t6", 0.04), frac("t6", 0.2), frac("t6", 0.38), frac("t6", 0.62)];
    for (let k = 1; k < N.snaps.length; k++) {
      const t = times[k - 1];
      fadeOut([imgs[k - 1], cvs[k - 1]], t, 0.6);
      show(imgs[k], t, 0.6);
      show(cvs[k], t, 0.6);
      tl.to(proxy, { e: N.snaps[k].epoch, duration: 0.6, ease: "power1.inOut", onUpdate: place }, t);
      swapText(st, t + 0.3, lab(N.snaps[k]));
    }

    // test points the network never saw
    const td = moonDots(sc, ax, N.X_te, N.y_te, { r: 7, hollow: true });
    tl.to(ds, { opacity: 0.3, duration: 0.4 }, at("t7", 0.1));
    tl.to(td, { autoAlpha: 1, duration: 0.2, stagger: 0.03 }, at("t7", 0.2));
    const te = H(sc, `test: ${pct(N.test_acc)} of ${N.X_te.length} new points correct`, { x: 1180, y: 640, size: 26, color: C.green, weight: 600 });
    const te2 = H(sc, `straight line on the same points: ${pct(N.lr_test_acc)}`, { x: 1180, y: 684, size: 22, color: C.dim });
    fadeIn(te, frac("t7", 0.55), 0.4);
    fadeIn(te2, frac("t7", 0.7), 0.4);

    // summary and next episode
    const all = [...ax.all, ...ds, ...td, ...imgs, ...cvs, st, mk, ...lax.all, lp, l0, lN, te, te2];
    fadeOut(all, at("t8", 0), 0.6);
    const s1 = H(sc, "A network is layers of neurons.", { y: 260, size: 40, weight: 600 });
    const s2 = H(sc, "The activation makes curves possible.", { y: 335, size: 32, color: C.teal });
    const s3 = H(sc, "Backpropagation finds every gradient.", { y: 400, size: 32, color: C.orange });
    fadeIn(s1, at("t8", 0.6), 0.5);
    fadeIn(s2, frac("t8", 0.45), 0.5);
    fadeIn(s3, frac("t8", 0.7), 0.5);
    const nxt = H(sc, "Next · Episode 5 · Production ML", { y: 540, size: 30, color: LEVEL_COLOR.Advanced, weight: 600 });
    const c1 = chip(sc, "notebook", C.dim, { y: 630, size: 26 });
    const c2 = chip(sc, "production", LEVEL_COLOR.Advanced, { y: 630, size: 26 });
    const xs = rowLayout([c1, c2], 800, 160);
    const na = arrow(sc, xs[0] + c1.offsetWidth / 2 + 20, 630, xs[1] - c2.offsetWidth / 2 - 20, 630, C.dim, 3, 14);
    fadeIn(nxt, at("t9", 0.2), 0.5);
    fadeIn(c1, at("t9", 0.8), 0.4, { dy: 0 });
    drawArrow(na, at("t9", 1.2), 0.5);
    fadeIn(c2, at("t9", 1.6), 0.4, { dy: 0 });
  }

  return { neuron, layers, nonlinear, backprop, train };
})();
