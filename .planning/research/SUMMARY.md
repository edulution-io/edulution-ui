# Project Research Summary

**Project:** edulution-ui comprehensive test suite
**Domain:** Testing infrastructure for NestJS + React + Vite Nx monorepo (educational platform)
**Researched:** 2026-02-26
**Confidence:** HIGH

## Executive Summary

edulution-ui is a production educational platform built as an Nx monorepo with NestJS 11 (API) and React 18 + Vite 5 (frontend). The project has a partial testing foundation: 33 Jest API spec files exist but most contain only `it('should be defined')` assertions, and the frontend has Vitest configured but zero test files. The goal is to build a comprehensive, layered test suite across 5 layers: API unit, frontend unit (stores + hooks + utilities), frontend components, API integration, and E2E. Research confirms all technology choices are well-supported and version-compatible with the existing stack.

The recommended approach is a staged build-out ordered by dependency and ROI: foundation infrastructure first (factories, MSW setup, Vitest upgrade), then high-value low-effort tests (utility functions, guards/pipes/filters, critical Zustand stores), then broader component and API coverage, and finally Playwright E2E on top of a working unit test foundation. This ordering prevents the most costly pitfalls — duplicate mock infrastructure, flaky E2E tests that rot in CI, and over-mocked unit tests that provide false confidence. CI pipeline parallelism must be introduced incrementally alongside each new test category rather than deferred to the end.

The critical risk is technical debt in the existing test infrastructure: duplicate mock definitions (cacheManagerMock in two locations), 21 stores missing from cleanAllStores.ts, and widespread use of `as unknown as` type casts across 13 spec files. These must be resolved before scaling the test suite or maintenance costs will compound. The second critical risk is E2E auth coupling to a staging Keycloak server — the storageState-once approach must be established as the first E2E task or CI flakiness will kill confidence in the test suite.

## Key Findings

### Recommended Stack

The stack decision is constrained by the existing toolchain: Jest 29 for the API (cannot migrate without breaking 33 spec files) and Vitest for the frontend (already configured, Vite-native). The primary changes are an upgrade of Vitest from 1.6 to 3.2.x (the maximum version compatible with Vite 5 — Vitest 4.x requires Vite 6+), plus adding the libraries needed to make frontend testing viable.

See `.planning/research/STACK.md` for full rationale and version compatibility matrix.

**Core technologies:**

- Jest 29 + ts-jest + @nestjs/testing: API unit and integration test runner — already established in 33 spec files, NestJS-official
- Vitest 3.2.x + @vitest/coverage-v8: Frontend and libs unit test runner — upgrade from 1.6, Vite 5 compatible, 2-5x faster than Jest for Vite projects
- @testing-library/react 16.x + @testing-library/user-event 14.x: React component rendering — React 18 compatible, industry standard, replaces Enzyme (which has no React 18 support)
- MSW 2.12.x: Network-level API mocking for frontend tests — intercepts at fetch/XHR layer so full axios pipeline (interceptors, handleApiError) executes
- supertest 7.x: API integration tests against NestJS HTTP server — in-process, fast, official NestJS recommendation
- Playwright 1.58.x + @nx/playwright 22.3.0: E2E browser automation — multi-browser, Nx-native, MCP server for AI-assisted test generation
- @axe-core/playwright 4.11.x: Accessibility testing within E2E — catches ~57% of WCAG violations automatically

**Critical version constraints:**

- Vitest must stay at ^3.2.4 — version 4.x requires Vite 6+, and the project uses Vite 5
- @nx/playwright must be exactly 22.3.0 to match the Nx workspace version
- @vitest/coverage-v8 must match Vitest version exactly (peer dep: "vitest": "3.2.4")

### Expected Features

The test suite covers five distinct testing layers. Research identifies three phases of priority based on dependency order and ROI.

See `.planning/research/FEATURES.md` for full feature matrix with complexity and prioritization.

**Must have (Phase 1 — table stakes):**

