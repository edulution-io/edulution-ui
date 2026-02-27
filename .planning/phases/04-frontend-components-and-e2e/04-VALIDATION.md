---
phase: 4
slug: frontend-components-and-e2e
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-02-27
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property                            | Value                                                |
| ----------------------------------- | ---------------------------------------------------- |
| **Framework (components)**          | Vitest 3.2.x + jsdom + @testing-library/react        |
| **Framework (E2E)**                 | Playwright ^1.50.x                                   |
| **Config file (components)**        | apps/frontend/vite.config.mts (test section)         |
| **Config file (E2E)**               | apps/e2e/playwright.config.ts (Wave 0)               |
| **Quick run command (components)**  | `npx vitest run <spec-file>`                         |
| **Quick run command (E2E)**         | `npx playwright test <test-file> --project=chromium` |
| **Full suite command (components)** | `npm run test:frontend`                              |
| **Full suite command (E2E)**        | `cd apps/e2e && npx playwright test`                 |
| **Estimated runtime (components)**  | ~30 seconds                                          |
| **Estimated runtime (E2E)**         | ~120 seconds (Chromium only)                         |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run <changed-spec-file>` or `npx playwright test <changed-test> --project=chromium`
- **After every plan wave:** Run `npm run test:frontend` + `cd apps/e2e && npx playwright test --project=chromium`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds (components), 120 seconds (E2E)

---

## Per-Task Verification Map

| Task ID | Plan  | Wave | Requirement | Test Type | Automated Command                                                                   | File Exists | Status  |
| ------- | ----- | ---- | ----------- | --------- | ----------------------------------------------------------------------------------- | ----------- | ------- |
| TBD     | 04-01 | 1    | FECP-01     | component | `npx vitest run apps/frontend/src/components/shared/MenuBar.spec.tsx`               | No - W0     | pending |
| TBD     | 04-01 | 1    | FECP-02     | component | `npx vitest run apps/frontend/src/components/ui/Sidebar/Sidebar.spec.tsx`           | No - W0     | pending |
| TBD     | 04-01 | 1    | FECP-03     | component | `npx vitest run apps/frontend/src/components/structure/layout/AppLayout.spec.tsx`   | No - W0     | pending |
| TBD     | 04-01 | 1    | FECP-04     | component | `npx vitest run apps/frontend/src/pages/LoginPage/LoginPage.spec.tsx`               | No - W0     | pending |
| TBD     | 04-01 | 1    | FECP-05     | component | `npx vitest run apps/frontend/src/components/ui/Table/ScrollableTable.spec.tsx`     | No - W0     | pending |
| TBD     | 04-01 | 1    | FECP-06     | component | `npx vitest run apps/frontend/src/pages/Surveys/Tables/CreatedSurveysPage.spec.tsx` | No - W0     | pending |
| TBD     | 04-01 | 1    | FECP-07     | component | `npx vitest run apps/frontend/src/pages/FileSharing/FileSharingPage.spec.tsx`       | No - W0     | pending |
| TBD     | 04-01 | 1    | FECP-08     | component | `npx vitest run apps/frontend/src/pages/Mail/MailPage.spec.tsx`                     | No - W0     | pending |
| TBD     | 04-02 | 1    | E2ET-01     | setup     | `npx playwright test --list` (from apps/e2e)                                        | No - W0     | pending |
| TBD     | 04-02 | 1    | E2ET-02     | setup     | `npx playwright test tests/auth/ --project=chromium`                                | No - W0     | pending |
| TBD     | 04-02 | 1    | E2ET-03     | setup     | N/A (verified via test usage)                                                       | No - W0     | pending |
| TBD     | 04-03 | 2    | E2ET-04     | e2e       | `npx playwright test tests/auth/login-logout.spec.ts --project=chromium`            | No - W0     | pending |
| TBD     | 04-03 | 2    | E2ET-05     | e2e       | `npx playwright test tests/surveys/ --project=chromium`                             | No - W0     | pending |
| TBD     | 04-03 | 2    | E2ET-06     | e2e       | `npx playwright test tests/files/ --project=chromium`                               | No - W0     | pending |
| TBD     | 04-03 | 2    | E2ET-07     | e2e       | `npx playwright test tests/mail/ --project=chromium`                                | No - W0     | pending |
| TBD     | 04-03 | 2    | E2ET-08     | e2e       | `npx playwright test tests/conferences/ --project=chromium`                         | No - W0     | pending |
| TBD     | 04-03 | 2    | E2ET-09     | e2e       | `npx playwright test tests/appstore/ --project=chromium`                            | No - W0     | pending |
| TBD     | 04-03 | 2    | E2ET-10     | e2e       | `npx playwright test tests/settings/ --project=chromium`                            | No - W0     | pending |
| TBD     | 04-03 | 2    | CICD-03     | ci        | Verify .github/workflows/build-and-test.yml                                         | No          | pending |

_Status: pending / green / red / flaky_

---

## Wave 0 Requirements

- [ ] `apps/e2e/playwright.config.ts` — Playwright configuration
- [ ] `apps/e2e/project.json` — Nx project definition
- [ ] `apps/e2e/global-setup.ts` — Keycloak storageState auth
- [ ] `apps/e2e/.env.e2e.example` — Environment variable template
- [ ] `apps/e2e/page-objects/BasePage.ts` — Base POM class
- [ ] `apps/e2e/fixtures/auth.fixture.ts` — Authenticated test fixture
- [ ] npm install: `npm install -D @playwright/test`
- [ ] Playwright browsers: `npx playwright install --with-deps`

---

## Manual-Only Verifications

| Behavior                             | Requirement             | Why Manual                                 | Test Instructions                                                                        |
| ------------------------------------ | ----------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| E2E tests run against staging server | E2ET-01 through E2ET-10 | Requires live staging server with Keycloak | Verify staging URL is accessible, credentials work, all E2E tests pass when run manually |
| CI E2E job non-blocking status       | CICD-03                 | Requires GitHub PR pipeline context        | Verify e2e job appears in PR checks as informational (not required)                      |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
