# Architecture Patterns

**Domain:** AI Coding Context Framework (reusable, submodule-distributed)
**Researched:** 2026-03-09

## Recommended Architecture

The framework is a standalone Git repository (`edulution-ai-framework`) consumed as a submodule. It has four logical layers: the markdown context layer (what AI tools read), the synced artifacts layer (auto-updated from edulution-ui), the CLI scaffolding layer (what developers invoke), and the template layer (project blueprints).

### Repository Directory Structure

```
edulution-ai-framework/
|
|-- AGENTS.md                      # Root: universal conventions (all project types)
|-- VERSION                        # Semver file (e.g., "1.2.0")
|-- package.json                   # CLI dependencies (inquirer, etc.)
|
|-- layers/                        # Project-type-specific AGENTS.md overrides
|   |-- edulution-ui/
|   |   +-- AGENTS.md              # Nx monorepo, NestJS API, full frontend patterns
|   |-- custom-app/
|   |   +-- AGENTS.md              # Standalone React app conventions
|   +-- styled-page/
|       +-- AGENTS.md              # HTML/CSS/JS page conventions (no React/TS required)
|
|-- artifacts/                     # CI-synced files from edulution-ui (never hand-edited)
|   |-- swagger-spec.json          # Full OpenAPI spec
|   |-- tailwind.config.ts         # Base ui-kit tailwind config
|   |-- tailwind.extend.ts         # Frontend-specific tailwind extensions (colors, fonts)
|   +-- .sync-metadata.json        # Sync timestamp, source commit SHA, edulution-ui version
|
|-- cli/                           # Setup script (Node.js)
|   |-- index.ts                   # Entry point: interactive prompts
|   |-- scaffolder.ts              # Project generation logic
|   |-- prompts.ts                 # Inquirer prompt definitions
|   +-- utils.ts                   # File copy, template rendering, git init helpers
|
|-- templates/                     # Project scaffolding templates
|   |-- custom-app/                # Vite+React+TS starter
|   |   |-- package.json.tmpl
|   |   |-- vite.config.ts.tmpl
|   |   |-- tsconfig.json.tmpl
|   |   |-- src/
|   |   |   |-- main.tsx.tmpl
|   |   |   +-- App.tsx.tmpl
|   |   +-- tailwind.config.ts.tmpl
|   +-- styled-page/               # Plain HTML + Tailwind CSS starter
|       |-- index.html.tmpl
|       |-- tailwind.config.ts.tmpl
|       +-- src/
|           +-- styles.css.tmpl
|
|-- workflows/                     # AI workflow guides (not code, markdown)
|   |-- new-app.md                 # "Create a new edulution-compatible app from scratch"
|   +-- add-feature.md             # "Add a page/feature to an existing app"
|
+-- docs/                          # Human-readable docs
    |-- COMPATIBILITY.md           # Which framework versions work with which edulution versions
    +-- SUBMODULE-SETUP.md         # How to add the submodule to a consuming project
```

### Component Boundaries

| Component      | Responsibility                                            | Communicates With                                          | Edited By                       |
| -------------- | --------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------- |
| Root AGENTS.md | Universal coding conventions, design tokens, API patterns | Read by AI tools; extended by layer AGENTS.md files        | Developers (manual)             |
| layers/\*.md   | Project-type-specific rules that override/extend root     | Read by AI tools alongside root AGENTS.md                  | Developers (manual)             |
| artifacts/     | Synced copies of edulution-ui files                       | Read by templates and layer docs; written by CI            | CI pipeline only (never manual) |
| cli/           | Interactive project scaffolding                           | Reads templates/ and artifacts/; writes to user filesystem | Developers (manual)             |
| templates/     | Starter project blueprints with placeholders              | Read by cli/scaffolder.ts                                  | Developers (manual)             |
| workflows/     | Step-by-step guides for AI to follow                      | Read by AI tools when user invokes a workflow              | Developers (manual)             |
| VERSION        | Framework version tracking                                | Read by cli/ for stamping generated projects               | Release process                 |

### Data Flow

```
                    edulution-ui (source of truth)
                           |
                    [GitHub Actions CI]
                    (on merge to dev/main)
                           |
                           v
              edulution-ai-framework/artifacts/
              (swagger-spec.json, tailwind configs)
                           |
            +--------------+--------------+
            |              |              |
            v              v              v
      Root AGENTS.md   layers/         templates/
      (references      (reference      (use artifacts
       artifacts)       artifacts)      for scaffolding)
            |              |              |
            +--------------+--------------+
                           |
                    [consumed as git submodule]
                           |
            +--------------+--------------+
            |              |              |
            v              v              v
      edulution-ui    Custom React    Styled HTML
      (dog-food)      App Project     Page Project
```

