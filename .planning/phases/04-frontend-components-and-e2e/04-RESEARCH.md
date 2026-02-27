# Phase 4: Frontend Components and E2E - Research

**Researched:** 2026-02-27
**Domain:** React Component Testing (RTL/Vitest) + Playwright E2E
**Confidence:** HIGH

## Summary

Phase 4 covers two distinct workstreams: (1) React component tests using Vitest + React Testing Library for critical UI components (MenuBar, Sidebar, AppLayout, LoginPage, Table/ScrollableTable, survey forms, file browser, mail compose), and (2) Playwright E2E tests against a staging server with Keycloak authentication.

The component testing infrastructure is already established from Phase 1/3: MSW server in vitest.setup.ts, renderWithProviders utility (MemoryRouter + i18next), and factories for test data. Components have deep dependency trees (Zustand stores, react-router, i18n, OIDC) requiring comprehensive mocking. The Table component is built on @tanstack/react-table with ScrollableTable and TableGridView as the primary implementations.

The E2E workstream requires installing Playwright, creating a new `apps/e2e` project, configuring Keycloak storageState authentication, building Page Object Models, and adding a CI job. No Playwright or E2E infrastructure currently exists in the project.

**Primary recommendation:** Split into 3-4 plans: (1) navigation component tests (MenuBar, Sidebar, AppLayout), (2) data-driven component tests (LoginPage, Table, survey, file browser, mail compose), (3) Playwright infrastructure + auth + Page Objects, (4) E2E journey tests + CI integration.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Dedicated persistent test server (already exists, not spun up per-run)
- Pre-provisioned Keycloak accounts for 4 roles: Admin, Teacher, Student, Parent
- Credentials stored in environment variables: `.env.e2e` (gitignored) locally, GitHub Actions secrets in CI
- User will provide staging URL and credentials before execution begins
- E2E tests target this server on every PR run
- Tests create their own data through the UI — no API seeding, each test is a self-contained journey
- Tests clean up after themselves (afterAll/afterEach deletes created entities)
- Fully independent tests — any test can run in isolation, no shared state between tests
- Unique identifiers (timestamps/UUIDs) appended to all created entities to prevent parallel collisions
- Full tree rendering — no mocking of child components, render the complete component tree
- Component-specific MSW handlers — each component test defines its own MSW responses rather than importing shared handlers from Phase 1/3
- Accessibility checks deferred entirely to Phase 5 (axe-core) — component tests focus on functional behavior
- LoginPage tests mock the OIDC provider and test the full auth callback handling, not just trigger verification
- All three browsers: Chromium, Firefox, and WebKit
- 1 automatic retry on test failure before marking as failed
- E2E runs on every PR as part of the CI pipeline
- E2E job starts as non-blocking (warning/informational) — promote to required status check once the suite proves stable
- Playwright HTML report uploaded as CI artifact on failure (per CICD-03 requirement)

### Claude's Discretion

