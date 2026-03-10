# Phase 5: Dog-Fooding - Research

**Researched:** 2026-03-10
**Domain:** Git submodules, AGENTS.md/CLAUDE.md convention system, GitHub Actions CI
**Confidence:** HIGH

## Summary

Phase 5 converts edulution-ui from having an inline 66-line AGENTS.md to consuming its own AI framework via a proper git submodule reference. The framework directory already exists locally as a nested git repo tracked as a gitlink (mode 160000) in the index, but lacks the `.gitmodules` metadata file that makes it a proper submodule. The conversion requires removing the gitlink from the index, re-adding as a formal submodule, replacing AGENTS.md content with a single `@` import reference, and updating sync-framework.yml to dog-food the composite checkout action.

The `@` import syntax in CLAUDE.md/AGENTS.md supports recursive imports up to 5 hops deep. The current chain `CLAUDE.md -> @AGENTS.md` (1 hop) will become `CLAUDE.md -> @AGENTS.md -> @edulution-ai-framework/edulution-ui/AGENTS.md` (2 hops), well within limits. The framework's edulution-ui layer (65 lines) already contains equivalent content to the current inline AGENTS.md, so no content reconciliation is needed.

**Primary recommendation:** Use `git rm --cached edulution-ai-framework` followed by `git submodule add` to convert the existing gitlink to a proper submodule; replace AGENTS.md with a single `@` reference line; update sync-framework.yml to use the composite action for checkout.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Root AGENTS.md becomes a single `@edulution-ai-framework/edulution-ui/AGENTS.md` reference -- no inline content retained
- Framework is the single source of truth for conventions; no bidirectional sync of convention content
- Framework's edulution-ui layer is already complete -- no diff/reconciliation needed before switching
- Old inline AGENTS.md content preserved only in git history -- no backup file
- CLAUDE.md stays as `@AGENTS.md` (unchanged) -- transitive resolution through AGENTS.md to framework, trust the spec
- Register the existing `edulution-ai-framework/` directory as a proper submodule (creates .gitmodules)
- Use `git submodule add` pointing to the existing path -- preserves current state
- Only sync-framework.yml needs submodule checkout (for diffing source vs framework files before pushing)
- sync-framework.yml uses the composite action from the framework for submodule checkout -- dog-foods the action itself
- Both submodule checkout (read) and artifact push (write) use the same app token -- single auth flow, no additional secrets
- Build, test, and deploy workflows do NOT need the submodule
- Framework owns all convention content -- no AGENTS.md sync from edulution-ui to framework
- Automated file checks only: .gitmodules exists, submodule registered, root AGENTS.md contains @ reference, CLAUDE.md unchanged, framework files reachable
- Path existence checks only -- no content smoke checks (framework content validated in Phase 1)
- No ongoing CI validation -- git naturally maintains submodule state

### Claude's Discretion

None -- all decisions locked during discussion.

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>

## Phase Requirements

| ID     | Description                                                                    | Research Support                                                                                                                                   |
| ------ | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| DOG-01 | edulution-ui adds framework as git submodule at root level                     | Gitlink-to-submodule conversion procedure verified; `git rm --cached` + `git submodule add` creates .gitmodules and proper submodule entry         |
| DOG-02 | edulution-ui's inline AGENTS.md removed, replaced by framework's layered files | `@` import syntax verified in Claude Code docs; recursive imports supported up to 5 hops; framework edulution-ui layer contains equivalent content |
| DOG-03 | CLAUDE.md updated to reference framework's AGENTS.md via submodule path        | CLAUDE.md already contains `@AGENTS.md`; transitive resolution confirmed working; CLAUDE.md needs no change per locked decision                    |

</phase_requirements>

## Standard Stack

### Core

| Tool                                | Version  | Purpose                                   | Why Standard                                                      |
| ----------------------------------- | -------- | ----------------------------------------- | ----------------------------------------------------------------- |
| git submodule                       | Git 2.x+ | Register framework as proper submodule    | Native git feature for nested repo management                     |
| AGENTS.md `@` syntax                | Spec v1  | File import/inclusion in convention files | Official Claude Code import mechanism, supports recursive imports |
| actions/checkout@v5                 | v5       | CI checkout with submodule support        | Used by all existing edulution-ui workflows                       |
| checkout-submodule composite action | v1       | CI checkout with private submodule auth   | Built in Phase 1, wraps actions/checkout with token injection     |

### Supporting

| Tool                               | Purpose                                      | When to Use                                                         |
| ---------------------------------- | -------------------------------------------- | ------------------------------------------------------------------- |
| actions/create-github-app-token@v1 | Generate app token for framework repo access | In sync-framework.yml for both submodule checkout and artifact push |
| dorny/paths-filter@v3              | Path-based change detection                  | Already used in sync-framework.yml, no changes needed               |

