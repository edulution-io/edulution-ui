# Pitfalls Research

**Domain:** Adding comprehensive test coverage to an existing NestJS + React monorepo (edulution-ui)
**Researched:** 2026-02-26
**Confidence:** HIGH (based on direct codebase analysis of 31 existing spec files, 74 Zustand stores, 516 React components, and established patterns)

## Critical Pitfalls

### Pitfall 1: Over-Mocking NestJS DI Until Tests Only Verify Mock Wiring

**What goes wrong:**
Tests replace every dependency with `jest.fn()` stubs that return hardcoded values, then assert that those hardcoded values were returned. The test passes regardless of whether the service logic is correct. This already shows in the codebase: 19 of 31 existing spec files contain `it('should be defined')` tests that only verify DI wiring, and some controller tests only check that the controller calls `service.method()` without asserting the response transformation, error mapping, or guard interaction.

**Why it happens:**
NestJS's `Test.createTestingModule` makes it easy to replace every provider with a mock. When a service has 8+ dependencies (like `ConferencesService` with its model, ConfigService, AppConfigService, GroupsService, CACHE_MANAGER, SchedulerRegistry, FilesystemService, NotificationsService, EventEmitter2, SseService), the test setup becomes 40+ lines of mock wiring before a single assertion is written. Developers optimize for making the test pass rather than making it meaningful.

**How to avoid:**

- Write assertion-first tests: start with the `expect()` statement, then build up only the mocks required for that assertion.
- Ban `it('should be defined')` as the sole test for a describe block. Every describe block must test at least one behavior.
- For services with 5+ dependencies, consider creating a `TestingModuleFactory` that pre-wires common mocks and lets individual tests override only the relevant ones.
- Prefer `jest.spyOn()` on real methods over replacing the entire dependency, so actual business logic executes.

**Warning signs:**

- Test files where the `beforeEach` setup is longer than all `it()` blocks combined.
- Tests that pass even after introducing a deliberate bug in the service logic.
- Mock objects that mirror the entire interface of a service but with `jest.fn()` for every method, most returning empty arrays or undefined.

**Phase to address:**
Phase 1 (API unit test expansion). Establish the assertion-first pattern before scaling to remaining modules.

---

### Pitfall 2: Mocking Mongoose Query Chains Incorrectly Creates Invisible False Passes

**What goes wrong:**
The codebase uses a chained query builder pattern (`model.find().lean().exec()`, `model.findOne().select().lean().exec()`). Mocking these chains requires every chain link to return `this` or the right value. When a new chain method is added to the production code (e.g., `.populate()`, `.sort()`, `.skip()`, `.limit()`), existing mocks silently return undefined instead of throwing, making the test pass while the production code gets `undefined.lean is not a function` at runtime.

**Why it happens:**
The existing mock pattern (e.g., in `conferences.service.spec.ts`) manually builds each chain. There is no shared query builder mock factory used consistently across the 31 spec files. The `makeMockQuery` helper in `appconfig.mock.ts` exists but is not widely adopted. Each test file reinvents its own chain mock.

**How to avoid:**

- Create a single `createMockQueryBuilder<T>(result: T)` factory in `apps/api/src/common/mocks/` that returns a Proxy-based mock: any property access returns `this`, `.exec()` and `.lean()` resolve to the provided result, and `.toArray()` resolves to an array. This eliminates the need to predict every chain method.
- Alternatively, use `mongoose-mock` or write a thin wrapper that records calls for assertion.
- Add a lint rule or code review checklist item: "Did you verify the mock chain matches the actual Mongoose calls in the service?"

**Warning signs:**

- Tests that mock `find().lean()` but the service actually calls `find().sort().lean()` -- the test passes because `sort` is called on an object that returns undefined silently.
- Duplicate model mock definitions across spec files with slightly different chain shapes.
- Runtime errors in production that existing unit tests should have caught.

**Phase to address:**
Phase 1 (API unit test expansion), as the very first task. Standardize the mock factory before writing any new tests.