- Frontend utility function tests (libs/ + frontend/utils/) — ~30 pure functions, no mocking required, highest ROI per line of code
- API guard/pipe/filter unit tests — ~16 files forming the security perimeter; every branch matters
- MSW setup (server.ts + handlers/) — one-time infrastructure that unblocks all store and component tests
- Shared test factories (JWTUser, AppConfig, Survey, Conference) — prevents mock drift from day one
- Zustand store tests for 5-8 critical stores — catches broken API integration, stale state, error handling gaps
- Expand API service tests to untested modules (mails, notifications, webdav, docker, ldap-keycloak-sync, license, health, user-preferences)
- CI quality gates: frontend test job, required status checks

**Should have (Phase 2 — coverage broadening):**

- Frontend component tests (MenuBar, Sidebar, AppLayout, Table, LoginPage, survey forms, file browser)
- E2E setup: Playwright project, Keycloak storageState auth fixture, Page Object Model
- E2E critical user journeys (5-8: login, file upload/download, survey create/participate, mail send, conference join)
- Frontend hook tests (useSseEventListener, useKeyboardNavigation, useNotifications, useSidebarItems)
- API controller test expansion

**Defer (Phase 3 — advanced quality):**

- Visual regression testing (Playwright toHaveScreenshot) — requires containerized CI for deterministic baselines
- Accessibility testing (axe-core in E2E) — low effort once E2E runs, but E2E must come first
- API integration tests (supertest + mongodb-memory-server) — highest setup complexity, unit tests cover most logic
- API contract validation against swagger-spec.json
- Playwright MCP for AI-assisted test generation — force multiplier once E2E patterns are established

**Anti-features (explicitly avoid):**

- 100% code coverage gates — incentivizes trivial tests; track trends instead
- Snapshot testing for components — maintenance burden with 516 TSX files; use RTL behavioral assertions
- Consumer-driven contract testing (Pact) — designed for microservices, redundant in a monorepo with shared libs/
- Storybook/Chromatic — out of scope; Playwright screenshots achieve visual regression without it

### Architecture Approach

The test infrastructure maps cleanly to the existing monorepo structure: API tests co-located with source (already established), frontend tests co-located with source, shared test utilities isolated by consumer (API utils in apps/api/src/common/testing/, frontend utils in apps/frontend/test/), and E2E as a separate Nx project (apps/e2e/). The key architectural constraint is that test utilities flow strictly downward — production code never imports from test directories, and E2E tests never import from app source.

See `.planning/research/ARCHITECTURE.md` for full directory structure, data flow diagrams, and CI pipeline design.

**Major components:**

1. apps/api/src/common/testing/ — shared NestJS TestingModule builders, Mongoose query builder mock factory, service mock factories (eliminates 40+ lines of boilerplate per spec file)
2. apps/frontend/test/ — MSW server and per-domain handlers, test data factories, renderWithProviders utility (wraps components in full provider tree)
3. apps/e2e/ — Playwright config, Page Object Model classes, Keycloak auth fixtures, API helpers for test data setup
4. .github/workflows/build-and-test.yml (enhanced) — parallel jobs: lint-and-checks, test-api, test-frontend, build-frontend, build-api, e2e, coverage-report
5. libs/src/ test files — use Vitest (same runner as frontend), can consume frontend test factories

### Critical Pitfalls

See `.planning/research/PITFALLS.md` for full detail, recovery strategies, and pitfall-to-phase mapping.

1. **Over-mocking NestJS DI until tests only verify mock wiring** — 19 of 31 existing spec files already exhibit this. Prevention: assertion-first test writing, ban `it('should be defined')` as sole test, create TestingModuleFactory for high-dependency services. Phase 1 must establish this pattern before scaling.

2. **Mongoose query chain mock drift** — existing codebase already has divergent chain mocks across files; silent undefined returns when new chain methods are added. Prevention: create a single Proxy-based `createMockQueryBuilder<T>()` factory before writing any new API tests. This is Phase 1 task zero.

3. **Duplicate mock definitions** — cacheManagerMock already exists in two locations with different shapes. Prevention: consolidate immediately, create fixture factories for JWTUser, ConferenceDocument, UserDocument before new tests are written. 21 stores missing from cleanAllStores.ts must also be resolved.

4. **E2E auth coupling to staging Keycloak causes CI-blocking flakiness** — N OIDC flows per CI run means network latency, token expiry race conditions, and session handling failures. Prevention: storageState approach (authenticate once in globalSetup, reuse for all tests). Must be the first E2E task, validated in CI before writing journey tests.

