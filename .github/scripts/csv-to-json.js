#!/usr/bin/env node
// Convert a 2-column key/value CSV (from Google Sheets GOOGLEFINANCE export)
// into data/quote.json. Robust to whitespace, quoted cells, and locale-specific
// number formats. Adds a _refreshed ISO timestamp.

const fs = require('node:fs');

const [, , inFile, outFile] = process.argv;
if (!inFile || !outFile) {
  console.error('Usage: csv-to-json.js <in.csv> <out.json>');
  process.exit(2);
}

const raw = fs.readFileSync(inFile, 'utf8').replace(/^﻿/, '');

// Minimal CSV parser — handles double-quoted cells with embedded commas/quotes.
function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQ = false; }
      else { cur += ch; }
    } else {
      if (ch === '"') { inQ = true; }
      else if (ch === ',') { out.push(cur); cur = ''; }
      else { cur += ch; }
    }
  }
  out.push(cur);
  return out;
}

function coerce(value) {
  const s = String(value ?? '').trim();
  if (!s) return null;
  // strip $, %, thousands separators for number detection
  const stripped = s.replace(/[\$,]/g, '').replace(/%$/, '');
  // Number? (allow leading minus, decimals, scientific)
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(stripped)) {
    return Number(stripped);
  }
  return s;
}

const out = { _refreshed: new Date().toISOString() };

raw.split(/\r?\n/).forEach((line) => {
  if (!line.trim()) return;
  const cells = parseCsvLine(line);
  const key = (cells[0] || '').trim().toLowerCase();
  if (!key || key.startsWith('#')) return; // allow # comment rows
  const value = coerce(cells[1]);
  if (value !== null) out[key] = value;
});

fs.mkdirSync(outFile.replace(/[/\\][^/\\]+$/, '') || '.', { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
console.log(`Wrote ${Object.keys(out).length - 1} fields → ${outFile}`);
