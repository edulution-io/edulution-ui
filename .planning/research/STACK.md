# Stack Research

**Domain:** Testing stack for NestJS + React + Vite Nx monorepo
**Researched:** 2026-02-26
**Confidence:** HIGH

## Context: What Already Exists

The project has partial testing infrastructure in place. Decisions below account for what is installed and working, and focus on what to add, upgrade, or avoid.

**Already installed and configured (keep as-is):**

- Jest 29.7 + ts-jest 29.1 + @nestjs/testing 11.x (API unit tests, 33 spec files)
- @nx/jest 22.3.0 (Nx integration for Jest)
- @testing-library/jest-dom 6.4 (DOM assertion matchers)
- jsdom 25.x (browser environment for Vitest)
- Vitest 1.6 + @nx/vitest 22.3.0 (frontend runner, configured but zero test files)

**Already installed but needs upgrade:**

- Vitest 1.6 (upgrade to 3.2.x for significant improvements while maintaining Vite 5 compatibility)

**Not installed, needs to be added:**

- @testing-library/react (component testing)
- @testing-library/user-event (user interaction simulation)
- MSW (frontend API mocking)
- @playwright/test + @nx/playwright (E2E testing)
- @axe-core/playwright (accessibility testing)
- supertest (API integration testing)
- @vitest/coverage-v8 (explicit coverage package for Vitest 3.x)

## Recommended Stack

### Core Test Runners (Existing - Keep)

| Technology      | Version  | Purpose                          | Why Recommended                                                                                                                                         |
| --------------- | -------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jest            | ^29.7.0  | API unit/integration test runner | Already in use with 33 spec files. Switching would be high cost, zero benefit. NestJS official docs use Jest. [HIGH confidence]                         |
| ts-jest         | ^29.1.2  | TypeScript transform for Jest    | Required by Jest for TypeScript support in the API project. Already configured. [HIGH confidence]                                                       |
| @nestjs/testing | ^11.0.17 | NestJS TestingModule creation    | Official NestJS testing utility. Creates isolated DI containers for unit tests. Already established pattern across all 33 spec files. [HIGH confidence] |

### Core Test Runners (Upgrade)

| Technology          | Version | Purpose                          | Why Recommended                                                                                                                                                                                                                                                                                                                    |
| ------------------- | ------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vitest              | ^3.2.4  | Frontend + libs unit test runner | Upgrade from 1.6. Version 3.2.x supports Vite ^5.0.0 (project uses Vite 5), gains improved performance, better TypeScript support, and workspace improvements. Vitest 4.x requires Vite 6+ so it is NOT compatible with this project's current Vite 5 setup. [HIGH confidence - verified via `npm view vitest@3.2.4 dependencies`] |
| @vitest/coverage-v8 | ^3.2.4  | Code coverage for Vitest         | Must match Vitest version exactly. Replaces implicit v8 coverage with explicit package required by Vitest 3.x. [HIGH confidence]                                                                                                                                                                                                   |

### Frontend Component Testing

