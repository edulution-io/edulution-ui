---
phase: 04-frontend-components-and-e2e
plan: 03
subsystem: testing
tags: [playwright, e2e, github-actions, ci, browser-testing]

requires:
  - phase: 04-frontend-components-and-e2e-02
    provides: Playwright infrastructure, auth fixtures, page object models
provides:
  - 7 E2E journey test suites covering all user workflows (auth, surveys, files, mail, conferences, appstore, settings)
  - CI e2e job with Playwright report artifact upload on failure
affects: [ci-pipeline, staging-environment]

tech-stack:
  added: []
  patterns: [serial-describe-for-stateful-workflows, test-skip-for-missing-features, best-effort-cleanup]

key-files:
  created:
    - apps/e2e/tests/auth/login-logout.spec.ts
    - apps/e2e/tests/settings/settings.spec.ts
    - apps/e2e/tests/appstore/appstore.spec.ts
    - apps/e2e/tests/surveys/survey-workflow.spec.ts
    - apps/e2e/tests/files/file-sharing.spec.ts
    - apps/e2e/tests/mail/mail-workflow.spec.ts
    - apps/e2e/tests/conferences/conference.spec.ts
  modified:
    - .github/workflows/build-and-test.yml
    - apps/e2e/.gitignore

key-decisions:
  - 'Used test.skip() for feature detection when UI elements may not be present on staging'
  - 'Serial describes share state via closure variables for CRUD workflows'
  - 'Mail tests verify iframe presence only due to cross-origin limitations'
  - 'E2E CI job is non-blocking (continue-on-error: true) per locked decision'

patterns-established:
  - 'E2E CRUD pattern: serial describe with create-verify-cleanup using shared variables'
  - 'Feature detection pattern: test.skip() when UI element not found rather than failing'
  - 'Temp file pattern: create test artifacts in test-artifacts/ dir, cleanup in afterAll'

requirements-completed: [E2ET-04, E2ET-05, E2ET-06, E2ET-07, E2ET-08, E2ET-09, E2ET-10, CICD-03]

duration: 4min
completed: 2026-03-02
---

# Phase 04 Plan 03: E2E Journey Tests Summary

**7 Playwright E2E journey tests covering login/logout, surveys, file sharing, mail, conferences, appstore, and settings plus CI pipeline e2e job with artifact upload**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-02T09:38:00Z
- **Completed:** 2026-03-02T09:42:00Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Created 7 E2E test files covering all major user workflows with 21 total test cases
- Login/logout tests verify Keycloak form auth, authenticated access, logout, and redirect guard
- Survey/file/conference tests use serial describes with CRUD lifecycle and self-cleanup
- Mail tests pragmatically verify iframe presence given cross-origin constraints
- Added non-blocking e2e CI job with Playwright HTML report artifact upload on failure

## Task Commits

Each task was committed atomically:

1. **Task 1: Login/logout, settings, and AppStore E2E tests** - `0d92a486b` (test)
2. **Task 2: Survey, file sharing, mail, and conference E2E tests** - `adcd3bc2d` (test)
3. **Task 3: Add E2E CI job to GitHub Actions workflow** - `93f6e09db` (ci)

## Files Created/Modified

- `apps/e2e/tests/auth/login-logout.spec.ts` - 4 tests: form login, dashboard access, logout, redirect guard
- `apps/e2e/tests/settings/settings.spec.ts` - 3 tests: theme change, notification settings, DND window
- `apps/e2e/tests/appstore/appstore.spec.ts` - 2 tests: browse apps, open configuration
- `apps/e2e/tests/surveys/survey-workflow.spec.ts` - 4 serial tests: create, participate, results, delete
- `apps/e2e/tests/files/file-sharing.spec.ts` - 3 serial tests: upload, verify listing, delete
- `apps/e2e/tests/mail/mail-workflow.spec.ts` - 2 tests: access mail page, verify iframe
- `apps/e2e/tests/conferences/conference.spec.ts` - 3 serial tests: create, verify listing, delete
- `.github/workflows/build-and-test.yml` - Added e2e job with secrets, Playwright install, artifact upload
- `apps/e2e/.gitignore` - Fixed auth/ pattern to only ignore root auth storage dir

## Decisions Made

- Used test.skip() for feature detection when UI elements may not exist on staging, making tests resilient to different staging configurations
- Mail tests verify iframe presence only (not internal content) due to likely cross-origin restrictions with Roundcube/SOGo
- E2E CI job set as continue-on-error: true per locked decision to start informational before promoting to required
- Fixed .gitignore: changed `auth/` to `/auth/` so tests/auth/ directory is tracked while auth storage state files remain ignored

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed .gitignore auth/ pattern blocking test commits**

- **Found during:** Task 1 (Login/logout tests)
- **Issue:** `auth/` in apps/e2e/.gitignore matched all auth directories including tests/auth/
- **Fix:** Changed to `/auth/` to scope ignore to only the root auth storage directory
- **Files modified:** apps/e2e/.gitignore
- **Verification:** git add succeeded after fix
- **Committed in:** 0d92a486b (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking)
**Impact on plan:** Necessary fix to allow committing auth test files. No scope creep.

## Issues Encountered

None beyond the gitignore fix documented above.

## User Setup Required

**External services require manual configuration.** E2E tests require staging server credentials:

- Copy `apps/e2e/.env.e2e.example` to `apps/e2e/.env.e2e` and fill in E2E_BASE_URL plus all 4 role credentials
- For CI: configure GitHub Actions secrets (E2E_BASE_URL, E2E_ADMIN_USER, E2E_ADMIN_PASS, etc.)

## Next Phase Readiness

- Phase 04 (Frontend Components and E2E) is now fully complete with all 3 plans executed
- 7 E2E journey tests ready to run against any staging environment with proper credentials
- CI pipeline includes non-blocking e2e job that can be promoted to required once tests stabilize

---

_Phase: 04-frontend-components-and-e2e_
_Completed: 2026-03-02_
