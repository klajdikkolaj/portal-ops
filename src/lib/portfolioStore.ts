import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { getPortalOpsDataDir } from "../config/env.js";
import type { PortfolioInvoiceRow, StoredTargetSnapshot } from "../types/portfolio.js";

export interface PortfolioArtifactPaths {
  dataDir: string;
  snapshotDir: string;
  exportDir: string;
  csvPath: string;
}

export async function ensurePortfolioArtifactPaths(runId: string): Promise<PortfolioArtifactPaths> {
  const dataDir = getPortalOpsDataDir();
  const snapshotDir = join(dataDir, "snapshots");
  const exportDir = join(dataDir, "exports");
  const csvPath = join(exportDir, `portfolio-summary-${runId}.csv`);

  await Promise.all([mkdir(snapshotDir, { recursive: true }), mkdir(exportDir, { recursive: true })]);

  return {
    dataDir,
    snapshotDir,
    exportDir,
    csvPath,
  };
}

export async function readTargetSnapshot(targetId: string): Promise<StoredTargetSnapshot | null> {
  const filePath = getSnapshotPath(targetId);

  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as StoredTargetSnapshot;
  } catch (error) {
    const isMissing = error instanceof Error && "code" in error && error.code === "ENOENT";

    if (isMissing) {
      return null;
    }

    throw error;
  }
}

export async function writeTargetSnapshot(targetId: string, snapshot: StoredTargetSnapshot): Promise<void> {
  const filePath = getSnapshotPath(targetId);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(snapshot, null, 2), "utf8");
}

export async function writePortfolioCsv(csvPath: string, rows: PortfolioInvoiceRow[]): Promise<void> {
  const columns: Array<keyof PortfolioInvoiceRow> = [
    "target_id",
    "target_label",
    "change_type",
    "invoice_key",
    "status",
    "invoice_number",
    "created_date",
    "due_date",
    "client_name",
    "amount_display",
    "balance_display",
  ];

  const csv = [
    columns.join(","),
    ...rows.map((row) =>
      columns
        .map((column) => `"${String(row[column] ?? "").replaceAll('"', '""')}"`)
        .join(","),
    ),
  ].join("\n");

  await writeFile(csvPath, csv, "utf8");
}

function getSnapshotPath(targetId: string): string {
  return join(getPortalOpsDataDir(), "snapshots", `${targetId}.json`);
}
