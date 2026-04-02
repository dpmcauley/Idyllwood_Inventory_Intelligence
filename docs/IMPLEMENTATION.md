# Inventory Intelligence — Implementation Documentation

## Overview

Inventory Intelligence is a stateless Vite + React SPA that analyzes an uploaded inventory CSV and surfaces three views: reorder alerts, overstock risk, and a graded health scorecard. It runs entirely client-side except for one Vercel serverless function that calls Gemini for qualitative output.

**Live:** https://intelligence.idyllwoodlab.com
**Repo:** https://github.com/dpmcauley/Idyllwood_Inventory_Intelligence

---

## Architecture

```
Browser (Vite SPA)
│
├── Demo Mode
│   └── Loads pre-crafted AnalysisResult from data/sampleData.ts
│       (zero API calls, instant)
│
└── Live Mode (CSV Upload)
    ├── Papa Parse → raw CSV rows
    ├── calculations.ts → deterministic InventoryItem[] (pure functions, no API)
    └── POST /api/analyze → Vercel serverless
            └── Gemini 2.5 Flash → ai_rationale, top_actions, grade_summary
```

All numeric results (grades, suggested quantities, carrying costs, months of supply) are computed deterministically client-side. Gemini only generates the plain-English rationale layer — removing it does not change any numbers.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 5.8 |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"` + `@theme {}`) |
| CSV Parsing | Papa Parse |
| AI | Google GenAI SDK — `gemini-2.5-flash` |
| PDF Export | jsPDF |
| Excel Export | SheetJS (xlsx) |
| Tests | Vitest (19 unit tests on calculation engine) |
| Hosting | Vercel (SPA + serverless function) |

---

## File Structure

```
Idyllwood_Inventory_Intelligence/
├── api/
│   └── analyze.ts              # Vercel serverless — rate limit + Gemini call
├── components/
│   ├── Header.tsx              # Compact nav with back link to idyllwoodlab.com
│   ├── Footer.tsx
│   ├── Logo.tsx
│   ├── ModeToggle.tsx          # "Sample Data" / "Upload CSV" pill toggle
│   ├── ViewTabs.tsx            # Reorder / Overstock / Scorecard tab bar
│   ├── DataWarningBanner.tsx   # Missing column warnings
│   ├── ExportButtons.tsx       # PDF and Excel download triggers
│   ├── VendorFilter.tsx        # Shared chip filter
│   ├── reorder/
│   │   ├── ReorderView.tsx
│   │   ├── ReorderSummaryChips.tsx
│   │   └── VendorReorderCard.tsx
│   ├── overstock/
│   │   ├── OverstockView.tsx
│   │   ├── OverstockSummaryChips.tsx
│   │   ├── VendorOverstockCard.tsx
│   │   ├── ShowMathPanel.tsx   # Expandable formula breakdown panel
│   │   └── CarryingRateBar.tsx # Editable annual carrying rate assumption
│   └── scorecard/
│       ├── ScorecardView.tsx
│       ├── HealthScoreCard.tsx # C+ grade with expandable component detail
│       ├── CapitalSummary.tsx
│       ├── CategoryBreakdown.tsx
│       └── TopActions.tsx
├── services/
│   ├── calculations.ts         # Pure functions — all deterministic math
│   ├── csvParser.ts            # Papa Parse wrapper + column validation
│   ├── geminiService.ts        # POST to /api/analyze, merge response into result
│   ├── exportPdf.ts            # jsPDF report generation
│   └── exportExcel.ts          # SheetJS workbook generation
├── data/
│   └── sampleData.ts           # 30-SKU pre-crafted AnalysisResult (C+ grade)
├── types.ts                    # All TypeScript interfaces (source of truth)
├── App.tsx                     # Root: state, mode toggle, view routing
├── src/
│   ├── main.tsx                # Entry point (imports ../App)
│   ├── index.css               # Tailwind v4 globals + brand tokens
│   └── calculations.test.ts    # 19 Vitest unit tests
├── public/
│   ├── favicon.svg
│   └── sample-template.csv     # Downloadable CSV template for users
├── vercel.json
├── vite.config.ts
└── tailwind.config.js
```

---

## CSV Format

### Required Columns

| Column | Type | Description |
|---|---|---|
| `sku` | string | Unique product identifier |
| `product_name` | string | Display name |
| `category` | string | Product category |
| `vendor_name` | string | Supplier name |
| `on_hand` | number | Units currently in stock |
| `unit_cost` | number | Cost per unit (used for carrying cost and PO value) |
| `reorder_point` | number | Minimum stock level before reorder is triggered |

### Optional Columns (improve analysis quality)

| Column | Type | Default | Description |
|---|---|---|---|
| `vendor_id` | string | `V000000` | Vendor identifier for grouping |
| `on_order` | number | `0` | Units on open POs (prevents over-ordering) |
| `committed` | number | `0` | Units allocated to pending orders |
| `avg_monthly_sales` | number | `0` | Units sold per month (enables velocity analysis) |
| `lead_time_days` | number | `14` | Days from PO to receipt |

**Note:** Missing `avg_monthly_sales` triggers a data warning banner. SKUs with zero sales velocity are classified as dead stock if they have on-hand inventory.

Column headers are case-insensitive and whitespace-trimmed on parse.

---

## Calculation Engine (`services/calculations.ts`)

All formulas are pure functions with no side effects.

### Per-SKU Derived Fields

