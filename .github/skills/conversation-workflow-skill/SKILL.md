---
name: conversation-workflow-skill
description: "Create a reusable SKILL.md from an observed conversation workflow. Use when a discussion reveals repeatable steps, decision branches, and quality checks that should become a slash-invocable skill."
argument-hint: "Describe the workflow to convert into a skill"
user-invocable: true
---

# Conversation Workflow To Skill

Use this skill to convert a repeated chat process into a reusable `SKILL.md` that can be discovered and invoked reliably.

Scope: workspace-level skill authoring for this repository.

## Inputs

Provide one of the following:

- A conversation transcript
- A summary of the method already used
- A checklist or procedure you want to standardize

## Procedure

1. Extract Workflow Signals

- Identify the main goal the process delivers.
- List concrete steps in execution order.
- Capture decision points with if/then branching.
- Capture quality criteria and completion checks.

2. Determine Skill Shape

- Decide whether this should be:
  - A quick checklist skill (short, high-frequency tasks)
  - A full workflow skill (multi-stage delivery)
- Identify required resources:
  - `./references/*` for long docs
  - `./scripts/*` for executable helpers
  - `./assets/*` for templates

3. Clarify Missing Information

- If unclear, ask:
  - What output should the skill produce?
  - Should scope be workspace or personal?
  - Should this be checklist-style or full workflow?

4. Draft SKILL.md

- Add valid frontmatter:
  - `name` must match folder name.
  - `description` must include explicit trigger keywords.
  - Optional `argument-hint` should guide slash usage.
- Write concise, action-oriented sections:
  - What it does
  - When to use
  - Step-by-step procedure
  - Decision logic
  - Validation/completion checks

5. Validate Skill Quality

- Confirm path and naming conventions are valid.
- Ensure procedure is executable without hidden assumptions.
- Ensure description is specific enough for discovery.
- Keep SKILL.md focused; move deep content to references.
- Produce a draft-plus-validation result as the default deliverable.

6. Iterate With Focused Questions

- Identify 1-3 weak or ambiguous areas.
- Ask targeted follow-up questions.
- Update SKILL.md with resolved details.

7. Finalize

- Summarize what the skill produces.
- Provide example prompts to invoke the skill.
- Suggest 1-3 related customizations to build next.

## Decision Logic

- If no stable sequence exists in the source discussion:
  - Do not force a full workflow.
  - Start with a lightweight checklist skill.
- If the process needs strict enforcement or automation:
  - Consider a custom agent or hook instead of only a skill.
- If the process is always-on across most coding tasks:
  - Prefer instructions over a skill.

## Completion Criteria

A draft is complete when:

- A valid `SKILL.md` exists in a correctly named folder.
- Steps, branches, and checks are explicit and testable.
- The `description` is keyword-rich and use-case specific.
- The validation checklist has been executed against the draft.
- At least 3 slash prompts are provided for trial.

## Example Prompts

- `/conversation-workflow-skill Convert my bug triage chat pattern into a reusable skill`
- `/conversation-workflow-skill Build a skill from our recurring code review checklist`
- `/conversation-workflow-skill Turn this release validation process into a slash workflow`

## Related Next Customizations

- Add a `.github/prompts/create-skill-from-retro.prompt.md` template for retrospective-driven skill drafting.
- Add a `.github/instructions/skills-style.instructions.md` file to enforce naming and description quality.
- Add a companion custom agent for multi-stage skill authoring with stricter step enforcement.
