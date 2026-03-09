# Feature Landscape

**Domain:** AI coding context framework with project scaffolding
**Researched:** 2026-03-09

## Table Stakes

Features users expect. Missing = product feels incomplete or unusable.

| Feature                                    | Why Expected                                                                                                                                                                                                                           | Complexity | Notes                                                                                                                                                 |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layered AGENTS.md system**               | Industry standard (Google, OpenAI, Cursor, Sourcegraph co-launched AGENTS.md). Root-level base + directory-level overrides is the expected pattern. Without layering, the framework cannot serve multiple project types from one repo. | Medium     | Base layer (all projects) + project-type layers (edulution-ui, custom React, styled pages). Agents auto-discover nearest AGENTS.md in directory tree. |
| **Executable commands section**            | GitHub's analysis of 2,500+ repos found commands (build, test, lint) are one of six core areas that put you in "top tier" AGENTS.md files. AI agents need runnable commands to verify their work.                                      | Low        | Already exists in current AGENTS.md. Extract and templatize per project type.                                                                         |
| **Stack declaration with versions**        | "React 18 with TypeScript, Vite, and Tailwind CSS" not "React project." Vague stack info produces wrong code. All AI context guides emphasize specificity.                                                                             | Low        | Concrete versions, key dependencies, framework choices.                                                                                               |
| **Coding conventions with examples**       | One code snippet showing style beats three paragraphs describing it. Negative rules ("never use X") eliminate entire categories of wrong suggestions.                                                                                  | Low        | Already well-developed in current AGENTS.md. Port and layer appropriately.                                                                            |
| **Project structure documentation**        | AI agents need to know where files go. Directory maps and component boundaries prevent agents from creating files in wrong locations.                                                                                                  | Low        | Per project type: monorepo structure for edulution-ui, simpler layout for custom apps, minimal for styled pages.                                      |
| **Git workflow conventions**               | Commit message format, branch naming, PR process. One of the six core AGENTS.md areas. Without it, AI-generated commits are inconsistent.                                                                                              | Low        | Already exists. Generalize for framework consumption.                                                                                                 |
| **Boundary rules**                         | What NOT to do. "Do not modify X", "never commit secrets", "do not create files in Y". Prevents AI agents from making destructive changes.                                                                                             | Low        | Critical for safety. Include per project type.                                                                                                        |
| **Setup script (interactive CLI)**         | Every scaffolding tool (Yeoman, create-vite, Nx generators) provides interactive project creation. Users expect `npx create-X` or equivalent. A framework without scaffolding is just documentation.                                   | High       | Node.js with inquirer-style prompts. Asks project type, pre-configurations, install location.                                                         |
| **Ready-to-run scaffolded output**         | Scaffolded projects must work immediately: `npm install && npm run dev` succeeds. CRA, Vite, and Nx all deliver this. A scaffold that requires manual fixup after generation is broken.                                                | High       | Vite+React+TS template with Tailwind, auth stubs, API client pre-configured.                                                                          |
| **Design token / Tailwind config sharing** | Custom apps and styled pages need edulution's visual identity. Without shared tokens, every project reinvents the theme and drifts.                                                                                                    | Medium     | Tailwind config synced from edulution-ui via CI. Styled pages get the config + source for building CSS.                                               |
| **API specification inclusion**            | Custom apps talk to the edulution API. AI agents need the swagger spec to generate correct API calls. Without it, agents guess endpoints and types.                                                                                    | Low        | Full swagger-spec.json included, synced via CI.                                                                                                       |
| **AI-agnostic design**                     | The ecosystem is fragmented: .cursorrules, CLAUDE.md, .github/copilot-instructions.md, .windsurfrules. A framework that locks into one tool loses most users. AGENTS.md is the emerging cross-tool standard.                           | Low        | AGENTS.md as canonical. CLAUDE.md as pointer only (`@AGENTS.md`). No tool-specific config files.                                                      |

## Differentiators

Features that set the product apart. Not expected but create significant value.

