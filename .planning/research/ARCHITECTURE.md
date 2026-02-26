# Architecture Research

**Domain:** Test infrastructure for Nx monorepo (NestJS + React + shared libs)
**Researched:** 2026-02-26
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
+-----------------------------------------------------------------------+
|                         CI Pipeline (GitHub Actions)                    |
|  +-------------+  +---------------+  +-----------+  +---------------+  |
|  | Lint/Checks |  | API Unit Tests|  | FE Unit   |  | E2E Tests     |  |
|  | (parallel)  |  | Jest (par.)   |  | Vitest(p.)|  | Playwright(p.)|  |
|  +------+------+  +-------+-------+  +-----+-----+  +-------+-------+  |
|         |                 |                |                 |          |
|         +--------+--------+--------+-------+---------+-------+         |
|                  |                 |                 |                  |
|         coverage artifacts  coverage artifacts  trace artifacts         |
+-----------------------------------------------------------------------+
                              |
       +----------------------+----------------------+
       |                      |                      |
+------v------+    +----------v----------+    +------v------+
|  apps/api/  |    | apps/frontend/      |    |    libs/    |
|  src/       |    | src/                |    |    src/     |
|             |    |                     |    |             |
| *.spec.ts   |    | *.spec.ts(x)        |    | *.spec.ts   |
| *.mock.ts   |    |                     |    |             |
| mocks/      |    |                     |    |             |
+------+------+    +----------+----------+    +------+------+
       |                      |                      |
       |                      v                      |
       |           +----------+----------+           |
       |           | apps/frontend/      |           |
       |           | test/               |           |
       |           |   vitest.setup.ts   |           |
       |           |   msw/              |           |
       |           |   factories/        |           |
       |           |   utils/            |           |
       |           +---------------------+           |
       |                                             |
       +-------------------+-+-----------------------+
                           | |
                    +------v-v------+
                    | apps/e2e/     |
                    |  fixtures/    |
                    |  pages/       |
                    |  helpers/     |
                    |  auth/        |
                    +---------------+
