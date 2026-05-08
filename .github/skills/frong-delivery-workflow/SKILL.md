---
name: frong-delivery-workflow
description: "Structured delivery workflow for Frong Finance. Use when working on a feature, bug, refactor, or product request in this Next.js finance dashboard and you want a step-by-step path from requirement intake to analysis, implementation, validation, commit, push, and PR preparation. Keywords: requirement, analyze, implement, test, commit, push, PR, Frong, OCR, Supabase, Clerk."
argument-hint: "Describe the task or requirement to deliver in Frong Finance"
user-invocable: true
---

# Frong Delivery Workflow

Use this skill when the task belongs to Frong Finance and should be handled as an end-to-end delivery flow instead of an isolated code edit.

## What This Project Is

Frong Finance is a personal finance web app built with Next.js App Router, TypeScript, Clerk authentication, Supabase, and client-side OCR for Thai payment slips. Core product areas include:

- dashboard summaries and charts
- transaction CRUD and filtering
- goal tracking
- OCR slip upload and parsing
- auth-protected user flows

## How The App Works

At a high level:

1. Users authenticate with Clerk.
2. Protected dashboard routes load finance data for the signed-in user.
3. Server actions and Supabase handle transaction, goal, budget, and OCR usage data.
4. OCR logic parses uploaded payment slips and helps create transactions.
5. Dashboard pages render summaries, charts, progress cards, and transaction tables.

## Delivery Steps

### 1. Receive Requirement

Capture the request in product language first.

Checklist:

- identify the user-facing outcome
- identify affected area: auth, dashboard, transactions, goals, OCR, settings, or infra
- note constraints: UI only, server action, schema, validation, auth, performance, or release urgency
- ask for clarification only if the task cannot be implemented safely without it

Expected output:

- one-sentence goal
- affected files or surfaces to inspect first
- definition of done

### 2. Analyze Before Editing

Find the nearest controlling code path, not just the route file.

Preferred analysis order:

1. active page or component
2. owning server action or validator
3. shared types or config
4. neighboring docs or manual testing notes if behavior is unclear

Analysis rules:

- form one falsifiable local hypothesis
- identify one cheap check that can prove the hypothesis wrong
- stop exploring once the controlling implementation is clear

### 3. Implement

Make the smallest change that fixes the root cause or adds the requested behavior.

Implementation rules:

- preserve existing architecture unless the task requires structural change
- keep public APIs stable where possible
- update validation schemas, types, and server actions together when behavior crosses boundaries
- avoid unrelated cleanup

Typical repo surfaces:

- `src/app/` for routes and layouts
- `src/components/` for UI and dashboard widgets
- `src/server-actions/` for data mutations and reads
- `src/lib/validators/` for Zod schemas
- `src/lib/ocr/` for OCR parsing logic
- `src/types/` for shared type contracts

### 4. Test And Validate

Run the cheapest meaningful verification immediately after the first substantive edit.

Default validation order for this repo:

1. narrow manual behavior check for the changed feature
2. `npm run lint`
3. `npm run build` when the change affects routing, typing, config, or release readiness

Known repo reality:

- automated tests are not the primary workflow yet
- `TESTING_GUIDE.md` defines manual MVP verification
- OCR, auth, and export flows should often be verified manually

Minimum validation guidance by area:

- UI change: confirm the page renders and the interaction works
- server action change: verify the success path and one failure path
- OCR change: test with at least one realistic slip image if available
- schema or config change: run lint and build

### 5. Review For Additional Improvements

Before closing the task, check whether one adjacent improvement is necessary for safety or maintainability.

Good candidates:

- missing validation on new input
- missing loading or error state
- inconsistent type handling across page, action, and schema
- missing manual verification note for risky flows
- missing documentation update when behavior changes materially

Avoid turning this into a broad refactor.

### 6. Commit

Only do this if the user asked for a commit.

Commit rules:

- review the diff first
- stage only relevant files
- use a clear message tied to behavior, not implementation trivia

Recommended commit format:

- `feat: add transaction filter behavior`
- `fix: correct OCR amount parsing`
- `refactor: simplify goals validation flow`

### 7. Push

Only do this if the user asked for a push and the branch is correct.

Push checklist:

- confirm current branch
- confirm no unrelated files are included
- push only after validation is complete

### 8. Prepare Pull Request

Only do this if the user asked for a PR.

PR checklist:

- concise title with user-facing impact
- summary of behavior change
- validation performed
- screenshots or manual steps for UI changes
- known risks or follow-up work

Suggested PR structure:

- What changed
- Why it changed
- How it was tested
- Risks and follow-up

## Repo-Specific Notes

- Auth depends on Clerk middleware and protected dashboard routing.
- Data integrity depends on Zod validators and Supabase-backed server actions.
- OCR features are product-critical and should be treated as high-risk when modified.
- The repo currently exposes `lint` and `build` scripts but not a mature automated test suite.

## Things Worth Improving In This Project

Use these as follow-up suggestions when relevant to the task:

1. Add automated coverage for OCR parsing, transaction filtering, and critical auth-protected flows.
2. Add a dedicated test command in `package.json` so validation is not limited to manual checks.
3. Tighten README consistency because some sections still read like template marketing copy and may not match the current repo state.
4. Clean up customization docs in `.github/copilot-instructions.md` by removing leftover HTML comments.
5. Add release-ready PR templates or contribution templates if team collaboration is increasing.

## Expected Response Pattern

When using this skill, structure the work in this sequence:

1. requirement summary
2. local analysis and hypothesis
3. implementation
4. validation
5. optional commit, push, and PR preparation
6. follow-up improvements if justified
