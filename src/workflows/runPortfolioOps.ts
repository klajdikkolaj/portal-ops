import { randomUUID } from "node:crypto";

import { getPortalTargets, type PortalTargetConfig } from "../config/env.js";
import {
  ensurePortfolioArtifactPaths,
  readTargetSnapshot,
  writePortfolioCsv,
  writeTargetSnapshot,
} from "../lib/portfolioStore.js";
import type { InvoicePlaneInvoice, InvoicePlaneWorkflowResult } from "../types/invoiceplane.js";
import type {
  InvoiceChange,
  PortfolioInvoiceRow,
  PortfolioTargetFailure,
  PortfolioTargetResult,
  PortfolioTargetSuccess,
  PortfolioWorkflowResult,
  StoredTargetSnapshot,
} from "../types/portfolio.js";
import {
  runEfiskalizimiWorkflowForTarget,
  streamEfiskalizimiWorkflowForTarget,
  toEfiskalizimiTargetDescriptor,
} from "./fetchEfiskalizimiInvoices.js";
import {
  runInvoicePlaneWorkflowForTarget,
  streamInvoicePlaneWorkflowForTarget,
  toInvoicePlaneTargetDescriptor,
} from "./fetchInvoicePlaneRecentInvoices.js";

const INVOICE_FIELDS: Array<keyof InvoicePlaneInvoice> = [
  "status",
  "invoice_number",
  "created_date",
  "due_date",
  "client_name",
  "amount_display",
  "balance_display",
];

export interface PortfolioProgressEvent {
  label: string;
  detail?: string;
  targetId?: string;
  timestamp: string;
}

export interface PortfolioStreamHandlers {
  onStarted?: (runId: string) => void;
  onProgress?: (event: PortfolioProgressEvent) => void;
  onComplete?: (result: PortfolioWorkflowResult) => void;
}

export async function runPortfolioWorkflow(): Promise<PortfolioWorkflowResult> {
  return runPortfolioWorkflowForTargets(getPortalTargets());
}

export async function streamPortfolioWorkflow(
  handlers: PortfolioStreamHandlers = {},
): Promise<PortfolioWorkflowResult> {
  return streamPortfolioWorkflowForTargets(getPortalTargets(), handlers);
}

export async function runPortfolioWorkflowForTargets(targets: PortalTargetConfig[]): Promise<PortfolioWorkflowResult> {
  return runPortfolioWorkflowInternal(targets, "sync");
}

export async function streamPortfolioWorkflowForTargets(
  targets: PortalTargetConfig[],
  handlers: PortfolioStreamHandlers = {},
): Promise<PortfolioWorkflowResult> {
  return runPortfolioWorkflowInternal(targets, "stream", handlers);
}

async function runPortfolioWorkflowInternal(
  targets: PortalTargetConfig[],
  mode: "sync" | "stream",
  handlers: PortfolioStreamHandlers = {},
): Promise<PortfolioWorkflowResult> {
  if (targets.length === 0) {
    throw new Error("No invoice portal targets configured");
  }

  const runId = randomUUID();
  const artifactPaths = await ensurePortfolioArtifactPaths(runId);
  const targetResults: PortfolioTargetResult[] = [];
  const rows: PortfolioInvoiceRow[] = [];

  handlers.onStarted?.(runId);
  emitProgress(handlers, "Portfolio run started", `${targets.length} targets configured.`);

  for (const target of targets) {
    emitProgress(handlers, `Checking ${target.label}`, describeTarget(target).source_url, target.id);

    try {
      const workflowResult = await runTargetWorkflow(target, mode, handlers);

      const previousSnapshot = await readTargetSnapshot(target.id);
      const successResult = buildSuccessResult(workflowResult, previousSnapshot);
      targetResults.push(successResult);
      rows.push(...buildPortfolioRows(successResult));

      await writeTargetSnapshot(target.id, {
        capturedAt: successResult.finishedAt ?? new Date().toISOString(),
        target: successResult.target,
        invoices: successResult.invoices,
      });

      emitProgress(
        handlers,
        `${target.label}: ${successResult.invoice_count} invoices`,
        buildTargetSummary(successResult),
        target.id,
      );
    } catch (error) {
      const failureResult = buildFailureResult(target, error);
      targetResults.push(failureResult);
      emitProgress(handlers, `${target.label}: failed`, failureResult.error.message, target.id);
    }
  }

  const successfulTargetResults = targetResults.filter(
    (targetResult): targetResult is PortfolioTargetSuccess => targetResult.ok,
  );

  if (successfulTargetResults.length === 0) {
    const errorMessage = targetResults
      .map((targetResult) =>
        targetResult.ok ? `${targetResult.target.label}: no successful invoice data` : `${targetResult.target.label}: ${targetResult.error.message}`,
      )
      .join("; ");

    throw new Error(`All configured targets failed. ${errorMessage}`);
  }

  const sortedRows = rows.sort((left, right) => {
    if (left.target_label !== right.target_label) {
      return left.target_label.localeCompare(right.target_label);
    }

    return left.invoice_number.localeCompare(right.invoice_number);
  });

  await writePortfolioCsv(artifactPaths.csvPath, sortedRows);

  const finishedAt = new Date().toISOString();
  const result = buildPortfolioResult(runId, finishedAt, targetResults, sortedRows, artifactPaths.csvPath, artifactPaths.snapshotDir);
  emitProgress(handlers, "Portfolio summary ready", result.result.summary_text);
  handlers.onComplete?.(result);

  return result;
}