| Library                     | Version | Purpose                                | When to Use                                                                                                                                                                                                                  |
| --------------------------- | ------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| @testing-library/react      | ^16.3.2 | React component rendering and querying | Every frontend component test. Supports React 18 (project's version). Provides `render()`, `screen`, and semantic queries. Industry standard for React testing. [HIGH confidence - verified peer deps support React ^18.0.0] |
| @testing-library/user-event | ^14.6.1 | Realistic user interaction simulation  | Any test that involves clicks, typing, selection. Superior to `fireEvent` because it dispatches full event sequences matching real browser behavior. [HIGH confidence]                                                       |
| @testing-library/jest-dom   | ^6.4.6  | DOM assertion matchers                 | Already installed. Provides `.toBeVisible()`, `.toHaveTextContent()`, etc. Works with both Jest and Vitest. Keep current version. [HIGH confidence]                                                                          |

### API Mocking (Frontend)

| Library | Version  | Purpose                                      | When to Use                                                                                                                                                                                                                                                                    |
| ------- | -------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| msw     | ^2.12.10 | Network-level API mocking for frontend tests | All frontend tests that involve API calls via `eduApi` (axios). Intercepts at the network level so mocking works regardless of HTTP client. Avoids coupling tests to axios internals. Version 2.x uses Fetch API primitives and supports SSE and WebSockets. [HIGH confidence] |

### API Integration Testing (Backend)

| Library          | Version | Purpose                                 | When to Use                                                                                                                                                                                                             |
| ---------------- | ------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| supertest        | ^7.2.2  | HTTP request testing against NestJS app | API integration tests that verify full request/response contracts through NestJS middleware, guards, pipes, and controllers. Works with Jest. Official NestJS docs recommend supertest for e2e tests. [HIGH confidence] |
| @types/supertest | ^7.2.0  | TypeScript definitions for supertest    | Always, alongside supertest. [HIGH confidence]                                                                                                                                                                          |

### E2E Testing

| Library              | Version | Purpose                            | When to Use                                                                                                                                                                                                                       |
| -------------------- | ------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| @playwright/test     | ^1.58.2 | E2E browser automation and testing | Full user journey tests (login, navigation, CRUD flows). Multi-browser support (Chromium, Firefox, WebKit). Built-in auto-waiting, screenshots, video recording. Best AI/MCP integration via playwright-mcp. [HIGH confidence]    |
| @nx/playwright       | 22.3.0  | Nx integration for Playwright      | Must match Nx workspace version (22.3.0). Provides executor, generator, and CI report merging for atomized test runs. [HIGH confidence - verified peer dep accepts @playwright/test ^1.36.0]                                      |
| @axe-core/playwright | ^4.11.1 | Accessibility testing in E2E tests | Accessibility assertions within Playwright tests. Integrates axe-core engine (WCAG 2.0/2.1/2.2 rules) directly into page tests. Catches ~57% of accessibility issues automatically. [MEDIUM confidence - version verified on npm] |

### Development Tools

| Tool                     | Purpose                            | Notes                                                                                                                                                        |
| ------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| @vitest/ui               | Interactive test viewer for Vitest | Already referenced in `npm run test-with-ui` script. Upgrade to ^3.2.4 to match Vitest version.                                                              |
| playwright-mcp           | AI-assisted E2E test generation    | Playwright's official MCP server. Enables Claude Code to interact with browser for test generation and debugging. Version ships with @playwright/test 1.58+. |
| Vitest VS Code extension | IDE test integration               | Provides inline test results, debugging, and coverage visualization.                                                                                         |

## Installation

```bash
# Frontend component testing (new)
npm install -D @testing-library/react@^16.3.2 @testing-library/user-event@^14.6.1

# Frontend API mocking (new)
npm install -D msw@^2.12.10

# Vitest upgrade (from 1.6 to 3.2.x)
npm install -D vitest@^3.2.4 @vitest/coverage-v8@^3.2.4 @vitest/ui@^3.2.4

# E2E testing (new)
npm install -D @playwright/test@^1.58.2 @nx/playwright@22.3.0 @axe-core/playwright@^4.11.1

# API integration testing (new)
npm install -D supertest@^7.2.2 @types/supertest@^7.2.0

# Playwright browsers (run after install)
npx playwright install --with-deps chromium
```

## Alternatives Considered

| Recommended             | Alternative             | Why Not                                                                                                                                                                                                                                                                                                                                      |
| ----------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vitest 3.2.x (frontend) | Vitest 4.x              | Vitest 4 requires Vite ^6.0.0 or ^7.0.0. Project uses Vite 5. Upgrading Vite is out of scope for a testing initiative and risks breaking the build pipeline.                                                                                                                                                                                 |
| Vitest 3.2.x (frontend) | Jest (for frontend too) | Vitest is already configured for the frontend. Vite-native transforms eliminate double-config. Vitest is 2-5x faster than Jest for Vite projects. Switching to Jest would mean maintaining different configs that duplicate Vite's resolve aliases.                                                                                          |
| Jest 29 (API)           | Vitest (for API too)    | API uses Webpack + NestJS decorators + ts-jest. 33 existing spec files follow Jest patterns. Migration cost is high with no meaningful benefit. NestJS official docs all use Jest.                                                                                                                                                           |
| MSW 2.x                 | axios-mock-adapter      | MSW intercepts at network level, works regardless of HTTP client changes. axios-mock-adapter couples tests to axios internals. If `eduApi` ever switches to `fetch()` or `ky`, MSW tests still work. MSW 2.x also supports browser integration for future Vitest Browser Mode.                                                               |
| MSW 2.x                 | nock                    | nock only works in Node.js (monkey-patches `http`). MSW works in both Node.js and browser environments. Frontend tests with jsdom need the Node.js integration, but MSW provides a consistent API for both.                                                                                                                                  |
| Playwright              | Cypress                 | Playwright has native Nx support (@nx/playwright), better parallel execution, multi-browser by default, and official MCP server for AI-assisted testing. Cypress has slower execution, single browser per run, and paid dashboard for parallelism. Playwright's auto-waiting is more reliable than Cypress's retry-ability for complex SPAs. |
| Playwright              | Selenium/WebDriverIO    | Playwright is faster, has better TypeScript support, built-in assertion library, and native trace viewer. Selenium adds Java dependency complexity. WebDriverIO is viable but Playwright has stronger Nx and AI/MCP ecosystem support.                                                                                                       |
| supertest               | Playwright for API      | supertest runs in-process with NestJS (no HTTP server needed), making it faster and more suitable for CI. Playwright E2E tests are for browser-based user journeys, not API contract testing.                                                                                                                                                |
| @axe-core/playwright    | pa11y                   | @axe-core/playwright integrates directly into Playwright test flows. pa11y requires separate runner and configuration. axe-core is more actively maintained and has broader WCAG rule coverage.                                                                                                                                              |
| @testing-library/react  | Enzyme                  | Enzyme is effectively dead (no React 18 support). @testing-library/react is the React team's recommended testing approach, focuses on testing behavior not implementation, and works with React 18 and upcoming React 19.                                                                                                                    |

## What NOT to Use

| Avoid                                 | Why                                                                                                                                        | Use Instead                                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Vitest 4.x                            | Requires Vite 6+. Project uses Vite 5. Will cause peer dependency errors and potential runtime failures.                                   | Vitest ^3.2.4 (supports Vite ^5.0.0)                                                                       |
| Enzyme                                | Abandoned. No React 18 support. Last meaningful update was 2019.                                                                           | @testing-library/react                                                                                     |
| @testing-library/react-hooks          | Deprecated since RTL v13. Hook testing is built into @testing-library/react via `renderHook()`.                                            | `renderHook()` from @testing-library/react                                                                 |
| jest-environment-jsdom (for frontend) | Would mean running frontend tests through Jest instead of Vitest. Loses Vite-native transforms and requires duplicating path alias config. | Vitest with jsdom environment (already configured)                                                         |
| Cypress                               | Slower, single browser, paid parallelism, no official Nx plugin, weaker AI/MCP story.                                                      | @playwright/test                                                                                           |
| mongodb-memory-server                 | Adds complexity to API unit tests that are already well-served by Mongoose model mocks. Reserve for integration tests if needed.           | Mongoose model mocks (existing pattern) for unit tests; supertest with TestingModule for integration tests |
| Storybook / Chromatic                 | Not in project, adding it is out of scope. Visual regression testing can be achieved with Playwright screenshot comparison.                | Playwright `toHaveScreenshot()`                                                                            |
| nock                                  | Node.js only, no browser support. MSW provides unified API for both environments.                                                          | MSW 2.x                                                                                                    |
| jest.mock() for frontend              | Would couple tests to module internals. MSW at network level and Vitest's vi.mock() are more appropriate for the Vite/Vitest toolchain.    | MSW (for API calls), vi.mock() (for module mocks in Vitest)                                                |

## Stack Patterns by Test Layer

**Unit Tests (API services/controllers):**

- Jest 29 + ts-jest + @nestjs/testing
- Mock pattern: `Test.createTestingModule()` with `{ provide: X, useValue: mockX }`
- Location: co-located `*.spec.ts` files
- Because: established pattern with 33 existing files, NestJS-native DI mocking

**Unit Tests (Frontend hooks/utils/stores):**

- Vitest 3.2 + jsdom
- Mock pattern: `vi.mock()` for modules, `vi.fn()` for functions
- Location: co-located `*.spec.ts(x)` files
- Because: Vite-native, zero-config transforms, shares path aliases from vite.config.mts

**Component Tests (Frontend React components):**

- Vitest 3.2 + @testing-library/react + @testing-library/user-event + MSW
- Mock pattern: MSW `http.get('/edu-api/...', ...)` for API calls, `vi.mock()` for non-API deps
- Location: co-located `*.spec.tsx` files
- Because: tests user-visible behavior, not implementation. MSW catches API contract drift.

**Integration Tests (API full request/response):**

- Jest 29 + supertest + @nestjs/testing
- Pattern: `Test.createTestingModule({ imports: [AppModule] }).compile()` then `request(app.getHttpServer()).get('/endpoint')`
- Location: `apps/api/test/` directory or co-located `*.integration.spec.ts`
- Because: validates middleware, guards, pipes, serialization, and HTTP status codes end-to-end within NestJS

**E2E Tests (Full user journeys):**

- Playwright 1.58 + @nx/playwright + @axe-core/playwright
- Pattern: Page Object Model classes, fixtures for auth state, `testConfig.webServer` for local dev
- Location: dedicated `apps/e2e/` Nx project
- Because: tests real browser behavior against running frontend+API, catches integration issues between layers

**Visual Regression:**

- Playwright `toHaveScreenshot()` (built into @playwright/test)
- Pattern: `await expect(page).toHaveScreenshot('page-name.png', { maxDiffPixelRatio: 0.01 })`
- Location: within E2E test files or dedicated `visual/` subdirectory
- Because: no additional dependency needed, screenshots stored in git, diffs in CI artifacts

**Accessibility Testing:**

- @axe-core/playwright within Playwright E2E tests
- Pattern: `const results = await new AxeBuilder({ page }).analyze(); expect(results.violations).toEqual([]);`
- Location: within E2E test files or dedicated `a11y/` subdirectory
- Because: runs real axe-core in real browser, catches WCAG violations

## Version Compatibility Matrix

| Package A                      | Compatible With                   | Notes                                                                                        |
| ------------------------------ | --------------------------------- | -------------------------------------------------------------------------------------------- |
| vitest@^3.2.4                  | vite@^5.0.0 (project uses ^5.0.8) | Verified: vitest 3.2.4 dependencies list `"vite": "^5.0.0 \|\| ^6.0.0 \|\| ^7.0.0-0"`        |
| vitest@^3.2.4                  | @nx/vitest@22.3.0                 | Verified: @nx/vitest 22.3.0 accepts `"vitest": "^1.0.0 \|\| ^2.0.0 \|\| ^3.0.0 \|\| ^4.0.0"` |
| @vitest/coverage-v8@^3.2.4     | vitest@3.2.4                      | Must match exact major.minor.patch. Peer dep: `"vitest": "3.2.4"`                            |
| @testing-library/react@^16.3.2 | react@^18.2.0 (project version)   | Verified: peer dep accepts `"react": "^18.0.0 \|\| ^19.0.0"`                                 |
| @playwright/test@^1.58.2       | @nx/playwright@22.3.0             | Verified: @nx/playwright 22.3.0 accepts `"@playwright/test": "^1.36.0"`                      |
| @playwright/test@^1.58.2       | @axe-core/playwright@^4.11.1      | Both packages work with Playwright's Page type                                               |
| jest@^29.7.0                   | @nx/jest@22.3.0                   | Already working in project                                                                   |
| msw@^2.12.10                   | vitest (any version)              | MSW integrates at setup file level via `setupServer()`, no version coupling                  |
| supertest@^7.2.2               | jest@^29.7.0                      | No coupling, supertest works with any test runner                                            |

## Configuration Specifics for Nx Monorepo

### Vitest 3.2 Upgrade

The upgrade from Vitest 1.6 to 3.2 requires:

1. Update `vitest`, `@vitest/coverage-v8`, `@vitest/ui` in devDependencies
2. `vitest.workspace.ts` format is unchanged (still `export default ['**/*/vitest.config.mts']`)
3. Test config in `apps/frontend/vite.config.mts` under `test:` key remains the same structure
4. `setupFiles: ['./test/vitest.setup.ts']` is still valid
5. No migration scripts needed for the 1.x to 3.x jump because the project has zero frontend test files

### Playwright Nx Project Setup

Generate a new E2E project within the Nx workspace:

```bash
npx nx g @nx/playwright:configuration --project=e2e --webServerCommand="npm run serveFrontendAndApi" --webServerAddress="http://localhost:5173"
```

This creates:

- `apps/e2e/playwright.config.ts` with Nx-aware base configuration
- `apps/e2e/project.json` with `e2e` target using `@nx/playwright:playwright` executor
- Nx automatically infers `e2e-ci--merge-reports` task for CI parallelism

### MSW Setup for Vitest

Create `apps/frontend/src/mocks/handlers.ts` for shared request handlers and `apps/frontend/src/mocks/server.ts` using `setupServer()`. Add to `apps/frontend/test/vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { server } from '../src/mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

The `onUnhandledRequest: 'error'` option is important: it fails tests that make unmocked API calls, ensuring complete API coverage.

### CI Pipeline Extension

The existing `.github/workflows/build-and-test.yml` runs API tests only. Extend with parallel jobs:

- `test-api`: existing `npm run test` (Jest, API)
- `test-frontend`: new `npm run test:frontend` (Vitest, frontend)
- `test-e2e`: new `npx nx e2e e2e` (Playwright, requires `npx playwright install --with-deps chromium` step)

## Sources

- [vitest@3.2.4 on npm](https://www.npmjs.com/package/vitest) -- version and dependency verification via `npm view` [HIGH confidence]
- [@nx/vitest@22.3.0 peer dependencies](https://www.npmjs.com/package/@nx/vitest) -- Vitest version compatibility [HIGH confidence]
- [@playwright/test@1.58.2 on npm](https://www.npmjs.com/package/@playwright/test) -- latest stable version [HIGH confidence]
- [Playwright release notes](https://playwright.dev/docs/release-notes) -- feature verification for 1.57+1.58 [HIGH confidence]
- [MSW 2.x on npm](https://www.npmjs.com/package/msw) -- version 2.12.10 verification [HIGH confidence]
- [MSW Node.js integration docs](https://mswjs.io/docs/integrations/node/) -- Vitest setup pattern [HIGH confidence]
- [@testing-library/react@16.3.2 on npm](https://www.npmjs.com/package/@testing-library/react) -- React 18 compatibility [HIGH confidence]
- [NestJS testing documentation](https://docs.nestjs.com/fundamentals/testing) -- supertest integration pattern [HIGH confidence]
- [Nx Playwright plugin docs](https://nx.dev/docs/technologies/test-tools/playwright) -- Nx integration and CI merge-reports [HIGH confidence]
- [@axe-core/playwright@4.11.1 on npm](https://www.npmjs.com/package/@axe-core/playwright) -- accessibility testing integration [HIGH confidence]
- [Playwright accessibility testing docs](https://playwright.dev/docs/accessibility-testing) -- axe-core integration pattern [MEDIUM confidence]
- [Vitest mocking requests docs](https://vitest.dev/guide/mocking/requests) -- MSW + Vitest recommended approach [HIGH confidence]
- [Playwright page object models docs](https://playwright.dev/docs/pom) -- POM pattern for E2E tests [HIGH confidence]

---

_Stack research for: Testing NestJS + React + Vite Nx monorepo_
_Researched: 2026-02-26_
