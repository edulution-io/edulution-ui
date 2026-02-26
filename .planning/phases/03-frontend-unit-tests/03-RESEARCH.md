# Phase 3: Frontend Unit Tests - Research

**Researched:** 2026-02-26
**Domain:** Frontend unit testing (utilities, Zustand stores, custom hooks)
**Confidence:** HIGH

## Summary

Phase 3 targets three categories of frontend code: pure utility functions in libs/ and apps/frontend/src/utils/, Zustand stores that make API calls via eduApi (axios), and custom React hooks. The test infrastructure from Phase 1 is already in place: Vitest 3.2.x with jsdom, MSW 2.x with a shared handler library, factories for users/appConfigs/conferences/surveys/userDocuments, and a renderWithProviders utility wrapping MemoryRouter + i18n.

The codebase currently has only 2 frontend spec files (sampleMsw.spec.ts and cleanAllStores.spec.ts). All utility functions are pure or near-pure (some use i18n.t() or browser APIs). Stores follow a consistent pattern: create() from zustand with initialState spread, async actions calling eduApi, and handleApiError for error paths. Hooks range from simple (useTableActions - 38 lines, just a useMemo wrapper) to complex (useKeyboardNavigation - 250 lines with multiple useEffect and keyboard event handling).

**Primary recommendation:** Test utilities as pure functions with table-driven inputs, test stores by calling actions directly and asserting state changes with MSW intercepting API calls, test hooks via renderHook with the existing MSW server handling network requests.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Shared MSW handler library in libs/src/test-utils/msw/ -- reusable handlers that match real API response shapes
- MSW handlers return realistic full API response objects using factories from Phase 1 infrastructure -- catches missing field bugs
- Every store test covers both success paths (correct state transitions) AND error paths (handleApiError called, error state set)
- All 8 stores in requirements (file sharing, mails, survey editor, conference, appConfigs, class management, user, SSE) get equal test depth -- no prioritization
- Edge case strategy: boundary values (empty strings, null, undefined, special chars) plus invalid inputs -- focus on what could break in production
- Browser API utilities (copyToClipboard, getCompressedImage): mock via jsdom stubs in vitest.setup.ts -- tests run fast and verify utility logic
- Zod schema tests: test schemas in isolation with valid/invalid payloads in Phase 3, form integration tests deferred to Phase 4
- Route generation tests: assert against hardcoded expected route paths/configs -- readable and catches unexpected changes
- Hooks use real Zustand stores with MSW intercepting API calls -- tests verify the full hook-store-API chain
- SSE hooks: use MSW SSE handlers to intercept the SSE endpoint and stream mock events
- Provider setup: full provider tree via renderWithProviders utility (router, i18n, OIDC) -- consistent with future component tests
- Keyboard navigation hooks: simulate real keyboard events via fireEvent.keyDown / userEvent.keyboard -- tests the full event handling chain
- Split by type: Plan 1 = Utility functions (FEUT-01 to FEUT-04), Plan 2 = Zustand stores (FEST-01 to FEST-08), Plan 3 = Custom hooks (FEHK-01 to FEHK-05)
- Execution order: Plan 1 (utilities) runs first to establish patterns, then Plans 2 and 3 run in parallel
- Plans assume Phase 1 infrastructure is complete (MSW setup, factories, renderWithProviders, cleanAllStores validation)
- File organization: one spec file per module (e.g., useFileSharingStore.spec.ts, not individual function spec files)

### Claude's Discretion

