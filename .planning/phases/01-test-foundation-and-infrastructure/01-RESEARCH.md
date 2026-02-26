# Phase 1: Test Foundation and Infrastructure - Research

**Researched:** 2026-02-26
**Domain:** Test infrastructure setup (Vitest, MSW, factories, CI, mock consolidation)
**Confidence:** HIGH

## Summary

Phase 1 establishes shared test infrastructure for a monorepo that currently has near-zero frontend test coverage and 31 API spec files using Jest. The frontend uses Vitest 1.6.1 (inline config in `vite.config.mts`) with jsdom environment but has zero test files. The API uses Jest 29 with ts-jest and NestJS Testing module. There are 74 Zustand stores but only 56 registered in `cleanAllStores.ts` (18 missing). The CI pipeline (`build-and-test.yml`) has a single `test` job running only `npm run test` (Jest/API) with no frontend test job.

The upgrade path is Vitest 1.6.1 to 3.2.x (constrained by Vite 5 compatibility -- Vitest 4.x requires Vite 6+). MSW 2.x must be installed fresh. Factories go in `libs/src/test-utils/` for cross-app sharing. The CI needs a dedicated `test-frontend` job running in parallel with the existing `test` job (to be renamed `test-api`).

**Primary recommendation:** Execute in 3 waves -- Wave 1: Vitest upgrade + MSW setup + factories (foundational, no dependencies between frontend infra pieces); Wave 2: API test infrastructure (TestingModuleBuilder, Mongoose mock, cacheManager consolidation); Wave 3: CI pipeline + cleanAllStores validation (depends on test infrastructure being functional).

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Realistic German domain data in factories: school names (e.g., "Realschule Musterstadt"), LDAP groups (e.g., "cn=teachers,ou=groups,dc=schule,dc=de"), plausible AppConfigs
- Simple functions with partial overrides: `createUser({ isAdmin: true, school: 'Gymnasium Beispiel' })` -- no builder pattern
- Complete valid defaults: `createUser()` returns a fully populated, valid object
- Single shared location: all factories in `libs/` (e.g., `libs/test-utils/factories/`)
- Fail loudly on unmocked calls: `onUnhandledRequest: 'error'`
- Per-module handler files: `surveyHandlers.ts`, `mailHandlers.ts`, `fileSharingHandlers.ts` -- mirrors API module structure
- Shared happy-path defaults loaded in `vitest.setup.ts`: auth always succeeds, appConfigs returns standard set, user profile available
- Test-specific overrides via `server.use()`: runtime handler overrides within individual tests, auto-reset via `afterEach`
- Big-bang Vitest 1.6 to 3.2.x upgrade: single PR, fix all breaking changes (feasible given zero existing frontend tests)
- Delete inline mock duplicates immediately: replace with imports from shared location
- Proxy-based Mongoose query builder mock: dynamic chaining via JavaScript Proxy
- renderWithProviders wraps ALL providers by default (i18n, router, OIDC, theme)
- Frontend test job blocks PR merges immediately: required status check from day one
- Parallel CI jobs: `test-frontend` and `test-api` run simultaneously
- Coverage reporting enabled in Phase 1: generate reports and establish baselines, no enforcement gates yet
- cleanAllStores validation test fails the suite: automated test scans for stores and asserts registration

### Claude's Discretion

- Exact directory structure within libs/test-utils/
- TestingModuleBuilder preset API design
- MSW handler internal implementation details
- Coverage report format and storage
- Vitest configuration specifics beyond the upgrade itself

### Deferred Ideas (OUT OF SCOPE)

- None -- discussion stayed within phase scope
  </user_constraints>

<phase_requirements>

## Phase Requirements

