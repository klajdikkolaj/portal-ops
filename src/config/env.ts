import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  TINYFISH_API_KEY: z.string().trim().min(1, "TINYFISH_API_KEY is required"),
  INVOICEPLANE_BASE_URL: z.url().default("https://demo.invoiceplane.com"),
  INVOICEPLANE_USERNAME: z.string().trim().min(1).default("guest@invoiceplane.com"),
  INVOICEPLANE_PASSWORD: z.string().trim().min(1).default("demopassword"),
  INVOICEPLANE_INVOICES_PATH: z.string().trim().min(1).default("/invoices/index"),
  INVOICEPLANE_RESULT_LIMIT: z.coerce.number().int().min(1).max(20).default(5),
  PORTAL_OPS_HOST: z.string().trim().min(1).default("127.0.0.1"),
  PORTAL_OPS_PORT: z.coerce.number().int().min(1).max(65535).default(3010),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | undefined;

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid environment configuration: ${message}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
