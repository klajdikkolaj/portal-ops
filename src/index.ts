import { runInvoicePlaneWorkflow } from "./workflows/fetchInvoicePlaneRecentInvoices.js";

async function main() {
  const result = await runInvoicePlaneWorkflow();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
