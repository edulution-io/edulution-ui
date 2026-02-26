# Feature Research

**Domain:** Test coverage for a production NestJS+React educational platform (edulution-ui)
**Researched:** 2026-02-26
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Test Suite Is Incomplete Without These)

Features that any production NestJS+React application with CI must have. Missing these means regressions will reach users.

| Feature                                       | Why Expected                                                                                                                                                                                                     | Complexity | Notes                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **API service unit tests (all modules)**      | Services contain business logic; untested services mean silent data corruption, broken survey scoring, wrong file permissions                                                                                    | MEDIUM     | 33 of ~40 modules have spec files but many are shallow ("should be defined"). Expand to cover all branches in surveys, mail, conferences, filesharing, wireguard, notifications, parent-child-pairing, mails, docker, webdav, license, bulletin-category, health, ldap-keycloak-sync, mobileAppModule, metrics, user-preferences modules. Jest + @nestjs/testing already in place. |
| **API controller unit tests (all modules)**   | Controllers validate delegation to services and guard behavior; untested controllers miss broken routes and missing auth checks                                                                                  | MEDIUM     | Same pattern as existing controller specs. Focus on verifying correct service method delegation, HTTP status codes, and request validation. Less logic than services but still required.                                                                                                                                                                                           |
| **API guard/pipe/filter unit tests**          | AuthGuard, AccessGuard, AdminGuard, DynamicAppAccessGuard, ValidatePathPipe, ParseJsonPipe, FilterUserPipe, and 5 exception filters are the security perimeter; bugs here = auth bypass or broken error handling | MEDIUM     | 8 guards + 3 pipes + 5 filters = ~16 files. Guards are particularly critical: AuthGuard (JWT verification), AccessGuard (LDAP group checks), AdminGuard. Each is a small class but high-impact. Test with mock ExecutionContext.                                                                                                                                                   |
| **Frontend utility function tests**           | Pure functions (handleApiError, getDisplayName, applyThemeColors, getCompressedImage, copyToClipboard, etc.) are easiest to test and catch the most common regressions                                           | LOW        | ~11 frontend utils + ~20 shared lib utils (getIsAdmin, processLdapGroups, sanitizePath, mapToDirectoryFiles, formatEstimatedTimeRemaining, convertToWebdavUrl, buildCollectDTO, etc.). Zero mocking required for most. Highest ROI per line of test code.                                                                                                                          |
| **Frontend Zustand store tests**              | Stores contain all API call logic and state management; untested stores mean broken data flows, stale UI, lost user input                                                                                        | MEDIUM     | ~35 stores across all features. Test the action methods (API calls + state mutations) using MSW for network mocking. Follow Zustand official testing guide: reset stores in afterEach, use vi.importActual for mock setup. Priority stores: useFileSharingStore, useMailsStore, useSurveyEditorPageStore, useConferenceStore, useAppConfigsStore, useClassManagementStore.         |
| **Frontend component tests (critical paths)** | Components are the user-facing layer; untested components miss rendering bugs, broken interactions, accessibility regressions                                                                                    | MEDIUM     | ~516 TSX files but focus on critical shared components first: MenuBar, Sidebar, AppLayout, Table, Launcher, LoginPage, survey forms, file browser, mail compose. Use React Testing Library + jsdom. Test user interactions, not implementation details.                                                                                                                            |
| **MSW (Mock Service Worker) setup**           | Network-level API mocking decouples frontend tests from backend state; without MSW, store tests require brittle manual axios mocking                                                                             | LOW        | One-time setup: create src/mocks/handlers.ts, src/mocks/server.ts, wire into vitest.setup.ts. Define handlers per API endpoint. Axios (eduApi) works with MSW out of the box.                                                                                                                                                                                                      |
| **E2E tests for critical user journeys**      | Login, survey creation/participation, file upload/download, mail send/receive, conference join are the money paths; no E2E means these break silently after refactors                                            | HIGH       | Playwright + Page Object Model. 5-8 critical journeys. Requires staging Keycloak for auth (save storageState after login, reuse across tests). Most complex setup but highest confidence per test.                                                                                                                                                                                 |
| **CI quality gates (test-blocking PRs)**      | Tests are useless if they do not block merges; without required checks, developers will skip failures                                                                                                            | LOW        | GitHub Actions already runs API tests. Add frontend test job, E2E job. Set as required status checks on master branch. Add coverage reporting (Codecov) with PR comments.                                                                                                                                                                                                          |
| **Shared test utilities and factories**       | Without factories, each test file reinvents mock users, mock surveys, mock configs; leads to 500 lines of boilerplate per spec file                                                                              | LOW        | Create test user factory, mock JWT factory, mock appConfig factory, mock survey factory. Shared across API and frontend tests via libs or test/ directories. Pattern already exists in surveys/mocks/.                                                                                                                                                                             |