```

### Component Responsibilities

| Component                 | Responsibility                                                                 | Typical Implementation                                                  |
| ------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| API unit tests            | Verify NestJS service logic, controller delegation, guards, pipes in isolation | Jest + `@nestjs/testing` `TestingModule`, co-located `*.spec.ts`        |
| API mock objects          | Provide reusable DI substitutes for services, models, cache                    | Co-located `*.mock.ts` files, `mocks/` dirs with barrel exports         |
| Frontend unit tests       | Verify hooks, stores, utilities, component rendering                           | Vitest + jsdom + React Testing Library, co-located `*.spec.tsx`         |
| Frontend mock layer (MSW) | Intercept network requests at service-worker level for frontend tests          | MSW handlers organized per API domain, shared setup in `test/msw/`      |
| Shared lib tests          | Verify pure utility functions consumed by both apps                            | Vitest (same runner as frontend), co-located `*.spec.ts` in `libs/src/` |
| E2E tests                 | Verify full user journeys through real browser against running app             | Playwright, page objects, auth state fixtures, in `apps/e2e/`           |
| CI pipeline               | Orchestrate all test suites, enforce quality gates, report coverage            | GitHub Actions with parallel jobs, artifact uploads, required checks    |

## Recommended Project Structure

```
edulution-ui/
+-- apps/
|   +-- api/
|   |   +-- src/
|   |   |   +-- [module]/
|   |   |   |   +-- [module].service.ts
|   |   |   |   +-- [module].service.spec.ts       # Unit test
|   |   |   |   +-- [module].service.mock.ts        # Reusable mock
|   |   |   |   +-- [module].controller.ts
|   |   |   |   +-- [module].controller.spec.ts     # Unit test
|   |   |   |   +-- mocks/                          # Complex domain fixtures
|   |   |   |       +-- index.ts                    # Barrel export
|   |   |   |       +-- [entity].fixtures.ts        # Fixture data
|   |   |   +-- common/
|   |   |       +-- mocks/                          # Shared infra mocks
|   |   |       |   +-- cacheManagerMock.ts
|   |   |       |   +-- eventEmitterMock.ts
|   |   |       |   +-- index.ts
|   |   |       +-- testing/                        # NEW: Shared test helpers
|   |   |           +-- createMockModel.ts          # Mongoose model mock factory
|   |   |           +-- createMockService.ts        # Service mock factory
|   |   |           +-- testModuleBuilder.ts         # TestingModule presets
|   |   |           +-- index.ts
|   |   +-- jest.config.ts
|   |
|   +-- frontend/
|   |   +-- src/
|   |   |   +-- pages/[Feature]/
|   |   |   |   +-- use[Feature]Store.ts
|   |   |   |   +-- use[Feature]Store.spec.ts       # Store unit test
|   |   |   |   +-- components/
|   |   |   |       +-- [Component].tsx
|   |   |   |       +-- [Component].spec.tsx         # Component test
|   |   |   +-- hooks/
|   |   |   |   +-- use[Hook].ts
|   |   |   |   +-- use[Hook].spec.ts                # Hook unit test
|   |   |   +-- utils/
|   |   |       +-- [util].ts
|   |   |       +-- [util].spec.ts                   # Util unit test
|   |   +-- test/
|   |   |   +-- vitest.setup.ts                      # Existing setup
|   |   |   +-- msw/                                 # NEW: MSW mock infrastructure
|   |   |   |   +-- server.ts                        # MSW server instance
|   |   |   |   +-- handlers/                        # Per-domain API handlers
|   |   |   |   |   +-- appconfig.handlers.ts
|   |   |   |   |   +-- auth.handlers.ts
|   |   |   |   |   +-- surveys.handlers.ts
|   |   |   |   |   +-- index.ts                     # Compose all handlers
|   |   |   +-- factories/                           # NEW: Test data factories
|   |   |   |   +-- userFactory.ts
|   |   |   |   +-- appConfigFactory.ts
|   |   |   |   +-- index.ts
|   |   |   +-- utils/                               # NEW: Test render helpers
|   |   |       +-- renderWithProviders.tsx           # Wraps component in all providers
|   |   |       +-- createMockStore.ts               # Create pre-populated Zustand store
|   |   |       +-- index.ts
|   |   +-- vite.config.mts
|   |
|   +-- e2e/                                         # NEW: Playwright E2E project
|       +-- playwright.config.ts
|       +-- fixtures/
|       |   +-- auth.fixture.ts                      # Keycloak auth state
|       |   +-- base.fixture.ts                      # Extend Playwright test
|       |   +-- index.ts
|       +-- pages/                                   # Page Object Model
|       |   +-- BasePage.ts                          # Common page methods
|       |   +-- LoginPage.ts
|       |   +-- DashboardPage.ts
|       |   +-- FileSharingPage.ts
|       |   +-- SurveysPage.ts
|       |   +-- SettingsPage.ts
|       +-- helpers/
|       |   +-- apiHelpers.ts                        # Direct API calls for setup
|       |   +-- waitHelpers.ts
|       +-- tests/
|       |   +-- auth.spec.ts
|       |   +-- file-sharing.spec.ts
|       |   +-- surveys.spec.ts
|       |   +-- navigation.spec.ts
|       +-- global-setup.ts                          # Auth token acquisition
|       +-- global-teardown.ts                       # Cleanup
|
+-- libs/
|   +-- src/
|       +-- [domain]/
|           +-- utils/
|               +-- [util].ts
|               +-- [util].spec.ts                   # Lib util tests
|
+-- .github/
    +-- workflows/
        +-- build-and-test.yml                       # Enhanced CI pipeline
