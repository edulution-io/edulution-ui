# Phase 2: CI Sync Pipeline - Research

**Researched:** 2026-03-09
**Domain:** GitHub Actions CI/CD, cross-repository artifact synchronization
**Confidence:** HIGH

## Summary

This phase requires a single GitHub Actions workflow file (`sync-framework.yml`) in edulution-ui that, on merge to the `dev` branch, detects changes to specific source files and pushes updated copies to the `artifacts/` directory of the `edulution-ai-framework` repository. The technical domain is well-understood: GitHub Actions path filtering on push events, GitHub App token generation for cross-repo access, and standard git operations for content comparison and commit.

The existing edulution-ui workflows already establish all necessary patterns: `actions/create-github-app-token@v1` with `VERSION_BUMPER_APPID`/`VERSION_BUMPER_SECRET`, bot git config, and `actions/checkout@v5`. The key new element is using the token's `owner` and `repositories` parameters to scope access to the framework repo, and checking out a second repository in the same job for cross-repo file sync.

**Primary recommendation:** Build a single workflow with two parallel jobs (swagger, styling) that each generate an App token scoped to the framework repo, check out both repos, compare file content with `diff`, and only commit+push when content actually differs. Use workflow-level `on.push.paths` to avoid running the workflow at all when irrelevant files change, plus job-level `paths-filter` via `dorny/paths-filter` or `if` conditions for per-job granularity.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Direct commit to framework repo (no PRs for artifact updates)
- Commit messages include detailed diff summary (e.g. which endpoints changed, what config values differ)
- Skip no-op syncs: compare file content before committing, skip if unchanged
- All synced files land in a top-level `artifacts/` directory in the framework repo
- Four files synced: `swagger-spec.json`, `tailwind.config.ts`, `tailwind.base.config.ts`, `index.scss`
- Swagger spec synced as-is (full file), filtering deferred to Phase 3 CLI
- Trigger: merge to `dev` branch only (not main)
- Target: push to `main` branch in framework repo
- Single workflow file: `sync-framework.yml`
- Separate jobs for swagger and styling artifacts
- Path filtering per job
- GitHub App token via VERSION_BUMPER (reuse existing org-wide App)
- Uses `actions/create-github-app-token@v1` with existing secrets
- Default GitHub Actions failure notifications (email on workflow failure)
- No auto-issue creation on failure
- Drift detection deferred

### Claude's Discretion

- Exact git operations for the sync (clone, checkout, copy, commit, push sequence)
- How to generate the detailed diff summary for commit messages
- Path filter syntax in workflow triggers vs job-level conditionals
- Whether to use a reusable workflow or keep it self-contained

### Deferred Ideas (OUT OF SCOPE)

- SYNC-04 (drift detection) -- deferred until sync failures actually occur
- Swagger spec filtering/splitting for AI context size -- deferred to Phase 3 CLI scaffolder
- Artifact versioning and changelog (CIE-01) -- already tracked as v2 requirement
  </user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                                                                                    | Research Support                                                                                                                                              |
| ------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SYNC-01 | GitHub Action in edulution-ui syncs swagger-spec.json to framework repo on merge to dev        | Workflow-level push trigger on dev branch with paths filter for swagger-spec.json; cross-repo checkout with App token; file copy + diff-based no-op detection |
| SYNC-02 | GitHub Action in edulution-ui syncs tailwind config + CSS artifacts to framework repo on merge | Separate job in same workflow; paths filter for the three styling source files; same cross-repo mechanism                                                     |
| SYNC-03 | Path filtering ensures sync only runs when source files actually change                        | GitHub Actions native `on.push.paths` at workflow level plus job-level `if` conditions using `dorny/paths-filter` or `github.event` change detection          |
| SYNC-04 | Scheduled drift detection job opens issue when framework artifacts diverge                     | DEFERRED per user decision -- not implemented in this phase                                                                                                   |

</phase_requirements>

## Standard Stack

### Core

| Library/Action                        | Version | Purpose                                           | Why Standard                                                                                  |
| ------------------------------------- | ------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `actions/create-github-app-token`     | v1      | Generate installation token for cross-repo access | Already used in 3 existing workflows; v1 consistent with codebase                             |
| `actions/checkout`                    | v5      | Check out both source and target repos            | Already used in build-and-test.yml at v5.0.0                                                  |
| GitHub Actions native `on.push.paths` | N/A     | Workflow-level path filtering                     | Built-in, no dependencies, prevents workflow from running at all when irrelevant files change |

