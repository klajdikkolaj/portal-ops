# PortalOps

PortalOps is a narrow TinyFish-powered MVP for the TinyFish Accelerator. The current baseline now targets one real authenticated portal workflow against InvoicePlane's official public demo, while keeping the original public-site smoke test available for API checks.

## Quick start

1. Copy `.env.example` to `.env`.
2. Set `TINYFISH_API_KEY`.
3. Run `npm run workflow:invoiceplane`.

## Available scripts

- `npm run workflow:invoiceplane`: log into the InvoicePlane demo and extract recent invoices
- `npm run workflow:invoiceplane:stream`: run the same workflow with live progress on `stderr` and final JSON on `stdout`
- `npm run serve:local`: start a localhost-only HTTP wrapper at `POST /local/workflows/invoiceplane`
- `npm run smoke`: run the original TinyFish smoke test against `https://scrapeme.live/shop`
- `npm run smoke:stream`: run the original smoke test with live progress on `stderr`
- `npm run dev`: run the authenticated InvoicePlane workflow entrypoint during development
- `npm run typecheck`: validate the TypeScript setup
- `npm test`: alias for `npm run typecheck`

## Demo defaults

The `.env.example` file includes the official public InvoicePlane demo URL and the published guest credentials from [invoiceplane.com/demo](https://www.invoiceplane.com/demo). Override those variables when you switch from the public demo to a real customer portal.

## Output contract

The authenticated workflow now returns the same final JSON contract from both CLI and HTTP:

```json
{
  "ok": true,
  "runId": "1639586b-0347-451f-9761-e1182847fd0b",
  "finishedAt": "2026-03-26T...",
  "result": {
    "portal": "invoiceplane-demo",
    "source_url": "https://demo.invoiceplane.com/invoices/index",
    "invoice_count": 5,
    "invoices": []
  }
}
```

## Local HTTP wrapper

Start the local server:

```bash
npm run serve:local
```

Call the workflow:

```bash
curl -X POST http://127.0.0.1:3010/local/workflows/invoiceplane \
  -H 'content-type: application/json' \
  -d '{"mode":"sync"}'
```

The packaging decision is documented in [`/Users/klajdikolaj/WebstormProjects/portal-ops/docs/packaging-decision.md`](/Users/klajdikolaj/WebstormProjects/portal-ops/docs/packaging-decision.md).

## Repo workflow

- [`agents.md`](/Users/klajdikolaj/WebstormProjects/portal-ops/agents.md) defines product scope, phases, and role intent.
- [`/Users/klajdikolaj/WebstormProjects/portal-ops/.agents/README.md`](/Users/klajdikolaj/WebstormProjects/portal-ops/.agents/README.md) defines the reusable subagent coordination layer.
- [`/Users/klajdikolaj/WebstormProjects/portal-ops/.agents/task-board.md`](/Users/klajdikolaj/WebstormProjects/portal-ops/.agents/task-board.md) tracks the current task queue.
