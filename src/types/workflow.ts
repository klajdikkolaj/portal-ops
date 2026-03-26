import { z } from "zod";

import { RunStatus } from "@tiny-fish/sdk";

export const smokeTestProductSchema = z.object({
  name: z.string().trim().min(1),
  price: z.string().trim().min(1),
});

export const smokeTestResponseSchema = z.object({
  run_id: z.string().trim().min(1),
  status: z.literal(RunStatus.COMPLETED),
  started_at: z.string().trim().min(1),
  finished_at: z.string().trim().min(1),
  num_of_steps: z.number().int().nonnegative(),
  result: z.object({
    products: z.array(smokeTestProductSchema).min(1),
  }),
  error: z.null(),
});

export type SmokeTestProduct = z.infer<typeof smokeTestProductSchema>;
export type SmokeTestResponse = z.infer<typeof smokeTestResponseSchema>;