### Supporting

| Library/Action       | Version | Purpose                                     | When to Use                                                        |
| -------------------- | ------- | ------------------------------------------- | ------------------------------------------------------------------ |
| `dorny/paths-filter` | v3      | Job-level path filtering within a workflow  | If per-job path granularity is needed beyond workflow-level filter |
| `diff` (coreutils)   | system  | File content comparison for no-op detection | Always -- compare source vs target before committing               |

### Alternatives Considered

| Instead of                                   | Could Use                                               | Tradeoff                                                                                                                          |
| -------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `dorny/paths-filter` for job-level filtering | Native `if` conditions with `github.event` commits data | dorny is cleaner for multiple path sets; native approach has no external dependency but is more verbose                           |
| `actions/create-github-app-token@v1`         | `@v2` (latest)                                          | v2 adds permission-scoping inputs but v1 already supports `owner`/`repositories` params and is consistent with existing workflows |
| Direct git clone of framework repo           | `actions/checkout` with `repository` param              | Checkout action handles auth, sparse checkout, and caching; no reason to hand-roll git clone                                      |

## Architecture Patterns

### Recommended Workflow Structure

```
.github/workflows/
  sync-framework.yml    # Single file, two jobs
```

### Pattern 1: Workflow-Level Path Filter + Job-Level Conditionals

**What:** Use `on.push.paths` to list ALL tracked files at the workflow level (so the workflow only triggers when any sync-relevant file changes), then use job-level `if` conditions or `dorny/paths-filter` to determine which specific job (swagger vs styling) should run.
**When to use:** When a single workflow has multiple jobs that track different file sets.

**Recommendation:** Use workflow-level `on.push.paths` listing all 4 source files. For job-level filtering, use `dorny/paths-filter@v3` in a lightweight "detect" job whose outputs feed into the swagger and styling jobs via `needs` and `if` conditions. This is cleaner than parsing `github.event.commits[].modified` arrays manually.

**Example:**

```yaml
# Source: GitHub Actions docs + dorny/paths-filter docs
on:
  push:
    branches:
      - dev
    paths:
      - 'swagger-spec.json'
      - 'apps/frontend/tailwind.config.ts'
      - 'libs/ui-kit/tailwind.config.ts'
      - 'apps/frontend/src/index.scss'

jobs:
  detect-changes:
    runs-on: ubuntu-24.04
    outputs:
      swagger: ${{ steps.filter.outputs.swagger }}
      styling: ${{ steps.filter.outputs.styling }}
    steps:
      - uses: actions/checkout@v5
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            swagger:
              - 'swagger-spec.json'
            styling:
              - 'apps/frontend/tailwind.config.ts'
              - 'libs/ui-kit/tailwind.config.ts'
              - 'apps/frontend/src/index.scss'

  sync-swagger:
    needs: detect-changes
    if: needs.detect-changes.outputs.swagger == 'true'
    # ...

  sync-styling:
    needs: detect-changes
    if: needs.detect-changes.outputs.styling == 'true'
    # ...
```

### Pattern 2: Cross-Repo Checkout with App Token

**What:** Generate a GitHub App installation token scoped to the framework repo, then use `actions/checkout` with the `repository` and `token` params to check out the target repo into a subdirectory.
**When to use:** Whenever you need to read/write files in another repository.

**Example:**

```yaml
# Source: actions/create-github-app-token README + actions/checkout docs
- name: Create GitHub App Token
  id: app-token
  uses: actions/create-github-app-token@v1
  with:
    app-id: ${{ vars.VERSION_BUMPER_APPID }}
    private-key: ${{ secrets.VERSION_BUMPER_SECRET }}
    owner: ${{ github.repository_owner }}
    repositories: edulution-ai-framework

- name: Checkout edulution-ui (source)
  uses: actions/checkout@v5
  with:
    path: source

- name: Checkout framework repo (target)
  uses: actions/checkout@v5
  with:
    repository: edulution-io/edulution-ai-framework
    token: ${{ steps.app-token.outputs.token }}
    path: target
    ref: main
```

### Pattern 3: No-Op Detection via File Content Comparison

