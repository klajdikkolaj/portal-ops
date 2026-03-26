import { RunStatus, type RunStatus as RunStatusType } from "@tiny-fish/sdk";

import { smokeTestResponseSchema, type SmokeTestResponse } from "../types/workflow.js";
import { getTinyFishClient } from "../lib/tinyfish.js";

const SMOKE_TEST_URL = "https://scrapeme.live/shop";
const SMOKE_TEST_GOAL =
  "Extract the first 2 product names and prices. Return clean JSON with a products array.";

export async function runSmokeTest() {
  const client = getTinyFishClient();

  return client.agent.run({
    url: SMOKE_TEST_URL,
    goal: SMOKE_TEST_GOAL,
  });
}

export function parseSmokeTestResponse(response: unknown): SmokeTestResponse {
  return smokeTestResponseSchema.parse(response);
}

export interface SmokeTestStreamHandlers {
  onStarted?: (runId: string) => void;
  onStreamingUrl?: (streamingUrl: string) => void;
  onProgress?: (purpose: string) => void;
  onComplete?: (status: RunStatusType) => void;
}

export async function streamSmokeTest(handlers: SmokeTestStreamHandlers = {}): Promise<SmokeTestResponse> {
  const client = getTinyFishClient();
  const stream = await client.agent.stream(
    {
      url: SMOKE_TEST_URL,
      goal: SMOKE_TEST_GOAL,
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

  return smokeTestResponseSchema.parse(run);
}