- Internal organization of MSW handler files (grouping by API domain vs by store)
- Exact factory shapes for API responses (derived from real API types)
- Test helper utilities needed within Phase 3 (beyond Phase 1 infrastructure)
- Order of individual test cases within spec files

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                                                                                                                                                    | Research Support                                                                                                                                                                                                |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FEUT-01 | Shared lib utility tests (getIsAdmin, processLdapGroups, sanitizePath, mapToDirectoryFiles, formatEstimatedTimeRemaining, convertToWebdavUrl, buildCollectDTO) | Pure functions located in libs/src/; testable with direct import, no mocking needed except i18n for formatEstimatedTimeRemaining and XML parser for mapToDirectoryFiles                                         |
| FEUT-02 | Frontend utility tests (handleApiError, getDisplayName, applyThemeColors, getCompressedImage, copyToClipboard)                                                 | Located in apps/frontend/src/utils/; handleApiError needs axios mock, applyThemeColors needs mock HTMLElement, getCompressedImage needs canvas/FileReader mocks, copyToClipboard needs navigator.clipboard mock |
| FEUT-03 | Zod schema validation tests for settings forms                                                                                                                 | 3 schema files found in apps/frontend/src/pages/Settings/AppConfig/schemas/; test by calling schema.safeParse() with valid/invalid payloads                                                                     |
| FEUT-04 | Route generation utility tests (getFramedRoutes, getForwardedAppRoutes, getNativeAppRoutes)                                                                    | 3 files in apps/frontend/src/router/routes/; each filters appConfigs by appType and returns Route elements; test by passing mock AppConfigDto arrays and asserting element counts/props                         |
| FEST-01 | useFileSharingStore tests                                                                                                                                      | 233 lines, uses persist middleware, fetches files via eduApi with WebDAV response processing; needs MSW handlers for file sharing endpoints                                                                     |
| FEST-02 | useMailsStore tests                                                                                                                                            | 123 lines, simple create() store with getMails, getExternalMailProviderConfig, postExternalMailProviderConfig, deleteExternalMailProviderConfig, sync jobs; needs MSW handlers for mail endpoints               |
| FEST-03 | useSurveyEditorPageStore tests                                                                                                                                 | 141 lines, persist middleware, updateOrCreateSurvey and uploadFile actions; needs MSW handlers for survey endpoints                                                                                             |
| FEST-04 | useConferenceStore tests                                                                                                                                       | 118 lines, getConferences, deleteConferences, toggleConferenceRunningState; needs MSW handlers for conference endpoints                                                                                         |
| FEST-05 | useAppConfigsStore tests                                                                                                                                       | 244 lines, persist middleware, CRUD operations plus getConfigFile and uploadFile; needs MSW handlers for appconfig endpoints (some already exist)                                                               |
| FEST-06 | useClassManagementStore tests                                                                                                                                  | 456 lines (largest store), persist middleware, many LMN API endpoints for classes/projects/sessions/rooms/printers; needs extensive MSW handlers                                                                |
| FEST-07 | useUserStore tests                                                                                                                                             | 49 lines (composition of 4 slices via persist middleware); test via slice composition; slices in separate files need individual investigation                                                                   |
| FEST-08 | useSseStore tests                                                                                                                                              | 101 lines, creates EventSource with token, handles reconnection and ping; needs EventSource mock in jsdom                                                                                                       |
| FEHK-01 | useSseEventListener tests                                                                                                                                      | 54 lines, registers/unregisters addEventListener on EventSource from store; test via renderHook + mock EventSource in store                                                                                     |
| FEHK-02 | useKeyboardNavigation tests                                                                                                                                    | 250 lines, complex keyboard handler with arrow keys, Enter, Escape, grid navigation; test with fireEvent.keyDown and assert focusedIndex/focusedFile                                                            |
| FEHK-03 | useNotifications tests                                                                                                                                         | 235 lines, orchestrator hook using many sub-hooks and SSE listeners; test that SSE events trigger correct store calls                                                                                           |
| FEHK-04 | useSidebarItems tests                                                                                                                                          | 88 lines, reads appConfigs from store and builds menu items; test with pre-populated store state                                                                                                                |
| FEHK-05 | useTableActions tests                                                                                                                                          | 38 lines, wrapper around createTableActions with useMemo; test by passing config and selectedRows                                                                                                               |

</phase_requirements>

## Standard Stack

