# Requirements: edulution-ui Comprehensive Test Suite

**Defined:** 2026-02-26
**Core Value:** Catch regressions before they reach users — every PR must pass automated tests across all layers before merge

## v1 Requirements

Requirements for the comprehensive test suite. Each maps to roadmap phases.

### Test Foundation

- [ ] **FOUND-01**: Vitest upgraded from 1.6 to 3.2.x with @vitest/coverage-v8 matching version
- [ ] **FOUND-02**: MSW 2.x server setup with handlers directory structure wired into vitest.setup.ts
- [ ] **FOUND-03**: Shared test factories created (JWT user, AppConfig, Survey, Conference, UserDocument)
- [ ] **FOUND-04**: Proxy-based Mongoose query builder mock factory replacing ad-hoc chain mocks
- [ ] **FOUND-05**: Duplicate cacheManagerMock consolidated into single shared location
- [ ] **FOUND-06**: renderWithProviders utility wrapping components in full provider tree (i18n, router, OIDC)
- [ ] **FOUND-07**: TestingModuleBuilder preset for common API test module setup
- [ ] **FOUND-08**: cleanAllStores audit — all Zustand stores registered, automated validation added
- [ ] **FOUND-09**: CI pipeline updated with dedicated frontend test job running in parallel

### API Unit Tests

- [ ] **APIT-01**: AuthGuard unit tests covering JWT verification, missing token, expired token, invalid signature
- [ ] **APIT-02**: AccessGuard unit tests covering LDAP group checks, admin bypass, missing groups
- [ ] **APIT-03**: AdminGuard and DynamicAppAccessGuard unit tests
- [ ] **APIT-04**: ValidatePathPipe, ParseJsonPipe, FilterUserPipe unit tests covering valid/invalid inputs
- [ ] **APIT-05**: All 5 exception filters unit tests (HttpException, PayloadTooLarge, NotFound, Multer, general)
- [ ] **APIT-06**: Expand survey service tests beyond shallow assertions to cover scoring, participation, results
- [ ] **APIT-07**: Mail service tests covering IMAP flow, send, receive, folder management
- [ ] **APIT-08**: File sharing service tests covering permissions, sharing rules, WebDAV operations
- [ ] **APIT-09**: Conference service tests covering BBB integration, start/stop/join flows
- [ ] **APIT-10**: Notification service tests covering push notifications, DND window, expo integration
- [ ] **APIT-11**: Docker service, LDAP-Keycloak sync, license, health, mobileApp, user-preferences, wireguard, webdav module tests
- [ ] **APIT-12**: All API controller tests verify delegation, HTTP status codes, request validation
- [ ] **APIT-13**: Existing 33 spec files deepened — ban sole "should be defined" tests, add behavioral assertions

### API Integration Tests

- [ ] **APII-01**: supertest integration test setup with NestJS TestingModule (real module imports, mocked external services)
- [ ] **APII-02**: Auth flow integration test (login endpoint, token verification, guard chain)
- [ ] **APII-03**: Survey CRUD integration test (create, participate, results, permissions)
- [ ] **APII-04**: File operations integration test (upload, download, share, permissions enforcement)
- [ ] **APII-05**: API contract validation against swagger-spec.json for critical endpoints

### Frontend Utility Tests

- [ ] **FEUT-01**: Shared lib utility tests (getIsAdmin, processLdapGroups, sanitizePath, mapToDirectoryFiles, formatEstimatedTimeRemaining, convertToWebdavUrl, buildCollectDTO)
- [ ] **FEUT-02**: Frontend utility tests (handleApiError, getDisplayName, applyThemeColors, getCompressedImage, copyToClipboard)
- [ ] **FEUT-03**: Zod schema validation tests for settings forms
- [ ] **FEUT-04**: Route generation utility tests (getFramedRoutes, getForwardedAppRoutes, getNativeAppRoutes)

### Frontend Store Tests

- [ ] **FEST-01**: useFileSharingStore tests — file CRUD, sharing, permissions via MSW
- [ ] **FEST-02**: useMailsStore tests — mail listing, compose, send, receive via MSW
- [ ] **FEST-03**: useSurveyEditorPageStore tests — survey creation, editing, publishing via MSW
- [ ] **FEST-04**: useConferenceStore tests — conference lifecycle via MSW
- [ ] **FEST-05**: useAppConfigsStore tests — config fetching, caching, persist middleware via MSW
- [ ] **FEST-06**: useClassManagementStore tests — class operations via MSW
- [ ] **FEST-07**: useUserStore tests — auth state, profile, persist middleware via MSW
- [ ] **FEST-08**: useSseStore tests — SSE connection, event dispatch, heartbeat via MSW

