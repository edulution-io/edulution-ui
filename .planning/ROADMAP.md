# Roadmap: edulution-ui Comprehensive Test Suite

## Overview

This roadmap takes edulution-ui from near-zero test coverage to a production-ready, multi-layer test suite. The 5 phases follow a strict dependency ordering: shared test infrastructure first (factories, MSW, CI), then API unit test expansion using established patterns, then frontend unit tests (utilities, stores, hooks) built on the new MSW infrastructure, then component tests and E2E on top of verified unit-level foundations, and finally advanced quality gates (visual regression, accessibility, integration tests, coverage enforcement). Each phase delivers independently verifiable testing capability. Every PR will be blocked by automated tests across all layers when complete.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Test Foundation and Infrastructure** - Shared factories, MSW setup, Vitest upgrade, mock consolidation, and CI frontend test job
- [x] **Phase 2: API Unit Test Expansion** - Guards, pipes, filters, services, and controllers across all untested API modules
- [ ] **Phase 3: Frontend Unit Tests** - Utility functions, Zustand store tests with MSW, and custom hook tests
- [ ] **Phase 4: Frontend Components and E2E** - Component tests for critical UI, Playwright setup, Keycloak auth, Page Object Model, E2E journeys
- [ ] **Phase 5: Advanced Quality and CI Hardening** - API integration tests, visual regression, accessibility scans, coverage reporting, diff-coverage gates

## Phase Details

### Phase 1: Test Foundation and Infrastructure

**Goal**: Every subsequent test phase has shared infrastructure to build on -- factories, mock patterns, MSW, provider utilities, and CI runs frontend tests on every PR
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07, FOUND-08, FOUND-09, CICD-01, CICD-02
**Success Criteria** (what must be TRUE):

1. Running `npm run test:frontend` executes Vitest 3.2.x and produces a coverage report (Vitest upgrade and coverage-v8 working)
2. A sample frontend test file can import MSW handlers from a shared directory, intercept an eduApi call, and assert on the mocked response (MSW infrastructure functional)
3. A sample API spec file can use TestingModuleBuilder preset and Proxy-based Mongoose query builder mock to test a service method in under 20 lines of setup (API test infrastructure functional)
4. The CI pipeline has a dedicated `test-frontend` job that runs in parallel with `test-api` and both are required status checks blocking PR merges
5. All Zustand stores are registered in cleanAllStores.ts and an automated validation test fails if a new store is added without registration
   **Plans**: TBD

Plans:

- [ ] 01-01: Vitest upgrade, MSW setup, factories, renderWithProviders, sample test
- [ ] 01-02: API test infrastructure (Mongoose mock, cacheManager, TestingModuleBuilder preset)
- [ ] 01-03: CI pipeline split, cleanAllStores audit + validation test

### Phase 2: API Unit Test Expansion

**Goal**: Every API module has meaningful behavioral tests -- guards enforce security boundaries, pipes validate inputs, filters handle errors, services implement business logic, and controllers delegate correctly
**Depends on**: Phase 1
**Requirements**: APIT-01, APIT-02, APIT-03, APIT-04, APIT-05, APIT-06, APIT-07, APIT-08, APIT-09, APIT-10, APIT-11, APIT-12, APIT-13
**Success Criteria** (what must be TRUE):

1. AuthGuard, AccessGuard, AdminGuard, and DynamicAppAccessGuard tests cover valid tokens, missing tokens, expired tokens, invalid signatures, LDAP group checks, and admin bypass -- a broken guard fails a test
2. All 5 exception filters and all validation pipes (ValidatePathPipe, ParseJsonPipe, FilterUserPipe) have tests covering both valid and invalid inputs
3. Previously untested services (mail, file sharing, conferences, notifications, docker, LDAP-Keycloak sync, license, health, mobileApp, user-preferences, wireguard, webdav) each have spec files with behavioral assertions beyond "should be defined"
4. No API spec file has `it('should be defined')` as its sole test -- every spec file contains at least one behavioral assertion testing actual method output or side effects
5. Controller tests verify HTTP status codes and service delegation for all major endpoints
   **Plans**: 7 plans, 2 waves

Plans:

- [x] 02-01: Shared test helpers (ExecutionContext mock, ArgumentsHost mock, JWTUser factory) + all 7 guard specs (Wave 1)
- [x] 02-02: All 3 pipe specs + all 5 exception filter specs (Wave 1, parallel with 02-01)
- [x] 02-03: Surveys service deepening + file sharing service rewrite + controller specs (Wave 2)
- [x] 02-04: Mail service + notifications service + conference deepening + controller specs (Wave 2, parallel with 02-03)
- [x] 02-05: Infrastructure services (Docker, LDAP-Keycloak, Wireguard, etc.) + remaining controllers + spec deepening (Wave 2, parallel with 02-03/02-04)
- [x] 02-06: Simple infrastructure services (License, Health, MobileApp, UserPreferences, WebdavShares) + controller specs (Wave 2, parallel with 02-03/02-04/02-05)
- [x] 02-07: Auth, Webhooks, remaining controllers (BulletinCategory, ParentChildPairing, Metrics) + groups/sse deepening + APIT-13 verification (Wave 2, parallel with 02-03/02-04/02-05/02-06)

