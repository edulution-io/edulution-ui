# Coding Conventions

**Analysis Date:** 2026-02-26

## Naming Patterns

**Files:**

- React components: PascalCase matching default export name (`DashboardPage.tsx`, `WarningBox.tsx`)
- Stores: camelCase with `use` prefix (`useGroupStore.ts`, `useUserStore.ts`, `useFileSharingStore.ts`)
- Zustand slices: `create[Domain]Slice.ts` (`createUserSlice.ts`, `createTotpSlice.ts`)
- NestJS services: `[domain].service.ts` (`users.service.ts`, `appconfig.service.ts`)
- NestJS controllers: `[domain].controller.ts`
- Schemas: `[domain].schema.ts`
- DTOs: `[domain].dto.ts`, `[action]-[domain].dto.ts` (`update-user.dto.ts`)
- Mock files for tests: `[service].mock.ts` or `[service].service.mock.ts` co-located with source
- Constants: SCREAMING_SNAKE_CASE for the value (`APP_INTEGRATION_VARIANT`, `EDU_API_GROUPS_ENDPOINT`)
- Type/interface files: camelCase or PascalCase descriptive (`multipleSelectorGroup.ts`, `jwtUser.ts`)

**Functions:**

- camelCase for all functions and methods
- React hooks: `use` prefix mandatory (`useGroupStore`, `useUserStore`)
- Event handlers: descriptive names (`handleApiError`, `createOrUpdate`, `toggleConferenceIsRunning`)

**Variables:**

- camelCase for local variables
- SCREAMING_SNAKE_CASE for module-level constants
- Prefixed with `mock` for test data (`mockUser`, `mockGroupsService`, `mockAppConfig`)
- Prefixed with `initial` for Zustand initial state objects (`initialState`)

**Types and Interfaces:**

- PascalCase for all types, interfaces, and classes
- Props interfaces: `[ComponentName]Props` (`WarningBoxProps`)
- Store types defined inline with `type [Name]Store = { ... }`
- DTOs as classes decorated with NestJS decorators

## Code Style

**Formatting (Prettier):**

- 2-space indentation, no tabs
- 120-column print width
- Single quotes for JS/TS, double quotes for JSON/CSS/HTML
- Trailing commas in all positions
- Semicolons required
- LF line endings
- One JSX attribute per line (`singleAttributePerLine: true`)
- Tailwind class order enforced via `prettier-plugin-tailwindcss`

**Linting (ESLint):**

- Extends: `airbnb`, `airbnb-typescript`, `react/recommended`, `jsx-a11y/recommended`, `@typescript-eslint/recommended`
- React components MUST be arrow functions (not function declarations)
- Prop spreading allowed (`react/jsx-props-no-spreading: off`)
- `prop-types` not required (TypeScript handles this)
- `console` allowed only for `info`, `warn`, `error` — not `log` or `debug`
- Unused vars allowed if prefixed with `_`
- `no-void` allowed as a statement (for fire-and-forget promises)

## Import Organization

**Order (enforced by eslint-plugin-import):**

1. External packages (`react`, `zustand`, `@nestjs/*`, `axios`)
2. `@libs/*` (shared libs via path alias)
3. `@/` (frontend src alias — components, utils, stores, pages)
4. Relative imports (same-module files)

**Path Aliases:**

- `@/` → `apps/frontend/src/`
- `@libs` → `libs/src/`
- `@edulution-io/ui-kit` → `libs/ui-kit/src/index.ts`

**Rules:**

- Default export at the bottom of every file
- `index.ts` barrel files may use named exports only (ESLint override)
- Never use `React.useEffect` syntax — always destructure hooks: `import { useEffect } from 'react'`

## License Headers

Every source file (`.ts`, `.tsx`) must begin with the Netzint dual-license header block (AGPL/commercial). This is enforced by the `addLicenseHeader` pre-commit script.

## Error Handling

**Frontend (Zustand stores):**

