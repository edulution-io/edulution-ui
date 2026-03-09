# Phase 2: CI Sync Pipeline - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Automated artifact sync from edulution-ui to the framework repo. When tracked files change and merge to dev, a GitHub Actions workflow pushes updated artifacts to the framework repo's artifacts directory. No manual intervention needed.

Note: SYNC-04 (drift detection) is deferred out of this phase — trust the auto-sync, add verification later if needed.

</domain>

<decisions>
## Implementation Decisions

### Sync delivery method

- Direct commit to framework repo (no PRs for artifact updates)
- Commit messages include detailed diff summary (e.g. which endpoints changed, what config values differ)
- Skip no-op syncs: compare file content before committing, skip if unchanged

### Artifact destination

- All synced files land in a top-level `artifacts/` directory in the framework repo
- Four files synced:
  - `swagger-spec.json` (from repo root)
  - `tailwind.config.ts` (from `apps/frontend/tailwind.config.ts` — extends ui-kit base)
  - `tailwind.base.config.ts` (from `libs/ui-kit/tailwind.config.ts` — base preset with shadcn colors)
  - `index.scss` (from `apps/frontend/src/index.scss` — design tokens, CSS variables, light/dark themes)
- Swagger spec synced as-is (full file), filtering deferred to Phase 3 CLI

### Branch strategy

- Trigger: merge to `dev` branch only (not main)
- Target: push to `main` branch in framework repo
- Single direction: edulution-ui dev -> framework main

### Workflow structure

- Single workflow file: `sync-framework.yml`
- Separate jobs for swagger and styling artifacts (tailwind configs + index.scss)
- Path filtering per job: swagger job only runs when `swagger-spec.json` changes, styling job only runs when tailwind configs or index.scss change

### Authentication

- GitHub App token via VERSION_BUMPER (reuse existing org-wide App)
- Uses `actions/create-github-app-token@v1` with existing secrets (`VERSION_BUMPER_APPID`, `VERSION_BUMPER_SECRET`)
- App has org-wide installation on edulution-io with Contents read/write and Metadata permissions
- Framework repo already exists at https://github.com/edulution-io/edulution-ai-framework

### Failure handling

- Default GitHub Actions failure notifications (email on workflow failure)
- No auto-issue creation on failure
- Drift detection deferred — not in this phase

### Claude's Discretion

- Exact git operations for the sync (clone, checkout, copy, commit, push sequence)
- How to generate the detailed diff summary for commit messages
- Path filter syntax in workflow triggers vs job-level conditionals
- Whether to use a reusable workflow or keep it self-contained

</decisions>

<specifics>
## Specific Ideas

- User noted the VERSION_BUMPER App likely has Contents read/write and Metadata permissions, installed org-wide
- User will verify App installation covers edulution-ai-framework repo (should be automatic with org-wide install)
- Existing auto-merge workflow (`auto-merge-master-back-in-dev.yml`) is a good pattern reference for the App token usage

</specifics>

<code_context>

## Existing Code Insights

### Reusable Assets

- `auto-merge-master-back-in-dev.yml`: Pattern for GitHub App token usage with `actions/create-github-app-token@v1`
- `build-and-test.yml`: Pattern for path filtering, Node 22.x, ubuntu-24.04, actions/checkout@v5
- Existing workflow conventions: timeout-minutes, cache patterns, git config for bot commits

### Established Patterns

- Bot commits use: `git config user.name 'github-actions[bot]'` and `git config user.email 'github-actions[bot]@users.noreply.github.com'`
- All workflows use `ubuntu-24.04` (or `ubuntu-latest` in some older ones)
- Actions versions: checkout@v5, setup-node@v6, cache@v4, create-github-app-token@v1

### Integration Points

- Workflow file goes in `.github/workflows/sync-framework.yml` in edulution-ui
- Framework repo: `https://github.com/edulution-io/edulution-ai-framework`
- Source files: `swagger-spec.json`, `apps/frontend/tailwind.config.ts`, `libs/ui-kit/tailwind.config.ts`, `apps/frontend/src/index.scss`
- Target: `artifacts/` directory in framework repo main branch

</code_context>

<deferred>
## Deferred Ideas

- SYNC-04 (drift detection) — deferred until sync failures actually occur; can be added as a scheduled job later
- Swagger spec filtering/splitting for AI context size — deferred to Phase 3 CLI scaffolder
- Artifact versioning and changelog (CIE-01) — already tracked as v2 requirement

</deferred>

---

_Phase: 02-ci-sync-pipeline_
_Context gathered: 2026-03-09_