### Core

| Library                     | Version  | Purpose                                     | Why Standard                                                              |
| --------------------------- | -------- | ------------------------------------------- | ------------------------------------------------------------------------- |
| vitest                      | ^3.2.4   | Test runner                                 | Already configured in vite.config.mts, jsdom environment, globals enabled |
| @testing-library/react      | ^16.3.2  | renderHook for hooks, render for components | Standard React testing; provides renderHook                               |
| @testing-library/user-event | ^14.6.1  | Simulating keyboard/mouse events            | Better than fireEvent for realistic event simulation                      |
| @testing-library/jest-dom   | ^6.4.6   | DOM matchers                                | Already imported in vitest.setup.ts                                       |
| msw                         | ^2.12.10 | API mocking                                 | Already set up with server in libs/src/test-utils/msw/                    |
| zustand                     | ^4.5.0   | State management                            | Target of store tests; stores accessed via getState()                     |
| zod                         | ^3.22.4  | Schema validation                           | Target of schema validation tests                                         |

### Supporting

| Library             | Version      | Purpose            | When to Use                                        |
| ------------------- | ------------ | ------------------ | -------------------------------------------------- |
| @vitest/coverage-v8 | ^3.2.4       | Coverage reporting | Already configured, run with npm run coverage      |
| fast-xml-parser     | (transitive) | XML parsing        | Used by mapToDirectoryFiles/parseWebDAVMultiStatus |

## Architecture Patterns

### Test File Organization

```
libs/src/user/utils/getIsAdmin.spec.ts           # co-located with source
libs/src/filesharing/utils/sanitizePath.spec.ts   # co-located with source
apps/frontend/src/utils/handleApiError.spec.ts    # co-located with source
apps/frontend/src/pages/Mail/useMailsStore.spec.ts # co-located with store
apps/frontend/src/hooks/useSseEventListener.spec.ts # co-located with hook
```

### Pattern 1: Pure Utility Test

**What:** Table-driven tests for pure functions
**When to use:** getIsAdmin, processLdapGroups, sanitizePath, convertToWebdavUrl
**Example:**

```typescript
import { describe, it, expect } from 'vitest';
import sanitizePath from './sanitizePath';

describe('sanitizePath', () => {
  it.each([
    ['normal/path.txt', 'normal/path.txt'],
    ['../etc/passwd', 'etc/passwd'],
    ['/leading/slash', 'leading/slash'],
    ['double//slash', 'double/slash'],
    ['special!@#chars', 'specialchars'],
    ['', ''],
  ])('sanitizePath(%s) => %s', (input, expected) => {
    expect(sanitizePath(input)).toBe(expected);
  });
});
```

### Pattern 2: Zustand Store Test with MSW

**What:** Call store actions, assert state transitions, MSW intercepts network
**When to use:** All 8 store tests
**Example:**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import server from '@libs/test-utils/msw/server';
import useMailsStore from './useMailsStore';

const EDU_API_BASE = '/edu-api';

describe('useMailsStore', () => {
  beforeEach(() => {
    useMailsStore.getState().reset();
  });

  it('should fetch mails on success', async () => {
    const mockMails = [{ id: '1', subject: 'Test' }];
    server.use(http.get(`${EDU_API_BASE}/mails`, () => HttpResponse.json(mockMails)));

    await useMailsStore.getState().getMails();

    const state = useMailsStore.getState();
    expect(state.mails).toEqual(mockMails);
    expect(state.isLoading).toBe(false);
  });

  it('should handle error on fetch failure', async () => {
    server.use(http.get(`${EDU_API_BASE}/mails`, () => HttpResponse.error()));

    await useMailsStore.getState().getMails();

    const state = useMailsStore.getState();
    expect(state.isLoading).toBe(false);
    // error state is set via handleApiError
  });
});
```

### Pattern 3: Hook Test with renderHook

**What:** Test hooks via renderHook from @testing-library/react
**When to use:** All 5 hook tests
**Example:**

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useTableActions from './useTableActions';

describe('useTableActions', () => {
  it('should return actions based on config and selected rows', () => {
    const config = {
      /* ... */
    };
    const selectedRows = [];

    const { result } = renderHook(() => useTableActions(config, selectedRows));

    expect(result.current).toEqual(expect.arrayContaining([]));
  });
});
```

