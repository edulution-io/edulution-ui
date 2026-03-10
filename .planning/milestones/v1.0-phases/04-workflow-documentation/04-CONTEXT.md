# Phase 4: Workflow Documentation - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Two AI-facing workflow guides that live in the framework repo. An AI coding tool reads these guides and follows their steps to help a developer create a new edulution project or add features to an existing one. Guides instruct the AI to prompt users at every decision point. The CLI scaffold engine is updated to include workflow references in generated AGENTS.md for automatic discovery.

</domain>

<decisions>
## Implementation Decisions

### Guide structure

- Linear step-by-step numbered flow, inline branches for project type differences ("If React app: ... If styled page: ...")
- One file per guide: `docs/workflows/new-app.md` and `docs/workflows/add-feature.md`
- Relaxed line limit (~250 lines) since workflow guides are read-once instructions, not persistent context like AGENTS.md
- No code snippets inline — describe what to create, let AI generate code following AGENTS.md conventions
- Per-step guardrails ("Do not...") to prevent common AI mistakes at each step

### New-app guide flow

- Assumes project already scaffolded via `npx edulution-create` (prerequisite, not duplicated)
- Step 1: Verify project runs (`npm install && npm run dev`)
- Step 2: File-by-file walkthrough explaining each key file's purpose (App.tsx, apiClient, AuthProvider, tailwind.config, AGENTS.md)
- No first feature built — orientation only, then hand off to add-feature guide
- Suggest commit at verification milestone

### Decision point design

- Exact question templates with suggested options at every decision point
- AI must always force a choice — no "you decide" option for users (all decisions require explicit user input)
- AI reads project files to auto-detect scaffolded features (e.g., check if `src/auth/` exists) rather than asking user what was selected
- Guide tells AI to re-read relevant AGENTS.md layer before generating code at each step
- Suggest git commits at logical milestones (not forced, not after every step)

### ui-kit component references

- Placeholder TODO markers for ui-kit components that don't exist yet: `<!-- TODO: @ui-kit/Sidebar -->`
- Generated code includes `// TODO: Replace with @edulution-io/ui-kit` comments where components will be available
- When ui-kit grows, guides and templates are updated in the same commit to stay consistent
- This is a crucial part of the framework's value — TODOs must be visible and trackable

### Add-feature guide

- Single guide file with AI auto-detecting feature type from user's request
- Three feature flows: new page/route (React), API integration, styled page section
- API integration flow always checks `artifacts/swagger-spec.json` first for endpoints and response shapes
- TypeScript types derived from swagger spec — no `any` or untyped responses
- Styled page sections focus on HTML+Tailwind+edulution tokens; complex interactivity suggests upgrading to custom React app
- Verification step at end: run dev server, visually confirm feature works, suggest commit

### File location and discovery

- Guides live in `edulution-ai-framework/docs/workflows/` alongside existing `docs/integration-guide.md`
- CLI scaffold engine updated to add Workflows section to generated AGENTS.md with `@` references to guide files
- Framework README.md gets a brief Workflow Guides section for human discovery
- Integration guide updated with a section for existing projects to manually add workflow references

### Versioning

- No version markers in guide files — the git submodule commit IS the version
- Templates, conventions, and guides updated atomically in the same commit when changes occur
- Consumers get consistent snapshot when updating submodule

</decisions>

<specifics>
## Specific Ideas

- User emphasized that ui-kit TODO placeholders are a crucial feature — the guides exist partly to drive ui-kit adoption, and the TODOs make gaps visible
- Guides must be AI-agnostic — any AI tool that reads markdown can follow them (Claude, Cursor, Copilot, etc.)
- The preview format shown during discussion (with **Read:**, **Ask the user:**, **Do not:**, **Check:**) was well-received as a step format

</specifics>

<code_context>

## Existing Code Insights

### Reusable Assets

- `edulution-ai-framework/docs/integration-guide.md`: Existing docs pattern, guides sit alongside it
- `edulution-ai-framework/cli/src/scaffold.ts`: Scaffold engine that generates AGENTS.md — needs Workflows section added
- `edulution-ai-framework/AGENTS.md` + layer files: Convention files that guides reference at each step
- `edulution-ai-framework/cli/templates/`: Template files the new-app guide walks through explaining

### Established Patterns

- AGENTS.md auto-discovery via filesystem inheritance — workflow guides use `@` references for the same discovery
- CLI generates both CLAUDE.md and AGENTS.md in scaffolded projects (Phase 3) — Workflows section added to generated AGENTS.md
- Phase 1 convention: no single .md file exceeds 150 lines (relaxed to ~250 for workflow guides)

### Integration Points

- `docs/workflows/new-app.md` and `docs/workflows/add-feature.md` in framework repo
- `cli/src/scaffold.ts` updated to include workflow references in generated AGENTS.md
- `docs/integration-guide.md` updated with workflow guide section for existing projects
- `README.md` updated with brief workflow guides section

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 04-workflow-documentation_
_Context gathered: 2026-03-10_
