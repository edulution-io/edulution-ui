# Plan 04-01 Summary: Component Behavioral Tests

## Status: COMPLETE

## What was done

Created 9 component behavioral test spec files with 62 tests total, covering the major UI components in the edulution-ui frontend.

## Files Created

| File                                                                             | Tests | Component                                                                |
| -------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------ |
| `apps/frontend/src/components/shared/MenuBar.spec.tsx`                           | 10    | MenuBar (collapse/expand, mobile overlay, active state, click)           |
| `apps/frontend/src/components/ui/Sidebar/Sidebar.spec.tsx`                       | 7     | Sidebar (desktop/mobile/tablet switching, edulutionApp, notifications)   |
| `apps/frontend/src/components/structure/layout/AppLayout.spec.tsx`               | 8     | AppLayout (Outlet rendering, conditional MenuBar/Sidebar, OfflineBanner) |
| `apps/frontend/src/pages/LoginPage/LoginPage.spec.tsx`                           | 8     | LoginPage (form rendering, validation, credentials, QR code, loading)    |
| `apps/frontend/src/components/ui/Table/ScrollableTable.spec.tsx`                 | 8     | ScrollableTable (columns, rows, filtering, search, loading, empty state) |
| `apps/frontend/src/pages/Surveys/Tables/CreatedSurveysPage.spec.tsx`             | 6     | CreatedSurveysPage (mount calls, loading, SurveyTablePage props)         |
| `apps/frontend/src/pages/Surveys/Participation/SurveyParticipationPage.spec.tsx` | 6     | SurveyParticipationPage (no surveyId, loading, not found, survey found)  |
| `apps/frontend/src/pages/FileSharing/FileSharingPage.spec.tsx`                   | 6     | FileSharingPage (breadcrumb, table, quota, loading, file preview)        |
| `apps/frontend/src/pages/Mail/MailPage.spec.tsx`                                 | 3     | MailPage (NativeFrame rendering, APPS.MAIL prop)                         |

## Key Technical Decisions

1. **Mock child components for deep dependency trees**: Components like Sidebar, AppLayout, and CreatedSurveysPage have deep transitive dependency chains that cause test collection to hang. Solution: mock child components (DesktopSidebar, MobileSidebar, NotificationPanel, SurveyTablePage, etc.) as simple test divs.

2. **Use `@/` paths for `vi.mock` in Nx projects**: The `nxViteTsPaths()` Vite plugin resolves `@/` alias paths to different internal module IDs than `./` relative paths. Mocks MUST use the same path format as the source file's imports. When the component uses `@/pages/Surveys/Tables/SurveyTablePage`, the mock must also use `@/pages/Surveys/Tables/SurveyTablePage`, not `./SurveyTablePage`.

3. **Avoid Proxy-based mocks for `@/assets/icons`**: Vitest wraps mock module returns in its own Proxy for export validation. A Proxy returned from `vi.mock` gets double-wrapped and causes infinite hangs. Use explicit named exports instead: `vi.mock('@/assets/icons', () => ({ SurveysViewOwnIcon: () => null }))`.

4. **Use `vi.fn()` for Zustand store mocks**: Instead of manually implementing `setState`/`subscribe`/`getState`, mock stores as `vi.fn().mockReturnValue({...})` and control state via `mockReturnValue()` in `beforeEach`.

5. **Polyfill jsdom gaps**: Added `window.matchMedia` (for usehooks-ts), `EventSource` (for LoginPage QR code SSE), and mocked `react-helmet-async`/`sonner` as standard boilerplate.

6. **`vi.hoisted()` for mock function references**: When `vi.mock` factory functions need to reference mock functions, use `vi.hoisted()` to declare them, since `vi.mock` factories are hoisted above `const` declarations.

## Test Run Results

```
Test Files  42 passed (42)
Tests       350 passed (350)
Duration    14.35s
```

Zero regressions. All 62 new tests plus 288 existing tests pass.

## Commit

Staged but not yet committed (user denied commit permission). 9 files, 1297 insertions.