| ID       | Description                                                                           | Research Support                                                                                         |
| -------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| FOUND-01 | Vitest upgraded from 1.6 to 3.2.x with @vitest/coverage-v8 matching version           | Standard Stack section: Vitest 3.2.4 + coverage-v8 3.2.4 pinned versions, Vite 5 compat verified         |
| FOUND-02 | MSW 2.x server setup with handlers directory structure wired into vitest.setup.ts     | Architecture Patterns: MSW setup with setupServer, handler directory layout, vitest.setup.ts integration |
| FOUND-03 | Shared test factories created (JWT user, AppConfig, Survey, Conference, UserDocument) | Architecture Patterns: Factory function patterns with partial override, German domain data               |
| FOUND-04 | Proxy-based Mongoose query builder mock factory replacing ad-hoc chain mocks          | Code Examples: Proxy-based Mongoose mock implementation pattern                                          |
| FOUND-05 | Duplicate cacheManagerMock consolidated into single shared location                   | Architecture Patterns: Shared mock consolidation in libs/src/test-utils/api-mocks/                       |
| FOUND-06 | renderWithProviders utility wrapping components in full provider tree                 | Code Examples: renderWithProviders with i18n, router, OIDC, theme providers                              |
| FOUND-07 | TestingModuleBuilder preset for common API test module setup                          | Code Examples: TestingModuleBuilder preset reducing boilerplate to ~5 lines                              |
| FOUND-08 | cleanAllStores audit -- all Zustand stores registered, automated validation added     | Architecture Patterns: Glob-scan validation test, 18 missing stores identified                           |
| FOUND-09 | CI pipeline updated with dedicated frontend test job running in parallel              | CI section: GitHub Actions parallel job configuration                                                    |
| CICD-01  | Parallel GitHub Actions jobs                                                          | CI section: Parallel job structure with shared prepare step                                              |
| CICD-02  | Frontend test job as required status check blocking PRs                               | CI section: Required status check configuration                                                          |

</phase_requirements>

## Standard Stack

### Core

| Library                     | Version | Purpose                        | Why Standard                                                |
| --------------------------- | ------- | ------------------------------ | ----------------------------------------------------------- |
| vitest                      | 3.2.4   | Frontend test runner           | Already in project at 1.6.1, must stay <4.x (Vite 5 compat) |
| @vitest/coverage-v8         | 3.2.4   | Coverage provider              | Must match vitest version exactly                           |
| msw                         | 2.7.x   | API mocking for frontend tests | Industry standard for intercepting fetch/axios in tests     |
| @testing-library/react      | 16.3.x  | React component testing        | Already implied by @testing-library/jest-dom in setup       |
| @testing-library/user-event | 14.5.x  | User interaction simulation    | Pairs with testing-library/react                            |
| @testing-library/jest-dom   | ^6.4.6  | DOM matchers                   | Already installed                                           |

### Supporting

| Library    | Version   | Purpose          | When to Use                                      |
| ---------- | --------- | ---------------- | ------------------------------------------------ |
| @nx/vitest | 22.3.0    | Nx Vitest plugin | Already installed, provides nx integration       |
| jsdom      | (bundled) | DOM environment  | Already configured in vite.config.mts test block |

### Existing (No Change)

| Library         | Version  | Purpose                       |
| --------------- | -------- | ----------------------------- |
| jest            | ^29.7.0  | API test runner (stays)       |
| @nestjs/testing | ^11.0.17 | NestJS test module builder    |
| ts-jest         | ^29.1.2  | TypeScript transform for Jest |

**Installation:**

```bash
npm install -D vitest@^3.2.4 @vitest/coverage-v8@^3.2.4 msw@^2.7.0 @testing-library/react@^16.3.0 @testing-library/user-event@^14.5.0
```

### Alternatives Considered

| Instead of          | Could Use                 | Tradeoff                                                                    |
| ------------------- | ------------------------- | --------------------------------------------------------------------------- |
| MSW                 | nock                      | nock patches Node http only; MSW works in browser+Node, better for frontend |
| @vitest/coverage-v8 | @vitest/coverage-istanbul | v8 is faster, already configured in vite.config.mts                         |
| jsdom               | happy-dom                 | happy-dom is faster but less compatible; jsdom already configured           |

## Architecture Patterns

### Recommended Project Structure

```
libs/src/test-utils/
  factories/
    userFactory.ts              # createUser(), createJwtUser()
    appConfigFactory.ts         # createAppConfig()
    surveyFactory.ts            # createSurvey(), createSurveyAnswer()
    conferenceFactory.ts        # createConference()
    userDocumentFactory.ts      # createUserDocument()
    index.ts                    # re-exports all factories
  api-mocks/
    cacheManagerMock.ts         # consolidated from scattered duplicates
    mongooseModelMock.ts        # Proxy-based query builder mock
    testingModulePreset.ts      # TestingModuleBuilder preset
    index.ts                    # re-exports
  msw/
    handlers/
      authHandlers.ts           # auth/OIDC happy-path
      appConfigHandlers.ts      # appConfigs returns standard set
      userHandlers.ts           # user profile available
      surveyHandlers.ts         # survey CRUD
      mailHandlers.ts           # mail operations
      fileSharingHandlers.ts    # file sharing operations
      index.ts                  # combines all default handlers
    server.ts                   # setupServer with default handlers
    index.ts                    # re-exports server + handlers
  providers/
    renderWithProviders.tsx      # wraps component in all providers
    index.ts
  index.ts                       # top-level re-export
```

