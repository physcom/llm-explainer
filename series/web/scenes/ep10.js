/* Episode 10 - Inference and serving. Contract: OUTLINE.md. N = episodes/ep10.py nums(). */
SCENES_BY_EP.ep10 = (() => {
  const k = v => Math.round(v).toLocaleString("en-US");
  const COL = [C.blue, C.teal, C.green, C.yellow, C.orange, C.purple, "#e377c2", "#c9ccd2"];   // one colour per request
  const hide = els => gsap.set(els, { autoAlpha: 0 });
  const ae = a => [a.line, a.tip];
  const arrowTo = (sc, x1, y1, x2, y2, col, w, head) => arrow(sc, x1, y1, x2, y2, col || C.dim, w || 4, head || 16);
  function title(sc, text, key) { write(H(sc, text, { y: 78, size: 56, font: "serif", weight: 600 }), at(key, 0.1), 1.0); }
  /* a text line. anchor: "left" | "right" | centre (default) */
  function L(sc, text, x, y, size, color, o = {}) { return H(sc, text, Object.assign({ x, y, size: size || 24, color: color || C.fg }, o)); }
  /* a plain rectangle (no label), hidden until shown */
  function rect(sc, x, y, w, h, color, o = {}) {
    const r = S(sc.svg, "rect", { x, y, width: w, height: h, rx: o.rx ?? 12 },
      { fill: o.fill === undefined ? hexA(color, 0.08) : o.fill, stroke: color, strokeWidth: o.sw || 2.5, strokeDasharray: o.dash || "" });
    hide(r);
    return r;
  }
  /* a small filled square or bar, hidden until shown */
  function cell(sc, x, y, w, h, fill, o = {}) {
    const r = S(sc.svg, "rect", { x, y, width: w, height: h, rx: o.rx ?? 4 },
      { fill, stroke: o.stroke || "none", strokeWidth: o.sw || 0, strokeDasharray: o.dash || "" });
    hide(r);
    return r;
  }
  function line(sc, x1, y1, x2, y2, color, w = 2, dash = "") {
    const l = S(sc.svg, "line", { x1, y1, x2, y2 }, { stroke: color, strokeWidth: w, strokeDasharray: dash });
    hide(l);
    return l;
  }
  function dot(sc, cx, cy, r, color) { const c = S(sc.svg, "circle", { cx, cy, r }, { fill: color }); hide(c); return c; }
  /* a bracket under (y) a span from x1 to x2 */
  function bracket(sc, x1, x2, y, color) {
    const p = S(sc.svg, "path", { d: `M${x1},${y - 12} L${x1},${y} L${x2},${y} L${x2},${y - 12}` }, { fill: "none", stroke: color, strokeWidth: 3 });
    hide(p);
    return p;
  }
  function bracketTop(sc, x1, x2, y, color) {
    const p = S(sc.svg, "path", { d: `M${x1},${y + 12} L${x1},${y} L${x2},${y} L${x2},${y + 12}` }, { fill: "none", stroke: color, strokeWidth: 3 });
    hide(p);
    return p;
  }
  function mark(sc, ok, x, y, size = 36) { return H(sc, ok ? "✓" : "✗", { x, y, size, color: ok ? C.green : C.red, weight: 700 }); }
  const money = (v, d = 2) => "$" + v.toFixed(d);

  /* ---------------------------------------------------------------- 1 prefill and decode */
  function phases(sc, N) {
    title(sc, "Inference and serving", "p1");
    const PROMPT = ["How", "do", "I", "cancel", "my", "order", "?"];
    const REPLY = ["Open", "My", "orders", ",", "select", "Cancel", "."];

    // p1: the reply grows one token at a time; the two goals
    const sub = L(sc, "episode 6: the model writes one token at a time", 800, 200, 26, C.dim);
    const t1 = REPLY.map(w => chip(sc, w, C.teal, { y: 400, size: 30 }));
    rowLayout(t1, 800, 16);
    const fast = chip(sc, "fast", C.blue, { x: 620, y: 620, size: 46 });
    const cheap = chip(sc, "cheap", C.yellow, { x: 980, y: 620, size: 46 });
    fadeIn(sub, at("p1", 0.5), 0.5);
    t1.forEach((c, i) => fadeIn(c, at("p1", 1.0 + i * 0.35), 0.3, { dx: -12, dy: 0 }));
    fadeIn(fast, frac("p1", 0.62), 0.4);
    fadeIn(cheap, frac("p1", 0.78), 0.4);
    fadeOut([sub, ...t1, fast, cheap], at("p2", 0), 0.4);

    // p2: two phases
    const RX = 880;
    const prL = L(sc, "prompt", 110, 320, 26, C.blue, { anchor: "left", weight: 600 });
    const pr = PROMPT.map(w => chip(sc, w, C.blue, { y: 320, size: 28 }));
    const pc = rowLayout(pr, RX, 14);
    const bx1 = pc[0] - pr[0].offsetWidth / 2, bx2 = pc[pc.length - 1] + pr[pr.length - 1].offsetWidth / 2;
    const br = bracket(sc, bx1, bx2, 372, C.blue);
    const preL = L(sc, "prefill: the whole prompt in one pass", RX, 416, 26, C.blue);
    const reL = L(sc, "reply", 110, 560, 26, C.yellow, { anchor: "left", weight: 600 });
    const re = REPLY.map(w => chip(sc, w, C.yellow, { y: 560, size: 28 }));
    const rc = rowLayout(re, RX, 14);
    const stL = L(sc, "step", 110, 620, 20, C.dim, { anchor: "left", font: "mono" });
    const stN = re.map((c, i) => L(sc, String(i + 1), rc[i], 620, 20, C.dim, { font: "mono" }));
    const decL = L(sc, "decode: one token for each step", RX, 676, 26, C.yellow);
    fadeIn([prL, ...pr], at("p2", 0.3), 0.5, { dy: 0 });
    draw(br, frac("p2", 0.27), 0.5);
    fadeIn(preL, frac("p2", 0.3), 0.4);
    tl.to(pr, { scale: 1.12, duration: 0.25, yoyo: true, repeat: 1, transformOrigin: "50% 50%" }, frac("p2", 0.3));
    fadeIn([reL, stL], frac("p2", 0.52), 0.4, { dy: 0 });
    re.forEach((c, i) => fadeIn([c, stN[i]], frac("p2", 0.56) + i * 0.45, 0.3, { dx: -12, dy: 0 }));
    fadeIn(decL, frac("p2", 0.56) + 0.5, 0.4);
    fadeOut([prL, ...pr, br, preL, reL, ...re, stL, ...stN, decL], at("p3", 0), 0.4);

    // p3: prefill is compute-bound
    const mem = box(sc, 330, 490, 320, 150, C.teal, "memory", { size: 32, sub: `weights: ${N.weights_gb.toFixed(0)} GB`, subSize: 24 });
    const gpu = box(sc, 1010, 490, 320, 150, C.blue, "GPU", { size: 32 });
    const rd = arrowTo(sc, 500, 490, 840, 490, C.fg, 5, 18);
    const rdL = L(sc, "read the weights once", 670, 448, 24, C.fg);
    const tagA = chip(sc, "prefill = compute-bound", C.blue, { x: 800, y: 215, size: 34 });
    const NT = PROMPT.length;
    const tk = [...Array(NT)].map((_, i) => cell(sc, 1010 - NT * 22 + i * 44 + 5, 345, 34, 34, C.blue));
    const tkL = L(sc, `${NT} prompt tokens use these weights`, 1010, 308, 22, C.blue);
    const barBg = rect(sc, 860, 600, 300, 30, C.dim, { fill: "none", rx: 8 });
    const barF = cell(sc, 860, 600, 300, 30, hexA(C.green, 0.85), { rx: 8 });
    gsap.set(barF, { attr: { width: 0 } });
    const barL = L(sc, "GPU busy", 1010, 668, 26, C.green, { weight: 600 });
    fadeIn(tagA, at("p3", 0.3), 0.4);
    fadeIn([...mem.els, ...gpu.els], at("p3", 0.6), 0.5, { dy: 0 });
    drawArrow(rd, frac("p3", 0.25), 0.6);
    fadeIn(rdL, frac("p3", 0.28), 0.4, { dy: 0 });
    fadeIn(tkL, frac("p3", 0.42), 0.4);
    tk.forEach((c, i) => fadeIn(c, frac("p3", 0.46) + i * 0.08, 0.2, { dy: 0 }));
    show([barBg, barF, barL], frac("p3", 0.6), 0.3);
    tl.to(barF, { attr: { width: 300 }, duration: 1.6, ease: "power1.inOut" }, frac("p3", 0.62));

    // p4: decode is memory-bound
    const tagB = chip(sc, "decode = memory-bound", C.yellow, { x: 800, y: 215, size: 34 });
    fadeOut(tagA, at("p4", 0), 0.3);
    fadeIn(tagB, at("p4", 0.3), 0.4);
    fadeOut(tk.slice(1), at("p4", 0.4), 0.4);
    swapText(tkL, at("p4", 0.5), "1 token uses these weights");
    swapText(rdL, at("p4", 0.5), "read ALL the weights again");
    for (let i = 0; i < 3; i++) tl.to(rd.line, { strokeWidth: 13, duration: 0.3, yoyo: true, repeat: 1 }, at("p4", 1.2 + i * 1.5));
    tl.to(barF, { attr: { width: 38 }, duration: 0.9, ease: "power2.inOut" }, frac("p4", 0.35));
    swapText(barL, frac("p4", 0.4), "GPU waits for memory");
    tl.to(barL, { color: C.orange, duration: 0.3 }, frac("p4", 0.4));
    fadeOut([...mem.els, ...gpu.els, ...ae(rd), rdL, tagB, tk[0], tkL, barBg, barF, barL], at("p5", 0), 0.4);

    // p5: the memory bandwidth of the GPU
    const card = box(sc, 800, 340, 640, 150, C.blue, N.gpu.name, { size: 36, sub: `GPU memory: ${N.gpu.mem_gb.toFixed(0)} GB`, subSize: 26 });
    const bwL = L(sc, "memory bandwidth", 800, 510, 28, C.dim);
    const bwV = L(sc, `${N.gpu.bw_tb} TB/s`, 800, 600, 96, C.yellow, { font: "serif", weight: 600 });
    const bwN = L(sc, "TB/s = terabytes per second", 800, 700, 24, C.dim);
    fadeIn(card.els, at("p5", 0.5), 0.5, { dy: 0 });
    fadeIn(bwL, at("p5", 1.5), 0.4);
    write(bwV, at("p5", 2.3), 1.0);
    fadeIn(bwN, at("p5", 3.4), 0.4);
    fadeOut([...card.els, bwL, bwV, bwN], at("p6", 0), 0.4);

    // p6: the limit
    const rows = [
      [`weights of ${N.model.name} (${N.model.bytes} bytes for each weight)`, `${N.weights_gb.toFixed(1)} GB`, C.blue],
      [`memory bandwidth (${N.gpu.name})`, `${N.gpu.bw_tb} TB/s`, C.teal],
      ["time to read the weights once", `${N.weights_gb.toFixed(1)} GB ÷ ${N.gpu.bw_tb} TB/s = ${N.step_ms.toFixed(1)} ms`, C.fg],
    ];
    const rowEls = rows.map(([a, b, col], i) => {
      const y = 290 + i * 90;
      const l = L(sc, a, 230, y, 28, C.dim, { anchor: "left" });
      const v = L(sc, b, 1370, y, 32, col, { anchor: "right", font: "mono", weight: 500 });
      const ln = line(sc, 230, y + 40, 1370, y + 40, C.faint, 2);
      return [l, v, ln];
    });
    fadeIn(rowEls[0], at("p6", 0.3), 0.4, { dy: 0 });
    fadeIn(rowEls[1], at("p6", 1.1), 0.4, { dy: 0 });
    fadeIn(rowEls[2], frac("p6", 0.45), 0.4, { dy: 0 });
    const big = L(sc, `limit: about ${Math.round(N.tps_weights / 10) * 10} tokens per second`, 800, 640, 58, C.yellow, { font: "serif", weight: 600 });
    const note = L(sc, "an upper limit: it ignores the cache, the compute and all other work", 800, 730, 24, C.dim);
    write(big, frac("p6", 0.55), 1.2);
    fadeIn(note, frac("p6", 0.85), 0.4);
  }

  /* ---------------------------------------------------------------- 2 the KV cache */
  function kvcache(sc, N) {
    title(sc, "The KV cache", "k1");
    const R = 6, SQ = 28, PT = 32, Y0 = 330, RP = 46, xL = 190, xR = 930;
    function grid(x0, cached) {
      return [...Array(R)].map((_, i) => {
        const tot = N.work_no_cache[i], nw = N.work_cache[i], old = cached ? tot - nw : 0;
        const cells = [...Array(tot)].map((_, j) => cell(sc, x0 + j * PT, Y0 + i * RP, SQ, SQ, j < old ? C.grid : C.orange));
        const lab = L(sc, `step ${i + 1}`, x0 - 14, Y0 + i * RP + SQ / 2, 18, C.dim, { anchor: "right", font: "mono" });
        return { cells, lab, old };
      });
    }
    const gl = grid(xL, false), gr = grid(xR, true);

    // k1: without a cache, every step computes all keys and values again
    const hL = L(sc, "without a cache", xL, 275, 30, C.orange, { anchor: "left", weight: 600 });
    const hS = L(sc, `a toy decoder: ${N.prompt_len} prompt tokens, the first ${R} steps`, 800, 205, 22, C.dim);
    const capL = L(sc, "every step: all keys and values again", xL, 640, 24, C.orange, { anchor: "left" });
    fadeIn(hS, at("k1", 0.4), 0.4);
    fadeIn(hL, at("k1", 0.6), 0.4);
    gl.forEach((row, i) => fadeIn([row.lab, ...row.cells], at("k1", 1.3 + i * 0.6), 0.3, { dy: 0, stagger: 0.015 }));
    fadeIn(capL, frac("k1", 0.85), 0.4);

    // k2: old keys and values never change: store them
    const hR = L(sc, "with a KV cache", xR, 275, 30, C.teal, { anchor: "left", weight: 600 });
    fadeIn(hR, at("k2", 0.4), 0.4);
    gr.forEach((row, i) => fadeIn([row.lab, ...row.cells], at("k2", 0.9 + i * 0.45), 0.3, { dy: 0, stagger: 0.012 }));
    const lg1 = cell(sc, xR, 640, 20, 20, C.orange), lg2 = cell(sc, xR + 200, 640, 20, 20, C.grid);
    const lt1 = L(sc, "computed", xR + 30, 650, 22, C.dim, { anchor: "left" });
    const lt2 = L(sc, "read from the cache", xR + 230, 650, 22, C.dim, { anchor: "left" });
    fadeIn([lg1, lt1, lg2, lt2], frac("k2", 0.78), 0.4, { dy: 0 });

    // k3: the totals
    const newCells = gr.slice(1).map(row => row.cells[row.cells.length - 1]);
    tl.to(newCells, { scale: 1.3, duration: 0.3, yoyo: true, repeat: 1, transformOrigin: "50% 50%", stagger: 0.12 }, at("k3", 0.4));
    const totL = L(sc, "", xL, 705, 26, C.orange, { anchor: "left", font: "mono" });
    const totR = L(sc, "", xR, 705, 26, C.teal, { anchor: "left", font: "mono" });
    const fmt = v => `${Math.round(v)} pairs computed in ${N.new_tokens} steps`;
    fadeIn([totL, totR], frac("k3", 0.5), 0.3, { dy: 0 });
    counter(totL, frac("k3", 0.5), 0, N.kv_total_no, 1.6, fmt);
    counter(totR, frac("k3", 0.5) + 0.3, 0, N.kv_total_cache, 1.2, fmt);
    const ratio = L(sc, `${(N.kv_total_no / N.kv_total_cache).toFixed(0)}× less work`, 800, 790, 44, C.yellow, { weight: 600 });
    fadeIn(ratio, frac("k3", 0.82), 0.5);
    const g1 = [hS, hL, hR, capL, lg1, lt1, lg2, lt2, totL, totR, ratio, ...gl.flatMap(r => [r.lab, ...r.cells]), ...gr.flatMap(r => [r.lab, ...r.cells])];
    fadeOut(g1, at("k4", 0), 0.4);

    // k4: what the cache holds for one token
    const nh = N.model.kv_heads, dx = 250, S2 = 26, P2 = 32, gap = 60;
    const kx = dx + (nh * P2 - 6) / 2, vx = dx + nh * P2 + gap + (nh * P2 - 6) / 2;
    const layerRows = [[`layer 1`, 345], [`layer 2`, 401], [`layer 3`, 457], ["⋮", 505], [`layer ${N.model.layers}`, 555]];
    const rowEls = layerRows.map(([lab, y]) => {
      const els = [L(sc, lab, dx - 22, y + S2 / 2, 22, C.dim, { anchor: "right" })];
      if (lab !== "⋮") for (let j = 0; j < nh; j++) {
        els.push(cell(sc, dx + j * P2, y, S2, S2, C.blue));
        els.push(cell(sc, dx + nh * P2 + gap + j * P2, y, S2, S2, C.teal));
      }
      return els;
    });
    const hk = L(sc, "key", kx, 305, 26, C.blue, { weight: 600 }), hv = L(sc, "value", vx, 305, 26, C.teal, { weight: 600 });
    const hd = L(sc, "the cache for ONE token", (kx + vx) / 2, 232, 26, C.dim);
    const hc = L(sc, `${nh} KV heads in each layer`, (kx + vx) / 2, 620, 22, C.dim);
    fadeIn(hd, at("k4", 0.4), 0.4);
    fadeIn([hk, hv], at("k4", 0.9), 0.4, { dy: 0 });
    rowEls.forEach((els, i) => fadeIn(els, at("k4", 1.4 + i * 0.5), 0.3, { dy: 0, stagger: 0.01 }));
    fadeIn(hc, at("k4", 3.9), 0.4);
    const fx = 1190, fy = 345;
    const fRows = [["2", "key and value"], [`× ${N.model.layers}`, "layers"], [`× ${nh}`, "KV heads"], [`× ${N.model.head_dim}`, "numbers per head"], [`× ${N.model.bytes}`, "bytes per number"]];
    const fHead = L(sc, `${N.model.name}, 16-bit`, 1330, 275, 24, C.dim);
    const fEls = fRows.map(([a, b], i) => [L(sc, a, fx, fy + i * 52, 30, C.fg, { anchor: "right", font: "mono" }), L(sc, b, fx + 24, fy + i * 52, 22, C.dim, { anchor: "left" })]);
    const fLine = line(sc, 1000, 585, 1560, 585, C.fg, 2);
    const fRes = L(sc, `= ${k(N.kv_per_token)} bytes`, 1290, 625, 34, C.yellow, { font: "mono", weight: 600 });
    const fRes2 = L(sc, `about ${Math.round(N.kv_per_token / 1000)} kilobytes for each token`, 1290, 672, 24, C.yellow);
    fadeIn(fHead, frac("k4", 0.5), 0.4);
    fEls.forEach((els, i) => fadeIn(els, frac("k4", 0.55) + i * 0.4, 0.3, { dy: 0 }));
    show(fLine, frac("k4", 0.55) + 5 * 0.4, 0.3);
    fadeIn(fRes, frac("k4", 0.85), 0.4);
    fadeIn(fRes2, frac("k4", 0.9), 0.4);
    fadeOut([hk, hv, hd, hc, ...rowEls.flat(), fHead, ...fEls.flat(), fLine, fRes, fRes2], at("k5", 0), 0.4);

    // k5: grouped-query attention
    const nq = N.model.q_heads, grp = nq / nh;
    const qx = i => 348 + i * 26 + Math.floor(i / grp) * 14;
    const panel = (yq, yk, kh, sqz, color, label1, label2) => {
      const q = [...Array(nq)].map((_, i) => dot(sc, qx(i), yq, 8, C.purple));
      const lines = [], kv = [];
      if (kh === nh) {
        for (let g = 0; g < nh; g++) {
          const gx = (qx(g * grp) + qx(g * grp + grp - 1)) / 2;
          kv.push(cell(sc, gx - sqz / 2, yk, sqz, sqz, color));
          for (let i = g * grp; i < (g + 1) * grp; i++) lines.push(line(sc, qx(i), yq + 8, gx, yk, hexA(C.fg, 0.3), 1.5));
        }
      } else {
        for (let i = 0; i < nq; i++) { kv.push(cell(sc, qx(i) - sqz / 2, yk, sqz, sqz, color)); lines.push(line(sc, qx(i), yq + 8, qx(i), yk, hexA(C.fg, 0.3), 1.5)); }
      }
      const l1 = L(sc, `${nq} query heads`, 110, yq, 22, C.purple, { anchor: "left" });
      const l2 = L(sc, `${kh} KV heads`, 110, yk + sqz / 2, 22, color, { anchor: "left" });
      return { els: [...q, ...lines, ...kv, l1, l2], q, kv, lines, l1, l2 };
    };
    const pa = panel(275, 350, nh, 38, C.teal);
    const pb = panel(545, 600, nq, 22, C.red);
    const ha = L(sc, "grouped-query attention (as published)", 800, 205, 26, C.teal, { weight: 600 });
    const hb = L(sc, "if each query head had its own KV head", 800, 490, 26, C.red, { weight: 600 });
    const ra = L(sc, `${Math.round(N.kv_per_token / 1000)} kilobytes per token`, 800, 430, 28, C.teal, { weight: 600 });
    const rb = L(sc, `${Math.round(N.kv_per_token_mha / 1000)} kilobytes per token: ${N.kv_ratio.toFixed(0)} times more`, 800, 670, 28, C.red, { weight: 600 });
    fadeIn([ha, ...pa.els], at("k5", 0.5), 0.5, { dy: 0 });
    fadeIn(ra, frac("k5", 0.42), 0.4);
    fadeIn([hb, ...pb.els], frac("k5", 0.5), 0.5, { dy: 0 });
    fadeIn(rb, frac("k5", 0.78), 0.4);
    fadeOut([ha, ...pa.els, ra, hb, ...pb.els, rb], at("k6", 0), 0.4);

    // k6: the cache grows with every request
    const BX = 200, BW = 1200, BY = 420, BH = 90, GB = N.gpu.mem_gb, px = g => g / GB * BW;
    const frame = rect(sc, BX, BY, BW, BH, C.dim, { fill: "none", rx: 10 });
    const wseg = cell(sc, BX + 2, BY + 2, px(N.weights_gb) - 2, BH - 4, hexA(C.blue, 0.85), { rx: 8 });
    const wl = L(sc, `weights ${N.weights_gb.toFixed(0)} GB`, BX + px(N.weights_gb) / 2, BY + BH + 36, 24, C.blue, { weight: 600 });
    const gl2 = L(sc, `GPU memory: ${GB.toFixed(0)} GB`, BX, BY - 90, 28, C.dim, { anchor: "left", weight: 600 });
    const segW = px(N.req_gb);
    const reqs = [...Array(N.req_fit)].map((_, i) => cell(sc, BX + px(N.weights_gb) + i * segW, BY + 2, segW - 2, BH - 4, hexA(C.yellow, 0.9), { rx: 3 }));
    const call = L(sc, `one request of ${k(N.ctx)} tokens: ${N.req_gb.toFixed(2)} GB`, BX + px(N.weights_gb) + segW / 2 + 90, BY - 40, 24, C.yellow, { weight: 600 });
    const cnt = L(sc, "", 800, 640, 34, C.yellow, { font: "mono" });
    const note = L(sc, "each new request adds the same, until the memory is full (other memory use is ignored)", 800, 730, 22, C.dim);
    show([frame, wseg], at("k6", 0.3), 0.4);
    fadeIn([wl, gl2], at("k6", 0.5), 0.4, { dy: 0 });
    show(reqs[0], at("k6", 1.2), 0.3);
    fadeIn(call, at("k6", 1.3), 0.4);
    tl.to(reqs.slice(1), { autoAlpha: 1, duration: 0.1, stagger: 0.04 }, at("k6", 2.6));
    fadeIn(cnt, at("k6", 2.5), 0.3);
    counter(cnt, at("k6", 2.6), 1, N.req_fit, 0.04 * (N.req_fit - 1) + 0.1, v => `${Math.round(v)} requests · ${(Math.round(v) * N.req_gb).toFixed(1)} GB of cache`);
    fadeIn(note, at("k6", 2.6) + 0.04 * N.req_fit, 0.4);
  }

  /* ---------------------------------------------------------------- 3 batching and paged memory */
  function batching(sc, N) {
    title(sc, "Batching and paged memory", "b1");
    // b1: a batch shares one read of the weights
    const mem = box(sc, 300, 480, 280, 130, C.teal, "memory", { size: 30, sub: "weights", subSize: 22 });
    const gpu = box(sc, 800, 480, 280, 130, C.blue, "GPU", { size: 30 });
    const rd = arrowTo(sc, 450, 480, 650, 480, C.fg, 5, 18);
    const rdL = L(sc, "one read", 550, 440, 24, C.fg);
    const rq = [0, 1, 2, 3].map(i => chip(sc, `request ${i + 1}`, COL[i], { x: 1260, y: 345 + i * 75, size: 26 }));
    const ra = rq.map((c, i) => arrowTo(sc, 945, 480 + (i - 1.5) * 18, 1160, 345 + i * 75, COL[i], 3, 12));
    fadeIn([...mem.els, ...gpu.els], at("b1", 0.7), 0.5, { dy: 0 });
    drawArrow(rd, at("b1", 1.3), 0.5);
    fadeIn(rdL, at("b1", 1.4), 0.4, { dy: 0 });
    rq.forEach((c, i) => { fadeIn(c, at("b1", 2.0) + i * 0.25, 0.3, { dy: 0 }); drawArrow(ra[i], at("b1", 2.0) + i * 0.25, 0.3); });
    const A = [...mem.els, ...gpu.els, ...ae(rd), rdL, ...rq, ...ra.flatMap(ae)];
    fadeOut(A, frac("b1", 0.36), 0.4);

    // the chart: tokens per second for each batch size (an upper limit from memory bandwidth)
    const BASE = 740, MAXH = 400, X0 = 260, PITCH = 170, BWD = 110;
    const maxT = Math.max(...N.curve.map(c => c.tps));
    const sub = L(sc, `${N.model.name} on one ${N.gpu.name} · upper limit from memory bandwidth · each request has a ${k(N.curve_ctx)}-token cache`, 800, 190, 21, C.dim);
    const base = line(sc, 200, BASE, 1440, BASE, C.grid, 2.5);
    const bars = N.curve.map((c, i) => {
      const h = c.tps / maxT * MAXH, x = X0 + i * PITCH;
      const r = cell(sc, x, BASE, BWD, 0, hexA(C.blue, 0.9), { rx: 6 });
      gsap.set(r, { attr: { height: 0, y: BASE } });
      const v = L(sc, k(c.tps), x + BWD / 2, BASE - h - 24, 26, C.fg, { font: "mono" });
      const b = L(sc, String(c.batch), x + BWD / 2, BASE + 30, 26, C.dim, { font: "mono" });
      return { r, v, b, h, y: BASE - h };
    });
    const xl = L(sc, "batch size (requests at the same time)", 800, 820, 24, C.dim);
    const yl = L(sc, "tokens per second (upper limit)", 240, 270, 22, C.dim, { anchor: "left" });
    const t0 = frac("b1", 0.4);
    fadeIn([sub, xl, yl], t0, 0.4, { dy: 0 });
    show(base, t0, 0.3);
    bars.forEach((b, i) => {
      tl.to(b.r, { autoAlpha: 1, attr: { height: b.h, y: b.y }, duration: 0.5, ease: "power2.out" }, t0 + 0.3 + i * 0.18);
      fadeIn([b.v, b.b], t0 + 0.5 + i * 0.18, 0.3, { dy: 0 });
    });
    const i1 = 0, i8 = N.curve.findIndex(c => c.batch === 8);
    tl.to(bars[i8].r, { fill: C.yellow, duration: 0.4 }, frac("b1", 0.72));
    tl.to(bars[i8].v, { color: C.yellow, duration: 0.4 }, frac("b1", 0.72));
    const gain = L(sc, `${(N.curve[i8].tps / N.curve[i1].tps).toFixed(1)}× more tokens per second with ${N.curve[i8].batch} requests`, X0 + 1.5 * PITCH + BWD / 2, 430, 28, C.yellow, { weight: 600 });
    fadeIn(gain, frac("b1", 0.78), 0.4);
    const chart = [sub, xl, yl, base, gain, ...bars.flatMap(b => [b.r, b.v, b.b])];
    fadeOut(chart, at("b2", 0), 0.4);

    // b2 and b3: static and continuous batching on the same requests
    const PT = 34, SQZ = 30, GX = 215, GY1 = 285, GY2 = 545;
    function schedule(g, y0, t, per, idleColor) {
      const cols = g[0].length, idle = [], all = [];
      for (let s = 0; s < g.length; s++) for (let c = 0; c < cols; c++) {
        const id = g[s][c], x = GX + c * PT, y = y0 + s * PT;
        const r = id < 0 ? cell(sc, x, y, SQZ, SQZ, hexA(C.red, 0), { stroke: C.faint, sw: 1.5, rx: 4 }) : cell(sc, x, y, SQZ, SQZ, hexA(COL[id % 8], 0.9));
        if (id < 0) idle.push(r);
        all.push([r, c]);
      }
      all.forEach(([r, c]) => show(r, t + c * per, 0.15));
      const labs = g.map((_, s) => L(sc, `slot ${s + 1}`, GX - 12, y0 + s * PT + SQZ / 2, 18, C.dim, { anchor: "right", font: "mono" }));
      return { idle, cols, all: all.map(a => a[0]), labs };
    }
    const hs = L(sc, "static batching", GX, 245, 28, C.orange, { anchor: "left", weight: 600 });
    const madeUp = L(sc, `made-up requests: ${N.lengths.join(", ")} tokens to write · ${N.slots} slots`, GX, 200, 21, C.dim, { anchor: "left" });
    fadeIn(madeUp, at("b2", 0.3), 0.4, { dy: 0 });
    const st = schedule(N.static, GY1, at("b2", 0.5), 0.09);
    fadeIn([hs, ...st.labs], at("b2", 0.4), 0.4, { dy: 0 });
    tl.to(st.idle, { fill: hexA(C.red, 0.3), stroke: C.red, duration: 0.5 }, frac("b2", 0.62));
    const ss = N.static_stats, cs = N.cont_stats;
    const sTxt = L(sc, `${ss.steps} steps · ${ss.idle} idle slot-steps · slots busy ${Math.round(ss.utilization * 100)} %`, GX, GY1 + 4 * PT + 24, 24, C.orange, { anchor: "left" });
    fadeIn(sTxt, frac("b2", 0.8), 0.4);
    const hc = L(sc, "continuous batching", GX, 505, 28, C.green, { anchor: "left", weight: 600 });
    const ct = schedule(N.continuous, GY2, at("b3", 0.4), 0.09);
    fadeIn([hc, ...ct.labs], at("b3", 0.3), 0.4, { dy: 0 });
    const cTxt = L(sc, `${cs.steps} steps · ${cs.idle} idle slot-steps · slots busy ${Math.round(cs.utilization * 100)} %`, GX, GY2 + 4 * PT + 24, 24, C.green, { anchor: "left" });
    fadeIn(cTxt, frac("b3", 0.62), 0.4);
    const xe = GX + cs.steps * PT - 2;
    const vl = line(sc, xe, 262, xe, GY2 + 4 * PT + 4, C.yellow, 2.5, "8 6");
    const vlL = L(sc, `${cs.steps} steps`, xe, 250, 22, C.yellow, { weight: 600 });
    show(vl, frac("b3", 0.64), 0.4);
    fadeIn(vlL, frac("b3", 0.66), 0.4, { dy: 0 });
    const B = [madeUp, hs, ...st.labs, ...st.all, sTxt, hc, ...ct.labs, ...ct.all, cTxt, vl, vlL];
    fadeOut(B, at("b4", 0), 0.4);

    // b4: reserved memory
    const S = 0.34, RY = 240, RPT = 54, XB = 215, XP = 960;
    const used = N.used, n = used.length;
    const hR = L(sc, `reserved: ${k(N.max_context)} tokens for each request`, XB, 205, 26, C.red, { anchor: "left", weight: 600 });
    const resv = used.map((u, i) => {
      const y = RY + i * RPT;
      const lab = L(sc, `request ${i + 1}`, 110, y + 17, 20, C.dim, { anchor: "left" });
      const full = rect(sc, XB, y, N.max_context * S, 34, C.red, { fill: hexA(C.red, 0.12), rx: 4, sw: 2, dash: "6 5" });
      const part = cell(sc, XB, y, u * S, 34, hexA(COL[i % 8], 0.9));
      return [lab, full, part];
    });
    fadeIn(hR, at("b4", 0.4), 0.4);
    resv.forEach((els, i) => fadeIn(els, at("b4", 0.8 + i * 0.3), 0.3, { dy: 0 }));
    const wasteTxt = L(sc, `${Math.round(N.mem.waste_contiguous * 100)} % of the memory is empty`, XB + N.max_context * S / 2, 690, 32, C.red, { weight: 600 });
    fadeIn(wasteTxt, frac("b4", 0.78), 0.5);
    const madeUp2 = L(sc, "made-up request lengths (tokens in each cache are the used part)", XB + N.max_context * S / 2, 735, 20, C.dim);
    fadeIn(madeUp2, frac("b4", 0.82), 0.4);

    // b5: paged blocks
    const hP = L(sc, `paged: blocks of ${N.block} tokens`, XP, 205, 26, C.green, { anchor: "left", weight: 600 });
    const bw = N.block * S;
    const paged = used.map((u, i) => {
      const y = RY + i * RPT, nb = N.mem.blocks[i];
      const bl = [...Array(nb)].map((_, j) => cell(sc, XP + j * bw, y, bw - 1, 34, hexA(COL[i % 8], 0.9), { rx: 1 }));
      return bl;
    });
    fadeIn(hP, at("b5", 0.4), 0.4);
    paged.forEach((bl, i) => fadeIn(bl, at("b5", 0.8 + i * 0.22), 0.3, { dy: 0, stagger: 0.003 }));
    const pw = L(sc, `${N.mem.waste_paged < 0.01 ? (N.mem.waste_paged * 100).toFixed(1) : Math.round(N.mem.waste_paged * 100)} % empty`, XP + 250, 690, 32, C.green, { weight: 600 });
    fadeIn(pw, frac("b5", 0.42), 0.5);
    // the block table of request 1
    const tb = N.table0, lg = tb.map((_, i) => String(i).padStart(2, " ")).join("  "), ph = tb.map(v => String(v).padStart(2, " ")).join("  ");
    const tbH = L(sc, "block table of request 1", XP, 800, 21, C.dim, { anchor: "left" });
    const tb1 = L(sc, `logical block   ${lg}  …`, XP, 830, 21, C.fg, { anchor: "left", font: "mono" });
    const tb2 = L(sc, `place in memory ${ph}  …`, XP, 860, 21, C.green, { anchor: "left", font: "mono" });
    fadeIn([tbH, tb1, tb2], frac("b5", 0.3), 0.4, { dy: 0, stagger: 0.15 });
    // shared system prompt
    const shared = paged.map(bl => bl.slice(0, N.mem.prefix_blocks));
    tl.to(shared.flat(), { fill: hexA(C.teal, 0.95), duration: 0.5, stagger: 0.002 }, frac("b5", 0.66));
    const shL = L(sc, `a ${k(N.prefix)}-token system prompt = ${N.mem.prefix_blocks} blocks, stored once`, XP, 728, 21, C.teal, { anchor: "left", weight: 600 });
    const shN = L(sc, `${k(N.mem.paged)} → ${k(N.mem.paged_shared)} tokens in memory`, XP, 758, 21, C.teal, { anchor: "left", weight: 600 });
    fadeIn([shL, shN], frac("b5", 0.7), 0.4, { stagger: 0.2 });
  }

  /* ---------------------------------------------------------------- 4 faster decoding */
  function speed(sc, N) {
    title(sc, "Faster decoding", "s1");
    const W = N.words, R = N.round;
    // s1: draft writes K tokens, the large model checks them in one pass
    const dl = L(sc, "draft model (small)", 110, 300, 24, C.blue, { anchor: "left", weight: 600 });
    const ctx = chip(sc, W[R.start], C.dim, { y: 300, size: 30 });
    const dr = R.draft.map(w => chip(sc, W[w], C.blue, { y: 300, size: 30 }));
    const all = [ctx, ...dr];
    const cx = rowLayout(all, 960, 22);
    const ctxL = L(sc, "context", cx[0], 345, 18, C.dim);
    const big = box(sc, 960, 520, 820, 110, C.purple, "large model", { size: 30, sub: `checks all ${N.K} draft tokens in one pass`, subSize: 22 });
    const arrs = dr.map((_, i) => arrowTo(sc, cx[i + 1], 340, cx[i + 1], 462, C.dim, 3, 12));
    fadeIn([dl, ctx, ctxL], at("s1", 0.4), 0.4, { dy: 0 });
    dr.forEach((c, i) => fadeIn(c, at("s1", 1.0 + i * 0.5), 0.3, { dx: -12, dy: 0 }));
    fadeIn(big.els, frac("s1", 0.52), 0.5, { dy: 0 });
    arrs.forEach((a, i) => drawArrow(a, frac("s1", 0.56) + i * 0.1, 0.4));

    // s2: keep the good tokens, replace the first bad one
    const oks = R.checks.map(c => c.ok);
    const marks = dr.map((_, i) => i < oks.length ? mark(sc, oks[i], cx[i + 1], 600) : L(sc, "dropped", cx[i + 1], 600, 22, C.dim));
    marks.forEach((m, i) => fadeIn(m, at("s2", 0.5 + i * 0.7), 0.3, { dy: 0 }));
    tl.to(dr[dr.length - 1], { opacity: 0.3, duration: 0.4 }, at("s2", 0.5 + 3 * 0.7));
    const outL = L(sc, "output", 110, 720, 24, C.green, { anchor: "left", weight: 600 });
    const out = R.kept.map((w, i) => chip(sc, W[w], i < oks.filter(Boolean).length ? C.green : C.purple, { y: 720, size: 30 }));
    const oc = rowLayout(out, 800, 20);
    const outN = L(sc, "written by the large model", oc[out.length - 1], 770, 18, C.purple);
    fadeIn(outL, frac("s2", 0.62), 0.4, { dy: 0 });
    out.forEach((c, i) => fadeIn(c, frac("s2", 0.66) + i * 0.3, 0.3, { dy: 0 }));
    fadeIn(outN, frac("s2", 0.66) + 0.9, 0.4, { dy: 0 });
    fadeOut([...big.els, ...arrs.flatMap(ae), outL, ...out, outN], at("s3", 0), 0.4);

    // s3: the rule and the test
    const rowsT = [["large model p", "p", C.purple], ["draft model q", "q", C.blue], ["keep chance min(1, p/q)", "ratio", C.fg], ["random number u", "u", C.dim]];
    const tbl = rowsT.map(([lab, key, col], r) => {
      const y = 410 + r * 46;
      return [L(sc, lab, 760, y, 20, C.dim, { anchor: "right" }), ...R.checks.map((c, i) => L(sc, c[key].toFixed(2), cx[i + 1], y, 24, col, { font: "mono" }))];
    });
    const rule = L(sc, "keep a draft token if u < min(1, p / q)", 960, 670, 30, C.yellow, { font: "mono", weight: 500 });
    const test = L(sc, `test: ${k(N.spec.trials)} texts of 3 words · distance to the exact large-model distribution`, 800, 742, 22, C.dim);
    const t1 = L(sc, `speculative decoding ${N.spec.tv_spec.toFixed(4)}`, 540, 790, 28, C.green, { font: "mono" });
    const t2 = L(sc, `large model alone ${N.spec.tv_plain.toFixed(4)}`, 1080, 790, 28, C.fg, { font: "mono" });
    const t3 = L(sc, "both are only sampling noise: the distributions are the same", 800, 836, 22, C.dim);
    tbl.forEach((els, i) => fadeIn(els, at("s3", 0.4 + i * 0.35), 0.3, { dy: 0 }));
    fadeIn(rule, frac("s3", 0.4), 0.5);
    fadeIn(test, frac("s3", 0.62), 0.4);
    fadeIn([t1, t2], frac("s3", 0.7), 0.4, { stagger: 0.2 });
    fadeIn(t3, frac("s3", 0.88), 0.4);
    fadeOut([dl, ctx, ctxL, ...dr, ...marks, ...tbl.flat(), rule, test, t1, t2, t3], at("s4", 0), 0.4);

    // s4: the numbers of the toy test
    const pct = L(sc, `${N.spec.accept.toFixed(0)} %`, 400, 330, 120, C.yellow, { font: "serif", weight: 600 });
    const pctL = L(sc, "of the draft tokens pass", 400, 430, 28, C.dim);
    const toyN = L(sc, `toy: 5 words, ${N.K} draft tokens in each round · tokens after a rejection are not checked`, 400, 480, 20, C.dim, { wrap: 420 });
    const SQ4 = 76, G4 = 10, X4 = 900;
    function bar(y, n, color, label) {
      const full = Math.floor(n), els = [];
      for (let i = 0; i < full; i++) els.push(cell(sc, X4 + i * (SQ4 + G4), y, SQ4, SQ4, hexA(color, 0.9), { rx: 8 }));
      if (n > full) els.push(cell(sc, X4 + full * (SQ4 + G4), y, SQ4 * (n - full), SQ4, hexA(color, 0.9), { rx: 8 }));
      const lab = L(sc, label, X4 - 24, y + SQ4 / 2, 24, C.dim, { anchor: "right" });
      const num = L(sc, `${n % 1 ? n.toFixed(1) : n} ${n === 1 ? "token" : "tokens"}`, X4 + n * (SQ4 + G4) + 20, y + SQ4 / 2, 28, color, { anchor: "left", weight: 600 });
      return [...els, lab, num];
    }
    const b1 = bar(300, 1, C.purple, "large model alone");
    const b2 = bar(460, N.spec.per_pass, C.green, "with a draft model");
    const bh = L(sc, "tokens kept in one pass of the large model", 1180, 250, 24, C.dim);
    fadeIn([pct, pctL, toyN], at("s4", 0.4), 0.5);
    fadeIn(bh, frac("s4", 0.5), 0.4);
    fadeIn(b1, frac("s4", 0.55), 0.4, { dy: 0, stagger: 0.05 });
    fadeIn(b2, frac("s4", 0.7), 0.4, { dy: 0, stagger: 0.05 });
    fadeOut([pct, pctL, toyN, bh, ...b1, ...b2], at("s5", 0), 0.4);

    // s5: quantization
    const qr = N.quant.row, qi = qr.q.findIndex(v => Math.abs(v) >= 3);
    const ex = L(sc, `one weight: ${qr.w[qi].toFixed(4)}  →  stored as the integer ${qr.q[qi]} (step ${qr.step.toFixed(3)})  →  read back as ${qr.w_hat[qi].toFixed(4)}`, 800, 235, 26, C.fg, { font: "mono" });
    const exN = L(sc, "4-bit integer × step", 800, 278, 22, C.dim);
    const colH = [L(sc, "weights", 260, 360, 22, C.dim, { anchor: "left" }), L(sc, "limit at batch size 1", 1050, 360, 22, C.dim, { anchor: "left" }), L(sc, "error of the weights", 1330, 360, 22, C.dim, { anchor: "left" })];
    const cols = [C.blue, C.teal, C.yellow];
    const errs = ["none", `${N.quant.err_int8} %`, `${N.quant.err_int4} %`];
    const qb = N.bits.map((b, i) => {
      const y = 410 + i * 95, w = b.gb / N.bits[0].gb * 640;
      return [L(sc, `${b.bits}-bit`, 230, y + 30, 26, cols[i], { anchor: "right", weight: 600 }),
        cell(sc, 260, y, w, 60, hexA(cols[i], 0.85), { rx: 8 }),
        L(sc, `${b.gb.toFixed(0)} GB`, 260 + w + 16, y + 30, 28, C.fg, { anchor: "left", font: "mono" }),
        L(sc, `${Math.round(b.tps)} tokens/s`, 1050, y + 30, 28, cols[i], { anchor: "left", font: "mono" }),
        L(sc, errs[i], 1330, y + 30, 28, i === 2 ? C.orange : C.fg, { anchor: "left", font: "mono" })];
    });
    const qn = L(sc, "error = size of the change in a random 64 × 64 weight matrix (a toy) · limit = memory bandwidth ÷ weight size, as in chapter 1", 800, 730, 20, C.dim);
    fadeIn([ex, exN], at("s5", 0.5), 0.5);
    fadeIn(colH, frac("s5", 0.4), 0.4, { dy: 0 });
    qb.forEach((els, i) => fadeIn(els, frac("s5", 0.45) + i * 0.7, 0.4, { dy: 0 }));
    fadeIn(qn, frac("s5", 0.9), 0.4);
  }

  /* ---------------------------------------------------------------- 5 cache and route */
  function cost(sc, N) {
    title(sc, "Cache and route", "c1");
    const opus = N.price["claude-opus-5-5"], haiku = N.price["claude-haiku-5-5"];
    const QS = ["How do I cancel my order?", "What is your return policy?", "Where is my parcel?"];
    // c1: many requests share a start
    const rows = QS.map((q, i) => {
      const y = 255 + i * 92;
      const lab = L(sc, `request ${i + 1}`, 110, y + 30, 22, C.dim, { anchor: "left" });
      const sh = rect(sc, 260, y, 800, 62, C.blue, { fill: hexA(C.blue, 0.18), rx: 10 });
      const shT = L(sc, "tools · system prompt · documents", 660, y + 31, 26, C.blue, { weight: 600 });
      const nq = rect(sc, 1080, y, 420, 62, C.orange, { fill: hexA(C.orange, 0.12), rx: 10 });
      const nqT = L(sc, q, 1290, y + 31, 22, C.orange);
      return [lab, sh, shT, nq, nqT];
    });
    rows.forEach((els, i) => fadeIn(els, at("c1", 0.6 + i * 0.5), 0.4, { dy: 0 }));
    const same = L(sc, "the same start every time", 660, 540, 26, C.blue, { weight: 600 });
    fadeIn(same, frac("c1", 0.45), 0.4);
    const cap = L(sc, "Claude Opus 5.5 list prices, input tokens (read 2026-11-22)", 800, 610, 22, C.dim);
    const pn = chip(sc, `normal input token: ${money(opus.input)} per million`, C.blue, { x: 520, y: 690, size: 26 });
    const pc = chip(sc, `cached input token: ${money(opus.cache_read)} per million`, C.green, { x: 1120, y: 690, size: 26 });
    fadeIn(cap, frac("c1", 0.6), 0.4);
    fadeIn(pn, frac("c1", 0.64), 0.4);
    fadeIn(pc, frac("c1", 0.8), 0.4);
    fadeOut([...rows.flat(), same, cap, pn, pc], at("c2", 0), 0.4);

    // c2: the stable text goes first
    function layout(y, firstBlue, ok) {
      const bx = firstBlue ? 250 : 590, qx = firstBlue ? 1030 : 250;
      const b = rect(sc, bx, y, 760, 70, C.blue, { fill: hexA(C.blue, 0.18), rx: 10 });
      const bt = L(sc, "tools · system prompt · documents", bx + 380, y + 35, 24, C.blue, { weight: 600 });
      const q = rect(sc, qx, y, 320, 70, C.orange, { fill: hexA(C.orange, 0.12), rx: 10 });
      const qt = L(sc, "new question", qx + 160, y + 35, 24, C.orange);
      const lab = L(sc, ok ? "stable text first: the start matches, so the cache works" : "changing text first: the start differs, so there is no cache hit",
        800, y + 120, 26, ok ? C.green : C.red, { weight: 600 });
      return [b, bt, q, qt, lab];
    }
    const la = layout(300, true, true), lb = layout(540, false, false);
    const br = bracketTop(sc, 250, 1010, 288, C.green);
    const mk = mark(sc, true, 1440, 335, 56), mk2 = mark(sc, false, 1440, 575, 56);
    fadeIn(la, at("c2", 0.5), 0.5, { dy: 0 });
    draw(br, frac("c2", 0.3), 0.5);
    fadeIn(mk, frac("c2", 0.32), 0.4, { dy: 0 });
    fadeIn(lb, frac("c2", 0.55), 0.5, { dy: 0 });
    fadeIn(mk2, frac("c2", 0.8), 0.4, { dy: 0 });
    fadeOut([...la, ...lb, br, mk, mk2], at("c3", 0), 0.4);

    // c3: the cost of 50 requests
    const C0 = N.cache, w0 = opus.cache_write_5m, r0 = opus.cache_read, i0 = opus.input;
    const first = C0.prefix * w0 / 1e6, rest = (C0.requests - 1) * C0.prefix * r0 / 1e6, fresh = C0.requests * C0.new * i0 / 1e6;
    const hd = L(sc, `claude-opus-5-5 · ${C0.requests} requests · ${k(C0.prefix)}-token start + ${C0.new} new tokens each · input cost`, 800, 200, 22, C.dim);
    const MAXW = 900, X = 330;
    const ba = cell(sc, X, 270, MAXW, 56, hexA(C.red, 0.85), { rx: 8 }), bb = cell(sc, X, 360, MAXW * C0.with / C0.without, 56, hexA(C.green, 0.85), { rx: 8 });
    const la1 = L(sc, "no cache", X - 20, 298, 26, C.red, { anchor: "right", weight: 600 }), lb1 = L(sc, "with cache", X - 20, 388, 26, C.green, { anchor: "right", weight: 600 });
    const va = L(sc, money(C0.without), X + MAXW + 20, 298, 34, C.red, { anchor: "left", font: "mono", weight: 600 });
    const vb = L(sc, money(C0.with), X + MAXW * C0.with / C0.without + 20, 388, 34, C.green, { anchor: "left", font: "mono", weight: 600 });
    const lines = [
      [`request 1 writes the cache:`, `${k(C0.prefix)} × ${money(w0)} / M = ${money(first, 3)}`],
      [`requests 2 to ${C0.requests} read it:`, `${C0.requests - 1} × ${k(C0.prefix)} × ${money(r0)} / M = ${money(rest, 3)}`],
      [`the new tokens of every request:`, `${C0.requests} × ${C0.new} × ${money(i0)} / M = ${money(fresh, 3)}`],
      [`total with cache:`, `${money(first + rest + fresh, 3)}   (no cache: ${money(C0.without, 3)})`],
      [`assumption:`, `all ${C0.requests} requests come within the 5-minute cache lifetime`],
    ];
    const bl = lines.map(([a, b], i) => [L(sc, a, 300, 505 + i * 52, 24, C.dim, { anchor: "left" }), L(sc, b, 760, 505 + i * 52, 24, i === 3 ? C.yellow : i === 4 ? C.dim : C.fg, { anchor: "left", font: "mono" })]);
    fadeIn(hd, at("c3", 0.4), 0.4);
    show(ba, at("c3", 0.8), 0.3);
    fadeIn([la1, va], at("c3", 0.8), 0.4, { dy: 0 });
    tl.to(bb, { autoAlpha: 1, duration: 0.3 }, frac("c3", 0.3));
    fadeIn([lb1, vb], frac("c3", 0.3), 0.4, { dy: 0 });
    bl.forEach((els, i) => fadeIn(els, frac("c3", 0.5) + i * 0.7, 0.4, { dy: 0 }));
    fadeOut([hd, ba, bb, la1, lb1, va, vb, ...bl.flat()], at("c4", 0), 0.4);

    // c4: a semantic cache can return a wrong answer
    const sem = N.semantic;
    const sh = L(sc, "a toy: TF-IDF stands in for an embedding model · a stored answer is used when the similarity is at least " + sem.threshold.toFixed(2), 800, 200, 20, C.dim);
    const BX = 760, BWD = 380;
    const thr = line(sc, BX + sem.threshold * BWD, 250, BX + sem.threshold * BWD, 650, C.yellow, 2.5, "8 6");
    const thrL = L(sc, `threshold ${sem.threshold.toFixed(2)}`, BX + sem.threshold * BWD, 232, 20, C.yellow, { weight: 600 });
    const srows = sem.rows.map((r, i) => {
      const y = 330 + i * 130, col = !r.hit ? C.dim : r.right ? C.green : C.red;
      const q = L(sc, r.query, 110, y, 28, C.fg, { anchor: "left", weight: 500 });
      const m = L(sc, `closest stored question: “${r.match}”`, 110, y + 38, 21, C.dim, { anchor: "left" });
      const bg = cell(sc, BX, y - 12, BWD, 24, hexA(C.fg, 0.08), { rx: 6 });
      const fl = cell(sc, BX, y - 12, BWD * r.similarity, 24, hexA(col, 0.9), { rx: 6 });
      const v = L(sc, r.similarity.toFixed(2), BX + BWD + 16, y, 24, C.fg, { anchor: "left", font: "mono" });
      const verdict = L(sc, !r.hit ? "no hit: ask the model" : r.right ? "hit: the answer is right" : "hit: the answer is WRONG", 1230, y + 38, 22, col, { anchor: "left", weight: 600 });
      return [q, m, bg, fl, v, verdict];
    });
    fadeIn([sh, thr, thrL], at("c4", 0.4), 0.4, { dy: 0 });
    srows.forEach((els, i) => fadeIn(els, at("c4", 0.9 + i * 1.1), 0.4, { dy: 0 }));
    fadeOut([sh, thr, thrL, ...srows.flat()], at("c5", 0), 0.4);

    // c5: routing
    const rt = N.routing;
    const pcs = rt.rows.map((r, i) => {
      const y = 280 + i * 70;
      const text = r.prompt.length > 34 ? r.prompt.slice(0, 33) + "…" : r.prompt;
      return chip(sc, text, r.easy ? C.blue : C.orange, { x: 320, y, size: 19 });
    });
    const router = box(sc, 800, 440, 200, 110, C.yellow, "router", { size: 30 });
    const small = box(sc, 1310, 320, 360, 130, C.green, "Claude Haiku 5.5", { size: 28, sub: `${money(haiku.input)} in · ${money(haiku.output)} out per M`, subSize: 20 });
    const large = box(sc, 1310, 560, 360, 130, C.purple, "Claude Opus 5.5", { size: 28, sub: `${money(opus.input)} in · ${money(opus.output)} out per M`, subSize: 20 });
    const nS = rt.rows.filter(r => r.model === "claude-haiku-5-5").length, nL = rt.rows.length - nS;
    const a1 = arrowTo(sc, 900, 420, 1128, 330, C.green, 4, 16), a2 = arrowTo(sc, 900, 460, 1128, 550, C.purple, 4, 16);
    const a0 = pcs.map(c => null);
    const c1l = L(sc, `${nS} easy prompts`, 1000, 322, 22, C.green, { weight: 600 }), c2l = L(sc, `${nL} hard prompts`, 1000, 565, 22, C.purple, { weight: 600 });
    const tot = L(sc, `all ${rt.rows.length} to Claude Opus 5.5: ${money(rt.all_large, 3)}    routed: ${money(rt.routed, 3)}    (${rt.pct.toFixed(0)} % less)`, 800, 760, 30, C.yellow, { font: "mono" });
    const tn = L(sc, `a toy rule: short prompts go to the small model · ${k(rt.in_tokens)} input + ${rt.out_tokens} output tokens for each request`, 800, 815, 20, C.dim);
    pcs.forEach((c, i) => fadeIn(c, at("c5", 0.4 + i * 0.25), 0.3, { dx: -10, dy: 0 }));
    fadeIn(router.els, frac("c5", 0.3), 0.4, { dy: 0 });
    drawArrow(a1, frac("c5", 0.42), 0.4); drawArrow(a2, frac("c5", 0.42), 0.4);
    fadeIn([...small.els, ...large.els], frac("c5", 0.48), 0.4, { dy: 0 });
    fadeIn([c1l, c2l], frac("c5", 0.55), 0.4, { dy: 0 });
    fadeIn([tot, tn], frac("c5", 0.72), 0.5);
    fadeOut([...pcs, ...router.els, ...small.els, ...large.els, ...ae(a1), ...ae(a2), c1l, c2l, tot, tn], at("c6", 0), 0.4);

    // c6: next episode, agents
    const nx = DATA.series[10];
    const model = box(sc, 520, 520, 260, 110, C.purple, "model", { size: 34 });
    const good = [chip(sc, "fast", C.blue, { x: 450, y: 640, size: 26 }), chip(sc, "cheap", C.yellow, { x: 590, y: 640, size: 26 })];
    const tools = box(sc, 1080, 520, 260, 110, C.blue, "tools", { size: 34 });
    const e1 = arrowTo(sc, 660, 490, 930, 490, C.fg, 4, 16), e2 = arrowTo(sc, 940, 550, 670, 550, C.fg, 4, 16);
    const e1l = L(sc, "tool call", 800, 458, 22, C.dim), e2l = L(sc, "result", 800, 592, 22, C.dim);
    const nxt = L(sc, `Next · Episode ${nx.n} · ${nx.title}`, 800, 300, 40, LEVEL_COLOR["Deep dive"], { weight: 600 });
    const rep = L(sc, "repeat until the task is done", 800, 700, 24, C.dim);
    fadeIn(model.els, at("c6", 0.3), 0.5, { dy: 0 });
    fadeIn(good, at("c6", 0.9), 0.4, { stagger: 0.3, dy: 0 });
    fadeIn(nxt, frac("c6", 0.45), 0.5);
    fadeIn(tools.els, frac("c6", 0.55), 0.4, { dy: 0 });
    drawArrow(e1, frac("c6", 0.62), 0.5); fadeIn(e1l, frac("c6", 0.64), 0.4, { dy: 0 });
    drawArrow(e2, frac("c6", 0.74), 0.5); fadeIn(e2l, frac("c6", 0.76), 0.4, { dy: 0 });
    fadeIn(rep, frac("c6", 0.86), 0.4);
  }

  return { phases, kvcache, batching, speed, cost };
})();
