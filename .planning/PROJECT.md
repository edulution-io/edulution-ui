# edulution AI Framework

## What This Is

A reusable AI coding context framework that lives as its own private Git repository (`edulution-ai-framework`) and can be embedded as a submodule into edulution-ui, custom React apps, and simple styled pages. It provides layered AI-agnostic coding conventions, design tokens, API specs, scaffolding, and workflow documentation so that any AI coding tool (Claude, Cursor, Copilot, etc.) can produce correct edulution-compatible code.

## Core Value

Any developer (or AI) can scaffold a new edulution-compatible project and immediately build correct, styled, API-connected features — without reading edulution-ui's internals.

## Requirements

### Validated

- ✓ Extract AGENTS.md from edulution-ui into the framework repo — Phase 1
- ✓ Layered .md system: base conventions + project-type-specific overrides — Phase 1
- ✓ AI-agnostic — works with any AI coding tool via AGENTS.md — Phase 1
- ✓ Framework repo used as Git submodule at root level — Phase 1
- ✓ Full swagger-spec.json included in framework (synced from edulution-ui via CI) — Phase 2
- ✓ Tailwind config synced from edulution-ui via CI — Phase 2
- ✓ GitHub Actions pipeline that syncs swagger spec, tailwind config, and CSS artifacts — Phase 2
- ✓ Node.js setup script with interactive prompts that scaffolds new projects — Phase 3
- ✓ Setup script asks for project type, pre-configurations, and install location — Phase 3
- ✓ Scaffolded React custom apps are ready-to-run with selected pre-configurations — Phase 3
- ✓ Scaffolded styled pages provide Tailwind config + source for building CSS — Phase 3
- ✓ Auth integration scaffolding: SSO on same origin using edulution API — Phase 3
- ✓ API client pre-configuration: axios (React) / fetch (styled page) configured for edulution backend — Phase 3
- ✓ Support ui-kit as both npm package dependency and local checkout — Phase 3
- ✓ Linux setup script support — Phase 3
- ✓ AI workflow documentation: "new app" guide (creating a complete custom app from scratch) — Phase 4
- ✓ AI workflow documentation: "add feature" guide (adding a page or feature to an existing custom app) — Phase 4
- ✓ Workflow docs instruct AI to prompt user for clarification at decision points — Phase 4

### Active

- [ ] edulution-ui itself consumes the framework as a submodule (dog-fooding), removing its inline AGENTS.md entirely
- [ ] Framework has independent semver versioning, documents which edulution versions it supports
- [ ] Privacy: framework repo is private; submodule reference in public repos reveals nothing without access

### Out of Scope

- Moving styled components from frontend to ui-kit — separate task
- Publishing ui-kit as npm package — separate task
- In-app AI chat feature in edulution — future project, but this framework lays groundwork
- Windows setup script — deferred, Node.js chosen for future portability
- GSD-style slash commands for the framework — documentation-driven workflow only
- Tool-specific config files (.cursorrules, .github/copilot-instructions.md) — keep AGENTS.md generic

## Context

### Current State

- AGENTS.md lives inline in edulution-ui and contains all coding conventions, stack info, and project structure
- CLAUDE.md in edulution-ui simply references AGENTS.md (`@AGENTS.md`) so other AI tools can read AGENTS.md directly
- edulution-ui is an Nx monorepo: React+Vite frontend, NestJS API, shared libs
- `libs/src/ui-kit` exists with some shared components but is incomplete — most styled components still in frontend
- `swagger-spec.json` exists in repo root
- Tailwind is configured in the frontend app
- GitHub Actions CI/CD is already in use

### Project Types Supported

1. **edulution-ui (core)** — The main monorepo. Gets the full conventions including NestJS API patterns, Nx workspace rules, and all frontend patterns.
2. **Custom React apps** — Standalone React apps deployed independently. Use edulution's ui-kit components, talk to edulution API (and may have own endpoints), share SSO on same origin.
3. **Styled HTML/CSS/JS pages** — Simple pages that just need edulution's visual styling. No React, no TypeScript necessarily. Get Tailwind config + design tokens to build their own CSS.

### Consumers (Phased)

1. Internal team (Netzint devs) — immediate
2. External developers building on edulution — later
3. In-app AI chat that generates apps programmatically — future

### Key Architecture Decisions

- **Git submodule** (not npm package or separate clone) — each consuming project has its own submodule checkout at `edulution-ai-framework/`. This naturally solves the privacy concern: public repos only store a reference to the private framework repo.
- **AI-agnostic** — AGENTS.md is the canonical file. CLAUDE.md exists only as a pointer (`@AGENTS.md`). No tool-specific config files.
- **Layered .md** — Base layer has conventions applicable to all project types. Project-type layers add stack-specific rules. Structure to be derived from content during implementation.
- **CI-driven sync** — GitHub Actions in edulution-ui pushes artifacts (swagger spec, tailwind config, CSS) to the framework repo. No manual sync needed.

## Constraints

- **Privacy**: Framework repo must be private on GitHub (same org as edulution-io). AI .md files must never leak to public repos.
- **AI-agnostic**: Must work with any AI coding tool that reads markdown files. No vendor lock-in.
- **Submodule**: All consuming projects use git submodule at root level. No alternative checkout methods.
- **CI sync**: Swagger spec and tailwind config changes must flow automatically from edulution-ui to the framework repo via GitHub Actions.
- **Node.js**: Setup script written in Node.js for cross-platform potential.
- **Independent versioning**: Framework uses its own semver, not tied to edulution-ui release numbers.

## Key Decisions

| Decision                         | Rationale                                                                                  | Outcome             |
| -------------------------------- | ------------------------------------------------------------------------------------------ | ------------------- |
| Git submodule over npm package   | Submodule reference in public repos reveals nothing without access; no publish step needed | ✓ Validated Phase 1 |
| AI-agnostic via AGENTS.md        | Other tools (Cursor, Copilot) can read AGENTS.md directly; CLAUDE.md is just a pointer     | ✓ Validated Phase 1 |
| Node.js setup script             | Cross-platform potential for future Windows support; rich interactive prompts              | ✓ Validated Phase 3 |
| CI sync over manual/hooks        | Tailwind config is stable, swagger changes often; CI on merge is reliable and automated    | ✓ Validated Phase 2 |
| Full swagger spec (not filtered) | AI can find relevant endpoints; filtering adds maintenance burden                          | ✓ Validated Phase 2 |
| Independent semver               | Framework evolves at its own pace; documents edulution compatibility range                 | — Pending           |
| edulution-ui eats own dog food   | Core repo also uses framework as submodule; ensures framework stays complete and correct   | — Pending           |

---

_Last updated: 2026-03-10 after Phase 4_