### Pattern 4: Browser API Mock

**What:** Mock navigator.clipboard, Canvas, FileReader in jsdom
**When to use:** copyToClipboard, getCompressedImage
**Example:**

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('copyToClipboard', () => {
  it('should copy text when clipboard API available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    copyToClipboard('test-url');

    expect(writeText).toHaveBeenCalledWith('test-url');
  });
});
```

### Anti-Patterns to Avoid

- **Testing implementation details:** Don't assert on internal state mutations; assert on the final public state after actions complete
- **Snapshot testing stores:** Don't snapshot entire store state; assert specific fields that matter
- **Mocking zustand internals:** Don't mock create() or middleware; use real stores with MSW for network
- **Tight coupling to i18n keys:** Mock i18n.t() to return the key itself (already done via cimode in renderWithProviders), verify the key is passed not the translation text
- **Importing @nestjs/common in frontend tests:** parseWebDAVMultiStatus imports Logger from @nestjs/common -- this will fail in frontend vitest; must mock or avoid direct import

## Don't Hand-Roll

| Problem                   | Don't Build                | Use Instead                                   | Why                                           |
| ------------------------- | -------------------------- | --------------------------------------------- | --------------------------------------------- |
| HTTP mocking              | Custom axios interceptors  | MSW server.use()                              | Already set up, matches real request flow     |
| Store reset between tests | Manual state recreation    | store.getState().reset()                      | Every store has reset(), called in beforeEach |
| Hook rendering            | Manual React root creation | renderHook from @testing-library/react        | Handles act() wrapper, re-render, cleanup     |
| Timer mocking             | setTimeout overrides       | vi.useFakeTimers() / vi.advanceTimersByTime() | Vitest built-in, proper cleanup               |
| Event simulation          | Manual dispatchEvent       | fireEvent / userEvent from @testing-library   | Consistent with RTL ecosystem                 |

## Common Pitfalls

### Pitfall 1: MSW onUnhandledRequest: 'error'

**What goes wrong:** vitest.setup.ts sets `onUnhandledRequest: 'error'`, so any API call without a matching handler throws
**Why it happens:** Store tests trigger API calls that aren't covered by defaultHandlers
**How to avoid:** Add store-specific MSW handlers via server.use() in beforeEach or at the top of describe blocks
**Warning signs:** "Request handler not found" errors in test output

### Pitfall 2: Zustand Persist Middleware in Tests

**What goes wrong:** Stores using persist() (useFileSharingStore, useAppConfigsStore, useSurveyEditorPageStore, useClassManagementStore, useUserStore) read from localStorage on creation
**Why it happens:** jsdom provides a localStorage implementation that persists across tests in the same file
**How to avoid:** Call localStorage.clear() in beforeEach, or mock createJSONStorage
**Warning signs:** Tests pass individually but fail when run together; state leaks between tests

### Pitfall 3: parseWebDAVMultiStatus Uses @nestjs/common Logger

**What goes wrong:** Importing mapToDirectoryFiles pulls in parseWebDAVMultiStatus which imports Logger from @nestjs/common -- a Node-only NestJS module
**Why it happens:** Shared libs/ code is used by both API and frontend but has NestJS dependencies
**How to avoid:** Mock the Logger import or test mapToDirectoryFiles by providing pre-parsed data instead of raw XML. Alternatively, use vi.mock('@nestjs/common') to stub it.
**Warning signs:** Module resolution error: Cannot find module '@nestjs/common'

### Pitfall 4: EventSource Not in jsdom

**What goes wrong:** useSseStore creates EventSource which doesn't exist in jsdom
**Why it happens:** jsdom doesn't implement EventSource
**How to avoid:** Create a minimal EventSource mock class and set it on globalThis before SSE store tests
**Warning signs:** "EventSource is not defined" error

### Pitfall 5: handleApiError Toast Side Effects

**What goes wrong:** handleApiError calls toast.error() from sonner and uses a displayedErrors Set for deduplication
**Why it happens:** sonner expects a DOM context and has internal timers
**How to avoid:** Mock 'sonner' module with vi.mock('sonner', ...) providing a mock toast object. Clear displayedErrors between tests if testing deduplication.
**Warning signs:** Warnings about missing DOM elements, or subsequent error tests not showing toast because previous test's error is still in displayedErrors Set

### Pitfall 6: i18n Not Initialized in Utility Tests

**What goes wrong:** Utilities like formatEstimatedTimeRemaining, handleApiError, getDisplayName call i18n.t() directly
**Why it happens:** They import from '@/i18n' which needs initialization
**How to avoid:** Mock i18n.t to return the key (or use vi.mock('@/i18n', ...)), or ensure i18n is initialized in vitest.setup.ts
**Warning signs:** t() returns undefined or empty string

### Pitfall 7: Route Generation Returns JSX Elements

**What goes wrong:** getFramedRoutes, getForwardedAppRoutes, getNativeAppRoutes return React Route elements, not plain objects
**Why it happens:** They use JSX with React.createElement internally
**How to avoid:** Test by checking array length and element props (element.props.path, element.key) rather than rendering. Or render inside a MemoryRouter and assert on DOM output.
**Warning signs:** Cannot read properties of undefined when trying to access route path

## Code Examples

### Zustand Store Test Pattern (Complete)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import server from '@libs/test-utils/msw/server';

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}));

vi.mock('@/i18n', () => ({
  default: { t: (key: string) => key },
  t: (key: string) => key,
}));

// Import store AFTER mocks
import useConferenceStore from './useConferenceStore';

const EDU_API_BASE = '/edu-api';

describe('useConferenceStore', () => {
  beforeEach(() => {
    useConferenceStore.getState().reset();
  });

  describe('getConferences', () => {
    it('should fetch and set conferences', async () => {
      const mockConferences = [
        { meetingID: '1', name: 'Test', isRunning: true },
        { meetingID: '2', name: 'Other', isRunning: false },
      ];
      server.use(http.get(`${EDU_API_BASE}/conferences`, () => HttpResponse.json(mockConferences)));

      await useConferenceStore.getState().getConferences();

      const state = useConferenceStore.getState();
      expect(state.conferences).toHaveLength(2);
      expect(state.runningConferences).toHaveLength(1);
      expect(state.isLoading).toBe(false);
    });

    it('should handle API error', async () => {
      server.use(
        http.get(`${EDU_API_BASE}/conferences`, () => HttpResponse.json({ message: 'Server error' }, { status: 500 })),
      );

      await useConferenceStore.getState().getConferences();

      expect(useConferenceStore.getState().isLoading).toBe(false);
    });
  });
});
```

