---
phase: 2
slug: ci-sync-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| **Framework**          | GitHub Actions (workflow YAML; integration-level testing)                                        |
| **Config file**        | `.github/workflows/sync-framework.yml`                                                           |
| **Quick run command**  | `act push -W .github/workflows/sync-framework.yml` (local) or manual `workflow_dispatch` trigger |
| **Full suite command** | Push a change to tracked file on dev branch and verify framework repo update                     |
| **Estimated runtime**  | ~60 seconds (GitHub Actions run)                                                                 |

---

## Sampling Rate

- **After every task commit:** YAML linting via `actionlint` if available, or manual review
- **After every plan wave:** Push test change to dev branch, observe GitHub Actions run
- **Before `/gsd:verify-work`:** All sync behaviors verified on actual dev branch pushes
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Test Type          | Automated Command                                                      | File Exists | Status     |
| -------- | ---- | ---- | ----------- | ------------------ | ---------------------------------------------------------------------- | ----------- | ---------- |
| 02-01-01 | 01   | 1    | SYNC-01     | manual/integration | Push swagger-spec.json change to dev, verify framework repo artifacts/ | ❌ W0       | ⬜ pending |
| 02-01-02 | 01   | 1    | SYNC-02     | manual/integration | Push tailwind config change to dev, verify framework repo artifacts/   | ❌ W0       | ⬜ pending |
| 02-01-03 | 01   | 1    | SYNC-03     | manual/integration | Push unrelated file change to dev, verify workflow does NOT trigger    | ❌ W0       | ⬜ pending |
| 02-02-01 | 02   | 2    | SYNC-04     | DEFERRED           | N/A                                                                    | N/A         | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] `.github/workflows/sync-framework.yml` — the workflow file itself (the deliverable)
- [ ] `artifacts/` directory in framework repo — needs to be created by first sync run or pre-created
- [ ] `actionlint` for local YAML validation (optional but helpful)
- [ ] Manual test plan: push specific file changes to dev and verify sync behavior

_Note: This phase's deliverable IS the CI workflow. Testing is inherently integration-level — verify by running the actual workflow on GitHub Actions._

---

## Manual-Only Verifications

| Behavior                        | Requirement | Why Manual                                              | Test Instructions                                                         |
| ------------------------------- | ----------- | ------------------------------------------------------- | ------------------------------------------------------------------------- |
| Swagger sync on dev merge       | SYNC-01     | Requires actual GitHub Actions run with cross-repo push | Push swagger-spec.json change to dev, verify artifacts/ in framework repo |
| Styling sync on dev merge       | SYNC-02     | Requires actual GitHub Actions run with cross-repo push | Push tailwind config change to dev, verify artifacts/ in framework repo   |
| Path filtering skips irrelevant | SYNC-03     | Requires observing workflow NOT triggering              | Push unrelated file, confirm no Actions run                               |
| Drift detection opens issue     | SYNC-04     | Requires scheduled cron run and cross-repo comparison   | Wait for scheduled run or trigger manually, verify GitHub issue created   |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