| Feature                                               | Value Proposition                                                                                                                                                                                                                                 | Complexity | Notes                                                                                                                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AI workflow documentation**                         | Goes beyond "here are the rules" to "here is how to accomplish tasks." Guides like "new app from scratch" and "add feature to existing app" give AI agents step-by-step playbooks. Most AGENTS.md files only describe conventions, not workflows. | Medium     | "New app" guide and "add feature" guide with decision points where AI prompts user for clarification. Unique to this framework.                           |
| **CI-driven artifact sync**                           | Swagger spec, Tailwind config, and CSS artifacts auto-sync from edulution-ui on merge. No manual copy-paste. Most shared config frameworks require manual updates.                                                                                | Medium     | GitHub Actions pipeline in edulution-ui pushes to framework repo. Framework consumers get updates by pulling submodule.                                   |
| **Dog-fooding (edulution-ui consumes own framework)** | edulution-ui itself uses the framework as a submodule, proving it works and keeping it complete. Most internal frameworks rot because the main product does not actually use them.                                                                | Medium     | Removes inline AGENTS.md from edulution-ui entirely. Forces framework to cover all conventions.                                                           |
| **Auth integration scaffolding**                      | Scaffolded apps get SSO integration out of the box (same-origin for edulution API, framework-provided flow otherwise). Most scaffolding tools skip auth entirely.                                                                                 | High       | Two auth paths depending on deployment context. Complex but extremely valuable for developer onboarding.                                                  |
| **Pre-configured API client**                         | Scaffolded React apps get axios/eduApi configured to talk to edulution backend with proper error handling patterns. Eliminates boilerplate that every custom app would otherwise write.                                                           | Medium     | axios instance with interceptors, error handling, blob support, typed API functions from swagger spec.                                                    |
| **Independent semver with compatibility matrix**      | Framework versions independently but documents which edulution versions it supports. Consumers know if an update is safe. Most submodule-based frameworks lack version discipline.                                                                | Low        | CHANGELOG.md, version tags, compatibility table.                                                                                                          |
| **Context linting / validation**                      | Tools like ai-context-kit validate context files for conflicts, duplicates, vague instructions, and token bloat. Building validation into the framework catches quality issues before they waste AI tokens.                                       | Medium     | Could integrate ai-context-kit or build lightweight custom validation. Checks for contradictions between layers, missing required sections, token budget. |
| **Token budget awareness**                            | AI context windows are finite. Measuring token cost of context files and staying within budget prevents context overflow that silently degrades AI output quality.                                                                                | Low        | Report total tokens consumed by all AGENTS.md layers. Warn when approaching limits.                                                                       |

## Anti-Features

Features to explicitly NOT build. These seem tempting but create maintenance burden, scope creep, or worse outcomes.

| Anti-Feature                                                                           | Why Avoid                                                                                                                                                                                                        | What to Do Instead                                                                                                                              |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tool-specific config files (.cursorrules, .windsurfrules, copilot-instructions.md)** | Maintaining parallel config files creates sync drift and contradictions. The ecosystem is converging on AGENTS.md as the cross-tool standard.                                                                    | Use AGENTS.md as the single source of truth. CLAUDE.md only as a pointer. Let tool vendors converge on AGENTS.md reading.                       |
| **GUI / web dashboard for configuration**                                              | Massively increases scope. Target users are developers who live in terminals and editors. A GUI adds deployment, hosting, and maintenance burden for minimal value.                                              | CLI-only. Interactive terminal prompts via inquirer are sufficient.                                                                             |
| **Runtime code generation / live code modification**                                   | Scaffolding should happen once at project creation. Runtime code generation couples the framework to the consuming project's build pipeline and creates upgrade nightmares.                                      | Generate files at scaffold time. After that, the project owns its code. Framework provides conventions via AGENTS.md, not runtime manipulation. |
| **Component library / UI kit bundling**                                                | The framework provides context and scaffolding, not components. ui-kit is a separate concern (npm package or local checkout). Bundling UI code into the context framework creates circular dependencies.         | Reference ui-kit as a dependency in scaffolded projects. Document how to consume it. Do not include component source code in the framework.     |
| **GSD-style slash commands**                                                           | Over-engineers the workflow. AI agents work from documentation, not custom command protocols. Adding a command layer means maintaining a command parser, handler, and documentation for the commands themselves. | Documentation-driven workflow only. AGENTS.md workflow guides tell AI what to do step-by-step.                                                  |
| **Auto-sync from framework to consuming projects**                                     | Submodule updates should be explicit (developer pulls new submodule commit). Auto-sync risks breaking consuming projects with unexpected changes.                                                                | Developers control when they update their submodule reference. CI sync only flows edulution-ui to framework repo, not framework to consumers.   |
| **Windows setup script (initial release)**                                             | Node.js provides future portability, but testing and supporting Windows adds significant scope. Linux-first matches the team's environment.                                                                      | Ship Linux support first. Node.js choice preserves Windows option for later. Document the deferral.                                             |
| **Filtered / partial swagger spec**                                                    | Filtering endpoints adds a maintenance step and risks hiding endpoints that AI agents need. The AI can search the full spec efficiently.                                                                         | Include the full swagger-spec.json. Let AI agents find relevant endpoints contextually.                                                         |

