# Phase 5: Dog-Fooding - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

edulution-ui consumes its own framework as a git submodule, replacing the inline AGENTS.md with a reference to the framework's layered convention system. Proves the framework is complete enough to be the single source of truth for AI coding conventions.

</domain>

<decisions>
## Implementation Decisions

### AGENTS.md replacement strategy

- Root AGENTS.md becomes a single `@edulution-ai-framework/edulution-ui/AGENTS.md` reference — no inline content retained
- Framework is the single source of truth for conventions; no bidirectional sync of convention content
- Framework's edulution-ui layer is already complete — no diff/reconciliation needed before switching
- Old inline AGENTS.md content preserved only in git history — no backup file
- CLAUDE.md stays as `@AGENTS.md` (unchanged) — transitive resolution through AGENTS.md to framework, trust the spec

### Submodule registration

- Register the existing `edulution-ai-framework/` directory as a proper submodule (creates .gitmodules)
- Use `git submodule add` pointing to the existing path — preserves current state

### CI workflow scope

- Only sync-framework.yml needs submodule checkout (for diffing source vs framework files before pushing)
- sync-framework.yml uses the composite action from the framework for submodule checkout — dog-foods the action itself
- Both submodule checkout (read) and artifact push (write) use the same app token — single auth flow, no additional secrets
- Build, test, and deploy workflows do NOT need the submodule
- Framework owns all convention content — no AGENTS.md sync from edulution-ui to framework

### Switchover validation

- Automated file checks only: .gitmodules exists, submodule registered, root AGENTS.md contains @ reference, CLAUDE.md unchanged, framework files reachable
- Path existence checks only — no content smoke checks (framework content validated in Phase 1)
- No ongoing CI validation — git naturally maintains submodule state

### Claude's Discretion

None — all decisions locked during discussion.

</decisions>

<code_context>

## Existing Code Insights

### Reusable Assets

- `edulution-ai-framework/` directory: Already exists locally as a full git repo with all framework content
- `.github/actions/checkout-submodule/action.yml`: Composite action ready for CI submodule auth
- `.github/workflows/sync-framework.yml`: Existing sync workflow to extend with submodule checkout

### Established Patterns

- CLAUDE.md -> AGENTS.md -> framework reference chain: Already the intended pattern from Phase 1
- App token auth in sync-framework.yml: Reuse for submodule checkout auth
- Composite action for private submodule checkout: Built in Phase 1, tested by consumer projects

### Integration Points

- Root `AGENTS.md`: Replace 66-line inline content with single @ reference
- Root `CLAUDE.md`: No change needed (already `@AGENTS.md`)
- `.gitmodules`: Create new file registering the submodule
- `sync-framework.yml`: Add composite action step for submodule checkout before diff

</code_context>

<specifics>
## Specific Ideas

- User wants persistent auth flow — app token handles both read and write operations to framework repo
- Dog-food the composite action in sync-framework.yml to prove it works in edulution-ui's own CI

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 05-dog-fooding_
_Context gathered: 2026-03-10_