5. **Testing Zustand stores by mocking Zustand itself** — provides zero confidence in store actions, state transitions, or API error handling. Prevention: test stores via store.getState().action() with MSW intercepting eduApi at the network level. Create a template store test file before writing any store tests. Stores with persist middleware (useLmnApiStore, useUserStore) additionally need localStorage.clear() in beforeEach.

## Implications for Roadmap

Based on combined research, the dependency ordering from ARCHITECTURE.md and pitfall-to-phase mapping from PITFALLS.md drive a clear 5-phase structure.

### Phase 1: Test Foundation and Infrastructure

**Rationale:** All subsequent test work depends on having shared factories, MSW infrastructure, and a standardized Mongoose mock pattern. The two existing mock duplication issues (cacheManagerMock, query chain mocks) and the 21-store cleanAllStores gap will compound exponentially if not resolved before adding more tests. This phase creates building blocks, not tests.

**Delivers:** Vitest 3.2 upgrade, MSW server setup, shared factory pattern, Proxy-based Mongoose query builder mock, consolidated cacheManagerMock, cleanAllStores audit and fix, renderWithProviders utility, TestingModuleBuilder preset, CI frontend test job added.

**Addresses features:** MSW setup, shared test factories, CI quality gates (partial), Vitest upgrade

**Avoids pitfalls:** Mongoose chain mock drift (create factory here), duplicate mock definitions (consolidate here), Zustand state leakage (localStorage.clear() added to vitest.setup.ts), cleanAllStores drift (automated validation added)

**Research flag:** Standard patterns — skip research-phase. Vitest upgrade, MSW setup, and factory patterns are all well-documented with verified versions.

### Phase 2: API Unit Test Expansion

**Rationale:** API tests use established Jest + @nestjs/testing patterns with 33 existing spec files as reference. Expanding to untested modules and deepening shallow tests is high-value, well-understood work. Must come after Phase 1 factory infrastructure exists to avoid reinventing mocks.

**Delivers:** All API service modules have meaningful behavioral tests (not just `should be defined`). API guards/pipes/filters fully tested. API controller tests verify delegation and HTTP status codes.

**Addresses features:** Expand API service tests (mails, notifications, webdav, docker, ldap-keycloak-sync, license, health, mobileApp, user-preferences), API guard/pipe/filter tests (~16 files), API controller test expansion

**Avoids pitfalls:** Over-mocking NestJS DI (assertion-first, ban sole `it('should be defined')` tests), Mongoose chain mock drift (use Phase 1 factory)

**Coverage targets:** Services 75-85% branch, guards/pipes/filters 90%+ branch, controllers 60-70% branch

**Research flag:** Standard patterns — skip research-phase. @nestjs/testing TestingModule patterns are thoroughly documented.

### Phase 3: Frontend Unit Tests (Stores, Hooks, Utilities)

**Rationale:** Frontend has zero tests today. Start with the highest-ROI, lowest-complexity layer: pure utility functions require no mocking, and Zustand stores are plain JavaScript testable without rendering. Must come after Phase 1 MSW setup and factory infrastructure.

**Delivers:** ~30 utility functions tested (libs/ + frontend/utils/), 5-8 critical Zustand stores tested with MSW, ~25 custom hooks tested via renderHook().

**Addresses features:** Frontend utility tests, Zustand store tests (useFileSharingStore, useMailsStore, useSurveyEditorPageStore, useConferenceStore, useAppConfigsStore, useClassManagementStore), frontend hook tests (useSseEventListener, useKeyboardNavigation, useNotifications, useSidebarItems)

**Avoids pitfalls:** Zustand store testing anti-pattern (use getState()/setState() with MSW, not mocked Zustand), Zustand state leakage (store.reset() in beforeEach, localStorage.clear() for persist stores), snapshot testing (RTL queries only, no toMatchSnapshot)

**Coverage targets:** Libs 85-90% branch, Zustand stores 70-80% branch, frontend utilities 90%+ branch

**Research flag:** Standard patterns — skip research-phase for utilities and hooks. Store testing with MSW is well-documented in Zustand and MSW official docs.

### Phase 4: Frontend Component Tests and E2E Setup