### Frontend Hook Tests

- [ ] **FEHK-01**: useSseEventListener tests — SSE event dispatch to correct stores
- [ ] **FEHK-02**: useKeyboardNavigation tests — keyboard shortcut handling in file browser
- [ ] **FEHK-03**: useNotifications tests — push notification handling and display
- [ ] **FEHK-04**: useSidebarItems tests — menu generation from appConfigs
- [ ] **FEHK-05**: useTableActions tests — table action handler logic

### Frontend Component Tests

- [ ] **FECP-01**: MenuBar component tests — navigation, collapse behavior, active state
- [ ] **FECP-02**: Sidebar component tests — item rendering, collapse, responsive behavior
- [ ] **FECP-03**: AppLayout component tests — shell rendering with menubar, sidebar, outlet
- [x] **FECP-04**: LoginPage component tests — form validation, OIDC redirect trigger
- [x] **FECP-05**: Table component tests — sorting, filtering, pagination, row actions
- [x] **FECP-06**: Survey form components tests — question rendering, answer submission
- [x] **FECP-07**: File browser component tests — file listing, upload, download actions
- [x] **FECP-08**: Mail compose component tests — editor, recipients, attachments, send

### E2E Tests

- [ ] **E2ET-01**: Playwright project configured with NX integration and parallel execution
- [ ] **E2ET-02**: Keycloak auth fixture using storageState pattern against staging server
- [ ] **E2ET-03**: Page Object Model base classes for reusable page interactions
- [x] **E2ET-04**: Login flow E2E — Keycloak OIDC redirect, session persistence, logout
- [x] **E2ET-05**: Survey workflow E2E — create survey, participate, view results
- [x] **E2ET-06**: File sharing E2E — upload file, share with user, download shared file
- [x] **E2ET-07**: Mail workflow E2E — compose, send, receive in inbox
- [x] **E2ET-08**: Conference E2E — create conference, join, verify running state
- [x] **E2ET-09**: AppStore E2E — browse apps, install, configure
- [x] **E2ET-10**: Settings E2E — change theme, notifications, DND window

### Visual Regression & Accessibility

- [ ] **VRAT-01**: Playwright screenshot baselines for key pages (login, dashboard, file browser, survey editor, mail, settings)
- [ ] **VRAT-02**: Light and dark theme visual regression tests
- [ ] **VRAT-03**: Menubar collapse/expand visual regression
- [ ] **VRAT-04**: axe-core accessibility scans on every E2E page load
- [ ] **VRAT-05**: Containerized CI environment for deterministic screenshot baselines

### CI/CD Pipeline

- [ ] **CICD-01**: Parallel GitHub Actions jobs (lint, test-api, test-frontend, build, e2e)
- [ ] **CICD-02**: Frontend test job as required status check blocking PRs
- [x] **CICD-03**: E2E test job with Playwright report artifact upload on failure
- [ ] **CICD-04**: Coverage reporting via Codecov with PR comments showing diff
- [ ] **CICD-05**: Diff-coverage gates requiring new files to have >60% coverage
- [ ] **CICD-06**: Playwright MCP server configuration for AI-assisted test generation

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Testing

- **ADV-01**: mongodb-memory-server for API integration tests with real database
- **ADV-02**: Performance budget testing via Lighthouse CI
- **ADV-03**: Custom MCP server for test environment management (user provisioning, data seeding)
- **ADV-04**: Load testing with k6 or Artillery on staging

## Out of Scope

| Feature                          | Reason                                                                      |
| -------------------------------- | --------------------------------------------------------------------------- |
| 100% code coverage target        | Incentivizes trivial tests; track trends instead                            |
| Snapshot testing for components  | Maintenance burden with 516 TSX files; use RTL behavioral assertions        |
| Consumer-driven contracts (Pact) | Designed for microservices; redundant in monorepo with shared libs/         |
| Storybook / Chromatic            | No Storybook in project; Playwright screenshots cover visual regression     |
| Local Keycloak container for E2E | Staging server approach chosen; avoids setup complexity                     |
| Performance / load testing in CI | Requires production-like data volumes and dedicated infrastructure          |
| Testing private methods directly | Test through public API; extract complex private logic to utility functions |