### Pattern 1: Factory Functions with Partial Overrides

**What:** Simple factory functions returning complete valid objects with optional partial overrides
**When to use:** Any test needing domain objects

```typescript
// libs/src/test-utils/factories/userFactory.ts
import type { UserDto } from '@libs/user/types';

const USER_DEFAULTS: UserDto = {
  username: 'max.mustermann',
  firstName: 'Max',
  lastName: 'Mustermann',
  email: 'max.mustermann@realschule-musterstadt.de',
  school: 'Realschule Musterstadt',
  groups: ['cn=teachers,ou=groups,dc=schule,dc=de'],
  role: 'teacher',
  isAdmin: false,
};

const createUser = (overrides: Partial<UserDto> = {}): UserDto => ({
  ...USER_DEFAULTS,
  ...overrides,
});

export default createUser;
```

### Pattern 2: MSW Handler Setup

**What:** Per-module handler files combined into shared defaults, wired into vitest.setup.ts
**When to use:** All frontend tests that trigger API calls

```typescript
// libs/src/test-utils/msw/handlers/authHandlers.ts
import { http, HttpResponse } from 'msw';
import createUser from '../../factories/userFactory';

const authHandlers = [http.get('/edu-api/auth/userinfo', () => HttpResponse.json(createUser()))];

export default authHandlers;
```

```typescript
// libs/src/test-utils/msw/server.ts
import { setupServer } from 'msw/node';
import authHandlers from './handlers/authHandlers';
import appConfigHandlers from './handlers/appConfigHandlers';
import userHandlers from './handlers/userHandlers';

const defaultHandlers = [...authHandlers, ...appConfigHandlers, ...userHandlers];

const server = setupServer(...defaultHandlers);

export default server;
```

```typescript
// apps/frontend/test/vitest.setup.ts (updated)
import '@testing-library/jest-dom';
import server from '@libs/test-utils/msw/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Pattern 3: renderWithProviders

**What:** Utility wrapping components in the full provider tree
**When to use:** All frontend component tests

```typescript
// libs/src/test-utils/providers/renderWithProviders.tsx
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { ReactNode } from 'react';
// Import project's i18n instance and auth mock

interface ProviderOptions {
  route?: string;
  authState?: Partial<AuthState>;
}

const renderWithProviders = (
  ui: ReactNode,
  options?: ProviderOptions & Omit<RenderOptions, 'wrapper'>,
) => {
  const { route = '/', authState, ...renderOptions } = options ?? {};

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[route]}>
      <I18nextProvider i18n={i18nTestInstance}>
        {children}
      </I18nextProvider>
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

export default renderWithProviders;
```

### Pattern 4: Proxy-Based Mongoose Query Builder Mock

**What:** JavaScript Proxy that auto-handles any chained query method
**When to use:** API tests mocking Mongoose model queries

```typescript
// libs/src/test-utils/api-mocks/mongooseModelMock.ts
const createMongooseModelMock = <T>(defaultResult: T | T[] = [] as unknown as T) => {
  const createChainableProxy = (finalValue: unknown): unknown =>
    new Proxy(() => finalValue, {
      get: (_target, prop) => {
        if (prop === 'exec') return () => Promise.resolve(finalValue);
        if (prop === 'then') return undefined;
        return (..._args: unknown[]) => createChainableProxy(finalValue);
      },
      apply: () => createChainableProxy(finalValue),
    });

  return {
    find: jest.fn().mockImplementation(() => createChainableProxy(defaultResult)),
    findOne: jest.fn().mockImplementation(() => createChainableProxy(defaultResult)),
    findById: jest.fn().mockImplementation(() => createChainableProxy(defaultResult)),
    create: jest.fn().mockResolvedValue(defaultResult),
    findByIdAndUpdate: jest.fn().mockImplementation(() => createChainableProxy(defaultResult)),
    findByIdAndDelete: jest.fn().mockImplementation(() => createChainableProxy(defaultResult)),
    countDocuments: jest.fn().mockImplementation(() => createChainableProxy(0)),
    deleteMany: jest.fn().mockImplementation(() => createChainableProxy({ deletedCount: 0 })),
    aggregate: jest.fn().mockImplementation(() => createChainableProxy(defaultResult)),
  };
};