### Alternatives Considered

None -- all decisions locked. No alternatives to evaluate.

## Architecture Patterns

### Reference Chain After Switchover

```
CLAUDE.md                          (1 line: @AGENTS.md)
  -> AGENTS.md                     (1 line: @edulution-ai-framework/edulution-ui/AGENTS.md)
    -> edulution-ai-framework/
         edulution-ui/AGENTS.md    (65 lines: edulution-ui conventions)
         ../typescript/AGENTS.md   (45 lines: shared TypeScript conventions)
         ../AGENTS.md              (60 lines: universal edulution conventions)
```

Claude Code's AGENTS.md filesystem inheritance (directory-based auto-discovery) handles the layer composition automatically. The edulution-ui layer at `edulution-ai-framework/edulution-ui/AGENTS.md` states it "inherits universal conventions from the root AGENTS.md and TypeScript conventions from `../typescript/AGENTS.md` via filesystem discovery." AI tools walking up the directory tree from the edulution-ui layer will find `typescript/AGENTS.md` and root `AGENTS.md` automatically.

### Submodule Registration Pattern

The current state has a gitlink (mode 160000 commit reference) at `edulution-ai-framework` pointing to commit `db638cfdcd4b688a74ca16f5240e102dcd973a76`, but no `.gitmodules` file. The conversion procedure:

```bash
# Step 1: Remove gitlink from index (keeps directory intact)
git rm --cached edulution-ai-framework

# Step 2: Add as proper submodule (detects existing valid git repo, skips clone)
git submodule add git@github.com:edulution-io/edulution-ai-framework.git edulution-ai-framework

# Result: .gitmodules created, submodule registered in .git/config
```

Per official git docs: "If <path> exists and is already a valid Git repository, then it is staged for commit without cloning." No data loss occurs.

### CI Workflow Change Pattern

The sync-framework.yml currently uses two separate `actions/checkout@v5` steps (source + target). The change adds a composite action step for the source checkout:

**Before:**

```yaml
- name: Checkout edulution-ui
  uses: actions/checkout@v5
  with:
    path: source
    persist-credentials: false
```

**After:**

```yaml
- name: Checkout edulution-ui with framework submodule
  uses: edulution-io/edulution-ai-framework/.github/actions/checkout-submodule@main
  with:
    token: ${{ steps.app-token.outputs.token }}
```

Key considerations:

- The composite action wraps `actions/checkout@v5` with `submodules: recursive` and token injection
- The composite action does NOT support the `path:` input -- it checks out to the default working directory
- The current workflow checks out edulution-ui to `source/` path -- the composite action would check out to `.`
- The separate framework repo checkout (target) is still needed for pushing artifacts
- The sync steps that reference `source/` paths would need updating to `.` paths

### Anti-Patterns to Avoid

- **Manually creating .gitmodules**: Use `git submodule add` command, never hand-write `.gitmodules` files. The command also registers the submodule in `.git/config`.
- **Adding trailing slash to git rm --cached**: `git rm --cached edulution-ai-framework/` will fail. Must use `git rm --cached edulution-ai-framework` without trailing slash.
- **Changing CLAUDE.md**: Per locked decision, CLAUDE.md stays as `@AGENTS.md`. The transitive resolution through AGENTS.md to the framework is the correct pattern.
- **Adding submodule checkout to build/test workflows**: Per locked decision, only sync-framework.yml needs the submodule. Build, test, and deploy workflows do not reference framework content.

## Don't Hand-Roll

| Problem                      | Don't Build                              | Use Instead                          | Why                                                                                 |
| ---------------------------- | ---------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------- |
| Private submodule auth in CI | Manual token injection via git config    | checkout-submodule composite action  | Already built and tested in Phase 1; handles token injection and recursive checkout |
| .gitmodules creation         | Manually writing .gitmodules file        | `git submodule add` command          | Command handles both .gitmodules and .git/config registration atomically            |
| Convention content           | Inline AGENTS.md with duplicated content | Framework's layered AGENTS.md system | Framework is single source of truth; duplication causes drift                       |
| File import syntax           | Custom script to concatenate .md files   | CLAUDE.md `@path` import syntax      | Built-in Claude Code feature with recursive support up to 5 hops                    |

**Key insight:** This phase is entirely about wiring -- connecting existing pieces. No new content needs to be written; only references and registrations need to change.

## Common Pitfalls

### Pitfall 1: git submodule add fails with "already exists in the index"