## Traceability

| Requirement | Phase   | Status   |
| ----------- | ------- | -------- |
| FOUND-01    | Phase 1 | Pending  |
| FOUND-02    | Phase 1 | Pending  |
| FOUND-03    | Phase 1 | Pending  |
| FOUND-04    | Phase 1 | Pending  |
| FOUND-05    | Phase 1 | Pending  |
| FOUND-06    | Phase 1 | Pending  |
| FOUND-07    | Phase 1 | Pending  |
| FOUND-08    | Phase 1 | Pending  |
| FOUND-09    | Phase 1 | Pending  |
| APIT-01     | Phase 2 | Pending  |
| APIT-02     | Phase 2 | Pending  |
| APIT-03     | Phase 2 | Pending  |
| APIT-04     | Phase 2 | Pending  |
| APIT-05     | Phase 2 | Pending  |
| APIT-06     | Phase 2 | Pending  |
| APIT-07     | Phase 2 | Pending  |
| APIT-08     | Phase 2 | Pending  |
| APIT-09     | Phase 2 | Pending  |
| APIT-10     | Phase 2 | Pending  |
| APIT-11     | Phase 2 | Pending  |
| APIT-12     | Phase 2 | Pending  |
| APIT-13     | Phase 2 | Pending  |
| FEUT-01     | Phase 3 | Pending  |
| FEUT-02     | Phase 3 | Pending  |
| FEUT-03     | Phase 3 | Pending  |
| FEUT-04     | Phase 3 | Pending  |
| FEST-01     | Phase 3 | Pending  |
| FEST-02     | Phase 3 | Pending  |
| FEST-03     | Phase 3 | Pending  |
| FEST-04     | Phase 3 | Pending  |
| FEST-05     | Phase 3 | Pending  |
| FEST-06     | Phase 3 | Pending  |
| FEST-07     | Phase 3 | Pending  |
| FEST-08     | Phase 3 | Pending  |
| FEHK-01     | Phase 3 | Pending  |
| FEHK-02     | Phase 3 | Pending  |
| FEHK-03     | Phase 3 | Pending  |
| FEHK-04     | Phase 3 | Pending  |
| FEHK-05     | Phase 3 | Pending  |
| FECP-01     | Phase 4 | Pending  |
| FECP-02     | Phase 4 | Pending  |
| FECP-03     | Phase 4 | Pending  |
| FECP-04     | Phase 4 | Complete |
| FECP-05     | Phase 4 | Complete |
| FECP-06     | Phase 4 | Complete |
| FECP-07     | Phase 4 | Complete |
| FECP-08     | Phase 4 | Complete |
| E2ET-01     | Phase 4 | Pending  |
| E2ET-02     | Phase 4 | Pending  |
| E2ET-03     | Phase 4 | Pending  |
| E2ET-04     | Phase 4 | Complete |
| E2ET-05     | Phase 4 | Complete |
| E2ET-06     | Phase 4 | Complete |
| E2ET-07     | Phase 4 | Complete |
| E2ET-08     | Phase 4 | Complete |
| E2ET-09     | Phase 4 | Complete |
| E2ET-10     | Phase 4 | Complete |
| APII-01     | Phase 5 | Pending  |
| APII-02     | Phase 5 | Pending  |
| APII-03     | Phase 5 | Pending  |
| APII-04     | Phase 5 | Pending  |
| APII-05     | Phase 5 | Pending  |
| VRAT-01     | Phase 5 | Pending  |
| VRAT-02     | Phase 5 | Pending  |
| VRAT-03     | Phase 5 | Pending  |
| VRAT-04     | Phase 5 | Pending  |
| VRAT-05     | Phase 5 | Pending  |
| CICD-01     | Phase 1 | Pending  |
| CICD-02     | Phase 1 | Pending  |
| CICD-03     | Phase 4 | Complete |
| CICD-04     | Phase 5 | Pending  |
| CICD-05     | Phase 5 | Pending  |
| CICD-06     | Phase 5 | Pending  |

**Coverage:**

- v1 requirements: 67 total
- Mapped to phases: 67
- Unmapped: 0 ✓

---

_Requirements defined: 2026-02-26_
_Last updated: 2026-02-26 after initial definition_