export default createMongooseModelMock;
```

### Pattern 5: TestingModuleBuilder Preset

**What:** Pre-configured NestJS TestingModule with common providers
**When to use:** API spec files to reduce boilerplate

```typescript
// libs/src/test-utils/api-mocks/testingModulePreset.ts
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import cacheManagerMock from './cacheManagerMock';

interface PresetOptions {
  providers: any[];
  imports?: any[];
}

const createTestingModule = async (options: PresetOptions): Promise<TestingModule> => {
  Logger.error = jest.fn();
  Logger.warn = jest.fn();
  Logger.log = jest.fn();

  return Test.createTestingModule({
    imports: options.imports ?? [],
    providers: [...options.providers, { provide: CACHE_MANAGER, useValue: cacheManagerMock }],
  }).compile();
};

export default createTestingModule;
```

### Anti-Patterns to Avoid

- **Inline mock objects in spec files:** Consolidate to shared factories/mocks in `libs/src/test-utils/`
- **Manual query chain mocking:** Every `.find().sort().limit()` chain mocked individually; use Proxy mock instead
- **Copy-paste cacheManagerMock:** Already scattered across multiple spec files; consolidate once
- **Snapshot testing for components:** Project explicitly excludes this (REQUIREMENTS.md Out of Scope)

## Don't Hand-Roll

| Problem                | Don't Build                   | Use Instead                   | Why                                                        |
| ---------------------- | ----------------------------- | ----------------------------- | ---------------------------------------------------------- |
| API mocking in browser | Custom fetch interceptor      | MSW 2.x `setupServer`         | Handles axios/fetch transparently, realistic network layer |
| Mongoose chain mocking | Manual `.find().sort()` stubs | Proxy-based mock factory      | Handles arbitrary chain depth automatically                |
| Provider wrapping      | Per-test provider trees       | `renderWithProviders` utility | 6+ providers needed; single import                         |
| Coverage collection    | Custom reporters              | @vitest/coverage-v8 built-in  | Native V8 coverage, zero config                            |
| Test module setup      | Copy-paste TestingModule      | `createTestingModule` preset  | Reduces 20+ lines to 5                                     |

## Common Pitfalls

### Pitfall 1: Vitest/MSW ESM Compatibility

**What goes wrong:** MSW 2.x is ESM-only. Vitest may need explicit server/browser condition handling.
**Why it happens:** MSW 2.x dropped CJS support; import paths differ between node and browser.
**How to avoid:** Use `msw/node` for Vitest (node environment for MSW server, jsdom for DOM). Ensure `vitest.setup.ts` imports from `msw/node`.
**Warning signs:** "Cannot find module msw/node" or "ERR_REQUIRE_ESM"

### Pitfall 2: Vitest Version Lock with Vite 5

**What goes wrong:** Installing Vitest 4.x breaks because it requires Vite 6+.
**Why it happens:** Vitest 4.0 dropped Vite 5 support.
**How to avoid:** Pin `vitest@^3.2.4` and `@vitest/coverage-v8@^3.2.4`. Both must match exactly.
**Warning signs:** Peer dependency warnings mentioning Vite version

### Pitfall 3: @vitest/coverage-v8 Version Mismatch

**What goes wrong:** Coverage fails silently or crashes if coverage-v8 version doesn't match vitest.
**Why it happens:** vitest and its coverage plugins must be the exact same version.
**How to avoid:** Always install both together: `npm install -D vitest@3.2.4 @vitest/coverage-v8@3.2.4`
**Warning signs:** "Cannot find module @vitest/coverage-v8" or version mismatch warnings

### Pitfall 4: MSW onUnhandledRequest in CI

**What goes wrong:** Tests pass locally but fail in CI due to unexpected network requests (fonts, analytics, etc.).
**Why it happens:** `onUnhandledRequest: 'error'` catches ALL unhandled requests.
**How to avoid:** Add bypass patterns for known static assets in MSW passthrough configuration.
**Warning signs:** Tests fail with "intercepted a request without a matching handler" for non-API URLs

### Pitfall 5: cleanAllStores Validation False Negatives

**What goes wrong:** Validation test passes even though stores are missing because the glob pattern doesn't match all store file naming conventions.
**Why it happens:** Some stores are `.tsx` (e.g., `useFrameStore.tsx`, `useTemplateMenuStore.tsx`) while most are `.ts`.
**How to avoid:** Glob for both `use*Store.ts` and `use*Store.tsx`. Also account for `UserStore` (in `useUserStore.ts` -- different naming).
**Warning signs:** Validation test reports fewer stores than actually exist (74 total, 56 currently registered)

### Pitfall 6: Nx Path Aliases in Test Files

**What goes wrong:** Test files can't resolve `@libs/` or `@/` imports.
**Why it happens:** Vitest needs the same path resolution as Vite. `nxViteTsPaths()` plugin handles this for Vite, but test config must also resolve them.
**How to avoid:** Ensure `resolve.alias` in `vite.config.mts` applies to test mode too (it does -- shared config object). Verify `@libs/test-utils` resolves correctly.
**Warning signs:** "Cannot find module @libs/test-utils/..." in test runs

## Code Examples

### Vitest Configuration Update (vite.config.mts)

Current test block in `apps/frontend/vite.config.mts` (lines 53-66):

```typescript
test: {
  globals: true,
  cache: { dir: '../../node_modules/.vitest' },
  environment: 'jsdom',
  include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  setupFiles: ['./test/vitest.setup.ts'],
  reporters: ['default'],
  coverage: {
    reportsDirectory: '../../coverage/apps/frontend',
    provider: 'v8',
  },
},
```

After upgrade, add libs test inclusion:

```typescript
test: {
  globals: true,
  cache: { dir: '../../node_modules/.vitest' },
  environment: 'jsdom',
  include: [
    'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    '../../libs/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
  ],
  setupFiles: ['./test/vitest.setup.ts'],
  reporters: ['default'],
  coverage: {
    reportsDirectory: '../../coverage/apps/frontend',
    provider: 'v8',
  },
},
```

### cleanAllStores Validation Test

```typescript
// apps/frontend/src/store/utils/cleanAllStores.spec.ts
import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';

