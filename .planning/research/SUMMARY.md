# Project Research Summary

**Project:** edulution-ai-framework
**Domain:** AI coding context framework with project scaffolding and cross-repo distribution
**Researched:** 2026-03-09
**Confidence:** HIGH

## Executive Summary

The edulution-ai-framework is a standalone Git repository that provides two things: (1) layered AGENTS.md files that give AI coding tools project-specific conventions and rules, and (2) an interactive CLI that scaffolds new edulution-compatible projects (React apps and styled HTML pages) with correct styling, API integration, and coding standards baked in. The framework is distributed as a git submodule and kept current through a CI pipeline that syncs artifacts (swagger spec, Tailwind config) from the main edulution-ui repository. Experts in this space converge on AGENTS.md as the emerging cross-tool standard for AI coding context, with filesystem-based layering as the composition model.

The recommended approach is to build content-first: extract and split the existing edulution-ui AGENTS.md into a layered system (base + project-type overrides), establish the submodule integration and CI sync pipeline, then build the CLI scaffolder on top. The stack is deliberately lightweight -- Node.js 22 with native TypeScript type-stripping, commander for CLI parsing, @inquirer/prompts for interactive setup, and EJS for templates. No build step is needed for the CLI itself. The framework repo stays simple: markdown files, a few TypeScript files, and synced artifacts.

The primary risks are: (1) private submodule authentication breaking every consumer's CI pipeline if not documented and tooled from day one, (2) AGENTS.md context bloat degrading AI output quality as layers accumulate, and (3) cross-repo CI sync silently drifting without drift detection. All three are preventable with upfront design -- composite GitHub Actions for auth, hard line-count caps per AGENTS.md file, and verification steps in the sync workflow. The circular dependency between edulution-ui (source of artifacts) and the framework (source of conventions) must be kept strictly one-directional per concern.

## Key Findings

### Recommended Stack

The CLI runs on Node.js 22.18+ with native TypeScript type-stripping, eliminating the need for tsx or ts-node. All dependencies are mature, well-maintained, and lightweight. See [STACK.md](STACK.md) for full details.

**Core technologies:**

- **Node.js 22 + TypeScript 5.7**: Runtime and language -- native type-stripping means no build step for the CLI
- **commander 14 + @inquirer/prompts 8**: CLI parsing and interactive prompts -- de facto standards, modern APIs
- **EJS 3**: Template engine -- supports conditional logic in templates (unlike Handlebars), templates remain readable as standalone files
- **picocolors**: Terminal colors -- avoids chalk's ESM-only issues with native TS stripping
- **fs-extra + glob**: File operations -- convenience wrappers that eliminate boilerplate
- **vitest**: Testing -- matches edulution-ui frontend testing stack

**What to avoid:** tsx/ts-node (unnecessary), chalk v5+ (ESM-only issues), yeoman/hygen/plop (heavyweight), marketplace sync actions (supply-chain risk with PATs).

### Expected Features

See [FEATURES.md](FEATURES.md) for the complete feature landscape with dependency graph.

**Must have (table stakes):**

- Layered AGENTS.md system (base + project-type overrides) -- the foundation everything builds on
- Executable commands, stack declarations, coding conventions with examples -- the six core areas of effective AGENTS.md
- Project structure documentation and boundary rules per project type
- Interactive setup CLI that scaffolds ready-to-run projects
- Design token / Tailwind config sharing via CI-synced artifacts
- API specification (swagger-spec.json) inclusion
- AI-agnostic design (AGENTS.md as canonical, CLAUDE.md as pointer only)

**Should have (differentiators):**

- AI workflow documentation ("new app" and "add feature" step-by-step guides)
- CI-driven artifact sync from edulution-ui
- Dog-fooding (edulution-ui consumes its own framework)
- Pre-configured API client (eduApi pattern) in scaffolded apps
- Independent semver with compatibility matrix

**Defer (v2+):**

- Auth integration scaffolding (two auth paths, high complexity)
- Context linting / validation (consider ai-context-kit later)
- Token budget awareness tooling
- Windows support (Linux-first, Node.js preserves portability)

### Architecture Approach

The framework has four logical layers: markdown context (what AI tools read), synced artifacts (auto-updated from edulution-ui), CLI scaffolding (what developers invoke), and templates (project blueprints). See [ARCHITECTURE.md](ARCHITECTURE.md) for the full directory structure, data flow diagrams, and composition model.

**Major components:**

