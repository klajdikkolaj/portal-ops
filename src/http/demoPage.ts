export function renderDemoPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PortalOps Demo</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f7f3ea;
        --bg-accent: #ead7b5;
        --panel: rgba(255, 252, 245, 0.82);
        --panel-strong: rgba(255, 249, 240, 0.94);
        --text: #1f1a17;
        --muted: #65584c;
        --line: rgba(58, 46, 36, 0.14);
        --accent: #0f6c78;
        --accent-strong: #0c5660;
        --success: #25704c;
        --danger: #a23d34;
        --shadow: 0 24px 80px rgba(68, 49, 25, 0.12);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Avenir Next", "Segoe UI", sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(15, 108, 120, 0.18), transparent 28%),
          radial-gradient(circle at 85% 15%, rgba(214, 145, 65, 0.24), transparent 24%),
          linear-gradient(180deg, #fbf8f0 0%, var(--bg) 48%, #efe4d5 100%);
      }

      .shell {
        width: min(1080px, calc(100vw - 32px));
        margin: 0 auto;
        padding: 32px 0 40px;
      }

      .hero {
        position: relative;
        overflow: hidden;
        padding: 32px;
        border: 1px solid rgba(255, 255, 255, 0.5);
        border-radius: 28px;
        background:
          linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(255, 247, 237, 0.92)),
          linear-gradient(180deg, rgba(236, 216, 178, 0.45), rgba(255, 255, 255, 0));
        box-shadow: var(--shadow);
      }

      .hero::after {
        content: "";
        position: absolute;
        inset: auto -5% -45% auto;
        width: 320px;
        height: 320px;
        border-radius: 999px;
        background: radial-gradient(circle, rgba(15, 108, 120, 0.2), transparent 68%);
        pointer-events: none;
      }

      .kicker {
        margin: 0 0 10px;
        font-size: 12px;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--muted);
      }

      h1 {
        max-width: 10ch;
        margin: 0;
        font-size: clamp(3rem, 8vw, 5.8rem);
        line-height: 0.92;
        letter-spacing: -0.04em;
      }

      .hero-copy {
        max-width: 540px;
        margin-top: 18px;
        font-size: 18px;
        line-height: 1.5;
        color: var(--muted);
      }

      .hero-grid {
        display: grid;
        gap: 24px;
        grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.95fr);
        align-items: end;
      }

      .control-panel {
        align-self: stretch;
        display: grid;
        gap: 16px;
        padding: 22px;
        border-radius: 24px;
        background: var(--panel);
        border: 1px solid rgba(255, 255, 255, 0.65);
        backdrop-filter: blur(12px);
      }

      .endpoint {
        display: inline-flex;
        width: fit-content;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(15, 108, 120, 0.08);
        color: var(--accent);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
      }

      .controls {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }

      button {
        border: 0;
        border-radius: 999px;
        background: linear-gradient(135deg, var(--accent), var(--accent-strong));
        color: white;
        padding: 14px 22px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
        box-shadow: 0 14px 32px rgba(15, 108, 120, 0.2);
      }

      button:hover:not(:disabled) {
        transform: translateY(-1px);
      }

      button:disabled {
        cursor: wait;
        opacity: 0.7;
      }

      .ghost-button {
        background: rgba(15, 108, 120, 0.08);
        color: var(--accent);
        box-shadow: none;
      }

      .hint {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        color: var(--muted);
      }

      .value-line {
        margin: 0;
        font-size: 15px;
        line-height: 1.5;
        color: var(--muted);
      }

      .status-line {
        min-height: 22px;
        font-size: 14px;
        font-weight: 700;
        color: var(--muted);
      }

      .status-line[data-state="loading"] {
        color: var(--accent);
      }

      .status-line[data-state="success"] {
        color: var(--success);
      }

      .status-line[data-state="error"] {
        color: var(--danger);
      }

      .content {
        display: grid;
        gap: 18px;
        margin-top: 22px;
      }

      .panel {
        padding: 22px;
        border-radius: 24px;
        background: var(--panel-strong);
        border: 1px solid rgba(255, 255, 255, 0.72);
        box-shadow: 0 18px 48px rgba(58, 46, 36, 0.08);
      }

      .section-label {
        margin: 0 0 14px;
        font-size: 13px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .summary-grid {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .stat {
        padding-top: 12px;
        border-top: 1px solid var(--line);
      }

      .stat-label {
        margin: 0 0 6px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--muted);
      }

      .stat-value {
        margin: 0;
        font-size: 16px;
        line-height: 1.35;
        word-break: break-word;
      }

      .timeline {
        display: grid;
        gap: 12px;
      }

      .timeline-item {
        display: grid;
        gap: 6px;
        padding-top: 12px;
        border-top: 1px solid var(--line);
      }

      .timeline-top {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: baseline;
      }

      .timeline-label {
        margin: 0;
        font-size: 15px;
        line-height: 1.4;
      }

      .timeline-time {
        margin: 0;
        font-size: 12px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--muted);
        white-space: nowrap;
      }

      .timeline-detail {
        margin: 0;
        font-size: 13px;
        line-height: 1.5;
        color: var(--muted);
        word-break: break-word;
      }

      .invoice-table {
        width: 100%;
        border-collapse: collapse;
      }

      .invoice-table th,
      .invoice-table td {
        padding: 12px 8px;
        border-bottom: 1px solid var(--line);
        text-align: left;
        vertical-align: top;
        font-size: 14px;
      }

      .invoice-table th {
        font-size: 12px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .invoice-table tbody tr:last-child td {
        border-bottom: 0;
      }

      pre {
        margin: 0;
        padding: 18px;
        overflow: auto;
        border-radius: 18px;
        background: #1b1a1a;
        color: #f8f3ec;
        font-family: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
        font-size: 13px;
        line-height: 1.55;
      }

      .empty {
        margin: 0;
        color: var(--muted);
      }

      details {
        border-top: 1px solid var(--line);
        padding-top: 10px;
      }

      summary {
        cursor: pointer;
        font-weight: 700;
        color: var(--accent);
      }

      @media (max-width: 840px) {
        .hero-grid {
          grid-template-columns: 1fr;
        }

        .summary-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        h1 {
          max-width: none;
        }
      }

      @media (max-width: 560px) {
        .shell {
          width: min(100vw - 20px, 1080px);
          padding-top: 20px;
        }

        .hero,
        .panel,
        .control-panel {
          border-radius: 22px;
          padding: 18px;
        }

        .summary-grid {
          grid-template-columns: 1fr;
        }

        .invoice-table {
          display: block;
          overflow-x: auto;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="hero">
        <div class="hero-grid">
          <div>
            <p class="kicker">PortalOps Local Demo</p>
            <h1>Invoice workflow, one click.</h1>
            <p class="hero-copy">
              This page calls the local PortalOps endpoint, runs the authenticated InvoicePlane workflow through TinyFish,
              and renders the normalized result without any extra app shell around it.
            </p>
          </div>
          <aside class="control-panel">
            <span class="endpoint">GET /local/workflows/invoiceplane/stream</span>
            <div class="controls">
              <button id="runButton" type="button">Fetch Recent Invoices</button>
              <button id="copyButton" class="ghost-button" type="button" disabled>Copy JSON</button>
              <button id="csvButton" class="ghost-button" type="button" disabled>Download CSV</button>
            </div>
            <p class="hint">
              The page stays deliberately small: one action, one workflow, one normalized result.
            </p>
            <p id="statusLine" class="status-line" data-state="idle">Idle.</p>
            <p id="valueLine" class="value-line">Run the workflow to see how quickly authenticated invoice data becomes usable.</p>
          </aside>
        </div>
      </section>

      <section class="content">
        <section class="panel">
          <p class="section-label">Summary</p>
          <div id="summaryGrid" class="summary-grid">
            <div class="stat">
              <p class="stat-label">Status</p>
              <p id="summaryOk" class="stat-value">Idle</p>
            </div>
            <div class="stat">
              <p class="stat-label">Run ID</p>
              <p id="summaryRunId" class="stat-value">Waiting for first run</p>
            </div>
            <div class="stat">
              <p class="stat-label">Finished At</p>
              <p id="summaryFinishedAt" class="stat-value">Waiting for first run</p>
            </div>
            <div class="stat">
              <p class="stat-label">Invoice Count</p>
              <p id="summaryCount" class="stat-value">0</p>
            </div>
          </div>
        </section>

        <section class="panel">
          <p class="section-label">Timeline</p>
          <div id="timeline" class="timeline">
            <p class="empty">No run started yet.</p>
          </div>
        </section>

        <section class="panel">
          <p class="section-label">Invoices</p>
          <div id="tableWrap">
            <p class="empty">No result yet.</p>
          </div>
        </section>

        <section class="panel">
          <p class="section-label">Raw JSON</p>
          <details>
            <summary>Show raw workflow output</summary>
            <pre id="rawJson">{
  "ok": true,
  "runId": "...",
  "finishedAt": "...",
  "result": {
    "portal": "invoiceplane-demo",
    "source_url": "https://demo.invoiceplane.com/invoices/index",
    "invoice_count": 5,
    "invoices": []
  }
}</pre>
          </details>
        </section>
      </section>
    </main>

    <script>
      const runButton = document.getElementById("runButton");
      const copyButton = document.getElementById("copyButton");
      const csvButton = document.getElementById("csvButton");
      const statusLine = document.getElementById("statusLine");
      const valueLine = document.getElementById("valueLine");
      const summaryOk = document.getElementById("summaryOk");
      const summaryRunId = document.getElementById("summaryRunId");
      const summaryFinishedAt = document.getElementById("summaryFinishedAt");
      const summaryCount = document.getElementById("summaryCount");
      const timeline = document.getElementById("timeline");
      const tableWrap = document.getElementById("tableWrap");
      const rawJson = document.getElementById("rawJson");
      let latestResponse = null;
      let activeStream = null;
      let startedAtMs = 0;

      function setStatus(state, message) {
        statusLine.dataset.state = state;
        statusLine.textContent = message;
      }

      function setValueLine(message) {
        valueLine.textContent = message;
      }

      function setActionState(isRunning, hasResult) {
        runButton.disabled = isRunning;
        copyButton.disabled = !hasResult;
        csvButton.disabled = !hasResult;
      }

      function formatDuration(ms) {
        return (ms / 1000).toFixed(ms > 10_000 ? 1 : 2) + "s";
      }

      function formatClock(timestamp) {
        return new Date(timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
      }

      function escapeHtml(value) {
        return String(value)
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#39;");
      }

      function resetTimeline() {
        timeline.innerHTML = "";
      }

      function appendTimeline(label, detail = "", timestamp = new Date().toISOString()) {
        if (!timeline.children.length) {
          timeline.innerHTML = "";
        }

        const item = document.createElement("article");
        item.className = "timeline-item";
        item.innerHTML = \`
          <div class="timeline-top">
            <p class="timeline-label">\${escapeHtml(label)}</p>
            <p class="timeline-time">\${escapeHtml(formatClock(timestamp))}</p>
          </div>
          \${detail ? \`<p class="timeline-detail">\${escapeHtml(detail)}</p>\` : ""}
        \`;
        timeline.appendChild(item);
      }

      function renderInvoices(invoices) {
        if (!Array.isArray(invoices) || invoices.length === 0) {
          tableWrap.innerHTML = '<p class="empty">No invoices returned.</p>';
          return;
        }

        const header = [
          "Status",
          "Invoice",
          "Created",
          "Due Date",
          "Client",
          "Amount",
          "Balance"
        ];

        const rows = invoices.map((invoice) => \`
          <tr>
            <td>\${invoice.status ?? ""}</td>
            <td>\${invoice.invoice_number ?? ""}</td>
            <td>\${invoice.created_date ?? ""}</td>
            <td>\${invoice.due_date ?? ""}</td>
            <td>\${invoice.client_name ?? ""}</td>
            <td>\${invoice.amount_display ?? ""}</td>
            <td>\${invoice.balance_display ?? ""}</td>
          </tr>
        \`).join("");

        tableWrap.innerHTML = \`
          <table class="invoice-table">
            <thead>
              <tr>\${header.map((label) => \`<th>\${label}</th>\`).join("")}</tr>
            </thead>
            <tbody>\${rows}</tbody>
          </table>
        \`;
      }

      function renderResponse(data, durationMs) {
        latestResponse = data;
        summaryOk.textContent = data.ok ? "OK" : "Failed";
        summaryRunId.textContent = data.runId || "Missing";
        summaryFinishedAt.textContent = data.finishedAt || "Missing";
        summaryCount.textContent = String(data.result?.invoice_count ?? 0);
        renderInvoices(data.result?.invoices ?? []);
        rawJson.textContent = JSON.stringify(data, null, 2);
        setStatus("success", \`Success in \${formatDuration(durationMs)}\`);
        setValueLine(\`\${data.result?.invoice_count ?? 0} invoices fetched in ~\${formatDuration(durationMs)} -> ready for Sheets/ERP/email summaries.\`);
        setActionState(false, true);
      }

      async function copyJson() {
        if (!latestResponse) {
          return;
        }

        await navigator.clipboard.writeText(JSON.stringify(latestResponse, null, 2));
        setStatus("success", "JSON copied.");
      }

      function downloadCsv() {
        const invoices = latestResponse?.result?.invoices;

        if (!Array.isArray(invoices) || invoices.length === 0) {
          return;
        }

        const columns = [
          "status",
          "invoice_number",
          "created_date",
          "due_date",
          "client_name",
          "amount_display",
          "balance_display"
        ];

        const csv = [
          columns.join(","),
          ...invoices.map((invoice) =>
            columns
              .map((key) => '"' + String(invoice[key] ?? "").replaceAll('"', '""') + '"')
              .join(",")
          )
        ].join("\\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "invoiceplane-invoices.csv";
        link.click();
        URL.revokeObjectURL(url);
      }

      async function runWorkflow() {
        if (activeStream) {
          activeStream.close();
        }

        startedAtMs = Date.now();
        latestResponse = null;
        setActionState(true, false);
        setStatus("loading", "Running workflow...");
        summaryOk.textContent = "Running";
        summaryRunId.textContent = "Pending";
        summaryFinishedAt.textContent = "Pending";
        summaryCount.textContent = "…";
        setValueLine("Watching the authenticated browser work through the portal in real time.");
        resetTimeline();
        appendTimeline("Starting...", "Connecting to the local workflow stream.");
        tableWrap.innerHTML = '<p class="empty">Waiting for workflow result...</p>';
        rawJson.textContent = JSON.stringify({ ok: true, stream: "connected" }, null, 2);

        if (!window.EventSource) {
          appendTimeline("Streaming unavailable", "Falling back to the sync endpoint.");
          try {
            const response = await fetch("/local/workflows/invoiceplane", {
              method: "POST",
              headers: {
                "content-type": "application/json"
              },
              body: JSON.stringify({ mode: "sync" })
            });
            const data = await response.json();
            if (!response.ok || !data.ok) {
              throw new Error(data?.error?.message || "Workflow request failed");
            }
            appendTimeline("Done", "Sync fallback completed.");
            renderResponse(data, Date.now() - startedAtMs);
          } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            summaryOk.textContent = "Error";
            summaryRunId.textContent = "Unavailable";
            summaryFinishedAt.textContent = "Unavailable";
            summaryCount.textContent = "0";
            rawJson.textContent = JSON.stringify({ ok: false, error: { message } }, null, 2);
            setStatus("error", message);
            setValueLine("The workflow failed before returning a normalized result.");
            setActionState(false, false);
          }
          return;
        }

        const stream = new EventSource("/local/workflows/invoiceplane/stream");
        activeStream = stream;

        stream.addEventListener("timeline", (event) => {
          const data = JSON.parse(event.data);
          appendTimeline(data.label, data.detail || "", data.timestamp || new Date().toISOString());
        });

        stream.addEventListener("result", (event) => {
          const data = JSON.parse(event.data);
          renderResponse(data, Date.now() - startedAtMs);
          stream.close();
          activeStream = null;
        });

        stream.addEventListener("workflow-error", (event) => {
          const data = JSON.parse(event.data);
          summaryOk.textContent = "Error";
          summaryRunId.textContent = "Unavailable";
          summaryFinishedAt.textContent = "Unavailable";
          summaryCount.textContent = "0";
          tableWrap.innerHTML = '<p class="empty">No invoices returned.</p>';
          rawJson.textContent = JSON.stringify({ ok: false, error: data }, null, 2);
          appendTimeline("Error", data.message || "Workflow failed.");
          setStatus("error", data.message || "Workflow failed.");
          setValueLine("The workflow failed before returning a normalized result.");
          setActionState(false, false);
          stream.close();
          activeStream = null;
        });

        stream.onerror = () => {
          if (!activeStream) {
            return;
          }

          summaryOk.textContent = "Error";
          summaryRunId.textContent = "Unavailable";
          summaryFinishedAt.textContent = "Unavailable";
          summaryCount.textContent = "0";
          tableWrap.innerHTML = '<p class="empty">No invoices returned.</p>';
          rawJson.textContent = JSON.stringify({ ok: false, error: { message: "Stream connection failed" } }, null, 2);
          appendTimeline("Error", "Stream connection failed.");
          setStatus("error", "Stream connection failed.");
          setValueLine("The workflow did not complete over the local stream.");
          setActionState(false, false);
          stream.close();
          activeStream = null;
        };
      }

      runButton.addEventListener("click", runWorkflow);
      copyButton.addEventListener("click", copyJson);
      csvButton.addEventListener("click", downloadCsv);
    </script>
  </body>
</html>`;
}