```
available       = max(0, on_hand - committed)
net_need        = max(0, reorder_point - available - on_order)
suggest_qty     = net_need
months_supply   = on_hand / avg_monthly_sales   (null if dead stock)
monthly_carrying_cost = on_hand × unit_cost × (carryingRate / 12)
```

### Reorder Severity Classification

| Severity | Condition |
|---|---|
| `critical` | `available <= 0` and reorder needed |
| `high` | `(available / avg_monthly_sales) × 30 <= 7 days` |
| `monitor` | Reorder needed but not urgent |
| `null` | No reorder needed |

### Overstock Severity Classification

| Severity | Condition |
|---|---|
| `high` | `months_supply > 12` OR dead stock with units on hand |
| `watch` | `months_supply > 4` |
| `null` | `months_supply <= 4` |

### Overstock Action Classification

| Action | Condition |
|---|---|
| `dead_stock` | `avg_monthly_sales === 0` |
| `return_negotiate` | `months_supply > 12` |
| `markdown` | `months_supply > 6` |
| `watch` | `months_supply > 4` |

### Health Score Grading

Three components, each graded A–F, combined into a weighted final grade.

| Component | Weight | Metric | A | B | C | D | F |
|---|---|---|---|---|---|---|---|
| Reorder Health | 35% | % of SKUs critical or high | 0–5% | 6–15% | 16–30% | 31–50% | >50% |
| Overstock Health | 35% | % of capital at risk | 0–5% | 6–15% | 16–25% | 26–40% | >40% |
| Catalog Health | 30% | % of SKUs healthy | >85% | 71–85% | 56–70% | 41–55% | <40% |

**Final grade formula:**

```
score = (reorderScore × 0.35) + (overstockScore × 0.35) + (catalogScore × 0.30)
```

Where A=4, B=3, C=2, D=1, F=0. Score maps to letter+modifier:

| Score | Grade | Score | Grade |
|---|---|---|---|
| ≥ 3.7 | A | ≥ 1.7 | C |
| ≥ 3.3 | A- | ≥ 1.3 | C- |
| ≥ 3.0 | B+ | ≥ 1.0 | D+ |
| ≥ 2.7 | B | ≥ 0.7 | D |
| ≥ 2.3 | B- | < 0.7 | F |
| ≥ 2.0 | C+ | | |

---

## API Endpoint (`api/analyze.ts`)

**`POST /api/analyze`**

Accepts the full `InventoryItem[]` array. Filters to flagged items only before sending to Gemini to minimize token usage.

**Rate limiting:** 10 requests per hour per IP (in-memory, resets on cold start — adequate for demo use).

**Request body:**
```json
{ "items": InventoryItem[] }
```

**Response:**
```json
{
  "items": [{ "sku": "string", "ai_rationale": "string", "overstock_action": "string|null" }],
  "top_actions": [{ "type": "reorder|overstock", "severity": "critical|high", "vendor_name": "string", "vendor_id": "string", "text": "string" }],
  "grade_summary": "string"
}
```

**Required environment variable:** `GEMINI_API_KEY`

The client merges the response back into the existing `AnalysisResult` — it does not replace numeric values, only populates `ai_rationale`, `top_actions`, and `grade_summary`.

---

## Demo Mode vs Live Mode

| | Demo Mode | Live Mode |
|---|---|---|
| Data source | `data/sampleData.ts` (hardcoded) | Uploaded CSV |
| API calls | None | One POST to `/api/analyze` |
| AI content | Pre-written rationale in sample data | Generated by Gemini 2.5 Flash |
| Carrying rate edit | Works (recalculates live) | Works |
| Export | PDF + Excel both work | PDF + Excel both work |

The sample dataset is 30 SKUs across 4 vendors, crafted to produce a **C+** overall grade (Reorder: C, Overstock: C, Catalog: C, score = 2.00).

---

## Carrying Rate

The annual carrying rate (default 25%) is editable on the Overstock Risk tab. Changing it recalculates `monthly_carrying_cost` live across all overstock rows and the summary chip — it does not require re-parsing the CSV or calling the API.

Formula: `monthly_carrying_cost = on_hand × unit_cost × (carryingRate / 12)`

---

## Running Locally

```bash
cd /Volumes/Crucial\ X9/Dev/repos/Idyllwood_Inventory_Intelligence
npm install
npm run dev
```

App runs at `http://localhost:5173`. Demo Mode works without any env vars.

For Live Mode locally, create `.env.local`:
```
GEMINI_API_KEY=your_key_here
```

Run tests:
```bash
npm run test
```

---

## Deployment

Hosted on Vercel. GitHub integration is enabled — pushing to `main` triggers an automatic production deployment.

**Environment variables required in Vercel:**
| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Gemini 2.5 Flash API access for Live Mode |

**Custom domain:** `intelligence.idyllwoodlab.com` — CNAME pointed to `cname.vercel-dns.com` at Namecheap.

**`vercel.json` configuration:**
```json
{
  "functions": { "api/analyze.ts": { "memory": 512, "maxDuration": 30 } },
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]
}
```

The rewrite rule ensures all client-side routes resolve to `index.html` (required for SPAs). The `api/` path is excluded so serverless functions are not caught by the rewrite.

---

## Known Constraints

- **500 row CSV limit** — enforced at parse time. Intended for focused analysis of top SKUs, not full catalog exports.
- **Rate limit resets on cold start** — the in-memory rate limiter is not persistent. Adequate for demo; would need Redis or KV for production hardening.
- **No authentication** — public tool, no user accounts.
- **Dead stock carrying cost** — SKUs with zero sales velocity still accrue carrying cost based on on-hand units and unit cost. This is intentional.
