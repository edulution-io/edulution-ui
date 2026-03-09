# Domain Pitfalls

**Domain:** AI coding context framework with git submodule distribution, cross-repo CI sync, CLI scaffolding
**Researched:** 2026-03-09

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Private Submodule Authentication Breaks Every Consumer's CI

**What goes wrong:** The default `GITHUB_TOKEN` in GitHub Actions only has access to the repository it runs in. When any consuming project (edulution-ui or a custom app) tries to `actions/checkout` with `submodules: recursive`, it fails with "Repository not found" because it cannot access the private `edulution-ai-framework` repo.

**Why it happens:** GitHub scopes tokens per-repository by default. Deploy keys are limited to a single repo. Teams set up the submodule locally (where SSH keys work) and never test CI until it is too late.

**Consequences:** Every consumer's CI pipeline breaks on first run. Developers waste hours debugging authentication. If solved with overly-broad PATs stored as secrets, security posture degrades.

**Prevention:**

- Document the authentication requirement from day one in the framework's own README
- Provide a reusable composite GitHub Action (shipped inside the framework repo) that handles submodule checkout with proper auth
- Use a fine-grained PAT or a GitHub App installation token scoped to the framework repo only, stored as an org-level secret
- Test the submodule checkout in CI as part of the framework's own test suite (a "consumer simulation" workflow)

**Detection:** First CI run of any new consumer fails with permission errors. No CI test exists for the submodule checkout path.

**Phase:** Must be addressed in Phase 1 (submodule setup). Provide auth documentation and a composite action before any consumer adopts.

---

### Pitfall 2: AGENTS.md Context Bloat Degrades AI Output Quality

**What goes wrong:** The layered markdown system (base conventions + project-type overrides) grows to hundreds or thousands of lines. AI agents start hallucinating or ignoring instructions at around 70% context window utilization. A large AGENTS.md consumes context budget that should be used for actual code.

**Why it happens:** Teams keep adding rules without pruning. Layered files compound -- base + project-type + workflow docs all get loaded. The edulution-ui AGENTS.md is already substantial and would grow further when merged with framework-level conventions.

**Consequences:** AI agents produce worse code despite having more instructions. Critical rules get buried in noise. Different AI tools have different context limits -- what works for Claude (200k) may overwhelm Copilot or smaller-context tools.

**Prevention:**

