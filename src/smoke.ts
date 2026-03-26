import { RunStatus } from "@tiny-fish/sdk";

import { parseSmokeTestResponse, runSmokeTest } from "./workflows/runSmokeTest.js";

async function main() {
  const response = await runSmokeTest();

  if (response.status !== RunStatus.COMPLETED) {
    console.error(JSON.stringify(response, null, 2));
    throw new Error(response.error?.message ?? `TinyFish run ended with status ${response.status}`);
  }

  const parsed = parseSmokeTestResponse(response);

  console.log(JSON.stringify(parsed, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
