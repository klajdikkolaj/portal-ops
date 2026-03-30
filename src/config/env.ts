import "dotenv/config";

import { resolve } from "node:path";

import { z } from "zod";

const optionalNonEmptyString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

const portalTargetInputSchema = z.object({
  id: z.string().trim().min(1).optional(),
  label: z.string().trim().min(1).optional(),
  portal: z.enum(["invoiceplane", "efiskalizimi"]).optional(),
  baseUrl: z.url().optional(),
  username: z.string().trim().min(1).optional(),
  password: z.string().trim().min(1).optional(),
  invoicesPath: z.string().trim().min(1).optional(),
  resultLimit: z.coerce.number().int().min(1).max(20).optional(),
  personalIdOrNuis: z.string().trim().min(1).optional(),
  bookLabel: z.string().trim().min(1).optional(),
  filterDateFrom: z.string().trim().min(1).optional(),
  filterDateTo: z.string().trim().min(1).optional(),
  filterCounterpartyName: z.string().trim().min(1).optional(),
});

const envSchema = z.object({
  TINYFISH_API_KEY: z.string().trim().min(1, "TINYFISH_API_KEY is required"),
  INVOICEPLANE_BASE_URL: z.url().default("https://demo.invoiceplane.com"),
  INVOICEPLANE_USERNAME: z.string().trim().min(1).default("guest@invoiceplane.com"),
  INVOICEPLANE_PASSWORD: z.string().trim().min(1).default("demopassword"),
  INVOICEPLANE_INVOICES_PATH: z.string().trim().min(1).default("/invoices/index"),
  INVOICEPLANE_RESULT_LIMIT: z.coerce.number().int().min(1).max(20).default(5),
  EFISKALIZIMI_BASE_URL: z.url().default("https://efiskalizimi-app.tatime.gov.al/"),
  EFISKALIZIMI_PERSONAL_ID_OR_NUIS: optionalNonEmptyString,
  EFISKALIZIMI_PASSWORD: optionalNonEmptyString,
  EFISKALIZIMI_BOOK_LABEL: z.string().trim().min(1).default("Libri i blerjeve e i shitjeve"),
  EFISKALIZIMI_RESULT_LIMIT: z.coerce.number().int().min(1).max(20).default(10),
  EFISKALIZIMI_FILTER_DATE_FROM: optionalNonEmptyString,
  EFISKALIZIMI_FILTER_DATE_TO: optionalNonEmptyString,
  EFISKALIZIMI_FILTER_COUNTERPARTY_NAME: optionalNonEmptyString,
  PORTAL_OPS_HOST: z.string().trim().min(1).default("127.0.0.1"),
  PORTAL_OPS_PORT: z.coerce.number().int().min(1).max(65535).default(3010),
  PORTAL_OPS_TARGETS_JSON: optionalNonEmptyString,
  PORTAL_OPS_DATA_DIR: z.string().trim().min(1).default(".portal-ops"),
});

export type Env = z.infer<typeof envSchema>;

interface BasePortalTargetConfig {
  id: string;
  label: string;
  baseUrl: string;
  resultLimit: number;
}

export interface InvoicePlaneTargetConfig extends BasePortalTargetConfig {
  portal: "invoiceplane";
  username: string;
  password: string;
  invoicesPath: string;
}

export interface EfiskalizimiTargetConfig extends BasePortalTargetConfig {
  portal: "efiskalizimi";
  personalIdOrNuis: string;
  password: string;
  bookLabel: string;
  filterDateFrom?: string;
  filterDateTo?: string;
  filterCounterpartyName?: string;
}

export type PortalTargetConfig = InvoicePlaneTargetConfig | EfiskalizimiTargetConfig;

let cachedEnv: Env | undefined;
let cachedTargets: PortalTargetConfig[] | undefined;

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

export function getPortalTargets(): PortalTargetConfig[] {
  if (cachedTargets) {
    return cachedTargets;
  }

  const env = getEnv();

  if (!env.PORTAL_OPS_TARGETS_JSON) {
    cachedTargets = [buildDefaultTarget(env)];
    return cachedTargets;
  }

  let rawTargets: unknown;

  try {
    rawTargets = JSON.parse(env.PORTAL_OPS_TARGETS_JSON);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown JSON parse failure";
    throw new Error(`Invalid PORTAL_OPS_TARGETS_JSON: ${message}`);
  }

  const parsed = z.array(portalTargetInputSchema).min(1).safeParse(rawTargets);

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join("; ");
    throw new Error(`Invalid PORTAL_OPS_TARGETS_JSON: ${message}`);
  }

  cachedTargets = parsed.data.map((target, index) => buildTargetConfig(target, index, env));
  return cachedTargets;
}