## Feature Dependencies

```
Layered AGENTS.md system
  --> Project structure documentation (each layer needs structure docs)
  --> Coding conventions (layered: base + project-type specific)
  --> Boundary rules (layered: base + project-type specific)

Setup script (CLI)
  --> Layered AGENTS.md system (script selects which layers to activate)
  --> Ready-to-run scaffolded output (script generates the project)
  --> Design token / Tailwind config sharing (included in scaffold)
  --> API specification inclusion (included in scaffold)

Ready-to-run scaffolded output
  --> Auth integration scaffolding (optional, selected during setup)
  --> Pre-configured API client (optional, selected during setup)

CI-driven artifact sync
  --> Design token / Tailwind config sharing (CI pushes config)
  --> API specification inclusion (CI pushes swagger spec)

Dog-fooding (edulution-ui consumes framework)
  --> Layered AGENTS.md system (edulution-ui uses the "core" layer)
  --> CI-driven artifact sync (produces artifacts for framework)

AI workflow documentation
  --> Layered AGENTS.md system (workflows reference conventions)
  --> Setup script (workflows may invoke scaffold)

Independent semver
  --> CI-driven artifact sync (version bumps on sync)
```

## MVP Recommendation

Prioritize for first usable release:

1. **Layered AGENTS.md system** -- Foundation everything else builds on. Extract from current edulution-ui AGENTS.md, split into base layer + edulution-ui-core layer + custom-react-app layer + styled-page layer.

2. **All "Low complexity" table stakes** -- Commands, stack declaration, conventions, structure docs, git workflow, boundary rules, API spec inclusion, AI-agnostic design. These are mostly content extraction and restructuring from existing AGENTS.md.

3. **Design token / Tailwind config sharing** -- Needed before scaffolding can work. Set up CI sync pipeline.

4. **Setup script (CLI)** -- Interactive scaffolding. Start with one project type (custom React app) and expand.

5. **Ready-to-run scaffolded output** -- The scaffolded React app template. Must boot and render on first try.

Defer to second release:

- **Auth integration scaffolding**: Complex, two auth paths. Ship scaffold without auth first, add as enhancement.
- **AI workflow documentation**: Valuable but the framework is usable without it. Write after dog-fooding reveals actual workflow patterns.
- **Context linting / validation**: Nice-to-have. Consider integrating ai-context-kit later.
- **Token budget awareness**: Low effort but not critical for v1.

## Sources

- [AGENTS.md specification](https://agents.md/) - Official standard for AI coding agent instructions
- [How to write a great AGENTS.md - GitHub Blog](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/) - Analysis of 2,500+ repositories
- [Layered Configuration Context - Agentic Patterns](https://agentic-patterns.com/patterns/layered-configuration-context/) - Layered context override pattern
- [ai-context-kit](https://github.com/ofershap/ai-context-kit) - Lint, measure, sync context files across AI tools
- [Codified Context: Infrastructure for AI Agents](https://arxiv.org/html/2602.20478v1) - Hot/cold memory architecture for agent context
- [Context Engineering for Coding Agents - Martin Fowler](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html) - Context management strategies
- [GitHub Spec Kit](https://github.com/github/spec-kit) - Spec-driven development toolkit for AI agents
- [cursorrules vs CLAUDE.md vs Copilot Instructions](https://www.agentrulegen.com/guides/cursorrules-vs-claude-md) - Cross-tool comparison
- [Vite scaffolding](https://vite.dev/guide/) - Modern React project scaffolding standard
- [Yeoman](https://yeoman.io/) - Traditional scaffolding tool patterns
