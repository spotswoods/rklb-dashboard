# RKLB Dashboard — Editing Guide

How the dashboard is wired, and **where to change each section's content**.

> This page was originally built from an Eos Energy (EOSE) template. A few internal
> object keys still carry neutral/legacy names (`frontierPlatform`, `regulatedPrograms`,
> `products.indensity`, …). They are invisible plumbing — the table below tells you which
> key drives which on-page section so you never have to guess.

## The three files

| File | What it holds | When to edit |
|---|---|---|
| `js/data.js` | **All content & numbers** (`window.RKLB_DATA`). One big object. | 99% of edits — text, figures, links, tables. |
| `js/app.js` | Render layer — reads `RKLB_DATA`, fills the DOM, draws charts, live quote. | Only to change *behaviour* (formatting, new fields, chart options). |
| `index.html` | Page skeleton — section markup, card titles/subtitles, `data-*` hooks. | Static labels, card titles, **hardcoded subtitles**, layout. |
| `css/styles.css` | Theme tokens & all styling (carbon black + Rocket Lab red). | Colours, spacing, fonts. Brand red = `--brand-green` / `--accent`. |

**Rule of thumb:** numbers and prose that render dynamically live in `data.js`.
A few subtitles are hardcoded directly in `index.html` (see the ⚠ rows below) — those
must be edited in the HTML, not the data file.

## Section → data map

Each row: the on-page section (anchor `#id`), the `data.js` key that fills it, and notes.

| # | Section (`#anchor`) | `data.js` key | Notes |
|---|---|---|---|
| 01 | Overview (`#overview`) | `kpis`, `priceEvents`, `quarterlyRevenue` | KPI strip + 1-yr price/candlestick chart. KPI cards are also hardcoded in `index.html` (~L313–342) — keep them in sync with `kpis`. |
| 02 | Bull vs Bear (`#thesis`) | `scorecard.bull` / `scorecard.bear` | Each item: `{point, src}`. |
| 03 | Growth Engines (`#frontier`) | `frontierPlatform.uk` = **Neutron**, `frontierPlatform.us` = **Space Systems** | Legacy key name. Each side: `summary`, `why`, `terms[]`, `sources[]`. |
| 03b | Recent History (`#history`) | `recentHistory[]` | `{date, title, body, url}`, auto-sorted newest-first. |
| 04 | Financials (`#financials`) | `quarterlyRevenue`, `annualRevenue`, `grossMargin`, `opIncome`, `liquidity`, `quarterTable` | ⚠ The four chart **subtitles** (revenue/cash/margin/op-income) are **hardcoded in `index.html` ~L441–477** — edit there. |
| 05 | Capital Structure (`#capstructure`) | `capStructure` | `liabilities[]`, `equity[]`, `note` (HTML allowed). |
| 06 | Launch Cadence (`#production`) | `capacity` (per-year by vehicle), `uptime` (cumulative), `graphite` (per-quarter) | Legacy chart keys. `capacity` series: `l1`=Electron, `l2`=HASTE, `l3`=Neutron. Labels/units set in `app.js` (`labels`, `unit`). |
| 07 | Vehicles & Platforms (`#product`) | `products.indensity` = **Neutron**, `.cube` = **Electron+HASTE**, `.z3Module` = **Photon**, `.dawnos` = **Flatellite** | Legacy key names. |
| 08 | Backlog & Contracts (`#pipeline`) | `funnel`, `backlog`, `bookings`, `contracts` | `contracts[].scope` → the "Scope" column (sats / launch count). |
| 08b | Government Programs (`#programs`) | `catalystWindow`, `regulatedPrograms.ofgem` = **SDA**, `.nyserda` = **Golden Dome/Defense** | Legacy key names. `.takeaway` = the investor-impact blurb. |
| 09 | Valuation (`#valuation`) | `psMultiple`, `marketCap`, `bridge`, `scenarios` | Scenario upside % re-anchors to the live price on load. |
| 09b | Analyst Coverage (`#analysts`) | `analystCoverage` | `consensus`, `recentActions[]`, `sentiment`. |
| 09c | Sentiment & Positioning (`#sentiment`) | `sentiment` | `shortInterest`, `insiders`, `institutional`, `retail`. |
| 09d | Insider Trades (`#insiders`) | `insiderTrades` | `pending`, `summary`, `codeLegend[]`, `transactions[]`. Only verifiable Form 4 rows. |
| 09e | Rumors & Open Debates (`#rumors`) | `rumors.bull` / `rumors.bear` | `{claim, evidence}`. |
| 10 | Catalysts (`#catalysts`) | `catalysts[]` | `{date, event, status, tone}`. `[Regulator]` status → "DECISION" styling. |
| 11 | Filings & News (`#filings`) | `filings[]`, `news[]` | Real EDGAR + live category links. |
| 11b | Policy (`#policy`) | `policy` | `.takeaway` = investor-impact blurb. |
| 11c | Legal (`#legal`) | `legal.case` | Securities suit — dismissed Apr 2026. |
| 11d | About (`#about`) | static HTML | Edit `index.html` directly. |
| 12 | Risks & Methodology (`#risks`) | `risks[]` | `{title, body}`. Methodology list is static HTML (~L1132–1145). |

## Field-name cheat sheet (legacy → meaning)

| Key in `data.js` | Actually means |
|---|---|
| `frontierPlatform.uk` / `.us` | Neutron / Space Systems |
| `regulatedPrograms.ofgem` / `.nyserda` | SDA / Golden Dome |
| `products.indensity` / `.cube` / `.z3Module` / `.dawnos` | Neutron / Electron / Photon / Flatellite |
| `contracts[].scope` | "Scope" column value (sats / launches) |
| `.takeaway` | "What this means for the RKLB investor" blurb |
| `capacity[].l1` / `.l2` / `.l3` | Electron / HASTE / Neutron launch counts |

## Common edits

- **Update a quarter's revenue:** `data.js` → `quarterlyRevenue` (add/edit `{q, v, type}`), and `quarterTable`. Check the revenue card subtitle in `index.html`.
- **Change the live-quote source / API key:** `js/app.js`, `loadQuote()` and the Finnhub/Stooq block near the top (`localStorage 'rklb-finnhub-key'`).
- **Refresh price history:** `.github/scripts/fetch-history.js` (the CI job that updates the candlestick data).
- **Re-theme:** `css/styles.css` `:root` / `[data-theme=...]` tokens. Brand red is `--brand-green` / `--accent`; "up" moves are intentionally white/ink, not green.

## Local preview

```
python -m http.server 4185
```
Then open `http://localhost:4185/`. (Config in `.claude/launch.json`.)