- Number of parallel Playwright workers (based on runner capacity and test count)
- Page Object Model class hierarchy and design patterns
- Playwright configuration details (timeouts, viewport sizes, screenshot-on-failure settings)
- Component test file organization and naming
- Exact storageState implementation for Keycloak auth reuse

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                                                               | Research Support                                                                                                                            |
| ------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| FECP-01 | MenuBar component tests — navigation, collapse behavior, active state     | MenuBar.tsx uses useMenuBarConfig, useMenuBarStore (collapse), useMedia (responsive). Test with renderWithProviders + MSW for appConfigs    |
| FECP-02 | Sidebar component tests — item rendering, collapse, responsive behavior   | Sidebar.tsx delegates to DesktopSidebar/MobileSidebar based on useMedia. Test via useSidebarItems mock data                                 |
| FECP-03 | AppLayout component tests — shell rendering with menubar, sidebar, outlet | AppLayout.tsx orchestrates MenuBar, Sidebar, Outlet, MobileTopBar. Test authenticated vs unauthenticated states                             |
| FECP-04 | LoginPage component tests — form validation, OIDC redirect trigger        | LoginPage.tsx uses react-oidc-context, react-hook-form + zod, QR code SSE. Mock useAuth + OIDC provider                                     |
| FECP-05 | Table component tests — sorting, filtering, pagination, row actions       | ScrollableTable.tsx + TableGridView.tsx use @tanstack/react-table. Test column rendering, filter input, sort, row selection                 |
| FECP-06 | Survey form components tests — question rendering, answer submission      | SurveyCreatorComponent (survey-creator-react), SurveyParticipationPage, CreatedSurveysPage. Heavy 3rd-party dependency                      |
| FECP-07 | File browser component tests — file listing, upload, download actions     | FileSharingPage.tsx, FileSharingTable, ActionContentDialog, breadcrumb navigation. Many sub-components and stores                           |
| FECP-08 | Mail compose component tests — editor, recipients, attachments, send      | MailPage is NativeFrame (iframe). No composable mail component to test directly. Requirement scope limited to iframe rendering verification |
| E2ET-01 | Playwright project configured with NX integration and parallel execution  | New apps/e2e project with project.json, playwright.config.ts, Nx target                                                                     |
| E2ET-02 | Keycloak auth fixture using storageState pattern against staging server   | globalSetup authenticates via Keycloak OIDC, saves storageState to file, tests reuse                                                        |
| E2ET-03 | Page Object Model base classes for reusable page interactions             | BasePage, LoginPage, SidebarNav, MenuBarNav POM classes                                                                                     |
| E2ET-04 | Login flow E2E — Keycloak OIDC redirect, session persistence, logout      | Navigate to login, enter credentials, verify redirect to dashboard, logout                                                                  |
| E2ET-05 | Survey workflow E2E — create survey, participate, view results            | Create survey in editor, publish, participate as different user, check results                                                              |
| E2ET-06 | File sharing E2E — upload file, share with user, download shared file     | Upload via FileSharingPage, share, verify download                                                                                          |
| E2ET-07 | Mail workflow E2E — compose, send, receive in inbox                       | Mail is NativeFrame (iframe) — E2E can interact with iframe content                                                                         |
| E2ET-08 | Conference E2E — create conference, join, verify running state            | Create via dialog, verify BBB iframe loads                                                                                                  |
| E2ET-09 | AppStore E2E — browse apps, install, configure                            | AppStore uses Settings/AppConfig pages                                                                                                      |
| E2ET-10 | Settings E2E — change theme, notifications, DND window                    | UserSettings pages for theme, notification preferences                                                                                      |
| CICD-03 | E2E test job with Playwright report artifact upload on failure            | GitHub Actions job with playwright install, run, artifact upload                                                                            |

</phase_requirements>

## Standard Stack

### Core

| Library                     | Version           | Purpose                         | Why Standard                                                     |
| --------------------------- | ----------------- | ------------------------------- | ---------------------------------------------------------------- |
| @playwright/test            | ^1.50.x           | E2E testing framework           | Industry standard for cross-browser E2E, native async, auto-wait |
| @testing-library/react      | ^14.x (existing)  | Component testing               | Already in project, behavioral testing philosophy                |
| @testing-library/user-event | ^14.x (existing)  | User interaction simulation     | Realistic event dispatching vs fireEvent                         |
| msw                         | ^2.x (existing)   | API mocking for component tests | Already configured in vitest.setup.ts                            |
| vitest                      | ^3.2.x (existing) | Test runner for component tests | Already configured, jsdom environment                            |

### Supporting

| Library                              | Version | Purpose                        | When to Use                             |
| ------------------------------------ | ------- | ------------------------------ | --------------------------------------- |
| @playwright/test (built-in fixtures) | ^1.50.x | Test fixtures and page objects | All E2E tests                           |
| @nx/playwright                       | ^20.x   | Nx integration for Playwright  | Nx project configuration for e2e target |