**What goes wrong:** Running `git submodule add` on a path that already has a gitlink in the index produces an error.
**Why it happens:** The framework directory is already tracked as a gitlink (mode 160000) without .gitmodules. Git refuses to add a submodule when the path is already in the index.
**How to avoid:** Run `git rm --cached edulution-ai-framework` (no trailing slash!) before `git submodule add`. The `--cached` flag removes only the index entry, preserving the actual directory and its contents.
**Warning signs:** Error message "edulution-ai-framework already exists in the index."

### Pitfall 2: Composite action path: parameter incompatibility

**What goes wrong:** The checkout-submodule composite action may not support the `path:` input that the sync workflow currently uses to checkout edulution-ui to `source/`.
**Why it happens:** The composite action wraps `actions/checkout@v5` but only exposes `token` and `fetch-depth` inputs. It does not forward a `path` parameter.
**How to avoid:** Either (a) modify the composite action to accept a `path` input, or (b) adjust the sync workflow to use the default checkout directory (`.`) instead of `source/`. Option (b) requires updating all `source/` path references in the sync steps.
**Warning signs:** Workflow files referencing `source/` paths after switching to the composite action.

### Pitfall 3: Submodule SSH vs HTTPS URL mismatch in CI

**What goes wrong:** The submodule is registered with SSH URL (`git@github.com:...`) but CI uses HTTPS tokens for authentication.
**Why it happens:** `git submodule add git@github.com:...` registers the SSH URL in .gitmodules. The composite action uses token-based HTTPS auth. When `actions/checkout` processes submodules, it rewrites URLs using the token.
**How to avoid:** This is actually handled correctly by `actions/checkout@v5` -- it automatically translates `git@github.com:` URLs to `https://` URLs using the provided token. The SSH URL in .gitmodules works for local development (SSH keys) and CI (token rewriting). No issue here.
**Warning signs:** None expected -- this is a non-issue but worth verifying.

### Pitfall 4: Breaking existing CI workflows

**What goes wrong:** Adding a submodule could cause build-and-test or other CI workflows to fail if they try to initialize submodules.
**Why it happens:** If workflows use `submodules: true` or `recursive` in their checkout step, they'd try to fetch the private framework repo without proper auth.
**How to avoid:** Verified that all existing workflows (build-and-test, container-build, version bumping, etc.) use `actions/checkout` WITHOUT the `submodules` parameter, which defaults to `false`. The submodule is simply ignored in those workflows.
**Warning signs:** CI failures with 401/403 errors mentioning "edulution-ai-framework."

### Pitfall 5: AGENTS.md @ reference not resolving

**What goes wrong:** AI tools cannot find the framework's AGENTS.md via the `@` reference.
**Why it happens:** The submodule directory must be initialized locally for the path to resolve. If a developer clones without `--recurse-submodules`, the `edulution-ai-framework/` directory will be empty.
**How to avoid:** Documentation should note that developers need to run `git submodule update --init --recursive` after cloning. The framework's integration guide already covers this in the troubleshooting section.
**Warning signs:** AI tool shows "file not found" for the `@` reference; `edulution-ai-framework/` directory is empty.

## Code Examples

### AGENTS.md replacement content

```markdown
@edulution-ai-framework/edulution-ui/AGENTS.md
```

Source: CONTEXT.md locked decision -- single line, no inline content.

### .gitmodules file (auto-generated by git submodule add)

```ini
[submodule "edulution-ai-framework"]
	path = edulution-ai-framework
	url = git@github.com:edulution-io/edulution-ai-framework.git
```

Source: Standard git submodule format, generated by `git submodule add`.

### sync-framework.yml composite action step

```yaml
- name: Checkout edulution-ui with framework submodule
  uses: edulution-io/edulution-ai-framework/.github/actions/checkout-submodule@main
  with:
    token: ${{ steps.app-token.outputs.token }}
```

Source: Framework's composite action at `.github/actions/checkout-submodule/action.yml`, already built in Phase 1.

### Validation script pattern (shell checks)

```bash
# .gitmodules exists
test -f .gitmodules

# Submodule is registered
git submodule status | grep -q edulution-ai-framework

# AGENTS.md contains @ reference
grep -q '@edulution-ai-framework' AGENTS.md

# CLAUDE.md unchanged (still @AGENTS.md)
grep -q '@AGENTS.md' CLAUDE.md

# Framework files reachable
test -f edulution-ai-framework/edulution-ui/AGENTS.md
test -f edulution-ai-framework/AGENTS.md
test -f edulution-ai-framework/typescript/AGENTS.md
```

Source: Derived from CONTEXT.md locked decisions on validation approach.

## State of the Art