### Differentiators (Advanced Testing That Provides Competitive Advantage)

Features that go beyond baseline. Not expected in every project, but each catches a specific class of bug that table-stakes testing misses.

| Feature                                                       | Value Proposition                                                                                                                                                                                                                                      | Complexity | Notes                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Visual regression testing (Playwright screenshots)**        | Catches CSS regressions, layout shifts, theme breakage (light/dark), menubar state changes that no unit test can detect. Educational platforms have complex layouts (sidebar + menubar + content area + overlays) where visual regressions are common. | MEDIUM     | Built into Playwright via `expect(page).toHaveScreenshot()`. Requires consistent CI environment (same OS/browser for baseline). Cover: login page, dashboard, file browser, survey editor, mail, settings. Test both light and dark themes. 15-25 screenshot assertions across key pages. Flaky if not containerized; use Docker in CI for determinism. |
| **Accessibility testing (axe-core)**                          | Educational platforms serve diverse users including those with disabilities. Catches WCAG violations (missing alt text, broken ARIA, color contrast, keyboard navigation). axe-core catches ~33% of a11y issues automatically.                         | LOW        | Two integration points: (1) @axe-core/playwright for E2E a11y scans on each page, (2) vitest-axe for component-level a11y checks during unit tests. Low effort to add an `expect(await new AxeBuilder({ page }).analyze()).toHaveNoViolations()` assertion to existing E2E tests. Run on every page load in E2E suite.                                  |
| **API integration tests (supertest, full request lifecycle)** | Unit tests mock everything; integration tests catch wiring bugs (wrong decorator, missing guard, broken pipe chain, incorrect module imports). Catches "it works in isolation but breaks when assembled."                                              | HIGH       | Use NestJS TestingModule with real module imports (not mocked services) + supertest for HTTP assertions. Requires in-memory MongoDB (mongodb-memory-server) or test database. Start with auth flow (login endpoint) and survey CRUD. 10-15 integration tests covering the most critical API routes.                                                     |
| **API contract testing (OpenAPI spec validation)**            | swagger-spec.json already exists in the repo. Validate that actual API responses match the OpenAPI contract. Catches schema drift where the code and docs diverge.                                                                                     | MEDIUM     | Use a tool like openapi-backend or a custom Jest matcher that validates response bodies against swagger-spec.json schemas. Alternatively, Pact for consumer-driven contracts between frontend and API. The swagger-spec.json is already generated; validate it stays accurate.                                                                          |
| **Frontend hook tests**                                       | Custom hooks (useSseEventListener, useSseHeartbeatMonitor, useKeyboardNavigation, useNotifications, useSidebarItems, useTableActions) contain logic that is hard to test through components. Testing hooks directly catches state machine bugs.        | LOW        | Use @testing-library/react renderHook(). ~25 custom hooks. Priority: useSseEventListener (SSE dispatch logic), useNotifications (push notification handling), useKeyboardNavigation (file browser keyboard shortcuts), useSidebarItems (menu generation from appConfigs).                                                                               |
| **Playwright MCP + AI-assisted test generation**              | 2-3x speedup for bulk test creation. Playwright MCP server lets Claude Code interact with the running app to generate E2E tests by observing real DOM state.                                                                                           | LOW        | Playwright MCP server is a standard npm package. Point Claude Code at the running dev server. Generate Page Objects and test scripts from real app state. Not a test type itself but a force multiplier for all E2E work.                                                                                                                               |

### Anti-Features (Testing Patterns to Deliberately Avoid)

