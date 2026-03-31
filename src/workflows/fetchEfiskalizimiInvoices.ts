import { BrowserProfile, RunStatus, type RunStatus as RunStatusType } from "@tiny-fish/sdk";

import { getEnv, getPortalTargets, type EfiskalizimiTargetConfig } from "../config/env.js";
import { getTinyFishClient } from "../lib/tinyfish.js";
import {
  invoicePlaneRecentInvoicesPayloadSchema,
  type InvoicePlaneRecentInvoicesResult,
  type InvoicePlaneTargetDescriptor,
  type InvoicePlaneWorkflowResult,
} from "../types/invoiceplane.js";

export interface EfiskalizimiStreamHandlers {
  onStarted?: (runId: string) => void;
  onStreamingUrl?: (streamingUrl: string) => void;
  onProgress?: (purpose: string) => void;
  onComplete?: (status: RunStatusType) => void;
}

export interface EfiskalizimiTargetOverrides {
  personalIdOrNuis?: string;
  password?: string;
  filterDateFrom?: string;
  filterDateTo?: string;
  filterCounterpartyName?: string;
  resultLimit?: number;
}

export async function runEfiskalizimiWorkflow(): Promise<InvoicePlaneWorkflowResult> {
  return runEfiskalizimiWorkflowForTarget(getPrimaryEfiskalizimiTarget());
}

