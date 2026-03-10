---
phase: 5
slug: dog-fooding
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                                  |
| ---------------------- | ------------------------------------------------------ |
| **Framework**          | Shell script assertions (file existence, content grep) |
| **Config file**        | None — inline validation commands                      |
| **Quick run command**  | `test -f .gitmodules && git submodule status`          |
| **Full suite command** | Shell script checking all validation criteria          |
| **Estimated runtime**  | ~1 second                                              |

---

## Sampling Rate

- **After every task commit:** Run `test -f .gitmodules && git submodule status`
- **After every plan wave:** Run full validation (all checks below)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 2 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Test Type | Automated Command                                                                         | File Exists | Status     |
| -------- | ---- | ---- | ----------- | --------- | ----------------------------------------------------------------------------------------- | ----------- | ---------- |
| 05-01-01 | 01   | 1    | DOG-01      | smoke     | `test -f .gitmodules && git submodule status \| grep -q edulution-ai-framework`           | ❌ W0       | ⬜ pending |
| 05-01-02 | 01   | 1    | DOG-02      | smoke     | `grep -q '@edulution-ai-framework' AGENTS.md && test $(wc -l < AGENTS.md) -le 2`          | ❌ W0       | ⬜ pending |
| 05-01-03 | 01   | 1    | DOG-03      | smoke     | `grep -q '@AGENTS.md' CLAUDE.md && test -f edulution-ai-framework/edulution-ui/AGENTS.md` | ❌ W0       | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework installation needed — validation uses inline shell commands (file existence, grep, wc).

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 2s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
