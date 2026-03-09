# Requirements: edulution AI Framework

**Defined:** 2026-03-09
**Core Value:** Any developer (or AI) can scaffold a new edulution-compatible project and immediately build correct, styled, API-connected features — without reading edulution-ui's internals.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Context System

- [x] **CTX-01**: Base AGENTS.md contains shared conventions (design tokens, API patterns, component usage)
- [x] **CTX-02**: Project-type layer for edulution-ui (core) with NestJS, Nx, full-stack conventions
- [x] **CTX-03**: Project-type layer for custom React apps with Vite+TS, ui-kit, API client conventions
- [x] **CTX-04**: Project-type layer for styled HTML/CSS/JS pages with Tailwind-only conventions
- [x] **CTX-05**: Layers compose via AGENTS.md spec filesystem inheritance (directory-based auto-discovery)
- [x] **CTX-06**: Each .md file stays under 150 lines to prevent AI context degradation

### Repository & Submodule

- [x] **REPO-01**: Framework repo created on GitHub (edulution-io org, private)
- [x] **REPO-02**: Repo has documented directory structure with clear component boundaries
- [x] **REPO-03**: Integration guide for adding framework as git submodule at root level
- [x] **REPO-04**: Reusable composite GitHub Action for private submodule auth in consumer CI

### CI Sync

- [x] **SYNC-01**: GitHub Action in edulution-ui syncs swagger-spec.json to framework repo on merge to dev/main
- [x] **SYNC-02**: GitHub Action in edulution-ui syncs tailwind config + CSS artifacts to framework repo on merge
- [x] **SYNC-03**: Path filtering ensures sync only runs when source files actually change
- [ ] **SYNC-04**: Scheduled drift detection job opens issue when framework artifacts diverge from edulution-ui

### CLI Scaffolding

- [ ] **CLI-01**: Node.js CLI with interactive prompts for project type and configuration choices
- [ ] **CLI-02**: React custom app scaffold generates working Vite+React+TS project with edulution Tailwind theme
- [ ] **CLI-03**: Styled HTML page scaffold generates project with Tailwind config and edulution design tokens
- [ ] **CLI-04**: CLI prompts user to select pre-configurations (Tailwind, API client, auth, test framework)
- [ ] **CLI-05**: Auth integration scaffolding pre-wires SSO flow for same-origin edulution API
- [ ] **CLI-06**: API client scaffolding configures axios to talk to edulution backend
- [ ] **CLI-07**: Optional Vitest test framework setup when user selects it
- [ ] **CLI-08**: ui-kit dependency supported as both npm package and local checkout

### Workflow Documentation

- [ ] **WKFL-01**: "New app" guide walks AI through creating a complete custom app from scratch
- [ ] **WKFL-02**: "Add feature" guide walks AI through adding a page/feature to existing app
- [ ] **WKFL-03**: Guides instruct AI to prompt user for clarification at decision points
- [ ] **WKFL-04**: Guides reference setup script as prerequisite and explain when to use which .md file

### Dog-Fooding

- [ ] **DOG-01**: edulution-ui adds framework as git submodule at root level
- [ ] **DOG-02**: edulution-ui's inline AGENTS.md removed, replaced by framework's layered files
- [ ] **DOG-03**: CLAUDE.md updated to reference framework's AGENTS.md via submodule path

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Context Tooling

- **CTOOL-01**: Context linting tool that detects conflicts between layers
- **CTOOL-02**: Token cost measurement for .md files across different AI tools

### CLI Enhancements

- **CLIE-01**: Doctor/health-check command for existing projects
- **CLIE-02**: Upgrade command to update scaffolded projects to latest templates
- **CLIE-03**: Windows setup script support

### CI Enhancements

- **CIE-01**: Artifact versioning and changelog for synced files
- **CIE-02**: Tool-specific config generation (.cursorrules, .github/copilot-instructions.md) from AGENTS.md

### Future Integration

- **FUT-01**: In-app AI chat uses framework as knowledge base for generating apps
- **FUT-02**: Framework published as npm package (alternative to submodule)

## Out of Scope

| Feature                                         | Reason                                                          |
| ----------------------------------------------- | --------------------------------------------------------------- |
| Moving styled components to ui-kit              | Separate task, prerequisite but not part of this project        |
| Publishing ui-kit as npm package                | Separate task                                                   |
| In-app AI chat feature                          | Future project; framework lays groundwork but doesn't implement |
| Tool-specific config files (.cursorrules, etc.) | AGENTS.md is AI-agnostic; tool shims are v2                     |
| Windows setup script                            | Linux only for v1; Node.js chosen for future portability        |
| GSD-style slash commands                        | Documentation-driven workflow only                              |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase   | Status   |
| ----------- | ------- | -------- |
| CTX-01      | Phase 1 | Complete |
| CTX-02      | Phase 1 | Complete |
| CTX-03      | Phase 1 | Complete |
| CTX-04      | Phase 1 | Complete |
| CTX-05      | Phase 1 | Complete |
| CTX-06      | Phase 1 | Complete |
| REPO-01     | Phase 1 | Complete |
| REPO-02     | Phase 1 | Complete |
| REPO-03     | Phase 1 | Complete |
| REPO-04     | Phase 1 | Complete |
| SYNC-01     | Phase 2 | Complete |
| SYNC-02     | Phase 2 | Complete |
| SYNC-03     | Phase 2 | Complete |
| SYNC-04     | Phase 2 | Pending  |
| CLI-01      | Phase 3 | Pending  |
| CLI-02      | Phase 3 | Pending  |
| CLI-03      | Phase 3 | Pending  |
| CLI-04      | Phase 3 | Pending  |
| CLI-05      | Phase 3 | Pending  |
| CLI-06      | Phase 3 | Pending  |
| CLI-07      | Phase 3 | Pending  |
| CLI-08      | Phase 3 | Pending  |
| WKFL-01     | Phase 4 | Pending  |
| WKFL-02     | Phase 4 | Pending  |
| WKFL-03     | Phase 4 | Pending  |
| WKFL-04     | Phase 4 | Pending  |
| DOG-01      | Phase 5 | Pending  |
| DOG-02      | Phase 5 | Pending  |
| DOG-03      | Phase 5 | Pending  |

**Coverage:**

- v1 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0

---

_Requirements defined: 2026-03-09_
_Last updated: 2026-03-09 after roadmap creation_