---

### Pitfall 3: Testing Zustand Stores by Mocking Zustand Itself Instead of Testing State Transitions

**What goes wrong:**
Developers mock `zustand/create` or mock the store module at import time, writing tests that verify the mock rather than the actual store behavior. This provides zero confidence that store actions, async API calls, error handling, and state transitions work correctly. Alternatively, developers test stores by rendering a component that uses the store, conflating component rendering issues with store logic issues.

**Why it happens:**
Zustand stores in this codebase contain both state management and API call logic (e.g., `useLmnApiStore` has `setLmnApiToken`, `getOwnUser`, `fetchUser`, `fetchUsersQuota` -- all making `eduApi` calls). Testing them requires mocking the HTTP layer (axios/eduApi) but not Zustand itself. Developers unfamiliar with Zustand testing patterns reach for the wrong abstraction.

**How to avoid:**

- Test Zustand stores directly using `store.getState()` and `store.setState()` without rendering any component. Zustand stores are plain JavaScript -- call the action, read the state.
- Mock `eduApi` (the axios instance) at the module level with `vi.mock('@/api/eduApi')`, not Zustand.
- Use MSW (Mock Service Worker) for integration-level store tests where the full axios pipeline should execute.
- Establish a template test file for stores early:
  ```typescript
  import { act } from '@testing-library/react';
  // Reset store state before each test
  beforeEach(() => {
    useMyStore.getState().reset();
  });
  // Test action
  it('should update state on successful fetch', async () => {
    vi.mocked(eduApi.get).mockResolvedValueOnce({ data: mockData });
    await act(async () => {
      await useMyStore.getState().fetchData();
    });
    expect(useMyStore.getState().data).toEqual(mockData);
    expect(useMyStore.getState().isLoading).toBe(false);
  });
  ```

**Warning signs:**

- Test files that import from `zustand` in their mock setup.
- Store tests that never call `getState()` or `setState()`.
- Store tests that fail when Zustand is upgraded because they depend on internal implementation details.
- Stores with `persist` middleware (like `useLmnApiStore` and `useUserStore`) tested without accounting for `localStorage` interaction.

**Phase to address:**
Phase 2 (Frontend unit testing). Create the store testing template before any store tests are written.

---

### Pitfall 4: Playwright E2E Tests Coupled to Staging Keycloak Become CI-Blocking Flaky Tests

**What goes wrong:**
E2E tests that authenticate through a real Keycloak server become the most unreliable part of the CI pipeline. Staging server downtime, LDAP sync delays, token expiration race conditions, session cookie handling, and network latency between the CI runner and the staging server all cause intermittent failures. The team disables E2E tests in CI ("we'll run them manually") and they rot.

**Why it happens:**
The project decision is to use a staging Keycloak server (no local Keycloak container). This means every E2E test run depends on an external service that the CI pipeline does not control. Keycloak OIDC flows involve redirects, cookies, and token refresh -- all timing-sensitive in a headless browser context.

**How to avoid:**

- Implement a `storageState` approach: authenticate once in a global setup fixture, save the browser storage state (cookies + localStorage) to a file, and reuse it for all tests. This reduces Keycloak interactions from N (one per test) to 1 (per CI run).
- Add retry logic specifically to the auth setup step, with exponential backoff.
- Set explicit timeouts for navigation during OIDC redirects (Keycloak login -> redirect to app) that account for staging server latency.
- Tag E2E tests that require auth vs. those that test public pages. Run public-page tests unconditionally; run auth tests with a "staging-available" gate.
- Store test user credentials in CI secrets, not in test code.
- Monitor staging server health before triggering E2E jobs (a simple HTTP health check as a CI precondition step).

**Warning signs:**

- E2E tests that pass locally but fail in CI with "Navigation timeout exceeded" or "Target closed" errors.
- Tests that fail on the first run of the day (cold Keycloak session) but pass on retry.
- CI pipeline duration increasing because each E2E test re-authenticates from scratch.
- Team members adding `test.skip()` to "flaky" auth tests.

