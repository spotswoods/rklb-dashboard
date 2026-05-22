// Hand-built lightweight SVG charts for the RKLB dashboard.
// All charts share a small set of primitives: scale, axes, hover layer.
// Charts auto-rebuild on theme change.

(function () {
  const ns = 'http://www.w3.org/2000/svg';
  const fmtMoney = (v) => {
    const abs = Math.abs(v);
    if (abs >= 1000) return (v >= 0 ? '$' : '-$') + (abs / 1000).toFixed(2) + 'B';
    if (abs >= 1)    return (v >= 0 ? '$' : '-$') + abs.toFixed(abs < 10 ? 1 : 0) + 'M';
    return '$' + v.toFixed(2) + 'M';
  };
  const fmtPct = (v) => (v >= 0 ? '+' : '') + v.toFixed(0) + '%';
  const fmtNum = (v, suffix = '') => v.toFixed(v < 10 ? 1 : 0) + suffix;

  // ---------- Tooltip ----------
  let tipEl = null;
  function tip() {
    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.className = 'tooltip';
      document.body.appendChild(tipEl);
    }
    return tipEl;
  }
  function showTip(html, x, y) {
    const el = tip();
    el.innerHTML = html;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.classList.add('is-visible');
  }
  function hideTip() {
    if (tipEl) tipEl.classList.remove('is-visible');
  }

  // ---------- Helpers ----------
  function el(tag, attrs = {}, parent) {
    const node = document.createElementNS(ns, tag);
    for (const k in attrs) {
      if (attrs[k] != null) node.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(node);
    return node;
  }
  function cssVar(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim();
  }
  function niceMax(v) {
    if (v <= 0) return 10;
    const exp = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / exp;
    let nice;
    if (n <= 1) nice = 1;
    else if (n <= 2) nice = 2;
    else if (n <= 5) nice = 5;
    else nice = 10;
    return nice * exp;
  }
  function ticks(min, max, count = 5) {
    const out = [];
    const step = (max - min) / count;
    for (let i = 0; i <= count; i++) out.push(min + step * i);
    return out;
  }
  function clearSvg(svg) { while (svg.firstChild) svg.removeChild(svg.firstChild); }

  // ---------- Chart 1: Quarterly bar (revenue / opincome / bookings) ----------
  function barChart(host, data, opts = {}) {
    const W = host.clientWidth || 800;
    const H = opts.height || 320;
    const M = { top: 20, right: 24, bottom: 36, left: 56 };
    const innerW = W - M.left - M.right;
    const innerH = H - M.top - M.bottom;

    const svg = el('svg', { class: 'chart-svg', viewBox: `0 0 ${W} ${H}` });
    const values = data.map(d => d.v);
    const minV = Math.min(0, ...values);
    const maxV = Math.max(...values);
    const niceMaxV = niceMax(maxV * 1.08);
    const niceMinV = minV < 0 ? -niceMax(Math.abs(minV) * 1.1) : 0;

    const y = v => M.top + innerH - ((v - niceMinV) / (niceMaxV - niceMinV)) * innerH;
    const bw = innerW / data.length;
    const padBar = Math.max(2, bw * 0.18);

    // grid
    const yTicks = ticks(niceMinV, niceMaxV, 5);
    const grid = el('g', { class: 'chart-grid' }, svg);
    const axis = el('g', { class: 'chart-axis' }, svg);
    yTicks.forEach(t => {
      el('line', { x1: M.left, x2: W - M.right, y1: y(t), y2: y(t) }, grid);
      el('text', { x: M.left - 10, y: y(t) + 4, 'text-anchor': 'end' }, axis).textContent = opts.yFormat ? opts.yFormat(t) : fmtMoney(t);
    });
    // baseline at 0 if relevant
    if (niceMinV < 0) {
      el('line', { class: 'chart-baseline', x1: M.left, x2: W - M.right, y1: y(0), y2: y(0) }, svg);
    }
    // x labels — show ~every other
    data.forEach((d, i) => {
      if (i % Math.ceil(data.length / 12) === 0 || i === data.length - 1) {
        el('text', {
          x: M.left + bw * (i + 0.5), y: H - 14, 'text-anchor': 'middle'
        }, axis).textContent = d.q || d.y;
      }
    });

    // bars
    const accent = cssVar('--accent');
    const accentLine = cssVar('--accent-line');
    const positive = cssVar('--positive');
    const negative = cssVar('--negative');
    const fg3 = cssVar('--fg-3');

    data.forEach((d, i) => {
      const x = M.left + bw * i + padBar / 2;
      const w = bw - padBar;
      const yTop = d.v >= 0 ? y(d.v) : y(0);
      const yBot = d.v >= 0 ? y(0)   : y(d.v);
      const h = Math.max(1, yBot - yTop);

      let fill;
      if (opts.colorByType) {
        const projected = d.type === 'projected' || d.type === 'E';
        if (opts.profitColor) {
          if (d.v >= 0) fill = projected ? accentLine : positive;
          else          fill = projected ? 'rgba(255,107,133,0.4)' : negative;
        } else {
          fill = projected ? accentLine : accent;
        }
      } else {
        fill = opts.fill || accent;
      }

      const rect = el('rect', {
        class: 'chart-bar',
        x, y: yTop, width: w, height: h,
        rx: 3, fill,
      }, svg);

      // hover
      const hit = el('rect', {
        class: 'chart-hit',
        x: M.left + bw * i, y: M.top, width: bw, height: innerH
      }, svg);
      hit.addEventListener('mousemove', (e) => {
        rect.setAttribute('opacity', '0.75');
        const label = d.q || d.y;
        const valStr = opts.tipFormat ? opts.tipFormat(d.v) : fmtMoney(d.v);
        const tag = (d.type === 'projected' || d.type === 'E') ? ' · Projected' : (d.type ? ' · Actual' : '');
        const html =
          `<div class="label">${label}${tag}</div>
           <div class="value">${valStr}</div>`;
        showTip(html, e.clientX, e.clientY);
      });
      hit.addEventListener('mouseleave', () => {
        rect.removeAttribute('opacity');
        hideTip();
      });
    });

    clearSvg(host);
    host.appendChild(svg);
  }

  // ---------- Chart 2: Area / line over time ----------
  function areaChart(host, data, opts = {}) {
    const W = host.clientWidth || 800;
    const H = opts.height || 320;
    const M = { top: 20, right: 28, bottom: 36, left: 56 };
    const innerW = W - M.left - M.right;
    const innerH = H - M.top - M.bottom;

    const values = data.map(d => d.v);
    let minV = Math.min(...values);
    let maxV = Math.max(...values);
    if (opts.clamp) {
      minV = Math.max(minV, opts.clamp[0]);
      maxV = Math.min(maxV, opts.clamp[1]);
    }
    if (opts.includeZero && minV > 0) minV = 0;
    if (opts.includeZero && maxV < 0) maxV = 0;
    const pad = (maxV - minV) * 0.1;
    maxV += pad; minV -= pad;
    if (minV < 0 && maxV > 0) {
      // keep
    }

    const svg = el('svg', { class: 'chart-svg', viewBox: `0 0 ${W} ${H}` });

    const x = i => M.left + (i / (data.length - 1)) * innerW;
    const y = v => {
      const clamped = opts.clamp ? Math.min(Math.max(v, opts.clamp[0]), opts.clamp[1]) : v;
      return M.top + innerH - ((clamped - minV) / (maxV - minV)) * innerH;
    };

    // grid
    const yT = ticks(minV, maxV, 5);
    const grid = el('g', { class: 'chart-grid' }, svg);
    const axis = el('g', { class: 'chart-axis' }, svg);
    yT.forEach(t => {
      el('line', { x1: M.left, x2: W - M.right, y1: y(t), y2: y(t) }, grid);
      el('text', { x: M.left - 10, y: y(t) + 4, 'text-anchor': 'end' }, axis).textContent =
        opts.yFormat ? opts.yFormat(t) : fmtMoney(t);
    });
    if (minV < 0 && maxV > 0) {
      el('line', { class: 'chart-baseline', x1: M.left, x2: W - M.right, y1: y(0), y2: y(0) }, svg);
    }
    data.forEach((d, i) => {
      if (i % Math.ceil(data.length / 10) === 0 || i === data.length - 1) {
        el('text', { x: x(i), y: H - 14, 'text-anchor': 'middle' }, axis).textContent = d.q || d.y;
      }
    });

    const accent = cssVar('--accent');
    const positive = cssVar('--positive');

    // gradient defs
    const defs = el('defs', {}, svg);
    const grad = el('linearGradient', { id: `g-${Math.random().toString(36).slice(2)}`, x1: 0, x2: 0, y1: 0, y2: 1 }, defs);
    el('stop', { offset: '0%', 'stop-color': accent, 'stop-opacity': 0.45 }, grad);
    el('stop', { offset: '100%', 'stop-color': accent, 'stop-opacity': 0.0 }, grad);
    const gradId = grad.getAttribute('id');

    // Split actual vs projected for dashed line
    const splitIdx = data.findIndex(d => d.type === 'projected');
    const allPoints = data.map((d, i) => [x(i), y(d.v)]);

    // Build path for area
    const actualEnd = splitIdx === -1 ? data.length : splitIdx + 1;
    const actualPts = allPoints.slice(0, actualEnd);
    if (actualPts.length >= 2) {
      const linePath = actualPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
      const areaPath = linePath + ` L${actualPts[actualPts.length - 1][0]},${y(Math.max(0, minV))} L${actualPts[0][0]},${y(Math.max(0, minV))} Z`;
      el('path', { d: areaPath, fill: `url(#${gradId})` }, svg);
      el('path', { d: linePath, fill: 'none', stroke: accent, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, svg);
    }

    if (splitIdx !== -1) {
      const projPts = allPoints.slice(splitIdx);
      const projPath = projPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
      el('path', {
        d: projPath, fill: 'none', stroke: accent, 'stroke-width': 2,
        'stroke-dasharray': '5 5', opacity: 0.85
      }, svg);
    }

    // Optional secondary breakeven hint
    if (opts.breakeven && minV < 0 && maxV > 0) {
      el('text', {
        x: W - M.right, y: y(0) - 6, 'text-anchor': 'end', class: 'chart-axis'
      }, svg).textContent = 'Breakeven';
    }

    // Hover layer
    const cursor = el('line', {
      class: 'chart-cursor',
      x1: 0, x2: 0, y1: M.top, y2: M.top + innerH
    }, svg);
    const dot = el('circle', { class: 'chart-dot', r: 5, cx: 0, cy: 0 }, svg);
    const hit = el('rect', {
      class: 'chart-hit',
      x: M.left, y: M.top, width: innerW, height: innerH
    }, svg);
    hit.addEventListener('mousemove', (e) => {
      const rect = svg.getBoundingClientRect();
      const scale = rect.width / W;
      const px = (e.clientX - rect.left) / scale;
      const idx = Math.max(0, Math.min(data.length - 1, Math.round(((px - M.left) / innerW) * (data.length - 1))));
      const d = data[idx];
      const cx = x(idx); const cy = y(d.v);
      cursor.setAttribute('x1', cx); cursor.setAttribute('x2', cx);
      cursor.classList.add('is-visible');
      dot.setAttribute('cx', cx); dot.setAttribute('cy', cy);
      dot.classList.add('is-visible');
      const valStr = opts.tipFormat ? opts.tipFormat(d.v) : fmtMoney(d.v);
      const tag = (d.type === 'projected') ? ' · Projected' : ' · Actual';
      showTip(`<div class="label">${d.q || d.y}${tag}</div><div class="value">${valStr}</div>`, e.clientX, e.clientY);
    });
    hit.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-visible');
      dot.classList.remove('is-visible');
      hideTip();
    });

    clearSvg(host);
    host.appendChild(svg);
  }

  // ---------- Chart 3: Stacked bars (capacity) ----------
  function stackedBars(host, data, opts) {
    const W = host.clientWidth || 700;
    const H = opts.height || 320;
    const M = { top: 20, right: 24, bottom: 36, left: 56 };
    const innerW = W - M.left - M.right;
    const innerH = H - M.top - M.bottom;

    const keys = opts.keys; // ['l1','l2','l3','l4','l5']
    const totals = data.map(d => keys.reduce((a, k) => a + (d[k] || 0), 0));
    const maxV = niceMax(Math.max(...totals) * 1.08);
    const y = v => M.top + innerH - (v / maxV) * innerH;
    const bw = innerW / data.length;
    const padBar = Math.max(8, bw * 0.22);

    const svg = el('svg', { class: 'chart-svg', viewBox: `0 0 ${W} ${H}` });
    const grid = el('g', { class: 'chart-grid' }, svg);
    const axis = el('g', { class: 'chart-axis' }, svg);
    ticks(0, maxV, 5).forEach(t => {
      el('line', { x1: M.left, x2: W - M.right, y1: y(t), y2: y(t) }, grid);
      el('text', { x: M.left - 10, y: y(t) + 4, 'text-anchor': 'end' }, axis).textContent = t.toFixed(1) + ' GWh';
    });
    data.forEach((d, i) => {
      el('text', { x: M.left + bw * (i + 0.5), y: H - 14, 'text-anchor': 'middle' }, axis).textContent = d.y;
    });

    const colors = opts.colors || [];
    data.forEach((d, i) => {
      let cumulative = 0;
      keys.forEach((k, ki) => {
        const v = d[k] || 0;
        if (v <= 0) return;
        const yTop = y(cumulative + v);
        const yBot = y(cumulative);
        const h = Math.max(0, yBot - yTop - 1.5);
        const rect = el('rect', {
          class: 'chart-bar',
          x: M.left + bw * i + padBar / 2,
          y: yTop,
          width: bw - padBar,
          height: h,
          rx: 3,
          fill: colors[ki],
        }, svg);
        rect.addEventListener('mousemove', (e) => {
          rect.setAttribute('opacity', '0.75');
          showTip(
            `<div class="label">${d.y} · Line ${ki + 1}</div>
             <div class="value">${v.toFixed(2)} GWh</div>
             <div class="row"><span>Total</span><b>${totals[i].toFixed(2)} GWh</b></div>`,
            e.clientX, e.clientY
          );
        });
        rect.addEventListener('mouseleave', () => { rect.removeAttribute('opacity'); hideTip(); });
        cumulative += v;
      });
      // total label on top
      el('text', {
        x: M.left + bw * (i + 0.5), y: y(totals[i]) - 8, 'text-anchor': 'middle',
        class: 'chart-axis',
        style: `fill: var(--fg-1); font-weight: 600; font-size: 12px;`
      }, svg).textContent = totals[i].toFixed(1);
    });

    clearSvg(host);
    host.appendChild(svg);
  }

  // ---------- Chart 4: Sparkline ----------
  function sparkline(host, data, opts = {}) {
    const W = host.clientWidth || 72;
    const H = host.clientHeight || 28;
    const values = data.map(d => (typeof d === 'object' ? d.v : d));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const x = i => (i / (values.length - 1)) * W;
    const y = v => H - ((v - min) / range) * H;
    const pts = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');
    const svg = el('svg', { class: 'chart-svg', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none' });
    const accent = cssVar('--accent');
    const positive = cssVar('--positive');
    const negative = cssVar('--negative');
    const color = opts.tone === 'up' ? positive : opts.tone === 'down' ? negative : accent;

    // baseline fill
    const area = pts + ` L${W},${H} L0,${H} Z`;
    const grad = el('linearGradient', { id: `s-${Math.random().toString(36).slice(2)}`, x1: 0, x2: 0, y1: 0, y2: 1 }, el('defs', {}, svg));
    el('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': 0.4 }, grad);
    el('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': 0 }, grad);
    el('path', { d: area, fill: `url(#${grad.getAttribute('id')})` }, svg);
    el('path', { d: pts, fill: 'none', stroke: color, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, svg);

    clearSvg(host);
    host.appendChild(svg);
  }

  // ---------- Chart 5: Dual axis (revenue bars + margin line) ----------
  function dualBridge(host, data, opts = {}) {
    const W = host.clientWidth || 800;
    const H = opts.height || 320;
    const M = { top: 28, right: 60, bottom: 36, left: 70 };
    const innerW = W - M.left - M.right;
    const innerH = H - M.top - M.bottom;

    const maxRev = niceMax(Math.max(...data.map(d => d.rev)) * 1.1);
    const minGm = Math.min(-100, Math.min(...data.map(d => d.gm)) - 10);
    const maxGm = Math.max(50,    Math.max(...data.map(d => d.gm)) + 5);

    const yL = v => M.top + innerH - (v / maxRev) * innerH;
    const yR = v => M.top + innerH - ((v - minGm) / (maxGm - minGm)) * innerH;
    const bw = innerW / data.length;
    const padBar = Math.max(20, bw * 0.4);

    const svg = el('svg', { class: 'chart-svg', viewBox: `0 0 ${W} ${H}` });
    const grid = el('g', { class: 'chart-grid' }, svg);
    const axis = el('g', { class: 'chart-axis' }, svg);

    ticks(0, maxRev, 5).forEach(t => {
      el('line', { x1: M.left, x2: W - M.right, y1: yL(t), y2: yL(t) }, grid);
      el('text', { x: M.left - 10, y: yL(t) + 4, 'text-anchor': 'end' }, axis).textContent = fmtMoney(t);
    });
    ticks(minGm, maxGm, 5).forEach(t => {
      el('text', { x: W - M.right + 10, y: yR(t) + 4, 'text-anchor': 'start' }, axis).textContent = t.toFixed(0) + '%';
    });
    data.forEach((d, i) => {
      el('text', { x: M.left + bw * (i + 0.5), y: H - 14, 'text-anchor': 'middle' }, axis).textContent = d.y;
    });

    const accent = cssVar('--accent');
    const positive = cssVar('--positive');

    // bars
    data.forEach((d, i) => {
      const rect = el('rect', {
        class: 'chart-bar',
        x: M.left + bw * i + padBar / 2,
        y: yL(d.rev),
        width: bw - padBar,
        height: M.top + innerH - yL(d.rev),
        rx: 4,
        fill: accent, opacity: 0.85
      }, svg);
      rect.addEventListener('mousemove', e => {
        showTip(`<div class="label">${d.y}</div>
                 <div class="row"><span><span class="sw" style="background:${accent}"></span>Revenue</span><b>${fmtMoney(d.rev)}</b></div>
                 <div class="row"><span><span class="sw" style="background:${positive}"></span>Gross margin</span><b>${d.gm}%</b></div>`,
                 e.clientX, e.clientY);
      });
      rect.addEventListener('mouseleave', hideTip);
    });

    // line
    const lpts = data.map((d, i) => [M.left + bw * (i + 0.5), yR(d.gm)]);
    const lpath = lpts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
    el('path', { d: lpath, fill: 'none', stroke: positive, 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, svg);
    lpts.forEach(p => el('circle', { cx: p[0], cy: p[1], r: 4, fill: positive, stroke: cssVar('--bg-1'), 'stroke-width': 2 }, svg));

    clearSvg(host);
    host.appendChild(svg);
  }

  // ---------- Chart 6: Candlestick w/ event markers + live price ----------
  // data: [{ t:'YYYY-MM-DD', o,h,l,c,v }]
  // opts: { height, events:[{date,type,label,detail}], livePrice:Number, volume:Bool }
  function candlestick(host, data, opts = {}) {
    if (!data || !data.length) return;
    const W = host.clientWidth || 900;
    const H = opts.height || 380;
    const M = { top: 16, right: 58, bottom: 46, left: 12 };
    const volH = opts.volume === false ? 0 : 46;     // volume sub-panel height
    const evH = 22;                                    // event rail height
    const innerW = W - M.left - M.right;
    const priceH = H - M.top - M.bottom - volH - evH;

    const lows = data.map(d => d.l), highs = data.map(d => d.h);
    let minP = Math.min(...lows), maxP = Math.max(...highs);
    if (opts.livePrice && isFinite(opts.livePrice)) {
      minP = Math.min(minP, opts.livePrice); maxP = Math.max(maxP, opts.livePrice);
    }
    const padP = (maxP - minP) * 0.06 || 1;
    minP -= padP; maxP += padP;

    const n = data.length;
    const slot = innerW / n;
    const bodyW = Math.max(1.5, Math.min(9, slot * 0.62));
    const xMid = i => M.left + slot * (i + 0.5);
    const yP = v => M.top + priceH - ((v - minP) / (maxP - minP)) * priceH;

    const maxV = Math.max(...data.map(d => d.v || 0)) || 1;
    const volTop = M.top + priceH + evH;
    const yV = v => volTop + volH - (v / maxV) * volH;

    const svg = el('svg', { class: 'chart-svg', viewBox: `0 0 ${W} ${H}` });
    const up = cssVar('--positive'), down = cssVar('--negative');
    const grid = el('g', { class: 'chart-grid' }, svg);
    const axis = el('g', { class: 'chart-axis' }, svg);

    // price grid + right-axis labels
    ticks(minP, maxP, 5).forEach(t => {
      el('line', { x1: M.left, x2: W - M.right, y1: yP(t), y2: yP(t) }, grid);
      el('text', { x: W - M.right + 8, y: yP(t) + 4, 'text-anchor': 'start' }, axis).textContent = '$' + t.toFixed(2);
    });

    // x date labels (~every nth bar)
    const step = Math.ceil(n / 7);
    data.forEach((d, i) => {
      if (i % step === 0 || i === n - 1) {
        const dt = new Date(d.t + 'T00:00:00Z');
        const lbl = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
        el('text', { x: xMid(i), y: H - 26, 'text-anchor': 'middle' }, axis).textContent = lbl;
      }
    });

    // volume bars (subtle)
    if (volH) {
      data.forEach((d, i) => {
        const c = (d.c >= d.o) ? up : down;
        const h = Math.max(0.5, (d.v / maxV) * volH);
        el('rect', { x: xMid(i) - bodyW / 2, y: volTop + volH - h, width: bodyW, height: h, fill: c, opacity: 0.22 }, svg);
      });
    }

    // candles
    data.forEach((d, i) => {
      const isUp = d.c >= d.o;
      const col = isUp ? up : down;
      const x = xMid(i);
      // wick
      el('line', { x1: x, x2: x, y1: yP(d.h), y2: yP(d.l), stroke: col, 'stroke-width': 1 }, svg);
      // body
      const yo = yP(d.o), yc = yP(d.c);
      const top = Math.min(yo, yc), hgt = Math.max(1, Math.abs(yc - yo));
      el('rect', { x: x - bodyW / 2, y: top, width: bodyW, height: hgt, fill: col, rx: 0.5 }, svg);
    });

    // live price line + label
    if (opts.livePrice && isFinite(opts.livePrice)) {
      const y = yP(opts.livePrice);
      el('line', { x1: M.left, x2: W - M.right, y1: y, y2: y, stroke: cssVar('--accent'), 'stroke-width': 1, 'stroke-dasharray': '4 3', opacity: 0.9 }, svg);
      const tagW = 52;
      el('rect', { x: W - M.right, y: y - 9, width: tagW, height: 18, rx: 3, fill: cssVar('--accent') }, svg);
      el('text', { x: W - M.right + tagW / 2, y: y + 4, 'text-anchor': 'middle', style: `fill:#02130E;font-weight:700;font-size:11px;font-family:var(--font-mono)` }, svg).textContent = '$' + opts.livePrice.toFixed(2);
    }

    // event markers on a rail just below the price panel
    const railY = M.top + priceH + evH / 2;
    const evColors = {
      earnings: cssVar('--blue') || '#58a6ff',
      'insider-buy': up,
      'insider-sell': down,
      deal: cssVar('--brand-violet') || '#7C7CFF',
      regulatory: cssVar('--accent')
    };
    const evGlyph = { earnings: 'E', 'insider-buy': '▲', 'insider-sell': '▼', deal: '◆', regulatory: '§' };
    const dateToIdx = (ds) => {
      // nearest bar at or before the event date
      let idx = -1;
      for (let i = 0; i < n; i++) { if (data[i].t <= ds) idx = i; else break; }
      return idx === -1 ? 0 : idx;
    };
    (opts.events || []).forEach(ev => {
      const i = dateToIdx(ev.date);
      const x = xMid(i);
      const col = evColors[ev.type] || cssVar('--accent');
      // faint vertical guide
      el('line', { x1: x, x2: x, y1: M.top, y2: M.top + priceH, stroke: col, 'stroke-width': 1, 'stroke-dasharray': '2 4', opacity: 0.25 }, svg);
      const g = el('g', {}, svg);
      el('circle', { cx: x, cy: railY, r: 7, fill: col, opacity: 0.92 }, g);
      el('text', { x: x, y: railY + 3, 'text-anchor': 'middle', style: `fill:#02130E;font-weight:700;font-size:8.5px` }, g).textContent = evGlyph[ev.type] || '•';
      // hover area
      const hit = el('rect', { x: x - 9, y: railY - 9, width: 18, height: 18, fill: 'transparent', style: 'cursor:pointer' }, g);
      const fmtDate = new Date(ev.date + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
      hit.addEventListener('mousemove', e => {
        showTip(`<div class="label">${fmtDate}</div><div class="value" style="font-size:13px">${ev.label}</div>${ev.detail ? `<div class="row" style="margin-top:4px;color:var(--fg-2)">${ev.detail}</div>` : ''}`, e.clientX, e.clientY);
      });
      hit.addEventListener('mouseleave', hideTip);
    });

    // crosshair + OHLC tooltip over the price panel
    const cursor = el('line', { class: 'chart-cursor', x1: 0, x2: 0, y1: M.top, y2: M.top + priceH }, svg);
    const hit = el('rect', { class: 'chart-hit', x: M.left, y: M.top, width: innerW, height: priceH }, svg);
    hit.addEventListener('mousemove', e => {
      const rect = svg.getBoundingClientRect();
      const scale = rect.width / W;
      const px = (e.clientX - rect.left) / scale;
      const i = Math.max(0, Math.min(n - 1, Math.floor((px - M.left) / slot)));
      const d = data[i];
      const x = xMid(i);
      cursor.setAttribute('x1', x); cursor.setAttribute('x2', x); cursor.classList.add('is-visible');
      const chg = d.c - d.o, pct = d.o ? (chg / d.o) * 100 : 0;
      const sign = chg >= 0 ? '+' : '';
      const fmtDate = new Date(d.t + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
      showTip(
        `<div class="label">${fmtDate}</div>
         <div class="row"><span>O</span><b>$${d.o.toFixed(2)}</b></div>
         <div class="row"><span>H</span><b>$${d.h.toFixed(2)}</b></div>
         <div class="row"><span>L</span><b>$${d.l.toFixed(2)}</b></div>
         <div class="row"><span>C</span><b style="color:${chg>=0?up:down}">$${d.c.toFixed(2)} (${sign}${pct.toFixed(1)}%)</b></div>
         <div class="row"><span>Vol</span><b>${(d.v/1e6).toFixed(1)}M</b></div>`,
        e.clientX, e.clientY
      );
    });
    hit.addEventListener('mouseleave', () => { cursor.classList.remove('is-visible'); hideTip(); });

    clearSvg(host);
    host.appendChild(svg);
  }

  // ---------- Public API ----------
  window.RKLB_CHARTS = { barChart, areaChart, stackedBars, sparkline, dualBridge, candlestick, fmtMoney, fmtPct, fmtNum };
})();