### Alternatives Considered

| Instead of     | Could Use     | Tradeoff                                                                                      |
| -------------- | ------------- | --------------------------------------------------------------------------------------------- |
| Playwright     | Cypress       | Playwright has better cross-browser support, faster parallel execution, better CI integration |
| @nx/playwright | Manual config | Nx plugin provides consistent target naming and caching                                       |

**Installation:**

```bash
npm install -D @playwright/test @nx/playwright
npx playwright install --with-deps chromium firefox webkit
```

## Architecture Patterns

### Recommended Project Structure

```
apps/e2e/
├── playwright.config.ts       # Playwright configuration
├── project.json               # Nx project config
├── .env.e2e                   # Staging credentials (gitignored)
├── global-setup.ts            # Keycloak auth + storageState
├── fixtures/
│   └── auth.fixture.ts        # Custom fixture with pre-authenticated page
├── page-objects/
│   ├── BasePage.ts            # Common navigation, waiting, assertions
│   ├── LoginPage.ts           # Login form interactions
│   ├── DashboardPage.ts       # Dashboard after login
│   ├── SurveyEditorPage.ts    # Survey creation
│   ├── FileSharingPage.ts     # File operations
│   ├── ConferencePage.ts      # Conference management
│   ├── SettingsPage.ts        # Settings interactions
│   └── SidebarNav.ts          # Sidebar navigation helper
├── tests/
│   ├── auth/
│   │   └── login-logout.spec.ts
│   ├── surveys/
│   │   └── survey-workflow.spec.ts
│   ├── files/
│   │   └── file-sharing.spec.ts
│   ├── mail/
│   │   └── mail-workflow.spec.ts
│   ├── conferences/
│   │   └── conference.spec.ts
│   ├── appstore/
│   │   └── appstore.spec.ts
│   └── settings/
│       └── settings.spec.ts
└── auth/
    └── admin.storageState.json  # Generated, gitignored
```

### Component Test Organization

```
apps/frontend/src/
├── components/shared/
│   ├── MenuBar.tsx
│   └── MenuBar.spec.tsx        # Co-located with source
├── components/ui/Sidebar/
│   ├── Sidebar.tsx
│   └── Sidebar.spec.tsx
├── components/structure/layout/
│   ├── AppLayout.tsx
│   └── AppLayout.spec.tsx
├── pages/LoginPage/
│   ├── LoginPage.tsx
│   └── LoginPage.spec.tsx
├── components/ui/Table/
│   ├── ScrollableTable.tsx
│   └── ScrollableTable.spec.tsx
│   ├── TableGridView.tsx
│   └── TableGridView.spec.tsx
├── pages/Surveys/
│   ├── Tables/CreatedSurveysPage.tsx
│   └── Tables/CreatedSurveysPage.spec.tsx
│   ├── Participation/SurveyParticipationPage.tsx
│   └── Participation/SurveyParticipationPage.spec.tsx
├── pages/FileSharing/
│   ├── FileSharingPage.tsx
│   └── FileSharingPage.spec.tsx
└── pages/Mail/
    ├── MailPage.tsx
    └── MailPage.spec.tsx
```

### Pattern 1: Component Test with Full Provider Tree + Component-Specific MSW

**What:** Render component with all providers and MSW handlers specific to the test
**When to use:** Every component test (locked decision: full tree rendering, component-specific handlers)
**Example:**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import server from '@libs/test-utils/msw/server';
import renderWithProviders from '@libs/test-utils/providers/renderWithProviders';
import MenuBar from './MenuBar';

const menuBarHandlers = [
  http.get('/edu-api/appconfig', () =>
    HttpResponse.json([
      { id: 'filesharing', name: 'filesharing', /* ... */ },
    ])
  ),
  http.get('/edu-api/auth/userinfo', () =>
    HttpResponse.json({ username: 'test.user', ldapGroups: ['teachers'] })
  ),
];