**Phase to address:**
Phase 4 (E2E setup). The auth strategy must be the first E2E task, validated in CI before writing any journey tests.

---

### Pitfall 5: Testing React Components by Snapshot-Testing the DOM Tree

**What goes wrong:**
Teams adding tests to a large existing frontend default to snapshot testing because it produces coverage quickly: render the component, call `toMatchSnapshot()`, commit the snapshot file. This creates thousands of lines of snapshot files that break on any UI change (CSS class rename, i18n key update, icon swap), are rubber-stamp-approved in PRs, and provide no behavioral confidence. The 516 `.tsx` files in this codebase would produce snapshots that are impossible to review meaningfully.

**Why it happens:**
Snapshot testing feels productive because it is fast to write and immediately increases coverage metrics. With zero existing frontend tests, the temptation to "get coverage up quickly" with snapshots is high.

**How to avoid:**

- Ban `toMatchSnapshot()` and `toMatchInlineSnapshot()` in the ESLint config for component test files using `no-restricted-syntax` or a custom rule.
- Use React Testing Library's query methods (`getByRole`, `getByText`, `getByLabelText`) to verify behavior: what the user sees, what happens on click, what form state changes.
- For each component test, require at least one user interaction assertion (click, type, select) -- not just "it renders."
- Prioritize testing components with conditional logic (role-based rendering, form validation, error states) over presentational wrappers.

**Warning signs:**

- Pull requests that add `.snap` files.
- Test files where the only assertion is `toMatchSnapshot()`.
- Coverage increasing but bugs still shipping -- a sign tests verify structure, not behavior.

**Phase to address:**
Phase 2 (Frontend component testing). Codify this as a team convention before the first component test is written.

---

### Pitfall 6: Duplicating Mock Definitions Across Test Files Creates Maintenance Nightmare

**What goes wrong:**
The codebase already has this problem: `cacheManagerMock.ts` exists in two locations (`apps/api/src/common/mocks/cacheManagerMock.ts` and `apps/api/src/common/cache-manager.mock.ts`) with slightly different implementations (one includes `del: jest.fn()`, the other does not). As the test suite scales from 31 to 100+ spec files, each creating its own inline mock objects for shared entities (JWTUser, ConferenceDocument, UserDocument), mock definitions drift. A schema change to `JWTUser` requires updating dozens of test files.

**Why it happens:**
Without a central fixture/factory strategy, the fastest way to write a new test is to copy mock data from an existing test file and modify it. Over time, copies diverge and none reflect the current schema.

**How to avoid:**

- Consolidate all mock files immediately: delete `cache-manager.mock.ts`, keep only `common/mocks/cacheManagerMock.ts`, add `del` to it.
- Create fixture factories for core domain objects using a builder pattern:
  ```typescript
  const createMockJWTUser = (overrides?: Partial<JWTUser>): JWTUser => ({
    preferred_username: 'testuser',
    given_name: 'Test',
    family_name: 'User',
    ...defaults,
    ...overrides,
  });
  ```
- Place factories in `apps/api/src/common/test-utils/` and `apps/frontend/src/test-utils/`.
- Add a lint comment or PR review checklist: "Does this test define a mock object that already exists as a factory?"

**Warning signs:**

- `grep -r "preferred_username: " apps/api/src/**/*.spec.ts` returning 10+ unique definitions.
- Mock files with similar names in different directories.
- Schema migration breaking tests in files that were not obviously related to the changed schema.

**Phase to address:**
Phase 1 (before writing any new tests). This is infrastructure that must exist first.

---

### Pitfall 7: CI Pipeline Runs All Tests Sequentially in a Single Job, Blocking PRs for 15+ Minutes

**What goes wrong:**
The current CI workflow (`build-and-test.yml`) runs lint, circular dep checks, translation checks, formatting, and all API tests in a single sequential `test` job. Adding frontend tests (Vitest), E2E tests (Playwright), and coverage reporting to this same job will push CI time to 15-30 minutes per PR. Developers stop waiting for CI, merge without green checks, or rebase-and-push repeatedly creating queue congestion.