## How Layered .md Files Compose

AGENTS.md uses filesystem-based inheritance. AI tools (Claude, Cursor, Copilot, Codex) read the root AGENTS.md first, then merge any AGENTS.md closer to the file being edited. The framework exploits this by structuring layers as subdirectories.

### Composition Model

```
When an AI tool works on a file in a consuming project:

1. Reads: edulution-ai-framework/AGENTS.md           (always -- universal rules)
2. Reads: edulution-ai-framework/layers/{type}/AGENTS.md  (project-type-specific)

The consuming project activates the correct layer via a symlink or explicit include:

  # In consuming project root:
  edulution-ai-framework/    (submodule)
  AGENTS.md                  (project's own, references framework)
```

### Activation Mechanism

The consuming project's root AGENTS.md should reference the framework. Two approaches, use the simpler one:

**Approach A -- Symlink (recommended for edulution-ui):**
The consuming project's `AGENTS.md` is a symlink to `edulution-ai-framework/layers/edulution-ui/AGENTS.md`. The root `edulution-ai-framework/AGENTS.md` is picked up automatically by directory traversal.

**Approach B -- Explicit include (recommended for new projects):**
The CLI scaffolder generates an `AGENTS.md` at the project root that starts with:

```markdown
@edulution-ai-framework/AGENTS.md
@edulution-ai-framework/layers/custom-app/AGENTS.md
```

This makes the layering explicit and does not rely on symlink support.

### Layer Content Strategy

| Layer              | Contains                                                                                                                        | Does NOT Contain                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Root AGENTS.md     | Code style (TypeScript, naming), API patterns (eduApi, axios), design tokens, component conventions, icon library, import rules | Framework-specific build commands, Nx rules |
| edulution-ui layer | Nx workspace rules, NestJS patterns, monorepo structure, migration rules, pre-commit hooks                                      | Standalone app setup                        |
| custom-app layer   | Vite standalone setup, auth integration (SSO), ui-kit usage, deployment patterns                                                | NestJS, Nx, migration rules                 |
| styled-page layer  | Tailwind-only usage, no React/TS assumptions, CSS custom properties                                                             | React components, TypeScript, API patterns  |

### What Gets Extracted from Current AGENTS.md

The current 66-line AGENTS.md in edulution-ui contains mixed concerns. It should be split:

| Current Section                                              | Target Location                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| Project Structure and Module Organization                    | layers/edulution-ui/AGENTS.md                                       |
| Build, Test, and Development Commands                        | layers/edulution-ui/AGENTS.md                                       |
| Coding Style and Naming Conventions (general TS/React rules) | Root AGENTS.md                                                      |
| Coding Style (NestJS Logger, Nx-specific)                    | layers/edulution-ui/AGENTS.md                                       |
| Coding Style (eduApi, zustand stores, cn())                  | Root AGENTS.md (shared across custom apps)                          |
| Testing Guidelines                                           | Split: general in root, jest/vitest specifics in edulution-ui layer |
| Commit and PR Guidelines                                     | Root AGENTS.md                                                      |
| Security and Configuration Tips                              | Root AGENTS.md                                                      |

## Git Submodule Integration Pattern

### In Consuming Projects

```bash
# Adding the framework to a new or existing project
git submodule add git@github.com:edulution-io/edulution-ai-framework.git edulution-ai-framework

# Result in .gitmodules:
[submodule "edulution-ai-framework"]
    path = edulution-ai-framework
    url = git@github.com:edulution-io/edulution-ai-framework.git
    branch = main
```

### Submodule Update Flow

```
Developer clones consuming project
    |
    v
git submodule update --init        # Gets framework at pinned commit
    |
    v
Framework files available at edulution-ai-framework/
    |
    v
AI tools read AGENTS.md files from framework directory
```

### Version Pinning

Each consuming project pins to a specific framework commit via the submodule reference. Updates are explicit:

```bash
cd edulution-ai-framework
git pull origin main
cd ..
git add edulution-ai-framework
git commit -m "Update AI framework to v1.3.0"
```

This is intentional -- consuming projects control when they adopt framework changes, preventing breaking changes from propagating automatically.

### Privacy Model

The submodule entry in `.gitmodules` references a private GitHub URL. Public repos can contain this reference without leaking content -- cloning without access to the private repo simply skips the submodule. The `.gitmodules` file reveals only that a submodule exists and its URL, not its contents.

## CI Sync Pipeline (edulution-ui to framework repo)

### Architecture

