// RKLB Investor Dashboard — main app
// Renders KPIs, tables, charts, and section content for Rocket Lab (NASDAQ: RKLB):
//   • Neutron + Space Systems (terms + narrative)
//   • Capital structure (cash, debt, preferred, reading-guide note)
//   • Vehicle/platform specs + launch & space-systems competitive landscape
// Quote strategy (best → fallback):
//   1. Finnhub REST poll every ~25s (near-live, free key in CONFIG below)
//   2. data/quote.json — GitHub Action snapshot (~5 min, no key)
//   3. Stooq direct (local dev only; CORS-blocked on github.io)
// Whichever is available wins; the page never breaks if the key is absent.
(function () {
  const D = window.RKLB_DATA;
  const C = window.RKLB_CHARTS;

  // ╔═══════════════════════════════════════════════════════════════╗
  // ║  CONFIG — near-live quote (optional)                          ║
  // ║                                                                ║
  // ║  Paste a FREE Finnhub key to upgrade the quote from the        ║
  // ║  ~5-min GitHub-Action snapshot to a ~25-second live poll.      ║
  // ║  Get one (30 seconds, no card) at:  https://finnhub.io/register║
  // ║                                                                ║
  // ║  The key is read-only quote access. It is visible in this      ║
  // ║  public file — that's expected/acceptable for a free quote     ║
  // ║  key. If it's blank or rate-limited, the page automatically    ║
  // ║  falls back to data/quote.json (the GitHub Action), so nothing ║
  // ║  ever breaks. You can also append ?finnhub=YOUR_KEY to the URL ║
  // ║  or set localStorage 'rklb-finnhub-key' to override at runtime.║
  // ╚═══════════════════════════════════════════════════════════════╝
  const CONFIG = {
    FINNHUB_KEY: 'd2tku99r01qr5a733ra0d2tku99r01qr5a733rag',  // free read-only quote key
    POLL_SECONDS: 25     // live refresh cadence while the tab is visible
  };
  // Runtime overrides (so you can test without committing a key)
  try {
    const urlKey = new URLSearchParams(location.search).get('finnhub');
    if (urlKey) CONFIG.FINNHUB_KEY = urlKey;
    else {
      const lsKey = localStorage.getItem('rklb-finnhub-key');
      if (lsKey) CONFIG.FINNHUB_KEY = lsKey;
    }
  } catch (e) { /* ignore */ }

  // ---------- Theme ----------
  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('rklb-theme', t);
    document.querySelectorAll('[data-theme-icon]').forEach(el => { el.dataset.themeIcon = t; });
    setTimeout(() => renderAllCharts(), 50);
  }
  function initTheme() { setTheme(localStorage.getItem('rklb-theme') || 'dark'); }

  // ---------- Ticker ----------
  function setEl(sel, txt) {
    const el = document.querySelector(sel);
    if (el) el.textContent = txt;
  }
  function renderTicker() {
    const t = D.ticker;
    if (t.price > 0) {
      setEl('[data-tk-price]', '$' + t.price.toFixed(2));
      const ch = document.querySelector('[data-tk-change]');
      if (ch) {
        const sign = t.change >= 0 ? '+' : '';
        ch.textContent = `${sign}${t.change.toFixed(2)} (${sign}${t.changePct.toFixed(2)}%)`;
        ch.className = 'ticker__item ' + (t.change >= 0 ? 'up' : 'down');
        ch.style.color = t.change >= 0 ? 'var(--positive)' : 'var(--negative)';
      }
      setEl('[data-tk-mcap]', '$' + (t.marketCap / 1000).toFixed(2) + 'B');
      setEl('[data-tk-vol]',  t.volume ? t.volume.toFixed(1) + 'M' : '—');
      setEl('[data-tk-52h]',  t.high52 ? '$' + t.high52.toFixed(2) : '—');
      setEl('[data-tk-52l]',  t.low52  ? '$' + t.low52.toFixed(2)  : '—');
    }
  }

  // ---------- Hero ----------
  function renderHero() {
    const t = D.ticker;
    if (t.price > 0) {
      setEl('[data-hero-price]', '$' + t.price.toFixed(2));
      const ch = document.querySelector('[data-hero-change]');
      if (ch) {
        const sign = t.change >= 0 ? '+' : '';
        const arrow = t.change >= 0
          ? '<svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 8 L6 3 L10 8 Z" fill="currentColor"/></svg>'
          : '<svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 4 L6 9 L10 4 Z" fill="currentColor"/></svg>';
        ch.innerHTML = `${arrow} ${sign}$${t.change.toFixed(2)} · ${sign}${t.changePct.toFixed(2)}%`;
        ch.style.background = t.change >= 0 ? 'var(--positive-soft)' : 'var(--negative-soft)';
        ch.style.color = t.change >= 0 ? 'var(--positive)' : 'var(--negative)';
      }
    }
    setEl('[data-hero-asof]', t.asOf);
  }

  // ---------- Live quote ----------
  // Strategy:
  //   1. Try data/quote.json (same-origin, refreshed by GitHub Action from a
  //      Google Sheet pulling =GOOGLEFINANCE("NASDAQ:RKLB", ...)). This works
  //      on GitHub Pages because there's no cross-origin request.
  //   2. Fallback: direct Stooq fetch (works on file:// + permissive browsers
  //      but is blocked by CORS from github.io — that's expected).
  //   3. If both fail, the page renders gracefully without a live price.
  function setQuoteUnavailable(reason) {
    setEl('[data-tk-price]', '$—');
    const ch = document.querySelector('[data-tk-change]');
    if (ch) ch.textContent = 'quote unavailable';
    setEl('[data-hero-price]', '$—');
    const hc = document.querySelector('[data-hero-change]');
    if (hc) hc.textContent = 'live quote unavailable — see your broker';
    setEl('[data-hero-asof]', reason || 'no source reachable');
  }

  let __lastPrice = null;
  function flashPrice(direction) {
    const cls = direction > 0 ? 'tick-up' : 'tick-down';
    ['[data-tk-price]', '[data-hero-price]'].forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.classList.remove('tick-up', 'tick-down');
      // force reflow so the animation restarts even on consecutive ticks
      void el.offsetWidth;
      el.classList.add(cls);
    });
  }

  function applyQuote(q, sourceLabel) {
    if (!q || !isFinite(q.price) || q.price <= 0) return false;
    // Tick flash only on a genuine change from a prior live value
    if (__lastPrice != null && q.price !== __lastPrice) {
      flashPrice(q.price > __lastPrice ? 1 : -1);
    }
    __lastPrice = q.price;
    D.ticker.price = q.price;
    D.ticker.change = isFinite(q.change) ? q.change : 0;
    D.ticker.changePct = isFinite(q.changePct) ? q.changePct
                       : (D.ticker.change && q.price ? (D.ticker.change / (q.price - D.ticker.change)) * 100 : 0);
    // Preserve last-known slow-moving fields if this source doesn't carry them
    D.ticker.volume = isFinite(q.volume) ? q.volume : (D.ticker.volume || 0);
    D.ticker.high52 = isFinite(q.high52) && q.high52 > 0 ? q.high52 : (D.ticker.high52 || 0);
    D.ticker.low52  = isFinite(q.low52)  && q.low52  > 0 ? q.low52  : (D.ticker.low52  || 0);
    D.ticker.marketCap = isFinite(q.marketCap) && q.marketCap > 0
      ? q.marketCap
      : q.price * D.ticker.shares;
    D.ticker.asOf = sourceLabel + (q.asof ? ' · ' + q.asof : ' · ' + new Date().toLocaleString());
    renderTicker();
    renderHero();
    renderScenarios();  // recompute upside vs. live price
    renderPriceChart(); // overlay live price onto the candlestick (no-op until history loads)
    return true;
  }

  // ---------- Finnhub (near-live, key required) ----------
  // /quote returns { c: current, d: change, dp: %change, h, l, o, pc, t }
  // Free tier: real-time US equities, 60 calls/min, CORS-enabled.
  async function loadFromFinnhub(isPoll) {
    if (!CONFIG.FINNHUB_KEY) return false;
    try {
      const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=RKLB&token=${encodeURIComponent(CONFIG.FINNHUB_KEY)}`, { cache: 'no-store' });
      if (!r.ok) return false;
      const q = await r.json();
      if (!q || !isFinite(q.c) || q.c === 0) return false;
      const stamp = q.t ? new Date(q.t * 1000) : new Date();
      return applyQuote({
        price: q.c,
        change: isFinite(q.d) ? q.d : null,
        changePct: isFinite(q.dp) ? q.dp : null,
        // keep volume / 52w / mcap from the JSON baseline (set on first load)
        marketCap: q.c * D.ticker.shares,
        asof: 'live · ' + stamp.toLocaleTimeString()
      }, 'Finnhub');
    } catch (e) {
      return false;
    }
  }
  // One-time metrics pull for 52-week range (not in /quote)
  async function loadFinnhubMetrics() {
    if (!CONFIG.FINNHUB_KEY) return;
    try {
      const r = await fetch(`https://finnhub.io/api/v1/stock/metric?symbol=RKLB&metric=all&token=${encodeURIComponent(CONFIG.FINNHUB_KEY)}`, { cache: 'no-store' });
      if (!r.ok) return;
      const j = await r.json();
      const m = (j && j.metric) || {};
      if (isFinite(m['52WeekHigh'])) D.ticker.high52 = m['52WeekHigh'];
      if (isFinite(m['52WeekLow']))  D.ticker.low52  = m['52WeekLow'];
      renderTicker();
    } catch (e) { /* non-fatal */ }
  }

  // ---------- Price history candlestick ----------
  let priceBars = null;
  async function loadHistory() {
    try {
      const r = await fetch('data/history.json', { cache: 'no-store' });
      if (!r.ok) return;
      const j = await r.json();
      priceBars = (j && j.bars && j.bars.length) ? j.bars : null;
      renderPriceChart();
    } catch (e) { /* chart simply won't show if history is unavailable */ }
  }
  function renderPriceChart() {
    const host = document.querySelector('[data-chart-price]');
    if (!host || !priceBars) return;
    const live = D.ticker.price;
    let bars = priceBars;
    // Overlay the live price onto TODAY's bar only (don't mutate a stale last bar)
    if (live > 0 && priceBars.length) {
      const todayStr = new Date().toISOString().slice(0, 10);
      if (priceBars[priceBars.length - 1].t === todayStr) {
        bars = priceBars.slice();
        const last = Object.assign({}, bars[bars.length - 1]);
        last.c = live;
        last.h = Math.max(last.h, live);
        last.l = Math.min(last.l, live);
        bars[bars.length - 1] = last;
      }
    }
    C.candlestick(host, bars, {
      events: D.priceEvents || [],
      livePrice: live > 0 ? live : null,
      height: 380
    });
  }

  // ---------- Live polling (visibility-aware) ----------
  let __pollTimer = null;
  function startLivePolling() {
    if (!CONFIG.FINNHUB_KEY || __pollTimer) return;
    const tick = () => { if (document.visibilityState === 'visible') loadFromFinnhub(true); };
    __pollTimer = setInterval(tick, Math.max(10, CONFIG.POLL_SECONDS) * 1000);
    // Refresh immediately whenever the tab regains focus (price may be stale)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') loadFromFinnhub(true);
    });
  }

  async function loadFromGoogleSheetJson() {
    try {
      const r = await fetch('data/quote.json', { cache: 'no-store' });
      if (!r.ok) return false;
      const j = await r.json();
      if (j.price == null || !isFinite(j.price)) return false;
      // GOOGLEFINANCE returns volume as raw shares (e.g. 18400000). Normalize to millions.
      const volMillions = isFinite(j.volume) && j.volume > 0 ? j.volume / 1e6 : 0;
      const mcapMillions = isFinite(j.marketcap) && j.marketcap > 0 ? j.marketcap / 1e6 : 0;
      return applyQuote({
        price: j.price,
        change: j.change,
        changePct: j.changepct,
        volume: volMillions,
        high52: j.high52,
        low52: j.low52,
        marketCap: mcapMillions,
        asof: j._refreshed ? new Date(j._refreshed).toLocaleString() : null
      }, 'Google Finance via GitHub Action');
    } catch (e) {
      return false;
    }
  }

  async function loadFromStooq() {
    try {
      const r = await fetch('https://stooq.com/q/l/?s=rklb.us&f=sd2t2ohlcv&h&e=csv');
      const txt = await r.text();
      const rows = txt.trim().split('\n');
      if (rows.length < 2) return false;
      const cells = rows[1].split(',');
      const o = parseFloat(cells[3]);
      const c = parseFloat(cells[6]);
      const v = parseInt(cells[7], 10);
      if (!isFinite(c) || c === 0) return false;
      const chg = c - o;
      const pct = o ? (chg / o) * 100 : 0;
      // Try 52w
      let high52 = 0, low52 = 0;
      try {
        const today = new Date();
        const past = new Date(); past.setFullYear(past.getFullYear() - 1);
        const fmt = d => d.toISOString().slice(0, 10).replace(/-/g, '');
        const hr = await fetch(`https://stooq.com/q/d/l/?s=rklb.us&d1=${fmt(past)}&d2=${fmt(today)}&i=d`);
        const ht = await hr.text();
        const hrows = ht.trim().split('\n').slice(1);
        const closes = hrows.map(r => parseFloat(r.split(',')[4])).filter(isFinite);
        if (closes.length) { high52 = Math.max(...closes); low52 = Math.min(...closes); }
      } catch (e) { /* non-fatal */ }
      return applyQuote({
        price: c, change: chg, changePct: pct,
        volume: isFinite(v) ? v / 1e6 : 0,
        high52, low52, marketCap: c * D.ticker.shares
      }, 'Stooq (delayed)');
    } catch (e) {
      return false;
    }
  }

  async function loadQuote() {
    // 1. Baseline from the GitHub-Action JSON (volume, 52w range, market cap).
    const gotJson = await loadFromGoogleSheetJson();

    // 2. If a Finnhub key is configured, overlay a near-live price + start polling.
    if (CONFIG.FINNHUB_KEY) {
      loadFinnhubMetrics();                // one-time 52w range (async, non-blocking)
      const gotLive = await loadFromFinnhub(false);
      if (gotLive) { startLivePolling(); return; }
    }

    // 3. Fallbacks if we have nothing yet.
    if (gotJson) return;
    if (await loadFromStooq()) return;
    setQuoteUnavailable('Add a free Finnhub key (see README) or configure the GOOGLEFINANCE sheet');
  }

  // ---------- KPIs ----------
  function renderKpis() {
    const grid = document.querySelector('[data-kpis]');
    if (!grid) return;
    grid.innerHTML = '';
    const sparkData = [
      D.quarterlyRevenue.slice(-8).map(d => d.v),
      D.annualRevenue.map(d => d.v),
      D.backlog.slice(-8).map(d => d.v),
      D.funnel.map(d => d.value),
      D.liquidity.slice(-8).map(d => d.v),
      D.grossMargin.slice(-8).map(d => d.v),
    ];
    D.kpis.forEach((k, i) => {
      const node = document.createElement('div');
      node.className = 'kpi';
      const arrow = k.tone === 'up' ? '↑' : k.tone === 'down' ? '↓' : '→';
      node.innerHTML = `
        <div class="kpi__label">${k.label}</div>
        <div class="kpi__value">${k.value}</div>
        <div class="kpi__delta ${k.tone}">${arrow} ${k.delta}</div>
        <div class="kpi__spark" data-spark="${i}"></div>`;
      grid.appendChild(node);
    });
    sparkData.forEach((sd, i) => {
      const host = document.querySelector(`[data-spark="${i}"]`);
      if (host) C.sparkline(host, sd, { tone: D.kpis[i].tone });
    });
  }

  // ---------- Charts wiring ----------
  let chartTasks = [];
  function chart(selector, fn) { chartTasks.push({ selector, fn }); }
  function renderAllCharts() {
    chartTasks.forEach(t => {
      const host = document.querySelector(t.selector);
      if (host) t.fn(host);
    });
    renderKpis();
  }

  // ---------- Tables ----------
  function renderQuarterTable() {
    const tbody = document.querySelector('[data-q-table] tbody');
    if (!tbody) return;
    tbody.innerHTML = D.quarterTable.map(r => `
      <tr>
        <td><b>${r.q}</b></td>
        <td class="num">${C.fmtMoney(r.rev)}</td>
        <td class="num ${r.gm >= 0 ? 'pos' : 'neg'}">${r.gm.toFixed(0)}%</td>
        <td class="num ${r.op >= 0 ? 'pos' : 'neg'}">${C.fmtMoney(r.op)}</td>
        <td class="num">${C.fmtMoney(r.liq)}</td>
        <td><span class="pill ${r.type === 'A' ? 'delivering' : 'mixed'}">${r.type === 'A' ? 'Actual' : 'Projected'}</span></td>
      </tr>`).join('');
  }

  function renderContracts() {
    const tbody = document.querySelector('[data-contracts] tbody');
    if (!tbody) return;
    tbody.innerHTML = D.contracts.map(r => `
      <tr>
        <td><b>${r.customer}</b></td>
        <td class="num">${r.mwh}</td>
        <td>${r.region}</td>
        <td><span class="pill ${r.status.toLowerCase()}">${r.status}</span></td>
        <td class="num">${r.value}</td>
      </tr>`).join('');
  }

  function renderScenarios() {
    const grid = document.querySelector('[data-scenarios]');
    if (!grid) return;
    // Anchor upside math to live price (with $125 fallback if quote hasn't loaded).
    const live = D.ticker.price > 0;
    const anchor = live ? D.ticker.price : 125.00;
    const anchorLabel = live ? `current $${anchor.toFixed(2)}` : '$125 ref';
    grid.innerHTML = D.scenarios.map(s => {
      const pct = ((s.price - anchor) / anchor) * 100;
      const upStr = (pct >= 0 ? '+' : '') + pct.toFixed(0) + '%';
      const tone = pct >= 0 ? 'up' : 'down';
      return `<div class="scenario ${s.name.toLowerCase().replace(' ', '-')} ${s.name === 'Bull' ? 'bull' : ''}">
        <div class="scenario__name">${s.name} case</div>
        <div class="scenario__price">$${s.price.toFixed(2)}</div>
        <div class="scenario__upside ${tone}">${upStr} vs. ${anchorLabel}</div>
        <div class="scenario__row"><span class="k">FY28 Revenue</span><span class="v">${C.fmtMoney(s.rev)}</span></div>
        <div class="scenario__row"><span class="k">EV / Revenue</span><span class="v">${s.ev.toFixed(1)}x</span></div>
        <div class="scenario__row"><span class="k">Implied mcap</span><span class="v">$${(s.mcap / 1000).toFixed(2)}B</span></div>
      </div>`;
    }).join('');
  }

  function renderFunnel() {
    const host = document.querySelector('[data-funnel]');
    if (!host) return;
    host.innerHTML = D.funnel.map((f, i) => `
      <div class="funnel__row s${i + 1}">
        <div class="stage">${f.stage}</div>
        <div class="bar"></div>
        <div class="val">${f.label}</div>
      </div>`).join('');
  }

  function renderFilings() {
    const host = document.querySelector('[data-filings]');
    if (!host) return;
    host.innerHTML = D.filings.map(f => `
      <a class="list__item" href="${f.url || '#'}" target="_blank" rel="noopener">
        <div class="list__date">${f.date}</div>
        <div class="list__form">${f.form}</div>
        <div class="list__desc">${f.desc}</div>
        <div class="list__cta">View ↗</div>
      </a>`).join('');
  }

  function renderNews() {
    const host = document.querySelector('[data-news]');
    if (!host) return;
    host.innerHTML = D.news.map(n => `
      <a class="news__item" href="${n.url || '#'}" ${n.url ? 'target="_blank" rel="noopener"' : 'onclick="return false;"'}>
        <div class="list__date">${n.date}</div>
        <div class="news__src">${n.src}</div>
        <div class="news__title">${n.title}</div>
      </a>`).join('');
  }

  function renderCatalysts() {
    const host = document.querySelector('[data-catalysts]');
    if (!host) return;
    host.innerHTML = D.catalysts.map((c, i) => {
      // Subtle accent for regulator-decision catalysts so the reader can spot
      // structural decision points vs. company milestones at a glance.
      const isRegulator = /\[Regulator\]/.test(c.status || '');
      const accent = isRegulator
        ? 'border-left:3px solid var(--accent);padding-left:14px;background:linear-gradient(90deg,var(--accent-soft),transparent 60%)'
        : '';
      const prefix = isRegulator ? '<span style="color:var(--accent);font-weight:700;margin-right:6px">↳ DECISION</span>' : '';
      const isDone = /Reported/i.test(c.status || '') || c.tone === 'done';
      const btnLabel = isDone ? '✓ Done' : '+ Calendar';
      const btnAttr  = isDone ? 'disabled style="opacity:.5;cursor:not-allowed"' : `data-cat-idx="${i}"`;
      return `
        <div class="cat__row" style="${accent}">
          <div class="cat__date">${c.date}</div>
          <div class="cat__event">${prefix}${c.event}</div>
          <span class="pill ${c.tone}">${c.status}</span>
          <button class="cat__btn" ${btnAttr}>${btnLabel}</button>
        </div>`;
    }).join('');

    // Delegate the calendar button click — single listener
    host.addEventListener('click', e => {
      const btn = e.target.closest('[data-cat-idx]');
      if (!btn) return;
      const idx = parseInt(btn.dataset.catIdx, 10);
      const cat = D.catalysts[idx];
      if (cat) downloadCatalystICS(cat);
    }, { once: false });
  }

  function renderRisks() {
    const host = document.querySelector('[data-risks]');
    if (!host) return;
    host.innerHTML = D.risks.map(r => `
      <div class="risk">
        <h4 class="risk__title"><span class="dot"></span>${r.title}</h4>
        <p class="risk__body">${r.body}</p>
      </div>`).join('');
  }

  // ---------- NEW: Frontier platform — UK + USA ----------
  function renderFrontier() {
    if (!D.frontierPlatform) return;
    const sideRenderer = (key, prefix) => {
      const side = D.frontierPlatform[key];
      if (!side) return;
      setEl(`[data-frontier-${prefix}-meta]`, `Founded ${side.founded} · ${side.announced}`);
      setEl(`[data-frontier-${prefix}-summary]`, side.summary);
      setEl(`[data-frontier-${prefix}-why]`, side.why);
      const tb = document.querySelector(`[data-frontier-${prefix}-terms] tbody`);
      if (tb) tb.innerHTML = side.terms.map(t =>
        `<tr><td style="color:var(--fg-2);width:42%">${t.k}</td><td><b>${t.v}</b></td></tr>`).join('');
      const srcs = document.querySelector(`[data-frontier-${prefix}-sources]`);
      if (srcs) srcs.innerHTML = (side.sources || []).map(s =>
        `<a href="${s.url}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">${s.label}</a>`).join(' · ');
    };
    sideRenderer('uk', 'uk');
    sideRenderer('us', 'us');
  }

  // ---------- NEW: Decision-window catalyst card ----------
  function daysFromToday(isoDate) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const target = new Date(isoDate + 'T00:00:00Z');
    return Math.round((target - today) / 86400000);
  }
  function renderCatalystWindow() {
    if (!D.catalystWindow) return;
    const cw = D.catalystWindow;
    setEl('[data-catalyst-window-framing]', cw.framing);
    setEl('[data-catalyst-window-srcnote]', cw.sourceNote);
    const host = document.querySelector('[data-catalyst-window-cards]');
    if (host) {
      host.innerHTML = cw.upcoming.map(c => {
        const d = daysFromToday(c.targetEnd);
        const dStr = d <= 0 ? 'window passed' : `~${d} day${d === 1 ? '' : 's'}`;
        const dColor = d <= 30 ? 'var(--warning)' : d <= 90 ? 'var(--accent)' : 'var(--fg-1)';
        const kindLabel = c.kind === 'final' ? 'FINAL DECISION' : 'PRELIMINARY';
        return `<div style="background:var(--bg-1);padding:14px;border-radius:8px;border:1px solid var(--line-1)">
          <div style="font-size:10.5px;color:var(--fg-3);letter-spacing:.1em;font-weight:700;text-transform:uppercase">${c.regulator} · ${kindLabel}</div>
          <div style="margin-top:6px;font-size:14px;font-weight:600;color:var(--fg-0)">${c.label}</div>
          <div style="margin-top:10px;display:flex;align-items:baseline;gap:10px">
            <span style="font-size:28px;font-weight:600;font-variant-numeric:tabular-nums;color:${dColor}">${dStr}</span>
            <span style="font-size:11.5px;color:var(--fg-3)">to end of ${c.anchor}</span>
          </div>
          <div style="margin-top:10px;font-size:12.5px;color:var(--fg-2);line-height:1.55">${c.eosExposure}</div>
        </div>`;
      }).join('');
    }
    setEl('[data-catalyst-window-upside]',   cw.scenarios.upside);
    setEl('[data-catalyst-window-base]',     cw.scenarios.base);
    setEl('[data-catalyst-window-downside]', cw.scenarios.downside);
  }

  // ---------- NEW: Regulated demand programs (Ofgem + NYSERDA) ----------
  function renderRegulatedPrograms() {
    if (!D.regulatedPrograms) return;
    const sideRenderer = (key, prefix) => {
      const p = D.regulatedPrograms[key];
      if (!p) return;
      setEl(`[data-program-${prefix}-title]`, p.title);
      setEl(`[data-program-${prefix}-framework]`, p.framework);
      setEl(`[data-program-${prefix}-relevance]`, p.eosRelevance);
      const tl = document.querySelector(`[data-program-${prefix}-timeline]`);
      if (tl) tl.innerHTML = p.timeline.map(t =>
        `<div style="display:grid;grid-template-columns:130px 1fr;gap:10px;padding:4px 0;border-bottom:1px solid var(--line-1)">
          <span style="color:var(--fg-2);font-variant-numeric:tabular-nums">${t.date}</span>
          <span>${t.event}</span>
        </div>`).join('');
      const srcs = document.querySelector(`[data-program-${prefix}-sources]`);
      if (srcs) srcs.innerHTML = (p.sources || []).map(s =>
        `<a href="${s.url}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">${s.label}</a>`).join(' · ');
    };
    sideRenderer('ofgem', 'ofgem');
    sideRenderer('nyserda', 'nyserda');
  }

  // ---------- NEW: Capital structure ----------
  function fmtM(v) { return '$' + v.toFixed(1) + 'M'; }
  function renderCapStructure() {
    if (!D.capStructure) return;
    const cs = D.capStructure;
    setEl('[data-capstr-asof]', `As of ${cs.asOf}`);
    const liab = document.querySelector('[data-capstr-liab] tbody');
    if (liab) {
      liab.innerHTML = cs.liabilities.map(r => `
        <tr><td>${r.k}</td><td class="num"><b>${fmtM(r.v)}</b></td></tr>`).join('') +
        `<tr style="font-weight:700"><td>Total liabilities + preferred</td><td class="num"><b>${fmtM(cs.totalLiabPref)}</b></td></tr>`;
    }
    const eq = document.querySelector('[data-capstr-equity] tbody');
    if (eq) {
      eq.innerHTML = cs.equity.map(r => `
        <tr><td>${r.k}</td><td class="num"><b>${r.v}</b></td></tr>`).join('');
    }
    // cs.note now contains HTML (rights-offering callout) — use innerHTML, not textContent
    const noteEl = document.querySelector('[data-capstr-note]');
    if (noteEl) noteEl.innerHTML = cs.note;
  }

  // ---------- NEW: Bull / Bear scorecard ----------
  function renderScorecard() {
    if (!D.scorecard) return;
    const renderList = (sel, arr) => {
      const host = document.querySelector(sel);
      if (!host) return;
      host.innerHTML = arr.map(p => `
        <li style="margin-bottom:10px">
          <span>${p.point}</span>
          <span style="display:block;font-size:11.5px;color:var(--fg-3);margin-top:3px">↳ ${p.src}</span>
        </li>`).join('');
    };
    renderList('[data-scorecard-bull]', D.scorecard.bull);
    renderList('[data-scorecard-bear]', D.scorecard.bear);
  }

  // ---------- NEW: Sentiment & positioning ----------
  function renderSentiment() {
    if (!D.sentiment) return;
    const s = D.sentiment;
    setEl('[data-sentiment-asof]', s.asOf || '');

    // Short interest
    const shortTb = document.querySelector('[data-sentiment-short] tbody');
    if (shortTb && s.shortInterest) {
      const si = s.shortInterest;
      shortTb.innerHTML = `
        <tr><td style="color:var(--fg-2)">% of float</td><td class="num"><b>${si.pctOfFloat}</b></td></tr>
        <tr><td style="color:var(--fg-2)">Shares short</td><td class="num"><b>${si.sharesShort}</b></td></tr>
        <tr><td style="color:var(--fg-2)">Days to cover</td><td class="num"><b>${si.daysToCover}</b></td></tr>`;
      setEl('[data-sentiment-short-note]', si.interpretation);
      const srcEl = document.querySelector('[data-sentiment-short-src]');
      if (srcEl) srcEl.href = si.source;
    }

    // Insiders — summary card now (full transactions in §09d)
    if (s.insiders) {
      const ins = s.insiders;
      setEl('[data-sentiment-insider-summary]', ins.summary);
      const cta = document.querySelector('[data-sentiment-insider-cta]');
      if (cta) {
        cta.textContent = ins.ctaText || 'See full Form 4 log →';
        cta.href = ins.ctaHref || '#insiders';
      }
      const isrc = document.querySelector('[data-sentiment-insider-src]');
      if (isrc) isrc.href = ins.source;
    }

    // Institutional
    if (s.institutional) {
      setEl('[data-sentiment-inst-summary]', s.institutional.summary);
      const isrcs = document.querySelector('[data-sentiment-inst-sources]');
      if (isrcs) isrcs.innerHTML = s.institutional.sources.map(x =>
        `<a href="${x.url}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">${x.label}</a>`).join(' · ');
    }

    // Retail
    if (s.retail) {
      setEl('[data-sentiment-retail-summary]', s.retail.summary);
      const rsrc = document.querySelector('[data-sentiment-retail-src]');
      if (rsrc) rsrc.href = s.retail.source;
    }
  }

  // ---------- NEW: Insider trades — SEC Form 4 ----------
  function fmtUSD(v) {
    if (!isFinite(v) || v === 0) return '—';
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
    if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'k';
    return '$' + v.toFixed(0);
  }
  function edgarUrl(acc) {
    // RKLB CIK 1819994. If acc is empty/non-standard, fall back to the Form 4 index.
    if (!acc) return 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001819994&type=4';
    return 'https://www.sec.gov/Archives/edgar/data/1819994/' + acc.replace(/-/g, '') + '/';
  }
  function renderInsiderTrades() {
    if (!D.insiderTrades) return;
    const it = D.insiderTrades;
    setEl('[data-insider-asof]', it.asOf || '');

    // Pending filing banner (e.g., incoming CFO RSU grant before Form 3/4 files)
    if (it.pending) {
      const card = document.getElementById('insider-pending');
      if (card) {
        card.style.display = '';
        setEl('[data-insider-pending-label]',  it.pending.label || '');
        setEl('[data-insider-pending-detail]', it.pending.detail || '');
        const a = document.querySelector('[data-insider-pending-src]');
        if (a && it.pending.sourceUrl) a.href = it.pending.sourceUrl;
      }
    }

    // Summary tiles
    const s = it.summary;
    if (s) {
      setEl('[data-insider-buys-total]',  fmtUSD(s.openMarketBuys));
      setEl('[data-insider-buys-meta]',   `${s.buyCount} txns · ${s.buyersUnique} insiders`);
      setEl('[data-insider-sells-total]', fmtUSD(s.openMarketSells));
      setEl('[data-insider-sells-meta]',  `${s.sellCount} txns · before Feb 26 −39% drop`);
      setEl('[data-insider-tax-total]',   fmtUSD(s.taxWithholding));
      setEl('[data-insider-reading]',     s.reading || '');
    }

    // Code legend
    const leg = document.querySelector('[data-insider-legend]');
    if (leg && it.codeLegend) {
      leg.innerHTML = it.codeLegend.map(c => {
        const color = c.tone === 'buy'  ? 'var(--positive)'
                    : c.tone === 'sell' ? 'var(--negative)'
                    : 'var(--fg-2)';
        return `<div>
          <span style="display:inline-block;font-family:var(--font-mono);font-weight:700;
                       background:${color};color:var(--bg-0);
                       padding:1px 7px;border-radius:4px;font-size:11.5px;margin-right:6px">${c.code}</span>
          <strong>${c.label}</strong>
          <div style="color:var(--fg-2);font-size:11.5px;margin-top:2px;margin-left:22px">${c.note}</div>
        </div>`;
      }).join('');
    }

    // Transactions table
    const tb = document.querySelector('[data-insider-table] tbody');
    if (tb && it.transactions) {
      // sorted newest first already in data
      tb.innerHTML = it.transactions.map(t => {
        const sign = t.ad === 'A' ? '+' : t.ad === 'D' ? '−' : '';
        // Code badge — color by tone
        let codeColor = 'var(--fg-2)';
        if (t.code === 'P') codeColor = 'var(--positive)';
        else if (t.code === 'S') codeColor = 'var(--negative)';
        else if (t.code === 'F' || t.code === 'D') codeColor = 'var(--warning)';
        const valColor = t.code === 'P' ? 'var(--positive)' : t.code === 'S' ? 'var(--negative)' : 'var(--fg-1)';
        const valDisplay = t.value > 0 ? sign + fmtUSD(t.value) : '—';
        const priceDisplay = t.price > 0 ? '$' + t.price.toFixed(2) : '—';
        const noteLine = t.note
          ? `<div style="color:var(--fg-3);font-size:10.5px;margin-top:2px;font-style:italic">${t.note}</div>`
          : '';
        return `<tr>
          <td style="color:var(--fg-2);font-variant-numeric:tabular-nums">${t.date}</td>
          <td><b>${t.name}</b>${noteLine}</td>
          <td style="color:var(--fg-2);font-size:11.5px">${t.role}</td>
          <td><span style="display:inline-block;background:${codeColor};color:var(--bg-0);
                            font-family:var(--font-mono);font-weight:700;font-size:11px;
                            padding:1px 6px;border-radius:4px">${t.code}</span></td>
          <td class="num">${sign}${t.shares.toLocaleString()}</td>
          <td class="num">${priceDisplay}</td>
          <td class="num" style="color:${valColor};font-weight:600">${valDisplay}</td>
          <td><a href="${edgarUrl(t.acc)}" target="_blank" rel="noopener"
                 style="color:var(--accent);font-size:11.5px;text-decoration:underline"
                 title="${t.acc}">View ↗</a></td>
        </tr>`;
      }).join('');
    }

    // Source links
    const srcs = document.querySelector('[data-insider-sources]');
    if (srcs && it.sources) {
      srcs.innerHTML = it.sources.map(x =>
        `<a href="${x.url}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">${x.label}</a>`
      ).join(' · ');
    }
  }

  // ---------- NEW: Rumors & open debates ----------
  function renderRumors() {
    if (!D.rumors) return;
    const renderSide = (sel, arr, sideColor) => {
      const host = document.querySelector(sel);
      if (!host) return;
      host.innerHTML = arr.map(r => `
        <div style="padding:14px 0;border-top:1px solid var(--line-1);font-size:13.5px;line-height:1.55">
          <div style="font-weight:600;color:var(--fg-0);margin-bottom:6px">${r.claim}</div>
          <div style="color:var(--fg-2)"><strong style="color:${sideColor}">Evidence:</strong> ${r.evidence}</div>
        </div>`).join('');
    };
    renderSide('[data-rumors-bull]', D.rumors.bull, 'var(--positive)');
    renderSide('[data-rumors-bear]', D.rumors.bear, 'var(--negative)');
  }

  // ---------- NEW: Recent history (3b timeline) ----------
  function renderHistory() {
    const host = document.querySelector('[data-history]');
    if (!host || !D.recentHistory) return;
    // sort newest first
    const items = [...D.recentHistory].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    host.innerHTML = items.map(h => `
      <div class="cat__row" style="grid-template-columns:140px 1fr 100px">
        <div class="cat__date">${h.date}</div>
        <div class="cat__event"><strong>${h.title}</strong><div style="color:var(--fg-2);font-size:12.5px;margin-top:4px;line-height:1.5">${h.body}</div></div>
        <a class="cat__btn" href="${h.url || '#'}" target="_blank" rel="noopener">Source ↗</a>
      </div>`).join('');
  }

  // ---------- NEW: Analyst coverage ----------
  function renderAnalysts() {
    if (!D.analystCoverage) return;
    const a = D.analystCoverage;
    setEl('[data-analyst-asof]', a.asOf || '');
    const cons = document.querySelector('[data-analyst-consensus] tbody');
    if (cons) {
      const c = a.consensus;
      cons.innerHTML = `
        <tr><td style="color:var(--fg-2)">Avg price target</td><td class="num"><b>$${c.avgPriceTarget.toFixed(2)}</b></td></tr>
        <tr><td style="color:var(--fg-2)">High target</td><td class="num pos"><b>$${c.highTarget.toFixed(2)}</b></td></tr>
        <tr><td style="color:var(--fg-2)">Low target</td><td class="num neg"><b>$${c.lowTarget.toFixed(2)}</b></td></tr>
        <tr><td style="color:var(--fg-2)">Covering analysts</td><td class="num"><b>${c.coveringAnalysts}</b></td></tr>
        <tr><td style="color:var(--fg-2)">Prior avg (pre-cuts)</td><td class="num"><b>$${c.priorAvgTarget.toFixed(2)}</b></td></tr>
        <tr><td style="color:var(--fg-2)">Rating mix</td><td><b style="font-size:12.5px">${c.ratingMix}</b></td></tr>`;
    }
    const acts = document.querySelector('[data-analyst-actions] tbody');
    if (acts) {
      acts.innerHTML = a.recentActions.map(r => `
        <tr>
          <td class="num">${r.date}</td>
          <td><b>${r.firm}</b></td>
          <td style="color:var(--fg-2)">${r.analyst}</td>
          <td><span class="pill ${r.action.includes('cut') ? 'negotiation' : 'mixed'}">${r.action}</span></td>
          <td style="color:var(--fg-2);font-size:12.5px">${r.note}</td>
        </tr>`).join('');
    }
    const sent = document.querySelector('[data-analyst-sentiment]');
    if (sent) {
      sent.innerHTML = `
        <div><div style="color:var(--fg-2);font-size:11.5px;text-transform:uppercase;letter-spacing:.08em;font-weight:600">Retail</div><div style="margin-top:6px">${a.sentiment.retail}</div></div>
        <div><div style="color:var(--fg-2);font-size:11.5px;text-transform:uppercase;letter-spacing:.08em;font-weight:600">Institutional</div><div style="margin-top:6px">${a.sentiment.institutional}</div></div>
        <div><div style="color:var(--fg-2);font-size:11.5px;text-transform:uppercase;letter-spacing:.08em;font-weight:600">Short interest</div><div style="margin-top:6px">${a.sentiment.shortInterest}</div></div>`;
    }
    const srcs = document.querySelector('[data-analyst-sources]');
    if (srcs) {
      srcs.innerHTML = a.sources.map(s => `<a href="${s.url}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">${s.label}</a>`).join(' · ');
    }
  }

  // ---------- NEW: Policy (45X / FEOC) ----------
  function renderPolicy() {
    if (!D.policy) return;
    setEl('[data-policy-title]', D.policy.title);
    setEl('[data-policy-summary]', D.policy.summary);
    setEl('[data-policy-impact]', D.policy.eosImpact);
    setEl('[data-policy-risk]', D.policy.riskNote);
    const srcs = document.querySelector('[data-policy-sources]');
    if (srcs) srcs.innerHTML = D.policy.sources.map(s =>
      `<a href="${s.url}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">${s.label}</a>`).join(' · ');
  }

  // ---------- NEW: Legal disclosure ----------
  function renderLegal() {
    if (!D.legal) return;
    const c = D.legal.case;
    const tbody = document.querySelector('[data-legal-case] tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr><td style="color:var(--fg-2);width:30%">Case</td><td><b>${c.name}</b></td></tr>
        <tr><td style="color:var(--fg-2)">Docket</td><td><b>${c.number}</b> · ${c.court}</td></tr>
        <tr><td style="color:var(--fg-2)">Class period</td><td>${c.classPeriod}</td></tr>
        <tr><td style="color:var(--fg-2)">Lead-plaintiff deadline</td><td>${c.leadDeadline}</td></tr>
        <tr><td style="color:var(--fg-2)">Status</td><td>${c.status}</td></tr>
        <tr><td style="color:var(--fg-2)">Allegations</td><td>${c.allegations}</td></tr>
        <tr><td style="color:var(--fg-2)">Trigger event</td><td>${c.trigger}</td></tr>`;
    }
    setEl('[data-legal-note]', D.legal.note);
    setEl('[data-legal-firms]', D.legal.advertisingFirms.join(' · '));
    const srcs = document.querySelector('[data-legal-sources]');
    if (srcs) srcs.innerHTML = D.legal.sources.map(s =>
      `<a href="${s.url}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">${s.label}</a>`).join(' · ');
  }

  // ---------- NEW: Product family (Indensity / Cube / Z3 / DawnOS) + competitive ----------
  function renderProduct() {
    // Competitive landscape (kept from before)
    const cb = document.querySelector('[data-competitive] tbody');
    if (cb && D.competitive) {
      cb.innerHTML = D.competitive.map(r => `
        <tr><td><b>${r.tech}</b></td><td style="color:var(--fg-2)">${r.lead}</td><td class="num">${r.duration}</td><td style="color:var(--fg-2);font-size:12.5px">${r.status}</td><td style="font-size:12.5px">${r.edge}</td></tr>`).join('');
    }
    if (!D.products) return;

    const srcLinks = (sources) => (sources || []).map(s =>
      `<a href="${s.url}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">${s.label}</a>`).join(' · ');

    const attrTable = (rows) => rows.map(r =>
      `<tr><td style="color:var(--fg-2);width:38%">${r.k}</td><td><b>${r.v}</b>${r.note ? `<div style="color:var(--fg-3);font-size:11.5px;margin-top:2px;font-weight:400">${r.note}</div>` : ''}</td></tr>`).join('');

    // Indensity
    const ind = D.products.indensity;
    if (ind) {
      setEl('[data-prod-indensity-name]',      ind.name);
      setEl('[data-prod-indensity-tagline]',   ind.tagline);
      setEl('[data-prod-indensity-launched]',  ind.launched ? 'Launched ' + ind.launched : '');
      setEl('[data-prod-indensity-summary]',   ind.summary);
      const t = document.querySelector('[data-prod-indensity-attrs] tbody');
      if (t) t.innerHTML = attrTable(ind.attributes || []);
      const ap = document.querySelector('[data-prod-indensity-apps]');
      if (ap) ap.innerHTML = (ind.applications || []).map(a => `<li>${a}</li>`).join('');
      const sr = document.querySelector('[data-prod-indensity-sources]');
      if (sr) sr.innerHTML = srcLinks(ind.sources);
    }

    // Cube
    const cube = D.products.cube;
    if (cube) {
      setEl('[data-prod-cube-name]',     cube.name);
      setEl('[data-prod-cube-tagline]',  cube.tagline);
      setEl('[data-prod-cube-launched]', cube.launched || '');
      setEl('[data-prod-cube-summary]',  cube.summary);
      const t = document.querySelector('[data-prod-cube-attrs] tbody');
      if (t) t.innerHTML = attrTable(cube.attributes || []);
      const sr = document.querySelector('[data-prod-cube-sources]');
      if (sr) sr.innerHTML = srcLinks(cube.sources);
    }

    // Z3 module
    const z3 = D.products.z3Module;
    if (z3) {
      setEl('[data-prod-z3-name]',    z3.name);
      setEl('[data-prod-z3-tagline]', z3.tagline);
      const t = document.querySelector('[data-prod-z3-attrs] tbody');
      if (t) t.innerHTML = attrTable(z3.attributes || []);
      const sr = document.querySelector('[data-prod-z3-sources]');
      if (sr) sr.innerHTML = srcLinks(z3.sources);
    }

    // DawnOS
    const dawn = D.products.dawnos;
    if (dawn) {
      setEl('[data-prod-dawnos-name]',     dawn.name);
      setEl('[data-prod-dawnos-tagline]',  dawn.tagline);
      setEl('[data-prod-dawnos-launched]', dawn.launched ? 'Launched ' + dawn.launched : '');
      setEl('[data-prod-dawnos-summary]',  dawn.summary);
      const t = document.querySelector('[data-prod-dawnos-caps] tbody');
      if (t) t.innerHTML = attrTable(dawn.capabilities || []);
      const sec = document.querySelector('[data-prod-dawnos-security]');
      if (sec) sec.innerHTML = (dawn.security || []).map(s => `<li>${s}</li>`).join('');
      const sr = document.querySelector('[data-prod-dawnos-sources]');
      if (sr) sr.innerHTML = srcLinks(dawn.sources);
    }
  }

  // ---------- Toast (visual feedback for downloads etc.) ----------
  let __toastTimer = null;
  function showToast(title, body) {
    let host = document.getElementById('toast');
    if (!host) {
      host = document.createElement('div');
      host.id = 'toast';
      host.className = 'toast';
      host.setAttribute('role', 'status');
      host.setAttribute('aria-live', 'polite');
      document.body.appendChild(host);
    }
    host.innerHTML = `<strong>${title}</strong>${body || ''}`;
    requestAnimationFrame(() => host.classList.add('is-visible'));
    clearTimeout(__toastTimer);
    __toastTimer = setTimeout(() => host.classList.remove('is-visible'), 3200);
  }

  // ---------- CSV export (with toast feedback) ----------
  function exportCSV() {
    const rows = [['Quarter', 'Revenue $M', 'Gross Margin %', 'Operating Income $M', 'Cash $M', 'Type']];
    D.quarterTable.forEach(r => rows.push([r.q, r.rev, r.gm, r.op, r.liq, r.type === 'A' ? 'Actual' : 'Projected']));
    rows.push([]);
    rows.push(['Quarter', 'Revenue $M', 'Type']);
    D.quarterlyRevenue.forEach(r => rows.push([r.q, r.v, r.type]));
    const csv = rows.map(r => r.map(c => `"${c == null ? '' : c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const filename = `RKLB-data-${new Date().toISOString().slice(0, 10)}.csv`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 250);
    showToast('Downloaded ✓', `${filename} (${(blob.size / 1024).toFixed(1)} KB) — check your downloads folder`);
  }

  // ---------- Calendar (.ics) export for catalysts ----------
  // Parses the catalyst date string and produces a single-event .ics file.
  // Handles vague windows ("Spring 2026", "Q3 2026", "FY2027") by using the
  // END of that period as the all-day event date — conservative anchor.
  function parseCatalystDate(s) {
    if (!s) return null;
    const today = new Date();
    const yearNow = today.getUTCFullYear();
    const yMatch = s.match(/\b(20\d{2})\b/);
    const year = yMatch ? parseInt(yMatch[1], 10) : yearNow;

    // Explicit Mon DD, YYYY
    const monthDay = s.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s*(20\d{2})?\b/);
    if (monthDay) {
      const monIdx = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(monthDay[1].toLowerCase());
      const d = parseInt(monthDay[2], 10);
      return new Date(Date.UTC(parseInt(monthDay[3] || year, 10), monIdx, d));
    }

    // Seasons (UK/US northern hemisphere): use end of season
    if (/spring/i.test(s))  return new Date(Date.UTC(year, 5, 20));  // Jun 20
    if (/summer/i.test(s))  return new Date(Date.UTC(year, 8, 22));  // Sep 22
    if (/autumn|fall/i.test(s)) return new Date(Date.UTC(year, 11, 21)); // Dec 21
    if (/winter/i.test(s))  return new Date(Date.UTC(year + 1, 2, 19));  // Mar 19 next year

    // Quarters
    const qMatch = s.match(/\bQ([1-4])\s*(?:20\d{2})?\b/i);
    if (qMatch) {
      const endMonths = [2, 5, 8, 11];
      const endDays   = [31, 30, 30, 31];
      const q = parseInt(qMatch[1], 10);
      return new Date(Date.UTC(year, endMonths[q - 1], endDays[q - 1]));
    }

    // "End Q2 2026" / "End of Q2"
    const endQ = s.match(/end\s+(?:of\s+)?Q([1-4])/i);
    if (endQ) {
      const endMonths = [2, 5, 8, 11];
      const endDays   = [31, 30, 30, 31];
      const q = parseInt(endQ[1], 10);
      return new Date(Date.UTC(year, endMonths[q - 1], endDays[q - 1]));
    }

    // FY YYYY
    const fyMatch = s.match(/FY\s*(20\d{2})/i);
    if (fyMatch) return new Date(Date.UTC(parseInt(fyMatch[1], 10), 11, 31));

    // Year-only
    if (yMatch) return new Date(Date.UTC(year, 11, 31));
    return null;
  }
  function icsEscape(s) {
    return String(s || '').replace(/[\\,;]/g, m => '\\' + m).replace(/\r?\n/g, '\\n');
  }
  function downloadCatalystICS(catalyst) {
    const d = parseCatalystDate(catalyst.date) || new Date();
    const fmt = (date) => date.toISOString().slice(0, 10).replace(/-/g, '');
    const startDate = fmt(d);
    const endDate = fmt(new Date(d.getTime() + 86400000));
    const uid = `rklb-${startDate}-${Math.random().toString(36).slice(2, 8)}@rklbdashboard.example`;
    const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//RKLB Dashboard//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${startDate}`,
      `DTEND;VALUE=DATE:${endDate}`,
      `SUMMARY:RKLB — ${icsEscape(catalyst.event)}`,
      `DESCRIPTION:RKLB catalyst (independent research dashboard)\\nStatus: ${icsEscape(catalyst.status)}\\nOriginal date label: ${icsEscape(catalyst.date)}`,
      'URL:https://rklbdashboard.example/#catalysts',
      'END:VEVENT',
      'END:VCALENDAR',
      ''
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `RKLB-${catalyst.event.slice(0, 40).replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 250);
    showToast('Calendar event downloaded ✓', `${a.download} — open it to add to your calendar`);
  }

  // ---------- Search panel ----------
  function initSearch() {
    const panel = document.getElementById('searchPanel');
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');
    const toggle = document.querySelector('[data-search-toggle]');
    if (!panel || !input || !results || !toggle) return;

    // Build the searchable index from the section nav links + visible h2
    const navLinks = Array.from(document.querySelectorAll('.section-nav a'));
    const index = navLinks.map(a => {
      const href = a.getAttribute('href');
      const sec = document.querySelector(href);
      const h2 = sec && sec.querySelector('h2');
      return {
        num: a.querySelector('.num')?.textContent || '',
        label: (a.textContent || '').replace(/^\s*\S+\s*/, '').trim(),
        desc: h2 ? h2.textContent.trim() : '',
        href
      };
    });

    let activeIdx = 0;
    function render(query) {
      const q = (query || '').toLowerCase().trim();
      const matches = q
        ? index.filter(i => (i.label + ' ' + i.desc + ' ' + i.num).toLowerCase().includes(q))
        : index;
      activeIdx = 0;
      results.innerHTML = matches.map((m, i) => `
        <a href="${m.href}" data-i="${i}" class="${i === 0 ? 'is-active' : ''}">
          <span class="num">${m.num}</span>
          <span><b>${m.label}</b><div class="desc">${m.desc}</div></span>
        </a>`).join('') || '<div style="padding:14px;color:var(--fg-3);font-size:13px">No matches.</div>';
      results._matches = matches;
    }
    function open() {
      panel.classList.add('is-open');
      toggle.classList.add('is-active');
      input.value = '';
      render('');
      setTimeout(() => input.focus(), 60);
    }
    function close() {
      panel.classList.remove('is-open');
      toggle.classList.remove('is-active');
    }
    function jump(href) {
      const target = document.querySelector(href);
      if (!target) return;
      close();
      const y = target.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
      if (history.replaceState) history.replaceState(null, '', href);
    }
    function moveActive(delta) {
      const items = results.querySelectorAll('a');
      if (!items.length) return;
      activeIdx = (activeIdx + delta + items.length) % items.length;
      items.forEach((el, i) => el.classList.toggle('is-active', i === activeIdx));
      items[activeIdx].scrollIntoView({ block: 'nearest' });
    }

    toggle.addEventListener('click', () => panel.classList.contains('is-open') ? close() : open());
    input.addEventListener('input', e => render(e.target.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); moveActive(-1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const item = results.querySelectorAll('a')[activeIdx];
        if (item) jump(item.getAttribute('href'));
      }
    });
    results.addEventListener('click', e => {
      const a = e.target.closest('a');
      if (!a) return;
      e.preventDefault();
      jump(a.getAttribute('href'));
    });
    // Global "/" shortcut to open search (unless user is typing in a field)
    document.addEventListener('keydown', e => {
      const tag = (e.target && e.target.tagName) || '';
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        open();
      } else if (e.key === 'Escape' && panel.classList.contains('is-open')) {
        close();
      }
    });
    // Click outside to close
    document.addEventListener('click', e => {
      if (!panel.contains(e.target) && !toggle.contains(e.target) && panel.classList.contains('is-open')) {
        close();
      }
    });
  }

  // ---------- Section nav: scroll spy + URL hash ----------
  function initScrollSpy() {
    const links = document.querySelectorAll('.section-nav a');
    const sections = Array.from(links).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    // Cache section offsetTops — reading them in every scroll handler triggers
    // a layout flush per section, which contributes to scroll lag with 19+ sections.
    let sectionTops = sections.map(s => s.offsetTop);
    let recalcTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(recalcTimer);
      recalcTimer = setTimeout(() => { sectionTops = sections.map(s => s.offsetTop); }, 150);
    }, { passive: true });
    // Recompute once after charts have finished rendering (heights may have changed)
    setTimeout(() => { sectionTops = sections.map(s => s.offsetTop); }, 800);

    function onScroll() {
      const y = window.scrollY + 220;
      let active = 0;
      for (let i = 0; i < sectionTops.length; i++) {
        if (sectionTops[i] <= y) active = i;
      }
      links.forEach((l, i) => l.classList.toggle('is-active', i === active));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    links.forEach(l => l.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(l.getAttribute('href'));
      if (!target) return;
      const y = target.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
      if (history.replaceState) history.replaceState(null, '', l.getAttribute('href'));
    }));
    // Deep-link to anchor on initial load
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) setTimeout(() => {
        const y = target.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top: y });
      }, 50);
    }
  }

  // ---------- Filter buttons (revenue toggle) ----------
  function initToggles() {
    document.querySelectorAll('.form-pill').forEach(pill => {
      pill.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          pill.querySelectorAll('button').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          const mode = btn.dataset.mode;
          const target = pill.dataset.target;
          if (target === 'revenue') {
            const host = document.querySelector('[data-chart-revenue]');
            if (mode === 'quarterly') {
              C.barChart(host, D.quarterlyRevenue, { colorByType: true, height: 340 });
            } else {
              C.barChart(host, D.annualRevenue, { colorByType: true, height: 340 });
            }
          }
        });
      });
    });
  }

  // ---------- Background music player (opt-in, off by default) ----------
  // Playlist order = play order (advance + loop). Edit/reorder/remove freely.
  const MUSIC = [
    { title: 'Escape Velocity',       sub: '',                  src: 'assets/music/escape-velocity.mp3' },
    { title: 'Black Composite',       sub: '',                  src: 'assets/music/black-composite.mp3' },
    { title: 'Night of the Electron', sub: '',                  src: 'assets/music/night-of-the-electron.mp3' }
  ];
  function initMusic() {
    const audio  = document.getElementById('musicAudio');
    const pop    = document.getElementById('musicPop');
    const toggle = document.querySelector('[data-music-toggle]');
    if (!audio || !pop || !toggle || !MUSIC.length) return;
    const q = sel => pop.querySelector(sel);
    const els = {
      title: q('[data-music-title]'), sub: q('[data-music-sub]'),
      play: q('[data-music-play]'), prev: q('[data-music-prev]'), next: q('[data-music-next]'),
      vol: q('[data-music-vol]'), list: q('[data-music-list]'), close: q('[data-music-close]')
    };

    let idx = parseInt(localStorage.getItem('rklb-music-track') || '0', 10);
    if (!(idx >= 0 && idx < MUSIC.length)) idx = 0;
    let vol = parseFloat(localStorage.getItem('rklb-music-vol'));
    if (!(vol >= 0 && vol <= 1)) vol = 0.30;
    audio.volume = vol; els.vol.value = Math.round(vol * 100);

    function renderList() {
      els.list.innerHTML = MUSIC.map((t, i) =>
        `<li class="${i === idx ? 'is-current' : ''}" data-i="${i}"><span class="idx">${i + 1}</span><span>${t.title}</span></li>`).join('');
    }
    function reflect(isPlaying) {
      els.play.textContent = isPlaying ? '⏸' : '▶';
      toggle.classList.toggle('is-playing', isPlaying);
      localStorage.setItem('rklb-music-on', isPlaying ? '1' : '0');
    }
    function load(i, autoplay) {
      idx = (i + MUSIC.length) % MUSIC.length;
      localStorage.setItem('rklb-music-track', String(idx));
      const t = MUSIC[idx];
      audio.src = t.src;
      els.title.textContent = t.title;
      els.sub.textContent = t.sub || '';
      renderList();
      if (autoplay) playNow();
    }
    function playNow() {
      if (!audio.src) load(idx, false);
      // With preload="none" the element may have no buffered data, and in some
      // browsers play() then stalls until a seek/load nudges buffering (the
      // "play does nothing until I scrub" symptom). Force a load and also retry
      // once data is ready.
      audio.preload = 'auto';
      const attempt = () => {
        const p = audio.play();
        if (p && p.then) p.then(() => reflect(true)).catch(() => {});
      };
      if (audio.readyState >= 2) {           // HAVE_CURRENT_DATA — safe to play now
        attempt();
      } else {
        audio.addEventListener('canplay', attempt, { once: true });
        try { audio.load(); } catch (e) { /* ignore */ }
        attempt();                            // most browsers start here directly
      }
    }

    els.play.addEventListener('click', () => audio.paused ? playNow() : (audio.pause(), reflect(false)));
    els.prev.addEventListener('click', () => load(idx - 1, true));
    els.next.addEventListener('click', () => load(idx + 1, true));
    els.vol.addEventListener('input', e => { audio.volume = (e.target.value / 100); localStorage.setItem('rklb-music-vol', String(audio.volume)); });
    els.list.addEventListener('click', e => { const li = e.target.closest('li'); if (li) load(parseInt(li.dataset.i, 10), true); });
    audio.addEventListener('ended', () => load(idx + 1, true));   // advance + loop
    audio.addEventListener('play',  () => reflect(true));
    audio.addEventListener('pause', () => reflect(false));

    const open  = () => { pop.hidden = false; toggle.classList.add('is-active'); };
    const close = () => { pop.hidden = true;  toggle.classList.remove('is-active'); };
    toggle.addEventListener('click', () => pop.hidden ? open() : close());
    els.close.addEventListener('click', close);
    document.addEventListener('click', e => {
      if (!pop.hidden && !pop.contains(e.target) && !toggle.contains(e.target)) close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) close(); });

    load(idx, false);   // show metadata, don't autoplay

    // If the user previously had music on, resume after their first gesture
    // (browsers block autoplay-with-sound until then).
    if (localStorage.getItem('rklb-music-on') === '1') {
      const resume = () => { playNow(); window.removeEventListener('pointerdown', resume); window.removeEventListener('keydown', resume); };
      window.addEventListener('pointerdown', resume, { once: true });
      window.addEventListener('keydown', resume, { once: true });
    }
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderTicker();
    renderHero();
    renderKpis();
    renderQuarterTable();
    renderContracts();
    renderScenarios();
    renderFunnel();
    renderFilings();
    renderNews();
    renderCatalysts();
    renderRisks();
    renderFrontier();
    renderCapStructure();
    renderProduct();
    renderHistory();
    renderAnalysts();
    renderPolicy();
    renderLegal();
    renderScorecard();
    renderSentiment();
    renderInsiderTrades();
    renderRumors();
    renderRegulatedPrograms();
    renderCatalystWindow();

    // Charts
    chart('[data-chart-revenue]',  h => C.barChart(h, D.quarterlyRevenue, { colorByType: true, height: 340 }));
    chart('[data-chart-annual]',   h => C.barChart(h, D.annualRevenue,    { colorByType: true, height: 280 }));
    chart('[data-chart-margin]',   h => C.areaChart(h, D.grossMargin,     { clamp: [-350, 50], breakeven: true, height: 320, yFormat: v => v.toFixed(0) + '%', tipFormat: v => v.toFixed(0) + '%' }));
    chart('[data-chart-opincome]', h => C.barChart(h, D.opIncome,         { colorByType: true, profitColor: true, height: 320 }));
    chart('[data-chart-liquidity]',h => C.areaChart(h, D.liquidity,       { height: 280 }));
    chart('[data-chart-capacity]', h => C.stackedBars(h, D.capacity, {
      keys: ['l1','l2','l3','l4','l5'], height: 320,
      colors: ['#E4002B', '#FF7A33', '#7C7CFF', '#ECECF0', '#8E8E98']
    }));
    chart('[data-chart-uptime]',   h => C.areaChart(h, D.uptime, { height: 240, yFormat: v => v.toFixed(0) + '%', tipFormat: v => v.toFixed(1) + '%' }));
    chart('[data-chart-graphite]', h => C.barChart(h, D.graphite, { fill: 'var(--brand-violet)', height: 240, tipFormat: v => v.toFixed(0) + ' t', yFormat: v => v.toFixed(0) + ' t' }));
    chart('[data-chart-backlog]',  h => C.areaChart(h, D.backlog,  { height: 300 }));
    chart('[data-chart-bookings]', h => C.barChart(h, D.bookings,  { fill: 'var(--accent)', height: 240 }));
    chart('[data-chart-ps]',       h => C.areaChart(h, D.psMultiple, { height: 260, yFormat: v => v.toFixed(0) + 'x', tipFormat: v => v.toFixed(1) + 'x' }));
    chart('[data-chart-mcap]',     h => C.barChart(h, D.marketCap, { fill: 'var(--accent)', height: 260 }));
    chart('[data-chart-bridge]',   h => C.dualBridge(h, D.bridge,  { height: 320 }));
    chart('[data-chart-price]',    () => renderPriceChart());  // re-renders on resize
    renderAllCharts();

    initScrollSpy();
    initToggles();
    initSearch();
    initMusic();

    // Price history candlestick (fire-and-forget) + live quote
    loadHistory();
    loadQuote();

    window.addEventListener('resize', () => {
      clearTimeout(window.__rt);
      window.__rt = setTimeout(renderAllCharts, 200);
    });

    // Theme toggle
    document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      setTheme(cur === 'dark' ? 'light' : 'dark');
    });
  });

  // expose for tweaks panel + CSV button
  window.RKLB_APP = { setTheme, renderAllCharts, exportCSV };
})();