### Phase 3: Frontend Unit Tests

**Goal**: Frontend utility functions, Zustand stores, and custom hooks are tested -- pure logic is verified without rendering, stores are tested against MSW-mocked API responses, and hooks are tested via renderHook
**Depends on**: Phase 1
**Requirements**: FEUT-01, FEUT-02, FEUT-03, FEUT-04, FEST-01, FEST-02, FEST-03, FEST-04, FEST-05, FEST-06, FEST-07, FEST-08, FEHK-01, FEHK-02, FEHK-03, FEHK-04, FEHK-05
**Success Criteria** (what must be TRUE):

1. Shared lib utility functions (getIsAdmin, processLdapGroups, sanitizePath, mapToDirectoryFiles, formatEstimatedTimeRemaining, convertToWebdavUrl, buildCollectDTO) and frontend utilities (handleApiError, getDisplayName, applyThemeColors, getCompressedImage, copyToClipboard) all have passing tests covering normal and edge-case inputs
2. Zod schema validation tests confirm that settings forms reject invalid input and accept valid input with correct parsed types
3. Critical Zustand stores (file sharing, mails, survey editor, conference, appConfigs, class management, user, SSE) are tested by calling store actions with MSW intercepting network requests -- each store test verifies state transitions on success and error paths
4. Custom hooks (useSseEventListener, useKeyboardNavigation, useNotifications, useSidebarItems, useTableActions) are tested via renderHook and fire expected callbacks or state changes
5. Route generation utilities (getFramedRoutes, getForwardedAppRoutes, getNativeAppRoutes) produce correct route configurations for known inputs
   **Plans**: TBD

Plans:

- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

### Phase 4: Frontend Components and E2E

**Goal**: Critical UI components render correctly and respond to user interaction, and end-to-end tests verify complete user journeys through the real application against a staging server
**Depends on**: Phase 1, Phase 3
**Requirements**: FECP-01, FECP-02, FECP-03, FECP-04, FECP-05, FECP-06, FECP-07, FECP-08, E2ET-01, E2ET-02, E2ET-03, E2ET-04, E2ET-05, E2ET-06, E2ET-07, E2ET-08, E2ET-09, E2ET-10, CICD-03
**Success Criteria** (what must be TRUE):

1. MenuBar, Sidebar, and AppLayout component tests verify navigation rendering, collapse behavior, active state highlighting, and responsive layout using React Testing Library user-event interactions (not snapshot assertions)
2. LoginPage, Table, survey form, file browser, and mail compose component tests verify form validation, data display, sorting/filtering, and user action handling with MSW-mocked API responses
3. Playwright E2E project runs via Nx with parallel execution, and Keycloak authentication uses storageState pattern (authenticate once in globalSetup, reuse across all tests) without per-test login
4. E2E tests cover login/logout, survey create-participate-results, file upload-share-download, mail compose-send-receive, conference create-join, AppStore browse-install, and settings changes -- each journey completes without manual intervention
5. E2E test failures upload Playwright HTML report as CI artifact, and the E2E job runs as part of the PR pipeline
   **Plans**: TBD

Plans:

- [ ] 04-01: TBD
- [ ] 04-02: TBD
- [ ] 04-03: TBD

### Phase 5: Advanced Quality and CI Hardening

**Goal**: The test suite catches visual regressions, accessibility violations, and API contract drift -- CI enforces coverage standards on every PR with automated reporting
**Depends on**: Phase 2, Phase 4
**Requirements**: APII-01, APII-02, APII-03, APII-04, APII-05, VRAT-01, VRAT-02, VRAT-03, VRAT-04, VRAT-05, CICD-04, CICD-05, CICD-06
**Success Criteria** (what must be TRUE):

1. API integration tests use supertest with real NestJS module imports (mocked external services only) to verify the auth flow end-to-end (login endpoint through guard chain) and survey CRUD (create, participate, results, permissions)
2. API contract validation tests confirm critical endpoints match swagger-spec.json response shapes
3. Playwright screenshot baselines exist for login, dashboard, file browser, survey editor, mail, and settings pages in both light and dark themes -- a CSS change that alters layout fails the visual regression test
4. axe-core accessibility scans run on every E2E page load, and violations at "critical" or "serious" severity fail the test
5. Codecov (or equivalent) posts coverage diff comments on every PR, and new files without >60% coverage block the PR merge
   **Plans**: TBD

Plans:

- [ ] 05-01: TBD
- [ ] 05-02: TBD
- [ ] 05-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5
Note: Phase 2 and Phase 3 both depend only on Phase 1 and could execute in parallel.

| Phase                                 | Plans Complete | Status      | Completed  |
| ------------------------------------- | -------------- | ----------- | ---------- |
| 1. Test Foundation and Infrastructure | 0/3            | Not started | -          |
| 2. API Unit Test Expansion            | 7/7            | Complete    | 2026-02-26 |
| 3. Frontend Unit Tests                | 0/3            | Not started | -          |
| 4. Frontend Components and E2E        | 0/3            | Not started | -          |
| 5. Advanced Quality and CI Hardening  | 0/3            | Not started | -          |
