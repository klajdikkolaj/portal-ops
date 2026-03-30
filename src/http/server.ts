import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import { z } from "zod";

import { getEnv } from "../config/env.js";
import { type EfiskalizimiTargetOverrides, resolveEfiskalizimiTarget } from "../workflows/fetchEfiskalizimiInvoices.js";
import {
  streamPortfolioWorkflow,
  runPortfolioWorkflow,
  runPortfolioWorkflowForTargets,
  streamPortfolioWorkflowForTargets,
} from "../workflows/runPortfolioOps.js";
import { renderDemoPage } from "./demoPage.js";

const portfolioRequestSchema = z
  .object({
    mode: z.literal("sync").optional(),
  })
  .strict();

const dateFilterSchema = z.string().trim().regex(/^\d{2}\.\d{2}\.\d{4}$/, "Expected date format DD.MM.YYYY");

const efiskalizimiRequestSchema = z
  .object({
    mode: z.literal("sync").optional(),
    filterDateFrom: dateFilterSchema.optional(),
    filterDateTo: dateFilterSchema.optional(),
    filterCounterpartyName: z.string().trim().min(1).optional(),
    resultLimit: z.coerce.number().int().min(1).max(20).optional(),
  })
  .strict();

const MAX_BODY_BYTES = 16 * 1024;
const PORTFOLIO_ROUTE = "/local/workflows/portfolio";
const PORTFOLIO_STREAM_ROUTE = "/local/workflows/portfolio/stream";
const EFISKALIZIMI_ROUTE = "/local/workflows/efiskalizimi";
const EFISKALIZIMI_STREAM_ROUTE = "/local/workflows/efiskalizimi/stream";
const LEGACY_SYNC_ROUTE = "/local/workflows/invoiceplane";
const LEGACY_STREAM_ROUTE = "/local/workflows/invoiceplane/stream";

async function main() {
  const env = getEnv();

  const server = createServer(async (req, res) => {
    try {
      await handleRequest(req, res);
    } catch (error) {
      writeJson(res, 500, {
        ok: false,
        error: {
          message: error instanceof Error ? error.message : "Unknown server error",
        },
      });
    }
  });

  server.requestTimeout = 10_000;
  server.headersTimeout = 10_000;
  server.keepAliveTimeout = 5_000;

  server.listen(env.PORTAL_OPS_PORT, env.PORTAL_OPS_HOST, () => {
    console.error(`PortalOps local API listening on http://${env.PORTAL_OPS_HOST}:${env.PORTAL_OPS_PORT}${PORTFOLIO_ROUTE}`);
  });
}

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!req.url) {
    writeJson(res, 400, { ok: false, error: { message: "Missing request URL" } });
    return;
  }

  const url = new URL(req.url, "http://127.0.0.1");

  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/demo")) {
    writeHtml(res, 200, renderDemoPage());
    return;
  }

  if (req.method === "GET" && url.pathname === "/health") {
    writeJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && isPortfolioStreamPath(url.pathname)) {
    await handlePortfolioStream(res);
    return;
  }

  if (req.method === "GET" && url.pathname === EFISKALIZIMI_STREAM_ROUTE) {
    const overrides = parseEfiskalizimiOverridesFromQuery(url);
    await handleEfiskalizimiStream(res, overrides);
    return;
  }

  if (!isSyncPath(url.pathname)) {
    writeJson(res, 404, { ok: false, error: { message: "Not found" } });
    return;
  }

  if (req.method === "GET") {
    const routeLabel = url.pathname === EFISKALIZIMI_ROUTE ? EFISKALIZIMI_ROUTE : PORTFOLIO_ROUTE;
    writeJson(res, 200, {
      ok: false,
      error: {
        message: `This route expects POST. Open http://127.0.0.1:3010/ for the demo page or send a POST request with {"mode":"sync"} to ${routeLabel}.`,
      },
    });
    return;
  }

  if (req.method !== "POST") {
    writeJson(res, 405, { ok: false, error: { message: "Method not allowed" } });
    return;
  }

  const body = await readJsonBody(req);
  const schema = url.pathname === EFISKALIZIMI_ROUTE ? efiskalizimiRequestSchema : portfolioRequestSchema;
  const parsed = schema.safeParse(body ?? {});

  if (!parsed.success) {
    writeJson(res, 400, {
      ok: false,
      error: {
        message: parsed.error.issues.map((issue) => issue.message).join("; "),
      },
    });
    return;
  }

  const result =
    url.pathname === EFISKALIZIMI_ROUTE
      ? await runPortfolioWorkflowForTargets([resolveEfiskalizimiTarget(toEfiskalizimiOverrides(parsed.data))])
      : await runPortfolioWorkflow();
  writeJson(res, 200, result);
}