- Hard cap: aim for 150 lines or fewer per AGENTS.md file (per GitHub's analysis of 2,500+ repos)
- Use hierarchical placement: put subdirectory-specific AGENTS.md files close to the code they govern, so agents only load what is relevant to the current task
- Separate "instructions" (do X) from "guidance" (prefer Y) -- instructions are higher priority and should come first
- Audit quarterly: remove rules that duplicate linter/formatter enforcement
- Test with multiple AI tools to verify instructions are actually followed

**Detection:** AI agents consistently ignore rules that appear late in the file. File exceeds 150 lines. Adding new rules does not improve output quality.

**Phase:** Phase 2 (layered markdown system). Establish line budgets and hierarchy rules before content migration.

---

### Pitfall 3: Cross-Repo CI Sync Creates Silent Drift and Race Conditions

**What goes wrong:** The GitHub Action in edulution-ui that pushes swagger-spec.json and Tailwind config to the framework repo silently fails, or succeeds but creates commits that no one reviews. Over time the framework's artifacts drift from edulution-ui's actual state. Alternatively, concurrent merges to dev trigger parallel sync workflows that conflict.

**Why it happens:** Cross-repo pushes require PATs or GitHub App tokens that expire or get rotated without updating secrets. The "push to another repo" pattern has no built-in conflict resolution. Workflow failures in a different repo's context are easy to miss.

**Consequences:** Consumers scaffold projects with stale swagger specs or wrong Tailwind configs. Bugs appear only at runtime. Debugging requires checking two repos' CI histories.

**Prevention:**

- Add a verification step: after pushing to the framework repo, the workflow should read back the committed file and diff against the source to confirm they match
- Use a dedicated bot account or GitHub App (not a personal PAT) so credentials do not expire when a team member leaves
- Add a scheduled "drift detection" workflow in the framework repo that compares its artifacts against edulution-ui's latest and opens an issue if they diverge
- Use a mutex/concurrency group on the sync workflow to prevent parallel runs: `concurrency: { group: sync-framework, cancel-in-progress: true }`
- Surface sync status as a badge in the framework repo's README

**Detection:** Framework repo artifacts have a last-updated timestamp older than edulution-ui's latest merge. Consumers report API mismatches. Sync workflow has silent failures in logs.

**Phase:** Phase 3 (CI sync pipeline). Build drift detection alongside the sync, not after.

---

### Pitfall 4: Submodule Version Pinning Creates Update Friction

**What goes wrong:** Git submodules pin to a specific commit. Consuming projects fall behind because developers forget (or avoid) running `git submodule update --remote`. When they finally update, months of framework changes land at once, breaking their project.

**Why it happens:** Submodule updates are a manual step outside normal `git pull` workflow. There is no notification mechanism for "your submodule is X commits behind." Developers in detached HEAD state accidentally commit on no branch and lose work.

**Consequences:** Framework improvements never reach consumers. When forced updates happen, they are large and painful. Different consumers run different framework versions without knowing it, fragmenting the ecosystem.

**Prevention:**

- Ship a `framework update` command in the CLI tool that safely updates the submodule, shows a changelog, and warns about breaking changes
- Add a CI check in consuming projects that warns (not fails) when the submodule is more than N commits behind the latest tag
- Use semver tags in the framework repo and document breaking changes in a CHANGELOG.md
- Configure submodule to track a branch (`git submodule set-branch -b main edulution-ai-framework`) so `git submodule update --remote` pulls latest
- Never work directly inside the submodule directory in consuming projects -- treat it as read-only

**Detection:** `git submodule status` shows the submodule is behind. Multiple consumers are on different framework commits with no pattern.

**Phase:** Phase 1 (submodule setup) for branch tracking config. Phase 4 (versioning) for update tooling and CI checks.

---

### Pitfall 5: Scaffolded Projects Become Unmaintainable After Generation

**What goes wrong:** The CLI scaffolds a project with specific versions of dependencies, config files, and boilerplate. Six months later, the framework has evolved but scaffolded projects are frozen at generation time. There is no upgrade path -- only "scaffold a new project and manually migrate."

**Why it happens:** Scaffolding tools (Yeoman, create-react-app, etc.) historically generate-and-forget. The tool knows how to create but not how to update. Templates evolve but existing projects do not.

**Consequences:** Scaffolded projects accumulate tech debt from day one. Teams avoid updating because migration is manual and risky. The framework team supports multiple "vintages" of scaffolded output.

**Prevention:**

- Design templates with a "framework version" marker in the generated project (e.g., in package.json or a .framework-version file) so the CLI can detect what was generated and what has changed
- Keep generated code minimal -- push shared logic into the framework submodule itself (which auto-updates) rather than copying it into the scaffolded project
- Provide a `framework doctor` CLI command that checks a project against current framework expectations and reports drift
- Document a migration guide for each breaking framework version

**Detection:** Scaffolded projects diverge significantly from current templates. The CLI has no `upgrade` or `doctor` command. Support requests reference outdated patterns.

**Phase:** Phase 3 (CLI scaffolding). Design the upgrade path before shipping v1 of the scaffold.

## Moderate Pitfalls

### Pitfall 6: Dog-Fooding edulution-ui Creates Circular Dependencies

**What goes wrong:** edulution-ui consumes the framework as a submodule, but the framework's CI syncs artifacts FROM edulution-ui. A change in edulution-ui triggers a sync to the framework, which could trigger a submodule update notification back in edulution-ui, creating loops or confusion about source of truth.

**Prevention:**

- Clearly define the data flow as one-directional: edulution-ui is the SOURCE, framework is the CONSUMER for artifacts (swagger, tailwind). The framework is the SOURCE, edulution-ui is the CONSUMER for conventions (AGENTS.md).
- Never auto-update the submodule pointer in edulution-ui from CI -- that must be a deliberate developer action
- Document the flow diagram in the framework's architecture docs

**Detection:** CI workflows trigger each other in loops. Team members are confused about where to edit conventions vs. artifacts.

**Phase:** Phase 1 (architecture). Establish the directional flow before any CI is built.

---

### Pitfall 7: AI-Agnostic Goal Undermined by Tool-Specific Behavior

**What goes wrong:** AGENTS.md is written to be AI-agnostic, but in practice different AI tools parse markdown differently. Claude reads `@AGENTS.md` references, Cursor uses .cursorrules, Copilot reads .github/copilot-instructions.md. The "single AGENTS.md" approach means only tools that natively support AGENTS.md benefit fully.

**Prevention:**

- Accept that AGENTS.md is the canonical source, but provide thin shim files for major tools (CLAUDE.md with `@AGENTS.md`, .cursorrules that imports or mirrors key rules)
- Keep shims auto-generated from AGENTS.md via a framework CLI command (`framework sync-shims`)
- Test the framework with at least two different AI tools to verify conventions are followed
- Do not put tool-specific syntax (XML tags, special markers) in AGENTS.md itself

**Detection:** Developers using non-Claude tools report that AI agents ignore project conventions. Tool-specific files drift from AGENTS.md content.

**Phase:** Phase 2 (layered markdown). Build shim generation alongside the main AGENTS.md structure.

---

### Pitfall 8: Swagger Spec Inclusion Bloats Context Without Adding Value

**What goes wrong:** The full swagger-spec.json is included in the framework. For large APIs, this file can be thousands of lines. AI agents load it into context but rarely need the full spec -- they need the 2-3 endpoints relevant to their current task. The full spec wastes context budget (see Pitfall 2).

**Prevention:**

- Do not auto-load the swagger spec into AI context. Instead, reference it as a "look up when needed" resource in AGENTS.md
- Provide a CLI command or script that extracts relevant endpoint documentation by tag or path prefix
- Consider generating per-domain API summary files (e.g., `api/users.md`, `api/files.md`) that are smaller and more contextually useful
- Keep the full spec available for tooling (code generation, validation) but not for AI context

**Detection:** AI agents hallucinate API endpoints that do not exist. Context window fills up when swagger is loaded. Agents ignore the spec entirely because it is too large.

**Phase:** Phase 2 (content strategy) and Phase 3 (CLI tooling for spec extraction).

---

### Pitfall 9: Node.js Setup Script Assumes Environment State

**What goes wrong:** The interactive CLI script assumes Node.js is installed, npm is available, git is configured with SSH access to the private repo, and the user's shell supports interactive prompts. In CI environments, Docker containers, or minimal Linux installs, these assumptions fail silently or with cryptic errors.

**Prevention:**

- Check all prerequisites at script start and provide clear error messages with installation instructions
- Support a `--non-interactive` mode with flags/env vars for CI usage
- Pin the minimum Node.js version and check it explicitly
- Use `which` or `command -v` checks before assuming tools exist
- Provide a `--dry-run` flag that shows what would be generated without writing files

**Detection:** Bug reports from users on minimal environments. Script fails partway through, leaving partial scaffolding.

**Phase:** Phase 3 (CLI scaffolding). Add prerequisite checks from the first version.

---

### Pitfall 10: Three Project Types Create Exponential Testing Surface

**What goes wrong:** Supporting edulution-ui core, custom React apps, and styled HTML pages means every framework change must be validated across three fundamentally different project types. Template combinations (Vite+React+TS with/without Tailwind, with/without auth, with/without API client) multiply the matrix further.

**Prevention:**

- Define a canonical "golden path" for each project type with the most common configuration and test that exhaustively
- Use snapshot testing for generated output: scaffold each project type and commit the output as test fixtures
- Limit pre-configuration options to validated combinations rather than arbitrary mix-and-match
- Add the project type and selected options to the generated project's metadata so the `doctor` command knows what to check

**Detection:** Untested configuration combinations fail at runtime. Adding a new framework feature requires updating three or more template sets. Template maintenance becomes the primary time sink.

**Phase:** Phase 3 (CLI scaffolding). Start with one project type (custom React app), validate the pattern, then add others.

## Minor Pitfalls

### Pitfall 11: Submodule Path Conflicts with Existing Directory Names

**What goes wrong:** The framework submodule is added at `edulution-ai-framework/` in the repo root. If a consuming project already has a directory or file with a conflicting name, or if tooling (bundlers, linters) scans the submodule directory and processes its files, unexpected errors occur.

**Prevention:**

- Add the submodule path to .gitignore patterns for linters, bundlers, and test runners in consuming projects
- Document the exact submodule path and any required exclusions in setup instructions
- Choose a path that is unlikely to conflict (the current `edulution-ai-framework/` is fine -- it is distinctive)

**Phase:** Phase 1 (submodule setup). Include exclusion patterns in setup documentation.

---

### Pitfall 12: Independent Semver Without Compatibility Matrix Causes Confusion

**What goes wrong:** The framework uses independent semver but does not clearly document which edulution-ui versions it supports. A consumer updates the framework but their edulution-ui backend is two versions behind, causing API mismatches.

**Prevention:**

- Maintain a compatibility matrix in the framework (e.g., "Framework 2.x supports edulution-ui 2.0.25 -- 2.0.30")
- Include edulution-ui version checks in the CLI's `doctor` command
- Tag framework releases alongside the swagger spec version they bundle

**Phase:** Phase 4 (versioning and release process).

---

### Pitfall 13: Detached HEAD in Submodule Causes Lost Work

**What goes wrong:** Developers accidentally edit files inside the submodule directory, which is in detached HEAD state. Their changes are lost on the next `git submodule update`.

**Prevention:**

- Mark the submodule directory as read-only in documentation
- Add a pre-commit hook in consuming projects that warns if files inside the submodule path are staged
- The CLI's setup step should configure the submodule with `--branch main` to reduce detached HEAD confusion

**Phase:** Phase 1 (submodule setup).

## Phase-Specific Warnings

| Phase Topic      | Likely Pitfall                                                                              | Mitigation                                                           |
| ---------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Submodule setup  | Auth breaks CI (Pitfall 1), detached HEAD (Pitfall 13), circular deps (Pitfall 6)           | Ship composite action, document auth, define directional flow        |
| Layered markdown | Context bloat (Pitfall 2), tool incompatibility (Pitfall 7), swagger bloat (Pitfall 8)      | 150-line cap per file, hierarchical placement, shim generation       |
| CLI scaffolding  | Unmaintainable output (Pitfall 5), env assumptions (Pitfall 9), testing matrix (Pitfall 10) | Minimal generation, prerequisite checks, start with one project type |
| CI sync          | Silent drift (Pitfall 3), circular triggers (Pitfall 6)                                     | Drift detection workflow, concurrency groups, one-directional flow   |
| Versioning       | Update friction (Pitfall 4), compatibility confusion (Pitfall 12)                           | CLI update command, compatibility matrix, changelog                  |

## Sources

- [GitHub Blog: How to write a great AGENTS.md](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)
- [Martin Fowler: Context Engineering for Coding Agents](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html)
- [Manus: Context Engineering Lessons](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)
- [Spotify: Context Engineering for Background Coding Agents](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2)
- [InfoQ: Reassessing AGENTS.md Files](https://www.infoq.com/news/2026/03/agents-context-file-value-review/)
- [actions/checkout Issue #116: Private submodule checkout](https://github.com/actions/checkout/issues/116)
- [actions/checkout Issue #287: Private repos and submodules](https://github.com/actions/checkout/issues/287)
- [Samuelsson: Access private submodules in GitHub Actions](https://samuelsson.dev/access-private-submodules-in-github-actions/)
- [Anthropic: Effective Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Tim Hutt: Reasons to avoid Git submodules](https://blog.timhutt.co.uk/against-submodules/)
- [Digma: 10 Common monorepo problems](https://digma.ai/10-common-problems-of-working-with-a-monorepo/)
- [The New Stack: Context is AI coding's real bottleneck in 2026](https://thenewstack.io/context-is-ai-codings-real-bottleneck-in-2026/)
