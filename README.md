# RKLB Investor Dashboard

A modern, self-hosted investor view of **Rocket Lab Corporation (NASDAQ: RKLB)** — charts, financials, capital structure, the Neutron program, Space Systems, launch cadence, defense backlog, competitive landscape, valuation scenarios, and live SEC EDGAR links.

Refreshed against the **Q1 2026 10-Q + 8-K (reported May 7, 2026)** and the **FY2025 results (Feb 26, 2026)**.

> Built from the same framework as a sister EOSE dashboard. The structure is intentionally the same; the data, copy, and theme are 100% Rocket Lab.

---

## Files

```
index.html                  ← canonical dashboard (GitHub Pages serves this)
README.md
assets/
  rklb-logo.svg             ← original logo mark (black + Rocket Lab red), not the trademarked logo
  music/                    ← optional background-music tracks (opt-in player, off by default)
css/
  styles.css                ← carbon-black + signal-red theme tokens (dark + light), layout, components
js/
  data.js                   ← all data (Q1'26 actuals + projections + structures) → window.RKLB_DATA
  charts.js                 ← custom SVG chart library (bar, area, stacked, sparkline, dual-bridge, candlestick)
  app.js                    ← rendering, live quote (Finnhub poll + JSON fallback), CSV export, search, scroll-spy, theme
  tweaks-panel.jsx          ← React-based design tweaks (palette, density, font, etc.)
  tweaks-app.jsx
data/
  quote.json                ← latest quote snapshot (seed; refreshed by the GitHub Action)
  history.json              ← ~1 year of daily OHLC for the candlestick (fetched from Yahoo)
.github/
  scripts/, workflows/      ← keyless quote + history refresh automation
```

> **Domain is a placeholder.** Canonical/OpenGraph URLs use `rklbdashboard.example`. Set your real domain in `index.html`, `robots.txt`, and `sitemap.xml` (and add a `CNAME` file) before publishing.

---

## Theme

Carbon-black base (`#0A0A0B`) with a **Rocket Lab signal-red** accent (`#E4002B`) and an exhaust-orange highlight (`#FF7A33`). Because red is the brand accent, financial up/down semantics use a distinct green (`--positive`) and coral-red (`--negative`) so price changes stay readable. Toggle light/dark with the sun icon (top-right).

---

## Deploy to GitHub Pages (5 minutes)

1. Create a new GitHub repo — e.g. `rklb-dashboard`
2. Upload the entire folder (preserve the `css/`, `js/`, `assets/`, `data/` structure)
3. **Settings → Pages → Branch: `main` / folder: `/ (root)` → Save**
4. Your dashboard is live at: `https://YOUR-USERNAME.github.io/rklb-dashboard`

The page works fully without any API keys.

---

## Live quote — two tiers (+ history)

The dashboard resolves the quote in priority order and never breaks if a tier is unavailable:

| Tier | Source | Cadence | Key? |
|---|---|---|---|
| 1 (best) | **Finnhub** REST poll | ~25s while tab is visible | Free key |
| 2 | **Google Sheets + GitHub Action** → `data/quote.json` | ~5 min | No key |
| 3 (local dev) | Stooq direct (`rklb.us`) | on load | No key (CORS-blocked on github.io) |

The 1-year candlestick reads `data/history.json`, refreshed twice daily by `.github/workflows/update-history.yml` (Yahoo Finance v8 chart API, `SYMBOL = 'RKLB'`).

### Tier 1 — Finnhub (near-live, recommended)

