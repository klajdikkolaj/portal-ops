import { streamPortfolioWorkflow } from "./workflows/runPortfolioOps.js";

function logProgress(message: string): void {
  // Keep machine-readable output on stdout and live debug events on stderr.
  console.error(message);
}

async function main() {
  const response = await streamPortfolioWorkflow({
    onStarted: (runId) => logProgress(`[started] ${runId}`),
    onProgress: (event) => logProgress(`[progress] ${event.label}${event.detail ? ` :: ${event.detail}` : ""}`),
    onComplete: (result) => logProgress(`[complete] ${result.result.summary_text}`),
  });

  console.log(JSON.stringify(response, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