### EventSource Mock for SSE Tests

```typescript
class MockEventSource {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  readyState = MockEventSource.OPEN;
  url: string;
  private listeners: Map<string, Set<EventListener>> = new Map();

  constructor(url: string) {
    this.url = url;
  }

  addEventListener(type: string, listener: EventListener, options?: { signal?: AbortSignal }) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(listener);
    if (options?.signal) {
      options.signal.addEventListener('abort', () => this.removeEventListener(type, listener));
    }
  }

  removeEventListener(type: string, listener: EventListener) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatchEvent(event: Event): boolean {
    this.listeners.get(event.type)?.forEach((l) => l(event));
    return true;
  }

  close() {
    this.readyState = MockEventSource.CLOSED;
  }
}
```

### Hook Test with Store Pre-population

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import { createAppConfig } from '@libs/test-utils';
import useSidebarItems from './useSidebarItems';

// Wrap in providers for i18n and router
const wrapper = ({ children }) => (
  <MemoryRouter><I18nextProvider i18n={testI18n}>{children}</I18nextProvider></MemoryRouter>
);

describe('useSidebarItems', () => {
  beforeEach(() => {
    useAppConfigsStore.setState({
      appConfigs: [
        createAppConfig({ name: 'filesharing', icon: 'folder', displayLocations: ['sidebar'] }),
      ],
    });
  });

  it('should return sidebar items from app configs', () => {
    const { result } = renderHook(() => useSidebarItems(), { wrapper });
    expect(result.current.length).toBeGreaterThan(0);
  });
});
```

## State of the Art

| Old Approach           | Current Approach                  | When Changed          | Impact                                                  |
| ---------------------- | --------------------------------- | --------------------- | ------------------------------------------------------- |
| enzyme shallow render  | @testing-library/react renderHook | RTL v13+ (2022)       | All hook tests use renderHook                           |
| manual MSW v1 rest.get | MSW v2 http.get + HttpResponse    | MSW 2.0 (2023)        | Already using v2 syntax in codebase                     |
| jest.mock for axios    | MSW server.use() for real axios   | MSW adoption          | Stores use real eduApi, MSW intercepts at network level |
| individual store mocks | Real stores with MSW              | Current best practice | Tests verify full store-API chain                       |

## Validation Architecture

### Test Framework

| Property           | Value                                                                   |
| ------------------ | ----------------------------------------------------------------------- |
| Framework          | Vitest 3.2.x with jsdom                                                 |
| Config file        | apps/frontend/vite.config.mts (test section)                            |
| Quick run command  | `npx vitest run --config apps/frontend/vite.config.mts <specific-file>` |
| Full suite command | `npm run test:frontend`                                                 |

### Phase Requirements -> Test Map

| Req ID  | Behavior                                     | Test Type | Automated Command                                                                                                                         | File Exists? |
| ------- | -------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| FEUT-01 | Lib utility functions produce correct output | unit      | `npx vitest run --config apps/frontend/vite.config.mts libs/src/user/utils/getIsAdmin.spec.ts`                                            | Wave 1       |
| FEUT-02 | Frontend utilities handle normal/error cases | unit      | `npx vitest run --config apps/frontend/vite.config.mts apps/frontend/src/utils/handleApiError.spec.ts`                                    | Wave 1       |
| FEUT-03 | Zod schemas accept valid, reject invalid     | unit      | `npx vitest run --config apps/frontend/vite.config.mts apps/frontend/src/pages/Settings/AppConfig/schemas/getAppConfigFormSchema.spec.ts` | Wave 1       |
| FEUT-04 | Route generators produce correct routes      | unit      | `npx vitest run --config apps/frontend/vite.config.mts apps/frontend/src/router/routes/getFramedRoutes.spec.ts`                           | Wave 1       |
| FEST-01 | File sharing store state transitions         | unit      | `npx vitest run --config apps/frontend/vite.config.mts apps/frontend/src/pages/FileSharing/useFileSharingStore.spec.ts`                   | Wave 2       |
| FEST-02 | Mails store state transitions                | unit      | `npx vitest run --config apps/frontend/vite.config.mts apps/frontend/src/pages/Mail/useMailsStore.spec.ts`                                | Wave 2       |
| FEST-03 | Survey editor store state transitions        | unit      | `npx vitest run --config apps/frontend/vite.config.mts apps/frontend/src/pages/Surveys/Editor/useSurveyEditorPageStore.spec.ts`           | Wave 2       |
| FEST-04 | Conference store state transitions           | unit      | `npx vitest run --config apps/frontend/vite.config.mts apps/frontend/src/pages/ConferencePage/useConferenceStore.spec.ts`                 | Wave 2       |
| FEST-05 | AppConfigs store state transitions           | unit      | `npx vitest run --config apps/frontend/vite.config.mts apps/frontend/src/pages/Settings/AppConfig/useAppConfigsStore.spec.ts`             | Wave 2       |
| FEST-06 | Class management store state transitions     | unit      | `npx vitest run --config apps/frontend/vite.config.mts apps/frontend/src/pages/ClassManagement/useClassManagementStore.spec.ts`           | Wave 2       |
| FEST-07 | User store state transitions                 | unit      | `npx vitest run --config apps/frontend/vite.config.mts apps/frontend/src/store/UserStore/useUserStore.spec.ts`                            | Wave 2       |
| FEST-08 | SSE store connection/reconnect               | unit      | `npx vitest run --config apps/frontend/vite.config.mts apps/frontend/src/store/useSseStore.spec.ts`                                       | Wave 2       |
| FEHK-01 | SSE event listener dispatch                  | unit      | `npx vitest run --config apps/frontend/vite.config.mts apps/frontend/src/hooks/useSseEventListener.spec.ts`                               | Wave 2       |
| FEHK-02 | Keyboard navigation in file browser          | unit      | `npx vitest run --config apps/frontend/vite.config.mts apps/frontend/src/pages/FileSharing/hooks/useKeyboardNavigation.spec.ts`           | Wave 2       |
| FEHK-03 | Notifications SSE event handling             | unit      | `npx vitest run --config apps/frontend/vite.config.mts apps/frontend/src/hooks/useNotifications.spec.ts`                                  | Wave 2       |
| FEHK-04 | Sidebar items from appConfigs                | unit      | `npx vitest run --config apps/frontend/vite.config.mts apps/frontend/src/hooks/useSidebarItems.spec.ts`                                   | Wave 2       |
| FEHK-05 | Table actions from config                    | unit      | `npx vitest run --config apps/frontend/vite.config.mts apps/frontend/src/hooks/useTableActions.spec.ts`                                   | Wave 2       |

### Sampling Rate

- **Per task commit:** `npx vitest run --config apps/frontend/vite.config.mts <changed-spec-file>`
- **Per wave merge:** `npm run test:frontend`
- **Phase gate:** Full suite green before verify-work

### Wave 0 Gaps

None -- Phase 1 infrastructure (MSW server, factories, renderWithProviders, vitest.setup.ts) is already in place. New MSW handlers for specific API endpoints will be created as part of Plan 2 (stores) and Plan 3 (hooks).

## Open Questions

1. **parseWebDAVMultiStatus imports @nestjs/common Logger**
   - What we know: This is a shared lib utility used by both API and frontend
   - What's unclear: Whether vi.mock('@nestjs/common') will resolve correctly in vitest since @nestjs/common is not a frontend dependency
   - Recommendation: Mock the specific import or test mapToDirectoryFiles with pre-parsed response objects, bypassing XML parsing

2. **UserStore slice composition**
   - What we know: useUserStore composes 4 slices (createUserSlice, createTotpSlice, createQrCodeSlice, createUserAccountsSlice)
   - What's unclear: How deep to test -- just the composition or each slice's API calls
   - Recommendation: Test each slice's key actions (authenticate, getUser, etc.) through the composed store, since that's how consumers use it

## Sources

### Primary (HIGH confidence)

- Codebase inspection: all source files read directly (libs/src/_, apps/frontend/src/_)
- vitest.setup.ts: MSW server configuration verified
- vite.config.mts: test configuration verified
- package.json: all dependency versions verified
- Existing test patterns: sampleMsw.spec.ts and cleanAllStores.spec.ts analyzed

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - all libraries already in package.json and configured
- Architecture: HIGH - existing patterns (sampleMsw.spec.ts) provide template
- Pitfalls: HIGH - identified through direct source code inspection

**Research date:** 2026-02-26
**Valid until:** 2026-03-26 (stable infrastructure, no fast-moving dependencies)
