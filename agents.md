# AGENTS.md

## Purpose

This repository builds **PortalOps**, a narrow MVP for the TinyFish Accelerator.

PortalOps is an AI operations agent for ugly, authenticated business web portals. The MVP is **not** a full SaaS platform. It is a focused browser-automation demo that proves one valuable workflow end to end.

The first version should do one thing well:

- open a target portal
- log in
- navigate to an invoices / documents / order-status section
- extract a small set of structured fields
- return clean JSON
- optionally expose that result through a tiny CLI, API, or minimal local UI

The accelerator goal is a **2–3 minute unedited demo** showing the agent doing real work on the live web.

---

## Product constraints

### In scope

- TinyFish API integration
- one narrow workflow
- strong error handling
- structured output
- minimal developer ergonomics
- clean code structure that can evolve into a better demo

### Out of scope for now

- full SaaS architecture
- billing
- authentication system for end users
- multi-tenancy
- background jobs beyond what is needed for demo
- databases unless unavoidable
- dashboards unless minimal and directly useful
- broad plugin systems
- generic agent frameworks
- polished deployment setup

### Product principle

**Speed to reliable demo beats breadth.**

When in doubt, choose:
1. narrower scope
2. fewer abstractions
3. stronger reliability
4. clearer output

---

## Success criteria

The first milestone is successful when:

- one command runs locally
- TinyFish performs a real browser task
- the workflow reaches the target page or target result
- the app returns structured JSON
- the code is clean enough to extend into a demo app

The MVP is successful when:

- one live portal workflow works end to end
- the result is visible and understandable
- the flow can be demonstrated clearly in 2–3 minutes
- the demo feels like a real product, not just a random script

---

## Engineering principles

- Prefer TypeScript.
- Keep files small and purposeful.
- Use obvious names.
- Centralize environment/config loading.
- Prefer explicit types over cleverness.
- Add abstractions only after duplication is real.
- Avoid fake enterprise architecture.
- Never commit secrets.
- Always optimize for reproducibility and demo reliability.

### Golden rule

If a change does not directly improve:
- reliability,
- demo clarity,
- developer speed,
- or maintainability for the narrow MVP,

then it is probably premature.

---

## Recommended repository shape

This is the preferred direction unless the current repo already differs and there is a strong reason to keep it that way.

```text
src/
  index.ts
  config/
    env.ts
  lib/
    tinyfish.ts
  workflows/
    fetchInvoices.ts
  types/
    tinyfish.ts
    workflow.ts
  utils/
    logger.ts
    errors.ts
```

Optional later:

```text
src/
  api/
    server.ts
  ui/
```

---

## Environment expectations

Expected environment variables include:

- `TINYFISH_API_KEY`
- optional proxy/browser profile settings later if needed

### Rules

- Validate env at startup.
- Fail fast on missing required config.
- Keep `.env` out of version control.
- Maintain a `.env.example` with placeholder keys only.

---

## Execution strategy

Build in this order:

### Phase 1 — smoke test

Implement a minimal TinyFish client and prove one successful request against a public site.

Deliverables:
- env loader
- TinyFish API helper
- basic request/response handling
- clean console output
- robust error handling

### Phase 2 — streaming/debug path

Add streaming or progress-aware execution so the workflow is easier to debug and better suited for live demoing.

Deliverables:
- SSE or equivalent progress handling
- logging that is useful but not noisy
- clear distinction between sync and streaming runs

### Phase 3 — first PortalOps workflow

Build one narrow workflow module, for example:
- `fetchInvoices`
- or `fetchOrderStatuses`

Deliverables:
- one workflow function
- typed input
- typed result
- structured JSON extraction
- browser-profile support if needed

### Phase 4 — minimal wrapper

Only after the workflow works, add the lightest useful interface:
- CLI
- tiny HTTP endpoint
- or minimal local UI

---

## Subagents

Use these subagents conceptually when planning or implementing work. If the coding environment supports explicit subagents, map them directly. Otherwise, use them as operating roles.

### 1) Architect
**Mission:** keep the implementation narrow, clean, and extensible.

**Responsibilities:**
- define folder structure
- protect the MVP from overengineering
- approve abstractions only when justified
- keep product and code aligned with accelerator goals

**Must enforce:**
- no premature monorepo
- no full SaaS platform decisions yet
- no broad framework work without immediate payoff

---

### 2) TinyFish Integration Engineer
**Mission:** own all TinyFish API integration logic.

**Responsibilities:**
- implement request helpers
- handle headers, auth, payloads, and response parsing
- support sync, streaming, and async patterns when needed
- document failure modes and recovery behavior

**Focus questions:**
- is the API call correct?
- is the error handling clear?
- do we expose enough debug information?
- can this run reliably in a live demo?

---

### 3) Workflow Engineer
**Mission:** implement the actual business workflow.

**Responsibilities:**
- encode portal-specific goals cleanly
- define workflow inputs/outputs
- normalize extracted data into structured JSON
- keep workflow logic separate from transport/integration logic

