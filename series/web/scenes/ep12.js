/* Episode 12 - Advanced RAG and evals. Contract: OUTLINE.md. N = episodes/ep12.py nums(). */
SCENES_BY_EP.ep12 = (() => {
  const BM = C.blue, DN = C.purple, FU = C.teal, RR = C.orange, OK = C.green, BAD = C.red;
  const hide = els => gsap.set(els, { autoAlpha: 0 });
  const flat = a => a.flat(Infinity);
  const cut = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
  const nth = n => (n % 100 >= 11 && n % 100 <= 13 ? n + "th" : n + (["th", "st", "nd", "rd"][n % 10] || "th"));
  function title(sc, text, key) {
    const e = H(sc, text, { y: 78, size: 56, font: "serif", weight: 600 });
    write(e, at(key, 0.1), 1.0);
    return e;
  }
  /* a plain rectangle (top-left x, y), hidden until shown */
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
    const c = S(sc.svg, "circle", { cx: x, cy: y, r }, { fill: o.fill === undefined ? hexA(color, 0.15) : o.fill, stroke: color, strokeWidth: o.sw || 3 });
    hide(c);
    return c;
  }
  /* a text block that wraps at width w; top-left at (x, y) */
  function para(sc, text, x, y, w, o = {}) {
    const e = H(sc, text, { anchor: "left", x, y, size: o.size || 20, color: o.color || C.fg, font: o.font || "body", wrap: w, align: "left", weight: o.weight });
    e.style.whiteSpace = "pre-wrap";
    e.style.lineHeight = "1.35";
    gsap.set(e, { yPercent: 0 });
    return e;
  }
  const mark = (sc, ok, x, y, size = 28) => H(sc, ok ? "✓" : "✗", { x, y, size, color: ok ? OK : BAD, weight: 700 });
  /* a bar that grows from the left */
  function bar(sc, x, y, w, h, color) {
    const b = S(sc.svg, "rect", { x, y: y - h / 2, width: Math.max(w, 2), height: h, rx: 5 }, { fill: color });
    gsap.set(b, { scaleX: 0, transformOrigin: "0% 50%", autoAlpha: 0 });
    return b;
  }
  const growBar = (b, t, d = 0.6) => tl.to(b, { scaleX: 1, autoAlpha: 1, duration: d, ease: "power2.out" }, t);
  const fmt = (v, n = 3) => v.toFixed(n);

  /* ---------------------------------------------------------------- 1 where basic RAG fails */
  function fail(sc, N) {
    title(sc, "Where basic RAG fails", "f1");
    const F = N.fix;

    // f1: the pipeline of episode 7
    const stages = ["handbook", "split", "search", "top 3", "prompt", "answer"];
    const SX = i => 175 + i * 250, SY = 235;
    const cap = H(sc, "episode 7: basic RAG", { x: 800, y: 160, size: 26, color: C.dim });
    const boxes = stages.map((s, i) => box(sc, SX(i), SY, 190, 70, i === 0 ? C.dim : BM, s, { size: 28 }));
    const arrs = stages.slice(0, -1).map((_, i) => arrow(sc, SX(i) + 100, SY, SX(i + 1) - 100, SY, C.dim, 3, 12));
    fadeIn(cap, at("f1", 0.3), 0.4);
    boxes.forEach((b, i) => fadeIn(b.els, at("f1", 0.6) + i * 0.3, 0.4, { dy: 0 }));
    arrs.forEach((a, i) => drawArrow(a, at("f1", 0.8) + i * 0.3, 0.3));

    // f2: the question and the right chunk share no word
    const qLab = H(sc, "the question", { anchor: "left", x: 90, y: 380, size: 22, color: C.dim, font: "mono" });
    const cLab = H(sc, `the right chunk (${F.right_title} section)`, { anchor: "left", x: 90, y: 640, size: 22, color: C.dim, font: "mono" });
    const cChips = F.c_words.map(w => chip(sc, w, FU, { x: 800, y: 590, size: 20, font: "mono" }));
    const cx = rowLayout(cChips, 800, 10);
    const qChips = F.pairs.map(([qw, cw]) => {
      const x = cx[F.c_words.indexOf(cw)];
      return chip(sc, qw, BM, { x, y: 430, size: 26, font: "mono" });
    });
    const links = F.pairs.map(([qw, cw]) => {
      const x = cx[F.c_words.indexOf(cw)];
      return { l: line(sc, x, 458, x, 560, BAD, 3, "7 6"), ne: H(sc, "≠", { x: x + 22, y: 509, size: 28, color: BAD, weight: 700 }) };
    });
    const score = H(sc, `TF-IDF score of the right chunk: ${fmt(F.tfidf_score)}`, { x: 800, y: 710, size: 34, color: BAD, font: "mono", weight: 600 });
    const noShare = H(sc, "no shared word, so the chunk never reaches the top", { x: 800, y: 765, size: 24, color: C.dim });
    fadeIn([qLab, ...qChips], at("f2", 0.2), 0.4, { stagger: 0.12 });
    fadeIn([cLab, ...cChips], frac("f2", 0.3), 0.4, { stagger: 0.05 });
    links.forEach((k, i) => { show(k.l, frac("f2", 0.55) + i * 0.15, 0.3); fadeIn(k.ne, frac("f2", 0.55) + i * 0.15 + 0.1, 0.3, { dy: 0 }); });
    fadeIn(score, frac("f2", 0.78), 0.4);
    fadeIn(noShare, frac("f2", 0.88), 0.4);
    fadeOut([qLab, ...qChips, cLab, ...cChips, ...links.flatMap(k => [k.l, k.ne]), score, noShare], at("f3", 0), 0.4);

    // f3: three places to fail
    const spots = [
      { i: 1, txt: "the split cuts a fact in two", f: 0.28 },
      { i: 2, txt: "the search misses the right chunk", f: 0.52 },
      { i: 3, txt: "the right chunk ranks too low", f: 0.78 },
    ];
    spots.forEach((s, k) => {
      const x = SX(s.i);
      const c = circle(sc, x, 340, 22, BAD, { fill: hexA(BAD, 0.2) });
      const n = H(sc, String(k + 1), { x, y: 340, size: 26, color: BAD, weight: 700 });
      const t = H(sc, s.txt, { x, y: 420, size: 24, color: BAD, wrap: 230 });
      const st = line(sc, x, 272, x, 316, BAD, 3);
      show([c, st], frac("f3", s.f), 0.3);
      fadeIn([n, t], frac("f3", s.f) + 0.1, 0.4);
    });

    // f4: the fourth failure: nobody measures
    const x0 = SX(0) - 100, x1 = SX(5) + 100;
    const brk = S(sc.svg, "path", { d: `M${x0},520 L${x0},536 L${x1},536 L${x1},520` }, { fill: "none", stroke: BAD, strokeWidth: 3 });
    hide(brk);
    const c4 = circle(sc, 800, 600, 24, BAD, { fill: hexA(BAD, 0.2) });
    const n4 = H(sc, "4", { x: 800, y: 600, size: 28, color: BAD, weight: 700 });
    const t4 = H(sc, "nobody measures it", { x: 800, y: 665, size: 30, color: BAD, weight: 600 });
    draw(brk, at("f4", 0.2), 0.7);
    show(c4, at("f4", 0.6), 0.3);
    fadeIn([n4, t4], at("f4", 0.7), 0.4);
    const foot = H(sc, `One small hand-written handbook: ${N.corpus.chunks} paragraphs, ${N.corpus.questions} test questions. Every number in this episode comes from it.`,
      { x: 800, y: 790, size: 22, color: C.dim });
    fadeIn(foot, at("f4", 1.6), 0.5);
  }

  /* ---------------------------------------------------------------- 2 chunks */
  function chunk(sc, N) {
    title(sc, "Chunks", "c1");
    const K = N.cut, nq = N.corpus.questions;
    const s40 = N.splits.find(s => s.name === "fixed 40 words");

    // c1: a fixed split cuts an answer in two
    const hdr = H(sc, "a fixed split: a new chunk every 40 words", { x: 800, y: 160, size: 26, color: C.dim });
    const rA = rect(sc, 80, 200, 690, 230, BM), rB = rect(sc, 830, 200, 690, 230, BM);
    const lA = H(sc, `chunk ${K.index + 1}`, { anchor: "left", x: 104, y: 228, size: 20, color: BM, font: "mono" });
    const lB = H(sc, `chunk ${K.index + 2}`, { anchor: "left", x: 854, y: 228, size: 20, color: BM, font: "mono" });
    const tA = para(sc, K.a, 104, 252, 640, { size: 25, color: C.dim });
    const tB = para(sc, K.b, 854, 252, 640, { size: 25, color: C.dim });
    const ans1 = H(sc, K.first, { anchor: "right", x: 784, y: 540, size: 40, color: C.yellow, font: "mono", weight: 600 });
    const ans2 = H(sc, K.second, { anchor: "left", x: 816, y: 540, size: 40, color: C.yellow, font: "mono", weight: 600 });
    const cutL = line(sc, 800, 490, 800, 590, BAD, 5);
    const scissors = H(sc, "cut", { x: 800, y: 462, size: 22, color: BAD, font: "mono", weight: 600 });
    const q = H(sc, `question: ${K.question}`, { x: 800, y: 640, size: 26, color: C.dim });
    fadeIn(hdr, at("c1", 0.3), 0.4);
    show(rA, frac("c1", 0.12), 0.4); fadeIn([lA, tA], frac("c1", 0.12) + 0.1, 0.5);
    show(rB, frac("c1", 0.28), 0.4); fadeIn([lB, tB], frac("c1", 0.28) + 0.1, 0.5);
    fadeIn([ans1, ans2], frac("c1", 0.55), 0.5);
    draw(cutL, frac("c1", 0.66), 0.4);
    fadeIn(scissors, frac("c1", 0.7), 0.3, { dy: 0 });
    fadeIn(q, frac("c1", 0.82), 0.4);

    // c2: no chunk holds the whole fact
    const no = H(sc, "no chunk holds the whole fact", { x: 800, y: 710, size: 34, color: BAD, weight: 600 });
    const cutN = H(sc, `${nq - s40.whole} of ${nq} answers are cut like this at 40 words`, { x: 800, y: 770, size: 28, color: BAD, font: "mono" });
    fadeIn(no, at("c2", 0.4), 0.4);
    fadeIn(cutN, frac("c2", 0.55), 0.5);
    fadeOut([hdr, rA, rB, lA, lB, tA, tB, ans1, ans2, cutL, scissors, q, no, cutN], at("c3", 0), 0.5);

    // c3, c4: the table of splits
    const rows = N.splits.map(s => ({ ...s, fix: s.name.includes("overlap") || s.name.startsWith("by ") }));
    const para0 = N.splits.find(s => s.name === "by paragraph");
    rows.push({ name: "paragraph + title line", chunks: para0.chunks, whole: nq, top3: N.title.titled.top3, words: N.title.titled.words, fix: true });
    const maxWords = Math.max(...rows.map(r => r.words));
    const RY = i => 245 + i * 66;
    const heads = [["split", 90, "left"], ["chunks", 560, "middle"], ["answer whole in one chunk", 850, "middle"],
      ["in the top 3", 1150, "middle"], ["words in top 3", 1362, "middle"]]
      .map(([t, x, a]) => H(sc, t, { anchor: a === "left" ? "left" : undefined, x, y: 175, size: 20, color: C.dim, font: "mono" }));
    const rule = line(sc, 80, 200, 1520, 200, C.grid, 2);
    fadeIn(heads, at("c3", 0.2), 0.4, { dy: 0 });
    show(rule, at("c3", 0.2), 0.4);
    const trs = rows.map((r, i) => {
      const y = RY(i), col = r.fix ? FU : C.fg;
      const nm = H(sc, r.name, { anchor: "left", x: 90, y, size: 25, color: col, weight: r.fix ? 600 : 400 });
      const ch = H(sc, String(r.chunks), { x: 560, y, size: 24, color: C.dim, font: "mono" });
      const wb = bar(sc, 720, y, 260 * r.whole / nq, 26, r.whole === nq ? OK : C.yellow);
      const wl = H(sc, `${r.whole}/${nq}`, { anchor: "left", x: 720 + 260 * r.whole / nq + 12, y, size: 24, color: r.whole === nq ? OK : C.yellow, font: "mono", weight: 600 });
      const t3 = H(sc, `${r.top3}/${nq}`, { x: 1150, y, size: 24, font: "mono", color: C.fg });
      const pb = bar(sc, 1262, y, 200 * r.words / maxWords, 26, RR);
      const pl = H(sc, String(r.words), { anchor: "left", x: 1262 + 200 * r.words / maxWords + 10, y, size: 24, color: RR, font: "mono", weight: 600 });
      return { nm, ch, wb, wl, t3, pb, pl, els: [nm, ch, wl, t3, pl] };
    });
    const showRow = (i, t) => {
      const r = trs[i];
      fadeIn(r.els, t, 0.4, { dy: 0 });
      growBar(r.wb, t + 0.1); growBar(r.pb, t + 0.2);
    };
    [0, 1, 2, 3].forEach((i, k) => showRow(i, frac("c3", [0.1, 0.28, 0.46, 0.64][k])));
    const s160 = N.splits.find(s => s.name === "fixed 160 words");
    const note = H(sc, `${s160.words} of the ${N.handbook_words} words in the handbook`, { x: 800, y: 810, size: 26, color: RR });
    fadeIn(note, frac("c3", 0.8), 0.4);
    pulse(trs[3].pl, frac("c3", 0.8), 1.25, 0.6);
    fadeOut(note, at("c4", 0.1), 0.4);
    [4, 5, 6].forEach((i, k) => showRow(i, frac("c4", [0.1, 0.27, 0.4][k])));
    showRow(7, frac("c4", 0.68));
    const foot = H(sc, `BM25 search, ${nq} questions, one small hand-written handbook. Counts are of ${nq} questions.`, { x: 800, y: 840, size: 20, color: C.dim });
    fadeIn(foot, at("c3", 1.0), 0.5);
    const frame = rect(sc, 70, RY(7) - 30, 1470, 60, FU, { fill: "none", sw: 3 });
    show(frame, frac("c4", 0.74), 0.4);
  }

  /* ---------------------------------------------------------------- 3 hybrid search */
  function hybrid(sc, N) {
    title(sc, "Hybrid search", "h1");
    const FS = N.fusion, F = N.fix, R = N.rewrite;

    // h1: two kinds of search
    const q = chip(sc, FS.question, C.fg, { x: 800, y: 190, size: 28 });
    const bB = box(sc, 430, 380, 560, 150, BM, "BM25", { size: 40, sub: "matches the exact words", subSize: 24 });
    const bD = box(sc, 1170, 380, 560, 150, DN, "dense search", { size: 40, sub: "links words with the same meaning", subSize: 24 });
    const a1 = arrow(sc, 720, 222, 530, 300, C.dim, 3, 12), a2 = arrow(sc, 880, 222, 1070, 300, C.dim, 3, 12);
    const nB = H(sc, "a chunk with the words of the question ranks high", { x: 430, y: 500, size: 22, color: C.dim, wrap: 520 });
    const sD = H(sc, "here: a stand-in. Latent semantic analysis, learned from these 42 paragraphs only", { x: 1170, y: 520, size: 22, color: DN, wrap: 520 });
    const rD = H(sc, "a real application: an embedding model", { x: 1170, y: 600, size: 24, color: OK, weight: 600 });
    fadeIn(q, at("h1", 0.2), 0.4);
    fadeIn(bB.els, at("h1", 1.8), 0.5, { dy: 0 }); drawArrow(a1, at("h1", 1.8), 0.4);
    fadeIn(nB, at("h1", 3.4), 0.4);
    fadeIn(bD.els, frac("h1", 0.42), 0.5, { dy: 0 }); drawArrow(a2, frac("h1", 0.42), 0.4);
    fadeIn(sD, frac("h1", 0.68), 0.5);
    fadeIn(rD, frac("h1", 0.84), 0.5);
    fadeOut(flat([q, bB.els, bD.els, a1.line, a1.tip, a2.line, a2.tip, nB, sD, rD]), at("h2", 0), 0.4);

    // h2: reciprocal rank fusion
    const s1 = 1 / (60 + FS.pos.bm25), s2 = 1 / (60 + FS.pos.dense);
    const f1 = H(sc, "score of a chunk  =  1 / (60 + rank in list 1)  +  1 / (60 + rank in list 2)", { x: 800, y: 215, size: 30, color: FU, font: "mono", weight: 600 });
    const lines = [
      [`BM25 puts the right chunk ${nth(FS.pos.bm25)}:`, `1 / (60 + ${FS.pos.bm25}) = ${fmt(s1, 4)}`, BM, 360],
      [`dense search puts it ${nth(FS.pos.dense)}:`, `1 / (60 + ${FS.pos.dense}) = ${fmt(s2, 4)}`, DN, 450],
      ["RRF score of the chunk:", `${fmt(s1 + s2, 4)}`, FU, 560],
    ];
    const ls = lines.map(([a, b, col, y]) => [H(sc, a, { anchor: "left", x: 230, y, size: 28, color: col }), H(sc, b, { anchor: "left", x: 820, y, size: 30, color: col, font: "mono", weight: 600 })]);
    const sum = line(sc, 230, 508, 1250, 508, C.grid, 2);
    fadeIn(f1, at("h2", 1.6), 0.6);
    fadeIn(ls[0], frac("h2", 0.5), 0.4);
    fadeIn(ls[1], frac("h2", 0.66), 0.4);
    show(sum, frac("h2", 0.8), 0.3);
    fadeIn(ls[2], frac("h2", 0.84), 0.4);
    const eg = H(sc, `the question: ${FS.question}`, { x: 800, y: 660, size: 24, color: C.dim });
    fadeIn(eg, frac("h2", 0.45), 0.4);
    fadeOut(flat([f1, ls, sum, eg]), at("h3", 0), 0.4);

    // h3: the three lists for the same question
    const cols = [["BM25", BM, 330, FS.bm25, null, FS.pos.bm25], ["dense search", DN, 800, FS.dense, null, FS.pos.dense],
      ["after fusion", FU, 1270, FS.fused, true, FS.pos.fused]];
    const RY3 = i => 285 + i * 72;
    const stage3 = cols.map(([name, col, x, list, isFused, pos]) => {
      const head = H(sc, name, { x, y: 205, size: 30, color: col, weight: 600 });
      const cells = list.map((it, i) => {
        const right = it.id === FS.right;
        const r = rect(sc, x - 200, RY3(i) - 28, 400, 56, right ? OK : col, { fill: right ? hexA(OK, 0.18) : hexA(col, 0.06), sw: right ? 3.5 : 2 });
        const rk = H(sc, String(i + 1), { anchor: "left", x: x - 184, y: RY3(i), size: 20, color: C.dim, font: "mono" });
        const tx = H(sc, `${it.title}  #${it.id}`, { anchor: "left", x: x - 150, y: RY3(i), size: 24, color: right ? OK : C.fg, weight: right ? 600 : 400 });
        const sc2 = isFused ? H(sc, fmt(it.score, 4), { anchor: "right", x: x + 186, y: RY3(i), size: 20, color: C.dim, font: "mono" }) : null;
        return { r, els: [rk, tx, ...(sc2 ? [sc2] : [])], right };
      });
      const lab = H(sc, `right chunk: ${nth(pos)}`, { x, y: 690, size: 28, color: OK, weight: 600 });
      return { head, cells, lab };
    });
    [0.1, 0.38, 0.68].forEach((f, k) => {
      const s = stage3[k], t = frac("h3", f);
      fadeIn(s.head, t, 0.4);
      s.cells.forEach((c, i) => { show(c.r, t + 0.1 + i * 0.08, 0.3); fadeIn(c.els, t + 0.15 + i * 0.08, 0.3, { dy: 0 }); });
      fadeIn(s.lab, t + 0.6, 0.4);
    });
    fadeOut(flat(stage3.map(s => [s.head, s.lab, ...s.cells.flatMap(c => [c.r, ...c.els])])), at("h4", 0), 0.4);

    // h4: a weak search hurts (the fix question)
    const fq = H(sc, `question: ${F.question}`, { x: 800, y: 215, size: 30 });
    const fq2 = H(sc, `the right chunk is in the ${F.right_title} section`, { x: 800, y: 265, size: 24, color: C.dim });
    const X = r => 200 + (r - 1) / 29 * 1200, AY = 480;
    const axis = line(sc, 200, AY, 1400, AY, C.dim, 3);
    const ticks = [1, 5, 10, 15, 20, 25, 30].flatMap(r => [line(sc, X(r), AY - 8, X(r), AY + 8, C.dim, 2), H(sc, String(r), { x: X(r), y: AY + 32, size: 20, color: C.dim, font: "mono" })]);
    const axL = H(sc, "rank of the right chunk (1 = best)", { x: 800, y: AY + 80, size: 24, color: C.dim });
    const mk = (r, col, label, y, o = {}) => {
      const c = circle(sc, X(r), AY, 15, col, { fill: col, sw: 3 });
      const t = H(sc, label, { x: X(r), y, size: 28, color: col, weight: 600 });
      return [c, t];
    };
    const mBM = mk(F.ranks.bm25, BM, `BM25: ${nth(F.ranks.bm25)}`, AY - 52);
    const mDN = mk(F.ranks.dense, DN, `dense: ${nth(F.ranks.dense)}`, AY - 52);
    const mFU = mk(F.ranks.fused, BAD, `after fusion: ${nth(F.ranks.fused)}`, AY + 150);
    const aWorse = arrow(sc, X(F.ranks.bm25) + 14, AY + 118, X(F.ranks.fused) - 6, AY + 118, BAD, 4, 14);
    fadeIn([fq, fq2], at("h4", 0.2), 0.4);
    show(axis, at("h4", 0.6), 0.4); fadeIn([...ticks, axL], at("h4", 0.7), 0.4, { dy: 0 });
    show(mBM[0], frac("h4", 0.3), 0.3); fadeIn(mBM[1], frac("h4", 0.3) + 0.1, 0.4);
    show(mDN[0], frac("h4", 0.5), 0.3); fadeIn(mDN[1], frac("h4", 0.5) + 0.1, 0.4);
    show(mFU[0], frac("h4", 0.74), 0.3); fadeIn(mFU[1], frac("h4", 0.74) + 0.1, 0.4);
    drawArrow(aWorse, frac("h4", 0.76), 0.5);
    fadeOut(flat([fq, fq2, axis, ticks, axL, mBM, mDN, mFU, aWorse.line, aWorse.tip]), at("h5", 0), 0.4);

    // h5: rewrite the question
    const w1 = H(sc, R.before, { x: 800, y: 260, size: 32, color: C.dim });
    const wa = arrow(sc, 800, 295, 800, 365, C.dim, 3, 12);
    const w2 = H(sc, R.after, { x: 800, y: 400, size: 36 });
    const cT = chip(sc, "try", BAD, { x: 640, y: 500, size: 30, font: "mono" });
    const cA = arrow(sc, 700, 500, 860, 500, C.dim, 3, 12);
    const cR = chip(sc, "test ride", OK, { x: 960, y: 500, size: 30, font: "mono" });
    const rb = chip(sc, `right chunk: ${nth(R.rank_before)}`, BAD, { x: 560, y: 620, size: 30 });
    const ra = arrow(sc, 700, 620, 900, 620, C.dim, 3, 12);
    const rn = chip(sc, `right chunk: ${nth(R.rank_after)}`, OK, { x: 1040, y: 620, size: 30 });
    const note = H(sc, "the rewrite was written by hand here; a model can write it", { x: 800, y: 730, size: 24, color: C.dim });
    fadeIn(w1, at("h5", 0.2), 0.4);
    drawArrow(wa, frac("h5", 0.22), 0.4);
    fadeIn(w2, frac("h5", 0.3), 0.5);
    fadeIn(cT, frac("h5", 0.5), 0.4); drawArrow(cA, frac("h5", 0.54), 0.4); fadeIn(cR, frac("h5", 0.58), 0.4);
    fadeIn(rb, frac("h5", 0.72), 0.4); drawArrow(ra, frac("h5", 0.76), 0.4); fadeIn(rn, frac("h5", 0.82), 0.4);
    fadeIn(note, frac("h5", 0.9), 0.4);
  }

  /* ---------------------------------------------------------------- 4 reranker */
  function rerank(sc, N) {
    title(sc, "A reranker", "r1");
    const Rr = N.rerank, nq = N.corpus.questions;

    // r1: two stages
    const Y0 = 340;
    const items = [];
    const c42 = chip(sc, `${N.corpus.chunks} chunks`, C.dim, { x: 130, y: Y0, size: 28 });
    const bSearch = box(sc, 400, Y0, 290, 90, BM, "search", { size: 32, sub: "fast: each chunk alone", subSize: 18 });
    const c10 = chip(sc, `${Rr.candidates} chunks`, C.fg, { x: 690, y: Y0, size: 28 });
    const bRr = box(sc, 1010, Y0, 340, 90, RR, "reranker", { size: 32, sub: "slow: question + chunk together", subSize: 18 });
    const c3 = chip(sc, "top 3", C.fg, { x: 1290, y: Y0, size: 28 });
    const cP = chip(sc, "prompt", C.dim, { x: 1475, y: Y0, size: 28 });
    const aa = [[212, 250], [550, 612], [772, 836], [1186, 1242], [1342, 1418]].map(([x1, x2]) => arrow(sc, x1, Y0, x2, Y0, C.dim, 3, 12));
    const stage = [c42, bSearch.els, c10, bRr.els, c3, cP, aa.flatMap(a => [a.line, a.tip])];
    fadeIn(c42, at("r1", 0.3), 0.4);
    fadeIn(bSearch.els, at("r1", 0.5), 0.5, { dy: 0 }); drawArrow(aa[0], at("r1", 0.5), 0.3);
    fadeIn(c10, at("r1", 0.9), 0.4); drawArrow(aa[1], at("r1", 0.9), 0.3);
    fadeIn(bRr.els, at("r1", 1.3), 0.5, { dy: 0 }); drawArrow(aa[2], at("r1", 1.3), 0.3);
    fadeIn(c3, at("r1", 1.9), 0.4); drawArrow(aa[3], at("r1", 1.9), 0.3);
    fadeIn(cP, at("r1", 2.3), 0.4); drawArrow(aa[4], at("r1", 2.3), 0.3);
    pulse(bRr.r, at("r1", 3.2), 1.08, 0.7);
    // r1 ends: the stages move up and the candidate list appears
    tl.to(flat(stage), { y: -140, duration: 0.6, ease: "power2.inOut" }, frac("r1", 0.74));

    // r2: the ten candidates change order
    const RY = i => 335 + i * 44;
    const posL = [...Array(Rr.candidates)].map((_, i) => H(sc, String(i + 1), { anchor: "right", x: 250, y: RY(i), size: 20, color: C.dim, font: "mono" }));
    const headS = H(sc, "slot", { anchor: "right", x: 250, y: 290, size: 18, color: C.dim, font: "mono" });
    const headR = H(sc, "reranker score", { anchor: "left", x: 1130, y: 290, size: 18, color: C.dim, font: "mono" });
    const rowsR = Rr.list.map((it, i) => {
      const right = it.id === Rr.right, col = right ? OK : C.fg;
      const nm = H(sc, `${it.title}  #${it.id}`, { anchor: "left", x: 290, y: RY(i), size: 24, color: col, weight: right ? 700 : 400 });
      const sn = H(sc, cut(it.text, 52), { anchor: "left", x: 520, y: RY(i), size: 18, color: C.dim });
      const sc3 = H(sc, fmt(it.score), { anchor: "left", x: 1130, y: RY(i), size: 22, color: right ? OK : C.fg, font: "mono", weight: right ? 700 : 400 });
      return { els: [nm, sn, sc3], sc3, j: Rr.order.indexOf(it.id), i, right };
    });
    fadeIn([headS, ...posL], frac("r1", 0.82), 0.4, { dy: 0 });
    rowsR.forEach((r, k) => fadeIn(r.els.slice(0, 2), frac("r1", 0.82) + 0.1 + k * 0.05, 0.3, { dy: 0 }));
    fadeIn([headR, ...rowsR.map(r => r.sc3)], at("r2", 0.2), 0.5, { dy: 0 });
    const rhi = rect(sc, 270, RY(0) - 22, 1000, 44, OK, { fill: hexA(OK, 0.12), sw: 3 });
    // the highlight starts on the right chunk's first slot and moves with it
    gsap.set(rhi, { y: (rowsR.find(r => r.right).i) * 44 });
    show(rhi, frac("r1", 0.9), 0.3);
    const t0 = at("r2", 1.2);
    rowsR.forEach(r => tl.to(r.els, { y: (r.j - r.i) * 44, duration: 1.1, ease: "power2.inOut" }, t0));
    tl.to(rhi, { y: (Rr.order.indexOf(Rr.right)) * 44, duration: 1.1, ease: "power2.inOut" }, t0);
    const topFrame = rect(sc, 230, RY(0) - 24, 1090, 3 * 44 + 4, FU, { fill: "none", sw: 3, dash: "10 7" });
    const toPrompt = H(sc, "to the prompt", { anchor: "left", x: 1340, y: RY(1), size: 24, color: FU, weight: 600 });
    show(topFrame, at("r2", 3.0), 0.4);
    fadeIn(toPrompt, at("r2", 3.1), 0.4);
    const eff = H(sc, `over ${nq} questions: right chunk in the top 3 for ${Rr.before.r3} → ${Rr.after.r3} questions   (MRR ${fmt(Rr.before.mrr)} → ${fmt(Rr.after.mrr)})`,
      { x: 800, y: 800, size: 26, color: RR, weight: 600 });
    fadeIn(eff, frac("r2", 0.62), 0.5);
    const gone = [...stage.flatMap(x => x), posL, headS, headR, ...rowsR.flatMap(r => r.els), rhi, topFrame, toPrompt, eff];
    fadeOut(flat(gone), at("r3", 0), 0.5);

    // r3: a stand-in and a real reranker; the cost
    const cardL = rect(sc, 90, 190, 680, 250, RR), cardR = rect(sc, 830, 190, 680, 250, C.dim);
    const hL = H(sc, "our reranker: a stand-in", { anchor: "left", x: 120, y: 225, size: 30, color: RR, weight: 700 });
    const tL = H(sc, "counts shared words, word pairs and distance", { anchor: "left", x: 120, y: 285, size: 24, color: C.fg });
    const tryC = chip(sc, "try", BAD, { x: 205, y: 365, size: 26, font: "mono" });
    const tryN = H(sc, "≠", { x: 285, y: 365, size: 30, color: BAD, weight: 700 });
    const tryR = chip(sc, "test ride", BAD, { x: 400, y: 365, size: 26, font: "mono" });
    const tryT = para(sc, "it cannot see that these mean the same", 500, 345, 250, { size: 20, color: BAD });
    const hR = H(sc, "a real reranker", { anchor: "left", x: 860, y: 225, size: 30, color: C.fg, weight: 700 });
    const tR = para(sc, "a neural model that reads the question and one chunk together", 860, 270, 620, { size: 24, color: C.fg });
    const tR2 = H(sc, "one model run for each chunk", { anchor: "left", x: 860, y: 395, size: 26, color: RR, weight: 600 });
    show(cardL, at("r3", 0.4), 0.4); fadeIn([hL, tL], at("r3", 0.5), 0.5);
    fadeIn([tryC, tryN, tryR, tryT], frac("r3", 0.28), 0.5, { stagger: 0.1 });
    show(cardR, frac("r3", 0.52), 0.4); fadeIn([hR, tR], frac("r3", 0.54), 0.5);
    fadeIn(tR2, frac("r3", 0.74), 0.5);
    const BW = 700;
    const bl1 = H(sc, `rerank the top ${Rr.candidates}`, { anchor: "right", x: 560, y: 560, size: 24, color: RR, font: "mono" });
    const b1 = bar(sc, 580, 560, BW * Rr.pairs / Rr.pairs_all, 34, RR);
    const v1 = H(sc, `${Rr.pairs} pairs`, { anchor: "left", x: 580 + BW * Rr.pairs / Rr.pairs_all + 14, y: 560, size: 24, color: RR, font: "mono", weight: 600 });
    const bl2 = H(sc, `score all ${N.corpus.chunks} chunks`, { anchor: "right", x: 560, y: 630, size: 24, color: C.dim, font: "mono" });
    const b2 = bar(sc, 580, 630, BW, 34, C.dim);
    const v2 = H(sc, `${Rr.pairs_all} pairs`, { anchor: "left", x: 580 + BW + 14, y: 630, size: 24, color: C.dim, font: "mono", weight: 600 });
    const cap = H(sc, `question-chunk pairs that the reranker must score, for ${nq} questions`, { x: 800, y: 500, size: 22, color: C.dim });
    fadeIn([cap, bl1, bl2], frac("r3", 0.76), 0.4, { dy: 0 });
    growBar(b1, frac("r3", 0.8)); fadeIn(v1, frac("r3", 0.8) + 0.5, 0.3, { dy: 0 });
    growBar(b2, frac("r3", 0.86)); fadeIn(v2, frac("r3", 0.86) + 0.5, 0.3, { dy: 0 });
    const lim = H(sc, `A reranker can only re-order what search found. Here the right chunk was in the top ${Rr.candidates} for ${Rr.ceiling} of ${nq} questions.`,
      { x: 800, y: 740, size: 22, color: C.dim, wrap: 1200 });
    fadeIn(lim, frac("r3", 0.9), 0.5);
  }

  /* ---------------------------------------------------------------- 5 evals */
  function evals(sc, N) {
    const ttl = title(sc, "Evals for RAG", "e1");
    const nq = N.corpus.questions;
    const V = N.versions;

    // e1: two parts, measured separately
    const bS = box(sc, 460, 340, 420, 130, BM, "the search", { size: 38, sub: "did it find the right chunk?", subSize: 22 });
    const bA = box(sc, 1140, 340, 420, 130, OK, "the answer", { size: 38, sub: "does the text support it?", subSize: 22 });
    const ar = arrow(sc, 690, 340, 910, 340, C.dim, 4, 14);
    const sep = H(sc, "measure each one separately", { x: 800, y: 500, size: 32, color: C.yellow, weight: 600 });
    fadeIn(bS.els, at("e1", 0.9), 0.5, { dy: 0 });
    drawArrow(ar, frac("e1", 0.45), 0.4);
    fadeIn(bA.els, frac("e1", 0.5), 0.5, { dy: 0 });
    fadeIn(sep, frac("e1", 0.74), 0.5);
    fadeOut(flat([bS.els, bA.els, ar.line, ar.tip, sep]), at("e2", 0), 0.4);

    // e2: recall@3 and MRR on five real questions
    const rk = V[1].ranks.slice(0, 5);
    const hits = rk.filter(r => r !== null && r <= 3).length;
    const mrr5 = rk.reduce((a, r) => a + (r ? 1 / r : 0), 0) / rk.length;
    const CX = i => 430 + i * 230;
    const cap2 = H(sc, "the first 5 questions, BM25 search", { x: 800, y: 175, size: 24, color: C.dim });
    const rowLab = [["question", 270], ["rank of the right chunk", 345], ["in the top 3?", 420], ["1 / rank", 495]]
      .map(([t, y]) => H(sc, t, { anchor: "left", x: 60, y, size: 18, color: C.dim, font: "mono" }));
    const cells = rk.map((r, i) => {
      const x = CX(i);
      const a = H(sc, `Q${i + 1}`, { x, y: 270, size: 26, color: C.dim, font: "mono" });
      const b = H(sc, r === null ? "-" : nth(r), { x, y: 345, size: 34, weight: 600 });
      const c = mark(sc, r !== null && r <= 3, x, 420, 36);
      const d = H(sc, r ? fmt(1 / r, 2) : "0", { x, y: 495, size: 30, color: RR, font: "mono", weight: 600 });
      return { a, b, c, d };
    });
    const recallT = H(sc, `recall@3 = ${hits} of ${rk.length} questions`, { x: 800, y: 620, size: 34, color: OK, font: "mono", weight: 600 });
    const mrrT = H(sc, `MRR = average of 1 / rank = ${fmt(mrr5, 2)}`, { x: 800, y: 700, size: 34, color: RR, font: "mono", weight: 600 });
    fadeIn([cap2, ...rowLab], at("e2", 0.3), 0.4, { dy: 0 });
    fadeIn(cells.flatMap(c => [c.a, c.b]), at("e2", 0.8), 0.4, { stagger: 0.08 });
    fadeIn(cells.map(c => c.c), frac("e2", 0.36), 0.3, { stagger: 0.1 });
    fadeIn(recallT, frac("e2", 0.5), 0.5);
    fadeIn(cells.map(c => c.d), frac("e2", 0.62), 0.3, { stagger: 0.08 });
    fadeIn(mrrT, frac("e2", 0.86), 0.5);
    fadeOut(flat([cap2, rowLab, cells.flatMap(c => [c.a, c.b, c.c, c.d]), recallT, mrrT]), at("e3", 0), 0.4);

    // e3: six versions, one square for each question
    const RY = i => 255 + i * 74, SQ = 28, STEP = 34, SX0 = 830;
    const heads = [["version", 90, "left"], ["recall@3", 640, "middle"], ["MRR", 770, "middle"], [`one square for each of the ${nq} questions`, SX0, "left"]]
      .map(([t, x, a]) => H(sc, t, { anchor: a === "left" ? "left" : undefined, x, y: 195, size: 20, color: C.dim, font: "mono" }));
    const rule = line(sc, 80, 222, 1530, 222, C.grid, 2);
    fadeIn(heads, at("e3", 0.2), 0.4, { dy: 0 });
    show(rule, at("e3", 0.2), 0.4);
    const trs = V.map((v, i) => {
      const y = RY(i);
      const nm = H(sc, v.version, { anchor: "left", x: 90, y, size: 25, weight: 400 });
      const r3 = H(sc, `${v.r3}/${nq}`, { x: 640, y, size: 26, font: "mono", weight: 600, color: OK });
      const mr = H(sc, fmt(v.mrr), { x: 770, y, size: 26, font: "mono", weight: 600, color: RR });
      const sqs = v.ranks.map((r, k) => {
        const good = r !== null && r <= 3;
        return rect(sc, SX0 + k * STEP, y - SQ / 2, SQ, SQ, good ? OK : BAD, { fill: good ? hexA(OK, 0.55) : hexA(BAD, 0.7), rx: 5, sw: 1.5 });
      });
      return { nm, r3, mr, sqs, y };
    });
    trs.forEach((r, i) => {
      const t = frac("e3", 0.1 + i * 0.1);
      fadeIn([r.nm, r.r3, r.mr], t, 0.4, { dy: 0 });
      tl.to(r.sqs, { autoAlpha: 1, duration: 0.25, stagger: 0.02 }, t + 0.1);
    });
    const best = trs.length - 1;
    const frame = rect(sc, 70, RY(best) - 34, 1496, 68, OK, { fill: "none", sw: 3 });
    show(frame, frac("e3", 0.7), 0.4);
    const key = H(sc, "green: the right chunk is in the top 3        red: it is not", { x: 800, y: 735, size: 22, color: C.dim });
    const one = H(sc, `one question = ${(100 / nq).toFixed(1)} points of recall, so collect more questions`, { x: 800, y: 790, size: 24, color: C.yellow });
    const src = H(sc, `One small hand-written handbook (${N.corpus.chunks} paragraphs). The result holds for this corpus only.`, { x: 800, y: 840, size: 20, color: C.dim });
    fadeIn([key, src], at("e3", 0.8), 0.4);
    fadeIn(one, frac("e3", 0.88), 0.5);
    fadeOut(flat([heads, rule, trs.flatMap(r => [r.nm, r.r3, r.mr, ...r.sqs]), frame, key, one, src]), at("e4", 0), 0.4);

    // e4: a simple grader on two answers
    const S0 = N.samples, ctxNum = (N.context.match(/\d+/g) || [])[0];
    const cLab = H(sc, "retrieved text", { anchor: "left", x: 100, y: 185, size: 20, color: C.dim, font: "mono" });
    const cTx = para(sc, N.context, 100, 205, 1400, { size: 24, color: C.fg });
    const cards = S0.map((s, k) => {
      const x0 = 90 + k * 750, w = 680;
      const r = rect(sc, x0, 300, w, 350, k === 0 ? OK : BAD);
      const hd = H(sc, `answer ${k === 0 ? "A" : "B"}   (written by hand)`, { anchor: "left", x: x0 + 24, y: 330, size: 22, color: C.dim, font: "mono" });
      let y = 380;
      const items = s.checks.map(c => {
        const mk2 = mark(sc, c.supported, x0 + 36, y + 10, 30);
        const tx = para(sc, c.sentence, x0 + 70, y - 12, w - 100, { size: 22, color: c.supported ? C.fg : BAD });
        const nt = c.supported ? null : para(sc, c.missing.length ? `the number ${c.missing.join(", ")} is not in the text` : c.cover === 0 ? "none of its words are in the text" : `only ${Math.round(c.cover * 100)}% of its words are in the text`,
          x0 + 70, y + 24, w - 100, { size: 18, color: BAD });
        y += c.supported ? 62 : 92;
        return [mk2, tx, ...(nt ? [nt] : [])];
      });
      return { r, hd, items, bad: s.checks.some(c => !c.supported) };
    });
    fadeIn([cLab, cTx], at("e4", 0.3), 0.5);
    show(cards[0].r, frac("e4", 0.2), 0.4); fadeIn(cards[0].hd, frac("e4", 0.2), 0.4, { dy: 0 });
    cards[0].items.forEach((g, i) => fadeIn(g, frac("e4", 0.28 + i * 0.07), 0.4, { dy: 0 }));
    show(cards[1].r, frac("e4", 0.42), 0.4); fadeIn(cards[1].hd, frac("e4", 0.42), 0.4, { dy: 0 });
    cards[1].items.forEach((g, i) => fadeIn(g, frac("e4", 0.5 + i * 0.1), 0.4, { dy: 0 }));
    const aN = chip(sc, `answer: ${S0[1].checks.find(c => c.missing.length).missing[0]} days`, BAD, { x: 560, y: 720, size: 30 });
    const tN = chip(sc, `text: ${ctxNum} days`, OK, { x: 1040, y: 720, size: 30 });
    const g0 = H(sc, "a simple grader: it checks numbers and words, not meaning", { x: 800, y: 800, size: 22, color: C.dim });
    fadeIn([aN, tN], frac("e4", 0.74), 0.4, { stagger: 0.2 });
    fadeIn(g0, frac("e4", 0.9), 0.4);
    const e4all = flat([cLab, cTx, cards.flatMap(c => [c.r, c.hd, ...c.items.flat()]), aN, tN, g0]);
    fadeOut(e4all, at("e5", 0), 0.4);

    // e5: the swap test on one pair
    const fl = N.swap.find(r => !r.consistent);
    const pq = H(sc, `question: ${fl.question}`, { x: 800, y: 190, size: 28, color: C.dim });
    const lbl = [["A first", 330], ["B first", 520]].map(([t, y]) => H(sc, t, { anchor: "left", x: 30, y, size: 20, color: C.dim, font: "mono" }));
    const ansBox = (x, y, txt, col) => ({
      r: rect(sc, x - 170, y - 55, 340, 110, col), t: para(sc, txt, x - 150, y - 38, 300, { size: 19, color: C.fg }),
    });
    const row = (y, first, second, v, vc) => {
      const b1 = ansBox(330, y, first[1], C.fg === first[2] ? C.dim : first[2]);
      const b2 = ansBox(720, y, second[1], second[2]);
      const jd = box(sc, 1060, y, 170, 90, DN, "judge", { size: 28 });
      const a1 = arrow(sc, 910, y, 970, y, C.dim, 3, 10);
      const a2 = arrow(sc, 1150, y, 1250, y, C.dim, 3, 10);
      const vd = chip(sc, `verdict: ${v}`, vc, { x: 1380, y, size: 28 });
      return { b1, b2, jd, a1, a2, vd };
    };
    const rA = row(330, ["A", "A: " + fl.answer_A, BM], ["B", "B: " + fl.answer_B, OK], fl.order_AB, BM);
    const rB = row(520, ["B", "B: " + fl.answer_B, OK], ["A", "A: " + fl.answer_A, BM], fl.order_BA, OK);
    const showRow2 = (r, t) => {
      show([r.b1.r, r.b2.r], t, 0.4); fadeIn([r.b1.t, r.b2.t], t + 0.1, 0.4, { dy: 0 });
      fadeIn(r.jd.els, t + 0.3, 0.4, { dy: 0 }); drawArrow(r.a1, t + 0.3, 0.3); drawArrow(r.a2, t + 0.6, 0.3);
      fadeIn(r.vd, t + 0.9, 0.4);
    };
    fadeIn([pq, ...lbl.slice(0, 1)], at("e5", 0.3), 0.4);
    showRow2(rA, frac("e5", 0.3));
    fadeIn(lbl[1], frac("e5", 0.55), 0.4, { dy: 0 });
    showRow2(rB, frac("e5", 0.55));
    const flip = H(sc, "the verdict changed when only the order changed: the judge prefers the first answer", { x: 800, y: 640, size: 28, color: BAD, weight: 600 });
    fadeIn(flip, frac("e5", 0.88), 0.5);
    const e5all = flat([pq, lbl, [rA, rB].flatMap(r => [r.b1.r, r.b1.t, r.b2.r, r.b2.t, ...r.jd.els, r.a1.line, r.a1.tip, r.a2.line, r.a2.tip, r.vd]), flip]);
    fadeOut(e5all, at("e6", 0), 0.4);

    // e6: all eight pairs
    const RY6 = i => 255 + i * 56;
    const heads6 = [["pair", 90, "left"], ["A first", 900, "middle"], ["B first", 1040, "middle"], ["same verdict?", 1210, "middle"], ["human label", 1400, "middle"]]
      .map(([t, x, a]) => H(sc, t, { anchor: a === "left" ? "left" : undefined, x, y: 195, size: 20, color: C.dim, font: "mono" }));
    const rule6 = line(sc, 80, 222, 1520, 222, C.grid, 2);
    fadeIn(heads6, at("e6", 0.2), 0.4, { dy: 0 });
    show(rule6, at("e6", 0.2), 0.4);
    const tag = H(sc, "a toy judge, built with a bias toward the first answer, to show the test", { x: 800, y: 150, size: 22, color: DN });
    fadeIn(tag, at("e6", 0.1), 0.4);
    const rows6 = N.swap.map((r, i) => {
      const y = RY6(i);
      const q2 = H(sc, r.question, { anchor: "left", x: 90, y, size: 22 });
      const v1 = chip(sc, r.order_AB, BM, { x: 900, y, size: 22, font: "mono" });
      const v2 = chip(sc, r.order_BA, BM, { x: 1040, y, size: 22, font: "mono" });
      const same = H(sc, r.consistent ? "same" : "CHANGES", { x: 1210, y, size: 22, color: r.consistent ? OK : BAD, font: "mono", weight: 700 });
      const hu = H(sc, r.human, { x: 1400, y, size: 22, color: C.fg, font: "mono", weight: 600 });
      return { els: [q2, v1, v2, same, hu], flip: !r.consistent };
    });
    rows6.forEach((r, i) => fadeIn(r.els, frac("e6", 0.08 + i * 0.07), 0.3, { dy: 0 }));
    const nFlip = N.swap.filter(r => !r.consistent).length;
    const cnt = H(sc, `the verdict changes for ${nFlip} of ${N.swap.length} pairs`, { x: 800, y: 735, size: 32, color: BAD, weight: 600 });
    const agr = H(sc, `agrees with the human: ${N.agree.ab} of ${N.swap.length} (A first), ${N.agree.ba} of ${N.swap.length} (B first)`, { x: 800, y: 790, size: 26, color: C.dim });
    fadeIn(cnt, frac("e6", 0.66), 0.5);
    fadeIn(agr, frac("e6", 0.84), 0.5);
    pulse(heads6[4], frac("e6", 0.82), 1.2, 0.6);
    fadeOut(flat([heads6, rule6, tag, rows6.flatMap(r => r.els), cnt, agr]), at("e7", 0), 0.4);

    // e7: a trace
    const T = N.trace;
    const lines = [
      "{",
      `  "question": ${JSON.stringify(T.question)},`,
      `  "pipeline": ${JSON.stringify(T.pipeline)},`,
      `  "chunks": [${T.chunks.join(", ")}],`,
      `  "sections": [${T.sections.map(s => JSON.stringify(s)).join(", ")}],`,
      `  "prompt_words": ${T.prompt_words},`,
      `  "answer": ${JSON.stringify(T.answer)},`,
      `  "grounded": ${T.grounded}`,
      "}",
    ];
    const CBX = 150, CBY = 230, CBW = 1060;
    const cb = codeBox(sc, lines, { x: CBX, y: CBY, size: 26, w: CBW });
    const tcap = H(sc, "a trace of one request (the model here is a stub that copies a sentence)", { x: 800, y: 175, size: 22, color: C.dim });
    fadeIn(tcap, at("e7", 0.2), 0.4);
    fadeIn(cb.el, at("e7", 0.5), 0.6);
    const LH = 26 * 1.45;          // the code box has a 1 px border, 18 px padding and a line height of 1.45
    const hi = (i, t) => {
      // an HTML frame: the code box is opaque HTML, so an SVG rectangle would be hidden behind it
      const r = document.createElement("div");
      Object.assign(r.style, { position: "absolute", left: (CBX + 8) + "px", top: (CBY + 19 + i * LH - 3) + "px", width: (CBW + 48 - 16) + "px",
        height: (LH + 6) + "px", border: `3px solid ${BAD}`, borderRadius: "8px", boxSizing: "border-box", pointerEvents: "none" });
      sc.el.appendChild(r);
      gsap.set(r, { autoAlpha: 0 });
      show(r, t, 0.4);
      return r;
    };
    const h3 = hi(3, frac("e7", 0.5)), h4 = hi(4, frac("e7", 0.5) + 0.2);
    const miss = H(sc, `the right chunk (#${N.trace_right.id}, ${N.trace_right.title}: "test ride") is not in the list: the search failed, not the model`,
      { x: 800, y: 690, size: 26, color: BAD, weight: 600, wrap: 1300 });
    const gr = H(sc, "grounded: true  means that the answer follows the text. It was the wrong text.", { x: 800, y: 770, size: 24, color: C.yellow });
    fadeIn(miss, frac("e7", 0.62), 0.5);
    fadeIn(gr, frac("e7", 0.84), 0.5);
    const e7all = [cb.el, tcap, h3, h4, miss, gr];
    fadeOut(e7all, at("e8", 0), 0.4);

    // e8-e10: the whole series
    fadeOut(ttl, at("e8", 0), 0.4);
    const end1 = H(sc, "The series", { y: 78, size: 56, font: "serif", weight: 600 });
    gsap.set(end1, { autoAlpha: 0 });
    fadeIn(end1, at("e8", 0.3), 0.6);
    const ser = DATA.series;
    const pos2 = i => (i < 6 ? { x: 800 + (i - 2.5) * 250, y: 270 } : { x: 800 + (i - 6 - 2.5) * 250, y: 470 });
    const cards2 = ser.map((s, i) => {
      const { x, y } = pos2(i), col = LEVEL_COLOR[s.level];
      const r2 = rect(sc, x - 110, y - 70, 220, 140, col, { fill: hexA(col, 0.08), rx: 12, sw: 2.5 });
      const n = H(sc, `Episode ${s.n}`, { x, y: y - 40, size: 18, color: C.dim, font: "mono" });
      const t = H(sc, s.title, { x, y: y + 12, size: 23, weight: 600, wrap: 196 });
      return { r2, n, t, col, x, y };
    });
    const showCard = (i, t) => { show(cards2[i].r2, t, 0.4); fadeIn([cards2[i].n, cards2[i].t], t + 0.05, 0.4, { dy: 8 }); };
    [0, 1, 2, 3, 4].forEach((i, k) => showCard(i, frac("e8", [0.3, 0.42, 0.54, 0.66, 0.8][k])));
    showCard(5, at("e9", 0.3));
    showCard(6, frac("e9", 0.2));
    [7, 8, 9, 10].forEach((i, k) => showCard(i, frac("e9", [0.44, 0.54, 0.64, 0.74][k])));
    showCard(11, frac("e9", 0.86));
    tl.to(cards2[11].r2, { fill: hexA(cards2[11].col, 0.25), strokeWidth: 4, duration: 0.5 }, frac("e9", 0.9));
    const bx = cards2[7].x - 110, bx2 = cards2[11].x + 110;
    const brk = S(sc.svg, "path", { d: `M${bx},572 L${bx},584 L${bx2},584 L${bx2},572` }, { fill: "none", stroke: LEVEL_COLOR["Deep dive"], strokeWidth: 3 });
    hide(brk);
    const brkL = H(sc, "five deep dives", { x: (bx + bx2) / 2, y: 620, size: 24, color: LEVEL_COLOR["Deep dive"], weight: 600 });
    draw(brk, frac("e9", 0.6), 0.8);
    fadeIn(brkL, frac("e9", 0.7), 0.4, { dy: 0 });
    const steps = ["pick one task", "write ten test cases", "build the simplest agent that passes them"];
    const cta = steps.map((s, i) => chip(sc, `${i + 1}   ${s}`, [C.yellow, C.green, C.blue][i], { x: 800, y: 740, size: 28 }));
    rowLayout(cta, 800, 36);
    cta.forEach((c, i) => fadeIn(c, at("e10", [0.1, 1.6, 3.4][i]), 0.5));
  }

  return { fail, chunk, hybrid, rerank, evals };
})();
