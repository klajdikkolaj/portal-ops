import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import { z } from "zod";

import { getEnv } from "../config/env.js";
import { runInvoicePlaneWorkflow } from "../workflows/fetchInvoicePlaneRecentInvoices.js";

const requestSchema = z
  .object({
    mode: z.literal("sync").optional(),
  })
  .strict();

const MAX_BODY_BYTES = 16 * 1024;

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
    console.error(
      `PortalOps local API listening on http://${env.PORTAL_OPS_HOST}:${env.PORTAL_OPS_PORT}/local/workflows/invoiceplane`,
    );
  });
}

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!req.url) {
    writeJson(res, 400, { ok: false, error: { message: "Missing request URL" } });
    return;
  }

  const url = new URL(req.url, "http://127.0.0.1");

  if (req.method === "GET" && url.pathname === "/health") {
    writeJson(res, 200, { ok: true });
    return;
  }

  if (url.pathname !== "/local/workflows/invoiceplane") {
    writeJson(res, 404, { ok: false, error: { message: "Not found" } });
    return;
  }

  if (req.method !== "POST") {
    writeJson(res, 405, { ok: false, error: { message: "Method not allowed" } });
    return;
  }

  const body = await readJsonBody(req);
  const parsed = requestSchema.safeParse(body ?? {});

  if (!parsed.success) {
    writeJson(res, 400, {
      ok: false,
      error: {
        message: parsed.error.issues.map((issue) => issue.message).join("; "),
      },
    });
    return;
  }

  const result = await runInvoicePlaneWorkflow();

  writeJson(res, 200, result);
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

function writeJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