Features that seem good but create problems. Each wastes time, increases flakiness, or gives false confidence.

| Feature                                                              | Why Requested                             | Why Problematic                                                                                                                                                                                                                                                                                                                               | Alternative                                                                                                                                                                                       |
| -------------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **100% code coverage target**                                        | Sounds rigorous and thorough              | Incentivizes testing getters/setters and trivial code. Coverage percentage becomes the goal instead of catching bugs. Teams write assertion-free tests ("should be defined") to hit numbers. Diminishing returns after ~80% on services, ~70% on components.                                                                                  | Set coverage as a reporting metric, not a gate. Track trends (coverage should increase, not decrease). Focus on critical path coverage, not percentage.                                           |
| **Snapshot testing for components**                                  | Quick to write, catches any change        | Enormous maintenance burden. Any intentional UI change breaks snapshots. Developers learn to blindly update snapshots. Does not assert behavior, only serialized HTML structure. With 516 TSX files, snapshot tests become a changelog, not a safety net.                                                                                     | Use visual regression (Playwright screenshots) for UI appearance. Use RTL assertions for behavior. Snapshot tests are acceptable only for small, stable data structures.                          |
| **Mocking Mongoose at the query builder level in integration tests** | Allows testing without a database         | Mongoose query chains (find().select().lean().exec()) are an implementation detail. Mock chains break on any refactor. Does not catch real query bugs (wrong filter, missing index, incorrect population). Already used for unit tests where it is appropriate.                                                                               | For integration tests, use mongodb-memory-server for real MongoDB. Keep Mongoose mocks only in unit tests where isolating service logic from DB is the explicit goal.                             |
| **E2E tests for every page and feature**                             | Maximum coverage                          | E2E tests are 10-100x slower than unit tests, flaky by nature (network, timing, browser state), and expensive to maintain. An educational platform with 18+ pages would need 50+ E2E tests. Maintenance cost exceeds value after ~15-20 E2E tests.                                                                                            | Keep E2E to 5-10 critical user journeys. Use component tests and integration tests for breadth. E2E for depth on the paths that matter most (login, surveys, file sharing).                       |
| **Consumer-driven contract testing (Pact) for a monorepo**           | Guarantees API compatibility              | Pact is designed for microservices where consumer and provider deploy independently. In a monorepo where frontend and API are versioned together and deployed atomically, the contract is enforced by shared types in libs/. Adding Pact adds broker infrastructure and contract management overhead with no deployment independence benefit. | Validate responses against swagger-spec.json in API integration tests. Shared types in libs/ are the contract.                                                                                    |
| **Storybook + Chromatic for visual testing**                         | Industry standard for component libraries | No Storybook in the project. Adding Storybook requires writing stories for every component (516+ files). Chromatic costs money for CI integration. Playwright screenshots achieve the same result for full-page visual regression without a separate tool.                                                                                    | Playwright screenshot comparisons cover visual regression. If component-level visual testing is needed later, add Storybook incrementally for the design system components in libs/ui-kit/ only.  |
| **Performance/load testing in the test suite**                       | Catches slow queries and memory leaks     | Performance testing requires production-like data volumes, dedicated infrastructure, and statistical analysis. Running load tests in CI is unreliable (shared runners, variable performance). Mixing performance with correctness testing conflates two concerns.                                                                             | Keep performance testing as a separate, periodic activity. Use Lighthouse CI for frontend performance budgets. Profile API endpoints manually or with dedicated tools (k6, Artillery) on staging. |
| **Testing private methods directly**                                 | Want to ensure internal logic is correct  | Testing private methods couples tests to implementation. Refactoring internals breaks tests even when behavior is unchanged. The `(service as any).privateMethod()` pattern seen in existing tests is a code smell.                                                                                                                           | Test through the public API. If a private method is complex enough to need its own test, extract it into a utility function and test that function directly.                                      |

## Feature Dependencies