**What:** After copying source files to the target directory, use `git diff --quiet` to detect whether any actual content changed. Only commit and push if there are real differences.
**When to use:** Always -- prevents empty commits and unnecessary push operations.

**Example:**

```yaml
- name: Copy and check for changes
  id: sync
  run: |
    cp source/swagger-spec.json target/artifacts/swagger-spec.json
    cd target
    git diff --quiet -- artifacts/swagger-spec.json && echo "changed=false" >> "$GITHUB_OUTPUT" || echo "changed=true" >> "$GITHUB_OUTPUT"

- name: Commit and push
  if: steps.sync.outputs.changed == 'true'
  run: |
    cd target
    git config user.name 'github-actions[bot]'
    git config user.email 'github-actions[bot]@users.noreply.github.com'
    git add artifacts/
    git commit -m "sync: update swagger-spec.json from edulution-ui"
    git push
```

### Pattern 4: Detailed Diff Summary in Commit Messages

**What:** Generate a human-readable summary of what changed for the commit message. For swagger, summarize endpoint changes; for styling, summarize config/variable changes.
**When to use:** Per user decision -- commit messages must include detailed diff summaries.

**Recommendation:** Use `git diff --stat` for a high-level overview and `git diff` piped through a simple summarizer for key details. For swagger, `diff` the JSON to identify added/removed/changed paths. For styling files, `git diff --stat` is usually sufficient.

**Example:**

```yaml
- name: Generate diff summary
  id: diff-summary
  run: |
    cd target
    SUMMARY=$(git diff --stat -- artifacts/swagger-spec.json | head -5)
    # For swagger: count added/removed endpoint paths
    ADDED=$(diff <(jq -r '.paths | keys[]' artifacts/swagger-spec.json 2>/dev/null || echo "") \
                 <(jq -r '.paths | keys[]' source/swagger-spec.json 2>/dev/null || echo "") \
            | grep '^>' | wc -l)
    REMOVED=$(diff <(jq -r '.paths | keys[]' artifacts/swagger-spec.json 2>/dev/null || echo "") \
                   <(jq -r '.paths | keys[]' source/swagger-spec.json 2>/dev/null || echo "") \
              | grep '^<' | wc -l)
    {
      echo "summary<<EOF"
      echo "$SUMMARY"
      echo ""
      echo "Endpoints: +${ADDED} -${REMOVED}"
      echo "EOF"
    } >> "$GITHUB_OUTPUT"
```

### Anti-Patterns to Avoid

- **Using `git clone` instead of `actions/checkout`:** The checkout action handles auth header injection, shallow clones, and credential cleanup. Manual clone misses these.
- **Committing without content check:** Always use `git diff --quiet` before commit. Without it, the workflow will fail on empty commits or create noise.
- **Using `GITHUB_TOKEN` for cross-repo access:** `GITHUB_TOKEN` is scoped to the current repository only. Must use App token or PAT for framework repo.
- **Using `persist-credentials: true` (default) with multiple checkouts:** When checking out two repos in the same job, the second checkout can overwrite the first's credentials. Use `persist-credentials: false` on the source checkout to avoid conflicts.
- **Parsing `github.event.commits` for path filtering:** The commits array in push events can be empty for force pushes and has a limit. Use `dorny/paths-filter` which uses `git diff` under the hood.

## Don't Hand-Roll

| Problem                       | Don't Build                                                  | Use Instead                                               | Why                                                                                  |
| ----------------------------- | ------------------------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Cross-repo authentication     | Manual JWT generation for GitHub App                         | `actions/create-github-app-token@v1`                      | JWT signing, installation lookup, token caching are all handled                      |
| Repository checkout with auth | `git clone` with token in URL                                | `actions/checkout@v5` with `repository` + `token` params  | Handles credential injection, cleanup, shallow clone optimization                    |
| Job-level path filtering      | Parse `github.event.commits[].added/modified/removed` arrays | `dorny/paths-filter@v3` or workflow-level `on.push.paths` | Commit arrays can be truncated, empty on force push, don't handle merge commits well |
| Diff summary generation       | Complex jq/python scripts                                    | Simple `git diff --stat` + targeted `diff` commands       | Keep it simple; sophisticated analysis is overkill for commit messages               |

**Key insight:** This workflow is fundamentally simple -- copy files, check if different, commit if yes. The complexity is in authentication and path filtering, both of which have battle-tested Actions.

