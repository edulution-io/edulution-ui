# Phase 1: Foundation - Research

**Researched:** 2026-03-09
**Domain:** AGENTS.md layered convention system, Git submodule infrastructure, GitHub composite actions
**Confidence:** HIGH

## Summary

Phase 1 creates a new private GitHub repository (`edulution-ai-framework`) in the `edulution-io` org, populates it with a layered AGENTS.md convention system split across three project types, and ships a composite GitHub Action for private submodule authentication in consumer CI pipelines. The existing edulution-ui AGENTS.md (66 lines) is the content source -- it must be decomposed into a universal base layer, a shared TypeScript layer, and three project-type layers (edulution-ui, custom-app, styled-page) with no single file exceeding 150 lines.

The AGENTS.md specification is well-established (20+ AI tools support it) and uses a nearest-file-wins discovery model: AI tools walk the directory tree from the file being edited upward, loading the closest AGENTS.md they find. This means the framework repo's directory structure IS the inheritance mechanism -- placing AGENTS.md files at different directory depths creates automatic layering with zero consumer configuration.

The GitHub composite action pattern for private submodule checkout is straightforward: a fine-grained PAT or SSH deploy key stored as a repo secret, passed to `actions/checkout@v5` with `submodules: 'recursive'`. The composite action wraps this into a reusable `action.yml` that consumers reference in their workflows.