const STORE_PATTERN = /use\w+Store/;
const CLEAN_ALL_STORES_PATH = resolve(__dirname, './cleanAllStores.ts');

describe('cleanAllStores', () => {
  it('should register all Zustand stores', () => {
    const cleanAllStoresContent = readFileSync(CLEAN_ALL_STORES_PATH, 'utf-8');

    const storeFiles = findStoreFiles(resolve(__dirname, '../../'));
    const registeredStores = extractRegisteredStores(cleanAllStoresContent);
    const importedStores = extractImportedStores(cleanAllStoresContent);

    const unregistered = storeFiles.filter((store) => !registeredStores.has(store) && !importedStores.has(store));

    expect(unregistered).toEqual([]);
  });
});
```

### Consolidated cacheManagerMock

Current locations (duplicated):

- `apps/api/src/common/cache-manager.mock.ts`
- Various inline definitions in spec files

Consolidated to:

```typescript
// libs/src/test-utils/api-mocks/cacheManagerMock.ts
const cacheManagerMock = {
  get: jest.fn().mockResolvedValue(undefined),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
  reset: jest.fn().mockResolvedValue(undefined),
  store: {
    keys: jest.fn().mockResolvedValue([]),
  },
};

export default cacheManagerMock;
```

### CI Pipeline: test-frontend Job

```yaml
# Added to .github/workflows/build-and-test.yml
test-frontend:
  runs-on: ubuntu-24.04
  needs: prepare
  timeout-minutes: 15
  steps:
    - name: Checkout
      uses: actions/checkout@v5.0.0
      with:
        token: ${{ github.token }}

    - name: Use Node.js
      uses: actions/setup-node@v6.0.0
      with:
        node-version: 22.x

    - name: Restore cached Node.js modules
      uses: actions/cache@v4.3.0
      continue-on-error: true
      with:
        path: |
          **/node_modules
        key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
        restore-keys: |
          ${{ runner.os }}-node-

    - name: Run Frontend Tests
      run: npm run test:frontend
