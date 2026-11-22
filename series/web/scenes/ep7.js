/* Episode 7 - Build with LLMs. Contract: OUTLINE.md. N = episodes/ep7.py nums(). */
SCENES_BY_EP.ep7 = (() => {
  const money = v => "$" + v.toFixed(4);
  const k = v => Math.round(v).toLocaleString("en-US");
  function title(sc, text, key) { write(H(sc, text, { y: 78, size: 56, font: "serif", weight: 600 }), at(key, 0.1), 1.0); }
  const hide = els => gsap.set(els, { autoAlpha: 0 });
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
  function mark(sc, ok, x, y, size = 26) {
    return H(sc, ok ? "✓" : "✗", { x, y, size, color: ok ? C.green : C.red, weight: 700 });
  }

  /* ---------------------------------------------------------------- 1 one API call */
  function api(sc, N) {
    title(sc, "Build with LLMs", "a1");
    // an LLM inside your application
    const llm = box(sc, 800, 420, 240, 110, C.purple, "LLM", { size: 40 });
    const frame = rect(sc, 380, 215, 840, 410, C.dim, { fill: "none", dash: "12 10", rx: 20 });
    const fl = H(sc, "your application", { anchor: "left", x: 404, y: 250, size: 24, color: C.dim, weight: 600 });
    const parts = [["user interface", 560, 330], ["your code", 560, 510], ["your data", 1040, 330], ["tools", 1040, 510]]
      .map(([t, x, y]) => chip(sc, t, C.blue, { x, y, size: 24 }));
    fadeIn(llm.els, at("a1", 0.6), 0.6, { dy: 0 });
    show(frame, frac("a1", 0.55), 0.5);
    fadeIn(fl, frac("a1", 0.58), 0.4, { dy: 0 });
    fadeIn(parts, frac("a1", 0.62), 0.4, { stagger: 0.15 });
    fadeOut([...llm.els, frame, fl, ...parts], at("a2", 0), 0.5);

    // no training: text in, text out
    const train = chip(sc, "train a model", C.dim, { x: 800, y: 210, size: 30 });
    fadeIn(train, at("a2", 0.5), 0.4);
    const cr = cross(sc, 800, 210, 130, 34, at("a2", 1.4));
    const code = box(sc, 380, 470, 280, 110, C.blue, "your code", { size: 30 });
    const model = box(sc, 1220, 470, 280, 110, C.purple, "model API", { size: 30 });
    const aIn = arrow(sc, 528, 440, 1072, 440, C.dim, 4, 16);
    const aOut = arrow(sc, 1072, 500, 528, 500, C.dim, 4, 16);
    const lIn = H(sc, "text in", { x: 800, y: 412, size: 24, color: C.fg });
    const lOut = H(sc, "text out", { x: 800, y: 530, size: 24, color: C.fg });
    fadeIn(code.els, frac("a2", 0.48), 0.4, { dy: 0 });
    fadeIn(model.els, frac("a2", 0.56), 0.4, { dy: 0 });
    drawArrow(aIn, frac("a2", 0.62), 0.6);
    fadeIn(lIn, frac("a2", 0.66), 0.3, { dy: 0 });
    drawArrow(aOut, frac("a2", 0.8), 0.6);
    fadeIn(lOut, frac("a2", 0.84), 0.3, { dy: 0 });
    fadeOut([train, ...cr, ...code.els, ...model.els, aIn.line, aIn.tip, aOut.line, aOut.tip, lIn, lOut], at("a3", 0), 0.5);

    // the request
    const lines = [
      "response = client.messages.create(",
      '    model="claude-opus-5-5",',
      "    max_tokens=16000,",
      '    system="You answer questions about a bike shop.",',
      '    messages=[{"role": "user",',
      `               "content": "${N.chunks.length ? "Can I return a bike after two weeks?" : ""}"}],`,
      ")",
    ];
    const cb = codeBox(sc, lines, { x: 110, y: 160, size: 23 });
    fadeIn(cb.el, at("a3", 0.3), 0.5);
    const rowY = i => 160 + 19 + 23 * 1.45 * (i + 0.5);
    const sysL = H(sc, "system prompt: the rules", { anchor: "left", x: 1130, y: rowY(3), size: 24, color: C.orange, weight: 600 });
    const msgL = H(sc, "messages: the conversation", { anchor: "left", x: 1130, y: (rowY(4) + rowY(5)) / 2, size: 24, color: C.green, weight: 600 });
    tl.to(cb.rows[3], { backgroundColor: hexA(C.orange, 0.22), duration: 0.4 }, frac("a3", 0.22));
    fadeIn(sysL, frac("a3", 0.22), 0.4, { dx: -10, dy: 0 });
    tl.to([cb.rows[4], cb.rows[5]], { backgroundColor: hexA(C.green, 0.2), duration: 0.4 }, frac("a3", 0.45));
    fadeIn(msgL, frac("a3", 0.45), 0.4, { dx: -10, dy: 0 });
    const reply = rect(sc, 110, 520, 900, 150, C.purple);
    const rl = H(sc, "the reply: text", { anchor: "left", x: 134, y: 552, size: 22, color: C.purple, weight: 600 });
    const bars = [560, 760, 420].map((w, i) => { const b = S(sc.svg, "rect", { x: 134, y: 580 + i * 26, width: w, height: 12, rx: 6 }, { fill: C.grid }); hide(b); return b; });
    const ra = arrow(sc, 560, 470, 560, 512, C.dim, 3, 12);
    drawArrow(ra, frac("a3", 0.72), 0.3);
    show(reply, frac("a3", 0.76), 0.4);
    fadeIn(rl, frac("a3", 0.78), 0.3, { dy: 0 });
    tl.to(bars, { autoAlpha: 1, duration: 0.3, stagger: 0.2 }, frac("a3", 0.8));
    fadeOut([cb.el, sysL, msgL, reply, rl, ...bars, ra.line, ra.tip], at("a4", 0), 0.5);

    // tokens: 1 square = 50 tokens
    const UNIT = 50, SQ = 30, GAP = 6, X0 = 430;
    function tokRow(label, n, y, col, t) {
      const lab = H(sc, label, { anchor: "left", x: 160, y, size: 28, color: col, weight: 600 });
      const sq = [...Array(n / UNIT)].map((_, i) => { const s = S(sc.svg, "rect", { x: X0 + i * (SQ + GAP), y: y - SQ / 2, width: SQ, height: SQ, rx: 4 }, { fill: col }); hide(s); return s; });
      const cnt = H(sc, `${k(n)} tokens`, { anchor: "left", x: X0 + (n / UNIT) * (SQ + GAP) + 14, y, size: 26, color: col, font: "mono" });
      fadeIn(lab, t, 0.4, { dy: 0 });
      tl.to(sq, { autoAlpha: 1, duration: 0.12, stagger: 0.04 }, t + 0.2);
      fadeIn(cnt, t + 0.2 + sq.length * 0.04, 0.3, { dy: 0 });
      return { lab, sq, cnt };
    }
    const unit = H(sc, `example request · 1 square = ${UNIT} tokens`, { x: 800, y: 210, size: 22, color: C.dim });
    fadeIn(unit, at("a4", 0.3), 0.4);
    const rIn = tokRow("input", N.tok_in, 300, C.blue, frac("a4", 0.3));
    const rOut = tokRow("output", N.tok_out, 390, C.yellow, frac("a4", 0.62));

    // price and time
    const p1 = H(sc, `${N.tok_in.toLocaleString("en-US")} × $${N.price_in} / 1M  =  ${money(N.cost_in)}`, { anchor: "left", x: 430, y: 520, size: 28, font: "mono", color: C.blue });
    const p2 = H(sc, `${N.tok_out.toLocaleString("en-US")} × $${N.price_out} / 1M  =  ${money(N.cost_out)}`, { anchor: "left", x: 430, y: 570, size: 28, font: "mono", color: C.yellow });
    const pl = H(sc, "price (claude-opus-5-5)", { anchor: "left", x: 160, y: 545, size: 22, color: C.dim });
    const sum = H(sc, `total for this request: ${money(N.cost)}`, { anchor: "left", x: 430, y: 635, size: 28, font: "mono", weight: 600 });
    fadeIn(pl, at("a5", 0.3), 0.3, { dy: 0 });
    fadeIn([p1, p2], at("a5", 0.4), 0.4, { stagger: 0.4 });
    fadeIn(sum, frac("a5", 0.42), 0.4);
    const r1 = H(sc, `an output token costs ${N.out_ratio}× an input token`, { x: 800, y: 735, size: 26, color: C.yellow });
    const r2 = H(sc, "and the model writes output tokens one at a time", { x: 800, y: 785, size: 26, color: C.yellow });
    fadeIn(r1, frac("a5", 0.62), 0.4);
    fadeIn(r2, frac("a5", 0.78), 0.4);
    tl.to(rOut.sq, { scale: 1.25, transformOrigin: "50% 50%", duration: 0.2, yoyo: true, repeat: 1, stagger: 0.05 }, frac("a5", 0.78));
  }

  /* ---------------------------------------------------------------- 2 the prompt */
  function prompt(sc, N) {
    title(sc, "The prompt", "p1");
    const card = rect(sc, 110, 160, 690, 520, C.fg, { fill: hexA(C.fg, 0.03), rx: 16 });
    const cardL = H(sc, "prompt", { anchor: "left", x: 134, y: 192, size: 22, color: C.dim, font: "mono" });
    show(card, at("p1", 0.4), 0.5);
    fadeIn(cardL, at("p1", 0.6), 0.3, { dy: 0 });
    const tip = H(sc, "clear instructions, as for a new colleague", { x: 1150, y: 300, size: 26, color: C.dim, wrap: 560 });
    fadeIn(tip, frac("p1", 0.55), 0.5);
    function band(y, h, label, col, text, t) {
      const bg = S(sc.svg, "rect", { x: 130, y, width: 650, height: h, rx: 8 }, { fill: hexA(col, 0.1), stroke: hexA(col, 0.6), strokeWidth: 1.5 });
      hide(bg);
      const lab = H(sc, label, { anchor: "left", x: 146, y: y + 20, size: 18, color: col, weight: 700, font: "mono" });
      const tx = para(sc, text, 146, y + 36, 620, { size: 19, font: "body" });
      show(bg, t, 0.4);
      fadeIn([lab, tx], t + 0.1, 0.4, { dy: 0 });
      return [bg, lab, tx];
    }
    const b1 = band(220, 92, "CONTEXT", C.blue, "You answer the messages of customers of a small bike shop.", frac("p1", 0.6));
    const b2 = band(322, 92, "GOAL", C.teal, "Find what the customer wants and the order id.", at("p2", 0.4));
    const b3 = band(424, 92, "FORMAT", C.orange, `Reply with JSON only: intent (${N.intents.join(", ")}), order_id, urgent.`, frac("p2", 0.55));
    const b4 = band(526, 132, "EXAMPLE", C.green, `Message: "I want to send back order A-1001."\nReply: {"intent": "return", "order_id": "A-1001", "urgent": false}`, at("p3", 0.5));
    fadeOut(tip, at("p2", 0), 0.3);

    // the reply as JSON with fixed fields
    const pretty = s => JSON.stringify(JSON.parse(s), null, 2).split("\n");
    const rh = H(sc, "the reply (an example)", { anchor: "left", x: 880, y: 190, size: 22, color: C.dim });
    const good = codeBox(sc, pretty(N.reply_good), { x: 880, y: 215, size: 22, w: 600 });
    fadeIn(rh, at("p4", 0.3), 0.3, { dy: 0 });
    fadeIn(good.el, frac("p4", 0.45), 0.5);
    pulse(b3[0], frac("p4", 0.45), 1.02, 0.6);

    // checks in code
    function checks(rows, t) {
      return rows.map((c, i) => {
        const y = 492 + i * 46;
        const m = mark(sc, c.ok, 900, y);
        const f = H(sc, c.field, { anchor: "left", x: 930, y, size: 22, font: "mono", color: c.ok ? C.fg : C.red });
        const n = H(sc, c.note, { anchor: "left", x: 1080, y, size: 20, color: c.ok ? C.dim : C.red });
        fadeIn([m, f, n], t + i * 0.35, 0.3, { dx: -8, dy: 0 });
        return [m, f, n];
      }).flat();
    }
    const ch = H(sc, "your code checks each field", { anchor: "left", x: 880, y: 450, size: 22, color: C.dim });
    fadeIn(ch, at("p5", 0.3), 0.3, { dy: 0 });
    const okRows = checks(N.check_good, frac("p5", 0.45));

    // a reply that fails the check
    const bad = codeBox(sc, pretty(N.reply_bad), { x: 880, y: 215, size: 22, w: 600 });
    fadeOut([good.el, ...okRows], at("p6", 0), 0.4);
    fadeIn(bad.el, at("p6", 0.3), 0.4);
    const badRows = checks(N.check_bad, at("p6", 0.6));
    const back = arrow(sc, 872, 700, 812, 650, C.red, 4, 16);
    const backL = H(sc, "send the error back · ask again", { anchor: "left", x: 884, y: 712, size: 22, color: C.red, weight: 600 });
    drawArrow(back, frac("p6", 0.7), 0.4);
    fadeIn(backL, frac("p6", 0.72), 0.4, { dy: 0 });
    void b1; void b2; void b4; void badRows;
  }

  /* ---------------------------------------------------------------- 3 RAG */
  function rag(sc, N) {
    title(sc, "RAG: your own data", "r1");
    const td = box(sc, 260, 430, 280, 110, C.dim, "training data", { size: 28, sub: "text up to a date" });
    const llm = box(sc, 720, 430, 220, 110, C.purple, "LLM", { size: 38 });
    const a = arrow(sc, 404, 430, 604, 430, C.dim, 4, 16);
    const docs = box(sc, 1220, 340, 380, 90, C.orange, "your documents", { size: 28, fill: 0.04 });
    const news = box(sc, 1220, 520, 380, 90, C.orange, "the news of today", { size: 28, fill: 0.04 });
    const q1 = H(sc, "?", { x: 1440, y: 340, size: 44, color: C.red, weight: 700 });
    const q2 = H(sc, "?", { x: 1440, y: 520, size: 44, color: C.red, weight: 700 });
    const nk = H(sc, "not in the training data", { x: 1220, y: 640, size: 24, color: C.red });
    fadeIn(td.els, at("r1", 0.4), 0.4, { dy: 0 });
    drawArrow(a, at("r1", 0.8), 0.5);
    fadeIn(llm.els, at("r1", 1.1), 0.4, { dy: 0 });
    fadeIn([...docs.els, ...news.els], frac("r1", 0.5), 0.4, { stagger: 0.15 });
    fadeIn([q1, q2, nk], frac("r1", 0.7), 0.4);
    fadeOut([...td.els, ...llm.els, a.line, a.tip, ...docs.els, ...news.els, q1, q2, nk], at("r2", 0), 0.5);

    // R A G
    const parts = [["R", "retrieval", "find the right chunks", C.blue], ["A", "augmented", "add them to the prompt", C.teal], ["G", "generation", "the model writes the answer", C.yellow]];
    const rag3 = parts.map(([L, word, mean, col], i) => {
      const x = 400 + i * 400;
      const big = H(sc, L, { x, y: 330, size: 120, color: col, weight: 700, font: "serif" });
      const w = H(sc, word, { x, y: 450, size: 34, color: col, weight: 600 });
      const m = H(sc, mean, { x, y: 505, size: 24, color: C.dim });
      write(big, at("r2", 0.3 + i * 0.25), 0.4);
      fadeIn(w, frac("r2", 0.55) + i * 0.35, 0.4, { dy: 0 });
      fadeIn(m, frac("r2", 0.6) + i * 0.35, 0.4, { dy: 0 });
      return [big, w, m];
    }).flat();
    fadeOut(rag3, at("r3", 0), 0.5);

    // chunks and their vectors
    const ROW = i => 250 + i * 64, CX = 600, CW = 30, CG = 5;
    const vmax = Math.max(...N.vecs.flat(), ...N.qvec);
    const chunkEls = N.chunks.map((c, i) => {
      const r = rect(sc, 110, ROW(i) - 25, 420, 50, C.blue, { rx: 8 });
      const t = H(sc, c.title, { anchor: "left", x: 130, y: ROW(i), size: 22, weight: 600 });
      const ex = H(sc, c.text.slice(0, 26) + "…", { anchor: "left", x: 270, y: ROW(i), size: 16, color: C.dim });
      return { r, t, ex };
    });
    const cells = N.vecs.map((row, i) => row.map((v, j) => {
      const c = S(sc.svg, "rect", { x: CX + j * (CW + CG), y: ROW(i) - CW / 2, width: CW, height: CW, rx: 3 },
        { fill: v > 0 ? hexA(C.blue, 0.2 + 0.8 * v / vmax) : C.faint });
      hide(c);
      return c;
    }));
    const terms = N.terms.map((t, j) => {
      const x = CX + j * (CW + CG) + CW / 2;
      const e = T(sc.svg, t, x, 212, { anchor: "start", size: 17, color: C.dim });
      e.setAttribute("transform", `rotate(-50 ${x} 212)`);
      hide(e);
      return e;
    });
    const docL = H(sc, "the shop help pages, split into chunks", { anchor: "left", x: 110, y: 170, size: 22, color: C.dim });
    fadeIn(docL, at("r3", 0.3), 0.4, { dy: 0 });
    chunkEls.forEach((c, i) => { show(c.r, at("r3", 0.5 + i * 0.18), 0.3); fadeIn([c.t, c.ex], at("r3", 0.55 + i * 0.18), 0.3, { dy: 0 }); });
    tl.to(terms, { autoAlpha: 1, duration: 0.3, stagger: 0.04 }, frac("r3", 0.55));
    cells.forEach((row, i) => tl.to(row, { autoAlpha: 1, duration: 0.15, stagger: 0.02 }, frac("r3", 0.6) + i * 0.15));
    const vl = H(sc, "one number for each word", { anchor: "left", x: CX, y: ROW(5) + 50, size: 20, color: C.dim });
    fadeIn(vl, frac("r3", 0.8), 0.4, { dy: 0 });

    // the question as a vector
    const QY = 700;
    const qc = chip(sc, N.question, C.yellow, { x: 330, y: QY, size: 20 });
    const qcells = N.qvec.map((v, j) => {
      const c = S(sc.svg, "rect", { x: CX + j * (CW + CG), y: QY - CW / 2, width: CW, height: CW, rx: 3 },
        { fill: v > 0 ? hexA(C.yellow, 0.25 + 0.75 * v / vmax) : C.faint });
      hide(c);
      return c;
    });
    const bands = N.qvec.map((v, j) => {
      if (!(v > 0)) return null;
      const b = S(sc.svg, "rect", { x: CX + j * (CW + CG) - 3, y: ROW(0) - 24, width: CW + 6, height: QY - ROW(0) + 40, rx: 6 }, { fill: "none", stroke: C.yellow, strokeWidth: 2 });
      hide(b);
      return b;
    }).filter(Boolean);
    fadeOut(vl, at("r4", 0), 0.3);
    fadeIn(qc, at("r4", 0.3), 0.4, { dx: -10, dy: 0 });
    tl.to(qcells, { autoAlpha: 1, duration: 0.15, stagger: 0.03 }, frac("r4", 0.45));
    tl.to(bands, { autoAlpha: 1, duration: 0.4 }, frac("r4", 0.7));

    // cosine similarity
    const BX = 1060, BW = 360 / Math.max(...N.scores);
    const sh = H(sc, "cosine similarity", { anchor: "left", x: BX, y: 205, size: 22, color: C.dim });
    fadeIn(sh, at("r5", 0.3), 0.4, { dy: 0 });
    const scoreEls = N.scores.map((s, i) => {
      const w = Math.max(3, s * BW);
      const b = S(sc.svg, "rect", { x: BX, y: ROW(i) - 14, width: w, height: 28, rx: 4 }, { fill: N.top.includes(i) ? C.yellow : C.grid });
      gsap.set(b, { scaleX: 0, transformOrigin: "0% 50%" });
      const v = H(sc, s.toFixed(2), { anchor: "left", x: BX + w + 12, y: ROW(i), size: 22, font: "mono", color: N.top.includes(i) && s > 0 ? C.yellow : C.dim });
      tl.to(b, { scaleX: 1, duration: 0.6, ease: "power2.out" }, frac("r5", 0.4) + i * 0.12);
      fadeIn(v, frac("r5", 0.4) + i * 0.12 + 0.4, 0.3, { dy: 0 });
      return [b, v];
    }).flat();
    N.top.forEach((i, r) => tl.to(chunkEls[i].r, { stroke: C.yellow, fill: hexA(C.yellow, 0.18), duration: 0.4 }, frac("r5", 0.8) + r * 0.2));
    const topL = H(sc, `best: ${N.top.map(i => N.chunks[i].title).join(", ")}`, { anchor: "left", x: BX, y: ROW(5) + 50, size: 22, color: C.yellow, weight: 600 });
    fadeIn(topL, frac("r5", 0.85), 0.4, { dy: 0 });

    // into the prompt
    const grid = [...cells.flat(), ...terms, ...qcells, ...bands, docL, qc, sh, ...scoreEls, topL,
      ...chunkEls.flatMap((c, i) => N.top.includes(i) ? [] : [c.r, c.t, c.ex])];
    fadeOut(grid, at("r6", 0), 0.5);
    N.top.forEach((i, r) => tl.to([chunkEls[i].r, chunkEls[i].t, chunkEls[i].ex], { y: ROW(r) - ROW(i), duration: 0.6, ease: "power2.inOut" }, at("r6", 0.3)));
    const pcard = rect(sc, 600, 160, 900, 420, C.fg, { fill: hexA(C.fg, 0.03), rx: 14 });
    const pl = H(sc, "prompt", { anchor: "left", x: 624, y: 190, size: 20, color: C.dim, font: "mono" });
    const ptext = para(sc, N.prompt, 624, 220, 850, { size: 19 });
    const pa = arrow(sc, 540, (ROW(0) + ROW(1)) / 2, 590, (ROW(0) + ROW(1)) / 2, C.yellow, 4, 14);
    show(pcard, at("r6", 0.8), 0.4);
    fadeIn(pl, at("r6", 0.9), 0.3, { dy: 0 });
    drawArrow(pa, at("r6", 1.0), 0.4);
    fadeIn(ptext, frac("r6", 0.45), 0.6, { dy: 0 });

    // the answer comes from your data
    const best = N.chunks[N.top[0]];
    const fact = best.text.split(". ").find(s => s.toLowerCase().includes(N.question.toLowerCase().split(" ").find(w => w.length > 5) || "")) || best.text;
    const acard = rect(sc, 600, 610, 900, 110, C.green, { rx: 14 });
    const al = H(sc, `the answer, with its source: [${best.title}]`, { anchor: "left", x: 624, y: 640, size: 20, color: C.green, weight: 600 });
    const at2 = H(sc, `“${fact.replace(/\.$/, "")}.”`, { anchor: "left", x: 624, y: 682, size: 22, color: C.fg });
    show(acard, at("r7", 0.3), 0.4);
    fadeIn([al, at2], at("r7", 0.5), 0.4, { dy: 0, stagger: 0.2 });
  }

  /* ---------------------------------------------------------------- 4 tools and agents */
  function tools(sc, N) {
    title(sc, "Tools and agents", "t1");
    const m0 = box(sc, 800, 330, 260, 110, C.purple, "model", { size: 36, sub: "writes text only" });
    fadeIn(m0.els, at("t1", 0.4), 0.4, { dy: 0 });
    const acts = ["look up an order", "send an email", "run a search"].map(t => chip(sc, t, C.orange, { y: 560, size: 24 }));
    rowLayout(acts, 800, 30);
    const al = H(sc, "tools: functions that your code runs", { x: 800, y: 640, size: 24, color: C.orange });
    fadeIn(acts, frac("t1", 0.55), 0.4, { stagger: 0.15 });
    fadeIn(al, frac("t1", 0.7), 0.4);
    fadeOut([...m0.els, ...acts, al], at("t2", 0), 0.4);

    // the tool definition
    const props = JSON.parse(N.tool.schema);
    const pk = Object.keys(props)[0];
    const desc = N.tool.description;
    const cut = desc.lastIndexOf(" ", 46);
    const lines = [
      "{",
      `  "name": "${N.tool.name}",`,
      `  "description": "${desc.slice(0, cut)}`,
      `                  ${desc.slice(cut + 1)}",`,
      `  "input_schema": {"type": "object",`,
      `    "properties": {"${pk}": {"type": "${props[pk].type}"}}}`,
      "}",
    ];
    const cb = codeBox(sc, lines, { x: 110, y: 150, size: 21 });
    cb.rows.forEach((row, i) => { row.textContent = lines[i]; });   // JSON: no Python colors
    const rowY = i => 150 + 19 + 21 * 1.45 * (i + 0.5);
    fadeIn(cb.el, at("t2", 0.3), 0.5);
    const tags = [["name", 1, C.yellow, 0.3], ["description", 2.5, C.teal, 0.5], ["JSON schema for the input", 4.5, C.orange, 0.7]].map(([t, r, col, f]) => {
      const e = H(sc, t, { anchor: "left", x: 1110, y: rowY(r), size: 24, color: col, weight: 600 });
      fadeIn(e, frac("t2", f), 0.4, { dx: -10, dy: 0 });
      return e;
    });
    tl.to(cb.el, { opacity: 0.35, duration: 0.4 }, at("t3", 0));
    fadeOut(tags, at("t3", 0), 0.4);

    // the loop: model <-> your code <-> tool
    const M = box(sc, 300, 640, 280, 110, C.purple, "model", { size: 34 });
    const Y = box(sc, 1300, 640, 280, 110, C.blue, "your code", { size: 34 });
    const Tb = box(sc, 1300, 830, 330, 64, C.orange, N.tool.name, { size: 24, font: "mono" });
    const aUse = arrow(sc, 445, 612, 1155, 612, C.yellow, 4, 16);
    const aRes = arrow(sc, 1155, 668, 445, 668, C.green, 4, 16);
    const useL = H(sc, `tool call: ${N.tool.name}({"${pk}": "${N.order_id}"})`, { x: 800, y: 582, size: 21, font: "mono", color: C.yellow });
    const resL = H(sc, `tool result: ${JSON.stringify(N.order)}`, { x: 800, y: 700, size: 21, font: "mono", color: C.green });
    const aDown = arrow(sc, 1300, 698, 1300, 792, C.dim, 3, 12);
    fadeIn(M.els, at("t3", 0.3), 0.4, { dy: 0 });
    fadeIn(Y.els, at("t3", 0.5), 0.4, { dy: 0 });
    drawArrow(aUse, frac("t3", 0.55), 0.7);
    fadeIn(useL, frac("t3", 0.62), 0.4, { dy: 0 });
    drawArrow(aDown, at("t4", 0.2), 0.4);
    fadeIn(Tb.els, at("t4", 0.5), 0.4, { dy: 0 });
    pulse(Tb.r, at("t4", 1.0), 1.06, 0.5);
    drawArrow(aRes, frac("t4", 0.35), 0.7);
    fadeIn(resL, frac("t4", 0.42), 0.4, { dy: 0 });
    const fin = chip(sc, "final answer", C.green, { x: 300, y: 790, size: 24 });
    const fa = arrow(sc, 300, 697, 300, 765, C.green, 3, 12);
    const again = H(sc, "or another tool call", { anchor: "left", x: 460, y: 760, size: 20, color: C.dim });
    drawArrow(fa, frac("t4", 0.72), 0.3);
    fadeIn(fin, frac("t4", 0.76), 0.3, { dy: 0 });
    fadeIn(again, frac("t4", 0.8), 0.3, { dy: 0 });

    // this loop is an agent
    const ring = S(sc.svg, "rect", { x: 140, y: 540, width: 1320, height: 200, rx: 40 }, { fill: "none", stroke: C.yellow, strokeWidth: 3 });
    hide(ring);
    const agent = H(sc, "the loop = an agent", { anchor: "left", x: 168, y: 520, size: 28, color: C.yellow, weight: 700 });
    draw(ring, at("t5", 0.3), 1.0);
    fadeIn(agent, at("t5", 0.6), 0.4, { dy: 0 });
    const who = H(sc, "the model chooses the steps · your code does the work", { x: 800, y: 465, size: 24, color: C.fg });
    fadeIn(who, frac("t5", 0.45), 0.4);
    tl.to(cb.el, { opacity: 0, duration: 0.3 }, frac("t5", 0.4));

    // MCP
    const loop = [...M.els, ...Y.els, ...Tb.els, aUse.line, aUse.tip, aRes.line, aRes.tip, useL, resL, aDown.line, aDown.tip, fin, fa.line, fa.tip, again, ring, agent, who, cb.el];
    fadeOut(loop, at("t6", 0), 0.5);
    const srv = box(sc, 1180, 480, 360, 130, C.orange, "MCP server", { size: 32, sub: "order database" });
    const apps = ["chat app", "code editor", "your agent"].map((t, i) => box(sc, 380, 300 + i * 180, 280, 80, C.blue, t, { size: 26 }));
    const links = apps.map(a2 => { const l = S(sc.svg, "line", { x1: a2.rt + 8, y1: a2.cy, x2: srv.l - 8, y2: srv.cy }, { stroke: C.orange, strokeWidth: 3 }); hide(l); return l; });
    const std = H(sc, "MCP: an open standard between applications and tools or data", { x: 800, y: 175, size: 26, color: C.orange });
    const one = H(sc, "one server, many applications", { x: 1180, y: 600, size: 22, color: C.dim });
    fadeIn(std, at("t6", 0.3), 0.4);
    fadeIn(srv.els, at("t6", 0.8), 0.4, { dy: 0 });
    apps.forEach((a2, i) => { fadeIn(a2.els, frac("t6", 0.5) + i * 0.25, 0.4, { dx: -10, dy: 0 }); draw(links[i], frac("t6", 0.55) + i * 0.25, 0.5); });
    fadeIn(one, frac("t6", 0.85), 0.4, { dy: 0 });
  }

  /* ---------------------------------------------------------------- 5 evals */
  function evals(sc, N) {
    title(sc, "Evals", "e1");
    const v1 = chip(sc, "prompt v1", C.dim, { x: 560, y: 300, size: 30 });
    const v2 = chip(sc, "prompt v2", C.blue, { x: 1040, y: 300, size: 30 });
    const va = arrow(sc, 680, 300, 915, 300, C.dim, 4, 16);
    const q = H(sc, "better?", { x: 800, y: 395, size: 40, color: C.yellow, weight: 700 });
    fadeIn(v1, at("e1", 0.4), 0.4);
    drawArrow(va, at("e1", 0.9), 0.4);
    fadeIn(v2, at("e1", 1.2), 0.4);
    fadeIn(q, frac("e1", 0.5), 0.4);
    const need = H(sc, "a measurement, not a feeling", { x: 800, y: 460, size: 26, color: C.dim });
    fadeIn(need, frac("e1", 0.75), 0.4);
    fadeOut([v1, v2, va.line, va.tip, q, need], at("e2", 0), 0.4);

    // the test set
    const RY = i => 230 + i * 58, QX = 120, EX = 860, RX = 1180;
    const heads = [["test question", QX], ["expected in the answer", EX], ["result", RX]].map(([t, x]) => H(sc, t, { anchor: "left", x, y: 175, size: 20, color: C.dim, font: "mono" }));
    const rule = S(sc.svg, "line", { x1: 110, y1: 197, x2: 1490, y2: 197 }, { stroke: C.grid, strokeWidth: 2 });
    hide(rule);
    fadeIn(heads, at("e2", 0.3), 0.4, { dy: 0 });
    show(rule, at("e2", 0.3), 0.4);
    const rows = N.evals.map((c, i) => {
      const qx = H(sc, c.question, { anchor: "left", x: QX, y: RY(i), size: 22 });
      const ex = H(sc, c.expected, { anchor: "left", x: EX, y: RY(i), size: 22, font: "mono", color: C.teal });
      fadeIn([qx, ex], at("e2", 0.6) + i * 0.3, 0.3, { dy: 0 });
      return { qx, ex };
    });

    // the script runs every case
    const scan = S(sc.svg, "rect", { x: 110, y: RY(0) - 26, width: 1380, height: 52, rx: 8 }, { fill: hexA(C.yellow, 0.12), stroke: "none" });
    hide(scan);
    const score = H(sc, "", { x: 800, y: 620, size: 34, font: "mono", weight: 600 });
    counter(score, at("e3", 0), 0, 0, 0.01, () => `score 0 / ${N.total}`);
    show(scan, at("e3", 0.3), 0.2);
    show(score, at("e3", 0.3), 0.3);
    const step = (dur("e3") * 0.8) / N.evals.length;
    let passed = 0;
    const results = N.evals.map((c, i) => {
      const t = at("e3", 0.4) + i * step;
      if (i > 0) tl.to(scan, { attr: { y: RY(i) - 26 }, duration: step * 0.4, ease: "power1.inOut" }, t - step * 0.4);
      const res = chip(sc, c.passed ? "PASS" : "FAIL", c.passed ? C.green : C.red, { x: RX + 40, y: RY(i), size: 20, font: "mono" });
      const src = H(sc, `chunk: ${c.source}`, { anchor: "left", x: RX + 100, y: RY(i), size: 18, color: C.dim });
      fadeIn([res, src], t, 0.25, { dy: 0 });
      if (c.passed) passed += 1;
      swapText(score, t + 0.1, `score ${passed} / ${N.total}`);
      return { res, src };
    });
    fadeOut(scan, end("e3", -0.2), 0.3);
    const run = H(sc, "run it after each change", { x: 800, y: 675, size: 24, color: C.dim });
    fadeIn(run, frac("e3", 0.85), 0.4);

    // the same idea as the validation set
    const ep2 = H(sc, "episode 2: validation set   =   here: eval set", { x: 800, y: 740, size: 26, color: LEVEL_COLOR.Base });
    fadeIn(ep2, at("e4", 0.4), 0.5);
    fadeOut(run, at("e4", 0), 0.3);

    // the failed case
    const fi = N.evals.findIndex(c => !c.passed), f = N.evals[fi];
    const box1 = S(sc.svg, "rect", { x: 106, y: RY(fi) - 27, width: 1388, height: 54, rx: 8 }, { fill: "none", stroke: C.red, strokeWidth: 3 });
    hide(box1);
    draw(box1, at("e5", 0.3), 0.6);
    tl.to([...rows.filter((_, i) => i !== fi).flatMap(r => [r.qx, r.ex]), ...results.filter((_, i) => i !== fi).flatMap(r => [r.res, r.src])], { opacity: 0.3, duration: 0.4 }, at("e5", 0.3));
    const why = H(sc, `the question says "fix"; the right chunk says "repairs"; the search used "${f.source}"`, { x: 800, y: 810, size: 24, color: C.red });
    fadeIn(why, frac("e5", 0.3), 0.4);
    const next = H(sc, "what to fix next: better vectors (embeddings)", { x: 800, y: 860, size: 24, color: C.yellow });
    fadeIn(next, frac("e5", 0.72), 0.4);

    // the series, from episode 1 to episode 7
    const table = [...heads, rule, ...rows.flatMap(r => [r.qx, r.ex]), ...results.flatMap(r => [r.res, r.src]), box1, score, ep2, why, next];
    fadeOut(table, at("e6", 0), 0.5);
    const lines = ["a line, a loss, gradient descent", "measure on new data", "classes and metrics", "neural networks",
      "models in production", "inside an LLM", "build on top of an LLM"];
    const cards = DATA.series.slice(0, 7).map((s, i) => {      // the core course; the deep dives are teased below
      const cx = 800 + (i - 3) * 216, col = LEVEL_COLOR[s.level];
      const r = S(sc.svg, "rect", { x: cx - 100, y: 300, width: 200, height: 136, rx: 12 }, { fill: hexA(col, 0.08), stroke: col, strokeWidth: 2.5 });
      hide(r);
      const n = H(sc, `Episode ${s.n}`, { x: cx, y: 330, size: 18, color: C.dim, font: "mono" });
      const t = H(sc, s.title, { x: cx, y: 386, size: 24, weight: 600, wrap: 180 });
      const d = H(sc, lines[i], { x: cx, y: 500, size: 20, color: col, wrap: 190 });
      return { r, n, t, d, col };
    });
    cards.forEach((c, i) => fadeIn([c.r, c.n, c.t], at("e6", 0.4 + i * 0.12), 0.4, { dy: 10 }));
    fadeIn(cards[0].d, frac("e6", 0.55), 0.4);
    const t7 = at("e7", 0.3), step7 = dur("e7") * 0.7 / 5;
    for (let i = 1; i < 6; i++) fadeIn(cards[i].d, t7 + (i - 1) * step7, 0.4);
    fadeIn(cards[6].d, frac("e7", 0.85), 0.4);
    tl.to(cards[6].r, { fill: hexA(C.yellow, 0.2), duration: 0.5 }, frac("e7", 0.85));

    // the next episodes (the deep dives): two rows when there are more than four
    const dd = LEVEL_COLOR["Deep dive"];
    const deep = DATA.series.slice(7), nd = deep.length;
    const words = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight"];
    const nextH = H(sc, `Next: ${words[nd] || nd} deep dives`, { x: 800, y: 640, size: 26, color: dd, weight: 600 });
    const per = nd > 4 ? Math.ceil(nd / 2) : nd, GAP = 430;
    const nextEps = deep.map((s, i) => {
      const row = Math.floor(i / per), inRow = row === 0 ? per : nd - per, k = i - row * per;
      return chip(sc, `${s.n} · ${s.title}`, dd, { x: 800 + (k - (inRow - 1) / 2) * GAP, y: 712 + row * 56, size: 20 });
    });
    fadeIn(nextH, at("e8", 0.2), 0.4);
    fadeIn(nextEps, at("e8", 0.5), 0.4, { stagger: 0.3 });
  }

  return { api, prompt, rag, tools, evals };
})();
