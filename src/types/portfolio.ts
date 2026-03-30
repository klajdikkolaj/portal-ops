import type { InvoicePlaneInvoice, InvoicePlaneTargetDescriptor } from "./invoiceplane.js";

export interface InvoiceChange {
  invoice_key: string;
  changed_fields: Array<keyof InvoicePlaneInvoice>;
  previous: InvoicePlaneInvoice;
  current: InvoicePlaneInvoice;
}

export interface PortfolioInvoiceRow extends InvoicePlaneInvoice {
  invoice_key: string;
  target_id: string;
  target_label: string;
  change_type: "new" | "changed" | "unchanged";
}

export interface PortfolioTargetSuccess {
  ok: true;
  target: InvoicePlaneTargetDescriptor;
  runId: string;
  finishedAt: string | null;
  invoice_count: number;
  invoices: InvoicePlaneInvoice[];
  changes: {
    baseline: "first_run" | "previous_snapshot";
    new_invoice_count: number;
    changed_invoice_count: number;
    unchanged_invoice_count: number;
    new_invoices: InvoicePlaneInvoice[];
    changed_invoices: InvoiceChange[];
  };
}

export interface PortfolioTargetFailure {
  ok: false;
  target: InvoicePlaneTargetDescriptor;
  error: {
    message: string;
  };
}

export type PortfolioTargetResult = PortfolioTargetSuccess | PortfolioTargetFailure;

export interface PortfolioWorkflowResult {
  ok: true;
  runId: string;
  finishedAt: string;
  result: {
    portfolio: "portal-ops-ap";
    target_count: number;
    successful_target_count: number;
    failed_target_count: number;
    total_invoice_count: number;
    total_new_invoice_count: number;
    total_changed_invoice_count: number;
    total_unchanged_invoice_count: number;
    summary_text: string;
    artifacts: {
      csv_path: string;
      snapshot_dir: string;
    };
    invoices: PortfolioInvoiceRow[];
    targets: PortfolioTargetResult[];
  };
}

export interface StoredTargetSnapshot {
  capturedAt: string;
  target: InvoicePlaneTargetDescriptor;
  invoices: InvoicePlaneInvoice[];
}