## Common Pitfalls

### Pitfall 1: Credential Conflict with Multiple Checkouts

**What goes wrong:** When using `actions/checkout` twice in the same job (source + target repo), the second checkout's persisted credentials overwrite the first's. Subsequent git operations on the source repo fail silently or with auth errors.
**Why it happens:** `actions/checkout` persists credentials in the git config by default.
**How to avoid:** Set `persist-credentials: false` on the source repo checkout, or use separate `path` directories for each checkout and configure git credentials per-directory.
**Warning signs:** "Authentication failed" errors on git operations after the second checkout.

### Pitfall 2: Empty Swagger Spec

**What goes wrong:** The `swagger-spec.json` in the repo is currently 0 bytes (empty file). If the workflow runs before the spec is populated, it would sync an empty file to the framework repo.
**Why it happens:** The spec might be generated during build or only present in certain branches.
**How to avoid:** Add a file-size check before syncing: `if [ -s source/swagger-spec.json ]; then ...`. Skip sync if file is empty.
**Warning signs:** Framework repo's `artifacts/swagger-spec.json` is 0 bytes.

### Pitfall 3: Race Condition on Concurrent Merges

**What goes wrong:** Two PRs merge to `dev` in quick succession, both changing swagger-spec.json. Both workflow runs clone the framework repo, but the second push fails because the first already pushed.
**Why it happens:** Git push requires a fast-forward merge.
**How to avoid:** Add `git pull --rebase origin main` before push, or use retry logic. For a simple file sync, a rebase-then-push is sufficient.
**Warning signs:** Workflow failure with "non-fast-forward" or "rejected" push error.

### Pitfall 4: Path Filter Not Evaluated on Tag Pushes

**What goes wrong:** GitHub Actions docs state: "Path filters are not evaluated for pushes of tags." If the workflow triggers on tags, path filtering is bypassed.
**Why it happens:** Tags point to commits, not file changes.
**How to avoid:** Only trigger on branch pushes (`branches: [dev]`), never tags. This is already the plan.
**Warning signs:** Workflow runs on every tag push regardless of changed files.

### Pitfall 5: `artifacts/` Directory Doesn't Exist in Framework Repo

**What goes wrong:** The `cp` command or `git add` fails because the target directory doesn't exist yet.
**Why it happens:** Framework repo doesn't have an `artifacts/` directory yet (confirmed by inspection).
**How to avoid:** Add `mkdir -p target/artifacts` before copying files.
**Warning signs:** "No such file or directory" error in workflow logs.

### Pitfall 6: App Token Not Scoped to Framework Repo

**What goes wrong:** The generated App token doesn't have access to the framework repo, causing checkout or push to fail with 403.
**Why it happens:** If `owner` and `repositories` params are omitted, the token is scoped to the current repo only.
**How to avoid:** Explicitly set `owner: ${{ github.repository_owner }}` and `repositories: edulution-ai-framework` in the token generation step.
**Warning signs:** 403 Forbidden on checkout or push to framework repo.

## Code Examples

### Complete Sync Job Pattern

```yaml
# Source: Derived from existing edulution-ui workflow patterns
# + actions/create-github-app-token docs + actions/checkout docs
sync-swagger:
  needs: detect-changes
  if: needs.detect-changes.outputs.swagger == 'true'
  runs-on: ubuntu-24.04
  timeout-minutes: 10
  steps:
    - name: Create GitHub App Token
      id: app-token
      uses: actions/create-github-app-token@v1
      with:
        app-id: ${{ vars.VERSION_BUMPER_APPID }}
        private-key: ${{ secrets.VERSION_BUMPER_SECRET }}
        owner: ${{ github.repository_owner }}
        repositories: edulution-ai-framework

    - name: Checkout edulution-ui
      uses: actions/checkout@v5
      with:
        path: source
        persist-credentials: false

    - name: Checkout framework repo
      uses: actions/checkout@v5
      with:
        repository: edulution-io/edulution-ai-framework
        token: ${{ steps.app-token.outputs.token }}
        path: target
        ref: main

    - name: Sync swagger-spec.json
      id: sync
      run: |
        mkdir -p target/artifacts
        if [ ! -s source/swagger-spec.json ]; then
          echo "swagger-spec.json is empty, skipping sync"
          echo "changed=false" >> "$GITHUB_OUTPUT"
          exit 0
        fi
        cp source/swagger-spec.json target/artifacts/swagger-spec.json
        cd target
        if git diff --quiet -- artifacts/swagger-spec.json; then
          echo "No changes detected"
          echo "changed=false" >> "$GITHUB_OUTPUT"
        else
          echo "changed=true" >> "$GITHUB_OUTPUT"
        fi

    - name: Generate diff summary
      if: steps.sync.outputs.changed == 'true'
      id: summary
      run: |
        cd target
        STAT=$(git diff --stat -- artifacts/swagger-spec.json)
        {
          echo "msg<<EOF"
          echo "sync: update swagger-spec.json from edulution-ui"
          echo ""
          echo "Source: ${{ github.repository }}@${{ github.sha }}"
          echo ""
          echo "$STAT"
          echo "EOF"
        } >> "$GITHUB_OUTPUT"

    - name: Commit and push
      if: steps.sync.outputs.changed == 'true'
      run: |
        cd target
        git config user.name 'github-actions[bot]'
        git config user.email 'github-actions[bot]@users.noreply.github.com'
        git add artifacts/swagger-spec.json
        git pull --rebase origin main
        git commit -m "${{ steps.summary.outputs.msg }}"
        git push origin main
```

