import { BrowserProfile, RunStatus, type RunStatus as RunStatusType } from "@tiny-fish/sdk";

import { getPortalTargets, type InvoicePlaneTargetConfig } from "../config/env.js";
import { getTinyFishClient } from "../lib/tinyfish.js";
import {
  invoicePlaneRecentInvoicesPayloadSchema,
  type InvoicePlaneRecentInvoicesResult,
  type InvoicePlaneTargetDescriptor,
  type InvoicePlaneWorkflowResult,
} from "../types/invoiceplane.js";

export interface InvoicePlaneStreamHandlers {
  onStarted?: (runId: string) => void;
  onStreamingUrl?: (streamingUrl: string) => void;
  onProgress?: (purpose: string) => void;
  onComplete?: (status: RunStatusType) => void;
}

export async function runInvoicePlaneWorkflow(): Promise<InvoicePlaneWorkflowResult> {
  return runInvoicePlaneWorkflowForTarget(getPrimaryTarget());
}

export async function runInvoicePlaneWorkflowForTarget(
  target: InvoicePlaneTargetConfig,
): Promise<InvoicePlaneWorkflowResult> {
  const client = getTinyFishClient();

  const response = await client.agent.run({
    url: buildInvoicePlaneLoginUrl(target.baseUrl),
    goal: buildInvoicePlaneGoal(target),
    browser_profile: BrowserProfile.STEALTH,
  });

  if (response.status !== RunStatus.COMPLETED) {
    throw new Error(response.error?.message ?? `TinyFish run ended with status ${response.status}`);
  }

  if (!response.run_id) {
    throw new Error("TinyFish completed without returning a run_id");
  }

  return {
    ok: true,
    runId: response.run_id,
    finishedAt: response.finished_at,
    result: parseInvoicePlaneRecentInvoicesResult(response.result, target),
  };
}

export async function streamInvoicePlaneWorkflow(
  handlers: InvoicePlaneStreamHandlers = {},
): Promise<InvoicePlaneWorkflowResult> {
  return streamInvoicePlaneWorkflowForTarget(getPrimaryTarget(), handlers);
}

export async function streamInvoicePlaneWorkflowForTarget(
  target: InvoicePlaneTargetConfig,
  handlers: InvoicePlaneStreamHandlers = {},
): Promise<InvoicePlaneWorkflowResult> {
  const client = getTinyFishClient();
  const stream = await client.agent.stream(
    {
      url: buildInvoicePlaneLoginUrl(target.baseUrl),
      goal: buildInvoicePlaneGoal(target),
      browser_profile: BrowserProfile.STEALTH,
    },
    {
      onStarted: (event) => handlers.onStarted?.(event.run_id),
      onStreamingUrl: (event) => handlers.onStreamingUrl?.(event.streaming_url),
      onProgress: (event) => handlers.onProgress?.(event.purpose),
      onComplete: (event) => handlers.onComplete?.(event.status),
    },
  );

  let finalRunId: string | undefined;
  let finalStatus: RunStatusType | undefined;
  let finalErrorMessage: string | undefined;

  for await (const event of stream) {
    if (event.type === "COMPLETE") {
      finalRunId = event.run_id;
      finalStatus = event.status;
      finalErrorMessage = event.error?.message;
    }
  }

  if (!finalRunId || !finalStatus) {
    throw new Error("TinyFish stream ended without a COMPLETE event");
  }

  if (finalStatus !== RunStatus.COMPLETED) {
    throw new Error(finalErrorMessage ?? `TinyFish stream ended with status ${finalStatus}`);
  }

  const run = await client.runs.get(finalRunId);

  return {
    ok: true,
    runId: run.run_id,
    finishedAt: run.finished_at,
    result: parseInvoicePlaneRecentInvoicesResult(run.result, target),
  };
}

export function toInvoicePlaneTargetDescriptor(target: InvoicePlaneTargetConfig): InvoicePlaneTargetDescriptor {
  return {
    id: target.id,
    label: target.label,
    portal: target.portal,
    source_url: buildInvoicePlaneInvoicesUrl(target),
  };
}

function getPrimaryTarget(): InvoicePlaneTargetConfig {
  const target = getPortalTargets()[0];

  if (!target || target.portal !== "invoiceplane") {
    throw new Error("No invoice portal targets configured");
  }

  return target;
}

function buildInvoicePlaneGoal(target: InvoicePlaneTargetConfig): string {
  return [
    `Log into the ${target.label} portal.`,
    `Use username ${target.username} and password ${target.password}.`,
    `After login, navigate to ${buildInvoicePlaneInvoicesUrl(target)}.`,
    "Wait for the main invoices table to load.",
    `Extract the first ${target.resultLimit} visible invoice rows from that invoices table.`,
    'Return clean JSON only with this exact schema: {"invoices":[{"status":"","invoice_number":"","created_date":"","due_date":"","client_name":"","amount_display":"","balance_display":""}]}',
    "Do not include markdown, commentary, or extra keys.",
  ].join(" ");
}

function buildInvoicePlaneLoginUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/sessions/login`;
}

function buildInvoicePlaneInvoicesUrl(target: InvoicePlaneTargetConfig): string {
  return `${target.baseUrl.replace(/\/+$/, "")}${normalizePath(target.invoicesPath)}`;
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function parseInvoicePlaneRecentInvoicesResult(
  result: unknown,
  target: InvoicePlaneTargetConfig,
): InvoicePlaneRecentInvoicesResult {
  const parsed = invoicePlaneRecentInvoicesPayloadSchema.parse(result);

  return {
    target: toInvoicePlaneTargetDescriptor(target),
    source_url: buildInvoicePlaneInvoicesUrl(target),
    invoice_count: parsed.invoices.length,
    invoices: parsed.invoices,
  };
}
