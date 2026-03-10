---
phase: 3
slug: cli-scaffolding
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                                                |
| ---------------------- | -------------------------------------------------------------------- |
| **Framework**          | Vitest                                                               |
| **Config file**        | None — Wave 0 creates `cli/vitest.config.ts`                         |
| **Quick run command**  | `cd edulution-ai-framework/cli && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd edulution-ai-framework/cli && npx vitest run`                    |
| **Estimated runtime**  | ~10 seconds                                                          |

---

## Sampling Rate

- **After every task commit:** Run `cd edulution-ai-framework/cli && npx vitest run --reporter=verbose`
- **After every plan wave:** Run `cd edulution-ai-framework/cli && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Test Type   | Automated Command                                  | File Exists | Status  |
| -------- | ---- | ---- | ----------- | ----------- | -------------------------------------------------- | ----------- | ------- |
| 03-01-01 | 01   | 0    | CLI-01      | setup       | `cd cli && npm install`                            | No — Wave 0 | pending |
| 03-01-02 | 01   | 0    | CLI-04      | unit        | `vitest run src/__tests__/merge.spec.ts`           | No — Wave 0 | pending |
| 03-02-01 | 02   | 1    | CLI-01      | integration | `vitest run src/__tests__/prompts.spec.ts`         | No — Wave 0 | pending |
| 03-02-02 | 02   | 1    | CLI-02      | integration | `vitest run src/__tests__/scaffold-react.spec.ts`  | No — Wave 0 | pending |
| 03-02-03 | 02   | 1    | CLI-03      | integration | `vitest run src/__tests__/scaffold-styled.spec.ts` | No — Wave 0 | pending |
| 03-03-01 | 03   | 1    | CLI-05      | unit        | `vitest run src/__tests__/features-auth.spec.ts`   | No — Wave 0 | pending |
| 03-03-02 | 03   | 1    | CLI-06      | unit        | `vitest run src/__tests__/features-api.spec.ts`    | No — Wave 0 | pending |
| 03-03-03 | 03   | 1    | CLI-07      | unit        | `vitest run src/__tests__/features-tests.spec.ts`  | No — Wave 0 | pending |
| 03-03-04 | 03   | 1    | CLI-08      | unit        | `vitest run src/__tests__/uikit-mode.spec.ts`      | No — Wave 0 | pending |

_Status: pending · green · red · flaky_

---

## Wave 0 Requirements

- [ ] `cli/vitest.config.ts` — test configuration for the CLI package
- [ ] `cli/src/__tests__/merge.spec.ts` — tests for package.json deep-merge logic
- [ ] `cli/src/__tests__/scaffold-react.spec.ts` — tests for React app scaffold output
- [ ] `cli/src/__tests__/scaffold-styled.spec.ts` — tests for styled page scaffold output
- [ ] `cli/src/__tests__/prompts.spec.ts` — tests for prompt flow logic
- [ ] `cli/src/__tests__/features-auth.spec.ts` — tests for auth feature overlay
- [ ] `cli/src/__tests__/features-api.spec.ts` — tests for API client overlay
- [ ] `cli/src/__tests__/features-tests.spec.ts` — tests for Vitest setup overlay
- [ ] `cli/src/__tests__/uikit-mode.spec.ts` — tests for ui-kit npm vs local mode
- [ ] Framework install: `cd edulution-ai-framework/cli && npm install` — no npm infrastructure exists yet

---

## Manual-Only Verifications

| Behavior                                     | Requirement | Why Manual                         | Test Instructions                                                                      |
| -------------------------------------------- | ----------- | ---------------------------------- | -------------------------------------------------------------------------------------- |
| `npx edulution-create` interactive flow      | CLI-01      | Requires real terminal interaction | Run `npx edulution-create`, select each project type, verify prompts display correctly |
| Scaffolded React app runs with `npm run dev` | CLI-02      | Requires running Vite dev server   | Scaffold a React app, run `npm install && npm run dev`, verify it loads in browser     |
| Scaffolded styled page builds CSS            | CLI-03      | Requires Tailwind CLI build        | Scaffold a styled page, run build, verify CSS output contains edulution tokens         |
| Git submodule add succeeds                   | CLI-01      | Requires network + git SSH access  | Scaffold a project, verify `.gitmodules` and `edulution-ai-framework/` directory exist |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