**Preferred outputs:**
- strong typing
- small workflow modules
- deterministic result structure

---

### 4) Reliability / QA Agent
**Mission:** reduce demo risk.

**Responsibilities:**
- identify brittle assumptions
- improve retries and validation where appropriate
- test unhappy paths
- ensure logging is sufficient for debugging live issues

**Checklist:**
- missing env
- bad API key
- non-200 responses
- malformed payloads
- empty extraction results
- timeout or unreachable target

---

### 5) Prompt / Goal Designer
**Mission:** write better TinyFish goals.

**Responsibilities:**
- refine prompts/goals for browser tasks
- improve extraction instructions
- reduce ambiguity
- enforce structured output requirements

**Rules:**
- be concrete
- request exact fields
- ask for clean JSON
- avoid vague browsing instructions
- prefer deterministic instructions over open-ended exploration

---

### 6) Product / Demo Strategist
**Mission:** shape the MVP into a strong accelerator submission.

**Responsibilities:**
- keep the product story clear
- cut features that do not help the demo
- ensure the output looks useful to a buyer/investor
- help script the 2–3 minute demo

**Primary concern:**
- does this feel fundable and useful in under 3 minutes?

---

### 7) Security / Secrets Guardian
**Mission:** prevent operational mistakes with secrets and sensitive config.

**Responsibilities:**
- ensure secrets stay out of source control
- review `.gitignore`
- sanitize logs
- avoid leaking credentials in examples or debugging output

---

## Skills to apply

These are reusable skill areas the coding agent should bring into work on this repo.

### Skill: MVP Scoping
- cut scope aggressively
- prefer one excellent flow over many incomplete ones
- protect the project from platform thinking too early

### Skill: TypeScript Backend Basics
- strong types
- lightweight modules
- clear config handling
- clean scripts and npm commands

### Skill: API Integration Hygiene
- centralized client wrapper
- typed request/response handling
- useful error objects
- graceful failure reporting

### Skill: Browser-Automation Goal Writing
- concise task instructions
- explicit navigation goals
- explicit extraction schema
- explicit completion criteria

### Skill: Structured Data Extraction
- normalize raw results
- guarantee stable field names
- distinguish required vs optional fields
- validate output before returning

### Skill: Demo Readiness
- clear output formatting
- predictable commands
- minimal setup friction
- visible business value

### Skill: Git Hygiene
- small focused commits
- meaningful commit messages
- never commit secrets
- prefer incremental, reviewable changes

### Skill: Lightweight Observability
- concise logs
- include enough context to debug
- avoid noisy console spam
- clearly surface failures

---

## Decision framework

Before implementing anything, ask:

1. Does this directly help the first live workflow work?
2. Does this directly improve demo reliability?
3. Does this make the code materially easier to extend soon?
4. Is there a simpler version that gets 80% of the value?

If the answer to the first three is no, do not build it yet.

---

## Implementation rules

### Do
- create a clean TinyFish client/helper
- keep workflow modules isolated
- use explicit types for inputs and outputs
- add npm scripts for running the workflow
- keep the first milestone runnable in one command

### Do not
- add NestJS yet unless there is a compelling reason
- add React UI before the core flow works
- add DB models before proving real workflow value
- introduce repository/service/factory patterns without real need
- generalize for many portals too early

---

## Definition of done by role

### Architect done when
- structure is clean
- scope is protected
- abstractions are justified

### TinyFish Integration Engineer done when
- API calls work
- auth is correct
- failures are handled well

### Workflow Engineer done when
- one narrow workflow works end to end
- output is clean JSON

### Reliability / QA Agent done when
- common failure paths are checked
- output is understandable during demo conditions

### Product / Demo Strategist done when
- the flow is easy to explain in under 3 minutes
- the business value is obvious

---

## Working style for coding agents

When assigned a task:

1. restate the specific narrow objective internally
2. inspect the current codebase before editing
3. prefer the smallest possible implementation that works
4. explain tradeoffs briefly when making structural decisions
5. leave the repo cleaner than you found it

When proposing changes:
- separate must-have from nice-to-have
- identify what can wait
- favor working increments over theoretical completeness

---

## First tasks for this repository

1. Inspect current scaffold.
2. Create or validate `src/config/env.ts`.
3. Create `src/lib/tinyfish.ts`.
4. Implement a smoke test against a public site.
5. Add robust error handling.
6. Add a streaming/debug execution path.
7. Create the first narrow workflow module.
8. Only then consider a tiny wrapper interface.

---

## Future expansion, but not yet

Only after the MVP works and the demo is solid, consider:

- small Express/Nest wrapper
- persistence for extracted results
- scheduling
- support for multiple portals
- a simple frontend
- deployment
- webhook outputs
- email/slack integrations

These are future steps, not present requirements.

---

## Final instruction to all agents

Build the **smallest credible PortalOps product** that proves TinyFish can reliably perform real work on the live web.

Do not chase completeness.
Chase **proof, clarity, and reliability**.