Get a free key at [finnhub.io/register](https://finnhub.io/register), then either edit `CONFIG.FINNHUB_KEY` near the top of `js/app.js`, append `?finnhub=YOUR_KEY` to the URL, or set `localStorage['rklb-finnhub-key']`. If the key is blank or throttled, the page silently falls back to Tier 2.

### Tier 2 — Google Sheets + GitHub Action (keyless baseline)

GitHub Pages can't fetch Stooq/Yahoo directly (CORS), so a GitHub Action fetches a public Google Sheet every ~5 min and writes `data/quote.json`.

1. New sheet at [sheets.new](https://sheets.new), two-column key/value layout:

```
price      =GOOGLEFINANCE("NASDAQ:RKLB","price")
change     =GOOGLEFINANCE("NASDAQ:RKLB","change")
changepct  =GOOGLEFINANCE("NASDAQ:RKLB","changepct")
volume     =GOOGLEFINANCE("NASDAQ:RKLB","volume")
high52     =GOOGLEFINANCE("NASDAQ:RKLB","high52")
low52      =GOOGLEFINANCE("NASDAQ:RKLB","low52")
marketcap  =GOOGLEFINANCE("NASDAQ:RKLB","marketcap")
pe         =GOOGLEFINANCE("NASDAQ:RKLB","pe")
```

2. File → Share → "Anyone with the link can view".
3. Copy the Sheet ID (between `/d/` and `/edit`).
4. Repo → **Settings → Secrets and variables → Actions → Variables → New repository variable** named `QUOTE_SHEET_ID`.
5. Actions tab → "Update RKLB quote" → "Run workflow".

The Action commits only when a field changes, so off-hours history stays clean.

---

## What's on the page (sections)

| # | Section | Content |
|---|---------|---------|
| 01 | Overview | 1-yr price & events candlestick + six Q1'26 KPI tiles with sparklines |
| 02 | Bull vs Bear | Nine bull / eight bear points, each evidenced with a source |
| 03 | Neutron + Space Systems | Two growth-engine panels — specs, narrative, sources |
| 03b | History | Compact timeline of the last ~12 months of catalysts |
| 04 | Financials | Quarterly + annual revenue, GAAP gross margin, operating loss, cash, summary table, CSV export |
| 05 | Cap Structure | Cash/debt/preferred, equity & shares, reading guide (balance sheet is a strength) |
| 06 | Launch Cadence | Launches/yr by vehicle, cumulative flights, launches/quarter, 100%-success track record |
| 07 | Vehicles | Neutron, Electron (+HASTE), Photon, Flatellite + launch/space-systems competitive landscape |
| 08 | Backlog | Funnel, backlog over time, bookings/quarter, key contracts (SDA, Synspective, iQPS, …) |
| 08b | Programs | Near-term catalyst window + SDA (PWSA) and Golden Dome / national-security deep dives |
| 09 | Valuation | P/S history, market cap, FY25→FY28 bridge, Bear/Base/Bull/Blue-Sky scenarios |
| 09b–09e | Analysts / Sentiment / Insiders / Rumors | Consensus, positioning, Form-4 summary, addressed rumors |
| 10 | Catalysts | Dated upcoming catalysts (Neutron debut, SDA deliveries, …) |
| 11 | Filings & News | Direct EDGAR links (10-Q, 10-K, 8-K, ATM) + live coverage feeds |
| 11b–11d | Policy / Legal / About | Golden Dome tailwind, the dismissed securities suit, authorship & disclaimers |
| 12 | Risks & Methodology | Bear-thesis cards + an explicit sourced-vs-modeled methodology note |

---

## Updating data after the next earnings release

Open `js/data.js` (`window.RKLB_DATA`). Each time-series carries `{ type: 'actual' | 'projected' }`.

1. Flip the most-recent `projected` quarter to `actual` and drop in the disclosed numbers.
2. Update `kpis`, `quarterTable`, `backlog`, `bookings`, `funnel`.
3. Update `filings`, `news`, and `catalysts` (move reported items to `done`).
4. Optionally update `capStructure` from the new 10-Q.

Charts rebuild from `data.js`; no chart code changes are typically needed.

---

## Data sources

- **Q1 2026 10-Q**: [rklb-20260331.htm](https://www.sec.gov/Archives/edgar/data/0001819994/000181999426000028/rklb-20260331.htm)
- **Q1 2026 8-K release**: [rklb-05072026ex991.htm](https://www.sec.gov/Archives/edgar/data/0001819994/000181999426000027/rklb-05072026ex991.htm)
- **FY2025 8-K release**: [rklb-02262026ex991.htm](https://www.sec.gov/Archives/edgar/data/0001819994/000181999426000012/rklb-02262026ex991.htm)
- **FY2025 10-K**: [rklb-20251231.htm](https://www.sec.gov/Archives/edgar/data/0001819994/000181999426000013/rklb-20251231.htm)
- **All filings**: [SEC EDGAR (CIK 1819994)](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001819994)
- **Investor Relations**: [investors.rocketlabcorp.com](https://investors.rocketlabcorp.com/)
- **Neutron program**: [rocketlabcorp.com/launch/neutron](https://rocketlabcorp.com/launch/neutron/)

---

## Estimates & projections

- Quarterly/annual projections beyond Q1'26 are **model assumptions** (a Neutron-ramp scenario), not company forecasts — Rocket Lab only guides one quarter out.
- The **operating loss** series in §04 is *derived* (gross profit − opex); the company reports net loss and adjusted EBITDA.
- Older-quarter gross-margin, cash, backlog, bookings, and cumulative-launch figures are **approximate** where not directly reported, and the backlog segment split in the funnel is an **estimate** (`*`).
- Scenario prices assume ~620M diluted shares (FY2028E) and illustrative EV/sales multiples — ranges, not forecasts.

---

## Logo note

`assets/rklb-logo.svg` is an **original mark** created for this dashboard (black tile, white rocket form, red exhaust swoosh) that echoes Rocket Lab's brand palette. It is **not** the company's trademarked logo.

---

## Not investment advice

This page is an independent research dashboard. Verify all figures against primary SEC filings before any investment decision. No affiliation with Rocket Lab Corporation.

---

*Last data refresh: Q1 2026 actuals through 3/31/26, incorporating the 10-Q and the May 7, 2026 8-K earnings release.*