function emitProgress(
  handlers: PortfolioStreamHandlers,
  label: string,
  detail?: string,
  targetId?: string,
): void {
  const event: PortfolioProgressEvent = {
    label,
    timestamp: new Date().toISOString(),
  };

  if (detail) {
    event.detail = detail;
  }

  if (targetId) {
    event.targetId = targetId;
  }

  handlers.onProgress?.(event);
}

function buildSuccessResult(
  workflowResult: InvoicePlaneWorkflowResult,
  previousSnapshot: StoredTargetSnapshot | null,
): PortfolioTargetSuccess {
  const diff = diffInvoices(previousSnapshot?.invoices ?? [], workflowResult.result.invoices, previousSnapshot === null);

  return {
    ok: true,
    target: workflowResult.result.target,
    runId: workflowResult.runId,
    finishedAt: workflowResult.finishedAt,
    invoice_count: workflowResult.result.invoice_count,
    invoices: workflowResult.result.invoices,
    changes: diff,
  };
}

function buildFailureResult(target: PortalTargetConfig, error: unknown): PortfolioTargetFailure {
  return {
    ok: false,
    target: describeTarget(target),
    error: {
      message: error instanceof Error ? error.message : "Unknown workflow error",
    },
  };
}

function diffInvoices(
  previousInvoices: InvoicePlaneInvoice[],
  currentInvoices: InvoicePlaneInvoice[],
  isFirstRun: boolean,
): PortfolioTargetSuccess["changes"] {
  if (isFirstRun) {
    return {
      baseline: "first_run",
      new_invoice_count: currentInvoices.length,
      changed_invoice_count: 0,
      unchanged_invoice_count: 0,
      new_invoices: currentInvoices,
      changed_invoices: [],
    };
  }

  const previousByKey = new Map(previousInvoices.map((invoice) => [buildInvoiceKey(invoice), invoice]));
  const newInvoices: InvoicePlaneInvoice[] = [];
  const changedInvoices: InvoiceChange[] = [];
  let unchangedInvoiceCount = 0;

  for (const currentInvoice of currentInvoices) {
    const invoiceKey = buildInvoiceKey(currentInvoice);
    const previousInvoice = previousByKey.get(invoiceKey);

    if (!previousInvoice) {
      newInvoices.push(currentInvoice);
      continue;
    }

    const changedFields = INVOICE_FIELDS.filter((field) => previousInvoice[field] !== currentInvoice[field]);

    if (changedFields.length === 0) {
      unchangedInvoiceCount += 1;
      continue;
    }

    changedInvoices.push({
      invoice_key: invoiceKey,
      changed_fields: changedFields,
      previous: previousInvoice,
      current: currentInvoice,
    });
  }

  return {
    baseline: "previous_snapshot",
    new_invoice_count: newInvoices.length,
    changed_invoice_count: changedInvoices.length,
    unchanged_invoice_count: unchangedInvoiceCount,
    new_invoices: newInvoices,
    changed_invoices: changedInvoices,
  };
}

function buildPortfolioRows(targetResult: PortfolioTargetSuccess): PortfolioInvoiceRow[] {
  const newInvoiceKeys = new Set(targetResult.changes.new_invoices.map((invoice) => buildInvoiceKey(invoice)));
  const changedInvoiceKeys = new Set(targetResult.changes.changed_invoices.map((invoice) => invoice.invoice_key));

  return targetResult.invoices.map((invoice) => {
    const invoiceKey = buildInvoiceKey(invoice);

    return {
      ...invoice,
      invoice_key: invoiceKey,
      target_id: targetResult.target.id,
      target_label: targetResult.target.label,
      change_type: newInvoiceKeys.has(invoiceKey)
        ? "new"
        : changedInvoiceKeys.has(invoiceKey)
          ? "changed"
          : "unchanged",
    };
  });
}