1. **Root AGENTS.md** -- universal coding conventions shared across all project types (TypeScript style, API patterns, design tokens, commit conventions)
2. **layers/** -- project-type-specific AGENTS.md overrides (edulution-ui with Nx/NestJS rules, custom-app with Vite standalone rules, styled-page with HTML/CSS-only rules)
3. **artifacts/** -- CI-managed read-only directory containing swagger-spec.json and Tailwind configs, with sync metadata for provenance tracking
4. **cli/** -- Node.js interactive setup script that reads templates and artifacts, prompts for project configuration, and generates ready-to-run projects
5. **templates/** -- EJS-based project blueprints organized by project type, with conditional sections for optional features
6. **workflows/** -- structured markdown guides that AI tools follow for common tasks (creating apps, adding features)

**Key patterns:** artifacts as read-only (CI-managed, never hand-edited), CLAUDE.md as pointer only (@AGENTS.md), template interpolation via simple markers, workflow guides as structured prompts with decision points.

### Critical Pitfalls

See [PITFALLS.md](PITFALLS.md) for the full list of 13 pitfalls with prevention strategies.

1. **Private submodule auth breaks CI** -- Every consumer's CI will fail on first run unless auth is documented and tooled. Ship a composite GitHub Action for submodule checkout and use org-level secrets with a GitHub App or fine-grained PAT.
2. **AGENTS.md context bloat** -- Layered files compound and degrade AI output quality past ~70% context utilization. Enforce a 150-line cap per file, use hierarchical placement, and audit quarterly.
3. **Cross-repo CI sync drift** -- Silent failures in the sync workflow cause stale artifacts. Add verification steps, drift detection workflows, and concurrency groups to prevent race conditions.
4. **Submodule update friction** -- Developers forget to update, then face painful bulk updates. Provide a CLI update command, CI staleness warnings, and semver tags with a changelog.
5. **Scaffolded projects become unmaintainable** -- No upgrade path after generation. Stamp generated projects with a framework version, keep generated code minimal, and plan a `doctor` command.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation -- Layered AGENTS.md and Submodule Setup

**Rationale:** Everything depends on the content layer existing first. The AGENTS.md split is the most important architectural decision -- getting content boundaries wrong means every subsequent phase builds on a flawed foundation.
**Delivers:** Framework repo with root AGENTS.md, three project-type layers (edulution-ui, custom-app, styled-page), git submodule integration into edulution-ui, auth documentation, and a composite GitHub Action for CI checkout.
**Addresses:** Layered AGENTS.md system, project structure docs, coding conventions, boundary rules, AI-agnostic design, git workflow conventions.
**Avoids:** Pitfall 1 (submodule auth), Pitfall 2 (context bloat via line caps from the start), Pitfall 6 (circular deps via clear directional flow), Pitfall 13 (detached HEAD via branch tracking config).

### Phase 2: CI Sync Pipeline

**Rationale:** Templates and scaffolding depend on synced artifacts (swagger spec, Tailwind config). The CI pipeline must exist before templates can reference real artifacts.
**Delivers:** GitHub Actions workflow in edulution-ui that syncs swagger-spec.json and Tailwind configs to the framework repo's artifacts/ directory, with sync metadata, verification steps, and drift detection.
**Addresses:** CI-driven artifact sync, design token / Tailwind config sharing, API specification inclusion.
**Avoids:** Pitfall 3 (silent drift via verification and drift detection), Pitfall 6 (circular triggers via one-directional flow).

### Phase 3: Templates and CLI Scaffolder

**Rationale:** With content and artifacts in place, the CLI can scaffold projects that reference real conventions and use real Tailwind configs. Start with custom React app only -- validate the pattern before adding styled pages.
**Delivers:** Interactive CLI (commander + @inquirer/prompts), EJS templates for custom React app (Vite + React + TS + Tailwind), ready-to-run scaffolded output, prerequisite checks, dry-run mode.
**Addresses:** Setup script (CLI), ready-to-run scaffolded output, pre-configured API client, executable commands section.
**Avoids:** Pitfall 5 (unmaintainable output via framework version stamping and minimal generation), Pitfall 9 (env assumptions via prerequisite checks), Pitfall 10 (testing matrix via starting with one project type).

### Phase 4: Second Project Type and Versioning

**Rationale:** With the scaffolding pattern proven on custom React apps, add the styled HTML page template and establish the versioning/release process.
**Delivers:** Styled page template, semver tagging, CHANGELOG.md, compatibility matrix, CLI `update` command for submodule management.
**Addresses:** Styled page scaffolding, independent semver with compatibility matrix, stack declaration with versions.
**Avoids:** Pitfall 4 (update friction via CLI update command and CI staleness warnings), Pitfall 12 (compatibility confusion via matrix).

### Phase 5: Workflow Guides and Dog-Fooding

**Rationale:** By this point the framework is functional. Workflow guides are best written after real usage reveals actual patterns. Dog-fooding edulution-ui removes its inline AGENTS.md and forces the framework to be complete.
**Delivers:** AI workflow documentation (new-app.md, add-feature.md), edulution-ui fully consuming the framework (removing inline AGENTS.md), doctor command for scaffolded project health checks.
**Addresses:** AI workflow documentation, dog-fooding, context linting (basic via doctor command).

### Phase 6: Polish and Hardening

**Rationale:** Refinements based on real-world usage during Phase 5 dog-fooding.
**Delivers:** Token budget reporting, shim generation for non-AGENTS.md tools (.cursorrules), auth integration scaffolding (if validated as needed), migration guides.

### Phase Ordering Rationale

- Phases 1-2-3 are strictly sequential: content before sync, sync before scaffolding. This is the critical path.
- Phase 4 can begin template work in parallel with late Phase 3 CLI work, but versioning depends on having a working v1.
- Phase 5 is deliberately late because workflow guides written without real usage are speculative. Dog-fooding will reveal what actually needs documenting.
- The architecture research strongly recommends spending extra time on Phase 1's layer split -- it is the hardest decision and the most expensive to change later.

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 1:** The AGENTS.md content split requires careful analysis of the current 66-line AGENTS.md to decide what is universal vs. project-type-specific. Research the exact behavior of each AI tool's AGENTS.md discovery mechanism.
- **Phase 3:** CLI scaffolding patterns -- research how create-vite and Nx generators handle post-scaffold validation (ensuring `npm install && npm run dev` works). EJS template structure needs prototyping.

Phases with standard patterns (skip research-phase):

- **Phase 2:** CI sync is straightforward GitHub Actions with well-documented patterns. The STACK.md already includes the workflow YAML.
- **Phase 4:** Semver tagging, changelogs, and compatibility matrices are established practices.
- **Phase 5:** Workflow guide format follows the AGENTS.md specification's documented patterns.

## Confidence Assessment

| Area         | Confidence | Notes                                                                                                                                                          |
| ------------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack        | HIGH       | All technologies are mature, well-documented, and already used by the team. Node.js native TS stripping is the only newer capability but is stable in 22.18+.  |
| Features     | HIGH       | Feature landscape is well-defined by existing AGENTS.md ecosystem research (GitHub's 2,500-repo analysis, official spec). Clear MVP vs. defer recommendations. |
| Architecture | HIGH       | Layered AGENTS.md is the documented standard (supported by Claude, Cursor, Copilot, Codex). Submodule distribution is a known pattern with known tradeoffs.    |
| Pitfalls     | HIGH       | Pitfalls are drawn from real-world experience with submodules, cross-repo CI, and AI context management. Multiple sources corroborate each pitfall.            |

**Overall confidence:** HIGH

### Gaps to Address

- **AI tool behavior differences:** How exactly do Cursor, Copilot, and Codex discover and merge layered AGENTS.md files? The spec says filesystem-based inheritance, but tool-specific quirks may exist. Validate during Phase 1 with at least two tools.
- **Swagger spec context strategy:** The full spec may be too large for AI context. Need to determine during Phase 2 whether to include it as-is, generate per-domain summaries, or reference it as a lookup resource. This affects both the sync pipeline and the AGENTS.md content.
- **Auth integration complexity:** Deferred to v2, but the two auth paths (same-origin SSO vs. framework-provided) need scoping before Phase 6 to ensure scaffolded projects do not paint themselves into a corner.
- **EJS vs. simple string replacement:** ARCHITECTURE.md suggests simple `{{variable}}` markers while STACK.md recommends EJS. Resolve during Phase 3 planning -- EJS is the stronger choice given conditional template sections.

## Sources

### Primary (HIGH confidence)

- [AGENTS.md specification](https://agents.md/) -- official standard, layering semantics
- [AGENTS.md GitHub repo](https://github.com/agentsmd/agents.md) -- Linux Foundation open standard
- [GitHub Blog: AGENTS.md analysis](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/) -- 2,500+ repo study
- [OpenAI Codex AGENTS.md guide](https://developers.openai.com/codex/guides/agents-md/) -- cascading rules
- [Node.js native TypeScript support](https://nodejs.org/en/learn/typescript/run-natively) -- type stripping docs
- [Anthropic: Effective Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- Existing edulution-ui codebase -- direct inspection of AGENTS.md, configs, swagger spec

### Secondary (MEDIUM confidence)

- [Martin Fowler: Context Engineering](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html)
- [Spotify: Context Engineering for Agents](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2)
- [Cross-repo GitHub Actions patterns](https://some-natalie.dev/blog/multi-repo-actions/)
- [Layered Configuration Context pattern](https://agentic-patterns.com/patterns/layered-configuration-context/)
- [ai-context-kit](https://github.com/ofershap/ai-context-kit) -- context linting tooling
- npm package pages for commander, @inquirer/prompts, picocolors, EJS

### Tertiary (LOW confidence)

- [InfoQ: Reassessing AGENTS.md Files](https://www.infoq.com/news/2026/03/agents-context-file-value-review/) -- emerging critique, worth monitoring
- [The New Stack: Context bottleneck in 2026](https://thenewstack.io/context-is-ai-codings-real-bottleneck-in-2026/) -- trend analysis

---

_Research completed: 2026-03-09_
_Ready for roadmap: yes_
