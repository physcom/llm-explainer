/* Episode 8 - Fine-tuning. Contract: OUTLINE.md. N = episodes/ep8.py nums(). */
SCENES_BY_EP.ep8 = (() => {
  const n0 = v => Math.round(v).toLocaleString("en-US");
  const f3 = v => v.toFixed(3);
  const RED = C.red, GRN = C.green;
  function title(sc, text, key) { write(H(sc, text, { y: 78, size: 56, font: "serif", weight: 600 }), at(key, 0.1), 1.0); }
  const hide = els => gsap.set(els, { autoAlpha: 0 });
  const aEls = a => [a.line, a.tip];
  /* a plain rectangle (no label), hidden until shown */
  function rect(sc, x, y, w, h, color, o = {}) {
    const r = S(sc.svg, "rect", { x, y, width: w, height: h, rx: o.rx ?? 12 },
      { fill: o.fill === undefined ? hexA(color, 0.08) : o.fill, stroke: color, strokeWidth: o.sw || 2.5, strokeDasharray: o.dash || "" });
    hide(r);
    return r;
  }
  /* chips side by side from x0 to the right; returns the x of the right end */
  function leftRow(els, x0, gap) {
    const w = els.map(e => e.offsetWidth);
    let x = x0;
    els.forEach((e, i) => { e.style.left = (x + w[i] / 2) + "px"; x += w[i] + gap; });
    return x - gap;
  }
  const heat = v => v === 0 ? hexA(C.grid, 0.35) : v > 0 ? hexA(C.blue, Math.min(1, 0.2 + Math.abs(v) * 1.2)) : hexA(C.orange, Math.min(1, 0.2 + Math.abs(v) * 1.2));
  /* a matrix drawn as cells. vals: 2-d array (colour by sign), or a fixed colour. text: print the values. Top-left at (x, y). */
  function grid(sc, x, y, rows, cols, cell, o = {}) {
    const g = S(sc.svg, "g");
    const cells = [];
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
      const v = o.vals ? o.vals[i][j] : 0;
      cells.push(S(g, "rect", { x: x + j * cell, y: y + i * cell, width: cell - 3, height: cell - 3, rx: 4 },
        { fill: o.vals ? heat(v) : hexA(o.color || C.blue, o.alpha ?? 0.3), stroke: "none" }));
      if (o.text) T(g, v === 0 ? "0" : v.toFixed(2), x + j * cell + (cell - 3) / 2, y + i * cell + (cell - 3) / 2 + 5, { size: o.tsize || 15, color: C.fg, font: "mono" });
    }
    gsap.set(g, { autoAlpha: 0 });
    return { g, cells, w: cols * cell, h: rows * cell };
  }
  /* a vertical bar that grows from the baseline; returns { r, label } */
  function vbar(sc, x, base, w, h, color, label, t, o = {}) {
    const r = S(sc.svg, "rect", { x, y: base, width: w, height: 0, rx: 4 }, { fill: hexA(color, 0.85) });
    tl.to(r, { attr: { y: base - h, height: Math.max(h, 0.5) }, duration: 0.7, ease: "power2.out" }, t);
    const lab = H(sc, label, { x: x + w / 2, y: base - h - 24, size: o.size || 26, color, font: "mono", weight: 600 });
    fadeIn(lab, t + 0.5, 0.4, { dy: 0 });
    return { r, lab };
  }

  /* ---------------------------------------------------------------- 1 why fine-tune */
  function why(sc, N) {
    title(sc, "Fine-tuning", "w1");
    const B = N.budget;
    // w1: a generalist model, and a task it does not know
    const model = box(sc, 560, 450, 420, 230, C.purple, "pre-trained model", { size: 34, sub: "a generalist", subSize: 24 });
    const skills = [["language", 440, 290], ["facts", 680, 290], ["code", 440, 610], ["summaries", 680, 610]]
      .map(([t, x, y]) => chip(sc, t, C.purple, { x, y, size: 22 }));
    const task = chip(sc, "your task", C.orange, { x: 1180, y: 450, size: 32 });
    const q = H(sc, "?", { x: 1180, y: 350, size: 90, color: RED, weight: 700 });
    const ar = arrow(sc, 790, 450, 1050, 450, C.dim, 4, 16);
    fadeIn(model.els, at("w1", 0.6), 0.6, { dy: 0 });
    fadeIn(skills, frac("w1", 0.3), 0.4, { stagger: 0.15 });
    drawArrow(ar, frac("w1", 0.58), 0.5);
    fadeIn(task, frac("w1", 0.66), 0.4, { dy: 0 });
    fadeIn(q, frac("w1", 0.8), 0.4);

    // w2: a prompt or RAG is often enough; sometimes it is not
    fadeOut([task, q, ...aEls(ar), ...skills], at("w2", 0), 0.4);
    const h1 = H(sc, "often enough (episode 7)", { x: 1180, y: 270, size: 24, color: C.dim });
    const cp = chip(sc, "prompt  ✓", GRN, { x: 1180, y: 335, size: 28 });
    const cr = chip(sc, "RAG  ✓", GRN, { x: 1180, y: 405, size: 28 });
    const h2 = H(sc, "sometimes you need", { x: 1180, y: 505, size: 24, color: C.dim });
    const needs = ["a fixed style", "a format", "a skill in your field"]
      .map((t, i) => chip(sc, t, C.orange, { x: 1180, y: 565 + i * 70, size: 26 }));
    fadeIn([h1, cp, cr], at("w2", 0.5), 0.4, { stagger: 0.25 });
    fadeIn([h2, ...needs], frac("w2", 0.5), 0.4, { stagger: 0.22 });

    // w3: fine-tuning: examples change the weights
    fadeOut([...model.els, h1, cp, cr, h2, ...needs], at("w3", 0), 0.5);
    const ex = [0, 1, 2].map(i => box(sc, 260, 340 + i * 110, 250, 76, C.blue, `example ${i + 1}`, { size: 24, sub: "prompt + answer", subSize: 18 }));
    const wg = grid(sc, 640, 270, 8, 8, 44, { color: C.blue, alpha: 0.3 });
    const wl = H(sc, "the weights of the model", { x: 808, y: 235, size: 26, color: C.dim });
    const ar1 = arrow(sc, 400, 450, 600, 450, C.dim, 4, 16);
    const chg = H(sc, "your examples change the weights", { x: 808, y: 665, size: 28, color: C.orange, weight: 600 });
    fadeIn(ex.flatMap(e => e.els), at("w3", 0.4), 0.4, { stagger: 0.12, dy: 0 });
    fadeIn([wg.g, wl], frac("w3", 0.25), 0.5, { dy: 0 });
    drawArrow(ar1, frac("w3", 0.45), 0.5);
    tl.to(wg.cells, { fill: hexA(C.orange, 0.5), duration: 0.35, stagger: { each: 0.015, from: "random" } }, frac("w3", 0.5));
    fadeIn(chg, frac("w3", 0.7), 0.5);

    // w4: memory for one weight in full fine-tuning
    fadeOut([...ex.flatMap(e => e.els), wg.g, wl, ...aEls(ar1), chg], at("w4", 0), 0.5);
    const by = B.bytes, U = 70, GAPX = 12;
    const parts = [["weight", by.weight, C.blue], ["gradient", by.grad, GRN], ["optimizer state", by.opt, C.purple]];
    const totalW = parts.reduce((a, p) => a + p[1] * U, 0) + GAPX * 2;
    let x = 800 - totalW / 2;
    const blocks = parts.map(([name, bytes, col]) => {
      const w = bytes * U, cx = x + w / 2;
      const r = rect(sc, x, 395, w, 110, col, { fill: hexA(col, 0.22) });
      const t1 = H(sc, name, { x: cx, y: 450, size: 26, color: col, weight: 700 });
      const t2 = H(sc, `${bytes} bytes`, { x: cx, y: 540, size: 24, color: C.dim, font: "mono" });
      x += w + GAPX;
      return [r, t1, t2];
    });
    const cap = H(sc, "memory for each weight", { x: 800, y: 320, size: 30, color: C.dim });
    const tot = H(sc, `= ${by.weight + by.grad + by.opt} bytes for each weight`, { x: 800, y: 640, size: 34, color: C.yellow, font: "mono", weight: 600 });
    const note = H(sc, "weight and gradient: 16 bits · optimizer state (Adam): two 32-bit numbers", { x: 800, y: 710, size: 22, color: C.dim });
    fadeIn(cap, at("w4", 0.3), 0.4);
    fadeIn(blocks[0], at("w4", 0.7), 0.4, { dy: 0 });
    fadeIn(blocks[1], frac("w4", 0.55), 0.4, { dy: 0 });
    fadeIn(blocks[2], frac("w4", 0.72), 0.4, { dy: 0 });
    fadeIn([tot, note], frac("w4", 0.9), 0.4);

    // w5: 7B weights, and one full copy for every customer
    fadeOut([...blocks.flat(), cap, tot, note], at("w5", 0), 0.5);
    const line = H(sc, `${B.params / 1e9} billion weights × ${by.weight + by.grad + by.opt} bytes = ${B.rows.full.total} GB`, { x: 800, y: 290, size: 40, font: "mono", weight: 600 });
    const cust = [0, 1, 2].map(i => box(sc, 420 + i * 380, 480, 300, 120, C.blue, `customer ${i + 1}`, { size: 28, sub: `full copy · ${B.rows.full.weights} GB`, subSize: 22 }));
    const many = H(sc, `${n0(B.customers)} customers = ${n0(B.copies_gb)} GB`, { x: 800, y: 640, size: 38, color: RED, font: "mono", weight: 600 });
    fadeIn(line, at("w5", 0.3), 0.5);
    fadeIn(cust.flatMap(c => c.els), frac("w5", 0.5), 0.4, { stagger: 0.2, dy: 0 });
    fadeIn(many, frac("w5", 0.82), 0.5);
  }

  /* ---------------------------------------------------------------- 2 supervised fine-tuning */
  function sft(sc, N) {
    title(sc, "Supervised fine-tuning", "s1");
    const P = N.pairs;
    // s1: pairs of a prompt and an ideal answer
    const rows = P.map((p, i) => {
      const yp = 250 + i * 250, ya = yp + 80;
      const lp = H(sc, "prompt", { anchor: "left", x: 110, y: yp, size: 24, color: C.blue, weight: 600 });
      const la = H(sc, "ideal answer", { anchor: "left", x: 110, y: ya, size: 24, color: GRN, weight: 600 });
      const pe = p.prompt.map(t => chip(sc, t, C.blue, { x: 0, y: yp, size: 28 }));
      const ae = p.answer.map(t => chip(sc, t, GRN, { x: 0, y: ya, size: 28 }));
      leftRow(pe, 360, 10);
      leftRow(ae, 360, 10);
      return [lp, la, ...pe, ...ae];
    });
    fadeIn(rows[0], at("s1", 0.5), 0.4, { stagger: 0.06, dy: 8 });
    fadeIn(rows[1], frac("s1", 0.55), 0.4, { stagger: 0.06, dy: 8 });

    // s2: the next-token loss, counted only on the answer tokens
    fadeOut(rows.flat(), at("s2", 0), 0.5);
    const p0 = P[0], seq = [...p0.prompt, ...p0.answer];
    const toks = seq.map((t, i) => chip(sc, t, p0.mask[i] ? GRN : C.blue, { x: 0, y: 360, size: 28 }));
    const cs = rowLayout(toks, 800, 24);
    const head = H(sc, "the model predicts each next token", { x: 800, y: 270, size: 30, color: C.dim });
    const lossBoxes = [], digits = [];
    seq.forEach((t, i) => {
      if (i === 0) return;
      const b = box(sc, cs[i], 500, Math.max(54, toks[i].offsetWidth), 48, C.orange, "loss", { size: 18, weight: 600, fill: 0.12 });
      const d = H(sc, String(p0.mask[i]), { x: cs[i], y: 575, size: 30, color: p0.mask[i] ? GRN : C.dim, font: "mono", weight: 700 });
      lossBoxes.push({ b, on: p0.mask[i] === 1 });
      digits.push(d);
    });
    const mk = H(sc, "mask:  0 = not counted,  1 = counted", { x: 800, y: 650, size: 28, color: C.fg });
    fadeIn(head, at("s2", 0.3), 0.4);
    fadeIn(toks, at("s2", 0.6), 0.4, { stagger: 0.06, dy: 8 });
    fadeIn(lossBoxes.flatMap(l => l.b.els), frac("s2", 0.25), 0.4, { stagger: 0.05, dy: 0 });
    const offs = lossBoxes.filter(l => !l.on).flatMap(l => l.b.els);
    const ons = lossBoxes.filter(l => l.on);
    tl.to(offs, { opacity: 0.25, duration: 0.5 }, frac("s2", 0.55));
    ons.forEach(l => tl.to(l.b.r, { fill: hexA(GRN, 0.35), stroke: GRN, duration: 0.5 }, frac("s2", 0.58)));
    fadeIn(digits, frac("s2", 0.6), 0.4, { stagger: 0.05, dy: 0 });
    fadeIn(mk, frac("s2", 0.72), 0.4);

    // s3: a small learning rate, and few passes over the data
    fadeOut([head, ...toks, ...lossBoxes.flatMap(l => l.b.els), ...digits, mk], at("s3", 0), 0.5);
    const ln = S(sc.svg, "line", { x1: 240, y1: 330, x2: 1360, y2: 330 }, { stroke: C.grid, strokeWidth: 3 });
    hide(ln);
    const px = 520;
    const dot = S(sc.svg, "circle", { cx: px, cy: 330, r: 13 }, { fill: C.blue });
    hide(dot);
    const dl = H(sc, "pre-trained weights", { x: px, y: 275, size: 24, color: C.blue });
    const sm = arrow(sc, px + 14, 330, px + 130, 330, GRN, 6, 20);
    const sml = H(sc, "small learning rate: adjust", { x: px + 160, y: 392, size: 24, color: GRN, weight: 600 });
    const big = arrow(sc, px + 14, 440, 1260, 440, RED, 5, 20);
    const bigl = H(sc, "large steps: replace what the model knows", { x: 900, y: 490, size: 24, color: RED });
    const xr = cross(sc, 1300, 440, 22, 22, frac("s3", 0.42));
    show(ln, at("s3", 0.3), 0.3);
    show(dot, at("s3", 0.4), 0.3);
    fadeIn(dl, at("s3", 0.4), 0.3, { dy: 0 });
    drawArrow(sm, frac("s3", 0.12), 0.5);
    fadeIn(sml, frac("s3", 0.2), 0.4, { dy: 0 });
    drawArrow(big, frac("s3", 0.3), 0.7);
    fadeIn(bigl, frac("s3", 0.38), 0.4, { dy: 0 });
    const passes = [1, 2, 3].map(i => chip(sc, `pass ${i}`, C.yellow, { x: 480 + (i - 1) * 260, y: 650, size: 28 }));
    const pa = [0, 1].map(i => arrow(sc, 570 + i * 260, 650, 660 + i * 260, 650, C.dim, 3, 12));
    const pl = H(sc, "few passes over all the examples", { x: 760, y: 730, size: 26, color: C.dim });
    fadeIn(passes, frac("s3", 0.62), 0.4, { stagger: 0.2 });
    pa.forEach((a, i) => drawArrow(a, frac("s3", 0.7) + i * 0.2, 0.3));
    fadeIn(pl, frac("s3", 0.85), 0.4);

    // s4: quality over quantity
    fadeOut([ln, dot, dl, ...aEls(sm), sml, ...aEls(big), bigl, ...xr, ...passes, ...pa.flatMap(aEls), pl], at("s4", 0), 0.5);
    const lh = H(sc, "a few clean, correct examples", { x: 440, y: 230, size: 30, color: GRN, weight: 600 });
    const rh = H(sc, "many bad examples", { x: 1160, y: 230, size: 30, color: RED, weight: 600 });
    const good = [0, 1, 2, 3].map(i => {
      const cx = 330 + (i % 2) * 220, cy = 340 + Math.floor(i / 2) * 140;
      return [rect(sc, cx - 90, cy - 45, 180, 90, GRN, { fill: hexA(GRN, 0.12) }), H(sc, "✓", { x: cx, y: cy, size: 44, color: GRN, weight: 700 })];
    }).flat();
    const bad = [...Array(10)].map((_, i) => {
      const cx = 960 + (i % 4) * 140 + (Math.floor(i / 4) % 2) * 30, cy = 330 + Math.floor(i / 4) * 105;
      const r = rect(sc, cx - 55, cy - 36, 110, 72, RED, { fill: hexA(RED, 0.1) });
      gsap.set(r, { rotation: ((i * 37) % 17) - 8, transformOrigin: "50% 50%" });
      return [r, H(sc, i % 3 === 0 ? "✗" : "?", { x: cx, y: cy, size: 34, color: RED, weight: 700 })];
    }).flat();
    fadeIn([lh, ...good], at("s4", 0.4), 0.4, { stagger: 0.08, dy: 0 });
    fadeIn([rh, ...bad], frac("s4", 0.5), 0.4, { stagger: 0.04, dy: 0 });
    const ft = H(sc, "toy-sized idea; real data sets are larger", { x: 800, y: 790, size: 20, color: C.dim });
    fadeIn(ft, frac("s4", 0.85), 0.4);

    // s5: two risks, with numbers from the toy run (full fine-tuning)
    fadeOut([lh, rh, ...good, ...bad, ft], at("s5", 0), 0.5);
    const T0 = N.toy, base = 730, K = 480;
    const lt = H(sc, "forgets old skills", { x: 400, y: 215, size: 32, color: C.orange, weight: 600 });
    const ls = H(sc, "error on the old task A (toy)", { x: 400, y: 262, size: 22, color: C.dim });
    const rt = H(sc, "overfits a small data set", { x: 1100, y: 215, size: 32, color: C.orange, weight: 600 });
    const rs = H(sc, "error on task B (toy)", { x: 1100, y: 262, size: 22, color: C.dim });
    const axL = S(sc.svg, "line", { x1: 180, y1: base, x2: 620, y2: base }, { stroke: C.grid, strokeWidth: 2.5 });
    const axR = S(sc.svg, "line", { x1: 840, y1: base, x2: 1380, y2: base }, { stroke: C.grid, strokeWidth: 2.5 });
    hide([axL, axR]);
    const bl = [["before", T0.before.test_A, C.blue, 250], ["after", T0.full.test_A, RED, 450]];
    const br = [["training examples", T0.full.train_B, C.blue, 880], ["new data", T0.full.test_B, RED, 1060], ["before, new data", T0.before.test_B, C.dim, 1240]];
    const lblY = base + 34;
    const bars = [];
    fadeIn([lt, ls, axL], at("s5", 0.9), 0.4);
    bl.forEach(([name, v, col, bx], i) => {
      bars.push(vbar(sc, bx - 55, base, 110, v * K, col, f3(v), frac("s5", 0.3) + i * 0.5));
      const l = H(sc, name, { x: bx, y: lblY, size: 20, color: C.dim });
      fadeIn(l, frac("s5", 0.3) + i * 0.5, 0.3, { dy: 0 });
    });
    fadeIn([rt, rs, axR], frac("s5", 0.55), 0.4);
    br.forEach(([name, v, col, bx], i) => {
      bars.push(vbar(sc, bx - 55, base, 110, v * K, col, f3(v), frac("s5", 0.62) + i * 0.4));
      const l = H(sc, name, { x: bx, y: lblY, size: 20, color: C.dim });
      fadeIn(l, frac("s5", 0.62) + i * 0.4, 0.3, { dy: 0 });
    });
  }

  /* ---------------------------------------------------------------- 3 LoRA */
  function lora(sc, N) {
    title(sc, "LoRA", "l1");
    const B = N.budget, T0 = N.toy;
    // l1: freeze W, train a small update
    const wvals = [...Array(8)].map((_, i) => [...Array(8)].map((_, j) => Math.sin(i * 1.7 + j * 2.3) * 0.4));
    const wg = grid(sc, 240, 270, 8, 8, 40, { vals: wvals });
    const wl = H(sc, "W:  d_out × d_in", { x: 400, y: 640, size: 28, color: C.blue, font: "mono" });
    const c1 = H(sc, "full fine-tuning: every weight changes", { x: 400, y: 710, size: 26, color: RED });
    const c2 = H(sc, "LoRA: W is frozen", { x: 400, y: 710, size: 26, color: GRN, weight: 600 });
    const frozen = chip(sc, "frozen", C.blue, { x: 400, y: 430, size: 34 });
    const plus = H(sc, "+", { x: 720, y: 430, size: 70, color: C.dim });
    const upd = chip(sc, "small update", C.orange, { x: 1000, y: 430, size: 36 });
    const updn = H(sc, "the only part that we train", { x: 1000, y: 500, size: 24, color: C.dim });
    fadeIn([wg.g, wl], at("l1", 0.4), 0.5, { dy: 0 });
    fadeIn(c1, at("l1", 1.0), 0.4);
    tl.to(wg.cells, { opacity: 0.35, duration: 0.2, yoyo: true, repeat: 3, stagger: { each: 0.01, from: "random" } }, at("l1", 1.2));
    fadeOut(c1, frac("l1", 0.5), 0.3);
    fadeIn(c2, frac("l1", 0.55), 0.4);
    tl.to(wg.g, { opacity: 0.5, duration: 0.4 }, frac("l1", 0.55));
    fadeIn(frozen, frac("l1", 0.58), 0.4, { dy: 0 });
    fadeIn([plus, upd, updn], frac("l1", 0.75), 0.5, { stagger: 0.2 });

    // l2: the update is B times A
    fadeOut([wg.g, wl, c2, frozen, plus, upd, updn], at("l2", 0), 0.5);
    const formula = H(sc, "W′ = W + B A", { x: 800, y: 190, size: 46, font: "mono", weight: 600 });
    const SZ = 250, cy = 440;
    const W = rect(sc, 150, cy - SZ / 2, SZ, SZ, C.blue, { fill: hexA(C.blue, 0.14) });
    const Wt = H(sc, "W", { x: 275, y: cy, size: 60, color: C.blue, weight: 700 });
    const Wd = H(sc, "d_out × d_in", { x: 275, y: cy + SZ / 2 + 36, size: 24, color: C.dim, font: "mono" });
    const p1 = H(sc, "+", { x: 455, y: cy, size: 56, color: C.dim });
    const Bm = rect(sc, 530, cy - SZ / 2, 56, SZ, C.orange, { fill: hexA(C.orange, 0.2) });
    const Bt = H(sc, "B", { x: 558, y: cy, size: 40, color: C.orange, weight: 700 });
    const Bd = H(sc, "d_out × r", { x: 558, y: cy + SZ / 2 + 36, size: 24, color: C.dim, font: "mono" });
    const rB = H(sc, "r", { x: 558, y: cy - SZ / 2 - 28, size: 34, color: C.yellow, font: "mono", weight: 700 });
    const tm = H(sc, "×", { x: 660, y: cy, size: 50, color: C.dim });
    const Am = rect(sc, 700, cy - 28, SZ, 56, C.orange, { fill: hexA(C.orange, 0.2) });
    const At = H(sc, "A", { x: 825, y: cy, size: 40, color: C.orange, weight: 700 });
    const Ad = H(sc, "r × d_in", { x: 825, y: cy + SZ / 2 + 36, size: 24, color: C.dim, font: "mono" });
    const rA = H(sc, "r", { x: 985, y: cy, size: 34, color: C.yellow, font: "mono", weight: 700 });
    const eq = H(sc, "=", { x: 1070, y: cy, size: 56, color: C.dim });
    const Pm = rect(sc, 1130, cy - SZ / 2, SZ, SZ, C.orange, { fill: hexA(C.orange, 0.08), dash: "10 8" });
    const Pt = H(sc, "B A", { x: 1255, y: cy, size: 44, color: C.orange, weight: 700 });
    const Pd = H(sc, "same shape as W", { x: 1255, y: cy + SZ / 2 + 36, size: 24, color: C.dim });
    write(formula, at("l2", 0.5), 0.8);
    fadeIn([W, Wt, Wd], frac("l2", 0.2), 0.4, { dy: 0 });
    fadeIn([p1, Bm, Bt, Bd], frac("l2", 0.38), 0.4, { dy: 0 });
    fadeIn([tm, Am, At, Ad], frac("l2", 0.5), 0.4, { dy: 0 });
    fadeIn([rB, rA], frac("l2", 0.7), 0.4, { dy: 0 });
    pulse(rB, frac("l2", 0.74)); pulse(rA, frac("l2", 0.78));
    fadeIn([eq, Pm, Pt, Pd], frac("l2", 0.84), 0.4, { dy: 0 });

    // l3: the number of weights for one 4,096 by 4,096 matrix
    fadeOut([formula, W, Wt, Wd, p1, Bm, Bt, Bd, rB, tm, Am, At, Ad, rA, eq, Pm, Pt, Pd], at("l3", 0), 0.5);
    const M = B.matrix, X0 = 330, FULLW = 1100;
    const cap = H(sc, "weights to train, for one matrix", { x: 800, y: 230, size: 28, color: C.dim });
    const bar1 = rect(sc, X0, 300, FULLW, 90, C.blue, { fill: hexA(C.blue, 0.3) });
    const l1t = H(sc, "W", { anchor: "left", x: 150, y: 345, size: 34, color: C.blue, weight: 700 });
    const l1v = H(sc, `${n0(B.hidden)} × ${n0(B.hidden)} = ${n0(M.full)}`, { x: X0 + FULLW / 2, y: 345, size: 34, font: "mono", weight: 600 });
    const bar2 = rect(sc, X0, 470, Math.max(3, FULLW * M.pct / 100), 90, C.orange, { fill: hexA(C.orange, 0.9) });
    const l2t = H(sc, "B and A", { anchor: "left", x: 110, y: 515, size: 34, color: C.orange, weight: 700 });
    const l2v = H(sc, `r × (d_out + d_in) = ${B.rank} × ${n0(2 * B.hidden)} = ${n0(M.lora)}`, { anchor: "left", x: X0 + 30, y: 515, size: 30, font: "mono", weight: 600 });
    const pct = H(sc, `${M.pct} % of the weights of W`, { x: 800, y: 640, size: 40, color: C.yellow, font: "mono", weight: 600 });
    fadeIn(cap, at("l3", 0.3), 0.4);
    fadeIn([bar1, l1t, l1v], at("l3", 0.8), 0.5, { dy: 0 });
    fadeIn([bar2, l2t, l2v], frac("l3", 0.55), 0.5, { dy: 0 });
    fadeIn(pct, frac("l3", 0.85), 0.5);

    // l4: B starts at zero, so the update starts at zero
    fadeOut([cap, bar1, l1t, l1v, bar2, l2t, l2v, pct], at("l4", 0), 0.5);
    const Bg = grid(sc, 170, 300, 6, 4, 52, { vals: Array.from({ length: 6 }, () => [0, 0, 0, 0]), text: true });
    const Ag = grid(sc, 520, 352, 4, 8, 52, { vals: T0.A_start, text: true, tsize: 14 });
    const Zg = grid(sc, 1090, 366, 6, 8, 36, { vals: Array.from({ length: 6 }, () => Array(8).fill(0)) });
    const bl = H(sc, "B  (all zeros)", { x: 274, y: 650, size: 26, color: C.orange, font: "mono" });
    const al = H(sc, "A  (random)", { x: 728, y: 650, size: 26, color: C.orange, font: "mono" });
    const zl = H(sc, "B A  (all zeros)", { x: 1210, y: 650, size: 26, color: C.dim, font: "mono" });
    const tx = H(sc, "×", { x: 449, y: 456, size: 50, color: C.dim });
    const eq4 = H(sc, "=", { x: 1010, y: 456, size: 50, color: C.dim });
    const w0 = H(sc, "W′ = W + 0 = W:  the model starts as before", { x: 800, y: 760, size: 34, color: GRN, weight: 600 });
    fadeIn([Bg.g, bl], at("l4", 0.4), 0.5, { dy: 0 });
    fadeIn([tx, Ag.g, al], frac("l4", 0.3), 0.5, { dy: 0 });
    fadeIn([eq4, Zg.g, zl], frac("l4", 0.5), 0.5, { dy: 0 });
    fadeIn(w0, frac("l4", 0.75), 0.5);

    // l5: only B and A train; the needed change has few main directions
    fadeOut([Bg.g, bl, tx, Ag.g, al, eq4, Zg.g, zl, w0], at("l5", 0), 0.5);
    const bw = box(sc, 330, 330, 300, 110, C.blue, "W", { size: 36, sub: "frozen", subSize: 24 });
    const bb = box(sc, 330, 520, 300, 110, C.orange, "B", { size: 36, sub: "trained", subSize: 24 });
    const ba = box(sc, 330, 710, 300, 110, C.orange, "A", { size: 36, sub: "trained", subSize: 24 });
    const hd = H(sc, "the needed change: share in the top r directions (toy)", { x: 1130, y: 235, size: 24, color: C.dim });
    const ks = Object.keys(T0.energy);
    const eb = ks.map((k, i) => {
      const y = 320 + i * 82, w = 4.2 * T0.energy[k] * 100;
      const t = H(sc, `r = ${k}`, { anchor: "left", x: 800, y, size: 26, color: C.fg, font: "mono" });
      const r = rect(sc, 920, y - 24, w, 48, C.orange, { fill: hexA(C.orange, 0.7) });
      const v = H(sc, `${(T0.energy[k] * 100).toFixed(1)} %`, { anchor: "left", x: 920 + w + 14, y, size: 26, color: C.orange, font: "mono", weight: 600 });
      return [t, r, v];
    });
    fadeIn(bw.els, at("l5", 0.4), 0.4, { dy: 0 });
    fadeIn([...bb.els, ...ba.els], frac("l5", 0.2), 0.4, { dy: 0, stagger: 0.1 });
    pulse(bb.r, frac("l5", 0.35)); pulse(ba.r, frac("l5", 0.4));
    fadeIn(hd, frac("l5", 0.5), 0.4);
    eb.forEach((g, i) => fadeIn(g, frac("l5", 0.58) + i * 0.3, 0.4, { dy: 0 }));

    // l6: a toy test, error on new data during training
    fadeOut([...bw.els, ...bb.els, ...ba.els, hd, ...eb.flat()], at("l6", 0), 0.5);
    const ax = axes(sc, { x: 230, y: 230, w: 880, h: 440, xr: [0, T0.steps], yr: [0, 0.4], grid: true,
      xticks: [0, 50, 100, 150], yticks: [0, 0.1, 0.2, 0.3, 0.4], yfmt: v => v.toFixed(1),
      xlabel: "training step", ylabel: "error on new task B data (lower is better)" });
    ax.show(at("l6", 0.3), 0.8);
    const path = (curveVals, col) => {
      const pts = curveVals.map((v, i) => [ax.X(i * T0.curve_step), ax.Y(v)]);
      const p = S(sc.svg, "path", { d: pathD(pts) }, { fill: "none", stroke: col, strokeWidth: 5, strokeLinecap: "round", strokeLinejoin: "round" });
      hide(p);
      return p;
    };
    const ref = S(sc.svg, "line", { x1: ax.X(0), y1: ax.Y(T0.before.test_B), x2: ax.X(T0.steps), y2: ax.Y(T0.before.test_B) }, { stroke: C.dim, strokeWidth: 2.5, strokeDasharray: "10 8" });
    hide(ref);
    const refL = H(sc, `before fine-tuning: ${f3(T0.before.test_B)}`, { anchor: "left", x: ax.X(92), y: ax.Y(T0.before.test_B) + 26, size: 20, color: C.dim });
    const pf = path(T0.full.curve, RED), pl = path(T0.lora.curve, GRN);
    const lf = H(sc, `full fine-tuning · ${n0(T0.full.params)} weights`, { anchor: "left", x: 1180, y: 330, size: 24, color: RED, weight: 600 });
    const ll = H(sc, `LoRA, r = ${T0.rank} · ${n0(T0.lora.params)} weights`, { anchor: "left", x: 1180, y: 390, size: 24, color: GRN, weight: 600 });
    const tt = H(sc, `toy: one ${T0.d} × ${T0.d} matrix, ${T0.n_train} noisy examples`, { x: 800, y: 790, size: 22, color: C.dim });
    show(ref, at("l6", 0.9), 0.4); fadeIn(refL, at("l6", 0.9), 0.4, { dy: 0 });
    fadeIn(tt, at("l6", 0.6), 0.4);
    draw(pf, frac("l6", 0.28), 2.4); fadeIn(lf, frac("l6", 0.28), 0.4, { dy: 0 });
    draw(pl, frac("l6", 0.5), 2.4); fadeIn(ll, frac("l6", 0.5), 0.4, { dy: 0 });

    // l7: the two errors, new data and old task
    fadeOut([...ax.all, ref, refL, pf, pl, lf, ll, tt], at("l7", 0), 0.5);
    const base = 720, K = 560;
    const groups = [["new task B data", 330, T0.full.test_B, T0.lora.test_B], ["old task A", 930, T0.full.test_A, T0.lora.test_A]];
    const lgf = H(sc, "full fine-tuning", { anchor: "left", x: 1130, y: 260, size: 26, color: RED, weight: 600 });
    const lgl = H(sc, "LoRA", { anchor: "left", x: 1130, y: 310, size: 26, color: GRN, weight: 600 });
    const axb = S(sc.svg, "line", { x1: 180, y1: base, x2: 1060, y2: base }, { stroke: C.grid, strokeWidth: 2.5 });
    hide(axb);
    const lo = H(sc, "error: lower is better", { x: 620, y: 200, size: 24, color: C.dim });
    fadeIn([lgf, lgl, lo, axb], at("l7", 0.4), 0.4, { dy: 0 });
    const l7els = [];
    groups.forEach(([name, gx, vf, vl], i) => {
      const t0 = i === 0 ? frac("l7", 0.12) : frac("l7", 0.55);
      const b1 = vbar(sc, gx - 130, base, 110, vf * K, RED, f3(vf), t0);
      const b2 = vbar(sc, gx + 20, base, 110, vl * K, GRN, f3(vl), t0 + 0.4);
      const gn = H(sc, name, { x: gx + 10, y: base + 38, size: 26, color: C.dim });
      fadeIn(gn, t0, 0.3, { dy: 0 });
      l7els.push(b1.r, b1.lab, b2.r, b2.lab, gn);
    });

    // l8: scale alpha / r, and merge into W
    fadeOut([lgf, lgl, lo, axb, ...l7els], at("l8", 0), 0.4);
    const f8 = H(sc, "W′ = W + (α / r) · B A", { x: 800, y: 250, size: 46, font: "mono", weight: 600 });
    const sc8 = H(sc, `α = ${T0.alpha},  r = ${T0.rank}:  the scale α / r = ${T0.alpha / T0.rank}`, { x: 800, y: 320, size: 28, color: C.yellow, font: "mono" });
    const b1 = box(sc, 300, 500, 230, 130, C.blue, "W", { size: 36, sub: "frozen", subSize: 22 });
    const pl8 = H(sc, "+", { x: 470, y: 500, size: 56, color: C.dim });
    const b2 = box(sc, 700, 500, 300, 130, C.orange, "(α / r) · B A", { size: 30, sub: "the update", subSize: 22, font: "mono" });
    const a8 = arrow(sc, 880, 500, 1070, 500, C.dim, 4, 16);
    const m8 = H(sc, "merge", { x: 975, y: 465, size: 24, color: C.dim });
    const b3 = box(sc, 1260, 500, 260, 130, GRN, "W′", { size: 36, sub: "one matrix", subSize: 22 });
    const nd = chip(sc, "inference: no extra delay", GRN, { x: 1260, y: 650, size: 26 });
    write(f8, at("l8", 0.3), 1.0);
    fadeIn(sc8, at("l8", 0.7), 0.4);
    fadeIn([...b1.els, pl8, ...b2.els], frac("l8", 0.4), 0.4, { stagger: 0.2, dy: 0 });
    drawArrow(a8, frac("l8", 0.62), 0.5); fadeIn(m8, frac("l8", 0.62), 0.4, { dy: 0 });
    fadeIn(b3.els, frac("l8", 0.72), 0.4, { dy: 0 });
    fadeIn(nd, frac("l8", 0.86), 0.4);

    // l9: keep the adapter apart: one base model, many adapters
    fadeOut([f8, sc8, ...b1.els, pl8, ...b2.els, ...aEls(a8), m8, ...b3.els, nd], at("l9", 0), 0.5);
    const base9 = box(sc, 800, 300, 420, 110, C.purple, "base model", { size: 34, sub: `${B.rows.lora.weights} GB, shared`, subSize: 22 });
    const ad = [0, 1, 2].map(i => box(sc, 420 + i * 380, 560, 300, 100, C.orange, `adapter ${i + 1}`, { size: 28, sub: `${B.adapter_mb} MB`, subSize: 22 }));
    const cu = [0, 1, 2].map(i => H(sc, `customer ${i + 1}`, { x: 420 + i * 380, y: 640, size: 22, color: C.dim }));
    const lk = ad.map((a, i) => arrow(sc, 800 + (i - 1) * 110, 358, a.cx, a.top - 6, C.dim, 3, 12));
    const cmp = H(sc, `${n0(B.customers)} customers:  ${B.adapters_gb} GB with adapters  ·  ${n0(B.copies_gb)} GB with full copies`, { x: 800, y: 780, size: 28, color: C.yellow, font: "mono", weight: 600 });
    fadeIn(base9.els, at("l9", 0.3), 0.4, { dy: 0 });
    fadeIn(ad[0].els, frac("l9", 0.2), 0.4, { dy: 0 });
    drawArrow(lk[0], frac("l9", 0.28), 0.4);
    fadeIn(ad[1].els, frac("l9", 0.55), 0.4, { dy: 0 }); fadeIn(ad[2].els, frac("l9", 0.62), 0.4, { dy: 0 });
    drawArrow(lk[1], frac("l9", 0.58), 0.4); drawArrow(lk[2], frac("l9", 0.65), 0.4);
    fadeIn(cu, frac("l9", 0.7), 0.4, { stagger: 0.1, dy: 0 });
    fadeIn(cmp, frac("l9", 0.85), 0.5);
  }

  /* ---------------------------------------------------------------- 4 QLoRA */
  function qlora(sc, N) {
    title(sc, "QLoRA", "q1");
    const B = N.budget, Q = N.quant, R = B.rows;
    // q1: the frozen weights in 16 bits
    const X0 = 200, FW = 1200, SC = FW / R.lora.weights;
    const b16 = rect(sc, X0, 250, FW, 80, C.blue, { fill: hexA(C.blue, 0.3) });
    const t16 = H(sc, `${B.params / 1e9}B weights × 16 bits = ${R.lora.weights} GB`, { x: X0 + FW / 2, y: 290, size: 32, font: "mono", weight: 600 });
    const l16 = H(sc, "frozen weights", { anchor: "left", x: X0, y: 215, size: 24, color: C.dim });
    fadeIn(l16, at("q1", 0.3), 0.4);
    fadeIn([b16, t16], at("q1", 0.8), 0.5, { dy: 0 });

    // q2: 4-bit codes: 16 values; each weight snaps to the nearest one
    const w4 = R.qlora.weights * SC;
    const b4 = rect(sc, X0, 360, w4, 80, GRN, { fill: hexA(GRN, 0.35) });
    const t4 = H(sc, `4 bits: ${R.qlora.weights} GB`, { anchor: "left", x: X0 + w4 + 20, y: 400, size: 32, color: GRN, font: "mono", weight: 600 });
    const L0 = 260, L1 = 1340, LX = v => L0 + (v + 1) / 2 * (L1 - L0), LY = 640;
    const line = S(sc.svg, "line", { x1: L0 - 30, y1: LY, x2: L1 + 30, y2: LY }, { stroke: C.grid, strokeWidth: 2.5 });
    const ticks = Q.levels_normal.map(v => S(sc.svg, "line", { x1: LX(v), y1: LY - 22, x2: LX(v), y2: LY + 22 }, { stroke: GRN, strokeWidth: 3 }));
    hide([line, ...ticks]);
    const lvl = H(sc, "the 16 values of a 4-bit code", { x: 800, y: 700, size: 26, color: GRN });
    const blk = Q.block, dots = blk.w.map(w => S(sc.svg, "circle", { cx: LX(w / blk.scale), cy: LY - 55, r: 11 }, { fill: C.blue }));
    hide(dots);
    const dl = H(sc, "weights, divided by the block scale", { x: 800, y: 540, size: 24, color: C.blue });
    fadeIn([b4, t4], at("q2", 0.5), 0.5, { dy: 0 });
    show(line, frac("q2", 0.3), 0.3);
    tl.to(ticks, { autoAlpha: 1, duration: 0.25, stagger: 0.03 }, frac("q2", 0.32));
    fadeIn(lvl, frac("q2", 0.38), 0.4, { dy: 0 });
    show(dots, frac("q2", 0.45), 0.3); fadeIn(dl, frac("q2", 0.45), 0.3, { dy: 0 });
    dots.forEach((d, i) => tl.to(d, { attr: { cx: LX(blk.back[i] / blk.scale), cy: LY }, fill: GRN, duration: 0.5, ease: "power2.inOut" }, frac("q2", 0.68) + i * 0.04));

    // q3: blocks of 64 weights, one scale per block
    fadeOut([b16, t16, l16, b4, t4, line, ...ticks, lvl, ...dots, dl], at("q3", 0), 0.5);
    const CW = 130, X3 = 800 - (8 * CW) / 2;
    const bt = H(sc, `a block of ${B.block} weights (the first 8)`, { x: 800, y: 215, size: 26, color: C.dim });
    const sl = chip(sc, `scale = ${blk.scale}  (16 bits, one per block)`, C.yellow, { x: 800, y: 285, size: 26, font: "mono" });
    const cellsW = blk.w.map((w, i) => {
      const r = rect(sc, X3 + i * CW + 4, 350, CW - 8, 70, C.blue, { fill: hexA(C.blue, 0.15) });
      return [r, H(sc, w.toFixed(4), { x: X3 + i * CW + CW / 2, y: 385, size: 24, color: C.blue, font: "mono" })];
    }).flat();
    const dn = H(sc, "÷ scale, then the nearest of 16 values  ↓", { x: 800, y: 465, size: 24, color: C.dim });
    const cellsC = blk.codes.map((c, i) => {
      const r = rect(sc, X3 + i * CW + 4, 510, CW - 8, 70, GRN, { fill: hexA(GRN, 0.2) });
      return [r, H(sc, c.toString(2).padStart(4, "0"), { x: X3 + i * CW + CW / 2, y: 545, size: 28, color: GRN, font: "mono", weight: 600 })];
    }).flat();
    const bits = B.block * 4 + 16;
    const fm = H(sc, `${B.block} × 4 + 16 = ${bits} bits  →  ${B.bits_per_weight} bits per weight`, { x: 800, y: 680, size: 36, color: C.yellow, font: "mono", weight: 600 });
    fadeIn([bt, sl], at("q3", 0.4), 0.4);
    fadeIn(cellsW, frac("q3", 0.25), 0.4, { stagger: 0.04, dy: 0 });
    fadeIn(dn, frac("q3", 0.5), 0.3, { dy: 0 });
    fadeIn(cellsC, frac("q3", 0.55), 0.4, { stagger: 0.05, dy: 0 });
    fadeIn(fm, frac("q3", 0.82), 0.5);

    // q4: convert to 16 bits for the compute; adapters train in 16 bits
    fadeOut([bt, sl, ...cellsW, dn, ...cellsC, fm], at("q4", 0), 0.5);
    const f1 = box(sc, 300, 400, 300, 120, C.blue, "weights", { size: 32, sub: "4 bits · frozen", subSize: 22 });
    const f2 = box(sc, 800, 400, 300, 120, C.blue, "weights", { size: 32, sub: "16 bits · temporary", subSize: 22 });
    const f3b = box(sc, 1300, 400, 220, 120, C.fg, "output", { size: 32, fill: 0.05 });
    const e1 = arrow(sc, 452, 400, 648, 400, C.dim, 4, 16);
    const e2 = arrow(sc, 952, 400, 1188, 400, C.dim, 4, 16);
    const e1l = H(sc, "convert to 16 bits", { x: 550, y: 362, size: 22, color: C.dim });
    const ad4 = box(sc, 800, 640, 360, 110, C.orange, "adapters B and A", { size: 30, sub: "16 bits · trained", subSize: 22 });
    const e3 = arrow(sc, 980, 610, 1260, 470, C.orange, 4, 16);
    fadeIn(f1.els, at("q4", 0.3), 0.4, { dy: 0 });
    drawArrow(e1, frac("q4", 0.25), 0.5); fadeIn(e1l, frac("q4", 0.28), 0.4, { dy: 0 });
    fadeIn(f2.els, frac("q4", 0.38), 0.4, { dy: 0 });
    drawArrow(e2, frac("q4", 0.46), 0.5); fadeIn(f3b.els, frac("q4", 0.52), 0.4, { dy: 0 });
    fadeIn(ad4.els, frac("q4", 0.68), 0.4, { dy: 0 }); drawArrow(e3, frac("q4", 0.78), 0.5);

    // q5: the memory table (computed, see ep8_memory_budget.py)
    fadeOut([...f1.els, ...f2.els, ...f3b.els, ...aEls(e1), e1l, ...aEls(e2), ...ad4.els, ...aEls(e3)], at("q5", 0), 0.5);
    const base5 = 750, K5 = 420 / R.full.total;
    const parts = [["weights", C.blue], ["gradients", GRN], ["optimizer", C.purple], ["adapters", C.orange]];
    const cols = [["full fine-tuning", "full", 470], ["LoRA", "lora", 820], ["QLoRA", "qlora", 1170]];
    const leg = parts.map(([n, col], i) => [rect(sc, 110, 280 + i * 50, 26, 26, col, { fill: hexA(col, 0.85) }), H(sc, n, { anchor: "left", x: 150, y: 293 + i * 50, size: 24, color: col })]).flat();
    fadeIn(leg, at("q5", 0.3), 0.4, { stagger: 0.05, dy: 0 });
    const colEls = cols.map(([name, key, cx], ci) => {
      let y = base5;
      const els = [];
      parts.forEach(([pn, col]) => {
        const v = R[key][pn];
        const h = v * K5;
        if (h <= 0) return;
        y -= h;
        const r = S(sc.svg, "rect", { x: cx - 70, y, width: 140, height: h }, { fill: hexA(col, 0.85), stroke: C.stage, strokeWidth: 1 });
        hide(r);
        els.push(r);
        if (h > 36) els.push(H(sc, `${v.toFixed(2)}`, { x: cx, y: y + h / 2, size: 22, color: C.stage, font: "mono", weight: 700 }));
      });
      els.push(H(sc, `${R[key].total} GB`, { x: cx, y: y - 34, size: 34, color: C.yellow, font: "mono", weight: 700 }));
      els.push(H(sc, name, { x: cx, y: base5 + 38, size: 26, color: C.fg, weight: 600 }));
      return els;
    });
    const as = H(sc, `${B.params / 1e9}B weights · 16-bit weights and gradients · Adam: two 32-bit numbers · LoRA r = ${B.rank} on query and value · no activations`, { x: 800, y: 845, size: 20, color: C.dim });
    colEls.forEach((els, i) => tl.to(els, { autoAlpha: 1, duration: 0.5, stagger: 0.04 }, [frac("q5", 0.22), frac("q5", 0.5), frac("q5", 0.74)][i]));
    fadeIn(as, frac("q5", 0.3), 0.4);

    // q6: the rounding error is small but real: check with evals
    fadeOut([...leg, ...colEls.flat(), as], at("q6", 0), 0.5);
    const eh = H(sc, "error of 4-bit rounding (random matrix)", { x: 800, y: 230, size: 28, color: C.dim });
    const EK = 4000;
    const er = [["evenly spaced values", Q.err_uniform, C.blue, 330], ["normal-spaced values", Q.err_normal, GRN, 440]].map(([name, v, col, y]) => {
      const nm = H(sc, name, { anchor: "right", x: 520, y, size: 26, color: col });
      const r = rect(sc, 550, y - 30, v * EK, 60, col, { fill: hexA(col, 0.7) });
      const vl = H(sc, `${(v * 100).toFixed(1)} %`, { anchor: "left", x: 550 + v * EK + 16, y, size: 30, color: col, font: "mono", weight: 600 });
      return [nm, r, vl];
    });
    const ev = box(sc, 800, 640, 700, 110, C.yellow, "your evals (episode 7)", { size: 32, sub: "is the answer still good?", subSize: 24 });
    fadeIn(eh, at("q6", 0.3), 0.4);
    fadeIn(er[0], at("q6", 0.8), 0.5, { dy: 0 });
    fadeIn(er[1], frac("q6", 0.35), 0.5, { dy: 0 });
    fadeIn(ev.els, frac("q6", 0.62), 0.5, { dy: 0 });
    pulse(ev.r, frac("q6", 0.8), 1.04, 0.8);
  }

  /* ---------------------------------------------------------------- 5 prompt, RAG or fine-tune */
  function choose(sc, N) {
    title(sc, "Prompt, RAG or fine-tune?", "c1");
    // c1: the order, cheapest first, with evals under all steps
    const xs = [330, 800, 1270];
    const steps = [["prompt", C.blue, "instructions and examples"], ["RAG", C.teal, "facts that change or need a source"], ["fine-tune", C.orange, "a stable style, format or skill"]];
    const st = steps.map(([name, col, sub], i) => box(sc, xs[i], 430, 340, 150, col, name, { size: 38, sub, subSize: 20 }));
    const ar = [0, 1].map(i => arrow(sc, xs[i] + 185, 430, xs[i + 1] - 185, 430, C.dim, 4, 16));
    const cost = arrow(sc, 200, 560, 1400, 560, C.dim, 3, 14);
    const cl = H(sc, "more cost and effort", { x: 800, y: 600, size: 24, color: C.dim });
    const ev = box(sc, 800, 730, 1100, 84, C.yellow, "evals: measure every step", { size: 30, fill: 0.08 });
    fadeIn(st[0].els, at("c1", 0.9), 0.4, { dy: 0 });
    drawArrow(ar[0], frac("c1", 0.4), 0.4); fadeIn(st[1].els, frac("c1", 0.42), 0.4, { dy: 0 });
    drawArrow(ar[1], frac("c1", 0.5), 0.4); fadeIn(st[2].els, frac("c1", 0.52), 0.4, { dy: 0 });
    drawArrow(cost, frac("c1", 0.6), 0.6); fadeIn(cl, frac("c1", 0.65), 0.4, { dy: 0 });
    fadeIn(ev.els, frac("c1", 0.78), 0.5, { dy: 0 });

    // c2: first the prompt, second RAG
    const n1 = H(sc, "1", { x: xs[0] - 150, y: 322, size: 40, color: C.blue, font: "mono", weight: 700 });
    const n2 = H(sc, "2", { x: xs[1] - 150, y: 322, size: 40, color: C.teal, font: "mono", weight: 700 });
    tl.to(st[0].r, { fill: hexA(C.blue, 0.3), duration: 0.4 }, at("c2", 0.3)); fadeIn(n1, at("c2", 0.3), 0.3, { dy: 0 });
    tl.to(st[1].r, { fill: hexA(C.teal, 0.3), duration: 0.4 }, frac("c2", 0.42)); fadeIn(n2, frac("c2", 0.42), 0.3, { dy: 0 });

    // c3: third, fine-tune
    const n3 = H(sc, "3", { x: xs[2] - 150, y: 322, size: 40, color: C.orange, font: "mono", weight: 700 });
    tl.to(st[2].r, { fill: hexA(C.orange, 0.3), duration: 0.4 }, at("c3", 0.3)); fadeIn(n3, at("c3", 0.3), 0.3, { dy: 0 });

    // c4: they combine; test every step
    fadeOut(n1, at("c4", 0), 0.3);
    const comb = S(sc.svg, "path", { d: `M${xs[1] - 150},292 L${xs[1] - 150},278 L${xs[2] + 150},278 L${xs[2] + 150},292` }, { fill: "none", stroke: C.yellow, strokeWidth: 3 });
    hide(comb);
    const cb = H(sc, "RAG for the facts  +  fine-tune for the format", { x: (xs[1] + xs[2]) / 2, y: 240, size: 26, color: C.yellow, weight: 600 });
    draw(comb, at("c4", 0.5), 0.6); fadeIn(cb, at("c4", 0.8), 0.4);
    pulse(ev.r, frac("c4", 0.78), 1.02, 0.8);

    // c5: next episode
    fadeOut([...st.flatMap(s => s.els), ...ar.flatMap(aEls), ...aEls(cost), cl, ...ev.els, n2, n3, comb, cb], at("c5", 0), 0.5);
    const nxt = DATA.series.find(s => s.id === "ep9");
    const nx = H(sc, `Next · Episode ${nxt.n} · ${nxt.title}`, { y: 300, size: 34, color: LEVEL_COLOR[nxt.level], weight: 600 });
    const a1 = box(sc, 500, 520, 340, 110, C.blue, "answer 1", { size: 30, sub: "imitation: copy the example", subSize: 20 });
    const a2 = box(sc, 1100, 520, 340, 110, C.blue, "answer 2", { size: 30 });
    const better = H(sc, "which answer is better?", { x: 800, y: 640, size: 32, color: C.yellow, weight: 600 });
    const tick = H(sc, "✓", { x: 1100, y: 600, size: 44, color: GRN, weight: 700 });
    fadeIn(nx, at("c5", 0.3), 0.5);
    fadeIn(a1.els, frac("c5", 0.4), 0.4, { dy: 0 });
    fadeIn(a2.els, frac("c5", 0.55), 0.4, { dy: 0 });
    fadeIn(better, frac("c5", 0.72), 0.4);
    fadeIn(tick, frac("c5", 0.85), 0.3, { dy: 0 });
  }

  return { why, sft, lora, qlora, choose };
})();