function buildTargetSummary(targetResult: PortfolioTargetSuccess): string {
  const baselineText =
    targetResult.changes.baseline === "first_run" ? "first baseline" : "compared with previous snapshot";

  return `${targetResult.changes.new_invoice_count} new, ${targetResult.changes.changed_invoice_count} changed, ${targetResult.changes.unchanged_invoice_count} unchanged (${baselineText}).`;
}

function buildPortfolioResult(
  runId: string,
  finishedAt: string,
  targets: PortfolioTargetResult[],
  invoices: PortfolioInvoiceRow[],
  csvPath: string,
  snapshotDir: string,
): PortfolioWorkflowResult {
  const successfulTargetCount = targets.filter((target) => target.ok).length;
  const failedTargetCount = targets.length - successfulTargetCount;
  const totalInvoiceCount = invoices.length;
  const totalNewInvoiceCount = invoices.filter((invoice) => invoice.change_type === "new").length;
  const totalChangedInvoiceCount = invoices.filter((invoice) => invoice.change_type === "changed").length;
  const totalUnchangedInvoiceCount = invoices.filter((invoice) => invoice.change_type === "unchanged").length;
  const summaryText = [
    `Checked ${targets.length} targets.`,
    `${successfulTargetCount} succeeded, ${failedTargetCount} failed.`,
    `${totalInvoiceCount} invoices total.`,
    `${totalNewInvoiceCount} new, ${totalChangedInvoiceCount} changed, ${totalUnchangedInvoiceCount} unchanged.`,
  ].join(" ");

  return {
    ok: true,
    runId,
    finishedAt,
    result: {
      portfolio: "portal-ops-ap",
      target_count: targets.length,
      successful_target_count: successfulTargetCount,
      failed_target_count: failedTargetCount,
      total_invoice_count: totalInvoiceCount,
      total_new_invoice_count: totalNewInvoiceCount,
      total_changed_invoice_count: totalChangedInvoiceCount,
      total_unchanged_invoice_count: totalUnchangedInvoiceCount,
      summary_text: summaryText,
      artifacts: {
        csv_path: csvPath,
        snapshot_dir: snapshotDir,
      },
      invoices,
      targets,
    },
  };
}

function buildInvoiceKey(invoice: InvoicePlaneInvoice): string {
  return `${invoice.invoice_number}::${invoice.client_name}`.toLowerCase();
}

async function runTargetWorkflow(
  target: PortalTargetConfig,
  mode: "sync" | "stream",
  handlers: PortfolioStreamHandlers,
): Promise<InvoicePlaneWorkflowResult> {
  if (target.portal === "efiskalizimi") {
    if (mode === "stream") {
      return streamEfiskalizimiWorkflowForTarget(target, buildTinyFishStreamHandlers(target, handlers));
    }

    return runEfiskalizimiWorkflowForTarget(target);
  }

  if (mode === "stream") {
    return streamInvoicePlaneWorkflowForTarget(target, buildTinyFishStreamHandlers(target, handlers));
  }

  return runInvoicePlaneWorkflowForTarget(target);
}

function buildTinyFishStreamHandlers(
  target: PortalTargetConfig,
  handlers: PortfolioStreamHandlers,
): {
  onStarted: (runId: string) => void;
  onStreamingUrl: (streamingUrl: string) => void;
  onProgress: (purpose: string) => void;
  onComplete: (status: string) => void;
} {
  return {
    onStarted: (tinyFishRunId) =>
      emitProgress(handlers, `${target.label}: authenticated browser started`, `TinyFish run ${tinyFishRunId}`, target.id),
    onStreamingUrl: (streamingUrl) =>
      emitProgress(handlers, `${target.label}: live browser attached`, streamingUrl, target.id),
    onProgress: (purpose) => emitProgress(handlers, `${target.label}: ${purpose}`, undefined, target.id),
    onComplete: (status) =>
      emitProgress(
        handlers,
        `${target.label}: ${status === "COMPLETED" ? "portal run done" : `portal run ${status}`}`,
        undefined,
        target.id,
      ),
  };
}

function describeTarget(target: PortalTargetConfig) {
  return target.portal === "efiskalizimi" ? toEfiskalizimiTargetDescriptor(target) : toInvoicePlaneTargetDescriptor(target);
}
