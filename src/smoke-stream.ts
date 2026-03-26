import { streamSmokeTest } from "./workflows/runSmokeTest.js";

function logProgress(message: string): void {
  console.error(message);
}

async function main() {
  const response = await streamSmokeTest({
    onStarted: (runId) => logProgress(`[started] ${runId}`),
    onStreamingUrl: (streamingUrl) => logProgress(`[watch] ${streamingUrl}`),
    onProgress: (purpose) => logProgress(`[progress] ${purpose}`),
    onComplete: (status) => logProgress(`[complete] ${status}`),
  });

  console.log(JSON.stringify(response, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
