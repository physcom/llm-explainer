/* Episode 6 - From ML to LLMs. Contract: OUTLINE.md. N = episodes/ep6.py nums(). */
SCENES_BY_EP.ep6 = (() => {
  const f2 = v => v.toFixed(2);
  const k = v => Math.round(v).toLocaleString("en-US");
  const vecText = a => `[${a.map(f2).join(", ")}]`;
  const maxAbs = rows => Math.max(...rows.flat().map(Math.abs));
  function title(sc, text, key) { write(H(sc, text, { y: 78, size: 56, font: "serif", weight: 600 }), at(key, 0.1), 1.0); }
  function tokenRow(sc, words, cx, y, o = {}) {
    const els = words.map((w, i) => chip(sc, w, o.colors ? o.colors[i] : (o.color || C.blue), { y, size: o.size || 30, font: o.font }));
    const xs = rowLayout(els, cx, o.gap ?? 14);
    return { els, xs };
  }
  /* a vector drawn as small bars around a baseline at (cx, cy) */
  function vecBars(sc, vals, cx, cy, color, scale, o = {}) {
    const bw = o.bw || 14, gap = o.gap || 5, n = vals.length, W = n * bw + (n - 1) * gap, x0 = cx - W / 2;
    const base = S(sc.svg, "line", { x1: x0 - 5, y1: cy, x2: x0 + W + 5, y2: cy }, { stroke: C.grid, strokeWidth: 1.5 });
    const bars = vals.map((v, i) => {
      const h = Math.max(1.5, Math.abs(v) * scale);
      return S(sc.svg, "rect", { x: x0 + i * (bw + gap), y: v >= 0 ? cy - h : cy, width: bw, height: h, rx: 2 }, { fill: color });
    });
    const els = [base, ...bars];
    gsap.set(els, { autoAlpha: 0 });
    return els;
  }
  function arrowTo(sc, x1, y1, x2, y2, col = C.dim) { return arrow(sc, x1, y1, x2, y2, col, 3, 13); }
  const aEls = a => [a.line, a.tip];

  /* ---------------------------------------------------------------- 1 tokens */
  function tokens(sc, N) {
    title(sc, "From ML to LLMs", "t1");
    // episode 1 again: a function with parameters, a loss, gradient descent
    function loop(y, inTxt, fnTxt, fnSub, outTxt, col, lab) {
      const l = H(sc, lab, { anchor: "left", x: 110, y: y - 95, size: 24, color: C.dim, weight: 600 });
      const a = chip(sc, inTxt, C.orange, { x: 200, y, size: 26 });
      const f = box(sc, 560, y, 400, 100, col, fnTxt, { sub: fnSub });
      const o = chip(sc, outTxt, C.green, { x: 940, y, size: 26 });
      const L = box(sc, 1270, y, 190, 80, C.red, "loss");
      const r1 = arrowTo(sc, 262, y, 352, y), r2 = arrowTo(sc, 764, y, 860, y), r3 = arrowTo(sc, 1022, y, 1168, y);
      const bk = S(sc.svg, "path", { d: `M1270,${y + 42} C1270,${y + 128} 560,${y + 128} 560,${y + 56}` }, { fill: "none", stroke: C.orange, strokeWidth: 3 });
      const tip = S(sc.svg, "polygon", { points: `560,${y + 52} 551,${y + 68} 569,${y + 68}` }, { fill: C.orange });
      gsap.set([bk, tip], { autoAlpha: 0 });
      const gl = H(sc, "gradient descent", { x: 915, y: y + 118, size: 22, color: C.orange });
      return { l, a, f, o, L, r1, r2, r3, bk, tip, gl,
        all: [l, a, ...f.els, o, ...L.els, ...aEls(r1), ...aEls(r2), ...aEls(r3), bk, tip, gl],
        show(t, d) {
          fadeIn(l, t, 0.4, { dy: 0, dx: -10 });
          fadeIn(a, t + 0.2, 0.4);
          drawArrow(r1, t + 0.45, 0.3);
          fadeIn(f.els, t + 0.6, 0.4, { dy: 0 });
          drawArrow(r2, t + 0.9, 0.3);
          fadeIn(o, t + 1.1, 0.4);
          drawArrow(r3, t + d * 0.55, 0.3);
          fadeIn(L.els, t + d * 0.55 + 0.2, 0.4, { dy: 0 });
          draw(bk, t + d * 0.7, 0.7);
          show(tip, t + d * 0.7 + 0.6, 0.2);
          fadeIn(gl, t + d * 0.72, 0.4, { dy: 0 });
        } };
    }
    const top = loop(300, "input", "function", "with parameters", "prediction", C.yellow, "Episode 1");
    const llm = loop(640, "text", "large language model", "billions of parameters", "next token", C.blue, "LLM");
    top.show(at("t1", 0.3), dur("t1") * 0.42);
    llm.show(frac("t1", 0.5), dur("t1") * 0.45);
    fadeOut([...top.all, ...llm.all], at("t3", 0), 0.5);

    // text -> tokens
    const words = N.corpus[0].split(" ");
    const sent = H(sc, N.corpus[0].replace(" .", "."), { y: 270, size: 52 });
    fadeIn(sent, at("t3", 0.5), 0.5);
    const row = tokenRow(sc, words, 800, 270, { size: 34, gap: 18 });
    fadeOut(sent, frac("t3", 0.62), 0.3);
    fadeIn(row.els, frac("t3", 0.62), 0.35, { stagger: 0.1, dy: 0 });
    const tl1 = H(sc, "tokens", { anchor: "left", x: row.xs[row.xs.length - 1] + 50, y: 270, size: 26, color: C.dim });
    fadeIn(tl1, frac("t3", 0.85), 0.4, { dy: 0 });

    // kinds of tokens
    const kWord = chip(sc, "cat", C.blue, { x: 400, y: 470, size: 28 });
    const kPart = tokenRow(sc, ["un", "happy"], 800, 470, { size: 28, gap: 6, color: C.purple });
    const kPun = chip(sc, ".", C.blue, { x: 1200, y: 470, size: 28 });
    const kl = [["a word", 400], ["a part of a word (toy split)", 800], ["a punctuation mark", 1200]]
      .map(([s, x]) => H(sc, s, { x, y: 525, size: 21, color: C.dim }));
    fadeIn([kWord, kl[0]], at("t4", 0.4), 0.4);
    fadeIn([...kPart.els, kl[1]], frac("t4", 0.18), 0.4);
    fadeIn([kPun, kl[2]], frac("t4", 0.33), 0.4);
    pulse(row.els[row.els.length - 1], frac("t4", 0.35), 1.25, 0.5);

    // IDs and the vocabulary
    const ids = words.map((w, i) => H(sc, String(N.vocab.indexOf(w)), { x: row.xs[i], y: 332, size: 24, font: "mono", color: C.teal }));
    const idl = H(sc, "ID", { anchor: "left", x: row.xs[row.xs.length - 1] + 50, y: 332, size: 22, color: C.teal });
    fadeIn([...ids, idl], frac("t4", 0.62), 0.4, { stagger: 0.06 });
    const vhead = H(sc, "toy vocabulary", { y: 625, size: 24, color: C.dim, weight: 600 });
    const vocab = N.vocab.map((w, i) => chip(sc, `${i} ${w}`, C.teal, { y: 685, size: 22, font: "mono" }));
    rowLayout(vocab, 800, 10);
    fadeIn(vhead, frac("t4", 0.72), 0.4);
    tl.to(vocab, { autoAlpha: 1, duration: 0.25, stagger: 0.05 }, frac("t4", 0.75));
    swapText(vhead, at("t5", 0.3), `toy vocabulary: ${N.vocab.length} tokens`);
    pulse(vhead, at("t5", 0.3), 1.15, 0.5);
    const gpt = H(sc, "", { y: 790, size: 30, color: C.orange, weight: 600 });
    counter(gpt, frac("t5", 0.5), N.vocab.length, N.gpt2_vocab, 1.4, v => `GPT-2 vocabulary: ${k(v)} tokens`);
    fadeIn(gpt, frac("t5", 0.5), 0.4);
  }

  /* ---------------------------------------------------------------- 2 embeddings */
  function embed(sc, N) {
    title(sc, "Embeddings", "e1");
    const V = N.vocab;
    function idToVec(word, y, t) {
      const id = V.indexOf(word);
      const c = chip(sc, word, C.blue, { x: 170, y, size: 30 });
      const a1 = arrowTo(sc, 232, y, 300, y);
      const idl = H(sc, `ID ${id}`, { x: 362, y, size: 28, font: "mono", color: C.teal });
      const a2 = arrowTo(sc, 428, y, 496, y);
      const vec = H(sc, vecText(N.E[id]), { anchor: "left", x: 512, y, size: 26, font: "mono", color: C.yellow });
      fadeIn(c, t, 0.4);
      drawArrow(a1, t + 0.3, 0.3);
      fadeIn(idl, t + 0.5, 0.3, { dy: 0 });
      drawArrow(a2, t + 0.8, 0.3);
      fadeIn(vec, t + 1.0, 0.4, { dx: -10, dy: 0 });
      return [c, ...aEls(a1), idl, ...aEls(a2), vec];
    }
    const r1 = idToVec("cat", 300, at("e1", 0.4));
    const r2 = idToVec("mat", 420, frac("e1", 0.55));
    const lv = H(sc, "a vector: a list of numbers", { x: 700, y: 500, size: 22, color: C.dim });
    fadeIn(lv, frac("e1", 0.8), 0.4);
    const emb = H(sc, "embedding", { x: 700, y: 228, size: 28, color: C.yellow, weight: 700 });
    fadeIn(emb, at("e2", 0.2), 0.4);

    // the embedding table: one row of numbers per token
    const gx = 1080, gy = 182, cw = 88, ch = 34, mx = maxAbs(N.E);
    const grid = [];
    const gt = H(sc, `embedding table: ${V.length} tokens × ${N.E[0].length} numbers`, { x: gx + 2 * cw, y: 152, size: 21, color: C.dim });
    N.E.forEach((row, i) => {
      grid.push(H(sc, V[i], { anchor: "right", x: gx - 12, y: gy + i * ch + ch / 2, size: 19, font: "mono", color: C.dim }));
      row.forEach((v, j) => {
        const cell = S(sc.svg, "rect", { x: gx + j * cw, y: gy + i * ch, width: cw - 3, height: ch - 3, rx: 3 },
          { fill: hexA(v >= 0 ? C.blue : C.red, 0.12 + 0.5 * Math.abs(v) / mx) });
        gsap.set(cell, { autoAlpha: 0 });
        grid.push(cell, H(sc, f2(v), { x: gx + j * cw + cw / 2 - 1, y: gy + i * ch + ch / 2 - 1, size: 16, font: "mono" }));
      });
    });
    fadeIn(gt, at("e2", 0.5), 0.4);
    tl.to(grid, { autoAlpha: 1, duration: 0.2, stagger: 0.012 }, at("e2", 0.6));
    const hl = ["cat", "mat"].map(w => {
      const i = V.indexOf(w);
      const r = S(sc.svg, "rect", { x: gx - 4, y: gy + i * ch - 3, width: 4 * cw + 5, height: ch + 3, rx: 5 }, { fill: "none", stroke: C.yellow, strokeWidth: 3 });
      gsap.set(r, { autoAlpha: 0 });
      return r;
    });
    show(hl, frac("e2", 0.55), 0.4);
    const par = H(sc, "parameters: the model learns them in training", { x: gx + 2 * cw, y: gy + V.length * ch + 30, size: 20, color: C.orange });
    fadeIn(par, frac("e2", 0.7), 0.4);

    // a 2-D illustration: words with a similar use are close
    fadeOut([...r1, ...r2, lv, emb, gt, ...grid, ...hl, par], at("e3", 0), 0.5);
    const cx = 800, cy = 480, sx = 420, sy = 250;
    const groups = [];
    Object.entries(N.embed2d).forEach(([w, xy]) => {
      const g = groups.find(g => g.some(([, q]) => Math.hypot(q[0] - xy[0], q[1] - xy[1]) < 0.3));
      if (g) g.push([w, xy]); else groups.push([[w, xy]]);
    });
    groups.forEach(g => g.sort((a, b) => b[1][1] - a[1][1]));   // labels top to bottom, in the order of the dots
    const pal = [C.orange, C.green, C.purple, C.teal, C.blue];
    const near = [];
    groups.forEach((g, gi) => {
      const col = pal[gi % pal.length];
      const pts = g.map(([, [x, y]], i) => {
        const same = g.slice(0, i).filter(([, q]) => Math.hypot(q[0] - x, q[1] - y) < 0.02).length;
        return [cx + x * sx + same * 16, cy - y * sy];
      });
      const my = pts.reduce((a, p) => a + p[1], 0) / pts.length;
      const right = g[0][1][0] > 0.6;
      const lx = right ? Math.min(...pts.map(p => p[0])) - 26 : Math.max(...pts.map(p => p[0])) + 26;
      g.forEach(([w], i) => {
        const d = S(sc.svg, "circle", { cx: pts[i][0], cy: pts[i][1], r: 8 }, { fill: col });
        gsap.set(d, { autoAlpha: 0 });
        const lb = H(sc, w, { anchor: right ? "right" : "left", x: lx, y: my + (i - (g.length - 1) / 2) * 30, size: 26, color: col, weight: 600 });
        near.push(d, lb);
      });
    });
    const cap = H(sc, "illustration in 2-D: positions from word counts in the 8 toy sentences", { y: 180, size: 21, color: C.dim });
    fadeIn(cap, frac("e3", 0.42), 0.4);
    tl.to(near, { autoAlpha: 1, duration: 0.3, stagger: 0.06 }, at("e3", 0.4));
    const real = H(sc, `Real embeddings: hundreds or thousands of dimensions (original transformer: ${N.dim_base})`, { y: 800, size: 24, color: C.yellow });
    fadeIn(real, frac("e3", 0.72), 0.5);

    // position encoding
    fadeOut([...near, cap, real], at("e4", 0), 0.5);
    const T = N.tokens, last = T.length - 1;
    const row = tokenRow(sc, T, 800, 230, { size: 30, gap: 18 });
    const pos = row.xs.map((x, i) => H(sc, String(i), { x, y: 292, size: 22, font: "mono", color: C.teal }));
    const posl = H(sc, "position", { anchor: "left", x: row.xs[last] + 60, y: 292, size: 20, color: C.teal });
    fadeIn(row.els, at("e4", 0.2), 0.3, { stagger: 0.06, dy: 0 });
    fadeIn([...pos, posl], at("e4", 0.8), 0.3, { stagger: 0.05 });
    const sc3 = 60 / Math.max(maxAbs([N.E[N.ids[last]]]), maxAbs([N.pe[last]]), maxAbs([N.x[last]]));
    const parts = [
      [N.E[N.ids[last]], C.blue, 430, `token vector (${T[last]})`],
      [N.pe[last], C.teal, 800, `position vector (${last})`],
      [N.x[last], C.yellow, 1170, "input vector"],
    ].map(([v, col, x, lab]) => [
      ...vecBars(sc, v, x, 470, col, sc3, { bw: 30, gap: 10 }),
      H(sc, lab, { x, y: 560, size: 22, color: col, weight: 600 }),
      H(sc, vecText(v), { x, y: 600, size: 19, font: "mono", color: C.dim }),
    ]);
    const plus = H(sc, "+", { x: 615, y: 470, size: 48, weight: 700 });
    const eq = H(sc, "=", { x: 985, y: 470, size: 48, weight: 700 });
    tl.to(parts[0], { autoAlpha: 1, duration: 0.35, stagger: 0.05 }, frac("e4", 0.3));
    fadeIn(plus, frac("e4", 0.42), 0.3, { dy: 0 });
    tl.to(parts[1], { autoAlpha: 1, duration: 0.35, stagger: 0.05 }, frac("e4", 0.45));
    fadeIn(eq, frac("e4", 0.6), 0.3, { dy: 0 });
    tl.to(parts[2], { autoAlpha: 1, duration: 0.35, stagger: 0.05 }, frac("e4", 0.62));
    pulse(row.els[last], frac("e4", 0.3), 1.2, 0.5);
  }

  /* ---------------------------------------------------------------- 3 attention */
  function attention(sc, N) {
    title(sc, "Attention", "a1");
    const T = N.tokens, n = T.length, last = n - 1;
    const xs = T.map((_, j) => 300 + j * 170);
    const toks = T.map((w, j) => chip(sc, w, j === last ? C.yellow : C.blue, { x: xs[j], y: 255, size: 30 }));
    fadeIn(toks, at("a1", 0.3), 0.4, { stagger: 0.12 });
    const arcs = xs.slice(0, last).map(x => {
      const d = xs[last] - x;
      const p = S(sc.svg, "path", { d: `M${xs[last] - 10},226 Q${(x + xs[last]) / 2},${196 - d * 0.14} ${x + 8},226` }, { fill: "none", stroke: C.yellow, strokeWidth: 2.5 });
      gsap.set(p, { autoAlpha: 0 });
      return p;
    });
    arcs.forEach((p, i) => draw(p, frac("a1", 0.45) + i * 0.15, 0.6));
    const cap1 = H(sc, "each token collects information from the tokens before it", { y: 470, size: 28, color: C.yellow });
    fadeIn(cap1, frac("a1", 0.55), 0.5);
    fadeOut(cap1, at("a2", 0), 0.3);

    // query of the last token, key and value of every token
    const yK = 370, yV = 470, yS = 565, yW = 690;
    const sK = 44 / maxAbs(N.k), sV = 44 / maxAbs(N.v), sQ = 44 / maxAbs(N.q);
    const rowLab = [["key", yK, C.teal], ["value", yV, C.purple], ["score", yS, C.fg], ["weight", yW - 22, C.yellow]]
      .map(([s, y, col]) => H(sc, s, { anchor: "left", x: 70, y, size: 24, color: col, weight: 600 }));
    const keys = N.k.map((v, j) => vecBars(sc, v, xs[j], yK, C.teal, sK, { bw: 17 }));
    const vals = N.v.map((v, j) => vecBars(sc, v, xs[j], yV, C.purple, sV, { bw: 17 }));
    const qx = 1420;
    const qv = vecBars(sc, N.q[last], qx, yK, C.yellow, sQ, { bw: 18, gap: 6 });
    const ql = H(sc, `query of “${T[last]}”`, { x: qx, y: yK - 62, size: 22, color: C.yellow, weight: 600 });
    fadeIn(qv, at("a2", 0.5), 0.4, { dy: 0 });
    fadeIn(ql, at("a2", 0.5), 0.4, { dy: 0 });
    fadeIn(rowLab[0], frac("a2", 0.55), 0.3, { dy: 0 });
    tl.to(keys.flat(), { autoAlpha: 1, duration: 0.3, stagger: 0.02 }, frac("a2", 0.55));
    fadeIn(rowLab[1], frac("a2", 0.72), 0.3, { dy: 0 });
    tl.to(vals.flat(), { autoAlpha: 1, duration: 0.3, stagger: 0.02 }, frac("a2", 0.72));

    // scores: query times each key
    const S5 = N.scores[last], W5 = N.weights[last];
    const best = S5.indexOf(Math.max(...S5));
    const scoreT = S5.map((v, j) => H(sc, f2(v), { x: xs[j], y: yS, size: 26, font: "mono", color: j === best ? C.green : C.fg }));
    const hk = S(sc.svg, "rect", { x: xs[0] - 38, y: yK - 48, width: 76, height: 96, rx: 8 }, { fill: "none", stroke: C.yellow, strokeWidth: 2.5 });
    gsap.set(hk, { autoAlpha: 0 });
    const t3 = at("a3", 0.3), step = (dur("a3") * 0.55) / n;
    fadeIn(rowLab[2], t3, 0.3, { dy: 0 });
    show(hk, t3, 0.2);
    xs.forEach((x, j) => {
      if (j) tl.to(hk, { attr: { x: x - 38 }, duration: step * 0.6, ease: "power1.inOut" }, t3 + j * step);
      fadeIn(scoreT[j], t3 + j * step + step * 0.4, 0.25, { dy: 0 });
    });
    fadeOut(hk, t3 + n * step + 0.1, 0.3);
    const ring = S(sc.svg, "rect", { x: xs[best] - 46, y: yS - 22, width: 92, height: 44, rx: 10 }, { fill: "none", stroke: C.green, strokeWidth: 3 });
    gsap.set(ring, { autoAlpha: 0 });
    draw(ring, frac("a3", 0.78), 0.5);
    const fq = H(sc, "score = query · key / √4", { x: qx, y: yS, size: 20, color: C.dim, font: "mono" });
    fadeIn(fq, frac("a3", 0.4), 0.4, { dy: 0 });

    // softmax: weights between 0 and 1 that add up to 1
    const wb = W5.map((w, j) => {
      const h = Math.max(2, w * 260);
      const r = S(sc.svg, "rect", { x: xs[j] - 26, y: yW - h, width: 52, height: h, rx: 3 }, { fill: C.yellow });
      gsap.set(r, { scaleY: 0, transformOrigin: "50% 100%" });
      return r;
    });
    const wT = W5.map((w, j) => H(sc, f2(w), { x: xs[j], y: yW + 24, size: 22, font: "mono", color: C.yellow }));
    const sm = H(sc, "softmax", { x: qx, y: yW - 60, size: 26, color: C.yellow, weight: 700 });
    const sum = H(sc, `sum = ${f2(N.wsum)}`, { x: qx, y: yW - 20, size: 22, font: "mono", color: C.dim });
    fadeIn(sm, at("a4", 0.3), 0.4, { dy: 0 });
    fadeIn(rowLab[3], at("a4", 0.4), 0.3, { dy: 0 });
    tl.to(wb, { scaleY: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }, at("a4", 0.6));
    fadeIn(wT, at("a4", 1.0), 0.3, { stagger: 0.1, dy: 0 });
    fadeIn(sum, frac("a4", 0.72), 0.4, { dy: 0 });

    // weighted sum of the values
    fadeOut([sm, sum, fq, ring], at("a5", 0), 0.3);
    const ox = 1420, oy = 520;
    const outV = vecBars(sc, N.out[last], ox, oy, C.yellow, sV, { bw: 18, gap: 6 });
    const ol = H(sc, `new vector for “${T[last]}”`, { x: ox, y: oy + 70, size: 22, color: C.yellow, weight: 600 });
    const osum = H(sc, "Σ weight × value", { x: ox, y: oy - 70, size: 24, font: "mono" });
    fadeIn(osum, at("a5", 0.3), 0.4, { dy: 0 });
    xs.forEach((x, j) => {
      const dot = S(sc.svg, "circle", { cx: x, cy: yV, r: 6 + W5[j] * 30 }, { fill: hexA(C.purple, 0.85) });
      gsap.set(dot, { autoAlpha: 0 });
      const t = at("a5", 0.6) + j * 0.25;
      tl.set(dot, { autoAlpha: 1 }, t);
      tl.to(dot, { attr: { cx: ox, cy: oy }, duration: 0.8, ease: "power2.in" }, t);
      tl.set(dot, { autoAlpha: 0 }, t + 0.8);
    });
    tl.to(outV, { autoAlpha: 1, duration: 0.4, stagger: 0.05 }, at("a5", 0.6) + n * 0.25 + 0.4);
    fadeIn(ol, frac("a5", 0.6), 0.4, { dy: 0 });

    // the full weight matrix and the mask
    const flowEls = [...arcs, ...rowLab, ...keys.flat(), ...vals.flat(), ...qv, ql, ...scoreT, ...wb, ...wT, ...outV, ol, osum, ...toks];
    fadeOut(flowEls, at("a6", 0), 0.5);
    const cs = 74, mx0 = 800 - (n * cs) / 2, my0 = 300;
    const mEls = [], maskEls = [];
    T.forEach((w, i) => {
      mEls.push(H(sc, w, { anchor: "right", x: mx0 - 14, y: my0 + i * cs + cs / 2, size: 22, color: i === last ? C.yellow : C.fg }));
      mEls.push(H(sc, w, { x: mx0 + i * cs + cs / 2, y: my0 - 22, size: 20, color: C.dim }));
      N.weights[i].forEach((v, j) => {
        const masked = j > i;
        const cell = S(sc.svg, "rect", { x: mx0 + j * cs, y: my0 + i * cs, width: cs - 4, height: cs - 4, rx: 4 },
          { fill: masked ? hexA(C.grid, 0.35) : hexA(C.yellow, 0.08 + 0.75 * v) });
        gsap.set(cell, { autoAlpha: 0 });
        const tx = H(sc, masked ? "0" : f2(v), { x: mx0 + j * cs + cs / 2 - 2, y: my0 + i * cs + cs / 2 - 2, size: 19, font: "mono", color: masked ? C.dim : (v > 0.45 ? C.stage : C.fg) });
        (masked ? maskEls : mEls).push(cell, tx);
      });
    });
    const rowBox = S(sc.svg, "rect", { x: mx0 - 4, y: my0 + last * cs - 4, width: n * cs + 4, height: cs + 4, rx: 6 }, { fill: "none", stroke: C.yellow, strokeWidth: 3 });
    gsap.set(rowBox, { autoAlpha: 0 });
    const mHead = H(sc, "attention weights: each row adds up to 1", { y: 210, size: 24, color: C.dim });
    tl.to(mEls, { autoAlpha: 1, duration: 0.25, stagger: 0.01 }, at("a6", 0.4));
    fadeIn(mHead, at("a6", 0.4), 0.4);
    show(rowBox, at("a6", 1.0), 0.3);
    tl.to(maskEls, { autoAlpha: 1, duration: 0.25, stagger: 0.02 }, frac("a6", 0.5));
    const mk = H(sc, "mask: later tokens get weight 0", { anchor: "left", x: mx0 + n * cs + 30, y: my0 + 1.5 * cs, size: 24, color: C.red, weight: 600 });
    fadeIn(mk, frac("a6", 0.55), 0.4, { dy: 0, dx: -10 });

    // a transformer: a stack of blocks
    fadeOut([...mEls, ...maskEls, rowBox, mHead, mk], at("a7", 0), 0.5);
    const blocks = [], bys = [690, 540, 340];
    bys.forEach((y, b) => {
      const outer = S(sc.svg, "rect", { x: 520, y: y - 52, width: 560, height: 104, rx: 16 }, { fill: "none", stroke: C.grid, strokeWidth: 2.5 });
      gsap.set(outer, { autoAlpha: 0 });
      const at1 = box(sc, 670, y, 220, 70, C.yellow, "attention", { size: 24 });
      const nn = box(sc, 930, y, 240, 70, C.green, "neural network", { size: 24 });
      const lab = H(sc, b < 2 ? `block ${b + 1}` : "block N", { anchor: "right", x: 500, y, size: 20, color: C.dim });
      blocks.push([outer, ...at1.els, ...nn.els, lab]);
    });
    const dots = H(sc, "⋮", { x: 800, y: 440, size: 40, color: C.dim });
    const inL = H(sc, "token vectors", { x: 800, y: 800, size: 22, color: C.blue });
    const outL = H(sc, "scores for the next token", { x: 800, y: 235, size: 22, color: C.green });
    const ups = [[772, 746], [636, 596], [486, 462], [418, 396], [286, 254]].map(([y1, y2]) => arrowTo(sc, 800, y1, 800, y2));
    const t7 = at("a7", 0.3);
    fadeIn(inL, t7, 0.3);
    drawArrow(ups[0], t7 + 0.2, 0.25);
    fadeIn(blocks[0], t7 + 0.4, 0.4, { stagger: 0.05, dy: 0 });
    drawArrow(ups[1], t7 + 0.9, 0.25);
    fadeIn(blocks[1], t7 + 1.1, 0.4, { stagger: 0.05, dy: 0 });
    drawArrow(ups[2], t7 + 1.6, 0.2);
    fadeIn(dots, t7 + 1.7, 0.3, { dy: 0 });
    drawArrow(ups[3], t7 + 1.9, 0.2);
    fadeIn(blocks[2], t7 + 2.1, 0.4, { stagger: 0.05, dy: 0 });
    drawArrow(ups[4], t7 + 2.6, 0.25);
    fadeIn(outL, t7 + 2.8, 0.3);
    const ep4 = H(sc, "a small neural network, as in episode 4", { anchor: "left", x: 1110, y: 690, size: 21, color: C.green });
    fadeIn(ep4, frac("a7", 0.65), 0.4, { dy: 0, dx: -10 });
  }

  /* ---------------------------------------------------------------- 4 next-token prediction */
  function predict(sc, N) {
    title(sc, "Next-token prediction", "p1");
    const V = N.vocab, P1 = N.probs["1.0"], P05 = N.probs["0.5"], P15 = N.probs["1.5"];
    const ctxL = H(sc, "…", { x: 175, y: 200, size: 30, color: C.dim });
    const ctx = tokenRow(sc, N.ctx, 290, 200, { size: 28, gap: 10 });
    const mdl = box(sc, 640, 200, 200, 72, C.blue, "model", { size: 28 });
    const a1 = arrowTo(sc, 380, 200, 532, 200);
    const a2 = S(sc.svg, "path", { d: "M745,200 L1000,200 L1000,265" }, { fill: "none", stroke: C.dim, strokeWidth: 3 });
    const a2t = S(sc.svg, "polygon", { points: "1000,280 992,264 1008,264" }, { fill: C.dim });
    gsap.set([a2, a2t], { autoAlpha: 0 });
    const smx = H(sc, "scores → softmax → probabilities", { anchor: "left", x: 760, y: 174, size: 18, color: C.dim });

    // bar chart: a probability for every token in the vocabulary
    const base = 770, scale = 380, bx = i => 250 + i * 80;
    const axis = S(sc.svg, "line", { x1: 200, y1: base, x2: 1150, y2: base }, { stroke: C.grid, strokeWidth: 2.5 });
    gsap.set(axis, { autoAlpha: 0 });
    const names = V.map((w, i) => H(sc, w, { x: bx(i), y: base + 28, size: 21, font: "mono", color: C.dim }));
    const bars = P1.map((p, i) => {
      const r = S(sc.svg, "rect", { x: bx(i) - 24, y: base - p * scale, width: 48, height: p * scale, rx: 3 }, { fill: C.blue });
      gsap.set(r, { scaleY: 0, transformOrigin: "50% 100%" });
      return r;
    });
    const vals = P1.map((p, i) => H(sc, f2(p), { x: bx(i), y: base - p * scale - 16, size: 18, font: "mono" }));
    const iMat = V.indexOf("mat"), iRug = V.indexOf("rug");
    fadeIn([ctxL, ...ctx.els], at("p1", 0.2), 0.4, { stagger: 0.1 });
    drawArrow(a1, at("p1", 0.6), 0.3);
    fadeIn(mdl.els, at("p1", 0.8), 0.4, { dy: 0 });
    show(axis, frac("p1", 0.3), 0.3);
    fadeIn(names, frac("p1", 0.3), 0.3, { stagger: 0.04, dy: 0 });
    draw(a2, frac("p1", 0.55), 0.5);
    show(a2t, frac("p1", 0.55) + 0.45, 0.2);
    fadeIn(smx, frac("p1", 0.58), 0.4, { dy: 0 });
    tl.to(bars, { scaleY: 1, duration: 0.6, stagger: 0.05, ease: "power2.out" }, frac("p1", 0.65));
    fadeIn(vals, frac("p1", 0.75), 0.3, { stagger: 0.03, dy: 0 });

    // the toy training text
    const cb = S(sc.svg, "rect", { x: 1185, y: 330, width: 380, height: 236, rx: 10 }, { fill: C.code, stroke: C.faint, strokeWidth: 1.5 });
    gsap.set(cb, { autoAlpha: 0 });
    const ch = H(sc, `toy text: ${N.corpus.length} sentences`, { x: 1375, y: 305, size: 20, color: C.dim });
    const lines = N.corpus.map((s, i) => H(sc, s, { anchor: "left", x: 1205, y: 356 + i * 26, size: 17, font: "mono", color: s.includes(N.ctx.join(" ")) ? C.fg : C.dim }));
    fadeIn([cb, ch], at("p2", 0.2), 0.4);
    fadeIn(lines, at("p2", 0.4), 0.3, { stagger: 0.08 });
    tl.to(bars[iMat], { fill: C.yellow, duration: 0.4 }, frac("p2", 0.62));
    tl.to(bars[iRug], { fill: C.teal, duration: 0.4 }, frac("p2", 0.62));
    pulse(vals[iMat], frac("p2", 0.65), 1.4, 0.6);
    const smooth = H(sc, `counts + ${N.smooth} for every token, so no probability is 0`, { x: 680, y: 850, size: 18, color: C.dim });
    fadeIn(smooth, frac("p2", 0.75), 0.4, { dy: 0 });

    // generation: pick, append, repeat
    const chart = [ctxL, ...ctx.els, ...mdl.els, ...aEls(a1), a2, a2t, smx, axis, ...names, ...bars, ...vals, cb, ch, ...lines, smooth];
    fadeOut(chart, at("p3", 0), 0.5);
    const all = [...N.gen_start, ...N.gen.map(g => g.tok)];
    const strip = tokenRow(sc, all, 800, 300, { size: 32, gap: 16 });
    const mY = 540;
    const gm = box(sc, 800, mY, 240, 84, C.blue, "model", { size: 30 });
    const down = arrowTo(sc, 800, 345, 800, mY - 48);
    const pl = H(sc, "", { anchor: "left", x: 940, y: mY, size: 22, font: "mono", color: C.dim });
    const passes = H(sc, "", { y: 700, size: 26, color: C.yellow });
    fadeIn(strip.els.slice(0, 2), at("p3", 0.4), 0.4, { stagger: 0.1 });
    fadeIn(gm.els, at("p3", 0.6), 0.4, { dy: 0 });
    drawArrow(down, at("p3", 0.9), 0.3);
    const tStep = [frac("p3", 0.3), frac("p3", 0.62), frac("p4", 0.15), frac("p4", 0.4), frac("p4", 0.65)];
    counter(pl, at("p3", 0), 0, 0, 0.01, () => "");
    counter(passes, at("p3", 0), 0, 0, 0.01, () => "passes through the model: 0");
    N.gen.forEach((g, i) => {
      const el = strip.els[i + 2], t = tStep[i];
      swapText(pl, t, `picks “${g.tok}”  p = ${f2(g.p)}`);
      swapText(passes, t, `passes through the model: ${i + 1}`);
      if (i === 0) { fadeIn(pl, t, 0.3, { dy: 0 }); fadeIn(passes, t, 0.3, { dy: 0 }); }
      fadeIn(el, t, 0.8, { dx: 800 - strip.xs[i + 2], dy: mY - 300 });
      pulse(gm.r, t, 1.06, 0.4);
    });

    // temperature
    const loopEls = [...strip.els, ...gm.els, ...aEls(down), pl, passes];
    fadeOut(loopEls, at("p5", 0), 0.5);
    const back = [ctxL, ...ctx.els, ...mdl.els, ...aEls(a1), axis, ...names, ...bars, ...vals];
    tl.to(back, { autoAlpha: 1, duration: 0.4 }, at("p5", 0.3));
    const temp = H(sc, "temperature 1.0", { x: 1300, y: 330, size: 34, color: C.orange, weight: 700 });
    const tnote = H(sc, "", { x: 1300, y: 385, size: 21, color: C.dim, wrap: 420 });
    fadeIn(temp, at("p5", 0.4), 0.4, { dy: 0 });
    function morph(P, t, txt, note) {
      bars.forEach((b, i) => tl.to(b, { attr: { y: base - P[i] * scale, height: P[i] * scale }, duration: 1.0, ease: "power2.inOut" }, t));
      vals.forEach((v, i) => {
        tl.to(v, { y: (P1[i] - P[i]) * scale, duration: 1.0, ease: "power2.inOut" }, t);
        counter(v, t, v._cnt ?? P1[i], P[i], 1.0, f2);
      });
      swapText(temp, t, txt);
      swapText(tnote, t, note);
    }
    morph(P05, frac("p5", 0.45), "temperature 0.5", "the most probable token becomes even more probable");
    fadeIn(tnote, frac("p5", 0.45), 0.4, { dy: 0 });
    morph(P15, frac("p6", 0.25), "temperature 1.5", "more equal: more variety, but more errors");
  }

  /* ---------------------------------------------------------------- 5 training */
  function train(sc, N) {
    title(sc, "Training an LLM", "n1");
    // the loop from episode 1
    const cx = 800, cy = 450, R = 190;
    const nodes = [["predict the next token", C.blue, 0, -1], ["loss", C.red, 1, 0], ["gradient descent", C.orange, 0, 1], ["new parameters", C.yellow, -1, 0]]
      .map(([s, col, dx, dy]) => box(sc, cx + dx * 330, cy + dy * R, dx ? 240 : 320, 70, col, s, { size: 24 }));
    const arcs = [[0, 1], [1, 2], [2, 3], [3, 0]].map(([a, b]) => {
      const A = nodes[a], B = nodes[b];
      const x1 = A.cx + (B.cx > A.cx ? A.w / 2 : B.cx < A.cx ? -A.w / 2 : 0), y1 = A.cy + (B.cy > A.cy ? A.h / 2 : B.cy < A.cy ? -A.h / 2 : 0);
      const x2 = B.cx + (A.cx > B.cx ? B.w / 2 : A.cx < B.cx ? -B.w / 2 : 0), y2 = B.cy + (A.cy > B.cy ? B.h / 2 : A.cy < B.cy ? -B.h / 2 : 0);
      return arrowTo(sc, x1 + Math.sign(x2 - x1) * 6, y1 + Math.sign(y2 - y1) * 6, x2, y2);
    });
    const from1 = H(sc, "the method from episode 1", { x: cx, y: cy, size: 24, color: C.dim });
    nodes.forEach((nd, i) => { fadeIn(nd.els, at("n1", 0.3) + i * 0.5, 0.4, { dy: 0 }); drawArrow(arcs[i], at("n1", 0.6) + i * 0.5, 0.35); });
    fadeIn(from1, frac("n1", 0.6), 0.4, { dy: 0 });
    const loopEls = [...nodes.flatMap(n => n.els), ...arcs.flatMap(aEls), from1];
    fadeOut(loopEls, at("n2", 0), 0.5);

    // pretraining: predict every next token
    const words = N.corpus[0].split(" ");
    const strip = tokenRow(sc, words, 800, 300, { size: 32, gap: 16, color: C.grid });
    const pre = H(sc, "pretraining: a very large amount of text", { y: 200, size: 26, color: C.dim });
    const pv = H(sc, "", { y: 410, size: 26, font: "mono" });
    fadeIn(pre, at("n2", 0.3), 0.4);
    fadeIn(strip.els, at("n2", 0.5), 0.3, { stagger: 0.05, dy: 0 });
    const legend = [H(sc, "context", { x: 620, y: 470, size: 22, color: C.blue }), H(sc, "next token to predict", { x: 900, y: 470, size: 22, color: C.yellow })];
    const t0 = frac("n2", 0.4), st = (dur("n2") * 0.55) / N.windows.length;
    counter(pv, t0, 0, 0, 0.01, () => "");
    fadeIn(legend, t0, 0.4, { dy: 0 });
    N.windows.forEach((w, i) => {
      const t = t0 + i * st, ci = w.ctx.length;
      strip.els.forEach((el, j) => {
        const col = j < ci ? C.blue : j === ci ? C.yellow : C.grid;
        tl.to(el, { borderColor: col, backgroundColor: hexA(col, j <= ci ? 0.22 : 0.08), duration: 0.25 }, t);
      });
      swapText(pv, t, `p(“${w.next}”) = ${w.p.toFixed(2)}`);
    });
    fadeIn(pv, t0, 0.3, { dy: 0 });

    // cross-entropy
    fadeOut([...strip.els, pre, pv, ...legend], at("n3", 0), 0.5);
    const ax = axes(sc, { x: 300, y: 210, w: 640, h: 500, xr: [0, 1], yr: [0, 4], xticks: [0, 0.25, 0.5, 0.75, 1], yticks: [0, 1, 2, 3, 4], grid: true,
      xlabel: "probability of the correct token", ylabel: "loss" });
    const ce = p => -Math.log(p);
    const cv = curve(sc, ax, ce, 0.018, 1, { color: C.blue });
    const fl = H(sc, "loss = −log p(correct token)", { x: 1300, y: 300, size: 28, font: "mono" });
    const fs = H(sc, "the cross-entropy", { x: 1300, y: 345, size: 22, color: C.dim });
    ax.show(at("n3", 0.3), 0.7);
    draw(cv, at("n3", 0.9), 1.0);
    fadeIn([fl, fs], at("n3", 0.5), 0.4, { stagger: 0.2 });
    function mark(p, l, col, lab, t) {
      const d = S(sc.svg, "circle", { cx: ax.X(p), cy: ax.Y(l), r: 9 }, { fill: col });
      gsap.set(d, { autoAlpha: 0 });
      const tx = H(sc, lab, { anchor: "left", x: ax.X(p) + 18, y: ax.Y(l) - 18, size: 22, color: col, font: "mono" });
      show(d, t, 0.3);
      fadeIn(tx, t + 0.1, 0.3, { dy: 0 });
      return [d, tx];
    }
    const mk1 = mark(N.p_mat, N.ce_mat, C.green, `“mat”: p = ${f2(N.p_mat)} → loss ${f2(N.ce_mat)}`, frac("n3", 0.68));
    const mk2 = mark(N.p_dog, N.ce_dog, C.red, `“dog”: p = ${N.p_dog.toFixed(3)} → loss ${f2(N.ce_dog)}`, frac("n3", 0.5));

    // gradient descent raises the probability of the correct token
    const ball = S(sc.svg, "circle", { cx: ax.X(N.p_dog), cy: ax.Y(N.ce_dog), r: 12 }, { fill: C.yellow });
    gsap.set(ball, { autoAlpha: 0 });
    const pr = { p: N.p_dog };
    show(ball, at("n4", 0.3), 0.3);
    tl.to(pr, { p: N.p_mat, duration: dur("n4") * 0.5, ease: "power1.inOut", onUpdate: () => { ball.setAttribute("cx", ax.X(pr.p)); ball.setAttribute("cy", ax.Y(ce(pr.p))); } }, at("n4", 0.6));
    const gd = H(sc, "gradient descent: higher probability, smaller loss", { x: 1300, y: 470, size: 22, color: C.orange, wrap: 420 });
    const many = H(sc, "over a very large number of tokens", { x: 1300, y: 540, size: 22, color: C.dim });
    fadeIn(gd, at("n4", 0.5), 0.4, { dy: 0 });
    fadeIn(many, frac("n4", 0.6), 0.4, { dy: 0 });
    const ceEls = [...ax.all, cv, fl, fs, ball, gd, many, ...mk1, ...mk2];
    fadeOut(ceEls, at("n5", 0), 0.5);

    // three stages
    const st1 = box(sc, 330, 230, 330, 100, C.blue, "pretraining", { sub: "continues text" });
    const st2 = box(sc, 800, 230, 330, 100, C.green, "fine-tuning", { sub: "follows instructions" });
    const st3 = box(sc, 1270, 230, 330, 100, C.purple, "RLHF", { sub: "gives preferred answers" });
    const s12 = arrowTo(sc, 500, 230, 630, 230), s23 = arrowTo(sc, 970, 230, 1100, 230);
    fadeIn(st1.els, at("n5", 0.6), 0.4, { dy: 0 });
    drawArrow(s12, frac("n5", 0.55), 0.35);
    fadeIn(st2.els, frac("n5", 0.6), 0.4, { dy: 0 });

    // LoRA
    const L = N.lora;
    const W = S(sc.svg, "rect", { x: 380, y: 400, width: 270, height: 270, rx: 6 }, { fill: hexA(C.grid, 0.45), stroke: C.grid, strokeWidth: 2 });
    const Bm = S(sc.svg, "rect", { x: 760, y: 400, width: 28, height: 270, rx: 4 }, { fill: hexA(C.yellow, 0.8) });
    const Am = S(sc.svg, "rect", { x: 820, y: 400, width: 270, height: 28, rx: 4 }, { fill: hexA(C.yellow, 0.8) });
    gsap.set([W, Bm, Am], { autoAlpha: 0 });
    const Wl = H(sc, "W: frozen", { x: 515, y: 535, size: 28, weight: 700, color: C.fg });
    const Wn = H(sc, `${k(L.d)} × ${k(L.d)} = ${k(L.full)}`, { x: 515, y: 705, size: 20, font: "mono", color: C.dim });
    const plus = H(sc, "+", { x: 705, y: 535, size: 44, weight: 700 });
    const Bl = H(sc, "B", { x: 774, y: 380, size: 24, color: C.yellow, weight: 700 });
    const Al = H(sc, "A", { x: 955, y: 450, size: 24, color: C.yellow, weight: 700 });
    const ABn = H(sc, `B: ${k(L.d)} × ${L.r}  ·  A: ${L.r} × ${k(L.d)}`, { anchor: "left", x: 820, y: 505, size: 20, font: "mono", color: C.dim });
    const ABt = H(sc, `trainable: 2 × ${k(L.d)} × ${L.r} = ${k(L.lora)}`, { anchor: "left", x: 820, y: 545, size: 20, font: "mono", color: C.yellow });
    const ratio = H(sc, `${L.pct} % of W  ·  ${L.ratio}× fewer (one ${k(L.d)} × ${k(L.d)} layer)`, { anchor: "left", x: 820, y: 600, size: 22, color: C.yellow, weight: 600 });
    const paper = H(sc, "LoRA paper: up to 10,000× fewer trainable parameters than full fine-tuning of GPT-3 175B", { anchor: "left", x: 820, y: 665, size: 18, color: C.dim, wrap: 680, align: "left" });
    const t6 = at("n6", 0.2);
    pulse(st2.r, t6, 1.06, 0.5);
    fadeIn([W, Wl], t6 + 0.3, 0.4, { dy: 0 });
    fadeIn(Wn, t6 + 0.8, 0.3, { dy: 0 });
    fadeIn(plus, frac("n6", 0.45), 0.3, { dy: 0 });
    fadeIn([Bm, Bl], frac("n6", 0.48), 0.4, { dy: 0 });
    fadeIn([Am, Al], frac("n6", 0.55), 0.4, { dy: 0 });
    fadeIn([ABn, ABt], frac("n6", 0.62), 0.4, { dy: 0, stagger: 0.2 });
    fadeIn(ratio, frac("n6", 0.75), 0.4, { dy: 0 });
    fadeIn(paper, frac("n6", 0.85), 0.4, { dy: 0 });
    const loraEls = [W, Bm, Am, Wl, Wn, plus, Bl, Al, ABn, ABt, ratio, paper];

    // RLHF
    fadeOut(loraEls, at("n7", 0), 0.4);
    drawArrow(s23, at("n7", 0.3), 0.35);
    fadeIn(st3.els, at("n7", 0.6), 0.4, { dy: 0 });
    const ansA = box(sc, 380, 470, 250, 70, C.grid, "answer A", { size: 24, color: C.fg, fill: 0.15 });
    const ansB = box(sc, 380, 600, 250, 70, C.grid, "answer B", { size: 24, color: C.fg, fill: 0.15 });
    const head = S(sc.svg, "circle", { cx: 620, cy: 505, r: 20 }, { fill: "none", stroke: C.fg, strokeWidth: 3 });
    const body = S(sc.svg, "path", { d: "M585,580 Q620,525 655,580" }, { fill: "none", stroke: C.fg, strokeWidth: 3 });
    gsap.set([head, body], { autoAlpha: 0 });
    const person = H(sc, "a person", { x: 620, y: 612, size: 20, color: C.dim });
    const tick = S(sc.svg, "path", { d: "M470,600 l14,14 l26,-30" }, { fill: "none", stroke: C.green, strokeWidth: 5, strokeLinecap: "round" });
    gsap.set(tick, { autoAlpha: 0 });
    const rm = box(sc, 940, 535, 250, 84, C.purple, "reward model", { size: 26 });
    const llm = box(sc, 1340, 535, 200, 84, C.blue, "LLM", { size: 28 });
    const r1 = arrowTo(sc, 680, 535, 812, 535), r2 = arrowTo(sc, 1068, 535, 1236, 535);
    const rl = H(sc, "reward", { x: 1152, y: 505, size: 20, color: C.purple });
    const llmL = H(sc, "trains to get a high reward", { x: 1340, y: 615, size: 20, color: C.dim });
    fadeIn([...ansA.els, ...ansB.els], at("n7", 1.0), 0.4, { stagger: 0.1, dy: 0 });
    fadeIn([head, body, person], frac("n7", 0.2), 0.4, { dy: 0 });
    draw(tick, frac("n7", 0.3), 0.4);
    drawArrow(r1, frac("n7", 0.5), 0.3);
    fadeIn(rm.els, frac("n7", 0.55), 0.4, { dy: 0 });
    drawArrow(r2, frac("n7", 0.72), 0.3);
    fadeIn(rl, frac("n7", 0.72), 0.3, { dy: 0 });
    fadeIn(llm.els, frac("n7", 0.78), 0.4, { dy: 0 });
    fadeIn(llmL, frac("n7", 0.85), 0.4, { dy: 0 });
    const rlEls = [...ansA.els, ...ansB.els, head, body, person, tick, ...rm.els, ...llm.els, ...aEls(r1), ...aEls(r2), rl, llmL];

    // next episode
    fadeOut([...rlEls, ...st1.els, ...st2.els, ...st3.els, ...aEls(s12), ...aEls(s23)], at("n8", 0), 0.5);
    const nx = H(sc, "Next · Episode 7 · Build with LLMs", { y: 330, size: 34, color: LEVEL_COLOR["AI engineering"], weight: 600 });
    const u = chip(sc, "user", C.orange, { x: 330, y: 520, size: 28 });
    const app = box(sc, 700, 520, 260, 90, C.yellow, "application", { size: 28 });
    const api = box(sc, 1130, 520, 220, 90, C.blue, "LLM", { size: 30 });
    const e1 = arrowTo(sc, 392, 520, 566, 520), e2 = arrowTo(sc, 834, 520, 1016, 520);
    fadeIn(nx, at("n8", 0.3), 0.5);
    fadeIn(u, frac("n8", 0.35), 0.4, { dy: 0 });
    drawArrow(e1, frac("n8", 0.42), 0.3);
    fadeIn(app.els, frac("n8", 0.48), 0.4, { dy: 0 });
    drawArrow(e2, frac("n8", 0.58), 0.3);
    fadeIn(api.els, frac("n8", 0.64), 0.4, { dy: 0 });
  }

  return { tokens, embed, attention, predict, train };
})();