**Rationale:** Component tests require MSW (Phase 1) and renderWithProviders (Phase 1) to be viable. E2E setup is the highest-complexity phase and should only begin once component-level confidence is established. The Keycloak storageState auth approach must be the first E2E task or the entire E2E suite will rot from flakiness.

**Delivers:** Critical shared components tested (MenuBar, Sidebar, AppLayout, Table, LoginPage, survey forms, file browser), Playwright project configured with Nx, Keycloak auth fixture with storageState, Page Object Model base classes, 5-8 E2E critical user journey tests, E2E CI job.

**Addresses features:** Frontend component tests, E2E setup, E2E critical journeys (login, file sharing, survey participation, mail, conference join)

**Avoids pitfalls:** Snapshot testing (ESLint rule banning toMatchSnapshot in spec.tsx files), E2E auth flakiness (storageState-once approach validated in CI before journey tests), E2E data setup through UI (use API helpers instead)

**Special considerations:** SurveyJS components should test via SurveyJS Model API, not DOM rendering (jsdom incompatible). TLDraw components should not be rendered in tests (requires canvas/RAF).

**Research flag:** E2E Keycloak auth strategy may need deeper research if staging server behavior differs from standard OIDC. The storageState pattern is well-documented for standard OIDC but Keycloak-specific redirect timing may require iteration.

### Phase 5: Advanced Quality and CI Hardening

**Rationale:** Visual regression, accessibility testing, and API integration tests all compound on top of the working test suite from Phases 1-4. CI coverage reporting and diff-gating make the test suite actionable rather than decorative.

**Delivers:** Visual regression tests (Playwright toHaveScreenshot for login, dashboard, file browser, survey editor, both themes), accessibility scans (axe-core assertions in E2E tests), API integration tests (supertest + mongodb-memory-server for auth flow and survey CRUD), coverage diff reporting as PR comments, diff-coverage gates (new files must have >60% coverage).

**Addresses features:** Visual regression testing, accessibility testing, API integration tests, coverage reporting

**Avoids pitfalls:** CI pipeline slowness (parallel jobs, nx affected for PRs, per-job timeouts), coverage without accountability (diff-coverage gates on PRs)

**Research flag:** API integration tests with mongodb-memory-server may need research for the specific Mongoose version and connection patterns used in this codebase. Visual regression requires containerized CI (same OS/browser) — research Docker-in-GitHub-Actions setup for deterministic baselines.

### Phase Ordering Rationale

- **Foundation before tests:** Phases 1-5 are ordered by the dependency DAG from ARCHITECTURE.md. Mock factories and MSW must exist before store tests; store tests before component tests; component tests before E2E; E2E before visual/a11y.
- **API before frontend for unit tests:** API unit tests (Phase 2) use a well-established pattern with 33 reference files. Frontend unit tests (Phase 3) need Phase 1 infrastructure. Running them in parallel wastes infrastructure work.
- **E2E as late as possible:** E2E is the highest-complexity, highest-maintenance layer. Building it on top of a working unit test foundation means debugging E2E failures is tractable — you know the individual pieces work.
- **CI incrementally, not at the end:** Add CI jobs as each phase's tests are created (frontend job in Phase 1, E2E job in Phase 4, coverage gating in Phase 5). The PITFALLS research explicitly warns against letting tests exist without CI running them.

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 4 (E2E auth):** Keycloak-specific OIDC redirect timing and token refresh behavior in Playwright global-setup. Standard storageState pattern documented but staging Keycloak behavior needs validation.
- **Phase 5 (API integration tests):** mongodb-memory-server compatibility with the project's Mongoose version and connection patterns. Also Docker-in-GitHub-Actions for deterministic Playwright screenshot baselines.

Phases with standard patterns (skip research-phase):

- **Phase 1:** Vitest upgrade, MSW setup, factory patterns all have verified official documentation and confirmed version compatibility.
- **Phase 2:** @nestjs/testing TestingModule patterns are thoroughly documented with existing codebase reference files.
- **Phase 3:** Zustand store testing and React hook testing patterns are covered by official Zustand docs and @testing-library/react docs.

## Confidence Assessment