export function getPortalOpsDataDir(): string {
  return resolve(process.cwd(), getEnv().PORTAL_OPS_DATA_DIR);
}

function buildDefaultTarget(env: Env): PortalTargetConfig {
  return {
    id: "invoiceplane-demo",
    label: "InvoicePlane Demo",
    portal: "invoiceplane",
    baseUrl: env.INVOICEPLANE_BASE_URL,
    username: env.INVOICEPLANE_USERNAME,
    password: env.INVOICEPLANE_PASSWORD,
    invoicesPath: normalizePath(env.INVOICEPLANE_INVOICES_PATH),
    resultLimit: env.INVOICEPLANE_RESULT_LIMIT,
  };
}

function buildTargetConfig(
  input: z.infer<typeof portalTargetInputSchema>,
  index: number,
  env: Env,
): PortalTargetConfig {
  const portal = input.portal ?? "invoiceplane";
  const fallbackBaseUrl = input.baseUrl ?? getDefaultBaseUrl(portal, env);
  const fallbackLabel = buildFallbackLabel(portal, fallbackBaseUrl, index);
  const id = sanitizeTargetId(input.id ?? input.label ?? fallbackLabel);
  const label = input.label ?? fallbackLabel;
  const resultLimit = input.resultLimit ?? getDefaultResultLimit(portal, env);

  if (portal === "efiskalizimi") {
    const efiskTarget: EfiskalizimiTargetConfig = {
      id,
      label,
      portal,
      baseUrl: fallbackBaseUrl,
      personalIdOrNuis: requireValue(
        input.personalIdOrNuis ?? env.EFISKALIZIMI_PERSONAL_ID_OR_NUIS,
        `${label}: personalIdOrNuis or EFISKALIZIMI_PERSONAL_ID_OR_NUIS is required`,
      ),
      password: requireValue(
        input.password ?? env.EFISKALIZIMI_PASSWORD,
        `${label}: password or EFISKALIZIMI_PASSWORD is required`,
      ),
      bookLabel: input.bookLabel ?? env.EFISKALIZIMI_BOOK_LABEL,
      resultLimit,
    };

    const filterDateFrom = input.filterDateFrom ?? env.EFISKALIZIMI_FILTER_DATE_FROM;
    const filterDateTo = input.filterDateTo ?? env.EFISKALIZIMI_FILTER_DATE_TO;
    const filterCounterpartyName = input.filterCounterpartyName ?? env.EFISKALIZIMI_FILTER_COUNTERPARTY_NAME;

    if (filterDateFrom) {
      efiskTarget.filterDateFrom = filterDateFrom;
    }

    if (filterDateTo) {
      efiskTarget.filterDateTo = filterDateTo;
    }

    if (filterCounterpartyName) {
      efiskTarget.filterCounterpartyName = filterCounterpartyName;
    }

    return efiskTarget;
  }

  return {
    id,
    label,
    portal,
    baseUrl: fallbackBaseUrl,
    username: input.username ?? env.INVOICEPLANE_USERNAME,
    password: input.password ?? env.INVOICEPLANE_PASSWORD,
    invoicesPath: normalizePath(input.invoicesPath ?? env.INVOICEPLANE_INVOICES_PATH),
    resultLimit,
  };
}

function getDefaultBaseUrl(portal: PortalTargetConfig["portal"], env: Env): string {
  return portal === "efiskalizimi" ? env.EFISKALIZIMI_BASE_URL : env.INVOICEPLANE_BASE_URL;
}

function getDefaultResultLimit(portal: PortalTargetConfig["portal"], env: Env): number {
  return portal === "efiskalizimi" ? env.EFISKALIZIMI_RESULT_LIMIT : env.INVOICEPLANE_RESULT_LIMIT;
}

function buildFallbackLabel(portal: PortalTargetConfig["portal"], baseUrl: string, index: number): string {
  if (portal === "efiskalizimi") {
    return index === 0 ? "eFiskalizimi Self Care" : `eFiskalizimi Self Care ${index + 1}`;
  }

  if (baseUrl.includes("demo.invoiceplane.com")) {
    return index === 0 ? "InvoicePlane Demo" : `InvoicePlane Demo ${index + 1}`;
  }

  const host = new URL(baseUrl).hostname.replace(/^www\./, "");
  return `Invoice Portal ${host}`;
}

function requireValue(value: string | undefined, message: string): string {
  if (!value) {
    throw new Error(message);
  }

  return value;
}

function sanitizeTargetId(value: string): string {
  const sanitized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized || "invoice-target";
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}