```
edulution-ui repo                          edulution-ai-framework repo
+----------------------------------+       +---------------------------+
|                                  |       |                           |
|  .github/workflows/              |       |  artifacts/               |
|    sync-ai-framework.yml         |       |    swagger-spec.json      |
|                                  |       |    tailwind.config.ts     |
|  swagger-spec.json        -------)-------)-->  tailwind.extend.ts    |
|  libs/ui-kit/tailwind.config.ts  |       |    .sync-metadata.json    |
|  apps/frontend/tailwind.config.ts|       |                           |
|                                  |       +---------------------------+
+----------------------------------+
```

### Workflow Design

The sync workflow in edulution-ui triggers on merge to `dev` or `main`. It uses a fine-grained Personal Access Token (PAT) stored as a repository secret, scoped to only the framework repo with `contents: write` permission.

**Recommended approach -- direct git push (not repository_dispatch):**

```yaml
# .github/workflows/sync-ai-framework.yml (in edulution-ui)
name: Sync AI Framework Artifacts

on:
  push:
    branches: [dev, main]
    paths:
      - 'swagger-spec.json'
      - 'libs/ui-kit/tailwind.config.ts'
      - 'apps/frontend/tailwind.config.ts'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Clone framework repo
        run: |
          git clone https://x-access-token:${{ secrets.FRAMEWORK_PAT }}@github.com/edulution-io/edulution-ai-framework.git framework-target

      - name: Copy artifacts
        run: |
          cp swagger-spec.json framework-target/artifacts/
          cp libs/ui-kit/tailwind.config.ts framework-target/artifacts/tailwind.config.ts
          cp apps/frontend/tailwind.config.ts framework-target/artifacts/tailwind.extend.ts
          echo '{"synced_at":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","source_sha":"${{ github.sha }}"}' > framework-target/artifacts/.sync-metadata.json

      - name: Commit and push
        working-directory: framework-target
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add artifacts/
          git diff --staged --quiet || git commit -m "Sync artifacts from edulution-ui@${{ github.sha }}"
          git push
```

**Why direct push over repository_dispatch:** Simpler, fewer moving parts. The sync is a copy operation, not a build. Using `repository_dispatch` would require a receiving workflow in the framework repo that clones edulution-ui back -- circular and unnecessary.

**Path filtering** ensures the workflow only runs when relevant files actually change, not on every merge.

### Sync Metadata

The `.sync-metadata.json` file tracks provenance:

```json
{
  "synced_at": "2026-03-09T14:30:00Z",
  "source_sha": "abc123def456",
  "edulution_ui_branch": "dev"
}
```

This lets the framework (and AI tools reading it) know how fresh the artifacts are.

## Patterns to Follow

### Pattern 1: Artifacts as Read-Only Layer

**What:** Files in `artifacts/` are never edited manually. They are overwritten by CI.
**When:** Always -- this is a hard boundary.
**Why:** Prevents drift between edulution-ui and the framework. A developer who edits `artifacts/swagger-spec.json` will have their changes silently overwritten on next sync.
**Enforcement:** Add a note in AGENTS.md: "Files in artifacts/ are CI-managed. Do not edit manually."

### Pattern 2: Template Interpolation via Simple Markers

**What:** Templates use `{{variable}}` markers replaced by the CLI scaffolder. No complex template engine.
**When:** Generating new projects.
**Example:**

```typescript
// templates/custom-app/package.json.tmpl
{
  "name": "{{projectName}}",
  "version": "0.1.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  }
}
```

**Why:** Keeps templates readable. Developers can open `.tmpl` files and understand the output. Avoids a dependency on Handlebars/EJS for what amounts to string replacement.

### Pattern 3: Workflow Guides as Structured Prompts

**What:** Workflow markdown files (`workflows/new-app.md`, `workflows/add-feature.md`) are structured as step-by-step instructions that AI tools follow, with explicit decision points where AI should ask the user.
**When:** User tells AI "create a new edulution app" or "add a feature."
**Why:** AI tools work best with structured, sequential instructions. Decision points prevent AI from making assumptions.

### Pattern 4: CLAUDE.md as Pointer Only

**What:** In consuming projects, `CLAUDE.md` contains only `@AGENTS.md` (or `@edulution-ai-framework/AGENTS.md`).
**When:** Always.
**Why:** Maintains AI-agnostic stance. AGENTS.md is the canonical file. Claude reads it via the `@` reference. Other tools read AGENTS.md directly.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Duplicating Conventions Across Layers