export async function runEfiskalizimiWorkflowForTarget(
  target: EfiskalizimiTargetConfig,
): Promise<InvoicePlaneWorkflowResult> {
  const client = getTinyFishClient();

  const response = await client.agent.run({
    url: target.baseUrl,
    goal: buildEfiskalizimiGoal(target),
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
    result: parseEfiskalizimiInvoicesResult(response.result, target),
  };
}

export async function streamEfiskalizimiWorkflow(
  handlers: EfiskalizimiStreamHandlers = {},
): Promise<InvoicePlaneWorkflowResult> {
  return streamEfiskalizimiWorkflowForTarget(getPrimaryEfiskalizimiTarget(), handlers);
}

export async function streamEfiskalizimiWorkflowForTarget(
  target: EfiskalizimiTargetConfig,
  handlers: EfiskalizimiStreamHandlers = {},
): Promise<InvoicePlaneWorkflowResult> {
  const client = getTinyFishClient();
  const stream = await client.agent.stream(
    {
      url: target.baseUrl,
      goal: buildEfiskalizimiGoal(target),
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
    result: parseEfiskalizimiInvoicesResult(run.result, target),
  };
}

export function toEfiskalizimiTargetDescriptor(target: EfiskalizimiTargetConfig): InvoicePlaneTargetDescriptor {
  return {
    id: target.id,
    label: target.label,
    portal: target.portal,
    source_url: target.baseUrl,
  };
}

export function resolveEfiskalizimiTarget(overrides: EfiskalizimiTargetOverrides = {}): EfiskalizimiTargetConfig {
  const target = getPortalTargets().find(
    (candidate): candidate is EfiskalizimiTargetConfig => candidate.portal === "efiskalizimi",
  );
  const env = getEnv();

  const baseTarget =
    target ??
    (() => {
      const personalIdOrNuis = overrides.personalIdOrNuis ?? env.EFISKALIZIMI_PERSONAL_ID_OR_NUIS;
      const password = overrides.password ?? env.EFISKALIZIMI_PASSWORD;

      if (!personalIdOrNuis || !password) {
        throw new Error("No eFiskalizimi target configured and no credentials were provided");
      }

      return {
        id: "efiskalizimi-self-care",
        label: "eFiskalizimi Self Care",
        portal: "efiskalizimi" as const,
        baseUrl: env.EFISKALIZIMI_BASE_URL,
        personalIdOrNuis,
        password,
        bookLabel: env.EFISKALIZIMI_BOOK_LABEL,
        resultLimit: env.EFISKALIZIMI_RESULT_LIMIT,
        ...(env.EFISKALIZIMI_FILTER_DATE_FROM ? { filterDateFrom: env.EFISKALIZIMI_FILTER_DATE_FROM } : {}),
        ...(env.EFISKALIZIMI_FILTER_DATE_TO ? { filterDateTo: env.EFISKALIZIMI_FILTER_DATE_TO } : {}),
        ...(env.EFISKALIZIMI_FILTER_COUNTERPARTY_NAME
          ? { filterCounterpartyName: env.EFISKALIZIMI_FILTER_COUNTERPARTY_NAME }
          : {}),
      };
    })();

  const resolvedTarget: EfiskalizimiTargetConfig = {
    ...baseTarget,
    personalIdOrNuis: overrides.personalIdOrNuis ?? baseTarget.personalIdOrNuis,
    password: overrides.password ?? baseTarget.password,
    ...(overrides.resultLimit ? { resultLimit: overrides.resultLimit } : {}),
  };

  if (overrides.filterDateFrom !== undefined) {
    if (overrides.filterDateFrom) {
      resolvedTarget.filterDateFrom = overrides.filterDateFrom;
    } else {
      delete resolvedTarget.filterDateFrom;
    }
  }

  if (overrides.filterDateTo !== undefined) {
    if (overrides.filterDateTo) {
      resolvedTarget.filterDateTo = overrides.filterDateTo;
    } else {
      delete resolvedTarget.filterDateTo;
    }
  }

  if (overrides.filterCounterpartyName !== undefined) {
    if (overrides.filterCounterpartyName) {
      resolvedTarget.filterCounterpartyName = overrides.filterCounterpartyName;
    } else {
      delete resolvedTarget.filterCounterpartyName;
    }
  }

  return resolvedTarget;
}

function getPrimaryEfiskalizimiTarget(): EfiskalizimiTargetConfig {
  return resolveEfiskalizimiTarget();
}

function buildEfiskalizimiGoal(target: EfiskalizimiTargetConfig): string {
  const filterSteps: string[] = [];

  if (target.filterDateFrom) {
    filterSteps.push(`Set the start date filter to ${target.filterDateFrom}.`);
  }

  if (target.filterDateTo) {
    filterSteps.push(`Set the end date filter to ${target.filterDateTo}.`);
  }

  if (target.filterCounterpartyName) {
    filterSteps.push(`If a counterparty or name filter is visible, fill it with ${target.filterCounterpartyName}.`);
  }

  const filterInstruction =
    filterSteps.length > 0
      ? `${filterSteps.join(" ")} Run the filter or search action and wait for the results table to refresh.`
      : "If the table already shows rows, do not change the filters. Only if the table is empty, open the filter panel, set the start date to 01.01.2024, apply the filter, and wait for rows to appear.";

  return [
    "Open the eFiskalizimi self care portal.",
    'If the checkbox "Unë lexoj dhe pajtohem me të Termat dhe Kushtet" is visible, check it first.',
    'Click "Identifikim nëpërmjet E-Albania".',
    'On the Government Gateway login page, fill the "Numri personal/NUIS" field with',
    target.personalIdOrNuis + ".",
    'Fill the "Vendosni fjalëkalimin" field with',
    target.password + ".",
    'Click the "Hyr" button.',
    "If a consent page appears after login, accept or continue so the flow returns to eFiskalizimi self care.",
    `After login, open "${target.bookLabel}".`,
    filterInstruction,
    `Extract the first ${target.resultLimit} visible result rows from the table.`,
    "Use only data visible in the current table view. Do not open invoice details, do not customize columns, and do not open extra dialogs.",
    'Return clean JSON only with this exact schema: {"invoices":[{"status":"","invoice_number":"","created_date":"","due_date":"","client_name":"","amount_display":"","balance_display":""}]}',
    "If due date or balance are not shown, return empty strings for those fields.",
    "Map seller, buyer, taxpayer, or counterparty text visible in the row into client_name. If no name is visible but a NUIS/tax id is visible, use that instead.",
    "Do not include markdown, commentary, or extra keys.",
  ].join(" ");
}

function parseEfiskalizimiInvoicesResult(
  result: unknown,
  target: EfiskalizimiTargetConfig,
): InvoicePlaneRecentInvoicesResult {
  const parsed = invoicePlaneRecentInvoicesPayloadSchema.parse(result);

  return {
    target: toEfiskalizimiTargetDescriptor(target),
    source_url: target.baseUrl,
    invoice_count: parsed.invoices.length,
    invoices: parsed.invoices,
  };
}