**Why it happens:**
The current pipeline was designed when there were only 31 API spec files. Adding 3-4 new test categories to the same job is the path of least resistance.

**How to avoid:**

- Split the test job into parallel jobs from day one:
  - `test-api`: Jest API tests (existing)
  - `test-frontend`: Vitest frontend tests (new)
  - `test-e2e`: Playwright (new, separate job with longer timeout)
  - `lint-and-checks`: ESLint, circular deps, translations, formatting (existing, moved out of test job)
- Use NX's `affected` command to run only tests for changed packages on PRs: `nx affected --target=test`.
- Set per-job timeouts: 5 min for lint, 10 min for unit tests, 15 min for E2E.
- Cache Playwright browser binaries between CI runs.
- Report coverage as a PR comment (Codecov/Coveralls) rather than as a blocking check initially.

**Warning signs:**

- CI job time exceeding 10 minutes for a PR that changes a single file.
- Developers pushing "fix lint" commits because they could not run the same checks locally.
- E2E test timeout causing the entire PR check to fail and block unrelated merges.

**Phase to address:**
Phase 5 (CI pipeline enhancement). Design the job structure before adding tests that depend on it.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut                                                                              | Immediate Benefit                                  | Long-term Cost                                                                                                                | When Acceptable                                                                                         |
| ------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `as unknown as` casts in test fixtures (33 existing occurrences across 13 spec files) | Avoids constructing full Mongoose document objects | Tests do not catch type-level bugs; refactoring types does not break tests that should break                                  | During initial test writing for complex schemas; must be replaced with proper factories within 1 sprint |
| Inline mock data per test file instead of shared factories                            | Faster to write individual tests                   | Mock drift, N-file updates per schema change, inconsistent test data                                                          | Never -- factories should be created from the start                                                     |
| `detectOpenHandles` flag in API test runner                                           | Hides open handle warnings that would fail tests   | Masks real resource leaks (unclosed DB connections, timers) that cause flaky tests and CI hangs                               | Only as initial workaround; investigate and fix open handles within 2 weeks of discovering them         |
| Testing only happy paths to hit coverage targets                                      | Coverage number goes up quickly                    | False confidence; bugs cluster in error paths, edge cases, and race conditions                                                | Never -- error path tests should be proportional to happy path tests                                    |
| Skipping `cleanAllStores.ts` validation in tests                                      | No upfront work                                    | Stores not in `cleanAllStores` leak state between tests, causing order-dependent failures that are nearly impossible to debug | Never                                                                                                   |

## Integration Gotchas

Common mistakes when connecting test infrastructure to external services.

| Integration                | Common Mistake                                                                                                   | Correct Approach                                                                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keycloak (E2E auth)        | Logging in through the UI for each test, creating N OIDC flows per suite                                         | Use Playwright's `storageState` to authenticate once in `globalSetup`, serialize cookies/localStorage, reuse across all tests                                 |
| MSW + eduApi (axios)       | Mocking at the axios instance level with `vi.mock('axios')` instead of at the network level                      | Use MSW to intercept at the fetch/XHR layer so the full axios pipeline (interceptors, error transforms, `handleApiError`) executes                            |
| Mongoose models in tests   | Creating real database connections in "unit" tests, making them slow and flaky                                   | Keep unit tests with mock models (existing pattern); create a separate integration test suite with `MongoMemoryServer` if DB-level testing is needed          |
| Zustand persist middleware | Not clearing `localStorage` between tests, causing state from previous tests to leak via the persist rehydration | Call `store.getState().reset()` in `beforeEach` AND `localStorage.clear()` in vitest setup for stores with `persist` (e.g., `useLmnApiStore`, `useUserStore`) |
| SurveyJS components        | Rendering SurveyJS React components in jsdom and expecting full functionality                                    | SurveyJS has complex DOM interactions; test survey logic (validation, completion callbacks) via the SurveyJS Model API, not by rendering components           |
| TLDraw components          | Attempting to render TLDraw editor in jsdom                                                                      | TLDraw requires canvas, pointer events, and RAF -- skip component rendering tests; test TLDraw-related store logic and sync service independently             |

