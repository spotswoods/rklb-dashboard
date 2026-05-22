// RKLB data — sourced from primary SEC filings and Rocket Lab press releases.
// Latest quarter: Q1 2026 (reported May 7, 2026 — 8-K + 10-Q). FY2025 from the
// Feb 26, 2026 release / 10-K. Projections beyond Q1'26 are model assumptions,
// NOT company guidance (Rocket Lab only guides one quarter out). Not investment advice.
//
// ⚠ EDITING THIS DASHBOARD? See EDITING-GUIDE.md in the repo root — it maps every
// on-page section to the exact data key below (and the chart/render wiring).
//
// Data keys are descriptive (growthEngines.neutron/.spaceSystems, demandPrograms.sda/.goldenDome,
// products.neutron/.electron/.photon/.flatellite). A few invisible DOM hooks in index.html still
// carry Eos-template names (data-frontier-*, data-program-*, data-prod-indensity/cube/z3/dawnos-*);
// app.js bridges key → hook, so you never touch those when editing content here. Field notes:
//   contracts[].scope = the "Scope" column (sats / launch count)
//   .takeaway = the "what this means for the RKLB investor" blurb (programs, policy, catalyst window)
//
// Last refresh: 2026-05-22
// Primary sources:
//   Q1'26 8-K   https://www.sec.gov/Archives/edgar/data/0001819994/000181999426000027/rklb-05072026ex991.htm
//   Q1'26 10-Q  https://www.sec.gov/Archives/edgar/data/0001819994/000181999426000028/rklb-20260331.htm
//   FY25 8-K    https://www.sec.gov/Archives/edgar/data/0001819994/000181999426000012/rklb-02262026ex991.htm
//   FY25 10-K   https://www.sec.gov/Archives/edgar/data/0001819994/000181999426000013/rklb-20251231.htm
//   EDGAR CIK 1819994.
// * marks a conservative model estimate (split/derivation), not a directly reported figure.