describe('MenuBar', () => {
  beforeEach(() => {
    server.use(...menuBarHandlers);
  });

  it('renders menu items from config', async () => {
    renderWithProviders(<MenuBar />, { route: '/filesharing' });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /files/i })).toBeInTheDocument();
    });
  });
});
```

### Pattern 2: Keycloak StorageState Authentication

**What:** Authenticate once in globalSetup, save browser state, reuse in all tests
**When to use:** All authenticated E2E tests
**Example:**

```typescript
// global-setup.ts
import { chromium, type FullConfig } from '@playwright/test';

const globalSetup = async (config: FullConfig) => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(process.env.E2E_BASE_URL + '/login');
  await page.getByTestId('test-id-login-page-username-input').fill(process.env.E2E_ADMIN_USER!);
  await page.getByTestId('test-id-login-page-password-input').fill(process.env.E2E_ADMIN_PASS!);
  await page.getByTestId('test-id-login-page-submit-button').click();
  await page.waitForURL('**/dashboard/**');

  await page.context().storageState({ path: 'apps/e2e/auth/admin.storageState.json' });
  await browser.close();
};

export default globalSetup;
```

### Pattern 3: Page Object Model

**What:** Encapsulate page interactions in reusable classes
**When to use:** All E2E tests
**Example:**

```typescript
// page-objects/BasePage.ts
import { type Page, type Locator } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async navigateTo(path: string) {
    await this.page.goto(path);
  }

  sidebar() {
    return this.page.locator('[data-testid="sidebar"]');
  }
}
```

### Anti-Patterns to Avoid

- **Snapshot testing for components:** Locked decision — use behavioral assertions with RTL
- **Importing shared Phase 1/3 MSW handlers into component tests:** Locked decision — component-specific handlers
- **Per-test Keycloak login:** Locked decision — use storageState pattern
- **API seeding for E2E data:** Locked decision — tests create data through UI
- **Shared state between E2E tests:** Locked decision — each test is self-contained
- **Mocking child components (shallow rendering):** Locked decision — full tree rendering

## Don't Hand-Roll

| Problem                   | Don't Build               | Use Instead                                        | Why                                                   |
| ------------------------- | ------------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| Cross-browser E2E         | Custom Selenium/Puppeteer | Playwright                                         | Auto-wait, trace viewer, parallel sharding built-in   |
| Auth state sharing        | Custom cookie management  | Playwright storageState                            | Native support for saving/loading browser context     |
| E2E CI reporting          | Custom report parsing     | Playwright HTML reporter + GitHub Actions artifact | Built-in, rich UI, standard pattern                   |
| Table interaction testing | Manual DOM queries        | @tanstack/react-table test utilities + RTL         | Let tanstack handle table state, test rendered output |

**Key insight:** Playwright's built-in features (auto-wait, storageState, tracing, HTML reporter) eliminate the need for custom E2E infrastructure.

## Common Pitfalls

### Pitfall 1: Component Tests Failing Due to Missing Zustand Store State

**What goes wrong:** Components read from Zustand stores that have initial state incompatible with rendering
**Why it happens:** Components like MenuBar depend on useMenuBarStore, useSubMenuStore, useAppConfigsStore, usePlatformStore — all need realistic initial state
**How to avoid:** Set up Zustand store state directly before rendering, OR use MSW handlers that trigger store population via API calls. Use `server.use()` to override default handlers per test.
**Warning signs:** "Cannot read property of undefined" errors, blank renders

### Pitfall 2: OIDC Provider Not Mocked in LoginPage Tests

**What goes wrong:** LoginPage uses `useAuth()` from `react-oidc-context` which requires an AuthProvider
**Why it happens:** renderWithProviders doesn't include an OIDC provider
**How to avoid:** Mock `react-oidc-context` at the module level with `vi.mock('react-oidc-context')`, providing a mock `useAuth` that returns controllable state. The LoginPage uses `auth.signinResourceOwnerCredentials`, `auth.isAuthenticated`, `auth.user`, `auth.isLoading`.
**Warning signs:** "useAuth must be used within AuthProvider" errors

### Pitfall 3: Survey Components Depend on survey-creator-react (Heavy 3rd Party)

**What goes wrong:** SurveyEditorPage renders SurveyCreatorComponent from `survey-creator-react` which has complex internal state
**Why it happens:** SurveyJS is a large library that manages its own DOM, making RTL testing of internal behavior unreliable
**How to avoid:** Mock `survey-creator-react` and `survey-creator-core` at module level. Test the page's form logic, dialog interactions, and navigation — not the SurveyJS internal behavior. For participation, test the page-level loading/error states and navigation.
**Warning signs:** Extremely slow tests, flaky assertions on SurveyJS internal DOM

### Pitfall 4: MailPage is an Iframe — Cannot Test Internal Content with RTL

**What goes wrong:** MailPage renders `<NativeFrame appName={APPS.MAIL} />` which is an iframe to an external mail client
**Why it happens:** NativeFrame embeds external content that RTL cannot access
**How to avoid:** Component tests for MailPage should verify the iframe renders with correct src/attributes. E2E tests (Playwright) can interact with iframe content via `page.frameLocator()`.
**Warning signs:** Empty test results when trying to query iframe content

### Pitfall 5: Playwright Tests Flaky Due to Missing Auto-Wait

**What goes wrong:** Tests fail intermittently because elements aren't ready
**Why it happens:** Not using Playwright's built-in auto-wait locators
**How to avoid:** Always use locator methods (`getByTestId`, `getByRole`, `getByText`) rather than raw selectors. Use `expect(locator).toBeVisible()` assertions that auto-wait. Set reasonable timeouts.
**Warning signs:** Intermittent failures on CI but passing locally

### Pitfall 6: E2E Data Collisions in Parallel Execution

**What goes wrong:** Two parallel tests create entities with the same name, causing conflicts
**Why it happens:** Tests use static names for created entities
**How to avoid:** Locked decision — append timestamps/UUIDs to all created entities. Use `Date.now()` or `crypto.randomUUID()` for unique identifiers.
**Warning signs:** Tests pass in isolation but fail when run in parallel

## Code Examples

### MenuBar Component Test — Collapse Behavior

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import server from '@libs/test-utils/msw/server';
import renderWithProviders from '@libs/test-utils/providers/renderWithProviders';
import useMenuBarStore from '@/components/shared/useMenuBarStore';
import MenuBar from '@/components/shared/MenuBar';

describe('MenuBar', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    useMenuBarStore.setState({ isCollapsed: false, isMobileMenuBarOpen: false });
    server.use(
      http.get('/edu-api/appconfig', () =>
        HttpResponse.json([/* appconfig items */])
      ),
    );
  });

  it('shows item labels when expanded', async () => {
    renderWithProviders(<MenuBar />, { route: '/filesharing' });
    // Assert labels visible
  });

  it('hides labels when collapsed', async () => {
    useMenuBarStore.setState({ isCollapsed: true });
    renderWithProviders(<MenuBar />, { route: '/filesharing' });
    // Assert labels hidden, tooltips available
  });
});
```

