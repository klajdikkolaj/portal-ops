import { runEfiskalizimiWorkflow } from "./workflows/fetchEfiskalizimiInvoices.js";

async function main() {
  const result = await runEfiskalizimiWorkflow();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