## Performance Traps

Patterns that work at small scale but fail as the test suite grows.

| Trap                                                                                            | Symptoms                                                                   | Prevention                                                                                                      | When It Breaks                                                 |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Creating a fresh `TestingModule` in every `it()` block instead of `beforeEach` for the describe | Tests run fine with 5 test cases                                           | Move module creation to `beforeEach` at the `describe` level (existing pattern -- enforce it)                   | At 50+ test cases per file, test runtime doubles               |
| Importing entire Zustand stores into test files that only need one utility                      | Vitest bundles all store dependencies (eduApi, i18n, router) into the test | Mock store imports or test utilities in isolation; split test targets by concern                                | At 100+ frontend test files, test boot time exceeds 30 seconds |
| Running Playwright E2E tests with full browser UI rendering on every PR                         | Works fine with 10 tests                                                   | Use `--headed` only for debugging; CI runs headless; use `--workers=4` for parallelism; shard across CI jobs    | At 50+ E2E tests, CI time exceeds 15 minutes                   |
| Collecting coverage for all files including test utilities, mocks, and config                   | Coverage report is readable with 31 files                                  | Configure `coveragePathIgnorePatterns` to exclude `*.mock.ts`, `*.spec.ts`, `test-utils/`, `mocks/` directories | Coverage report becomes noise when measuring 700+ files        |

## Security Mistakes

Domain-specific testing security issues beyond general web security.