| Old Approach                                | Current Approach                       | When Changed         | Impact                                                         |
| ------------------------------------------- | -------------------------------------- | -------------------- | -------------------------------------------------------------- |
| Inline AGENTS.md conventions                | Submodule-referenced layered AGENTS.md | Phase 5 (this phase) | Single source of truth, no content drift                       |
| Gitlink without .gitmodules                 | Proper git submodule with .gitmodules  | Phase 5 (this phase) | Other developers and CI can clone and initialize the submodule |
| Separate source/target checkouts in sync CI | Composite action for source checkout   | Phase 5 (this phase) | Dog-foods the framework's own CI helper                        |

**Deprecated/outdated:**

- Inline AGENTS.md with 66 lines of conventions: Replaced by framework reference. Content preserved in git history only.

## Open Questions

1. **Composite action `path` input support**
   - What we know: The composite action only exposes `token` and `fetch-depth` inputs. The sync workflow currently checks out edulution-ui to `source/` path.
   - What's unclear: Whether to modify the composite action to accept a `path` input or refactor the sync workflow to use default checkout path.
   - Recommendation: Refactor the sync workflow to use default checkout path (`.`) since the composite action is shared across consumers and adding edulution-ui-specific inputs would complicate it. Update `source/` references in sync steps to use `.` instead.

## Validation Architecture

### Test Framework

| Property           | Value                                                  |
| ------------------ | ------------------------------------------------------ |
| Framework          | Shell script assertions (file existence, content grep) |
| Config file        | None -- inline validation commands                     |
| Quick run command  | `test -f .gitmodules && git submodule status`          |
| Full suite command | Shell script checking all 6 validation criteria        |

### Phase Requirements to Test Map

| Req ID | Behavior                                                    | Test Type | Automated Command                                                                         | File Exists? |
| ------ | ----------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------- | ------------ |
| DOG-01 | .gitmodules exists and submodule registered                 | smoke     | `test -f .gitmodules && git submodule status \| grep -q edulution-ai-framework`           | No -- Wave 0 |
| DOG-02 | AGENTS.md contains @ framework reference, no inline content | smoke     | `grep -q '@edulution-ai-framework' AGENTS.md && test $(wc -l < AGENTS.md) -le 2`          | No -- Wave 0 |
| DOG-03 | CLAUDE.md unchanged, framework files reachable              | smoke     | `grep -q '@AGENTS.md' CLAUDE.md && test -f edulution-ai-framework/edulution-ui/AGENTS.md` | No -- Wave 0 |

### Sampling Rate

- **Per task commit:** `test -f .gitmodules && git submodule status`
- **Per wave merge:** Full shell validation script (all 6 checks)
- **Phase gate:** All checks green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] No test script file exists -- validation is inline shell commands
- [ ] Framework install: None needed -- git submodule commands are built-in

_(Validation for this phase is simple enough that inline shell commands suffice. No test framework installation required.)_

## Sources

### Primary (HIGH confidence)

- [Git submodule documentation](https://git-scm.com/docs/git-submodule) - Verified `git submodule add` behavior with existing valid Git repos: "If <path> exists and is already a valid Git repository, then it is staged for commit without cloning."
- [Claude Code Memory Documentation](https://code.claude.com/docs/en/memory) - Verified `@` import syntax: "Imported files can recursively import other files, with a maximum depth of five hops. Relative paths resolve relative to the file containing the import."
- [actions/checkout repository](https://github.com/actions/checkout) - Verified default `submodules: false` behavior; existing workflows unaffected.
- Existing codebase inspection (HIGH confidence):
  - `git ls-tree HEAD edulution-ai-framework` shows mode 160000 (gitlink) at commit `db638cf`
  - No `.gitmodules` file exists
  - No submodule config in local `.git/config`
  - Framework remote: `git@github.com:edulution-io/edulution-ai-framework.git`
  - CLAUDE.md contains single line `@AGENTS.md`
  - AGENTS.md contains 66 lines of inline conventions
  - Framework's edulution-ui/AGENTS.md contains 65 lines of equivalent content

### Secondary (MEDIUM confidence)

- [GitHub community discussion on gitlink conversion](https://github.com/orgs/community/discussions/51876) - Confirms `git rm --cached` + `git submodule add` procedure for converting gitlinks
- [Tutorial on nested repos and gitlinks](https://www.tutorialpedia.org/blog/nested-git-repositories-without-remotes-a-k-a-git-submodule-without-remotes/) - Explains gitlink vs proper submodule distinction
- [AGENTS.md specification](https://agents.md/) - Confirms directory-based auto-discovery for nested AGENTS.md files

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - All tools are native git features or already-built project components
- Architecture: HIGH - Reference chain verified against Claude Code docs; existing framework content inspected
- Pitfalls: HIGH - Gitlink conversion procedure verified against official git docs and community resources

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable domain -- git submodule mechanics and AGENTS.md spec are well-established)
