# Phase 1: Foundation - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Create the edulution-ai-framework Git repository with a complete layered AGENTS.md system. Three project-type layers (edulution-ui, custom-app, styled-page) compose via AGENTS.md spec filesystem inheritance. Any project can integrate it as a git submodule with working CI authentication via a composite GitHub Action. No single .md file exceeds 150 lines.

</domain>

<decisions>
## Implementation Decisions

### Convention split

- Base AGENTS.md is minimal: design tokens, commit/PR conventions, security tips, and general project guidelines that apply regardless of language
- TypeScript coding conventions (no comments, default exports, const objects over enums, etc.) go in a shared TS-specific section, NOT the universal base — styled pages may not use TypeScript
- Git rules (commit style, branch naming, PR guidelines, don't commit secrets) are universal base
- NestJS patterns, Nx workspace rules, and full-stack conventions are edulution-ui layer only

### Custom app conventions

- Custom apps import from @edulution-io/ui-kit directly (Button, cn, etc.) — do NOT recreate the SH wrapper pattern from edulution-ui
- Same ESLint (Airbnb+TS) and Prettier (2 spaces, 120 cols, single quotes) configuration as edulution-ui
- i18n is optional — offered as a scaffold choice but not required or documented as convention
- State management: Zustand recommended but not enforced — no preference on patterns

### Styled page conventions

- Supports both static info pages and interactive widgets (forms, small tools)
- Full branding: design tokens + font references + favicon + logo assets — pages should look unmistakably like edulution
- CSS approach and JS conventions: Claude's discretion (Tailwind-based)

### Framework discoverability

- Consumer has a root AGENTS.md (or CLAUDE.md) that references `@edulution-ai-framework/AGENTS.md` — layer is auto-discovered by directory placement per AGENTS.md spec
- Framework includes both a README.md (what it is, quick start) and a detailed integration guide (how to add submodule, configure CI, choose layer)
- AGENTS.md files contain conventions only — no "getting started" sections (keeps line budget focused)
- No example CLAUDE.md files shipped — pattern documented in integration guide, CLI generates pointer automatically in Phase 3

### Claude's Discretion

- API client approach for custom apps (eduApi reuse vs own axios instance)
- Project structure for custom apps (mirror edulution-ui layout vs simplified)
- CSS methodology for styled pages (Tailwind-only vs allowing custom CSS)
- JavaScript guidance level for styled pages (minimal vanilla JS guidance vs none)

</decisions>

<specifics>
## Specific Ideas

- User noted: "Typically consumers should not need example CLAUDE.md files because the framework pre-defines everything" — framework's AGENTS.md auto-discovery should minimize manual consumer setup
- The CLI scaffolder (Phase 3) will auto-generate the CLAUDE.md pointer, so Phase 1 just needs to document the one-liner pattern

</specifics>

<code_context>

## Existing Code Insights

### Reusable Assets

- Current AGENTS.md (67 lines): Source content for the base and edulution-ui layers — needs splitting, not rewriting
- `.eslintrc.json`, `prettier.config.js`: Configuration files that custom app layer can reference or duplicate
- `libs/ui-kit/`: Shared component library — custom app layer documents how to import from it
- `swagger-spec.json`: API spec to be synced in Phase 2, but referenced in layer docs
- Tailwind config (`apps/frontend/tailwind.config.*`): Source for design tokens

### Established Patterns

- AGENTS.md spec filesystem inheritance: AI tools auto-discover AGENTS.md by walking up/into directories
- CLAUDE.md as pointer (`@AGENTS.md`): Already used in edulution-ui, same pattern for framework consumers
- License header enforcement: Pre-commit hook adds Netzint AGPL/commercial header — edulution-ui layer should document this

### Integration Points

- The framework repo will be a new GitHub repository in edulution-io org (private)
- Composite GitHub Action for CI auth goes in `.github/actions/` within the framework repo
- Consumer projects add submodule at root: `git submodule add <repo-url> edulution-ai-framework`

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 01-foundation_
_Context gathered: 2026-03-09_