**Primary recommendation:** Structure the framework repo so each project-type is a top-level directory containing its own AGENTS.md. The root AGENTS.md carries universal conventions. When a consumer adds the framework as a submodule and works within a project-type directory, AI tools automatically pick up both the type-specific and root conventions.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Base AGENTS.md is minimal: design tokens, commit/PR conventions, security tips, and general project guidelines that apply regardless of language
- TypeScript coding conventions (no comments, default exports, const objects over enums, etc.) go in a shared TS-specific section, NOT the universal base -- styled pages may not use TypeScript
- Git rules (commit style, branch naming, PR guidelines, don't commit secrets) are universal base
- NestJS patterns, Nx workspace rules, and full-stack conventions are edulution-ui layer only
- Custom apps import from @edulution-io/ui-kit directly (Button, cn, etc.) -- do NOT recreate the SH wrapper pattern from edulution-ui
- Same ESLint (Airbnb+TS) and Prettier (2 spaces, 120 cols, single quotes) configuration as edulution-ui
- i18n is optional -- offered as a scaffold choice but not required or documented as convention
- State management: Zustand recommended but not enforced -- no preference on patterns
- Styled pages support both static info pages and interactive widgets (forms, small tools)
- Full branding: design tokens + font references + favicon + logo assets -- pages should look unmistakably like edulution
- Consumer has a root AGENTS.md (or CLAUDE.md) that references `@edulution-ai-framework/AGENTS.md` -- layer is auto-discovered by directory placement per AGENTS.md spec
- Framework includes both a README.md (what it is, quick start) and a detailed integration guide (how to add submodule, configure CI, choose layer)
- AGENTS.md files contain conventions only -- no "getting started" sections (keeps line budget focused)
- No example CLAUDE.md files shipped -- pattern documented in integration guide, CLI generates pointer automatically in Phase 3

### Claude's Discretion

- API client approach for custom apps (eduApi reuse vs own axios instance)
- Project structure for custom apps (mirror edulution-ui layout vs simplified)
- CSS methodology for styled pages (Tailwind-only vs allowing custom CSS)
- JavaScript guidance level for styled pages (minimal vanilla JS guidance vs none)

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                                                                               | Research Support                                                                                                            |
| ------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| CTX-01  | Base AGENTS.md with shared conventions (design tokens, API patterns, component usage)     | Content extraction from existing AGENTS.md + index.scss design tokens; architecture pattern for base layer documented below |
| CTX-02  | Project-type layer for edulution-ui (core) with NestJS, Nx, full-stack conventions        | NestJS/Nx conventions already in existing AGENTS.md lines 22-48; layer placement in `edulution-ui/AGENTS.md`                |
| CTX-03  | Project-type layer for custom React apps with Vite+TS, ui-kit, API client conventions     | ui-kit exports (Button, cn) documented; custom-app layer at `custom-app/AGENTS.md`                                          |
| CTX-04  | Project-type layer for styled HTML/CSS/JS pages with Tailwind-only conventions            | Design tokens extracted from index.scss; Tailwind config from ui-kit base config; layer at `styled-page/AGENTS.md`          |
| CTX-05  | Layers compose via AGENTS.md spec filesystem inheritance (directory-based auto-discovery) | AGENTS.md spec confirmed: nearest-file-wins traversal; 20+ tools support it; directory structure IS inheritance             |
| CTX-06  | Each .md file stays under 150 lines to prevent AI context degradation                     | Line budget analysis below; existing AGENTS.md is 66 lines -- splitting across 5+ files keeps each well under 150           |
| REPO-01 | Framework repo created on GitHub (edulution-io org, private)                              | Org confirmed as `edulution-io` on GitHub; repo creation is a manual step or `gh repo create`                               |
| REPO-02 | Repo has documented directory structure with clear component boundaries                   | Directory structure pattern documented below with rationale                                                                 |
| REPO-03 | Integration guide for adding framework as git submodule at root level                     | Submodule workflow steps documented; guide goes in `docs/integration-guide.md`                                              |
| REPO-04 | Reusable composite GitHub Action for private submodule auth in consumer CI                | Two auth methods researched (fine-grained PAT, SSH deploy key); composite action pattern documented below                   |

</phase_requirements>

## Standard Stack

### Core

| Tool             | Version         | Purpose                     | Why Standard                                                                                      |
| ---------------- | --------------- | --------------------------- | ------------------------------------------------------------------------------------------------- |
| AGENTS.md spec   | 1.0 (July 2025) | AI coding convention format | Supported by 20+ AI tools (Claude, Copilot, Cursor, Codex, etc.); filesystem inheritance built-in |
| GitHub Actions   | N/A             | CI/CD platform              | Already used by edulution-io org; composite actions enable reuse                                  |
| actions/checkout | v5.0.0          | Git checkout in CI          | Already used in edulution-ui workflows; supports `submodules` + `token` params                    |
| Git submodules   | N/A             | Framework distribution      | Locked decision; private repo reference reveals nothing in consumer repos                         |

### Supporting

| Tool             | Version | Purpose                       | When to Use                                                   |
| ---------------- | ------- | ----------------------------- | ------------------------------------------------------------- |
| `gh` CLI         | latest  | GitHub repo management        | Creating the framework repo, managing secrets                 |
| Fine-grained PAT | N/A     | CI auth for private submodule | Consumer CI needs to checkout the private framework submodule |

### Alternatives Considered

| Instead of       | Could Use                     | Tradeoff                                                                                                                            |
| ---------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Fine-grained PAT | SSH deploy keys               | Deploy keys are repo-scoped (more secure) but harder to manage across multiple consumers; PAT is simpler for org-internal use       |
| Fine-grained PAT | GitHub App installation token | Short-lived (expires in hours) so more secure, but significantly more setup complexity; overkill for org-internal private submodule |

## Architecture Patterns

### Recommended Repository Structure

```
edulution-ai-framework/
├── AGENTS.md                    # Base layer: universal conventions (~80-120 lines)
├── README.md                    # What this is, quick start
├── typescript/
│   └── AGENTS.md                # Shared TS conventions (~60-90 lines)
├── edulution-ui/
│   └── AGENTS.md                # Core monorepo: NestJS, Nx, full-stack (~80-120 lines)
├── custom-app/
│   └── AGENTS.md                # Custom React apps: Vite, ui-kit, API (~80-120 lines)
├── styled-page/
│   └── AGENTS.md                # Styled pages: Tailwind, branding (~60-90 lines)
├── docs/
│   ├── integration-guide.md     # How to add submodule, configure CI
│   └── layer-reference.md       # What each layer contains, when to use which
└── .github/
    └── actions/
        └── checkout-submodule/
            └── action.yml       # Composite action for private submodule auth
```

### Pattern 1: AGENTS.md Filesystem Inheritance

**What:** AI tools discover AGENTS.md files by walking the directory tree from the file being edited upward. The closest file wins, but tools may also load parent AGENTS.md files for additional context (tool-dependent behavior).

**When to use:** Always -- this is how the layered convention system works.

**How it works for consumers:**

```
my-custom-app/                          # Consumer repo root
├── CLAUDE.md                           # Contains: @edulution-ai-framework/custom-app/AGENTS.md
├── edulution-ai-framework/             # Git submodule
│   ├── AGENTS.md                       # Base conventions (auto-discovered)
│   ├── typescript/AGENTS.md            # TS conventions
│   └── custom-app/AGENTS.md           # Custom app conventions
└── src/
    └── App.tsx                         # When editing this, AI loads custom-app/AGENTS.md
```

The consumer's CLAUDE.md points to the relevant layer via `@` reference. The AGENTS.md spec's filesystem traversal handles the rest.

**Confidence:** HIGH -- AGENTS.md spec confirmed, edulution-ui already uses the `@AGENTS.md` pattern in CLAUDE.md.

### Pattern 2: Content Split Strategy

**What:** The existing AGENTS.md (66 lines) must be decomposed and expanded into multiple files. Content goes to the most general layer where it applies.

**Split mapping (from existing AGENTS.md sections):**

| Current Section                                                   | Target Layer                                    | Rationale                                 |
| ----------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------- |
| Project Structure & Module Organization                           | edulution-ui                                    | Nx-specific paths, apps/libs structure    |
| Build, Test, and Development Commands                             | edulution-ui                                    | npm scripts specific to monorepo          |
| Coding Style (general: file naming, no comments, default exports) | typescript                                      | Applies to edulution-ui AND custom-app    |
| Coding Style (React: arrow functions, cn(), no magic strings)     | typescript                                      | Applies wherever React+TS is used         |
| Coding Style (NestJS: Logger, eduApi in stores, migrations)       | edulution-ui                                    | Core-only patterns                        |
| Coding Style (ui-kit: SH wrappers, @radix-ui)                     | edulution-ui                                    | SH pattern is core-only per user decision |
| Testing Guidelines                                                | typescript (general) + edulution-ui (specifics) | Vitest/Jest split varies by project       |
| Commit & PR Guidelines                                            | base                                            | Universal git conventions                 |
| Security & Configuration Tips                                     | base                                            | Universal security practices              |

**New content to write (not in existing AGENTS.md):**

| Target Layer | Content                                                        | Source                                      |
| ------------ | -------------------------------------------------------------- | ------------------------------------------- |
| base         | Design tokens (CSS variables)                                  | `apps/frontend/src/index.scss` -- extracted |
| base         | Font: Lato, sans-serif                                         | `index.scss` html rule                      |
| base         | Brand colors: ci-light-green (#8fc046), ci-dark-blue (#0081c6) | `index.scss` :root vars                     |
| typescript   | ESLint config reference (Airbnb+TS, a11y, import)              | `.eslintrc.json`                            |
| typescript   | Prettier config reference (2 spaces, 120 cols, single quotes)  | `prettier.config.js`                        |
| custom-app   | Import from @edulution-io/ui-kit (Button, cn)                  | `libs/ui-kit/src/index.ts` exports          |
| custom-app   | Do NOT use SH wrapper pattern                                  | User decision                               |
| styled-page  | Tailwind config with edulution theme                           | `libs/ui-kit/tailwind.config.ts`            |
| styled-page  | CSS variables (light/dark mode)                                | `index.scss` .light/.dark blocks            |
| styled-page  | Full branding: logo, favicon, font                             | User decision                               |

### Pattern 3: Composite GitHub Action for Submodule Auth

**What:** A reusable composite action that consumers add to their CI workflows to authenticate and checkout the private framework submodule.

**Structure:**

```yaml
# .github/actions/checkout-submodule/action.yml
name: 'Checkout with edulution-ai-framework'
description: 'Checks out the repo with the private edulution-ai-framework submodule'
inputs:
  token:
    description: 'GitHub PAT with read access to edulution-ai-framework repo'
    required: true
runs:
  using: 'composite'
  steps:
    - name: Checkout repository with submodules
      uses: actions/checkout@v5
      with:
        token: ${{ inputs.token }}
        submodules: 'recursive'
```

**Consumer usage:**

```yaml
steps:
  - name: Checkout
    uses: edulution-io/edulution-ai-framework/.github/actions/checkout-submodule@main
    with:
      token: ${{ secrets.FRAMEWORK_PAT }}
```

**Confidence:** HIGH -- `actions/checkout` with `token` and `submodules: 'recursive'` is the standard pattern. Verified against edulution-ui's existing `build-and-test.yml` which already uses `actions/checkout@v5.0.0`.

### Anti-Patterns to Avoid

- **Monolithic AGENTS.md:** Cramming all conventions into one file defeats the purpose of layers and risks exceeding the 150-line limit. Split by audience.
- **Duplicating conventions across layers:** If TypeScript rules appear in both edulution-ui AND custom-app layers, extract them to the typescript layer. DRY applies to conventions too.
- **Getting-started content in AGENTS.md:** User decision says conventions only. Setup instructions go in `docs/integration-guide.md`.
- **Hardcoding paths in AGENTS.md:** Layers should describe conventions, not file paths specific to the consumer project. Keep it portable.

## Don't Hand-Roll

| Problem                   | Don't Build                   | Use Instead                                                    | Why                                                                                  |
| ------------------------- | ----------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Private submodule CI auth | Custom git credential scripts | `actions/checkout@v5` with `token` + `submodules: 'recursive'` | Handles SSH/HTTPS translation, credential cleanup, recursive init automatically      |
| AGENTS.md inheritance     | Custom file-merging logic     | AGENTS.md spec directory-based discovery                       | AI tools already implement traversal; adding custom logic creates maintenance burden |
| Design token distribution | Manual token files            | Extract from `index.scss` CSS variables directly               | Single source of truth; CI sync (Phase 2) automates updates                          |

**Key insight:** The framework is a content project, not a code project. The "don't hand-roll" list is short because the primary deliverables are markdown files and a thin composite action wrapper. Resist the urge to build tooling -- that's Phase 3.

## Common Pitfalls

### Pitfall 1: AGENTS.md Discovery Varies by AI Tool

**What goes wrong:** Different AI tools implement AGENTS.md traversal slightly differently. Some load only the nearest file, others may walk up and merge multiple files. Claude Code loads CLAUDE.md hierarchically (local > project > global) and loads AGENTS.md per the spec.
**Why it happens:** The AGENTS.md spec is young (July 2025) and not all tools follow it identically.
**How to avoid:** Design layers to be self-contained within each project-type directory. The consumer's CLAUDE.md explicitly references the relevant layer via `@edulution-ai-framework/custom-app/AGENTS.md`. This works regardless of which traversal algorithm the tool uses.
**Warning signs:** AI tool produces code that follows base conventions but ignores project-type conventions.

### Pitfall 2: 150-Line Limit Creates Incomplete Conventions

**What goes wrong:** Trying to compress rich conventions into 150 lines leads to vague, unhelpful rules that AI tools can't act on.
**Why it happens:** The limit is per-file, not per-layer. People try to cram everything into one file.
**How to avoid:** Use the split strategy. With 5+ AGENTS.md files, each file gets ~80-120 lines of focused content. That's plenty for conventions. Keep each file focused on one audience.
**Warning signs:** Conventions that say "follow best practices" instead of giving specific rules.

### Pitfall 3: Fine-Grained PAT Scope Too Broad

**What goes wrong:** Creating a PAT with access to all org repos when it only needs access to the framework repo.
**Why it happens:** Fine-grained PATs default to "all repositories" if not explicitly scoped.
**How to avoid:** When creating the PAT: scope it to only `edulution-ai-framework` repo, grant only "Contents: Read-only" and "Metadata: Read-only" permissions, set maximum expiration (1 year), and document rotation schedule.
**Warning signs:** PAT can push to repos or access repos it shouldn't.

### Pitfall 4: Submodule Path Mismatch

**What goes wrong:** Consumer adds the submodule at a non-root path (e.g., `.vendor/edulution-ai-framework/`) and `@` references in CLAUDE.md break.
**Why it happens:** No convention enforced for submodule path.
**How to avoid:** Integration guide must specify: always add at repo root as `edulution-ai-framework/`. The composite action, documentation, and CLAUDE.md pointer all assume this path.
**Warning signs:** `@edulution-ai-framework/AGENTS.md` returns "file not found."

### Pitfall 5: CSS Variable Names Drift Between Source and Framework

**What goes wrong:** Design tokens in the framework's AGENTS.md reference variable names that no longer exist in edulution-ui.
**Why it happens:** Someone renames a CSS variable in `index.scss` but the framework isn't updated.
**How to avoid:** This is Phase 2's CI sync problem. For Phase 1, document tokens as-is from the current `index.scss` and note that automated sync will keep them current.
**Warning signs:** Styled pages reference `--primary` but the actual variable is named differently.

## Code Examples

### Consumer CLAUDE.md Pointer Pattern

```markdown
@edulution-ai-framework/custom-app/AGENTS.md
```

This is the complete CLAUDE.md content for a custom app consumer. The `@` reference tells Claude Code to load the specified file. The AGENTS.md spec filesystem traversal handles loading the base layer.

Source: Existing pattern in edulution-ui's CLAUDE.md (`@AGENTS.md`).

### Composite Action Usage in Consumer Workflow

```yaml
name: Build and Test
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  build:
    runs-on: ubuntu-24.04
    steps:
      - name: Checkout with framework submodule
        uses: edulution-io/edulution-ai-framework/.github/actions/checkout-submodule@main
        with:
          token: ${{ secrets.FRAMEWORK_PAT }}

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 22.x

      - name: Install and build
        run: npm ci && npm run build
```

Source: Adapted from edulution-ui's `build-and-test.yml` with submodule auth added.

### Design Token Documentation Pattern (for base AGENTS.md)

```markdown
## Design Tokens

Brand: `--ci-light-green: #8fc046`, `--ci-dark-blue: #0081c6`
Font: Lato, sans-serif
Radius: `--radius: 0.25rem`

Semantic colors use CSS custom properties that swap between light/dark themes:
`--background`, `--foreground`, `--primary`, `--secondary`, `--muted`,
`--accent`, `--destructive`, `--border`, `--ring`, `--input`,
`--card`, `--popover`, `--overlay`

Each has a `-foreground` variant. Theme class `.dark` or `.light` on `<html>`.
```

Source: Extracted from `apps/frontend/src/index.scss` and `libs/ui-kit/tailwind.config.ts`.

## State of the Art

| Old Approach                                                      | Current Approach                                   | When Changed | Impact                                         |
| ----------------------------------------------------------------- | -------------------------------------------------- | ------------ | ---------------------------------------------- |
| `.cursorrules`, `.windsurfrules`, `CLAUDE.md` (separate per tool) | `AGENTS.md` (single spec, 20+ tools)               | July 2025    | Write conventions once, all AI tools read them |
| Classic PATs (full repo scope)                                    | Fine-grained PATs (repo-scoped, permission-scoped) | 2023         | Least-privilege for CI submodule access        |
| `actions/checkout@v4`                                             | `actions/checkout@v5`                              | 2024         | Already used in edulution-ui workflows         |

**Deprecated/outdated:**

- `.cursorrules`: Cursor-specific; superseded by AGENTS.md for cross-tool compatibility
- Classic PATs: Still work but fine-grained PATs are recommended for security

## Claude's Discretion Recommendations

### API Client for Custom Apps

**Recommendation:** Own axios instance, not eduApi reuse.

Rationale: `eduApi` is tightly coupled to edulution-ui's store patterns (Zustand stores with `handleApiError`). Custom apps may have different state management or error handling. Provide a pattern for creating a configured axios instance that targets the same edulution backend, but let the custom app own its client setup.

**Confidence:** MEDIUM -- depends on whether custom apps always coexist with edulution-ui or can run standalone.

### Project Structure for Custom Apps

**Recommendation:** Simplified flat structure, not mirroring edulution-ui.

```
src/
├── components/     # React components
├── pages/          # Route-level components
├── store/          # Zustand stores (if used)
├── api/            # API client setup
├── types/          # TypeScript types
└── App.tsx         # Entry point
```

Rationale: edulution-ui's structure (apps/frontend, apps/api, libs) is driven by Nx monorepo needs. Custom apps are standalone Vite+React projects and don't need that complexity.

**Confidence:** HIGH -- standard Vite+React project structure.

### CSS Methodology for Styled Pages

**Recommendation:** Tailwind-only with edulution's preset config. Allow custom CSS only for edge cases (e.g., print styles).

Rationale: Tailwind provides the design token integration through the config. Custom CSS risks brand drift. The convention should say "use Tailwind utility classes" and the preset config handles colors, spacing, and typography.

**Confidence:** HIGH -- aligns with user's "Tailwind-based" direction.

### JavaScript Guidance for Styled Pages

**Recommendation:** Minimal vanilla JS guidance.

Include: "Use `<script>` tags for interactive widgets. Keep JavaScript minimal and focused on DOM manipulation. No build step required for JS -- Tailwind handles CSS builds." This covers the "interactive widgets (forms, small tools)" use case without over-specifying.

**Confidence:** MEDIUM -- depends on how complex styled page widgets actually get.

## Open Questions

1. **GitHub repo creation: manual or automated?**
   - What we know: The repo must be private in edulution-io org.
   - What's unclear: Whether the planner should include a `gh repo create` step or assume the repo already exists.
   - Recommendation: Include a task for `gh repo create` since it's quick and ensures the correct settings (private, org, description). The executor needs appropriate org permissions.

2. **AGENTS.md traversal for submodule directories**
   - What we know: AI tools traverse upward from the file being edited. The submodule is at `edulution-ai-framework/` in the consumer root.
   - What's unclear: Whether AI tools traverse INTO submodule directories when a consumer's CLAUDE.md uses `@edulution-ai-framework/custom-app/AGENTS.md`. Claude Code's `@` reference loads the file directly, so this should work.
   - Recommendation: Rely on explicit `@` references in the consumer's CLAUDE.md rather than depending on automatic directory traversal into the submodule. This is the safest cross-tool approach.

3. **TypeScript layer: separate directory or inline reference?**
   - What we know: User decided TS conventions go in a shared section, not in the universal base.
   - What's unclear: Whether `typescript/AGENTS.md` should be a standalone file that edulution-ui and custom-app layers reference via `@../typescript/AGENTS.md`, or whether TS conventions should be inlined into each consuming layer.
   - Recommendation: Standalone `typescript/AGENTS.md` file. Both edulution-ui and custom-app AGENTS.md files reference it. This avoids duplication and keeps each file under 150 lines.

## Line Budget Analysis

Estimated line counts for each AGENTS.md file:

| File                     | Content                                                                                 | Estimated Lines | Under 150? |
| ------------------------ | --------------------------------------------------------------------------------------- | --------------- | ---------- |
| Root `AGENTS.md`         | Design tokens, brand, git conventions, security, general guidelines                     | ~80-100         | Yes        |
| `typescript/AGENTS.md`   | Coding style, ESLint/Prettier config, naming, exports, testing patterns                 | ~70-90          | Yes        |
| `edulution-ui/AGENTS.md` | NestJS patterns, Nx workspace, monorepo structure, build commands, full-stack specifics | ~90-120         | Yes        |
| `custom-app/AGENTS.md`   | Vite+React setup, ui-kit imports, project structure, API client                         | ~70-90          | Yes        |
| `styled-page/AGENTS.md`  | Tailwind config, CSS variables, branding assets, HTML structure                         | ~60-80          | Yes        |

**Total convention content:** ~370-480 lines across 5 files. Current AGENTS.md is 66 lines but covers only edulution-ui. The expansion is expected -- three new project types plus design tokens that were never documented.

## Validation Architecture

### Test Framework

| Property           | Value                                                          |
| ------------------ | -------------------------------------------------------------- |
| Framework          | Manual validation (content project, not code)                  |
| Config file        | none                                                           |
| Quick run command  | `wc -l edulution-ai-framework/**/*.md` (line count check)      |
| Full suite command | Manual review of all AGENTS.md files + composite action syntax |

### Phase Requirements to Test Map

| Req ID  | Behavior                                        | Test Type | Automated Command                                                                                                                        | File Exists? |
| ------- | ----------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| CTX-01  | Base AGENTS.md contains shared conventions      | manual    | `wc -l AGENTS.md` + content review                                                                                                       | Wave 0       |
| CTX-02  | edulution-ui layer has NestJS/Nx conventions    | manual    | `wc -l edulution-ui/AGENTS.md` + content review                                                                                          | Wave 0       |
| CTX-03  | custom-app layer has Vite+TS/ui-kit conventions | manual    | `wc -l custom-app/AGENTS.md` + content review                                                                                            | Wave 0       |
| CTX-04  | styled-page layer has Tailwind conventions      | manual    | `wc -l styled-page/AGENTS.md` + content review                                                                                           | Wave 0       |
| CTX-05  | Layers compose via filesystem inheritance       | manual    | Verify directory structure matches AGENTS.md spec pattern                                                                                | Wave 0       |
| CTX-06  | No .md file exceeds 150 lines                   | smoke     | `find . -name "AGENTS.md" -exec sh -c 'lines=$(wc -l < "$1"); if [ "$lines" -gt 150 ]; then echo "FAIL: $1 ($lines lines)"; fi' _ {} \;` | Wave 0       |
| REPO-01 | Framework repo exists on GitHub                 | smoke     | `gh repo view edulution-io/edulution-ai-framework`                                                                                       | Wave 0       |
| REPO-02 | Documented directory structure                  | manual    | Review README.md structure documentation                                                                                                 | Wave 0       |
| REPO-03 | Integration guide exists                        | manual    | `test -f docs/integration-guide.md`                                                                                                      | Wave 0       |
| REPO-04 | Composite GitHub Action exists and is valid     | smoke     | `cat .github/actions/checkout-submodule/action.yml` + YAML syntax check                                                                  | Wave 0       |

### Sampling Rate

- **Per task commit:** `wc -l` on all AGENTS.md files to verify line limits
- **Per wave merge:** Full content review + `gh repo view` to verify repo state
- **Phase gate:** All files under 150 lines, composite action YAML valid, integration guide complete

### Wave 0 Gaps

- [ ] All AGENTS.md files -- Phase 1 creates them from scratch
- [ ] `docs/integration-guide.md` -- New file
- [ ] `.github/actions/checkout-submodule/action.yml` -- New file
- [ ] `README.md` -- New file
- [ ] Line count validation script (optional)

## Sources

### Primary (HIGH confidence)

- [AGENTS.md specification](https://agents.md/) -- File discovery, filesystem inheritance, supported tools
- [GitHub agentsmd/agents.md repo](https://github.com/agentsmd/agents.md) -- Spec repository, 18.7k stars
- [GitHub Docs: Creating a composite action](https://docs.github.com/actions/creating-actions/creating-a-composite-action) -- action.yml syntax, inputs, steps
- [GitHub Docs: actions/checkout](https://github.com/actions/checkout) -- submodules and token parameters
- [Claude Code docs: Skills and memory](https://code.claude.com/docs/en/skills) -- CLAUDE.md hierarchy, @ references
- Existing edulution-ui codebase: `AGENTS.md`, `CLAUDE.md`, `.eslintrc.json`, `prettier.config.js`, `apps/frontend/tailwind.config.ts`, `libs/ui-kit/tailwind.config.ts`, `apps/frontend/src/index.scss`

### Secondary (MEDIUM confidence)

- [Micah Henning: Checkout submodules with least privilege](https://www.micah.soy/posts/checkout-submodules-github-actions-least-privilege/) -- Fine-grained PAT approach
- [Samuelsson: Access private submodules in GitHub Actions](https://samuelsson.dev/access-private-submodules-in-github-actions/) -- SSH deploy key approach
- [DeepWiki: CLAUDE.md Files and Memory Hierarchy](https://deepwiki.com/FlorianBruniaux/claude-code-ultimate-guide/4.1-claude.md-files-and-memory-hierarchy) -- Claude Code's Local > Project > Global loading order
- [GitHub blog: How to write a great AGENTS.md](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/) -- Best practices from 2,500+ repos

### Tertiary (LOW confidence)

- Line budget estimates for new AGENTS.md files -- Based on content analysis, not tested. Actual line counts depend on writing style.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH -- AGENTS.md spec is stable, GitHub Actions patterns are well-documented, all verified against official sources
- Architecture: HIGH -- Directory-based inheritance is the spec's core mechanic; composite action pattern is standard
- Pitfalls: MEDIUM -- AI tool traversal differences are real but hard to test without each tool; PAT scoping is well-documented
- Content split: MEDIUM -- Line counts are estimates; actual content writing may require adjustment

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable domain -- AGENTS.md spec, GitHub Actions, and git submodules are not fast-moving)

---

_Phase: 01-foundation_
_Research completed: 2026-03-09_
