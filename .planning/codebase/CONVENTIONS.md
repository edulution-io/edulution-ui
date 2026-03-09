# Coding Conventions

**Analysis Date:** 2026-03-09

## Naming Patterns

**Files:**

- File name MUST match the default export name (enforced by `scripts/checkFilenames.ts` pre-commit hook)
- Allowed suffixes that are stripped during matching: `decorator`, `schema`, `module`, `service`, `enum`
- React components: PascalCase (`DashboardPage.tsx`, `AccountInformation.tsx`)
- Zustand stores: `use{Name}Store.ts` (e.g., `useFileSharingStore.ts`, `useSidebarStore.ts`)
- Zustand slices: `create{Name}Slice.ts` (e.g., `createUserSlice.ts`, `createTotpSlice.ts`)
- NestJS services/controllers: kebab-case with suffix (`users.service.ts`, `users.controller.ts`)
- NestJS schemas: kebab-case with `.schema.ts` suffix (`user.schema.ts`, `conference.schema.ts`)
- NestJS modules: kebab-case with `.module.ts` suffix (`users.module.ts`)
- DTOs: kebab-case with `.dto.ts` suffix in a `dto/` subdirectory (`dto/update-user.dto.ts`)
- Constants: kebab-case files (`user-error-messages.ts`, `cacheTtl.ts`)
- Mocks: `{name}.mock.ts` (e.g., `groups.service.mock.ts`, `cacheManagerMock.ts`)
- Spec files: `{name}.spec.ts` (e.g., `users.service.spec.ts`)

**Functions:**

- Use camelCase for all functions and methods
- React components: PascalCase arrow functions (`const DashboardPage: React.FC = () => ...`)
- Store actions: camelCase verbs (`createOrUpdateUser`, `getUser`, `toggleMobileSidebar`)

**Variables:**

- camelCase for local variables and instance properties
- UPPER_SNAKE_CASE for constants (`EDU_API_USERS_ENDPOINT`, `ALL_USERS_CACHE_KEY`, `KEYCLOAK_STARTUP_TIMEOUT_MS`)
- Prefix unused parameters with underscore (`_param`) - enforced by ESLint

**Types:**

- Use const objects and derived types instead of enums (project preference, though some legacy enums exist like `UserErrorMessages`)
- PascalCase for interfaces, types, and classes
- DTOs: `{Name}Dto` suffix (`UserDto`, `UpdateUserDto`, `CreateConferenceDto`)

## Code Style

**Formatting:**

- Prettier via `prettier.config.js`
- 2-space indentation, no tabs
- 120 character print width
- Single quotes for TS/JS, double quotes for CSS/HTML/JSON
- Trailing commas everywhere (`trailingComma: 'all'`)
- LF line endings
- Single attribute per line in JSX (`singleAttributePerLine: true`)
- Bracket NOT on same line (`bracketSameLine: false`)
- Tailwind CSS class sorting via `prettier-plugin-tailwindcss`
- Run with `npm run format` (uses `pretty-quick --staged`)

**Linting:**

- ESLint with Airbnb + TypeScript config (`.eslintrc.json`)
- Key rules:
  - `no-console`: error, except `info`, `warn`, `error`
  - `react/function-component-definition`: arrow functions only
  - `react/jsx-props-no-spreading`: off (spreading allowed)
  - `react/prop-types`: off (TypeScript handles this)
  - `@typescript-eslint/no-unused-vars`: error, with `_` prefix ignore pattern
  - `import/prefer-default-export`: off for `index.ts` barrel files
- Lint staged files: `npm run lint:staged` (via `lint-staged.config.js`)
- Lint specific file: `npx eslint path/to/file.ts --quiet`
- Full lint: `npm run lint`

## License Header

Every `.ts` and `.tsx` file MUST include the Netzint GmbH AGPL/commercial dual-license header at the top. This is enforced by `scripts/addLicenseHeader.ts` run in the pre-commit hook. The header is 18 lines starting with `/*` and ending with `*/`.

## Comments

**Policy:** Never add comments in code. The codebase enforces a no-comment culture. Code should be self-documenting through clear naming.

**Exceptions:** `eslint-disable` directives are acceptable when necessary (e.g., `/* eslint-disable @typescript-eslint/unbound-method */` in test files).

## Import Organization

**Order:**

1. External library imports (React, NestJS, third-party)
2. Shared library imports (`@libs/*`)
3. Local/relative imports (`./`, `../`)

**Path Aliases:**

- `@/*` maps to `apps/frontend/src/*`
- `@libs/*` maps to `libs/src/*`
- `@edulution-io/ui-kit` maps to `libs/ui-kit/src/index.ts`

**Rules:**

- Import React hooks directly at the top of the file: `import { useEffect, useState } from 'react'`
- Do NOT use `React.useEffect` syntax
- Use `import { cn } from '@edulution-io/ui-kit'` for the className utility

## Default Exports

**Policy:** Prefer default exports over named exports. Place `export default` at the end of the file.