### Styling Sync Job Pattern (Multiple Files)

```yaml
# Source: Same pattern adapted for multiple files
sync-styling:
  needs: detect-changes
  if: needs.detect-changes.outputs.styling == 'true'
  runs-on: ubuntu-24.04
  timeout-minutes: 10
  steps:
    # ... (same token + checkout steps as swagger job) ...

    - name: Sync styling artifacts
      id: sync
      run: |
        mkdir -p target/artifacts
        cp source/apps/frontend/tailwind.config.ts target/artifacts/tailwind.config.ts
        cp source/libs/ui-kit/tailwind.config.ts target/artifacts/tailwind.base.config.ts
        cp source/apps/frontend/src/index.scss target/artifacts/index.scss
        cd target
        if git diff --quiet -- artifacts/tailwind.config.ts artifacts/tailwind.base.config.ts artifacts/index.scss; then
          echo "No changes detected"
          echo "changed=false" >> "$GITHUB_OUTPUT"
        else
          echo "changed=true" >> "$GITHUB_OUTPUT"
        fi
```

### File Rename Mapping

```
Source (edulution-ui)                          -> Target (framework artifacts/)
swagger-spec.json                             -> artifacts/swagger-spec.json
apps/frontend/tailwind.config.ts              -> artifacts/tailwind.config.ts
libs/ui-kit/tailwind.config.ts                -> artifacts/tailwind.base.config.ts
apps/frontend/src/index.scss                  -> artifacts/index.scss
```

Note: `tailwind.base.config.ts` is a renamed copy of `libs/ui-kit/tailwind.config.ts` per user decision.

## State of the Art

| Old Approach                                             | Current Approach                                  | When Changed | Impact                                                                           |
| -------------------------------------------------------- | ------------------------------------------------- | ------------ | -------------------------------------------------------------------------------- |
| PATs for cross-repo access                               | GitHub App installation tokens                    | 2024+        | Short-lived, auto-revoked, auditable, no user-tied credentials                   |
| `actions/checkout@v4`                                    | `actions/checkout@v5`                             | 2025         | Minor; edulution-ui already on v5 in build-and-test.yml                          |
| `actions/create-github-app-token@v1`                     | `@v2` available (v2.2.1 latest)                   | 2025         | v2 adds `permission-*` inputs for fine-grained scoping; v1 still fully supported |
| Manual `github.event.commits` parsing for path detection | `dorny/paths-filter@v3` or native `on.push.paths` | 2023+        | Reliable, handles edge cases (merge commits, force pushes)                       |

**Deprecated/outdated:**

- `tibdex/github-app-token`: Superseded by official `actions/create-github-app-token`
- Manual JWT generation for GitHub Apps: Fully replaced by the create-github-app-token action

## Open Questions

1. **Swagger spec is currently 0 bytes**
   - What we know: `swagger-spec.json` in the repo root is an empty file (0 lines, 0 bytes)
   - What's unclear: Whether this file gets populated during build/release, or if it's a placeholder
   - Recommendation: Add an empty-file guard in the workflow (skip sync if file is empty). This is a non-blocking question; the workflow should handle both cases gracefully.

