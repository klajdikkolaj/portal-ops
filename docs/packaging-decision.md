# Packaging Decision

## Decision

Keep the CLI as the canonical workflow transport and add a tiny localhost-only HTTP sync wrapper over the same shared workflow core.

## Why

- The CLI path is already verified in sync and streaming modes.
- A local HTTP wrapper makes the demo feel productized without duplicating workflow logic.
- Streaming stays CLI-first for now, because it is already working and does not need HTTP lifecycle complexity yet.
- The local HTTP server remains private by binding to `127.0.0.1` and keeping request handling intentionally small.

## Implementation rule

One workflow implementation, multiple entrypoints:

- workflow core: `src/workflows/fetchInvoicePlaneRecentInvoices.ts`
- CLI adapters: `src/index.ts`, `src/stream.ts`
- HTTP adapter: `src/http/server.ts`

## Research notes

- TinyFish currently supports synchronous, asynchronous, and streaming execution modes in its official docs, which fits a shared-core adapter model well:
  - https://docs.tinyfish.ai/
  - https://docs.tinyfish.ai/api-reference/automation/start-automation-asynchronously
  - https://docs.tinyfish.ai/integrations/dify
- Node's built-in HTTP server is enough for the local wrapper if it stays localhost-only and keeps request handling tight:
  - https://nodejs.org/download/release/v20.18.1/docs/api/http.html
  - https://nodejs.org/en/learn/getting-started/security-best-practices

## Not doing yet

- no remote deployment
- no database or persistence
- no public API surface
- no HTTP streaming endpoint
- no frontend dashboard

## Small UI follow-up

After the shared-core CLI plus HTTP wrapper was verified, the repo added one tiny demo page served from the same localhost-only server. This is intentionally not a frontend app. It is a single page that:

- calls `POST /local/workflows/invoiceplane`
- shows loading, success, and error states
- renders the normalized workflow output

It now also uses a thin local streaming route for timeline rendering while keeping the canonical workflow logic in the same core:

- timeline events come from `GET /local/workflows/invoiceplane/stream`
- final workflow execution still resolves to the same normalized result contract

The page exists to prove the local HTTP wrapper is consumable by a human-facing surface without introducing a separate frontend architecture.
