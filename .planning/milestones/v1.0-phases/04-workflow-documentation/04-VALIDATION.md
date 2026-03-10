---
phase: 4
slug: workflow-documentation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                                                |
| ---------------------- | -------------------------------------------------------------------- |
| **Framework**          | Vitest 3.x                                                           |
| **Config file**        | `cli/vitest.config.ts`                                               |
| **Quick run command**  | `cd edulution-ai-framework/cli && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd edulution-ai-framework/cli && npx vitest run`                    |
| **Estimated runtime**  | ~5 seconds                                                           |

---

## Sampling Rate

- **After every task commit:** Run `test -f docs/workflows/new-app.md && wc -l docs/workflows/new-app.md`
- **After every plan wave:** Run `cd edulution-ai-framework/cli && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Test Type | Automated Command                                                                 | File Exists | Status     |
| -------- | ---- | ---- | ----------- | --------- | --------------------------------------------------------------------------------- | ----------- | ---------- |
| 04-01-01 | 01   | 1    | WKFL-01     | smoke     | `test -f docs/workflows/new-app.md && wc -l docs/workflows/new-app.md`            | ❌ W0       | ⬜ pending |
| 04-01-02 | 01   | 1    | WKFL-02     | smoke     | `test -f docs/workflows/add-feature.md && wc -l docs/workflows/add-feature.md`    | ❌ W0       | ⬜ pending |
| 04-01-03 | 01   | 1    | WKFL-03     | smoke     | `grep -c "Ask the user:" docs/workflows/new-app.md docs/workflows/add-feature.md` | ❌ W0       | ⬜ pending |
| 04-02-01 | 02   | 2    | WKFL-04     | unit      | `cd edulution-ai-framework/cli && npx vitest run --reporter=verbose`              | ❌ W0       | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] `cli/src/__tests__/scaffold-react.spec.ts` — update todo-only tests with real assertions that generated AGENTS.md includes workflow section
- [ ] Smoke test scripts for guide file existence and line count validation

_Existing infrastructure partially covers requirements — scaffold test file exists but contains only `.todo()` stubs._

---

## Manual-Only Verifications

| Behavior                            | Requirement      | Why Manual                                  | Test Instructions                                                        |
| ----------------------------------- | ---------------- | ------------------------------------------- | ------------------------------------------------------------------------ |
| Guides are AI-followable end-to-end | WKFL-01, WKFL-02 | Requires AI agent to actually follow steps  | Have an AI tool read and follow each guide on a fresh scaffolded project |
| Decision points force user choice   | WKFL-03          | Requires human judgment on phrasing clarity | Read each "Ask the user:" block, verify no default/skip option exists    |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