### LoginPage Component Test — Form Validation

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderWithProviders from '@libs/test-utils/providers/renderWithProviders';

vi.mock('react-oidc-context', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    signinResourceOwnerCredentials: vi.fn(),
    error: null,
  }),
}));

import LoginPage from '@/pages/LoginPage/LoginPage';

describe('LoginPage', () => {
  const user = userEvent.setup();

  it('shows validation errors for empty form submission', async () => {
    renderWithProviders(<LoginPage />, { route: '/login' });
    await user.click(screen.getByTestId('test-id-login-page-submit-button'));
    await waitFor(() => {
      // Check for validation messages
    });
  });
});
```

### Playwright E2E — Login Flow

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('test-id-login-page-username-input').fill('admin.user');
    await page.getByTestId('test-id-login-page-password-input').fill('password');
    await page.getByTestId('test-id-login-page-submit-button').click();
    await expect(page).toHaveURL(/dashboard/);
  });

  test('user can logout', async ({ page }) => {
    // Use storageState for authenticated session
    await page.goto('/dashboard');
    // Navigate to logout
  });
});
```

### Playwright Configuration

```typescript
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.e2e') });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  globalSetup: './global-setup.ts',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

## State of the Art

| Old Approach             | Current Approach                      | When Changed    | Impact                                     |
| ------------------------ | ------------------------------------- | --------------- | ------------------------------------------ |
| Enzyme shallow rendering | RTL full render + user-event          | 2020+           | Tests behavior, not implementation         |
| Cypress for E2E          | Playwright preferred for new projects | 2022+           | Better parallel, cross-browser, CI support |
| Per-test auth login      | storageState pattern                  | Playwright 1.x+ | 10-50x faster test suites                  |
| Manual page waits        | Playwright auto-wait locators         | Playwright 1.x+ | Eliminates flaky waitForSelector calls     |

**Deprecated/outdated:**

- Enzyme: Incompatible with React 18, no longer maintained
- fireEvent (RTL): Still works but user-event is strongly preferred for realistic interaction simulation

## Open Questions

1. **MailPage testing scope**
   - What we know: MailPage.tsx renders `<NativeFrame appName={APPS.MAIL} />` which is an iframe to an external mail client (Roundcube or similar)
   - What's unclear: Whether the FECP-08 requirement for "mail compose component tests" can be meaningfully tested with RTL given it's an iframe
   - Recommendation: Component test verifies iframe renders with correct src. E2E test (E2ET-07) handles actual mail compose/send/receive through Playwright's iframe support

2. **Staging server availability for E2E**
   - What we know: User confirmed dedicated persistent test server exists
   - What's unclear: Whether credentials and URL will be available before plan execution
   - Recommendation: Plan should include environment variable template and validation step

3. **SurveyJS component test depth**
   - What we know: SurveyCreatorComponent and SurveyModel are complex 3rd-party widgets
   - What's unclear: How much of the survey interaction can be tested via RTL vs needs E2E
   - Recommendation: Component tests focus on page-level behavior (loading, dialogs, navigation). E2E tests cover actual survey creation and participation workflow

## Validation Architecture

### Test Framework

| Property                        | Value                                                                    |
| ------------------------------- | ------------------------------------------------------------------------ |
| Framework (components)          | Vitest 3.2.x + jsdom + @testing-library/react                            |
| Framework (E2E)                 | Playwright ^1.50.x                                                       |
| Config file (components)        | apps/frontend/vite.config.mts (test section)                             |
| Config file (E2E)               | apps/e2e/playwright.config.ts (new — Wave 0)                             |
| Quick run command (components)  | `npx vitest run apps/frontend/src/components/shared/MenuBar.spec.tsx`    |
| Quick run command (E2E)         | `npx playwright test tests/auth/login-logout.spec.ts --project=chromium` |
| Full suite command (components) | `npm run test:frontend`                                                  |
| Full suite command (E2E)        | `npx playwright test` (from apps/e2e)                                    |

### Phase Requirements -> Test Map

| Req ID  | Behavior                                   | Test Type        | Automated Command                                                                   | File Exists? |
| ------- | ------------------------------------------ | ---------------- | ----------------------------------------------------------------------------------- | ------------ |
| FECP-01 | MenuBar navigation, collapse, active state | unit (component) | `npx vitest run apps/frontend/src/components/shared/MenuBar.spec.tsx`               | No - Wave 1  |
| FECP-02 | Sidebar items, collapse, responsive        | unit (component) | `npx vitest run apps/frontend/src/components/ui/Sidebar/Sidebar.spec.tsx`           | No - Wave 1  |
| FECP-03 | AppLayout shell rendering                  | unit (component) | `npx vitest run apps/frontend/src/components/structure/layout/AppLayout.spec.tsx`   | No - Wave 1  |
| FECP-04 | LoginPage form validation, OIDC            | unit (component) | `npx vitest run apps/frontend/src/pages/LoginPage/LoginPage.spec.tsx`               | No - Wave 1  |
| FECP-05 | Table sorting, filtering, actions          | unit (component) | `npx vitest run apps/frontend/src/components/ui/Table/ScrollableTable.spec.tsx`     | No - Wave 1  |
| FECP-06 | Survey form rendering, submission          | unit (component) | `npx vitest run apps/frontend/src/pages/Surveys/Tables/CreatedSurveysPage.spec.tsx` | No - Wave 1  |
| FECP-07 | File browser listing, upload, download     | unit (component) | `npx vitest run apps/frontend/src/pages/FileSharing/FileSharingPage.spec.tsx`       | No - Wave 1  |
| FECP-08 | Mail compose (iframe verification)         | unit (component) | `npx vitest run apps/frontend/src/pages/Mail/MailPage.spec.tsx`                     | No - Wave 1  |
| E2ET-01 | Playwright + Nx config                     | setup            | `npx playwright test --list` (from apps/e2e)                                        | No - Wave 0  |
| E2ET-02 | Keycloak storageState auth                 | setup            | `npx playwright test tests/auth/ --project=chromium`                                | No - Wave 0  |
| E2ET-03 | Page Object Model classes                  | setup            | N/A (verified via test usage)                                                       | No - Wave 0  |
| E2ET-04 | Login/logout E2E                           | e2e              | `npx playwright test tests/auth/login-logout.spec.ts --project=chromium`            | No - Wave 2  |
| E2ET-05 | Survey workflow E2E                        | e2e              | `npx playwright test tests/surveys/ --project=chromium`                             | No - Wave 2  |
| E2ET-06 | File sharing E2E                           | e2e              | `npx playwright test tests/files/ --project=chromium`                               | No - Wave 2  |
| E2ET-07 | Mail workflow E2E                          | e2e              | `npx playwright test tests/mail/ --project=chromium`                                | No - Wave 2  |
| E2ET-08 | Conference E2E                             | e2e              | `npx playwright test tests/conferences/ --project=chromium`                         | No - Wave 2  |
| E2ET-09 | AppStore E2E                               | e2e              | `npx playwright test tests/appstore/ --project=chromium`                            | No - Wave 2  |
| E2ET-10 | Settings E2E                               | e2e              | `npx playwright test tests/settings/ --project=chromium`                            | No - Wave 2  |
| CICD-03 | CI E2E job + report artifact               | ci               | Verify via `.github/workflows/build-and-test.yml`                                   | No - Wave 2  |

### Sampling Rate

- **Per task commit:** `npx vitest run <specific-spec-file>` or `npx playwright test <specific-test> --project=chromium`
- **Per wave merge:** `npm run test:frontend` + `npx playwright test --project=chromium`
- **Phase gate:** Full suite green before verify-work

### Wave 0 Gaps

- [ ] `apps/e2e/playwright.config.ts` — Playwright configuration
- [ ] `apps/e2e/project.json` — Nx project definition for e2e target
- [ ] `apps/e2e/global-setup.ts` — Keycloak storageState authentication
- [ ] `apps/e2e/.env.e2e` — Environment variable template
- [ ] `apps/e2e/page-objects/BasePage.ts` — Base POM class
- [ ] `apps/e2e/fixtures/auth.fixture.ts` — Authenticated test fixture
- [ ] Playwright browsers installation: `npx playwright install --with-deps`
- [ ] npm install: `npm install -D @playwright/test`

## Codebase Findings

### Key Component Dependencies

**MenuBar.tsx** depends on:

- `useMenuBarConfig` (hook → returns MenuBarEntry from route-based config registry)
- `useMenuBarStore` (Zustand → isCollapsed, isMobileMenuBarOpen, toggleMobileMenuBar, closeMobileMenuBar, toggleCollapsed)
- `useSubMenuStore` (Zustand → activeSection)
- `usePlatformStore` (Zustand → isEdulutionApp)
- `useAppConfigsStore` (Zustand → appConfigs)
- `useMedia` (hook → isMobileView, isTabletView)
- `useLocation` (react-router)
- `useTranslation` (i18next)
- Children: MenuBarHeader, MenuBarItemList, MenuBarCollapseButton, MenuBarFooter, PageTitle

**AppLayout.tsx** depends on:

- `useUserStore` (Zustand → isAuthenticated)
- `useMenuBarConfig` (hook)
- `useAppConfigsStore` (Zustand → appConfigs)
- `useEduApiStore` (Zustand → isEduApiHealthy)
- `useMedia` (hook)
- `usePlatformStore` (Zustand → isEdulutionApp)
- `useLocation` (react-router)
- Children: MenuBar, Sidebar, Outlet, MobileTopBar, Overlays, OfflineBanner

**LoginPage.tsx** depends on:

- `useAuth` from `react-oidc-context` (OIDC authentication)
- `useForm` + `zodResolver` (form validation)
- `useUserStore`, `useLmnApiStore`, `useSessionFlagsStore`, `useGlobalSettingsApiStore`, `useAppConfigsStore` (multiple stores)
- `useDeploymentTarget`, `useSilentLoginWithPassword`, `useAuthErrorHandler` (custom hooks)
- Uses `data-testid` attributes: `test-id-login-page-username-input`, `test-id-login-page-password-input`, `test-id-login-page-submit-button`, `test-id-login-page-form`
- Contains QR code login and TOTP MFA flows

**Table (ScrollableTable/TableGridView)** depends on:

- `@tanstack/react-table` (core table logic)
- `useScrollableTable` (internal hook)
- `useTableViewSettingsStore` (Zustand)
- Props-driven: columns, data, filterKey, actions, etc.

**FileSharingPage.tsx** depends on:

- `useFileSharingStore`, `useFileEditorStore`, `usePublicShareStore` (multiple stores)
- `useFileSharingPage`, `usePublicShareQr`, `useBreadcrumbNavigation`, `useFileUploadWithReplace`, `useRefreshOnFileOperationComplete` (multiple hooks)
- Children: FileSharingTable, ActionContentDialog, DirectoryBreadcrumb, multiple dialogs

**MailPage.tsx**: Simple NativeFrame wrapper — renders iframe. Minimal testing surface at component level.

**SurveyEditorPage.tsx** depends on:

- `survey-creator-react` (SurveyCreatorComponent — 3rd party heavy widget)
- Multiple stores: useSurveyTablesPageStore, useSurveyEditorPageStore, useTemplateMenuStore, useQuestionsContextMenuStore
- `useForm` + zodResolver for survey metadata form

### Existing data-testid attributes

The LoginPage has `data-testid` attributes ready for E2E:

- `test-id-login-page-username-input`
- `test-id-login-page-password-input`
- `test-id-login-page-submit-button`
- `test-id-login-page-form`

Other components may need `data-testid` additions for E2E selectors.

## Sources

### Primary (HIGH confidence)

- Codebase analysis: Direct file reading of all target components, stores, hooks, and test infrastructure
- Existing test patterns: vitest.setup.ts, renderWithProviders.tsx, MSW server setup, sample spec files

### Secondary (MEDIUM confidence)

- Playwright documentation patterns: storageState, globalSetup, Page Object Model (well-established patterns)
- @tanstack/react-table testing patterns (standard RTL approach)

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all libraries either already in project (RTL, MSW, Vitest) or industry standard (Playwright)
- Architecture: HIGH — component structure fully analyzed from codebase, POM patterns well-established
- Pitfalls: HIGH — identified from actual component dependency analysis (OIDC, SurveyJS, iframe, Zustand stores)

**Research date:** 2026-02-27
**Valid until:** 2026-03-27 (stable domain, well-established tools)