async function handlePortfolioStream(res: ServerResponse): Promise<void> {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  try {
    const result = await streamPortfolioWorkflow({
      onStarted: (runId) =>
        writeSse(res, "timeline", {
          label: "Portfolio run started",
          detail: `Run ${runId}`,
          timestamp: new Date().toISOString(),
        }),
      onProgress: (event) => writeSse(res, "timeline", event),
    });

    writeSse(res, "result", result);
  } catch (error) {
    writeSse(res, "workflow-error", {
      message: error instanceof Error ? error.message : "Unknown workflow error",
    });
  } finally {
    res.end();
  }
}

async function handleEfiskalizimiStream(
  res: ServerResponse,
  overrides: EfiskalizimiTargetOverrides,
): Promise<void> {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  try {
    const result = await streamPortfolioWorkflowForTargets([resolveEfiskalizimiTarget(overrides)], {
      onStarted: (runId) =>
        writeSse(res, "timeline", {
          label: "eFiskalizimi run started",
          detail: `Run ${runId}`,
          timestamp: new Date().toISOString(),
        }),
      onProgress: (event) => writeSse(res, "timeline", event),
    });

    writeSse(res, "result", result);
  } catch (error) {
    writeSse(res, "workflow-error", {
      message: error instanceof Error ? error.message : "Unknown workflow error",
    });
  } finally {
    res.end();
  }
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;

    if (totalBytes > MAX_BODY_BYTES) {
      throw new Error("Request body exceeded the 16 KB limit");
    }

    chunks.push(buffer);
  }

  if (chunks.length === 0) {
    return undefined;
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function isSyncPath(pathname: string): boolean {
  return pathname === PORTFOLIO_ROUTE || pathname === LEGACY_SYNC_ROUTE || pathname === EFISKALIZIMI_ROUTE;
}

function isPortfolioStreamPath(pathname: string): boolean {
  return pathname === PORTFOLIO_STREAM_ROUTE || pathname === LEGACY_STREAM_ROUTE;
}

function parseEfiskalizimiOverridesFromQuery(url: URL): EfiskalizimiTargetOverrides {
  const raw: Record<string, string> = {};

  const filterDateFrom = url.searchParams.get("filterDateFrom");
  const filterDateTo = url.searchParams.get("filterDateTo");
  const filterCounterpartyName = url.searchParams.get("filterCounterpartyName");
  const resultLimit = url.searchParams.get("resultLimit");

  if (filterDateFrom) {
    raw.filterDateFrom = filterDateFrom;
  }

  if (filterDateTo) {
    raw.filterDateTo = filterDateTo;
  }

  if (filterCounterpartyName) {
    raw.filterCounterpartyName = filterCounterpartyName;
  }

  if (resultLimit) {
    raw.resultLimit = resultLimit;
  }

  const parsed = efiskalizimiRequestSchema.safeParse(raw);

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join("; ");
    throw new Error(message);
  }

  return toEfiskalizimiOverrides(parsed.data);
}

function toEfiskalizimiOverrides(
  input: z.infer<typeof efiskalizimiRequestSchema>,
): EfiskalizimiTargetOverrides {
  const overrides: EfiskalizimiTargetOverrides = {};

  if (input.filterDateFrom) {
    overrides.filterDateFrom = input.filterDateFrom;
  }

  if (input.filterDateTo) {
    overrides.filterDateTo = input.filterDateTo;
  }

  if (input.filterCounterpartyName) {
    overrides.filterCounterpartyName = input.filterCounterpartyName;
  }

  if (input.resultLimit) {
    overrides.resultLimit = input.resultLimit;
  }

  return overrides;
}

function writeJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload, null, 2));
}

function writeHtml(res: ServerResponse, statusCode: number, html: string): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(html);
}

function writeSse(res: ServerResponse, eventName: string, payload: unknown): void {
  res.write(`event: ${eventName}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
