import { z } from "zod";

export const invoicePlaneInvoiceSchema = z.object({
  status: z.string().trim().min(1),
  invoice_number: z.string().trim().min(1),
  created_date: z.string().trim().min(1),
  due_date: z.string().trim().min(1),
  client_name: z.string().trim().min(1),
  amount_display: z.string().trim().min(1),
  balance_display: z.string().trim().min(1),
});

export const invoicePlaneRecentInvoicesPayloadSchema = z.object({
  invoices: z.array(invoicePlaneInvoiceSchema).min(1),
});

export type InvoicePlaneInvoice = z.infer<typeof invoicePlaneInvoiceSchema>;

export interface InvoicePlaneRecentInvoicesResult {
  portal: "invoiceplane-demo";
  source_url: string;
  invoice_count: number;
  invoices: InvoicePlaneInvoice[];
}

export interface InvoicePlaneWorkflowResult {
  ok: true;
  runId: string;
  finishedAt: string | null;
  result: InvoicePlaneRecentInvoicesResult;
}
