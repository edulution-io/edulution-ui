# Roadmap: edulution AI Framework

## Overview

This roadmap delivers a reusable AI coding context framework as a standalone Git repository. The journey starts with extracting and layering the AGENTS.md content system and establishing the framework repo with submodule integration, then builds the CI sync pipeline for automated artifact distribution, followed by the interactive CLI scaffolder that generates ready-to-run projects, then workflow documentation for AI-guided development, and finally dog-fooding the framework in edulution-ui itself to validate completeness.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Layered AGENTS.md content system, framework repo, and submodule infrastructure
- [x] **Phase 2: CI Sync Pipeline** - Automated artifact sync from edulution-ui to framework repo
- [ ] **Phase 3: CLI Scaffolding** - Interactive CLI that generates ready-to-run edulution-compatible projects
- [ ] **Phase 4: Workflow Documentation** - AI-guided workflow docs for creating apps and adding features
- [ ] **Phase 5: Dog-Fooding** - edulution-ui consumes the framework, removing its inline AGENTS.md

## Phase Details

### Phase 1: Foundation

**Goal**: Framework repo exists with a complete layered AGENTS.md system and any project can integrate it as a git submodule with working CI authentication
**Depends on**: Nothing (first phase)
**Requirements**: CTX-01, CTX-02, CTX-03, CTX-04, CTX-05, CTX-06, REPO-01, REPO-02, REPO-03, REPO-04
**Success Criteria** (what must be TRUE):

1. Framework repo exists on GitHub (edulution-io org, private) with a documented directory structure
2. Base AGENTS.md contains shared conventions that apply to all three project types (edulution-ui core, custom React apps, styled pages)
3. Each project-type layer (edulution-ui, custom-app, styled-page) has its own AGENTS.md with stack-specific rules, and layers compose via filesystem inheritance
4. No single .md file exceeds 150 lines
5. A consumer project can add the framework as a git submodule and its CI can check it out using the provided composite GitHub Action
   **Plans**: 3 plans

Plans:

- [x] 01-01-PLAN.md -- Create framework repo, base AGENTS.md, TypeScript layer, and README
- [x] 01-02-PLAN.md -- Create edulution-ui, custom-app, and styled-page project-type layers
- [x] 01-03-PLAN.md -- Create integration guide and composite GitHub Action for CI auth

### Phase 2: CI Sync Pipeline

**Goal**: Swagger spec and Tailwind config changes in edulution-ui automatically flow to the framework repo without manual intervention
**Depends on**: Phase 1
**Requirements**: SYNC-01, SYNC-02, SYNC-03, SYNC-04
**Success Criteria** (what must be TRUE):

1. Merging a swagger-spec.json change to dev/main in edulution-ui triggers a sync that updates the framework repo's artifacts directory
2. Merging a Tailwind config or CSS change to dev/main triggers a sync that updates the framework repo's artifacts directory
3. Syncs only run when the relevant source files actually change (path filtering)
4. A scheduled drift detection job opens a GitHub issue when framework artifacts diverge from edulution-ui source
   **Plans**: 1 plan

Plans:

- [x] 02-01-PLAN.md -- Create sync-framework.yml workflow with swagger and styling sync jobs (SYNC-04 deferred)

### Phase 3: CLI Scaffolding

**Goal**: A developer can run an interactive CLI command and get a working, edulution-styled project with their chosen pre-configurations
**Depends on**: Phase 2
**Requirements**: CLI-01, CLI-02, CLI-03, CLI-04, CLI-05, CLI-06, CLI-07, CLI-08
**Success Criteria** (what must be TRUE):

1. Running the CLI presents interactive prompts for project type (custom React app or styled page) and configuration choices (Tailwind, API client, auth, tests)
2. Scaffolded React custom app is immediately runnable with `npm install && npm run dev` and displays edulution-themed styling
3. Scaffolded styled HTML page includes Tailwind config with edulution design tokens and builds CSS correctly
4. When API client is selected, scaffolded project has axios/eduApi pre-configured to talk to edulution backend
5. When auth is selected, scaffolded project has SSO flow pre-wired for same-origin edulution API access
   **Plans**: 4 plans

Plans:

- [ ] 03-00-PLAN.md -- Wave 0: Test infrastructure (vitest.config.ts + 8 test spec scaffolds)
- [ ] 03-01-PLAN.md -- CLI package setup, interactive prompts, scaffold engine, and post-scaffold automation
- [ ] 03-02-PLAN.md -- Custom React App templates (base + Tailwind, API client, Auth, Tests feature overlays)
- [ ] 03-03-PLAN.md -- Styled HTML Page templates (base + Tailwind theme, API client, Auth feature overlays)

### Phase 4: Workflow Documentation

**Goal**: An AI coding tool can follow structured guides to create a complete new app or add a feature to an existing app, prompting the user for decisions along the way
**Depends on**: Phase 3
**Requirements**: WKFL-01, WKFL-02, WKFL-03, WKFL-04
**Success Criteria** (what must be TRUE):

1. A "new app" workflow guide exists that an AI tool can follow end-to-end to create a custom app from scratch
2. An "add feature" workflow guide exists that an AI tool can follow to add a page or feature to an existing app
3. Both guides instruct the AI to prompt the user for clarification at decision points rather than making assumptions
4. Guides reference the setup script as a prerequisite and explain which .md files apply in which context
   **Plans**: TBD

Plans:

- [ ] 04-01: TBD

### Phase 5: Dog-Fooding

**Goal**: edulution-ui itself consumes the framework as a submodule, proving the framework is complete enough to replace inline conventions
**Depends on**: Phase 4
**Requirements**: DOG-01, DOG-02, DOG-03
**Success Criteria** (what must be TRUE):

1. edulution-ui has the framework repo as a git submodule at root level (`edulution-ai-framework/`)
2. edulution-ui's inline AGENTS.md is removed and replaced by the framework's layered files (edulution-ui project-type layer)
3. CLAUDE.md in edulution-ui references the framework's AGENTS.md via the submodule path and AI tools can discover conventions correctly
   **Plans**: TBD

Plans:

- [ ] 05-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase                     | Plans Complete | Status      | Completed  |
| ------------------------- | -------------- | ----------- | ---------- |
| 1. Foundation             | 3/3            | Complete    | 2026-03-09 |
| 2. CI Sync Pipeline       | 1/1            | Complete    | 2026-03-09 |
| 3. CLI Scaffolding        | 0/4            | Not started | -          |
| 4. Workflow Documentation | 0/?            | Not started | -          |
| 5. Dog-Fooding            | 0/?            | Not started | -          |