**What:** Copying the same rule into root AGENTS.md and a layer file.
**Why bad:** Drift. When a convention changes, it must be updated in multiple places.
**Instead:** Put shared rules in root only. Layers only contain additions or overrides specific to that project type.

### Anti-Pattern 2: CI Sync of Generated/Derived Files

**What:** Syncing build outputs, compiled CSS, or generated types via CI.
**Why bad:** Bloats the framework repo. Build outputs change frequently and create noisy diffs.
**Instead:** Sync only source files (tailwind config, swagger spec). Let consuming projects build from these.

### Anti-Pattern 3: Deep Submodule Nesting

**What:** Having consuming projects that are themselves submodules of other projects, creating nested submodule chains.
**Why bad:** `git submodule update --init --recursive` becomes fragile. Developers forget to update.
**Instead:** Framework is always a direct, single-level submodule of the consuming project.

### Anti-Pattern 4: Using the Framework Submodule for Runtime Code

**What:** Importing TypeScript/JavaScript from `edulution-ai-framework/` at build time.
**Why bad:** The framework is a development context tool, not a library. Mixing these concerns creates coupling.
**Instead:** Runtime shared code belongs in ui-kit (npm package). The framework provides conventions and templates only.

## Suggested Build Order (Dependencies Between Components)

The build order reflects what must exist before the next component can be developed:

```
Phase 1: Root AGENTS.md + layers/
    |     (Extract and split current AGENTS.md)
    |     No dependencies. This is the foundation.
    |
Phase 2: Git submodule integration
    |     (Set up framework repo, add as submodule to edulution-ui)
    |     Depends on: Phase 1 (need content to integrate)
    |
Phase 3: CI sync pipeline
    |     (GitHub Actions workflow in edulution-ui)
    |     Depends on: Phase 2 (framework repo must exist to push to)
    |
Phase 4: Templates
    |     (Project blueprints in templates/)
    |     Depends on: Phase 3 (templates reference synced artifacts)
    |
Phase 5: CLI scaffolder
    |     (Interactive setup script)
    |     Depends on: Phase 4 (scaffolder renders templates)
    |
Phase 6: Workflow guides
          (AI workflow documentation)
          Depends on: Phase 5 (guides reference scaffolding steps)
          Can start in parallel with Phase 4-5 for the content writing.
```

**Critical path:** Phases 1-2-3 are sequential and blocking. Phases 4-6 have some parallelism.

**The most important architectural decision is the layer split (Phase 1).** Getting the content boundaries wrong means every subsequent phase builds on a flawed foundation. Spend time here.

## Scalability Considerations

| Concern              | Now (3 project types) | At 10 project types         | At 20+ project types                                          |
| -------------------- | --------------------- | --------------------------- | ------------------------------------------------------------- |
| Layer management     | Manual, 3 directories | Still manageable manually   | Need layer composition (base layers that other layers extend) |
| Template maintenance | 2 templates           | Template inheritance needed | Template engine with partials                                 |
| CI sync              | Single workflow       | Multiple artifact sources   | Consider artifact registry or release-based sync              |
| AGENTS.md size       | ~100 lines root       | Risk of bloat               | Split into topic files within each layer directory            |

For the foreseeable scope (3 project types, internal team), the flat structure described above is appropriate. Do not over-engineer for scale that may never come.

## Sources

- [AGENTS.md specification](https://agents.md/) -- official format and hierarchical structure (HIGH confidence)
- [AGENTS.md GitHub repo](https://github.com/agentsmd/agents.md) -- open standard under Linux Foundation (HIGH confidence)
- [OpenAI Codex AGENTS.md guide](https://developers.openai.com/codex/guides/agents-md/) -- cascading rules and override semantics (HIGH confidence)
- [GitLab AGENTS.md customization](https://docs.gitlab.com/user/duo_agent_platform/customize/agents_md/) -- directory-level inheritance behavior (HIGH confidence)
- [Cross-repo GitHub Actions patterns](https://some-natalie.dev/blog/multi-repo-actions/) -- push commits to another repository (MEDIUM confidence)
- [Repo File Sync Action](https://github.com/marketplace/actions/repo-file-sync-action) -- marketplace action for file sync (MEDIUM confidence)
- [Unifying AI skills across tools](https://yozhef.medium.com/unifying-ai-skills-across-cursor-and-claude-code-3c34c44eafd2) -- symlink strategy for multi-tool support (MEDIUM confidence)
- [Builder.io AGENTS.md guide](https://www.builder.io/blog/agents-md) -- best practices for layered AGENTS.md (MEDIUM confidence)
- Existing edulution-ui codebase -- AGENTS.md, tailwind configs, swagger spec (HIGH confidence, direct inspection)