- All API calls wrapped in try/catch/finally
- `handleApiError(error, set, 'errorFieldName')` called in catch block — `apps/frontend/src/utils/handleApiError.ts`
- `set({ isLoading: false })` always called in finally
- Error messages shown via `sonner` toast (handled inside `handleApiError`)
- Loading state pattern: `set({ xIsLoading: true })` before request, `set({ xIsLoading: false })` in finally

```typescript
const doSomething = async () => {
  set({ xError: null, xIsLoading: true });
  try {
    const response = await eduApi.get<ResponseType>(ENDPOINT);
    set({ data: response.data });
  } catch (error) {
    handleApiError(error, set, 'xError');
  } finally {
    set({ xIsLoading: false });
  }
};
```

**Backend (NestJS services):**

- Throw `CustomHttpException` (`apps/api/src/common/CustomHttpException.ts`) — never plain `Error` or generic `HttpException`
- `CustomHttpException` automatically logs and formats errors with domain context
- Error messages are typed enums (e.g., `UserErrorMessages`, `AppConfigErrorMessages`) with dot-separated keys (`users.errors.notFoundError`)
- Static `Logger` calls with service name as context: `Logger.warn('msg', UsersService.name)` — never instantiate `new Logger()`

```typescript
throw new CustomHttpException(UserErrorMessages.NotFoundError, HttpStatus.NOT_FOUND, undefined, UsersService.name);
```

## Logging (NestJS)

**Framework:** `@nestjs/common` `Logger` static methods

**Patterns:**

- `Logger.log(msg, ServiceName.name)` — general info (startup, success)
- `Logger.warn(msg, ServiceName.name)` — expected-but-notable conditions
- `Logger.error(msg, error, ServiceName.name)` — caught exceptions
- `Logger.debug(msg, ServiceName.name)` — low-level traces
- `Logger.verbose(msg, ServiceName.name)` — high-frequency details
- Never create `private readonly logger = new Logger(...)` instances

## API Calls (Frontend)

- Use `eduApi` (configured axios instance) from `@/api/eduApi` — never use native `fetch`
- API calls belong exclusively in Zustand stores, not in React components or hooks
- Blob responses: pass `responseType: ResponseType.BLOB` (from `@libs/common/types/http-methods`)
- Query parameters: use axios `params` option, never manual `URLSearchParams`

## React Component Patterns

**Structure:**

- Arrow function components only, typed as `React.FC` or with explicit props type
- Props destructured in function signature with explicit type annotation
- Default export at file bottom
- `cn()` from `@edulution-io/ui-kit` for all conditional className logic

**UI Components:**

- shadcn/Radix UI primitives wrapped in custom components with `SH` suffix (`CardSH`, `DropdownMenuSH`)
- Always use the project's `*SH` wrappers, never use Radix UI primitives or shadcn components directly
- Icons: only `@fortawesome/free-solid-svg-icons`

## Constants vs Enums

**Preferred pattern** — `as const` object with derived type:

```typescript
const APP_INTEGRATION_VARIANT = {
  NATIVE: 'native',
  FORWARDING: APPS.FORWARDING,
} as const;
export default APP_INTEGRATION_VARIANT;
```

**Enum pattern still present** in older libs code (39 enums vs 144 `as const` objects in `libs/src`). New code should use `const` objects.

## Module Organization

**Shared code:** All utility functions, types, and constants go in `libs/src/` or `libs/ui-kit/src/`, organized by domain (`libs/src/user/`, `libs/src/appconfig/`, etc.)

**UI components:** Never moved to `libs/`; stay in `apps/frontend/src/components/`

**Barrel files:** Domain-level `index.ts` files export from `libs/`

**Zustand stores:** All new stores must be registered in `apps/frontend/src/store/utils/cleanAllStores.ts`

## Comments

**Policy:** No inline comments in code (per project guidelines). Use self-documenting variable/function names.

**Exceptions (present in codebase):**

- `/* eslint-disable */` directives where TypeScript conflicts are unavoidable (test files)
- JSDoc not used

---

_Convention analysis: 2026-02-26_