| Area         | Confidence | Notes                                                                                                                                                                          |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Stack        | HIGH       | All versions verified via npm view; peer dependency compatibility confirmed for every library; alternatives explicitly considered and rejected with rationale                  |
| Features     | HIGH       | Based on existing codebase analysis (31 spec files, 74 stores, 516 TSX files counted), industry benchmarks, and established testing pyramid models                             |
| Architecture | HIGH       | Grounded in direct analysis of existing jest.config.ts, vite.config.mts, nx.json, .github/workflows, and docker-compose.yml — not speculation                                  |
| Pitfalls     | HIGH       | Pitfalls 1-3 and 6 are observed existing problems in the codebase, not theoretical risks; Pitfalls 4-5 and 7 are well-documented failure modes with concrete codebase evidence |

**Overall confidence:** HIGH

### Gaps to Address

- **SurveyJS and TLDraw test strategy:** Both libraries have jsdom incompatibilities that require workarounds (testing via API/model instead of rendering). The exact scope of affected components is not fully enumerated — a component audit in Phase 4 planning will be needed.
- **cleanAllStores.ts gap (21 missing stores):** Research identified the gap but did not enumerate which 21 stores are missing. Phase 1 planning should include a concrete audit pass.
- **E2E staging environment constraints:** Research assumed staging Keycloak is available and uses standard OIDC. If there are custom Keycloak themes, MFA requirements, or LDAP sync delays affecting test users, Phase 4 E2E auth setup will need adaptation.
- **API integration test database strategy:** Research recommends mongodb-memory-server for integration tests but the project may prefer a test database configuration. This decision should be made explicitly in Phase 5 planning.

## Sources

### Primary (HIGH confidence)

- `apps/api/src/**/*.spec.ts` (31 files) — existing patterns and anti-patterns, codebase analysis
- `apps/frontend/vite.config.mts` — Vitest configuration, path aliases, environment setup
- `apps/api/jest.config.ts` — Jest configuration, module mapping
- `.github/workflows/build-and-test.yml` — current CI pipeline structure
- `docker-compose.yml` — MongoDB and Redis service definitions
- `nx.json` — plugin configuration for Jest and Vitest
- `apps/frontend/src/store/utils/cleanAllStores.ts` — 51 registered stores vs 72+ actual
- `apps/api/src/common/mocks/` — observed mock duplication patterns
- [vitest@3.2.4 npm registry](https://www.npmjs.com/package/vitest) — version and peer dep verification
- [@nx/vitest@22.3.0 npm registry](https://www.npmjs.com/package/@nx/vitest) — Vitest version range compatibility
- [@playwright/test@1.58.2 npm registry](https://www.npmjs.com/package/@playwright/test) — latest stable
- [@testing-library/react@16.3.2 npm registry](https://www.npmjs.com/package/@testing-library/react) — React 18 peer dep verification
- [NestJS testing documentation](https://docs.nestjs.com/fundamentals/testing) — TestingModule, supertest patterns
- [Playwright authentication docs](https://playwright.dev/docs/auth) — storageState pattern
- [Zustand testing guide](https://docs.pmnd.rs/zustand/guides/testing) — store testing without Zustand mocking
- [MSW Node.js integration](https://mswjs.io/docs/integrations/node/) — Vitest setup pattern
- [MSW quick start](https://mswjs.io/docs/quick-start/) — handler setup

### Secondary (MEDIUM confidence)

- [Playwright accessibility testing docs](https://playwright.dev/docs/accessibility-testing) — axe-core integration
- [Playwright Nx plugin docs](https://nx.dev/docs/technologies/test-tools/playwright) — CI merge-reports
- [MSW + Vitest mocking requests docs](https://vitest.dev/guide/mocking/requests) — confirmed recommended approach
- [NestJS guard testing patterns](https://dev.to/thiagomini/how-to-test-nestjs-guards-55ma) — ExecutionContext mock approach
- [Keycloak + Playwright auth](https://hoop.dev/blog/the-simplest-way-to-make-keycloak-playwright-work-like-it-should/) — OIDC flow with Playwright
- [Kent C. Dodds: Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) — phase distribution rationale

### Tertiary (LOW confidence)

- mongodb-memory-server compatibility with current Mongoose version — not verified; check during Phase 5 planning
- Docker-in-GitHub-Actions for deterministic Playwright screenshots — inferred from Playwright docs; needs CI environment validation

---

_Research completed: 2026-02-26_
_Ready for roadmap: yes_