```

### Structure Rationale

- **Co-located tests (`*.spec.ts` next to source):** Already the established pattern in 33 existing API spec files. Keeps tests discoverable and reduces import path complexity. Both Jest (API) and Vitest (frontend) support this via glob patterns.
- **`apps/api/src/common/testing/`:** New directory for shared API test utilities (model mock factory, service mock factory, TestingModule builder presets). Reduces the 50+ lines of boilerplate currently duplicated in every spec file. NOT in `libs/` because these are Jest-specific and API-only.
- **`apps/frontend/test/msw/`:** Network-level mocking with MSW (Mock Service Worker). Handlers organized per API domain mirror the backend module structure. Centralized in `test/` rather than scattered across components because all frontend tests share the same API surface.
- **`apps/frontend/test/factories/`:** Test data factories that produce typed fixture objects. Separate from MSW handlers because factories produce data while handlers produce HTTP responses that wrap that data.
- **`apps/frontend/test/utils/`:** Rendering helpers that wrap components in the full provider tree (AuthProvider, CookiesProvider, HelmetProvider, TooltipProvider, i18n). Without this, every component test would need 10+ lines of provider wrapping.
- **`apps/e2e/` as a separate Nx project:** Playwright E2E tests are a distinct concern from unit/integration tests. They have their own config, their own dependencies (Playwright browsers), and their own CI job. Nx supports this as a separate project with its own `project.json`.
- **Page Object Model in `apps/e2e/pages/`:** Encapsulates page-specific selectors and interactions. When the UI changes, only the page object needs updating, not every test that touches that page.

## Architectural Patterns

### Pattern 1: NestJS TestingModule with Mock DI

**What:** Create an isolated NestJS module per test suite with all dependencies replaced by mock objects via the DI container.
**When to use:** Every API service and controller test.
**Trade-offs:** High isolation, deterministic results. Requires maintaining mock objects when service interfaces change. Existing pattern in 33 spec files.

**Example (current codebase pattern):**

```typescript
const module: TestingModule = await Test.createTestingModule({
  providers: [
    UsersService,
    { provide: getModelToken(User.name), useValue: userModelMock },
    { provide: GroupsService, useValue: mockGroupsService },
    { provide: CACHE_MANAGER, useValue: cacheManagerMock },
  ],
}).compile();
```

**Improvement with shared factory:**

```typescript
import { createMockModel } from '../common/testing';

const userModelMock = createMockModel<UserDocument>({
  findOne: mockUser,
  find: [mockUser],
});
```

### Pattern 2: MSW Request Handlers for Frontend Tests

**What:** Intercept `eduApi` (axios) HTTP requests at the network level using MSW, returning controlled responses without modifying application code.
**When to use:** Frontend store tests (Zustand stores call `eduApi`), component tests that trigger API calls.
**Trade-offs:** Tests exercise real axios configuration (interceptors, headers, error handling). Decoupled from implementation. Requires handler maintenance when API contracts change.

**Example:**

```typescript
import { http, HttpResponse } from 'msw';
import { EDU_API_ROOT } from '@libs/common/constants/eduApiUrl';

const appConfigHandlers = [
  http.get(`*${EDU_API_ROOT}/appconfig`, () => {
    return HttpResponse.json([mockAppConfig]);
  }),
];
```

### Pattern 3: Playwright Auth State Fixture

**What:** Authenticate once in `global-setup.ts` against staging Keycloak, save browser storage state to a JSON file, reuse it across all tests via Playwright's `storageState` option.
**When to use:** All E2E tests that require an authenticated user.
**Trade-offs:** Tests run fast (no per-test login). Auth state expires, so `global-setup.ts` must handle token refresh. Depends on staging Keycloak availability.

**Example:**

```typescript
import { chromium } from '@playwright/test';

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(process.env.BASE_URL + '/login');
  await page.fill('[name="username"]', process.env.E2E_USERNAME);
  await page.fill('[name="password"]', process.env.E2E_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
  await page.context().storageState({ path: 'e2e/.auth/user.json' });
  await browser.close();
}
```

### Pattern 4: Page Object Model for E2E

**What:** Encapsulate page-specific element selectors and user interactions in dedicated classes. Tests read like user stories rather than DOM manipulation.
**When to use:** Every E2E test file.
**Trade-offs:** More upfront code but dramatically reduced maintenance when selectors change. One selector update fixes all tests.

**Example:**

```typescript
class FileSharingPage extends BasePage {
  readonly fileList = this.page.getByTestId('file-list');
  readonly uploadButton = this.page.getByRole('button', { name: /upload/i });

  async uploadFile(filePath: string) {
    await this.uploadButton.click();
    await this.page.setInputFiles('input[type="file"]', filePath);
  }

  async getFileNames(): Promise<string[]> {
    return this.fileList.getByRole('row').allTextContents();
  }
}
```

### Pattern 5: Zustand Store Testing (Direct State Manipulation)

**What:** Test Zustand stores by calling actions directly via `useStore.getState().action()` and asserting on state changes, without rendering React components. Mock `eduApi` via MSW.
**When to use:** Every feature store test.
**Trade-offs:** Fast, no DOM overhead. Tests the store contract independent of UI. Does not verify React re-rendering behavior (that is the component test's job).

**Example:**

```typescript
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';

beforeEach(() => {
  useAppConfigsStore.getState().reset();
});

