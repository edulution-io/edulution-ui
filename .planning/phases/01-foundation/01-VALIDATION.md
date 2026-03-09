---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                                          |
| ---------------------- | -------------------------------------------------------------- |
| **Framework**          | Manual validation (content project, not code)                  |
| **Config file**        | none                                                           |
| **Quick run command**  | `find . -name "AGENTS.md" -exec wc -l {} \;`                   |
| **Full suite command** | Manual review of all AGENTS.md files + composite action syntax |
| **Estimated runtime**  | ~5 seconds (line count) / ~10 minutes (manual review)          |

---

## Sampling Rate

- **After every task commit:** Run `find . -name "AGENTS.md" -exec wc -l {} \;` to verify line limits
- **After every plan wave:** Full content review + `gh repo view` to verify repo state
- **Before `/gsd:verify-work`:** All files under 150 lines, composite action YAML valid, integration guide complete
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Test Type | Automated Command                                                                                                                        | File Exists | Status  |
| -------- | ---- | ---- | ----------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------- |
| 01-01-01 | 01   | 1    | REPO-01     | smoke     | `gh repo view edulution-io/edulution-ai-framework`                                                                                       | Wave 0      | pending |
| 01-01-02 | 01   | 1    | REPO-02     | manual    | Review README.md structure documentation                                                                                                 | Wave 0      | pending |
| 01-02-01 | 02   | 1    | CTX-01      | smoke     | `wc -l AGENTS.md`                                                                                                                        | Wave 0      | pending |
| 01-02-02 | 02   | 1    | CTX-02      | manual    | `wc -l edulution-ui/AGENTS.md` + content review                                                                                          | Wave 0      | pending |
| 01-02-03 | 02   | 1    | CTX-03      | manual    | `wc -l custom-app/AGENTS.md` + content review                                                                                            | Wave 0      | pending |
| 01-02-04 | 02   | 1    | CTX-04      | manual    | `wc -l styled-page/AGENTS.md` + content review                                                                                           | Wave 0      | pending |
| 01-02-05 | 02   | 1    | CTX-05      | manual    | Verify directory structure matches AGENTS.md spec pattern                                                                                | Wave 0      | pending |
| 01-02-06 | 02   | 1    | CTX-06      | smoke     | `find . -name "AGENTS.md" -exec sh -c 'lines=$(wc -l < "$1"); if [ "$lines" -gt 150 ]; then echo "FAIL: $1 ($lines lines)"; fi' _ {} \;` | Wave 0      | pending |
| 01-03-01 | 03   | 2    | REPO-03     | manual    | `test -f docs/integration-guide.md`                                                                                                      | Wave 0      | pending |
| 01-03-02 | 03   | 2    | REPO-04     | smoke     | `cat .github/actions/checkout-submodule/action.yml` + YAML syntax check                                                                  | Wave 0      | pending |

_Status: pending / green / red / flaky_

---

## Wave 0 Requirements

- [ ] All AGENTS.md files — Phase 1 creates them from scratch
- [ ] `docs/integration-guide.md` — New file
- [ ] `.github/actions/checkout-submodule/action.yml` — New file
- [ ] `README.md` — New file

_All artifacts are created by phase tasks. No pre-existing test infrastructure needed._

---

## Manual-Only Verifications

| Behavior                                    | Requirement | Why Manual                                 | Test Instructions                                                                          |
| ------------------------------------------- | ----------- | ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Base AGENTS.md contains correct conventions | CTX-01      | Content quality requires human judgment    | Read AGENTS.md, verify design tokens, git conventions, security tips present               |
| Layer composition works via filesystem      | CTX-05      | Requires AI tool runtime testing           | Add framework as submodule to test project, verify AI tool loads correct conventions       |
| edulution-ui layer has NestJS/Nx rules      | CTX-02      | Content correctness requires domain review | Read edulution-ui/AGENTS.md, verify NestJS Logger pattern, Nx commands, monorepo structure |
| custom-app layer has ui-kit imports         | CTX-03      | Content correctness requires domain review | Read custom-app/AGENTS.md, verify @edulution-io/ui-kit imports, no SH wrappers             |
| styled-page layer has branding              | CTX-04      | Content correctness requires domain review | Read styled-page/AGENTS.md, verify Tailwind config, CSS variables, logo/font references    |
| Integration guide is complete               | REPO-03     | Completeness requires human judgment       | Read docs/integration-guide.md, follow steps on a test project                             |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