2. **VERSION_BUMPER App permissions on framework repo**
   - What we know: User stated App is installed org-wide on edulution-io with Contents read/write and Metadata permissions. Framework repo is in the same org.
   - What's unclear: Whether the App installation actually covers `edulution-ai-framework` (user planned to verify)
   - Recommendation: The workflow should fail clearly if permissions are insufficient. Add a verification step in testing. Non-blocking for planning.

3. **Concurrent merge race condition strategy**
   - What we know: `git pull --rebase` before push handles most cases
   - What's unclear: Whether the edulution-ui dev branch sees frequent enough concurrent merges to warrant retry logic
   - Recommendation: Start with simple `git pull --rebase origin main` before push. Add retry logic only if failures occur in practice.

## Validation Architecture

### Test Framework

| Property           | Value                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| Framework          | GitHub Actions (workflow yaml, no unit tests)                                                    |
| Config file        | `.github/workflows/sync-framework.yml`                                                           |
| Quick run command  | `act push -W .github/workflows/sync-framework.yml` (local) or manual `workflow_dispatch` trigger |
| Full suite command | Push a change to tracked file on dev branch and verify framework repo update                     |

### Phase Requirements to Test Map

| Req ID  | Behavior                                | Test Type          | Automated Command                                                      | File Exists? |
| ------- | --------------------------------------- | ------------------ | ---------------------------------------------------------------------- | ------------ |
| SYNC-01 | Swagger sync on dev merge               | manual/integration | Push swagger-spec.json change to dev, verify framework repo artifacts/ | No -- Wave 0 |
| SYNC-02 | Styling sync on dev merge               | manual/integration | Push tailwind config change to dev, verify framework repo artifacts/   | No -- Wave 0 |
| SYNC-03 | Path filtering skips irrelevant changes | manual/integration | Push unrelated file change to dev, verify workflow does NOT trigger    | No -- Wave 0 |
| SYNC-04 | Drift detection                         | DEFERRED           | N/A                                                                    | N/A          |

### Sampling Rate

- **Per task commit:** YAML linting via `actionlint` if available, or manual review
- **Per wave merge:** Push test change to dev branch, observe GitHub Actions run
- **Phase gate:** All sync behaviors verified on actual dev branch pushes

### Wave 0 Gaps

- [ ] `.github/workflows/sync-framework.yml` -- the workflow file itself (the deliverable)
- [ ] `artifacts/` directory in framework repo -- needs to be created by first sync run or pre-created
- [ ] `actionlint` for local YAML validation (optional but helpful)
- [ ] Manual test plan: push specific file changes to dev and verify sync behavior

_(Note: This phase's deliverable IS the CI workflow. Testing is inherently integration-level -- verify by running the actual workflow on GitHub Actions.)_

## Sources

### Primary (HIGH confidence)

- [actions/create-github-app-token README](https://github.com/actions/create-github-app-token) -- v1/v2 params, cross-repo scoping, `owner`/`repositories` usage
- [GitHub Actions workflow syntax docs](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions) -- `on.push.paths` filter syntax, branch+paths combination behavior
- [actions/checkout docs](https://github.com/actions/checkout) -- `repository`, `token`, `path`, `persist-credentials` params
- Existing edulution-ui workflows (`auto-merge-master-back-in-dev.yml`, `build-and-test.yml`, `bump-minor-version-tag.yml`) -- established patterns for App token usage, git config, runner version

### Secondary (MEDIUM confidence)

- [dorny/paths-filter](https://github.com/dorny/paths-filter) -- job-level path filtering; well-maintained, widely used
- [Some Natalie: Push commits to another repository](https://some-natalie.dev/blog/multi-repo-actions/) -- cross-repo push patterns and gotchas
- [GitHub Events that trigger workflows docs](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows) -- push event path filter behavior, tag push caveat

### Tertiary (LOW confidence)

- None -- all findings verified with primary or secondary sources

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH -- all Actions are official or well-established; existing workflows provide exact patterns
- Architecture: HIGH -- workflow structure is straightforward; cross-repo checkout is well-documented
- Pitfalls: HIGH -- identified through direct code inspection (empty swagger spec, no artifacts/ dir) and official docs (credential conflicts, tag push caveat)

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable domain; GitHub Actions syntax rarely changes)
