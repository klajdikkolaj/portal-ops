# PortalOps

PortalOps is an AI ops agent for finance and back-office teams that still have to check ugly business portals manually. The current codebase now runs a daily-style invoice portfolio check: it logs into configured portals, extracts structured invoice data, compares the result with the previous snapshot, and writes a CSV summary artifact.

## Product direction

Today, the repo already proves the AP/ops wedge in a narrow form: authenticated browser automation, structured extraction, local snapshot-based change detection, and a business-facing summary/export path. The next product step is breadth, not reinvention: more targets, stronger downstream integrations, and tighter demo polish.

The accelerator repositioning, next MVP scope, demo script, and application framing live in [`/Users/klajdikolaj/WebstormProjects/portal-ops/docs/accelerator-resubmission-plan.md`](/Users/klajdikolaj/WebstormProjects/portal-ops/docs/accelerator-resubmission-plan.md).

## Quick start

1. Copy `.env.example` to `.env`.
2. Set `TINYFISH_API_KEY`.
3. Run `npm run workflow:portfolio`.

## Available scripts

- `npm run workflow:portfolio`: run the portfolio workflow across configured targets and emit JSON
- `npm run workflow:portfolio:stream`: run the same workflow with live progress on `stderr` and final JSON on `stdout`
- `npm run workflow:efiskalizimi`: run the dedicated eFiskalizimi / e-Albania workflow
- `npm run workflow:efiskalizimi:stream`: run the same workflow with live progress on `stderr`
- `npm run workflow:invoiceplane`: legacy alias for `workflow:portfolio`
- `npm run workflow:invoiceplane:stream`: legacy alias for `workflow:portfolio:stream`
- `npm run serve:local`: start a localhost-only HTTP wrapper at `POST /local/workflows/portfolio`
- `npm run smoke`: run the original TinyFish smoke test against `https://scrapeme.live/shop`
- `npm run smoke:stream`: run the original smoke test with live progress on `stderr`
- `npm run dev`: run the portfolio workflow entrypoint during development
- `npm run typecheck`: validate the TypeScript setup
- `npm test`: alias for `npm run typecheck`

## Target configuration

The `.env.example` file includes one default target using the official public InvoicePlane demo URL and the published guest credentials from [invoiceplane.com/demo](https://www.invoiceplane.com/demo).

It also includes dedicated env wiring for the Albania eFiskalizimi flow:

- `EFISKALIZIMI_PERSONAL_ID_OR_NUIS`
- `EFISKALIZIMI_PASSWORD`
- optional `EFISKALIZIMI_FILTER_DATE_FROM`
- optional `EFISKALIZIMI_FILTER_DATE_TO`
- optional `EFISKALIZIMI_FILTER_COUNTERPARTY_NAME`

For multi-target runs, set `PORTAL_OPS_TARGETS_JSON` to a JSON array of target objects. If that variable is empty, PortalOps falls back to the single default InvoicePlane demo target.

PortalOps writes snapshots and CSV artifacts under `.portal-ops/` by default. Override `PORTAL_OPS_DATA_DIR` if you want those files somewhere else.

## Output contract

The portfolio workflow returns the same final JSON contract from both CLI and HTTP:

```json
{
  "ok": true,
  "runId": "49beda73-48c1-4ede-8ad8-a3ed98430e5a",
  "finishedAt": "2026-03-26T...",
  "result": {
    "portfolio": "portal-ops-ap",
    "target_count": 1,
    "successful_target_count": 1,
    "failed_target_count": 0,
    "total_invoice_count": 5,
    "total_new_invoice_count": 0,
    "total_changed_invoice_count": 0,
    "total_unchanged_invoice_count": 5,
    "summary_text": "Checked 1 targets...",
    "artifacts": {
      "csv_path": "/abs/path/.portal-ops/exports/portfolio-summary-....csv",
      "snapshot_dir": "/abs/path/.portal-ops/snapshots"
    },
    "invoices": [],
    "targets": []
  }
}
```

## Local HTTP wrapper

Start the local server:

```bash
npm run serve:local
```

Open the demo page:

```bash
open http://127.0.0.1:3010/
```

Call the workflow:

```bash
curl -X POST http://127.0.0.1:3010/local/workflows/portfolio \
  -H 'content-type: application/json' \
  -d '{"mode":"sync"}'
```

The same server also serves a tiny demo page at [http://127.0.0.1:3010/](http://127.0.0.1:3010/) with one button that runs the portfolio workflow and renders:

- live timeline events
- target-by-target status
- combined invoice rows with `new` / `changed` / `unchanged` signals
- copy/download helpers for the normalized result

The packaging decision is documented in [`/Users/klajdikolaj/WebstormProjects/portal-ops/docs/packaging-decision.md`](/Users/klajdikolaj/WebstormProjects/portal-ops/docs/packaging-decision.md).

## Repo workflow

- [`agents.md`](/Users/klajdikolaj/WebstormProjects/portal-ops/agents.md) defines product scope, phases, and role intent.
- [`/Users/klajdikolaj/WebstormProjects/portal-ops/.agents/README.md`](/Users/klajdikolaj/WebstormProjects/portal-ops/.agents/README.md) defines the reusable subagent coordination layer.
- [`/Users/klajdikolaj/WebstormProjects/portal-ops/.agents/task-board.md`](/Users/klajdikolaj/WebstormProjects/portal-ops/.agents/task-board.md) tracks the current task queue.