```
[MSW Setup]
    └──requires──> [Frontend Store Tests]
                       └──requires──> [Frontend Component Tests]
                                          └──enhances──> [E2E Tests]

[Shared Test Utilities/Factories]
    └──enhances──> [API Service Tests]
    └──enhances──> [API Controller Tests]
    └──enhances──> [Frontend Store Tests]
    └──enhances──> [E2E Tests]

[API Service Unit Tests (all modules)]
    └──enhances──> [API Integration Tests]

[API Guard/Pipe/Filter Tests]
    └──independent (no deps, high priority)

[Frontend Utility Tests (libs + frontend)]
    └──independent (no deps, highest ROI)

[E2E Auth Setup (Playwright + Keycloak)]
    └──requires──> [E2E Critical Journeys]
                       └──enhances──> [Visual Regression Tests]
                       └──enhances──> [Accessibility Tests]

[CI Quality Gates]
    └──requires──> [API Tests passing]
    └──requires──> [Frontend Tests passing]
    └──enhances──> [E2E Tests]

[Visual Regression] ──conflicts──> [Snapshot Testing]
    (both catch visual changes; pick one — visual regression is superior)

[Pact Contract Testing] ──conflicts──> [Monorepo Shared Types]
    (redundant in a monorepo with shared libs/)
```

### Dependency Notes

- **MSW Setup requires Frontend Store Tests:** Stores make all API calls via eduApi (axios). MSW intercepts at the network level, making store tests realistic without coupling to axios internals. Must set up MSW before writing store tests.
- **E2E Auth Setup requires E2E Critical Journeys:** Playwright storageState pattern (login once, save cookies, reuse) must be established before any E2E test can run against the authenticated app.
- **Visual Regression enhances E2E Tests:** Screenshot assertions are added to existing E2E test flows, not a separate test suite. They ride on the E2E navigation.
- **API Service Tests enhance API Integration Tests:** Unit tests establish that services work in isolation. Integration tests then verify the assembled module works end-to-end. Writing integration tests without unit tests means debugging failures is harder.
- **Shared Test Utilities enhance everything:** Factories and fixtures reduce boilerplate everywhere. Building them early pays compound interest.

## MVP Definition

### Launch With (Phase 1 -- Immediate Value)

Minimum viable test suite that catches the most common regressions with the least effort.

- [ ] **Frontend utility function tests (libs/ + frontend/utils/)** -- ~30 pure functions, zero mocking, highest ROI per line of test code. Catches data transformation bugs in file paths, WebDAV URLs, user role checks, theme application.
- [ ] **MSW setup + Zustand store tests (5-8 critical stores)** -- Establishes the frontend testing pattern. Catches broken API integration, stale state, error handling failures.
- [ ] **API guard/pipe/filter unit tests** -- ~16 files protecting the security perimeter. Catches auth bypass, path traversal, broken error responses.
- [ ] **Expand API service tests to untested modules** -- Fill gaps in mails, notifications, parent-child-pairing, docker, webdav, license, health, ldap-keycloak-sync, mobileAppModule, user-preferences modules.
- [ ] **Shared test factories** -- User factory, JWT factory, AppConfig factory. Pays forward into every subsequent test.
- [ ] **CI quality gates** -- Frontend test job in GitHub Actions, required status checks, coverage reporting.

### Add After Validation (Phase 2 -- Broadening Coverage)

Features to add once Phase 1 patterns are established and the team has test-writing momentum.

- [ ] **Frontend component tests (critical shared components)** -- Trigger: Phase 1 store tests are passing and patterns are clear. Cover MenuBar, Sidebar, AppLayout, Table, LoginPage, survey forms, file browser.
- [ ] **E2E setup (Playwright + Keycloak auth + Page Object Model)** -- Trigger: Frontend component tests prove the UI works in isolation; now verify it works assembled. 5-8 critical journeys.
- [ ] **Frontend hook tests** -- Trigger: after component tests reveal which hooks have complex logic worth testing directly (useSseEventListener, useKeyboardNavigation, useNotifications).
- [ ] **API controller test expansion** -- Trigger: service tests cover all modules; now verify controllers delegate correctly.

### Future Consideration (Phase 3 -- Advanced Quality)

Features to defer until baseline coverage is established and the team can invest in refinement.

