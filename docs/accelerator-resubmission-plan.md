# PortalOps Accelerator Resubmission Plan

## Objective

The current repo already proves the core technical claim:

- TinyFish can log into a real authenticated portal
- navigate a multi-step workflow
- extract structured invoice data
- return clean JSON through CLI and HTTP entrypoints

That is proof-of-work. The resubmission needs to package it as proof-of-business.

The goal is not to rebuild the app from scratch. The goal is to reposition the same core into a narrow product wedge for finance and back-office teams that still live inside ugly portals.

## Current State

What is already real in this repo:

- a typed TinyFish client wrapper
- fast-fail env loading
- sync and streaming workflow execution
- one authenticated workflow against the public InvoicePlane demo
- normalized invoice JSON output
- a localhost HTTP wrapper and tiny demo page

What is still missing from a stronger accelerator submission:

- a clearer buyer
- a repeated operational workflow across more than one account or portal
- a business-facing output such as a daily summary or export
- a sharper claim about time saved and operational pain reduced

## New Positioning

### One-line product

PortalOps is an AI ops agent for finance and back-office teams that still have to check invoices and documents across ugly business portals manually.

### Buyer

Start with one narrow buyer:

- SMB finance teams
- small accounting firms managing multiple client portals
- operations/admin teams responsible for invoice follow-up

### Pain

These teams deal with:

- too many vendor or customer portals
- repetitive login and status checking
- manual copying into spreadsheets
- missed invoices and changed balances
- no clean daily summary across systems

### Wedge

PortalOps automates invoice collection from portals, normalizes the output, and produces one clear daily update for the team.

### Why this feels like a business

This is not just “browser automation that works.” It is a recurring workflow with an obvious buyer, a measurable time-saving claim, and a path to expansion:

1. invoice retrieval
2. change detection and summaries
3. exports into finance workflows
4. more portal connectors
5. broader AP document operations

## Product Claim For Resubmission

Use this framing consistently:

> PortalOps helps finance and ops teams stop manually checking invoice portals. It logs in, retrieves invoice data, normalizes results across portals, and produces one daily operational summary.

Avoid this framing:

> PortalOps is a TinyFish demo that fetches invoices from a portal.

The first version can still be narrow. The difference is that the narrow workflow now sits inside a business use case.

## Recommended MVP Scope

Keep the current single-portal workflow as the core. Add only the smallest features that make the app feel like a product instead of a script.

### Must-have next

#### 1. Multi-account or multi-portal runs

Even two targets are enough.

Good options:

- two InvoicePlane accounts for the same workflow shape
- InvoicePlane plus one second invoice/document portal

Why it matters:

- shows repetition, not one-off automation
- makes the summary layer more credible
- suggests a real expansion path

#### 2. Change-aware daily summary

Track the delta between runs and only surface what changed:

- new invoices found
- status changed
- balance changed
- missing or empty results

Implementation does not need a database yet. A local snapshot file is enough for the next stage.

#### 3. Business-facing output

Pick one downstream action:

- export CSV
- write a Google Sheet
- send an email summary
- emit a webhook payload

CSV is the cheapest next step. Google Sheets is stronger if it can be done quickly and reliably.

### Nice-to-have if time remains

- basic connector config for named portals/accounts
- a cleaner summary UI in the local demo page
- simple run history from local files

### Explicit cut list

Do not add these before resubmission:

- full SaaS auth
- multi-tenant storage
- polished dashboard
- generic connector framework
- deployment complexity
- agent orchestration abstractions

## 10-Day Execution Plan

### Day 1-2

- reframe README and demo language around AP/back-office pain
- define the normalized result contract for multi-run output
- choose the second account or portal target

### Day 3-5

- add multi-target execution over the same workflow core
- persist local snapshots from the last successful run
- implement change detection

### Day 6-7

- add one business-facing output layer
- prefer CSV export or Google Sheets update
- tighten error messages for empty data, auth failure, and portal drift

### Day 8-9

- update the demo page to show a portfolio-style summary instead of one raw run
- rehearse the 2-3 minute demo
- capture one clean happy-path dataset for backup

### Day 10

- rewrite the application answers
- trim anything that does not directly strengthen the wedge
- record the final unedited demo

## Proposed Demo Narrative

## Demo goal

Show that PortalOps is not merely capable of browser automation. Show that it removes a repeated AP/back-office task.

## 2-3 minute script

### 1. Start with the pain

Say:

> Finance and operations teams still waste time logging into multiple portals every morning just to check for new invoices and status changes. PortalOps automates that work using TinyFish.

### 2. Show the operator view

Start the local app or CLI and show that PortalOps is configured to check one or more accounts/portals.

### 3. Run the workflow live

Show:

- authenticated login
- navigation to the invoice area
- live progress
- structured extraction

### 4. Show the normalized result

Do not stop at raw JSON. Explain what the data means:

- new invoices
- changed balances
- which portal/account each item came from

### 5. Show the downstream output

Show a single summary artifact:

- CSV file
- Google Sheet
- email-style summary

### 6. Close with the business claim

Say:

> This starts with invoice portals, but the same product expands into the broader back-office workflows teams still handle manually across legacy systems.

## Suggested Messaging

### Homepage / intro copy

PortalOps is an AI ops agent for back-office teams stuck in legacy portals. It logs in, checks invoice and document sections, extracts structured data, and produces a daily operational summary.

### Short pitch

PortalOps saves finance and operations teams from manually checking portals for invoice updates every day.

### More concrete pitch

PortalOps connects to ugly authenticated portals, retrieves invoice data, normalizes it across accounts, and flags what changed so finance teams do not have to do repetitive portal work by hand.

## Application Answer Drafts

These are intentionally short and investor-readable.

### What are you building?

PortalOps is an AI operations agent for finance and back-office teams that still have to check invoices and documents across legacy business portals manually. It logs into portals, navigates multi-step invoice workflows, extracts structured data, and produces one normalized daily summary.

### What valuable real-world task does it perform?

It replaces the repetitive work of logging into portals, checking invoice pages, copying fields into spreadsheets, and tracking what changed between runs. The first wedge is accounts payable and invoice operations.

### Why is this a business and not just a demo?

The workflow is recurring, tied to a clear buyer, and expands naturally into a broader category of back-office portal operations. Teams already spend time on this work every day, and the product can grow from invoice retrieval into alerts, exports, reconciliation support, and additional portal coverage.

### Why now?

The web already contains thousands of high-friction portals that still gate important business operations, and browser agents are finally reliable enough to automate them end to end. TinyFish makes it possible to productize these ugly but valuable workflows much faster than traditional RPA-heavy approaches.

### Who pays?

Initial buyers are SMB finance teams, accounting firms handling multiple client portals, and operations/admin teams that manage invoice follow-up across vendors or customers.

### What is the wedge?

Start with invoice portal monitoring and daily summaries. Expand into adjacent AP and document workflows across more portals and accounts.

## Repo Implications

The repo should communicate two truths clearly:

1. today it already has a credible TinyFish workflow core
2. next it is becoming a narrow AP/ops product, not a general automation toy

That means future changes should prioritize:

- multi-target runs
- change detection
- one downstream summary/export path
- demo clarity over platform breadth

## Success Bar For The Resubmission

The resubmission is strong if a reviewer can quickly conclude:

- this solves a real recurring business problem
- the team has already proven the hardest technical piece
- the next scope is disciplined and believable
- the wedge can expand into a larger company
