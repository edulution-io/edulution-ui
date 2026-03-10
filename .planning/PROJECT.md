# edulution AI Framework

## What This Is

A reusable AI coding context framework that lives as its own private Git repository (`edulution-ai-framework`) and can be embedded as a submodule into edulution-ui, custom React apps, and simple styled pages. It provides layered AI-agnostic coding conventions, design tokens, API specs, scaffolding, and workflow documentation so that any AI coding tool (Claude, Cursor, Copilot, etc.) can produce correct edulution-compatible code. Includes an interactive CLI scaffolder and AI workflow guides.

## Core Value

Any developer (or AI) can scaffold a new edulution-compatible project and immediately build correct, styled, API-connected features — without reading edulution-ui's internals.

## Requirements

### Validated

- ✓ Extract AGENTS.md from edulution-ui into the framework repo — v1.0
- ✓ Layered .md system: base conventions + project-type-specific overrides — v1.0
- ✓ AI-agnostic — works with any AI coding tool via AGENTS.md — v1.0
- ✓ Framework repo used as Git submodule at root level — v1.0
- ✓ Full swagger-spec.json included in framework (synced from edulution-ui via CI) — v1.0
- ✓ Tailwind config synced from edulution-ui via CI — v1.0
- ✓ GitHub Actions pipeline that syncs swagger spec, tailwind config, and CSS artifacts — v1.0
- ✓ Node.js setup script with interactive prompts that scaffolds new projects — v1.0
- ✓ Setup script asks for project type, pre-configurations, and install location — v1.0
- ✓ Scaffolded React custom apps are ready-to-run with selected pre-configurations — v1.0
- ✓ Scaffolded styled pages provide Tailwind config + source for building CSS — v1.0
- ✓ Auth integration scaffolding: SSO on same origin using edulution API — v1.0
- ✓ API client pre-configuration: axios (React) / fetch (styled page) configured for edulution backend — v1.0
- ✓ Support ui-kit as both npm package dependency and local checkout — v1.0
- ✓ Linux setup script support — v1.0
- ✓ AI workflow documentation: "new app" guide — v1.0
- ✓ AI workflow documentation: "add feature" guide — v1.0
- ✓ Workflow docs instruct AI to prompt user for clarification at decision points — v1.0
- ✓ edulution-ui itself consumes the framework as a submodule (dog-fooding) — v1.0
- ✓ edulution-ui's inline AGENTS.md removed, replaced by framework's layered files — v1.0
- ✓ CLAUDE.md references framework's AGENTS.md via submodule path — v1.0

### Active

- [ ] Framework has independent semver versioning, documents which edulution versions it supports
- [ ] Scheduled drift detection job opens issue when framework artifacts diverge from edulution-ui (SYNC-04)

### Out of Scope

- Moving styled components from frontend to ui-kit — separate task
- Publishing ui-kit as npm package — separate task
- In-app AI chat feature in edulution — future project, but this framework lays groundwork
- Windows setup script — deferred, Node.js chosen for future portability
- GSD-style slash commands for the framework — documentation-driven workflow only
- Tool-specific config files (.cursorrules, .github/copilot-instructions.md) — keep AGENTS.md generic
- Context linting tool for layer conflict detection — v2
- Token cost measurement for .md files — v2
- Doctor/health-check command for existing projects — v2
- Upgrade command to update scaffolded projects — v2
- Artifact versioning and changelog for synced files — v2

## Context

### Current State

Shipped v1.0 with ~12,000 LOC across 61 files.
Tech stack: Node.js CLI (tsup/ESM), GitHub Actions, Git submodules.
Framework lives at `edulution-ai-framework/` as a submodule in edulution-ui.
All 5 phases complete: content system, CI sync, CLI scaffolder, workflow docs, dog-fooding.

### Project Types Supported

1. **edulution-ui (core)** — The main monorepo. Gets the full conventions including NestJS API patterns, Nx workspace rules, and all frontend patterns.
2. **Custom React apps** — Standalone React apps deployed independently. Use edulution's ui-kit components, talk to edulution API (and may have own endpoints), share SSO on same origin.
3. **Styled HTML/CSS/JS pages** — Simple pages that just need edulution's visual styling. No React, no TypeScript necessarily. Get Tailwind config + design tokens to build their own CSS.

### Consumers (Phased)

1. Internal team (Netzint devs) — immediate
2. External developers building on edulution — later
3. In-app AI chat that generates apps programmatically — future

## Key Decisions

| Decision                         | Rationale                                                                                  | Outcome   |
| -------------------------------- | ------------------------------------------------------------------------------------------ | --------- |
| Git submodule over npm package   | Submodule reference in public repos reveals nothing without access; no publish step needed | ✓ Good    |
| AI-agnostic via AGENTS.md        | Other tools (Cursor, Copilot) can read AGENTS.md directly; CLAUDE.md is just a pointer     | ✓ Good    |
| Node.js setup script             | Cross-platform potential for future Windows support; rich interactive prompts              | ✓ Good    |
| CI sync over manual/hooks        | Tailwind config is stable, swagger changes often; CI on merge is reliable and automated    | ✓ Good    |
| Full swagger spec (not filtered) | AI can find relevant endpoints; filtering adds maintenance burden                          | ✓ Good    |
| Independent semver               | Framework evolves at its own pace; documents edulution compatibility range                 | — Pending |
| edulution-ui eats own dog food   | Core repo also uses framework as submodule; ensures framework stays complete and correct   | ✓ Good    |
| ESM module type for CLI          | Aligns with modern Node.js conventions; tsup builds to .mjs                                | ✓ Good    |
| SSH with HTTPS fallback          | SSH preferred for submodule URLs; HTTPS fallback for environments without SSH keys         | ✓ Good    |
| Describe-and-generate pattern    | Workflow docs describe what to build without code snippets; prevents convention drift      | ✓ Good    |

## Constraints

- **Privacy**: Framework repo must be private on GitHub (same org as edulution-io). AI .md files must never leak to public repos.
- **AI-agnostic**: Must work with any AI coding tool that reads markdown files. No vendor lock-in.
- **Submodule**: All consuming projects use git submodule at root level. No alternative checkout methods.
- **CI sync**: Swagger spec and tailwind config changes must flow automatically from edulution-ui to the framework repo via GitHub Actions.
- **Node.js**: Setup script written in Node.js for cross-platform potential.
- **Independent versioning**: Framework uses its own semver, not tied to edulution-ui release numbers.

---

_Last updated: 2026-03-10 after v1.0 milestone_