| Mistake                                                                           | Risk                                                          | Prevention                                                                                                                                                                           |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hardcoding staging Keycloak credentials in test files committed to git            | Credential exposure in public/shared repository               | Store test credentials in CI secrets (`KEYCLOAK_TEST_USER`, `KEYCLOAK_TEST_PASSWORD`); use `.env.test` with `.gitignore` for local runs                                              |
| E2E tests that log in as admin and perform destructive operations on staging data | Staging environment corrupted; other developers or QA blocked | Create dedicated test user accounts with restricted permissions; use unique test data prefixes (`test-e2e-*`) that can be cleaned up; run E2E in isolated Keycloak realm if possible |
| Test fixtures containing real user data copied from production/staging            | PII in version control; GDPR compliance violation             | Use synthetic data generators (faker/fishery); never copy real database documents into test fixtures                                                                                 |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Zustand store tests:** Often missing test for the `reset()` function itself -- verify the store actually returns to initial state, especially for stores with `persist` middleware that rehydrate from localStorage
- [ ] **API controller tests:** Often missing guard/pipe interaction tests -- the controller is tested with a mock service, but `@UseGuards(AuthGuard)` (52 occurrences across 15 controllers) is not verified to be applied correctly
- [ ] **E2E auth setup:** Often missing token refresh test -- initial login works but the test does not verify behavior when the access token expires mid-journey (especially relevant with the Keycloak token lifecycle)
- [ ] **MSW handlers:** Often missing error response handlers -- happy path handlers are defined but `server.use(rest.get('/api/endpoint', (req, res, ctx) => res(ctx.status(500))))` for error paths is forgotten
- [ ] **Coverage reporting:** Often missing the "is it actionable?" check -- coverage is collected and reported but nobody has configured PR-blocking thresholds or diff-coverage requirements, so the number just exists without consequence
- [ ] **Frontend test setup:** Often missing environment variable mocks -- components that read `VITE_*` env vars or `APP_VERSION` (defined in vite.config.mts) fail in test environment because `process.env` is empty in jsdom
- [ ] **cleanAllStores validation:** Often missing automated verification -- 72 store files exist but only ~51 are listed in `cleanAllStores.ts`; a test should verify all stores are registered

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall                                       | Recovery Cost | Recovery Steps                                                                                                                                                                                              |
| --------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Over-mocked tests that do not catch real bugs | MEDIUM        | Identify tests with zero behavioral assertions via code review; rewrite incrementally starting with services that have had production bugs                                                                  |
| Mongoose chain mock drift                     | LOW           | Create the proxy-based factory mock; find-and-replace existing chain mocks file by file; can be done as independent PRs per module                                                                          |
| Duplicate mock definitions                    | MEDIUM        | Audit with `grep` for common fixture patterns (e.g., `preferred_username`, `mockUser`); consolidate into factories; update imports across 31+ files                                                         |
| Flaky E2E auth                                | HIGH          | Requires rearchitecting the auth setup; add `storageState` approach, which touches globalSetup and every test file's configuration; cannot be done incrementally                                            |
| Snapshot test proliferation                   | LOW           | Delete all `.snap` files; replace with behavioral assertions; ESLint rule prevents recurrence                                                                                                               |
| Slow CI pipeline                              | MEDIUM        | Refactor `build-and-test.yml` into parallel jobs; requires CI configuration expertise and testing the pipeline itself across multiple PRs                                                                   |
| State leakage between Zustand store tests     | HIGH          | Debug is extremely painful (tests pass in isolation, fail when run together); fix by adding `beforeEach` reset calls and `localStorage.clear()` to every test file -- requires touching every existing test |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall                         | Prevention Phase                   | Verification                                                                                                                        |
| ------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Over-mocking NestJS DI          | Phase 1 (API unit tests)           | Code review checklist: every test file has at least one assertion beyond `toBeDefined()`; no `it('should be defined')` as sole test |
| Mongoose chain mock drift       | Phase 1 (API test infrastructure)  | Shared `createMockQueryBuilder` factory exists and is imported by all new spec files                                                |
| Zustand store testing approach  | Phase 2 (Frontend unit tests)      | Template store test file exists; no tests import from `zustand` in mock setup                                                       |
| Snapshot testing proliferation  | Phase 2 (Frontend component tests) | ESLint rule banning `toMatchSnapshot` in `*.spec.tsx` files; zero `.snap` files in repository                                       |
| Duplicate mock definitions      | Phase 1 (before new tests)         | Single source of truth for `cacheManagerMock`, `mockJWTUser`, and model mocks; old duplicates deleted                               |
| E2E auth flakiness              | Phase 4 (E2E setup)                | Auth setup runs in `globalSetup` with retry logic; `storageState` file is reused; no per-test login                                 |
| CI pipeline slowness            | Phase 5 (CI enhancement)           | Test jobs run in parallel; total CI time under 10 minutes for unit tests, under 15 for E2E                                          |
| State leakage in frontend tests | Phase 2 (Frontend test setup)      | `vitest.setup.ts` calls `localStorage.clear()` globally; store reset verified in every test file                                    |
| `cleanAllStores` drift          | Phase 2 (Frontend infrastructure)  | Automated test verifies store count matches `cleanAllStores` entries                                                                |
| Coverage without accountability | Phase 5 (CI reporting)             | Diff-coverage check on PRs; new files must have >60% coverage to merge                                                              |

## Sources

- Direct codebase analysis of 31 existing API spec files in `apps/api/src/`
- `.github/workflows/build-and-test.yml` -- current CI pipeline structure
- `apps/frontend/src/store/utils/cleanAllStores.ts` -- 51 registered stores vs 72+ actual stores
- `apps/api/src/common/mocks/cacheManagerMock.ts` vs `apps/api/src/common/cache-manager.mock.ts` -- observed duplication
- `apps/api/src/conferences/conferences.service.spec.ts` -- representative complex test with 10 mocked providers
- `apps/frontend/vite.config.mts` -- test configuration, environment setup, alias resolution
- `.planning/codebase/CONCERNS.md` -- documented tech debt and coverage gaps
- `.planning/codebase/TESTING.md` -- existing patterns and anti-patterns

---

_Pitfalls research for: edulution-ui comprehensive test suite_
_Researched: 2026-02-26_
