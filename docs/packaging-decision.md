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
