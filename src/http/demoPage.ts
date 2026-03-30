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
        --warning: #a06814;
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
        width: min(1160px, calc(100vw - 32px));
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

      .hero-grid {
        display: grid;
        gap: 24px;
        grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.95fr);
        align-items: end;
      }

      .kicker {
        margin: 0 0 10px;
        font-size: 12px;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--muted);
      }

      h1 {
        max-width: 11ch;
        margin: 0;
        font-size: clamp(3rem, 8vw, 5.8rem);
        line-height: 0.92;
        letter-spacing: -0.04em;
      }

      .hero-copy {
        max-width: 620px;
        margin-top: 18px;
        font-size: 18px;
        line-height: 1.5;
        color: var(--muted);
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

      .filter-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .field {
        display: grid;
        gap: 6px;
      }

      .field label {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .field input {
        width: 100%;
        border: 1px solid var(--line);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.8);
        padding: 12px 14px;
        font: inherit;
        color: var(--text);
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

      .hint,
      .value-line {
        margin: 0;
        font-size: 14px;
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
        grid-template-columns: repeat(6, minmax(0, 1fr));
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
        font-size: 15px;
        line-height: 1.4;
        word-break: break-word;
      }

      .timeline {
        display: grid;
        gap: 12px;
      }

      .timeline-item,
      .target-card {
        display: grid;
        gap: 6px;
        padding-top: 12px;
        border-top: 1px solid var(--line);
      }

      .timeline-top,
      .target-top {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: baseline;
      }

      .timeline-label,
      .target-title {
        margin: 0;
        font-size: 15px;
        line-height: 1.4;
      }

      .timeline-time,
      .target-status {
        margin: 0;
        font-size: 12px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--muted);
        white-space: nowrap;
      }

      .timeline-detail,
      .target-detail {
        margin: 0;
        font-size: 13px;
        line-height: 1.5;
        color: var(--muted);
        word-break: break-word;
      }

      .target-status[data-state="ok"] {
        color: var(--success);
      }

      .target-status[data-state="error"] {
        color: var(--danger);
      }

      .target-status[data-state="mixed"] {
        color: var(--warning);
      }

      .badge-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .badge {
        display: inline-flex;
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(15, 108, 120, 0.08);
        color: var(--accent);
        font-size: 12px;
        font-weight: 700;
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

      .pill {
        display: inline-flex;
        padding: 6px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .pill[data-change="new"] {
        background: rgba(37, 112, 76, 0.12);
        color: var(--success);
      }

      .pill[data-change="changed"] {
        background: rgba(160, 104, 20, 0.12);
        color: var(--warning);
      }

      .pill[data-change="unchanged"] {
        background: rgba(15, 108, 120, 0.08);
        color: var(--accent);
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

      @media (max-width: 980px) {
        .hero-grid {
          grid-template-columns: 1fr;
        }

        .summary-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        h1 {
          max-width: none;
        }
      }

      @media (max-width: 640px) {
        .shell {
          width: min(100vw - 20px, 1160px);
          padding-top: 20px;
        }

        .hero,
        .panel,
        .control-panel {
          border-radius: 22px;
          padding: 18px;
        }

        .summary-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .filter-grid {
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
            <h1>Daily portal checks, one run.</h1>
            <p class="hero-copy">
              This page runs the local PortalOps portfolio workflow, checks configured invoice portals through TinyFish,
              compares the result with the previous snapshot, and turns the output into an ops-ready summary.
            </p>
          </div>
          <aside class="control-panel">
            <span class="endpoint">GET /local/workflows/portfolio/stream or /local/workflows/efiskalizimi/stream</span>
            <div class="controls">
              <button id="runPortfolioButton" type="button">Run Daily Check</button>
              <button id="runEfiskalizimiButton" type="button">Run eFiskalizimi</button>
              <button id="copyButton" class="ghost-button" type="button" disabled>Copy JSON</button>
              <button id="csvButton" class="ghost-button" type="button" disabled>Download CSV</button>
            </div>
            <div class="filter-grid">
              <div class="field">
                <label for="efiskDateFrom">eFisk From</label>
                <input id="efiskDateFrom" type="text" inputmode="numeric" placeholder="DD.MM.YYYY" />
              </div>
              <div class="field">
                <label for="efiskDateTo">eFisk To</label>
                <input id="efiskDateTo" type="text" inputmode="numeric" placeholder="DD.MM.YYYY" />
              </div>
              <div class="field">
                <label for="efiskCounterparty">Counterparty</label>
                <input id="efiskCounterparty" type="text" placeholder="Optional name filter" />
              </div>
              <div class="field">
                <label for="efiskResultLimit">Result Limit</label>
                <input id="efiskResultLimit" type="text" inputmode="numeric" value="5" />
              </div>
            </div>
            <p class="hint">
              Use the portfolio button for all configured targets, or run eFiskalizimi directly with optional date and counterparty filters.
            </p>
            <p id="statusLine" class="status-line" data-state="idle">Idle.</p>
            <p id="valueLine" class="value-line">Run the portfolio workflow to see which invoice records are new, changed, or unchanged.</p>
          </aside>
        </div>
      </section>

      <section class="content">
        <section class="panel">
          <p class="section-label">Summary</p>
          <div class="summary-grid">
            <div class="stat">
              <p class="stat-label">Status</p>
              <p id="summaryStatus" class="stat-value">Idle</p>
            </div>
            <div class="stat">
              <p class="stat-label">Targets</p>
              <p id="summaryTargets" class="stat-value">0 checked</p>
            </div>
            <div class="stat">
              <p class="stat-label">Invoices</p>
              <p id="summaryInvoices" class="stat-value">0</p>
            </div>
            <div class="stat">
              <p class="stat-label">New</p>
              <p id="summaryNew" class="stat-value">0</p>
            </div>
            <div class="stat">
              <p class="stat-label">Changed</p>
              <p id="summaryChanged" class="stat-value">0</p>
            </div>
            <div class="stat">
              <p class="stat-label">CSV Artifact</p>
              <p id="summaryCsv" class="stat-value">Waiting for first run</p>
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
          <p class="section-label">Targets</p>
          <div id="targetsWrap">
            <p class="empty">No target results yet.</p>
          </div>
        </section>

        <section class="panel">
          <p class="section-label">Invoices</p>
          <div id="tableWrap">
            <p class="empty">No invoices yet.</p>
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
    "portfolio": "portal-ops-ap",
    "target_count": 1,
    "successful_target_count": 1,
    "failed_target_count": 0,
    "total_invoice_count": 5,
    "total_new_invoice_count": 5,
    "total_changed_invoice_count": 0,
    "total_unchanged_invoice_count": 0,
    "summary_text": "Checked 1 targets.",
    "artifacts": {
      "csv_path": "...",
      "snapshot_dir": "..."
    },
    "invoices": [],
    "targets": []
  }
}</pre>
          </details>
        </section>
      </section>
    </main>

    <script>
      const runPortfolioButton = document.getElementById("runPortfolioButton");
      const runEfiskalizimiButton = document.getElementById("runEfiskalizimiButton");
      const copyButton = document.getElementById("copyButton");
      const csvButton = document.getElementById("csvButton");
      const efiskDateFrom = document.getElementById("efiskDateFrom");
      const efiskDateTo = document.getElementById("efiskDateTo");
      const efiskCounterparty = document.getElementById("efiskCounterparty");
      const efiskResultLimit = document.getElementById("efiskResultLimit");
      const statusLine = document.getElementById("statusLine");
      const valueLine = document.getElementById("valueLine");
      const summaryStatus = document.getElementById("summaryStatus");
      const summaryTargets = document.getElementById("summaryTargets");
      const summaryInvoices = document.getElementById("summaryInvoices");
      const summaryNew = document.getElementById("summaryNew");
      const summaryChanged = document.getElementById("summaryChanged");
      const summaryCsv = document.getElementById("summaryCsv");
      const timeline = document.getElementById("timeline");
      const targetsWrap = document.getElementById("targetsWrap");
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
        runPortfolioButton.disabled = isRunning;
        runEfiskalizimiButton.disabled = isRunning;
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

      function renderTargets(targets) {
        if (!Array.isArray(targets) || targets.length === 0) {
          targetsWrap.innerHTML = '<p class="empty">No target results yet.</p>';
          return;
        }

        targetsWrap.innerHTML = targets.map((targetResult) => {
          const isOk = Boolean(targetResult.ok);
          const baseline = isOk
            ? targetResult.changes?.baseline === "first_run"
              ? "first baseline"
              : "compared with previous snapshot"
            : "workflow failed";
          const detail = isOk
            ? \`\${targetResult.invoice_count} invoices. \${targetResult.changes.new_invoice_count} new, \${targetResult.changes.changed_invoice_count} changed, \${targetResult.changes.unchanged_invoice_count} unchanged.\`
            : targetResult.error?.message || "Unknown workflow error";
          const badges = isOk
            ? [
                \`<span class="badge">\${targetResult.target.portal}</span>\`,
                \`<span class="badge">\${targetResult.target.id}</span>\`,
                \`<span class="badge">\${baseline}</span>\`
              ].join("")
            : [
                \`<span class="badge">\${targetResult.target.portal}</span>\`,
                \`<span class="badge">\${targetResult.target.id}</span>\`
              ].join("");

          return \`
            <article class="target-card">
              <div class="target-top">
                <p class="target-title">\${escapeHtml(targetResult.target.label)}</p>
                <p class="target-status" data-state="\${isOk ? "ok" : "error"}">\${isOk ? "OK" : "Failed"}</p>
              </div>
              <div class="badge-row">\${badges}</div>
              <p class="target-detail">\${escapeHtml(detail)}</p>
            </article>
          \`;
        }).join("");
      }

      function renderInvoices(invoices) {
        if (!Array.isArray(invoices) || invoices.length === 0) {
          tableWrap.innerHTML = '<p class="empty">No invoices returned.</p>';
          return;
        }

        const header = [
          "Target",
          "Change",
          "Status",
          "Invoice",
          "Client",
          "Due Date",
          "Amount",
          "Balance"
        ];

        const rows = invoices.map((invoice) => \`
          <tr>
            <td>\${escapeHtml(invoice.target_label ?? "")}</td>
            <td><span class="pill" data-change="\${escapeHtml(invoice.change_type ?? "unchanged")}">\${escapeHtml(invoice.change_type ?? "unchanged")}</span></td>
            <td>\${escapeHtml(invoice.status ?? "")}</td>
            <td>\${escapeHtml(invoice.invoice_number ?? "")}</td>
            <td>\${escapeHtml(invoice.client_name ?? "")}</td>
            <td>\${escapeHtml(invoice.due_date ?? "")}</td>
            <td>\${escapeHtml(invoice.amount_display ?? "")}</td>
            <td>\${escapeHtml(invoice.balance_display ?? "")}</td>
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
        summaryStatus.textContent = data.ok ? "OK" : "Failed";
        summaryTargets.textContent = \`\${data.result?.successful_target_count ?? 0}/\${data.result?.target_count ?? 0} succeeded\`;
        summaryInvoices.textContent = String(data.result?.total_invoice_count ?? 0);
        summaryNew.textContent = String(data.result?.total_new_invoice_count ?? 0);
        summaryChanged.textContent = String(data.result?.total_changed_invoice_count ?? 0);
        summaryCsv.textContent = data.result?.artifacts?.csv_path || "Missing";
        renderTargets(data.result?.targets ?? []);
        renderInvoices(data.result?.invoices ?? []);
        rawJson.textContent = JSON.stringify(data, null, 2);
        setStatus("success", \`Success in \${formatDuration(durationMs)}\`);
        setValueLine(data.result?.summary_text || "Portfolio run completed.");
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
          "target_id",
          "target_label",
          "change_type",
          "invoice_key",
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
        link.download = "portalops-portfolio-summary.csv";
        link.click();
        URL.revokeObjectURL(url);
      }

      function resetSummaryState() {
        summaryStatus.textContent = "Running";
        summaryTargets.textContent = "Pending";
        summaryInvoices.textContent = "…";
        summaryNew.textContent = "…";
        summaryChanged.textContent = "…";
        summaryCsv.textContent = "Pending";
      }

      function buildEfiskalizimiOverrides() {
        const payload = {};
        const filterDateFrom = efiskDateFrom.value.trim();
        const filterDateTo = efiskDateTo.value.trim();
        const filterCounterpartyName = efiskCounterparty.value.trim();
        const resultLimit = efiskResultLimit.value.trim();

        if (filterDateFrom) {
          payload.filterDateFrom = filterDateFrom;
        }

        if (filterDateTo) {
          payload.filterDateTo = filterDateTo;
        }

        if (filterCounterpartyName) {
          payload.filterCounterpartyName = filterCounterpartyName;
        }

        if (resultLimit) {
          payload.resultLimit = Number(resultLimit);
        }

        return payload;
      }

      function buildStreamUrl(path, body) {
        const url = new URL(path, window.location.origin);

        Object.entries(body || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            url.searchParams.set(key, String(value));
          }
        });

        return url.pathname + url.search;
      }

      async function runWorkflow(options) {
        if (activeStream) {
          activeStream.close();
        }

        startedAtMs = Date.now();
        latestResponse = null;
        setActionState(true, false);
        setStatus("loading", options.loadingStatus);
        setValueLine(options.loadingDetail);
        resetSummaryState();
        resetTimeline();
        renderTargets([]);
        renderInvoices([]);
        rawJson.textContent = JSON.stringify({ ok: true, stream: "connected" }, null, 2);
        appendTimeline("Starting...", options.startingDetail);

        if (!window.EventSource) {
          appendTimeline("Streaming unavailable", "Falling back to the sync endpoint.");
          try {
            const response = await fetch(options.syncPath, {
              method: "POST",
              headers: {
                "content-type": "application/json"
              },
              body: JSON.stringify({ mode: "sync", ...(options.body || {}) })
            });
            const data = await response.json();
            if (!response.ok || !data.ok) {
              throw new Error(data?.error?.message || "Workflow request failed");
            }
            appendTimeline("Done", "Sync fallback completed.");
            renderResponse(data, Date.now() - startedAtMs);
          } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            summaryStatus.textContent = "Error";
            summaryTargets.textContent = "Unavailable";
            summaryInvoices.textContent = "0";
            summaryNew.textContent = "0";
            summaryChanged.textContent = "0";
            summaryCsv.textContent = "Unavailable";
            rawJson.textContent = JSON.stringify({ ok: false, error: { message } }, null, 2);
            setStatus("error", message);
            setValueLine(options.failureDetail);
            setActionState(false, false);
          }
          return;
        }

        const stream = new EventSource(buildStreamUrl(options.streamPath, options.body));
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
          summaryStatus.textContent = "Error";
          summaryTargets.textContent = "Unavailable";
          summaryInvoices.textContent = "0";
          summaryNew.textContent = "0";
          summaryChanged.textContent = "0";
          summaryCsv.textContent = "Unavailable";
          renderTargets([]);
          renderInvoices([]);
          rawJson.textContent = JSON.stringify({ ok: false, error: data }, null, 2);
          appendTimeline("Error", data.message || "Workflow failed.");
          setStatus("error", data.message || "Workflow failed.");
          setValueLine(options.failureDetail);
          setActionState(false, false);
          stream.close();
          activeStream = null;
        });

        stream.onerror = () => {
          if (!activeStream) {
            return;
          }

          summaryStatus.textContent = "Error";
          summaryTargets.textContent = "Unavailable";
          summaryInvoices.textContent = "0";
          summaryNew.textContent = "0";
          summaryChanged.textContent = "0";
          summaryCsv.textContent = "Unavailable";
          renderTargets([]);
          renderInvoices([]);
          rawJson.textContent = JSON.stringify({ ok: false, error: { message: "Stream connection failed" } }, null, 2);
          appendTimeline("Error", "Stream connection failed.");
          setStatus("error", "Stream connection failed.");
          setValueLine(options.streamFailureDetail);
          setActionState(false, false);
          stream.close();
          activeStream = null;
        };
      }

      function runPortfolio() {
        return runWorkflow({
          syncPath: "/local/workflows/portfolio",
          streamPath: "/local/workflows/portfolio/stream",
          body: {},
          loadingStatus: "Running portfolio workflow...",
          loadingDetail: "Watching PortalOps check each configured target and build the daily summary.",
          startingDetail: "Connecting to the local portfolio workflow stream.",
          failureDetail: "The portfolio workflow failed before returning a normalized summary.",
          streamFailureDetail: "The portfolio workflow did not complete over the local stream."
        });
      }

      function runEfiskalizimi() {
        const overrides = buildEfiskalizimiOverrides();

        return runWorkflow({
          syncPath: "/local/workflows/efiskalizimi",
          streamPath: "/local/workflows/efiskalizimi/stream",
          body: overrides,
          loadingStatus: "Running eFiskalizimi workflow...",
          loadingDetail: "Watching PortalOps log into eFiskalizimi, apply the selected filters, and extract invoice rows.",
          startingDetail: "Connecting to the local eFiskalizimi workflow stream.",
          failureDetail: "The eFiskalizimi workflow failed before returning a normalized summary.",
          streamFailureDetail: "The eFiskalizimi workflow did not complete over the local stream."
        });
      }

      runPortfolioButton.addEventListener("click", runPortfolio);
      runEfiskalizimiButton.addEventListener("click", runEfiskalizimi);
      copyButton.addEventListener("click", copyJson);
      csvButton.addEventListener("click", downloadCsv);
    </script>
  </body>
</html>`;
}