```typescript
// Pattern: NestJS service
@Injectable()
class UsersService {
  // ...
}

export default UsersService;
```

```typescript
// Pattern: React component
const DashboardPage: React.FC = () => {
  // ...
};

export default DashboardPage;
```

```typescript
// Pattern: Zustand store
const useUserStore = create<UserStore>()(/* ... */);

export default useUserStore;
```

**Exception:** `index.ts` barrel files use named exports (ESLint rule override).

## Error Handling

**API (NestJS):**

- Use `CustomHttpException` from `apps/api/src/common/CustomHttpException.ts` for all HTTP errors
- Pass an `ErrorMessage` type string (i18n key), `HttpStatus`, optional data, and optional domain name
- Error messages are defined as const objects/enums in `libs/src/{module}/constants/{module}-error-messages.ts`
- All error message types are unified via `libs/src/error/errorMessage.ts`

```typescript
throw new CustomHttpException(AuthErrorMessages.Unauthorized, HttpStatus.FORBIDDEN, undefined, UsersController.name);
```

**Frontend (React/Zustand):**

- Use `handleApiError` from `apps/frontend/src/utils/handleApiError.ts` in store actions
- Pattern: try/catch with `handleApiError(error, set, 'errorFieldName')`
- Shows toast notification via `sonner` with i18n-translated error message
- Deduplicates error toasts using a `Set`

```typescript
const createUserSlice: StateCreator<UserStore, [], [], UserSlice> = (set, get) => ({
  createOrUpdateUser: async (user: UserDto) => {
    set({ userIsLoading: true });
    try {
      const { data } = await eduApi.post<UserDto>(EDU_API_USERS_ENDPOINT, user);
      set({ user: data });
      return data;
    } catch (error) {
      handleApiError(error, set, 'userError');
      return undefined;
    } finally {
      set({ userIsLoading: false });
    }
  },
});
```

## Logging

**NestJS API:**

- Use static `Logger` calls with the service/controller name as context
- Pattern: `Logger.log('message', ServiceName.name)`, `Logger.error('message', ServiceName.name)`, `Logger.warn('message', ServiceName.name)`
- Do NOT create instance loggers with `private readonly logger = new Logger()`

**Frontend:**

- Use `console.error()`, `console.warn()`, `console.info()` only (no `console.log`)
- Enforced by ESLint `no-console` rule

## API Calls (Frontend)

- Use `eduApi` (axios instance) from `apps/frontend/src/api/eduApi.ts` for all API calls
- Do NOT use native `fetch`
- Place API calls in Zustand store actions, NOT in components
- Use `ResponseType.BLOB` for blob responses
- Use axios built-in `params` option instead of manual `URLSearchParams`
- API endpoint constants live in `libs/src/{module}/constants/{module}ApiEndpoints.ts`

## Zustand Store Patterns

**Simple stores** (single file):

```typescript
// apps/frontend/src/components/ui/Sidebar/useSidebarStore.ts
const initialState = {
  isMobileSidebarOpen: false,
};

const useSidebarStore = create<UseSidebarStore>((set) => ({
  ...initialState,
  reset: () => set(initialState),
  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
}));

export default useSidebarStore;
```

**Complex stores** (slice pattern):

```typescript
// apps/frontend/src/store/UserStore/useUserStore.ts
const useUserStore = create<UserStore>()(
  persist(
    (set, get, store) => ({
      ...createUserSlice(set, get, store),
      ...createTotpSlice(set, get, store),
    }),
    { name: 'user-storage', storage: createJSONStorage(() => localStorage) },
  ),
);
```

**Every store MUST:**

- Have a `reset()` method that restores `initialState`
- Be registered in `apps/frontend/src/store/utils/cleanAllStores.ts`

## UI Components

- Use shadcn/radix-ui wrappers with `SH` suffix (e.g., `AccordionSH.tsx`, `DropdownMenuSH.tsx`, `CardSH.tsx`)
- Use `cn()` from `@edulution-io/ui-kit` for className composition (clsx + tailwind-merge)
- Use only `@fortawesome/free-solid-svg-icons` for icons
- React components MUST be arrow functions (enforced by ESLint)

## Constants

- No magic strings - always define constants in `libs/src/{module}/constants/`
- Use UPPER_SNAKE_CASE for constant names
- One constant per file is common

## Pre-Commit Checks

The `.husky/pre-commit` hook runs (in parallel where possible):

1. `check-circular-deps` - Circular dependency detection via `madge`
2. `check-translations` - Translation key completeness
3. `check-error-message-translations` - Error message translation coverage
4. `check-filenames` - Filename matches default export name
5. `addLicenseHeader` - Adds license header to new files
6. `format` - Prettier formatting via `pretty-quick --staged`
7. `lint:staged` - ESLint on staged files

## Shared Code

- Utility functions, types, and constants go in `libs/src/`
- Do NOT place UI components in `libs/` (use `apps/frontend/src/components/` instead)
- The `libs/ui-kit/` package contains reusable UI primitives (`cn`, `Button`, etc.)

---

_Convention analysis: 2026-03-09_