window.RKLB_DATA = {
  // ────────── Ticker / hero (overridden by live quote fetch in app.js) ──────────
  ticker: {
    symbol: 'RKLB',
    name: 'Rocket Lab Corporation',
    exchange: 'NASDAQ',
    price: 0,            // populated by loadQuote()
    change: 0,
    changePct: 0,
    marketCap: 0,        // computed: price × shares
    volume: 0,
    avgVol: 16.5,
    high52: 0,
    low52: 0,
    shares: 578.9,       // 578,867,475 common shares as of 5/13/26 (10-Q cover)
    asOf: 'live · Stooq delayed quote'
  },

  // ────────── KPI strip — Q1'26 actuals (reported May 7, 2026) ──────────
  kpis: [
    { label: 'Q1\'26 Revenue',       value: '$200.3M',   delta: '+63.5% YoY · record · beat top of guide', tone: 'up'   },
    { label: 'GAAP Gross Margin',    value: '38.2%',     delta: 'Record · 43.0% non-GAAP',                 tone: 'up'   },
    { label: 'Backlog (3/31/26)',    value: '$2.2B',     delta: '+108% YoY · +20% QoQ',                    tone: 'up'   },
    { label: 'Adj. EBITDA',          value: '−$11.8M',   delta: 'Loss narrowing · beat guidance',          tone: 'up'   },
    { label: 'Cash & Liquidity',     value: '$1.21B',    delta: 'Total liquidity >$2.0B',                  tone: 'flat' },
    { label: 'Q2\'26 Guidance',      value: '$225–240M', delta: 'Another record · GM 33–35% GAAP',         tone: 'up'   }
  ],

  // ────────── Quarterly revenue ($M) — actuals from 8-Ks / 10-Qs ──────────
  quarterlyRevenue: [
    { q: '1Q23', v: 54.9,  type: 'actual'    },
    { q: '2Q23', v: 62.0,  type: 'actual'    },
    { q: '3Q23', v: 67.7,  type: 'actual'    },
    { q: '4Q23', v: 60.2,  type: 'actual'    },
    { q: '1Q24', v: 92.8,  type: 'actual'    },
    { q: '2Q24', v: 106.3, type: 'actual'    },
    { q: '3Q24', v: 104.8, type: 'actual'    },
    { q: '4Q24', v: 132.4, type: 'actual'    },
    { q: '1Q25', v: 122.6, type: 'actual'    },
    { q: '2Q25', v: 144.5, type: 'actual'    },
    { q: '3Q25', v: 155.0, type: 'actual'    },
    { q: '4Q25', v: 179.7, type: 'actual'    },
    { q: '1Q26', v: 200.3, type: 'actual'    },  // Q1'26 8-K: $200.3M (+63.5% YoY)
    // Projections — Q2'26 = guidance midpoint ($225–240M); rest are model (Neutron ramp)
    { q: '2Q26', v: 232.5, type: 'projected' },
    { q: '3Q26', v: 265.0, type: 'projected' },
    { q: '4Q26', v: 300.0, type: 'projected' },
    { q: '1Q27', v: 330.0, type: 'projected' },
    { q: '2Q27', v: 375.0, type: 'projected' },
    { q: '3Q27', v: 425.0, type: 'projected' },
    { q: '4Q27', v: 480.0, type: 'projected' },
    { q: '1Q28', v: 540.0, type: 'projected' },
    { q: '2Q28', v: 600.0, type: 'projected' },
    { q: '3Q28', v: 660.0, type: 'projected' },
    { q: '4Q28', v: 720.0, type: 'projected' }
  ],

  // ────────── Annual revenue ($M) ──────────
  annualRevenue: [
    { y: 'FY21', v: 62.2,   type: 'actual'    },
    { y: 'FY22', v: 211.0,  type: 'actual'    },
    { y: 'FY23', v: 244.8,  type: 'actual'    },
    { y: 'FY24', v: 436.2,  type: 'actual'    },
    { y: 'FY25', v: 601.8,  type: 'actual'    },
    { y: 'FY26', v: 998.0,  type: 'projected' },   // model — ~$1.0B (street consensus area)
    { y: 'FY27', v: 1610.0, type: 'projected' },
    { y: 'FY28', v: 2520.0, type: 'projected' }
  ],

  // ────────── GAAP gross margin % per quarter ──────────
  // Older quarters approximate; 1Q26 = 38.2% reported (record). Positive throughout.
  grossMargin: [
    { q: '1Q24', v: 24,   type: 'actual'    },
    { q: '2Q24', v: 25,   type: 'actual'    },
    { q: '3Q24', v: 26,   type: 'actual'    },
    { q: '4Q24', v: 26,   type: 'actual'    },
    { q: '1Q25', v: 29,   type: 'actual'    },
    { q: '2Q25', v: 31,   type: 'actual'    },
    { q: '3Q25', v: 33,   type: 'actual'    },
    { q: '4Q25', v: 34,   type: 'actual'    },
    { q: '1Q26', v: 38,   type: 'actual'    },   // 38.2% GAAP reported (43.0% non-GAAP)
    { q: '2Q26', v: 34,   type: 'projected' },   // guidance 33–35% GAAP
    { q: '3Q26', v: 35,   type: 'projected' },
    { q: '4Q26', v: 36,   type: 'projected' },
    { q: '1Q27', v: 37,   type: 'projected' },
    { q: '2Q27', v: 38,   type: 'projected' },
    { q: '3Q27', v: 39,   type: 'projected' },
    { q: '4Q27', v: 40,   type: 'projected' },
    { q: '1Q28', v: 41,   type: 'projected' },
    { q: '2Q28', v: 42,   type: 'projected' },
    { q: '3Q28', v: 43,   type: 'projected' },
    { q: '4Q28', v: 44,   type: 'projected' }
  ],

  // ────────── Operating income / (loss) ($M) — GAAP, *derived* (gross profit − opex) ──────────
  // Q1'26: 38.2% × $200.3M gross profit ≈ $76.5M − $132.5M opex ≈ −$56.0M operating loss.
  opIncome: [
    { q: '1Q25', v: -52.0, type: 'actual'    },
    { q: '2Q25', v: -48.0, type: 'actual'    },
    { q: '3Q25', v: -43.0, type: 'actual'    },
    { q: '4Q25', v: -52.0, type: 'actual'    },
    { q: '1Q26', v: -56.0, type: 'actual'    },   // derived; GAAP net loss reported $(45.0)M
    { q: '2Q26', v: -50.0, type: 'projected' },
    { q: '3Q26', v: -42.0, type: 'projected' },
    { q: '4Q26', v: -33.0, type: 'projected' },
    { q: '1Q27', v: -24.0, type: 'projected' },
    { q: '2Q27', v: -14.0, type: 'projected' },
    { q: '3Q27', v: -4.0,  type: 'projected' },
    { q: '4Q27', v: 8.0,   type: 'projected' },
    { q: '1Q28', v: 18.0,  type: 'projected' },
    { q: '2Q28', v: 30.0,  type: 'projected' },
    { q: '3Q28', v: 42.0,  type: 'projected' },
    { q: '4Q28', v: 55.0,  type: 'projected' }
  ],

  // ────────── Cash & equivalents ($M) — exact at 1Q26; older approx ──────────
  // Q1'26: $1,205.5M cash & equivalents; total liquidity >$2.0B incl. marketable
  // securities + $3.0B ATM availability.
  liquidity: [
    { q: '1Q25', v: 480.0,  type: 'actual'    },
    { q: '2Q25', v: 750.0,  type: 'actual'    },
    { q: '3Q25', v: 850.0,  type: 'actual'    },
    { q: '4Q25', v: 1100.0, type: 'actual'    },
    { q: '1Q26', v: 1205.5, type: 'actual'    },
    { q: '2Q26', v: 1150.0, type: 'projected' },
    { q: '3Q26', v: 1100.0, type: 'projected' },
    { q: '4Q26', v: 1050.0, type: 'projected' },
    { q: '1Q27', v: 1000.0, type: 'projected' },
    { q: '2Q27', v: 1050.0, type: 'projected' },
    { q: '3Q27', v: 1150.0, type: 'projected' },
    { q: '4Q27', v: 1300.0, type: 'projected' }
  ],

  // ────────── Recent quarterly summary table ──────────
  quarterTable: [
    { q: '1Q25', rev: 122.6, gm: 29, op: -52.0, liq: 480.0,  type: 'A' },
    { q: '2Q25', rev: 144.5, gm: 31, op: -48.0, liq: 750.0,  type: 'A' },
    { q: '3Q25', rev: 155.0, gm: 33, op: -43.0, liq: 850.0,  type: 'A' },
    { q: '4Q25', rev: 179.7, gm: 34, op: -52.0, liq: 1100.0, type: 'A' },
    { q: '1Q26', rev: 200.3, gm: 38, op: -56.0, liq: 1205.5, type: 'A' },
    { q: '2Q26', rev: 232.5, gm: 34, op: -50.0, liq: 1150.0, type: 'E' },
    { q: '3Q26', rev: 265.0, gm: 35, op: -42.0, liq: 1100.0, type: 'E' },
    { q: '4Q26', rev: 300.0, gm: 36, op: -33.0, liq: 1050.0, type: 'E' }
  ],

  // ────────── Launches per year by vehicle (count) — REPURPOSED capacity chart ──────────
  // l1 = Electron orbital · l2 = HASTE suborbital · l3 = Neutron · l4/l5 unused.
  capacity: [
    { y: 'FY23', l1: 9,  l2: 1, l3: 0, l4: 0, l5: 0 },
    { y: 'FY24', l1: 14, l2: 2, l3: 0, l4: 0, l5: 0 },
    { y: 'FY25', l1: 18, l2: 3, l3: 0, l4: 0, l5: 0 },   // 21 total, 100% success
    { y: 'FY26', l1: 22, l2: 4, l3: 1, l4: 0, l5: 0 },   // projected — Neutron debut Q4
    { y: 'FY27', l1: 26, l2: 5, l3: 6, l4: 0, l5: 0 }    // projected — Neutron ramp
  ],

  // ────────── Cumulative Electron + HASTE launches (count) — REPURPOSED uptime chart ──────────
  // Approximate cumulative flight count (Electron first flew 2017). Mark as estimate.
  uptime: [
    { q: '3Q24', v: 50 },
    { q: '4Q24', v: 54 },
    { q: '1Q25', v: 57 },
    { q: '2Q25', v: 62 },
    { q: '3Q25', v: 68 },
    { q: '4Q25', v: 75 },
    { q: '1Q26', v: 80 },
    { q: '2Q26', v: 85 },
    { q: '3Q26', v: 90 },
    { q: '4Q26', v: 96 }
  ],

  // ────────── Launches per quarter (count) — REPURPOSED graphite chart ──────────
  graphite: [
    { q: '1Q24', v: 3 },
    { q: '2Q24', v: 5 },
    { q: '3Q24', v: 4 },
    { q: '4Q24', v: 4 },
    { q: '1Q25', v: 3 },
    { q: '2Q25', v: 5 },
    { q: '3Q25', v: 6 },
    { q: '4Q25', v: 7 }   // record quarterly launch count
  ],

  // ────────── Opportunity funnel — backlog → near-term revenue ──────────
  funnel: [
    { stage: 'Total backlog (3/31/26)',                value: 2200, label: '$2.2B'   },
    { stage: 'Space Systems backlog (est. share)',     value: 1400, label: '~$1.4B*' },
    { stage: 'Launch Services backlog (est. share)',   value: 800,  label: '~$0.8B*' },
    { stage: 'FY2026 revenue (model midpoint)',        value: 998,  label: '~$1.0B'  }
  ],

  // ────────── Backlog over time ($M) ──────────
  // 1Q26 = $2.2B (record, +108% YoY, +20% QoQ); 4Q25 = $1.85B; older approx.
  backlog: [
    { q: '1Q24', v: 1019 },
    { q: '2Q24', v: 1050 },
    { q: '3Q24', v: 1054 },
    { q: '4Q24', v: 1067 },
    { q: '1Q25', v: 1062 },
    { q: '2Q25', v: 1010 },
    { q: '3Q25', v: 1067 },
    { q: '4Q25', v: 1850 },   // FY25 release: $1.85B (+73% YoY)
    { q: '1Q26', v: 2200 }    // Q1'26: $2.2B record
  ],

  // ────────── New bookings per quarter ($M) — *derived* (Δbacklog + revenue), approx ──────────
  bookings: [
    { q: '1Q24', v: 90  },
    { q: '2Q24', v: 137 },
    { q: '3Q24', v: 109 },
    { q: '4Q24', v: 145 },
    { q: '1Q25', v: 118 },
    { q: '2Q25', v: 93  },
    { q: '3Q25', v: 212 },
    { q: '4Q25', v: 963 },   // includes the $816M SDA Tranche 3 award
    { q: '1Q26', v: 560 }    // 31 Electron/HASTE contracts + MACH-TB + Space Systems
  ],

  // ────────── Contracts ──────────
  // Publicly named Rocket Lab counterparties / programs. $ values are reported
  // where disclosed; * = model estimate. RKLB does not disclose per-launch pricing.
  contracts: [
    { customer: 'Space Development Agency — Tranche 2 Transport Layer-Beta (prime)', scope: '18 sats', region: 'US DoD', status: 'Building',          value: '$515M'   },
    { customer: 'Space Development Agency — Tranche 3 Tracking Layer (prime)',        scope: '18 sats', region: 'US DoD', status: 'Awarded Dec 2025',  value: '$816M'   },
    { customer: 'Synspective (Japan) — SAR constellation',                            scope: '21 launches', region: 'Japan', status: 'Launching → 2030', value: 'Largest dedicated Electron order' },
    { customer: 'iQPS (Japan) — SAR constellation',                                   scope: '8 launches',  region: 'Japan', status: 'Launching',        value: 'Multi-launch' },
    { customer: 'Kinéis (France) — IoT constellation',                                scope: '5 launches',  region: 'France', status: 'Completed (25 sats)', value: 'Delivered'  },
    { customer: 'MDA Space / Globalstar — next-gen LEO (subcontract)',                scope: '17+ sats',    region: 'US/Canada', status: 'Building',     value: '~$143M*'  },
    { customer: 'Varda Space Industries — re-entry spacecraft (Photon-based)',        scope: 'multiple',    region: 'US',     status: 'Delivering',       value: 'undisclosed' },
    { customer: 'MACH-TB 2.0 — hypersonic test (HASTE, via Leidos/DoD)',              scope: 'multi-launch', region: 'US DoD', status: 'Awarded Q1\'26 (record)', value: 'undisclosed' },
    { customer: 'Raytheon — Space Based Interceptor (Golden Dome) payload',           scope: 'prototype',   region: 'US DoD', status: 'Awarded Q1\'26',  value: 'undisclosed' },
    { customer: 'NASA — ESCAPADE (Mars), CAPSTONE (Moon), science missions',          scope: 'mission',     region: 'US',     status: 'Mixed',            value: 'undisclosed' }
  ],

  // ────────── P/S multiple (trailing, by year — approx, premium-growth name) ──────────
  psMultiple: [
    { y: 'FY21', v: 110 },
    { y: 'FY22', v: 9   },
    { y: 'FY23', v: 9   },
    { y: 'FY24', v: 16  },
    { y: 'FY25', v: 38  },
    { y: 'FY26', v: 72  },   // ~$72B mcap / FY26 model ~$1.0B
    { y: 'FY27', v: 45  },
    { y: 'FY28', v: 29  }
  ],

  // ────────── Market cap ($M) — approx year-end; FY26 = current ──────────
  marketCap: [
    { y: 'FY21', v: 6800  },
    { y: 'FY22', v: 1900  },
    { y: 'FY23', v: 2100  },
    { y: 'FY24', v: 12500 },
    { y: 'FY25', v: 23000 },
    { y: 'FY26', v: 72400 },   // ~$125 × 578.9M (placeholder; overwritten on live load)
    { y: 'FY27', v: 85000 }
  ],

  // ────────── Scenarios — FY2028E. Upside vs. ~$125 anchor (≈620M shares assumed) ──────────
  // NOTE: at the current valuation the BASE case implies downside — surfaced honestly.
  scenarios: [
    { name: 'Bear',     rev: 1800, ev: 8,  mcap: 14400,  price: 23.20,  upside: '−81%', tone: 'down' },
    { name: 'Base',     rev: 2520, ev: 18, mcap: 45360,  price: 73.20,  upside: '−41%', tone: 'down' },
    { name: 'Bull',     rev: 3000, ev: 30, mcap: 90000,  price: 145.20, upside: '+16%', tone: 'up'   },
    { name: 'Blue Sky', rev: 3500, ev: 40, mcap: 140000, price: 225.80, upside: '+81%', tone: 'up'   }
  ],

  // ────────── Catalysts ──────────
  catalysts: [
    { date: 'Feb 25, 2025', event: 'Bleecker Street short report alleging Neutron delays → triggers securities suit (later dismissed Apr 2026)', status: 'Reported [Press]',   tone: 'done' },
    { date: 'May 27, 2025', event: 'Geost acquisition announced ($275M) — EO/IR missile-tracking sensors', status: 'Closed [Company]',          tone: 'done' },
    { date: 'Dec 2025',     event: 'SDA Tranche 3 Tracking Layer prime award ($816M, 18 satellites) — largest single contract', status: 'Reported [Company]', tone: 'done' },
    { date: 'Feb 26, 2026', event: 'Q4 & FY2025 results — record $602M revenue (+38%), backlog $1.85B', status: 'Reported [Company]',          tone: 'done' },
    { date: 'Mar 27, 2026', event: 'CEO Peter Beck adopts Rule 10b5-1 plan (up to 5M shares, expires Jul 8, 2026)', status: 'Reported [Form 4]', tone: 'done' },
    { date: 'Apr 14, 2026', event: 'Mynaric acquisition closed ($155.3M) — laser optical comms (Munich)', status: 'Closed [Company]',          tone: 'done' },
    { date: 'May 7, 2026',  event: 'Q1 2026 beat — record $200.3M revenue, $2.2B backlog, 5-launch Neutron deal', status: 'Reported [Company]', tone: 'done' },
    { date: 'Mid-2026',     event: 'Neutron first flight vehicle integration + Archimedes engine qualification (Stennis)', status: 'In progress [Company]', tone: 'soon' },
    { date: '~Aug 2026',    event: 'Q2 2026 earnings — guided to another record ($225–240M)',          status: 'Pending',                    tone: 'soon' },
    { date: 'Q4 2026',      event: 'Neutron maiden launch from Wallops LC-3 (FAA window Jul–Dec 2026)', status: 'Catalyst [Company]',        tone: 'soon' },
    { date: '2026–27',      event: 'SDA Tranche 2 satellite deliveries begin',                          status: 'Watch [Company]',            tone: 'future' },
    { date: '2026–27',      event: 'Golden Dome / Space Based Interceptor program down-selects',         status: 'Watch [Regulator]',          tone: 'future' },
    { date: 'FY2026',       event: 'Revenue ~$1.0B (model — NOT company guidance)',                      status: 'Projected [Model]',          tone: 'future' },
    { date: 'FY2027',       event: 'Neutron commercial ramp + operating breakeven (model)',              status: 'Projected [Model]',          tone: 'future' }
  ],

  // ────────── Filings — real EDGAR documents (CIK 1819994) ──────────
  filings: [
    { date: 'May 13, 2026', form: '10-Q',  desc: 'Quarterly Report — Q1 2026',
      url: 'https://www.sec.gov/Archives/edgar/data/0001819994/000181999426000028/rklb-20260331.htm' },
    { date: 'May 7, 2026',  form: '8-K',   desc: 'Q1 2026 earnings release (Ex. 99.1)',
      url: 'https://www.sec.gov/Archives/edgar/data/0001819994/000181999426000027/rklb-05072026ex991.htm' },
    { date: 'Feb 26, 2026', form: '8-K',   desc: 'Q4 & FY2025 earnings release (Ex. 99.1)',
      url: 'https://www.sec.gov/Archives/edgar/data/0001819994/000181999426000012/rklb-02262026ex991.htm' },
    { date: 'Feb 2026',     form: '10-K',  desc: 'Annual Report — FY 2025',
      url: 'https://www.sec.gov/Archives/edgar/data/0001819994/000181999426000013/rklb-20251231.htm' },
    { date: 'Ongoing',      form: '424B5', desc: '$3.0B at-the-market (ATM) common stock program',
      url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001819994&type=424B5' },
    { date: 'Various',      form: 'SC 13D/G', desc: 'Beneficial ownership (incl. P. Beck) statements',
      url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001819994&type=SC+13' },
    { date: 'All filings',  form: 'EDGAR', desc: 'CIK 1819994 — full filings index',
      url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001819994' }
  ],

  // ────────── News & coverage sources (live category pages, not hand-curated headlines) ──────────
  news: [
    { date: 'Live', src: 'Rocket Lab IR', title: 'Investor Relations — press releases & events',
      url: 'https://investors.rocketlabcorp.com/news-releases' },
    { date: 'Live', src: 'Yahoo Finance', title: 'RKLB news feed — aggregated coverage',
      url: 'https://finance.yahoo.com/quote/RKLB/news/' },
    { date: 'Live', src: 'Google News',   title: 'RKLB — recent headlines',
      url: 'https://news.google.com/search?q=%22Rocket+Lab%22+RKLB&hl=en-US' },
    { date: 'Live', src: 'SpaceNews',     title: 'Rocket Lab coverage on SpaceNews',
      url: 'https://spacenews.com/?s=Rocket+Lab' },
    { date: 'May 7, 2026', src: 'SEC 8-K', title: 'Q1 2026 earnings release (primary source)',
      url: 'https://www.sec.gov/Archives/edgar/data/0001819994/000181999426000027/rklb-05072026ex991.htm' },
    { date: 'Live', src: 'Rocket Lab', title: 'Neutron program page (specs + updates)',
      url: 'https://rocketlabcorp.com/launch/neutron/' }
  ],

  // ────────── Risk factors — focused bear thesis ──────────
  risks: [
    { title: 'Valuation priced for perfection',
      body: 'At ~$125 the market cap is roughly $72B — about 120× trailing FY25 sales and ~72× the FY26 model. The stock trades ABOVE the average analyst price target ($100.84). Any Neutron slip, guidance wobble, or multiple compression has a long way to fall; the 52-week range ($23.92–$138.38) shows how violent the repricing can be.' },
    { title: 'Neutron execution & timeline risk',
      body: 'Neutron has slipped multiple times (mid-2025 → late-2026). The dismissed securities suit was literally about Neutron timing. Archimedes engine qualification, first-stage reusability, and Wallops LC-3 readiness all have to land for the Q4 2026 debut. A maiden flight failure or further delay is the single biggest swing factor.' },
    { title: 'Still GAAP unprofitable',
      body: 'Q1\'26 GAAP net loss was $(45.0)M and adjusted EBITDA $(11.8)M. Operating breakeven is a model assumption (~2027), not company guidance. Heavy Neutron capex and M&A integration keep opex elevated near-term.' },
    { title: 'Dilution',
      body: 'A $3.0B ATM program is live, $118.1M of convertible notes converted in Q1\'26 (conversion right triggered again for Q2\'26 as the stock cleared 130% of the conversion price), and CEO Peter Beck has a 10b5-1 plan to sell up to 5M shares (≈10% of his holdings). Share count keeps rising.' },
    { title: 'Government / customer concentration',
      body: 'A large share of backlog is US government (SDA Tranche 2 + Tranche 3 = $1.3B+). Defense procurement timing, continuing-resolution risk, and program down-selects can move the model materially. Golden Dome upside is real but unappropriated.' },
    { title: 'Launch competition & pricing',
      body: 'SpaceX rideshare (Transporter) undercuts dedicated small-launch on price; Neutron enters a medium-lift market where Falcon 9 is entrenched and Blue Origin / ULA are scaling. Electron is the clear small-launch leader but the addressable small-dedicated market is finite.' },
    { title: 'M&A integration',
      body: 'The end-to-end strategy is built on acquisitions (Sinclair, SolAero, Planetary Systems, Geost, Mynaric). Integrating Mynaric (Munich) and Geost while standing up Neutron stretches management and capital across many fronts at once.' },
    { title: 'Macro & supply chain',
      body: 'Specialized propulsion (Archimedes), avionics, and composites supply chains are tight; semiconductor and labor cost inflation pressure margins. A risk-off market hits high-multiple growth names like RKLB hardest.' }
  ],

  // ────────── Revenue × margin bridge (valuation tab) ──────────
  bridge: [
    { y: 'FY25', rev: 602,  gm: 30 },
    { y: 'FY26', rev: 998,  gm: 35 },
    { y: 'FY27', rev: 1610, gm: 40 },
    { y: 'FY28', rev: 2520, gm: 44 }
  ],

  // ────────── Growth engines — TWO panels (Neutron + Space Systems) ──────────
  growthEngines: {
    neutron: {
      name:      'Neutron — Reusable Medium-Lift',
      founded:   'Unveiled March 2021',
      announced: 'Maiden flight targeted Q4 2026 (FAA window Jul–Dec)',
      summary:   'Neutron is Rocket Lab\'s 13-tonne-class, partially reusable medium-lift rocket — the company\'s leap from small launch into the constellation-deployment and national-security launch market. Carbon-composite structure, nine in-house Archimedes engines on a reusable first stage, a captive "Hungry Hippo" fairing, and a propulsively-landed booster.',
      why:       'Neutron is the value-inflection thesis. It moves Rocket Lab from ~$0.6B small-launch + space-systems revenue into the multi-billion-dollar medium-lift market (mega-constellations, DoD/NSSL, cargo). It is also the biggest risk: repeatedly delayed, and the subject of the (now-dismissed) 2025 securities suit. Debut success de-risks the entire growth narrative; another slip or a maiden-flight failure does the opposite.',
      terms: [
        { k: 'Payload to LEO',          v: '~13,000 kg expendable · ~8,000 kg reusable' },
        { k: 'Vehicle',                 v: '~43 m tall, 7 m diameter, carbon composite' },
        { k: 'First stage',             v: '9× Archimedes (reusable, propulsive landing)' },
        { k: 'Second stage',            v: '1× Archimedes Vacuum + captive "Hungry Hippo" fairing' },
        { k: 'Engine',                  v: 'Archimedes — oxygen-rich staged combustion; testing 20h/day, 7 days/week at NASA Stennis' },
        { k: 'Launch site',             v: 'Launch Complex 3, Wallops Island, Virginia' },
        { k: 'Contracted to date',      v: '5 dedicated Neutron launches signed (as of Q1\'26)' },
        { k: 'Target price',            v: '~$50–55M per launch (company commentary)' },
        { k: 'Status',                  v: 'First-flight hardware integrating; Archimedes qual underway' }
      ],
      sources: [
        { label: 'Rocket Lab · Neutron page',                 url: 'https://rocketlabcorp.com/launch/neutron/' },
        { label: 'Spaceflight Now — 5-launch deal / late-2026 debut', url: 'https://spaceflightnow.com/2026/05/07/rocket-lab-announces-five-launch-neutron-deal-as-it-continues-aiming-for-late-2026-debut/' },
        { label: 'Wikipedia — Rocket Lab Neutron',            url: 'https://en.wikipedia.org/wiki/Rocket_Lab_Neutron' }
      ]
    },
    spaceSystems: {
      name:      'Space Systems — The End-to-End Space Company',
      founded:   'Built via M&A 2020–2026',
      announced: 'Mynaric closed Apr 2026 · Geost 2025',
      summary:   'Space Systems is now the larger of Rocket Lab\'s two segments — $402.8M (66.9%) of FY2025 revenue and $136.7M of Q1\'26. It spans satellite buses (Photon), the mass-producible Flatellite, and a vertically-integrated component stack: solar cells, reaction wheels, star trackers, separation systems, radios, flight software, EO/IR sensors, and laser optical comms.',
      why:       'Vertical integration is the moat. By owning launch + bus + components + sensors + comms, Rocket Lab can win prime contracts (SDA Tranche 2 & 3 = $1.3B+) and capture margin competitors must subcontract. The Geost (EO/IR) and Mynaric (laser comms) acquisitions plug directly into proliferated-LEO defense architectures and the company\'s own SDA deliverables.',
      terms: [
        { k: 'Segment revenue (FY25)',  v: '$402.8M — 66.9% of total' },
        { k: 'Segment revenue (Q1\'26)',v: '$136.7M (vs. $63.7M Launch)' },
        { k: 'Photon',                  v: 'In-house satellite bus — flew CAPSTONE (Moon), ESCAPADE (Mars), Varda re-entry' },
        { k: 'Flatellite',              v: 'Flat-packable, mass-producible satellite for constellations (unveiled 2025)' },
        { k: 'Geost (2025, $275M)',     v: 'Electro-optical / infrared payloads — missile tracking' },
        { k: 'Mynaric (2026, $155.3M)', v: 'CONDOR laser optical comms terminals (Munich) — supplies RKLB\'s own SDA work' },
        { k: 'Heritage acquisitions',   v: 'Sinclair (reaction wheels/star trackers), SolAero (solar), Planetary Systems (separation)' },
        { k: 'Prime contracts',         v: 'SDA Tranche 2 Transport-Beta ($515M) + Tranche 3 Tracking ($816M) — 18 sats each' }
      ],
      sources: [
        { label: 'Rocket Lab — Mynaric acquisition close',    url: 'https://rocketlabcorp.com/updates/rocket-lab-completes-mynaric-acquisition-adding-laser-optical-communications-to-growing-space-systems-portfolio/' },
        { label: 'Geost acquisition ($275M)',                 url: 'https://www.govconwire.com/articles/rocket-lab-mynaric-acquisition' },
        { label: 'FY2025 results (segment split)',            url: 'https://www.globenewswire.com/news-release/2026/02/26/3246099/0/en/rocket-lab-announces-fourth-quarter-and-full-year-2025-financial-results-posts-record-quarterly-revenue-of-180m-record-annual-revenue-of-602m-delivering-annual-growth-of-38-and-gro.html' }
      ]
    }
  },

  // ────────── Near-term catalyst window ──────────
  catalystWindow: {
    framing: 'Three near-term events shape the next ~7 months. Neutron\'s debut is the big one — it either de-risks the entire growth thesis or pushes it right. The defense down-selects and the Q2 print are the supporting beats. None of these are guaranteed wins; they cut both ways.',
    upcoming: [
      {
        targetEnd: '2026-08-12',
        anchor:    '~Aug 2026',
        regulator: 'Rocket Lab',
        label:     'Q2 2026 earnings (guided record)',
        takeaway: 'Guided to $225–240M revenue and 33–35% GAAP gross margin. A beat extends the record streak; a miss on margin or a Neutron-timeline walk-back hits a richly-valued stock hard.',
        kind: 'final'
      },
      {
        targetEnd: '2026-12-31',
        anchor:    'Q4 2026',
        regulator: 'Rocket Lab',
        label:     'Neutron maiden flight (Wallops LC-3)',
        takeaway: 'The value-inflection event. Success opens the medium-lift / constellation / NSSL market. Another slip or a maiden-flight anomaly is the single largest downside risk to the thesis.',
        kind: 'final'
      },
      {
        targetEnd: '2026-12-31',
        anchor:    '2026',
        regulator: 'US DoD',
        label:     'Golden Dome / SBI program down-selects',
        takeaway: 'Rocket Lab is positioned via Raytheon SBI work, Geost EO/IR sensors, MACH-TB hypersonic testing, and HASTE. Award flow would add defense backlog above the current model; being passed over prunes the upside.',
        kind: 'preliminary'
      }
    ],
    scenarios: {
      upside: 'Neutron flies successfully in Q4 2026, Q2/Q3 prints keep beating, and Golden Dome / SBI awards flow to Rocket Lab. Medium-lift + proliferated-defense demand re-rates the multiple and the FY27+ model moves up.',
      base:   'Neutron debut lands late-2026 or early-2027 with a partial success, quarterly records continue, and defense awards are mixed. The growth story holds but the rich valuation caps near-term upside.',
      downside: 'Neutron slips again or fails on debut, and/or defense down-selects skew to incumbents. The thesis isn\'t broken (Electron + Space Systems backlog remain), but a high-multiple stock de-rates sharply.'
    },
    sourceNote: 'Timing reflects company statements (Neutron Q4 2026 / FAA Jul–Dec window; Q2 earnings ~Aug cadence) and public DoD program timelines. Days-out count to the END of each stated window — upper bounds, not predictions.'
  },

  // ────────── Demand programs — TWO panels (SDA + Golden Dome/Defense) ──────────
  demandPrograms: {
    sda: {
      title:     'Space Development Agency — Proliferated Warfighter Space Architecture (PWSA)',
      framework: 'The SDA is building a proliferated LEO mesh of Transport (data relay) and Tracking (missile warning) satellites in successive "Tranches." Rocket Lab is a PRIME on two tranches — a rare feat for a company its size against incumbent defense primes.',
      timeline: [
        { date: '2023',          event: 'Rocket Lab named prime for Tranche 2 Transport Layer-Beta ($515M, 18 sats)' },
        { date: 'Dec 2025',      event: 'Awarded Tranche 3 Tracking Layer ($816M, 18 sats) — largest single contract' },
        { date: '2026–27',       event: 'Tranche 2 satellite production & deliveries' },
        { date: '2027+',         event: 'Tranche 3 build; Mynaric CONDOR laser terminals integrated' }
      ],
      takeaway: 'Two prime contracts totaling $1.3B+ anchor the backlog. Rocket Lab supplies not just the buses but increasingly the payloads (Geost EO/IR) and the optical inter-satellite links (Mynaric CONDOR) — vertical integration the incumbents have to subcontract. The $3.5B Tranche 3 Tracking buy was split four ways (Lockheed, L3Harris, Northrop, Rocket Lab — 18 sats each).',
      sources: [
        { label: 'FY2025 release — $816M SDA backlog',  url: 'https://www.globenewswire.com/news-release/2026/02/26/3246099/0/en/rocket-lab-announces-fourth-quarter-and-full-year-2025-financial-results-posts-record-quarterly-revenue-of-180m-record-annual-revenue-of-602m-delivering-annual-growth-of-38-and-gro.html' },
        { label: 'Mynaric — CONDOR terminals for SDA T2-Beta', url: 'https://www.businesswire.com/news/home/20250311635390/en/' },
        { label: 'Space Development Agency',             url: 'https://www.sda.mil/' }
      ]
    },
    goldenDome: {
      title:     'Golden Dome & National Security Space',
      framework: 'The US "Golden Dome" homeland missile-defense initiative and rising national-security space budgets are pulling demand toward proliferated LEO sensors, hypersonic test capacity, and responsive launch — all areas where Rocket Lab now plays end-to-end.',
      timeline: [
        { date: '2025',          event: 'Golden Dome initiative announced; defense space budgets rise' },
        { date: 'Q1 2026',       event: 'Raytheon Space Based Interceptor (SBI) work + MACH-TB 2.0 hypersonic award (record)' },
        { date: '2026–27',       event: 'SBI / missile-tracking program down-selects expected' },
        { date: 'Ongoing',       event: 'HASTE suborbital test cadence for hypersonic programs' }
      ],
      takeaway: 'Rocket Lab touches the missile-defense stack at multiple layers: launch (Electron/HASTE/Neutron), tracking sensors (Geost EO/IR), hypersonic testing (HASTE, MACH-TB 2.0), and interceptor payload work (Raytheon SBI). Golden Dome is a multi-year, multi-hundred-billion-dollar tailwind — but the dollars are not yet fully appropriated, so it is upside optionality, not booked backlog.',
      sources: [
        { label: 'Q1\'26 release — SBI / MACH-TB / DoW', url: 'https://www.sec.gov/Archives/edgar/data/0001819994/000181999426000027/rklb-05072026ex991.htm' },
        { label: 'Rocket Lab — HASTE',                   url: 'https://rocketlabcorp.com/launch/haste/' },
        { label: 'Geost (EO/IR) acquisition',            url: 'https://www.govconwire.com/articles/rocket-lab-mynaric-acquisition' }
      ]
    }
  },

  // ────────── Capital structure (3/31/26) — from Q1'26 10-Q ──────────
  // Total assets $2,819.9M; stockholders' equity $2,264.4M → total liabilities ≈ $555.5M.
  capStructure: {
    asOf: 'March 31, 2026',
    liabilities: [
      { k: 'Convertible Senior Notes (4.25% due 2029)', v: 37.6 },   // reported: $37.6M remaining after $118.1M converted
      { k: 'Contract liabilities (customer deposits / deferred rev)', v: 300.0 },  // estimate*
      { k: 'Lease & other long-term liabilities',        v: 120.0 }, // estimate*
      { k: 'Accounts payable + accrued + other current',  v: 97.9 }  // plug to total*
    ],
    totalLiabPref: 555.5,
    equity: [
      { k: 'Common shares outstanding (5/13/26)', v: '578,867,475' },
      { k: 'Series A Conv. Preferred (3/31/26)',  v: '45,951,250' },
      { k: 'Total stockholders\' equity',          v: '$2,264.4M' },
      { k: 'Cash & equivalents',                   v: '$1,205.5M' },
      { k: 'Total liquidity (incl. securities + ATM)', v: '>$2.0B' },
      { k: 'Total assets',                          v: '$2,819.9M' }
    ],
    note: 'Rocket Lab\'s balance sheet is a strength, not a stress point: >$2.0B total liquidity against just $37.6M of remaining convertible notes (after $118.1M converted in Q1\'26 — the conversion right re-triggered for Q2\'26 as the stock cleared 130% of the conversion price). The liability lines marked with an estimate (*) are split/derived to reconcile to the reported ~$555.5M total liabilities (total assets $2,819.9M − stockholders\' equity $2,264.4M); reconcile to the 10-Q before acting on any single line.<br/><br/><strong style="color:var(--warning)">Dilution to watch:</strong> a $3.0B at-the-market (ATM) equity program is registered and available, and CEO Peter Beck has a Rule 10b5-1 plan to sell up to 5M shares (≈10% of his holdings) through July 8, 2026. Share count is rising — track the 10-Q cover share count and ATM usage.'
  },

  // ────────── Vehicles & platforms ──────────
  products: {
    neutron: {
      name:        'Neutron™',
      tagline:     'Reusable medium-lift launch vehicle',
      launched:    'Maiden flight: Q4 2026 (target)',
      summary:     'Rocket Lab\'s 13-tonne-class, partially-reusable medium-lift rocket. Carbon-composite structure, nine in-house Archimedes engines, a propulsively-landed reusable first stage, and a novel captive "Hungry Hippo" fairing. Built to deploy mega-constellations and serve national-security launch.',
      attributes: [
        { k: 'Payload to LEO',       v: '~13,000 kg (expendable)',      note: '~8,000 kg in reusable configuration' },
        { k: 'Height / diameter',    v: '~43 m / 7 m',                  note: 'Carbon composite, automated fiber placement' },
        { k: 'First stage',          v: '9× Archimedes engines',        note: 'Reusable — propulsive landing (barge / RTLS)' },
        { k: 'Second stage',         v: '1× Archimedes Vacuum',         note: 'Inside the captive "Hungry Hippo" fairing' },
        { k: 'Engine cycle',         v: 'Oxygen-rich staged combustion', note: 'LOX / methane; tested 20h/day at NASA Stennis' },
        { k: 'Launch site',          v: 'Launch Complex 3, Wallops, VA', note: 'Co-located with Electron LC-2' },
        { k: 'Target price',         v: '~$50–55M per launch',          note: 'Company commentary' },
        { k: 'Contracted',           v: '5 dedicated launches (Q1\'26)', note: 'First-flight hardware integrating' }
      ],
      applications: ['Mega-constellation deployment', 'National-security / NSSL launch', 'Interplanetary & cargo', 'Future human-rating optionality'],
      sources: [
        { label: 'Rocket Lab · Neutron page', url: 'https://rocketlabcorp.com/launch/neutron/' },
        { label: 'Wikipedia · Neutron specs', url: 'https://en.wikipedia.org/wiki/Rocket_Lab_Neutron' }
      ]
    },
    electron: {
      name:        'Electron™ (+ HASTE)',
      tagline:     'The leading dedicated small orbital launch vehicle',
      launched:    'Commercial since 2018',
      summary:     'The world\'s most-flown private small orbital rocket and the US\'s #2 most-launched vehicle. Carbon-composite, powered by 3D-printed, electric-pump-fed Rutherford engines. HASTE is the suborbital variant for hypersonic and defense testing. 21 launches in 2025 at 100% mission success.',
      attributes: [
        { k: 'Payload to LEO',       v: '~320 kg (≈200 kg to SSO)',      note: 'Dedicated, schedule-controlled orbit' },
        { k: 'Height / diameter',    v: '18 m / 1.2 m',                  note: 'Carbon composite' },
        { k: 'First stage',          v: '9× Rutherford (electric-pump)', note: '3D-printed; battery-driven turbopumps' },
        { k: 'Upper stage',          v: '1× Vacuum Rutherford + Curie kick stage', note: 'Precise orbital insertion' },
        { k: 'Track record',         v: '70+ launches; 21 in 2025',      note: '100% mission success in 2025' },
        { k: 'Reusability',          v: 'First-stage ocean recovery',    note: 'Engine re-flight program ongoing' },
        { k: 'HASTE variant',        v: 'Suborbital hypersonic testbed', note: 'MACH-TB 2.0, defense test cadence' }
      ],
      sources: [
        { label: 'Rocket Lab · Electron page', url: 'https://rocketlabcorp.com/launch/electron/' },
        { label: 'Rocket Lab · HASTE',         url: 'https://rocketlabcorp.com/launch/haste/' }
      ]
    },
    photon: {
      name:        'Photon™',
      tagline:     'In-house satellite bus / spacecraft platform',
      attributes: [
        { k: 'Heritage',         v: 'Electron Kick Stage + Curie engine', note: 'Flight-proven spacecraft lineage' },
        { k: 'Missions flown',   v: 'CAPSTONE (NASA Moon), ESCAPADE (Mars), Varda re-entry', note: 'LEO → lunar → interplanetary' },
        { k: 'Propulsion',       v: 'HyperCurie in-space engine',         note: 'Storable bipropellant' },
        { k: 'Configurability',  v: 'Modular bus for diverse payloads',   note: 'Vertically integrated components' }
      ],
      sources: [
        { label: 'Rocket Lab · Photon', url: 'https://rocketlabcorp.com/space-systems/satellites-spacecraft/' }
      ]
    },
    flatellite: {
      name:        'Flatellite™ & Space Systems',
      tagline:     'Mass-producible satellite + vertically-integrated components',
      launched:    'Flatellite unveiled 2025',
      summary:     'Flatellite is Rocket Lab\'s flat-packable, mass-producible satellite designed for high-volume constellation builds (and a stepping stone to the company\'s own constellation ambitions). It sits atop a deep, in-house component stack assembled through years of acquisitions — the foundation of the "end-to-end space company" strategy.',
      capabilities: [
        { k: 'Flatellite',            v: 'Flat-packable, stackable, high-volume satellite', note: 'Designed for Neutron-scale deployment' },
        { k: 'Solar power',           v: 'Space-grade solar cells (SolAero)',  note: 'Powers NASA/DoD missions industry-wide' },
        { k: 'Attitude control',      v: 'Reaction wheels + star trackers (Sinclair)', note: 'Flight-heritage components' },
        { k: 'Separation systems',    v: 'Planetary Systems Corp. (Lightband)', note: 'Industry-standard payload separation' },
        { k: 'EO/IR payloads',        v: 'Geost electro-optical / infrared',   note: 'Missile tracking & ISR' },
        { k: 'Laser comms',           v: 'Mynaric CONDOR optical terminals',   note: 'Inter-satellite links for SDA' },
        { k: 'Radios & avionics',     v: 'In-house flight software + radios',   note: 'Reduces external dependencies' }
      ],
      security: [
        'Own the full stack: launch + bus + components + sensors + comms',
        'US-based, defense-trusted supply chain for national-security programs',
        'Margin capture incumbents must subcontract out',
        'Acquisitions integrated: Sinclair, SolAero, Planetary Systems, Geost, Mynaric',
        'Feeds Rocket Lab\'s own SDA prime deliverables (Tranche 2 & 3)'
      ],
      sources: [
        { label: 'Rocket Lab · Space Systems',  url: 'https://rocketlabcorp.com/space-systems/' },
        { label: 'Flatellite unveil coverage',  url: 'https://spacenews.com/?s=Flatellite+Rocket+Lab' }
      ]
    }
  },

  // ────────── Competitive landscape ──────────
  competitive: [
    { tech: 'Small launch (dedicated)', lead: 'Rocket Lab Electron', duration: 'LEO ~320 kg', status: 'Market leader · #2 US orbital', edge: '— (this is RKLB)' },
    { tech: 'Heavy / rideshare',        lead: 'SpaceX Falcon 9 / Transporter', duration: 'LEO 22.8 t', status: 'Dominant; rideshare undercuts price', edge: 'Dedicated orbit + schedule control' },
    { tech: 'Medium-lift (new)',        lead: 'SpaceX · ULA · Blue Origin', duration: 'LEO 8–45 t', status: 'Neutron entering Q4 2026', edge: 'Reusable, lower-cost medium class' },
    { tech: 'Small-launch rivals',      lead: 'Firefly · ABL · Isar · Astra', duration: 'LEO 0.2–1 t', status: 'Mostly pre-revenue / struggling', edge: 'Proven cadence + 100% recent success' },
    { tech: 'Satellite primes',         lead: 'Lockheed · Northrop · L3Harris', duration: 'n/a', status: 'Incumbent defense primes', edge: 'Vertically integrated, faster, cheaper' },
    { tech: 'Smallsat manufacturers',   lead: 'York · Terran Orbital · Maxar', duration: 'n/a', status: 'Consolidating', edge: 'End-to-end: launch + bus + components' },
    { tech: 'Laser comms',              lead: 'CACI · SA Photonics', duration: 'n/a', status: 'RKLB acquired Mynaric', edge: 'In-house CONDOR terminals for SDA' }
  ],

  // ────────── Analyst coverage ──────────
  analystCoverage: {
    asOf: 'Updated May 2026',
    consensus: {
      avgPriceTarget: 100.84,
      highTarget:     127.00,
      lowTarget:       60.00,
      coveringAnalysts: 17,
      priorAvgTarget:  85.00,   // pre-Q1'26 area (targets rose after the beat)
      ratingMix:       'Buy consensus — but stock trades ABOVE the average target'
    },
    recentActions: [
      { date: '2026-05-12', firm: 'Deutsche Bank', analyst: '—', action: 'PT $73 → $120, Buy', note: 'Raised after the Q1\'26 beat' },
      { date: '2026-05',    firm: 'Clear Street',  analyst: '—', action: 'PT $88 → $98, Buy',  note: 'Raised post-earnings' },
      { date: 'Range',      firm: '17 covering',   analyst: '—', action: 'PT range $60–$127',  note: 'Consensus avg $100.84 — below the ~$125 price' }
    ],
    sentiment: {
      retail: 'Bullish — popular space / momentum name',
      institutional: 'Growing index + active ownership; founder Peter Beck remains a major holder',
      shortInterest: 'Moderate (~9–11% of float, latest reported) — verify on Nasdaq'
    },
    sources: [
      { label: 'StockAnalysis — RKLB forecast', url: 'https://stockanalysis.com/stocks/rklb/forecast/' },
      { label: 'MarketBeat — RKLB ratings',      url: 'https://www.marketbeat.com/stocks/NASDAQ/RKLB/forecast/' },
      { label: 'Public.com — RKLB price target', url: 'https://public.com/stocks/rklb/forecast-price-target' },
      { label: 'Nasdaq short interest',          url: 'https://www.nasdaq.com/market-activity/stocks/rklb/short-interest' }
    ]
  },

  // ────────── Legal disclosure (real, verifiable; largely RESOLVED in RKLB's favor) ──────────
  legal: {
    case: {
      name:        'In re Rocket Lab USA, Inc. Securities Litigation',
      number:      'Consolidated · C.D. Cal.',
      court:       'U.S. District Court, Central District of California',
      classPeriod: 'November 12, 2024 – February 25, 2025',
      leadDeadline:'(lead-plaintiff stage passed)',
      status:      'DISMISSED WITH PREJUDICE on April 16, 2026 — plaintiffs had 30 days to appeal to the 9th Circuit',
      allegations: 'Alleged misstatements about the Neutron development timeline / mid-2025 launch likelihood',
      trigger:     'Feb 25, 2025 Bleecker Street Research short report alleging Neutron delays (barge-landing tests pushed to ≥Sep 2025; a potable-water issue unresolved until Jan 2026). An initial motion to dismiss was granted Nov 10, 2025; an amended complaint was again dismissed — with prejudice — on Apr 16, 2026.'
    },
    advertisingFirms: [
      'Robbins Geller', 'The Gross Law Firm', 'Schall Law', 'DJS Law Group'
    ],
    sources: [
      { label: 'Robbins Geller — RKLB case page', url: 'https://www.rgrdlaw.com/cases-rocket-lab-usa-inc-class-action-lawsuit-rklb.html' },
      { label: 'Securities-fraud lawsuit notice (Nasdaq)', url: 'https://www.nasdaq.com/press-release/attention-rocket-lab-usa-rklb-shareholders-securities-fraud-lawsuit-filed-against' },
      { label: 'RKLB FY2025 10-K (Legal Proceedings)', url: 'https://www.sec.gov/Archives/edgar/data/0001819994/000181999426000013/rklb-20251231.htm' }
    ],
    note: 'Allegations are claims, not findings — and here the company prevailed: the court granted Rocket Lab\'s motion to dismiss WITH PREJUDICE on April 16, 2026. Related shareholder derivative actions remain stayed and are expected to be voluntarily dismissed if the securities plaintiffs do not appeal. Surfaced for completeness; it is largely behind the company.'
  },

  // ────────── Policy / macro tailwinds ──────────
  policy: {
    title: 'Golden Dome + record defense-space budgets — structurally bullish for an end-to-end US space company',
    summary: 'US national-security space spending is rising sharply: the SDA\'s proliferated PWSA architecture, the "Golden Dome" homeland missile-defense initiative, hypersonic test demand, and responsive-launch needs all point toward proliferated LEO sensors and domestic launch capacity.',
    takeaway: 'Net positive across the board. Rocket Lab is one of very few companies that can serve the full stack domestically — launch (Electron/HASTE/Neutron), satellites (SDA prime), missile-tracking sensors (Geost EO/IR), hypersonic testing (MACH-TB/HASTE), and interceptor payload work (Raytheon SBI). $1.3B+ of SDA prime backlog is already booked; Golden Dome is large incremental optionality.',
    riskNote: 'The upside is appropriations- and procurement-dependent: continuing resolutions, program down-selects, and ITAR/export controls all gate the timing and magnitude. Golden Dome dollars are not yet fully appropriated — treat as optionality, not booked revenue.',
    sources: [
      { label: 'Space Development Agency', url: 'https://www.sda.mil/' },
      { label: 'Q1\'26 release — defense programs (SBI, MACH-TB)', url: 'https://www.sec.gov/Archives/edgar/data/0001819994/000181999426000027/rklb-05072026ex991.htm' },
      { label: 'Rocket Lab — national security', url: 'https://rocketlabcorp.com/space-systems/' }
    ]
  },

  // ────────── Price-chart event markers ──────────
  priceEvents: [
    { date: '2025-02-26', type: 'earnings',    label: 'FY2024 results',           detail: 'Record revenue; 78% annual growth' },
    { date: '2025-03-02', type: 'insider-sell',label: 'CEO Beck — programmatic sale', detail: 'Sales via trust under a Rule 10b5-1 plan' },
    { date: '2025-05-27', type: 'deal',        label: 'Geost acquisition ($275M)', detail: 'EO/IR missile-tracking sensors — Space Systems' },
    { date: '2025-11-10', type: 'earnings',    label: 'Q3 2025 — record',          detail: '$155M revenue (+48% YoY), record gross margin' },
    { date: '2025-12-19', type: 'deal',        label: 'SDA Tranche 3 ($816M)',     detail: 'Largest single contract — 18 tracking satellites' },
    { date: '2026-02-26', type: 'earnings',    label: 'Q4 & FY2025 — record',      detail: '$602M FY revenue (+38%); backlog $1.85B' },
    { date: '2026-04-14', type: 'deal',        label: 'Mynaric closed ($155.3M)',  detail: 'Laser optical comms (Munich) — end-to-end' },
    { date: '2026-05-07', type: 'earnings',    label: 'Q1 2026 beat + Neutron deal', detail: 'Record $200.3M; $2.2B backlog; 5-launch Neutron order' }
  ],

  // ────────── Bull / Bear scorecard ──────────
  scorecard: {
    bull: [
      { point: 'Q1\'26 revenue $200.3M (+63.5% YoY) — a record, beating the top of guidance. Record 38.2% GAAP gross margin (43% non-GAAP). Adj. EBITDA loss narrowed to $(11.8)M.', src: 'Q1\'26 8-K' },
      { point: 'Backlog hit a record $2.2B (+108% YoY, +20% QoQ). 31 new Electron/HASTE launch contracts signed in Q1 alone — more than all of 2025.', src: 'Q1\'26 release' },
      { point: 'Neutron is real and near: first-flight hardware integrating, Archimedes hot-firing 20h/day at Stennis, 5 dedicated launches contracted, Q4 2026 debut targeted. A successful debut unlocks the medium-lift market.', src: 'Neutron page / Q1\'26 call' },
      { point: 'SDA prime on TWO tranches — Transport-Beta ($515M) + Tracking ($816M), 18 sats each. A rare prime win for a non-incumbent; $1.3B+ of defense backlog.', src: 'SDA awards' },
      { point: 'End-to-end vertical integration: launch + Photon bus + Flatellite + solar + reaction wheels + separation + EO/IR (Geost) + laser comms (Mynaric). Space Systems is 66.9% of FY25 revenue.', src: 'FY25 release / M&A' },
      { point: '21 launches in 2025 at 100% mission success — a new annual record and the clear #2 US orbital launcher behind SpaceX.', src: 'FY25 release' },
      { point: 'Fortress balance sheet: $1.21B cash, >$2.0B total liquidity, only $37.6M convertible notes left. Funded for Neutron + M&A.', src: 'Q1\'26 10-Q' },
      { point: 'Golden Dome / national-security tailwind: Raytheon SBI work, MACH-TB 2.0 (record hypersonic award), HASTE cadence — large incremental optionality.', src: 'Q1\'26 release' },
      { point: 'Analyst consensus is Buy; Deutsche Bank raised PT to $120 after the print.', src: 'Deutsche Bank / consensus' }
    ],
    bear: [
      { point: 'Valuation is extreme: ~$72B market cap is ~120× trailing FY25 sales and the stock trades ABOVE the average analyst target ($100.84). Priced for flawless execution.', src: 'consensus / market data' },
      { point: 'Still GAAP-unprofitable: Q1\'26 net loss $(45.0)M. Operating breakeven (~2027) is a MODEL assumption, not company guidance.', src: 'Q1\'26 8-K' },
      { point: 'Neutron has slipped repeatedly (mid-2025 → late-2026) and was the subject of the (dismissed) 2025 securities suit. A further delay or maiden-flight failure is the biggest single downside risk.', src: 'Spaceflight Now / court docket' },
      { point: 'Dilution: a $3.0B ATM is live, $118.1M of converts converted in Q1 (right re-triggered for Q2), and CEO Beck has a plan to sell up to 5M shares through Jul 8, 2026.', src: '10-Q / Form 4' },
      { point: 'Government/customer concentration: $1.3B+ of backlog is SDA. Continuing-resolution and procurement-timing risk can swing the model.', src: 'backlog disclosures' },
      { point: 'SpaceX rideshare undercuts dedicated small-launch on price, and Neutron enters a medium-lift market where Falcon 9 is entrenched and Blue Origin/ULA are scaling.', src: 'industry' },
      { point: 'Execution sprawl: standing up Neutron while integrating Mynaric (Munich) and Geost stretches management and capital across many fronts at once.', src: 'M&A disclosures' },
      { point: 'High-multiple growth names are the first to de-rate in a risk-off market — the 52-week range ($23.92–$138.38) shows the volatility.', src: 'market data' }
    ]
  },

  // ────────── Sentiment & positioning ──────────
  sentiment: {
    asOf: 'Latest available — verify links for live figures',
    shortInterest: {
      pctOfFloat:    '~9–11% (latest reported)',
      sharesShort:   '~55M (approx)',
      daysToCover:   '~3',
      interpretation: 'Moderate. Not a classic squeeze setup; the float is large and liquid. The bigger positioning story is the rich valuation and the founder/insider 10b5-1 selling, not short pressure.',
      source: 'https://www.nasdaq.com/market-activity/stocks/rklb/short-interest'
    },
    insiders: {
      summary: 'CEO Peter Beck adopted a Rule 10b5-1 plan on Mar 27, 2026 to sell up to 5,000,000 shares (≈10% of his direct + indirect holdings) through Jul 8, 2026, for diversification, estate planning, and philanthropy. He has sold ~8.6M shares since 2021 (~$290.9M). Most sales are programmatic rather than discretionary signals; other officers\' activity is largely RSU vesting. Full detail in §09d.',
      ctaText:  'See §09d Insider Trades — SEC Form 4 →',
      ctaHref:  '#insiders',
      source:   'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001819994&type=4'
    },
    institutional: {
      summary: 'Broad index + active institutional ownership (Vanguard, BlackRock, etc.), with founder Peter Beck remaining a major individual holder. Track 13F / 13D-G filings on EDGAR for changes.',
      sources: [
        { label: 'EDGAR — 13D/13G filings',          url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001819994&type=SC+13' },
        { label: 'MarketBeat — institutional ownership', url: 'https://www.marketbeat.com/stocks/NASDAQ/RKLB/institutional-ownership/' }
      ]
    },
    retail: {
      summary: 'Among the most-followed space / momentum names with retail investors. Sentiment has been strongly bullish through the 2025–2026 run from ~$24 to ~$125.',
      source: 'https://stocktwits.com/symbol/RKLB'
    }
  },

  // ────────── Insider trades — only verifiable items (no fabricated Form 4 line-items) ──────────
  insiderTrades: {
    asOf: 'Selected verifiable transactions · see EDGAR (CIK 1819994, Form 4) for the complete, live list',
    pending: {
      label: 'Active — CEO Peter Beck Rule 10b5-1 plan (adopted Mar 27, 2026)',
      detail: 'Authorizes the sale of up to 5,000,000 shares (≈10% of Beck\'s direct + indirect holdings) through an expiration of July 8, 2026, for diversification, estate planning, and philanthropic purposes. Sales execute automatically under the plan; expect periodic Form 4s as tranches fill.',
      sourceUrl: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001819994&type=4'
    },
    summary: {
      openMarketBuys:    0,
      openMarketSells:   290900000,   // ~$290.9M cumulative Beck sales since 2021 (lifetime, programmatic)
      taxWithholding:    0,
      buyCount: 0,
      sellCount: 1,
      buyersUnique: 0,
      reading: 'Insider activity here is dominated by CEO Peter Beck\'s programmatic (Rule 10b5-1) selling — ~8.6M shares since 2021 for ~$290.9M, including the new plan for up to 5M shares through Jul 8, 2026. These are pre-scheduled, diversification/estate/philanthropy sales, not discretionary "I think it\'s overvalued" signals — though the sheer dollar volume is worth noting at the current rich valuation. There have been essentially no open-market insider BUYS. Other officers\' filings are largely RSU vesting / tax-withholding mechanics. For the full, line-by-line Form 4 history use the EDGAR link below — we deliberately do not reproduce individual transaction rows we cannot verify.'
    },
    codeLegend: [
      { code: 'P', label: 'Open-market purchase', tone: 'buy',  note: 'Discretionary buy — strongest insider signal' },
      { code: 'S', label: 'Open-market sale',     tone: 'sell', note: 'Here, mostly programmatic 10b5-1 sales' },
      { code: 'A', label: 'Grant / award',         tone: 'neutral', note: 'Equity comp — not a market signal' },
      { code: 'M', label: 'Derivative exercise',   tone: 'neutral', note: 'Option/RSU conversion' },
      { code: 'F', label: 'Tax withholding',        tone: 'neutral', note: 'Non-discretionary — shares withheld for taxes' }
    ],
    transactions: [
      { date: '2026-03-02', name: 'Peter Beck', role: 'CEO & Director', code: 'S', ad: 'D', shares: 18857, price: 53.00, value: 1000000, acc: '', note: 'Programmatic sale (~$1.0M) — reported via Form 4; price approximate' }
    ],
    sources: [
      { label: 'SEC EDGAR — all RKLB Form 4 filings (live)', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001819994&type=4&dateb=&owner=include&count=40' },
      { label: 'Beck SC 13D/A — 10b5-1 plan disclosure',      url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001819994&type=SC+13D' }
    ]
  },

  // ────────── Rumors & open debates ──────────
  rumors: {
    bull: [
      {
        claim: 'Neutron will fly successfully in Q4 2026 and re-rate the stock.',
        evidence: 'Company is targeting Q4 2026 (FAA window Jul–Dec) with hardware integrating and Archimedes hot-firing at Stennis. But Neutron has slipped repeatedly, and maiden flights of new rockets frequently fail or partially fail. Plausible direction; not a sure thing. Treat the debut as binary risk, not a foregone win.'
      },
      {
        claim: 'Golden Dome will be a multi-billion-dollar bonanza for Rocket Lab.',
        evidence: 'Rocket Lab is genuinely positioned (SBI work, MACH-TB, Geost sensors, HASTE). But Golden Dome dollars are largely unappropriated and program down-selects are competitive. Real optionality — not booked backlog.'
      },
      {
        claim: 'Rocket Lab is becoming the "next SpaceX."',
        evidence: 'It is the clear #2 US orbital launcher and is uniquely vertically integrated. But SpaceX\'s scale (Falcon 9 cadence, Starship, Starlink cash flow) is an order of magnitude larger. RKLB is a credible end-to-end space company — the comparison flatters more than it informs.'
      }
    ],
    bear: [
      {
        claim: 'A big dilutive raise is imminent via the $3.0B ATM.',
        evidence: 'The ATM is registered and available, and the company has historically used equity to fund growth. With >$2B liquidity already, a near-term mega-raise isn\'t required — but the capacity exists and Neutron/M&A are capital-hungry. Watch ATM usage in the 10-Q.'
      },
      {
        claim: 'Beck selling 5M shares means the founder thinks it\'s overvalued.',
        evidence: 'The sales are pre-scheduled under a Rule 10b5-1 plan for diversification/estate/philanthropy — not a discretionary timing call, and ≈10% of his holdings. Reading it as a "top signal" overstates it; reading the dollar volume as meaningful at this valuation is fair.'
      },
      {
        claim: 'The stock is a bubble that will round-trip to $30.',
        evidence: 'The valuation IS rich (~120× trailing sales; above consensus targets), and the 52-week low was $23.92, so a sharp de-rate is possible on a Neutron miss. But the backlog ($2.2B), defense prime status, and balance sheet are real — a full round-trip would require the growth story to break, not just the multiple to compress.'
      }
    ]
  },

  // ────────── Recent history (context for cold readers) ──────────
  recentHistory: [
    {
      date:  '2026-05-07',
      title: 'Q1 2026 beat — record revenue + 5-launch Neutron deal',
      body:  'Revenue $200.3M (+63.5% YoY), record 38.2% GAAP gross margin (43% non-GAAP), net loss narrowed to $(45.0)M, adj. EBITDA $(11.8)M. Backlog hit a record $2.2B (+108% YoY). 31 new Electron/HASTE contracts signed in the quarter — more than all of 2025 — plus a 5-launch Neutron deal. Q2\'26 guided to another record ($225–240M).',
      url:   'https://investors.rocketlabcorp.com/news-releases/news-release-details/rocket-lab-announces-first-quarter-2026-financial-results'
    },
    {
      date:  '2026-04-16',
      title: 'Securities class action dismissed with prejudice',
      body:  'The U.S. District Court (C.D. Cal.) granted Rocket Lab\'s motion to dismiss the Neutron-timeline securities class action WITH PREJUDICE. Plaintiffs had 30 days to appeal to the 9th Circuit; related derivative actions remain stayed. A clean defense outcome on the highest-profile litigation overhang.',
      url:   'https://www.rgrdlaw.com/cases-rocket-lab-usa-inc-class-action-lawsuit-rklb.html'
    },
    {
      date:  '2026-04-14',
      title: 'Mynaric acquisition closed ($155.3M)',
      body:  'Rocket Lab completed its acquisition of laser optical communications provider Mynaric AG (Munich) for $155.3M — establishing a European foothold and bringing CONDOR optical terminals (already a subcontractor on RKLB\'s SDA Transport-Beta work) fully in-house.',
      url:   'https://rocketlabcorp.com/updates/rocket-lab-completes-mynaric-acquisition-adding-laser-optical-communications-to-growing-space-systems-portfolio/'
    },
    {
      date:  '2026-03-27',
      title: 'CEO Peter Beck adopts Rule 10b5-1 plan',
      body:  'Beck adopted a trading plan to sell up to 5,000,000 shares (≈10% of his direct + indirect holdings) through July 8, 2026, for diversification, estate planning, and philanthropy. Programmatic, pre-scheduled sales — not a discretionary timing call.',
      url:   'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001819994&type=4'
    },
    {
      date:  '2026-02-26',
      title: 'Q4 & FY2025 record results',
      body:  'Record FY2025 revenue of $602M (+38%), record Q4 of $179.7M, backlog +73% YoY to $1.85B. Net loss $(198.2)M for the year. 21 launches in 2025 at 100% mission success — a new annual record.',
      url:   'https://www.globenewswire.com/news-release/2026/02/26/3246099/0/en/rocket-lab-announces-fourth-quarter-and-full-year-2025-financial-results-posts-record-quarterly-revenue-of-180m-record-annual-revenue-of-602m-delivering-annual-growth-of-38-and-gro.html'
    },
    {
      date:  '2025-12-19',
      title: 'SDA Tranche 3 Tracking Layer award ($816M)',
      body:  'Rocket Lab won its largest single contract — $816M to design and build 18 missile-tracking satellites for the SDA\'s Tranche 3 Tracking Layer (part of a $3.5B, 72-satellite buy split with Lockheed, L3Harris, and Northrop). Cements RKLB as a defense prime.',
      url:   'https://ts2.tech/en/rocket-lab-rklb-stock-in-focus-on-dec-20-2025-816m-sda-satellite-win-faster-launch-cadence-and-neutrons-2026-countdown/'
    },
    {
      date:  '2025-05-27',
      title: 'Geost acquisition ($275M)',
      body:  'Rocket Lab agreed to acquire Geost for $275M, adding electro-optical/infrared (EO/IR) payloads — a key gap-filler for space-based missile tracking and ISR, feeding both its SDA work and the broader national-security opportunity.',
      url:   'https://www.govconwire.com/articles/rocket-lab-mynaric-acquisition'
    }
  ]
};
