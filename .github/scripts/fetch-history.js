#!/usr/bin/env node
// Fetch ~1 year of daily OHLC for RKLB from Yahoo Finance's public chart API
// (keyless, works server-side) and write data/history.json.
// Yahoo blocks requests without a browser-like User-Agent, so we set one.

const fs = require('node:fs');
const https = require('node:https');

const SYMBOL = 'RKLB';
const URL = `https://query1.finance.yahoo.com/v8/finance/chart/${SYMBOL}?interval=1d&range=1y`;

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    }, res => {
      if (res.statusCode !== 200) { reject(new Error('HTTP ' + res.statusCode)); return; }
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

(async () => {
  const raw = await get(URL);
  const j = JSON.parse(raw);
  const r = j.chart.result[0];
  const ts = r.timestamp || [];
  const q = (r.indicators.quote && r.indicators.quote[0]) || {};
  const bars = [];
  for (let i = 0; i < ts.length; i++) {
    const o = q.open[i], h = q.high[i], l = q.low[i], c = q.close[i], v = q.volume[i];
    if ([o, h, l, c].some(x => x == null)) continue;
    const dt = new Date(ts[i] * 1000).toISOString().slice(0, 10);
    bars.push({ t: dt, o: +o.toFixed(2), h: +h.toFixed(2), l: +l.toFixed(2), c: +c.toFixed(2), v: v || 0 });
  }
  if (!bars.length) throw new Error('no bars parsed');
  const out = {
    meta: {
      _refreshed: new Date().toISOString(),
      _source: 'Yahoo Finance v8 chart API',
      symbol: SYMBOL,
      bars: bars.length
    },
    bars
  };
  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync('data/history.json', JSON.stringify(out));
  console.log(`Wrote ${bars.length} bars (${bars[0].t} -> ${bars[bars.length - 1].t})`);
})().catch(e => { console.error('fetch-history failed:', e.message); process.exit(1); });