it('should fetch app configs', async () => {
  await useAppConfigsStore.getState().getAppConfigs();
  const { appConfigs, isLoading } = useAppConfigsStore.getState();
  expect(appConfigs).toHaveLength(3);
  expect(isLoading).toBe(false);
});
```

## Data Flow

### Test Utility Sharing

```
apps/api/src/common/testing/         apps/frontend/test/
  createMockModel.ts                   msw/server.ts
  createMockService.ts                 msw/handlers/*.ts
  testModuleBuilder.ts                 factories/*.ts
         |                             utils/renderWithProviders.tsx
         |                                    |
         v                                    v
  apps/api/src/[module]/*.spec.ts     apps/frontend/src/**/*.spec.ts(x)
                                               |
                                               v
                                      libs/src/[domain]/**/*.spec.ts
                                      (use Vitest, import from @libs/*)
```

**Direction:** Test utilities flow DOWN to test files. Test files NEVER export to production code. Production code NEVER imports from test directories.

**Boundary rules:**

- `apps/api/src/common/testing/` is consumed ONLY by API spec files
- `apps/frontend/test/` is consumed ONLY by frontend and libs spec files
- `apps/e2e/` is fully self-contained; it does NOT import from `apps/frontend/src/` or `apps/api/src/`
- `libs/src/` spec files use Vitest (same runner as frontend) and can import from `apps/frontend/test/factories/` if needed via path alias

### Mock Data Flow (Frontend)

```
factories/userFactory.ts  --->  MSW handler returns factory output
         |                              |
         v                              v
   Store test calls action  --->  MSW intercepts eduApi request
         |                              |
         v                              v
   Store state updates      <---  Handler returns mock response
         |
         v
   Test asserts on state
```

### Mock Data Flow (API)

```
[module].mock.ts  --->  Injected via { provide: Service, useValue: mock }
         |                              |
         v                              v
  TestingModule compiled  --->  Service under test receives mock dependency
         |
         v
  Test calls service.method()
         |
         v
  Asserts on return value + mock.method.toHaveBeenCalledWith()
```

### Build and Execution Order

```
Phase 1: Install (npm ci)
    |
    +---> Phase 2a: Lint + Checks (parallel)
    |       - check-circular-deps
    |       - check-translations
    |       - check-error-message-translations
    |       - pretty-quick --check
    |       - eslint
    |
    +---> Phase 2b: API Unit Tests (parallel with 2a, 2c)
    |       - nx run api:test
    |       - Jest, node environment
    |       - Produces: coverage/apps/api
    |
    +---> Phase 2c: Frontend + Libs Unit Tests (parallel with 2a, 2b)
    |       - nx run frontend:test
    |       - Vitest, jsdom environment
    |       - Produces: coverage/apps/frontend
    |
    +---> Phase 2d: Build Frontend (parallel with 2b, 2c)
    |       - npm run build
    |       - Required for E2E (serves built app)
    |
    +---> Phase 2e: Build API (parallel with 2b, 2c, 2d)
            - npm run build:api
            - Required for E2E (runs API server)
    |
    +---> Phase 3: E2E Tests (depends on 2d + 2e)
            - Playwright against built app + running API
            - Service containers: MongoDB, Redis
            - Staging Keycloak for auth
            - Produces: test-results/, playwright-report/
    |
    +---> Phase 4: Coverage Upload + PR Comment (depends on 2b + 2c)
            - Upload coverage artifacts
            - Post coverage diff as PR comment
```

**Key dependency:** E2E tests MUST wait for both frontend and API builds to complete. Unit tests and builds run in parallel because they are independent.

## CI Pipeline Architecture

### Current State (from `.github/workflows/build-and-test.yml`)

```yaml
jobs:
  prepare: # npm ci, cache node_modules
  build-frontend: # needs: prepare (build + Docker image, no push)
  build-api: # needs: prepare (build + Docker image, no push)
  test: # needs: prepare (lint + checks + API tests only)
```

**Problems:**

1. `test` job runs lint, checks, AND API tests sequentially (not parallelized)
2. Frontend tests (`npm run test:frontend`) are NOT run in CI at all
3. No E2E tests
4. No coverage reporting to PR
5. No test artifact upload

### Target State

```yaml
jobs:
  prepare:
    # npm ci, cache node_modules (unchanged)

  lint-and-checks:
    needs: prepare
    # check-circular-deps, check-translations, prettier, eslint
    # Split from test job for clearer failure signals

  test-api:
    needs: prepare
    # nx run api:test --detectOpenHandles
    # Upload coverage/apps/api as artifact

  test-frontend:
    needs: prepare
    # nx run frontend:test
    # Upload coverage/apps/frontend as artifact

  build-frontend:
    needs: prepare
    # npm run build (unchanged)

  build-api:
    needs: prepare
    # npm run build:api (unchanged)

  e2e:
    needs: [build-frontend, build-api]
    services:
      mongo:
        image: mongo:7
        ports: ['27017:27017']
      redis:
        image: redis:8.2
        ports: ['6379:6379']
    # Start API server, serve frontend, run Playwright
    # Upload playwright-report/ as artifact

  coverage-report:
    needs: [test-api, test-frontend]
    # Download coverage artifacts, merge, post PR comment
```

### Service Containers for E2E

The E2E job needs MongoDB and Redis as service containers (matching `docker-compose.yml`). Keycloak auth is handled by the staging server (not containerized) per project constraints.

```yaml
services:
  mongo:
    image: mongo:7
    env:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
    ports: ['27017:27017']
    options: >-
      --health-cmd "mongosh --eval \"db.adminCommand('ping')\""
      --health-interval 5s
      --health-timeout 1s
      --health-retries 3
  redis:
    image: redis:8.2
    ports: ['6379:6379']
    options: >-
      --health-cmd "redis-cli ping"
      --health-interval 5s
      --health-timeout 1s
      --health-retries 3
```

### Artifact Management

| Job           | Artifact                 | Purpose                             |
| ------------- | ------------------------ | ----------------------------------- |
| test-api      | `coverage/apps/api`      | API coverage report                 |
| test-frontend | `coverage/apps/frontend` | Frontend coverage report            |
| e2e           | `playwright-report/`     | HTML report with screenshots/traces |
| e2e           | `test-results/`          | JUnit XML for CI integration        |

## Scaling Considerations

| Scale                 | Architecture Adjustments                                                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 0-50 spec files (now) | Single test job per runner. No sharding needed.                                                                                   |
| 50-200 spec files     | Nx affected-based test filtering: `nx affected --target=test` runs only tests touched by the PR diff. Cuts CI time significantly. |
| 200+ spec files       | Playwright sharding: `--shard=1/4` across parallel CI jobs. Jest `--shard` flag for API tests.                                    |
| Cross-team            | Nx `@nx/enforce-module-boundaries` to prevent test utility imports from crossing app boundaries.                                  |

### Scaling Priorities

1. **First bottleneck (CI duration):** The current `test` job runs lint + checks + tests sequentially in ~15 min. Splitting into parallel jobs immediately halves wall time.
2. **Second bottleneck (E2E flakiness):** Playwright retry on failure (`retries: 1` in config) and trace-on-first-retry prevent flaky failures from blocking PRs. Auth token expiry is the most likely flake source -- `global-setup.ts` must handle refresh.

## Anti-Patterns

### Anti-Pattern 1: Testing Implementation Details

**What people do:** Assert on internal state, private method calls, or specific DOM structure instead of observable behavior.
**Why it's wrong:** Tests break on every refactor even when behavior is correct. Creates maintenance burden that discourages testing.
**Do this instead:** Test the public API of services/stores. For components, test what the user sees (text, roles, interactions) not what the DOM looks like.

### Anti-Pattern 2: Shared Mutable Test State

**What people do:** Define mock objects at module scope and mutate them across tests without resetting.
**Why it's wrong:** Tests become order-dependent. A passing test fails when run in isolation or in different order.
**Do this instead:** Create fresh mocks in `beforeEach` (existing pattern in codebase: `jest.clearAllMocks()` in `afterEach`). For Zustand stores: call `reset()` in `beforeEach`.

### Anti-Pattern 3: Mocking What You Own

**What people do:** Mock the axios instance directly with `jest.mock('axios')` in frontend tests.
**Why it's wrong:** Skips axios interceptors, error transforms, and header configuration that `eduApi` sets up. Bugs in that layer go undetected.
**Do this instead:** Use MSW to intercept at the network level. The full `eduApi` axios instance executes normally, including interceptors and `handleApiError`.

### Anti-Pattern 4: E2E Tests That Set Up Data Through the UI

**What people do:** Create a survey by clicking through the creation wizard before testing survey participation.
**Why it's wrong:** Slow, fragile (depends on create wizard working), and conflates two test concerns.
**Do this instead:** Use API helpers (`apiHelpers.ts`) to create test data directly via HTTP, then test only the journey under test.

### Anti-Pattern 5: Monolithic Test Utils Library in libs/

**What people do:** Put all test utilities (Jest mocks, Vitest utils, Playwright helpers) in a shared `libs/test-utils/` package.
**Why it's wrong:** Creates cross-framework coupling. Jest API mocks should not be in the same package as React Testing Library helpers. Nx dependency graph becomes tangled.
**Do this instead:** Keep test utilities co-located with their consumer: API test utils in `apps/api/src/common/testing/`, frontend test utils in `apps/frontend/test/`, E2E utils in `apps/e2e/helpers/`.

## Integration Points

### External Services (E2E)

| Service             | Integration Pattern                                      | Notes                                            |
| ------------------- | -------------------------------------------------------- | ------------------------------------------------ |
| Keycloak (staging)  | OIDC auth flow in `global-setup.ts`, storage state reuse | Must handle token expiry; staging URL in env var |
| MongoDB (container) | GitHub Actions service container, fresh DB per E2E run   | Seeded via API helpers, not test DB dumps        |
| Redis (container)   | GitHub Actions service container                         | BullMQ queues drain between tests                |

### Internal Boundaries

| Boundary                          | Communication                                                                                       | Notes                                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| API spec <-> API mock             | Direct import from co-located `*.mock.ts` or `common/mocks/`                                        | Mock must match service interface; TypeScript ensures this            |
| Frontend spec <-> MSW             | MSW server started in `vitest.setup.ts`, handlers composed in `test/msw/handlers/index.ts`          | Handlers can be overridden per-test with `server.use()`               |
| Frontend spec <-> Zustand store   | Direct `getState()` / `setState()` calls                                                            | No React rendering needed for pure store logic tests                  |
| E2E <-> Running app               | HTTP via Playwright browser, API helpers via `fetch`/`axios`                                        | E2E knows nothing about internal implementation                       |
| Nx project graph <-> Test targets | `@nx/jest/plugin` infers `test` target for API, `@nx/vite/plugin` infers `test` target for frontend | New `apps/e2e` project needs `@nx/playwright/plugin` or manual target |

## Build Order Implications for Roadmap Phases

The test infrastructure has clear dependency ordering that should drive the roadmap phase structure:

1. **Foundation (no dependencies):** Shared test utilities, mock factories, MSW setup, Vitest setup enhancements. These produce the building blocks everything else consumes.

2. **Unit tests (depends on foundation):** API service tests, frontend store tests, frontend hook tests, lib utility tests. These consume factories and MSW handlers. Can be parallelized across API and frontend tracks.

3. **Component tests (depends on MSW + render helpers):** React Testing Library component tests. These need both MSW (for API mocking) and `renderWithProviders` (for provider wrapping).

4. **E2E infrastructure (depends on Playwright setup):** Playwright config, auth fixtures, page objects, API helpers. Requires the built app to be runnable.

5. **E2E tests (depends on E2E infrastructure):** Actual journey tests. These consume page objects and fixtures.

6. **CI pipeline enhancement (depends on all test types existing):** Parallel jobs, coverage reporting, PR blocking. Should be incremental -- add frontend test job early, add E2E job once those tests exist.

**Key insight:** CI pipeline changes should be interleaved, not deferred to the end. Add `test-frontend` CI job as soon as the first frontend test exists. Add `e2e` CI job as soon as the first E2E test exists. This prevents the "tests exist but CI doesn't run them" gap.

## Sources

- Codebase analysis of existing 33 API spec files (HIGH confidence)
- `apps/api/jest.config.ts`, `apps/frontend/vite.config.mts` (HIGH confidence)
- `.github/workflows/build-and-test.yml` current CI pipeline (HIGH confidence)
- `docker-compose.yml` service definitions (HIGH confidence)
- `nx.json` plugin configuration for Jest and Vitest (HIGH confidence)
- MSW documentation for Vitest integration (MEDIUM confidence -- standard pattern, widely adopted)
- Playwright documentation for Nx projects and global setup (MEDIUM confidence -- standard pattern)
- NestJS testing documentation for `@nestjs/testing` module (HIGH confidence)
- GitHub Actions service container documentation (HIGH confidence)

---

_Architecture research for: Test infrastructure in Nx monorepo (NestJS + React)_
_Researched: 2026-02-26_