```

## State of the Art

| Old Approach           | Current Approach       | When Changed | Impact                                                  |
| ---------------------- | ---------------------- | ------------ | ------------------------------------------------------- |
| Vitest 1.x             | Vitest 3.x             | 2025         | Better performance, workspace support, new reporter API |
| MSW 1.x (rest/graphql) | MSW 2.x (http/graphql) | 2024         | New `http.get()` API replaces `rest.get()`, ESM-only    |
| Manual mock chains     | Proxy-based mocks      | N/A (custom) | Eliminates per-query boilerplate                        |
| Scattered test utils   | Shared libs/test-utils | This phase   | Single source of truth for all test infrastructure      |

**Deprecated/outdated:**

- `rest.get()` in MSW: replaced by `http.get()` in MSW 2.x
- Vitest `cache` config option: renamed in 3.x, verify actual config key
- `@vitest/coverage-c8`: replaced by `@vitest/coverage-v8`

## Codebase-Specific Findings

### Current State Analysis

**Frontend Tests:** Zero test files in `apps/frontend/src/`. Setup file (`vitest.setup.ts`) only imports `@testing-library/jest-dom`.

**API Tests:** 31 spec files in `apps/api/src/`. Many follow a pattern of verbose `TestingModule` setup (15-30 lines of boilerplate per spec). Common mock imports include `mockCacheManager`, `mockGroupsService`, `mockFilesystemService`.

**Zustand Stores:** 74 store files found, 56 registered in `cleanAllStores.ts`. Missing stores:

- `useSharePublicConferenceStore`
- `useHandleUploadFileStore`
- `useReplaceFilesDialogStore`
- `useFileContentPreviewStore`
- `useFileEditorContentStore`
- `useDownloadAcknowledgedStore`
- `useFileSharingMoveDialogStore`
- `useDockerApplicationStore`
- `useWebdavServerConfigTableStore`
- `useWireguardConfigTableStore`
- `useWebhookClientsStore`
- `useExportSurveyToPdfStore`
- `useUserSettingsPageStore`
- `useUserWireguardStore`
- `useWhiteboardEditorStore`
- `usePlatformStore`
- `useSentryStore`
- `useSubMenuStore`
- `useTableViewSettingsStore`
- `useThemeStore`
- `useUserPreferencesStore`

That is 21 missing (not 18 -- re-counted).

**CI Pipeline:** Single `test` job runs `npm run test` (API tests only) along with lint, circular dep checks, translation checks, and pretty-quick. No frontend test execution in CI at all.

**eduApi:** Axios instance at `apps/frontend/src/api/eduApi.ts`, base URL from `@libs/common/constants/eduApiUrl`. MSW handlers must intercept requests to this base URL.

**Path Aliases:**

- `@` -> `apps/frontend/src`
- `@libs` -> `libs/src`
- `@edulution-io/ui-kit` -> `libs/ui-kit/src/index.ts`

## Open Questions

1. **OIDC Provider in Tests**
   - What we know: Project uses `react-oidc-context` (v3.2.0) with `oidc-client-ts` (v3.1.0)
   - What's unclear: Exact mock strategy for OIDC in renderWithProviders -- need to check if `react-oidc-context` exports a test provider or if manual mocking is needed
   - Recommendation: Mock `useAuth()` hook from `react-oidc-context` to return authenticated state by default

2. **i18n Test Instance**
   - What we know: Project uses `i18next` (23.8.2) + `react-i18next` (14.0.3)
   - What's unclear: Whether to load real translations or use `cimode` for deterministic tests
   - Recommendation: Use `cimode` (returns translation keys) for unit tests, real translations only if explicitly testing i18n

3. **Theme Provider in Tests**
   - What we know: Project has `useThemeStore` for theme management
   - What's unclear: Exact provider chain needed
   - Recommendation: Include minimal theme context in renderWithProviders; theme store handles state via Zustand (no provider needed if store is used directly)

## Sources

### Primary (HIGH confidence)

- Codebase analysis: `package.json` dependencies, `vite.config.mts` test configuration, `cleanAllStores.ts` store registration
- Codebase analysis: `apps/api/jest.config.ts`, existing spec file patterns, CI workflow YAML
- Codebase analysis: 74 Zustand store files enumerated vs 56 registered

### Secondary (MEDIUM confidence)

- Vitest version constraints: Training knowledge that Vitest 4.x requires Vite 6+ (should verify in CHANGELOG)
- MSW 2.x API: Training knowledge of `http.get()` API (well-established, HIGH confidence)

### Tertiary (LOW confidence)

- None

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - direct codebase analysis of package.json and existing config
- Architecture: HIGH - patterns derived from project conventions and CLAUDE.md guidelines
- Pitfalls: HIGH - identified from actual codebase state (version constraints, missing stores, path aliases)

**Research date:** 2026-02-26
**Valid until:** 2026-03-26 (stable infrastructure, 30-day validity)