- [ ] **Visual regression testing** -- Why defer: requires containerized CI for deterministic screenshots. Add once E2E tests are stable.
- [ ] **Accessibility testing** -- Why defer: adds axe-core assertions to existing E2E tests. Low effort once E2E is running, but E2E must come first.
- [ ] **API integration tests (supertest + mongodb-memory-server)** -- Why defer: highest setup complexity. Unit tests cover most logic. Integration tests add value for wiring bugs that only surface in assembled modules.
- [ ] **API contract validation (swagger-spec.json)** -- Why defer: requires tooling to compare actual responses against OpenAPI schemas. Valuable but not urgent when shared types in libs/ enforce the contract at compile time.
- [ ] **Playwright MCP for AI-assisted test generation** -- Why defer: force multiplier that is most valuable when the E2E patterns and Page Objects are already established.

## Feature Prioritization Matrix

| Feature                                     | User Value | Implementation Cost | Priority |
| ------------------------------------------- | ---------- | ------------------- | -------- |
| Frontend utility tests (libs/ + utils/)     | HIGH       | LOW                 | P1       |
| API guard/pipe/filter tests                 | HIGH       | LOW                 | P1       |
| MSW setup                                   | MEDIUM     | LOW                 | P1       |
| Shared test factories                       | MEDIUM     | LOW                 | P1       |
| CI quality gates                            | HIGH       | LOW                 | P1       |
| Zustand store tests (critical stores)       | HIGH       | MEDIUM              | P1       |
| Expand API service tests (untested modules) | HIGH       | MEDIUM              | P1       |
| Frontend component tests (critical)         | HIGH       | MEDIUM              | P2       |
| E2E setup + critical journeys               | HIGH       | HIGH                | P2       |
| Frontend hook tests                         | MEDIUM     | LOW                 | P2       |
| API controller test expansion               | MEDIUM     | MEDIUM              | P2       |
| Visual regression testing                   | MEDIUM     | MEDIUM              | P3       |
| Accessibility testing (axe-core)            | MEDIUM     | LOW                 | P3       |
| API integration tests (supertest)           | MEDIUM     | HIGH                | P3       |
| API contract validation                     | LOW        | MEDIUM              | P3       |
| Playwright MCP test generation              | MEDIUM     | LOW                 | P3       |

**Priority key:**

- P1: Must have for launch -- catches the most common regressions with the least effort
- P2: Should have -- broadens coverage once P1 patterns are established
- P3: Nice to have -- advanced quality that compounds on top of P2

## What Each Test Type Catches

| Test Type                       | What It Catches                                                                                            | What It Misses                                                        | When Worth Investment                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **API service unit tests**      | Business logic errors, incorrect data transformations, wrong Mongoose queries, broken error handling       | Wiring bugs (wrong module imports, missing guards), real DB behavior  | Always. Core of API quality. Target 80%+ branch coverage on services.                         |
| **API controller unit tests**   | Broken route-to-service delegation, missing decorators, wrong HTTP status codes                            | Business logic (tested in service tests), real HTTP behavior          | Always. Quick to write, catches routing and delegation bugs.                                  |
| **API guard/pipe/filter tests** | Auth bypass, path traversal, broken validation, incorrect error responses                                  | Guard interaction ordering, real JWT verification against Keycloak    | Always. Security perimeter. Every guard must have tests.                                      |
| **Frontend utility tests**      | Data transformation bugs, string formatting errors, wrong URL construction, broken role checks             | UI rendering, user interaction, async behavior                        | Always. Highest ROI. Pure functions, no mocking, fast execution.                              |
| **Zustand store tests**         | Broken API calls, incorrect state mutations, missing error handling, stale data after actions              | Component rendering, user interaction triggering store methods        | Always for stores with API calls. Catches the "data layer" bugs.                              |
| **Frontend component tests**    | Rendering bugs, broken user interactions, missing conditional rendering, wrong prop handling               | Full-page layout, cross-component interactions, real API responses    | For components with conditional logic or user interactions. Skip for pure display components. |
| **E2E tests**                   | Integration bugs across the full stack, broken auth flows, navigation failures, real-world user experience | Edge cases, error scenarios (expensive to set up in E2E), performance | For 5-10 critical user journeys. The money paths.                                             |
| **Visual regression**           | CSS regressions, layout shifts, theme breakage, responsive design bugs, missing icons                      | Logic bugs, data correctness, accessibility                           | When UI stability matters. Add after E2E is stable.                                           |
| **Accessibility tests**         | Missing ARIA, color contrast, keyboard navigation, screen reader issues                                    | Complex interaction accessibility, cognitive accessibility            | When user diversity matters. Educational platforms should prioritize this.                    |
| **API integration tests**       | Module wiring bugs, missing guards on routes, incorrect middleware chain, real DB query behavior           | Already caught by unit tests + E2E tests combined                     | When unit tests are comprehensive and you still see "works in test, breaks in prod" patterns. |

## Typical Coverage Targets (Industry Benchmarks)

These are guidelines, not gates. Track trends, not absolute numbers.

| Layer                    | Target Range                | Rationale                                               |
| ------------------------ | --------------------------- | ------------------------------------------------------- |
| API services             | 75-85% branch coverage      | Services contain the most critical business logic       |
| API controllers          | 60-70% branch coverage      | Controllers are thin delegation layers                  |
| API guards/pipes/filters | 90%+ branch coverage        | Security-critical code, every branch matters            |
| Frontend utilities       | 90%+ branch coverage        | Pure functions, easy to test thoroughly                 |
| Zustand stores           | 70-80% branch coverage      | API call + state mutation logic                         |
| Frontend components      | 50-65% branch coverage      | Diminishing returns on complex UI trees                 |
| E2E critical journeys    | 100% of identified journeys | Not measured by code coverage but by journey completion |
| Libs (shared utils)      | 85-90% branch coverage      | Used by both apps, bugs propagate everywhere            |

## Sources

- [Testing NestJS Apps: Best Practices & Common Pitfalls](https://amplication.com/blog/best-practices-and-common-pitfalls-when-testing-my-nestjs-app) -- NestJS testing patterns
- [NestJS Official Testing Documentation](https://docs.nestjs.com/fundamentals/testing) -- TestingModule, DI mocking
- [Unit, Integration, and E2E Testing for Fullstack Apps in 2025](https://talent500.com/blog/fullstack-app-testing-unit-integration-e2e-2025/) -- Testing pyramid distribution (70/20/10)
- [Testing in 2026: Jest, React Testing Library, and Full Stack Testing Strategies](https://www.nucamp.co/blog/testing-in-2026-jest-react-testing-library-and-full-stack-testing-strategies) -- Modern test strategy recommendations
- [Zustand Official Testing Guide](https://docs.pmnd.rs/zustand/guides/testing) -- Store testing with Vitest, mock setup
- [How to Test NestJS Guards](https://dev.to/thiagomini/how-to-test-nestjs-guards-55ma) -- Guard testing patterns with ExecutionContext mocks
- [Playwright Authentication](https://playwright.dev/docs/auth) -- storageState pattern for E2E auth
- [The simplest way to make Keycloak Playwright work](https://hoop.dev/blog/the-simplest-way-to-make-keycloak-playwright-work-like-it-should/) -- Keycloak + Playwright E2E auth
- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots) -- toHaveScreenshot() API, baseline management
- [How to Test React Applications for Accessibility with axe-core](https://oneuptime.com/blog/post/2026-01-15-test-react-accessibility-axe-core/view) -- axe-core + React Testing Library integration
- [Kent C. Dodds: The Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) -- Testing Trophy model, integration-first strategy
- [Kent C. Dodds: Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests) -- Guiding principle for test ROI
- [Does the testing trophy need updating for 2025?](https://kentcdodds.com/calls/05/02/does-the-testing-trophy-need-updating-for-2025) -- E2E tools now cheap enough to shift the trophy
- [MSW Quick Start](https://mswjs.io/docs/quick-start/) -- Mock Service Worker setup
- [React Unit Testing Using Vitest, RTL, and MSW](https://blog.stackademic.com/react-unit-testing-using-vitest-rtl-and-msw-682da23acf00) -- Vitest + MSW integration pattern
- [Pact vs OpenAPI](https://www.speakeasy.com/blog/pact-vs-openapi) -- Why Pact is for microservices, not monorepos

---

_Feature research for: Test coverage — edulution-ui educational platform_
_Researched: 2026-02-26_
