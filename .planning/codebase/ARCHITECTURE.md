# Architecture

**Analysis Date:** 2026-02-26

## Pattern Overview

**Overall:** Nx monorepo with a React SPA frontend and NestJS REST API backend, sharing code through a unified `libs/` layer.

**Key Characteristics:**

- Frontend state is centralized in Zustand stores; all API calls are made from stores (never from components)
- Backend uses NestJS feature modules (controller → service → mongoose schema), each domain is self-contained
- Shared types, constants, and utilities live in `libs/src/` and are consumed by both apps under the `@libs/*` alias
- OIDC authentication flows through the API which proxies Keycloak; JWT RS256 tokens are validated on every API request
- Real-time updates flow backend → frontend via Server-Sent Events (SSE)

## Layers

**Shared Library (`libs/`):**

- Purpose: Domain types, constants, and pure utilities shared between frontend and API
- Location: `libs/src/`
- Contains: TypeScript type definitions, constants files, utility functions — NO React components
- Depends on: Nothing (no cross-layer imports)
- Used by: `apps/frontend/` and `apps/api/`

**UI Kit (`libs/ui-kit/`):**

- Purpose: Minimal design-system primitives (`cn()`, base `Button`)
- Location: `libs/ui-kit/src/`
- Contains: shadcn/Radix-wrapped base components, Tailwind utilities
- Depends on: Nothing
- Used by: `apps/frontend/`

**Frontend (`apps/frontend/`):**

- Purpose: React SPA delivering the full UI
- Location: `apps/frontend/src/`
- Contains: Pages, shared components, Zustand stores, routing, hooks, i18n
- Depends on: `@libs/*`, `@edulution-io/ui-kit`
- Used by: End users via browser

**API (`apps/api/`):**

- Purpose: NestJS REST + SSE + WebSocket server
- Location: `apps/api/src/`
- Contains: Feature modules (controller + service + schema + migrations), auth guards, interceptors, queue workers
- Depends on: `@libs/*`, MongoDB, Redis, Keycloak, BullMQ
- Used by: Frontend via HTTP; external integrations via webhooks

## Data Flow

**Authenticated API Request:**

1. User action triggers a store method in a Zustand store (e.g., `useAppConfigsStore.getAppConfigs()`)
2. Store calls `eduApi` (axios instance at `apps/frontend/src/api/eduApi.ts`) with `Authorization: Bearer <JWT>`
3. Request hits NestJS; `AuthGuard` (`apps/api/src/auth/auth.guard.ts`) verifies JWT using Keycloak RS256 public key
4. `AccessGuard` (`apps/api/src/auth/access.guard.ts`) checks user LDAP groups against app access map
5. Controller delegates to service; service queries MongoDB via Mongoose or calls external APIs
6. Response returns; store updates state; React components re-render

**SSE Real-Time Flow:**

1. Frontend establishes `EventSource` in `useSseStore` (`apps/frontend/src/store/useSseStore.ts`) after login
2. Backend SSE endpoint (`apps/api/src/sse/sse.controller.ts`) keeps connection open per username
3. API services call `SseService.sendEventToUser()` / `sendEventToUsers()` on state changes
4. Frontend `useSseEventListener` hook dispatches incoming events to the relevant Zustand stores

**Background Job Flow (BullMQ):**

1. Service calls `PushNotificationQueue.enqueue(data)` (e.g., `apps/api/src/notifications/queue/push-notification.queue.ts`)
2. BullMQ places job on Redis queue
3. Worker processes job asynchronously (e.g., sends Expo push notifications)

**Authentication Flow:**

1. Frontend uses `react-oidc-context` / `oidc-client-ts` with authority pointing to `<API>/auth`
2. API `AuthService` (`apps/api/src/auth/auth.service.ts`) proxies OIDC to Keycloak, adding MFA/TOTP check
3. JWT is stored in Zustand `UserStore` (persisted to `localStorage`) and set as axios default header

**State Management:**

- All client state lives in Zustand stores (one per feature/domain, co-located in the feature's `pages/` directory)
- Global cross-feature stores are in `apps/frontend/src/store/`
- All stores expose a `reset()` method; `cleanAllStores()` (`apps/frontend/src/store/utils/cleanAllStores.ts`) resets every store on logout
- Some stores use `zustand/middleware persist` to survive page reload (e.g., `UserStore`, `useAppConfigsStore`)

## Key Abstractions

**NestJS Feature Module:**

- Purpose: Encapsulates a single domain's controller, service, schema, and migrations
- Examples: `apps/api/src/bulletinboard/`, `apps/api/src/surveys/`, `apps/api/src/conferences/`
- Pattern: `[name].module.ts` imports Mongoose schema + sibling modules; `[name].controller.ts` handles HTTP; `[name].service.ts` contains logic; `[name].schema.ts` is the Mongoose document

**Zustand Feature Store:**

- Purpose: Holds a page/domain's state and all its API calls
- Examples: `apps/frontend/src/pages/FileSharing/useFileSharingStore.ts`, `apps/frontend/src/pages/Settings/AppConfig/useAppConfigsStore.ts`
- Pattern: `create<StoreType>((set, get) => ({ ...initialState, reset: () => set(initialState), actionName: async () => { try { const { data } = await eduApi.get(...); set({ ... }); } catch (e) { handleApiError(e, set); } } }))`

**Shared Lib Domain Module:**

- Purpose: Provides types, constants, and utils shared by both apps for a feature
- Examples: `libs/src/bulletinBoard/`, `libs/src/appconfig/`, `libs/src/user/`
- Pattern: Subdirs `constants/`, `types/`, `utils/`; barrel `index.ts` not always present — import sub-files directly

**CustomHttpException:**

- Purpose: Typed HTTP error that auto-logs at appropriate level
- Location: `apps/api/src/common/CustomHttpException.ts`
- Pattern: `throw new CustomHttpException(ErrorMessages.SomeError, HttpStatus.NOT_FOUND, data, ServiceName.name)`

**AppConfig-Driven Routing:**

- Purpose: Frontend routes and menu items are generated at runtime from `AppConfigDto[]` fetched from the API
- Key files: `apps/frontend/src/router/createRouter.tsx`, `apps/frontend/src/router/routes/getNativeAppRoutes.tsx`
- Pattern: Route arrays `getFramedRoutes(appConfigs)`, `getForwardedAppRoutes(appConfigs)`, `getNativeAppRoutes(appConfigs)` filter the config list to render only enabled apps

## Entry Points

**Frontend Bootstrap:**

- Location: `apps/frontend/src/main.tsx`
- Triggers: Vite HTML bootstrap (`apps/frontend/index.html`)
- Responsibilities: Mounts React root, initializes Sentry from localStorage, applies initial theme

**Frontend App Root:**

- Location: `apps/frontend/src/App.tsx`
- Triggers: React render
- Responsibilities: Wraps tree with `AuthProvider` (OIDC), `CookiesProvider`, `HelmetProvider`, `TooltipProvider`, mounts `AppRouter` and `Toaster`

**Frontend Router:**

- Location: `apps/frontend/src/router/AppRouter.tsx` → `createRouter.tsx`
- Triggers: Auth state + `appConfigs` changes
- Responsibilities: Creates `BrowserRouter`, splits public/private/auth routes, renders `AppLayout` shell

**App Layout Shell:**

- Location: `apps/frontend/src/components/structure/layout/AppLayout.tsx`
- Triggers: Route navigation
- Responsibilities: Renders `MenuBar`, `Sidebar`, `Outlet` (page content), `Overlays`; shows `OfflineBanner` when API is unhealthy

**API Bootstrap:**

- Location: `apps/api/src/main.ts`
- Triggers: `node` process start (`npm run api`)
- Responsibilities: Creates NestExpressApplication, registers global prefix (`EDU_API_ROOT`), sets global filters (HttpException, PayloadTooLarge, NotFound, Multer), sets up Swagger in development, listens on `EDUI_PORT`

**API Root Module:**

- Location: `apps/api/src/app/app.module.ts`
- Triggers: NestJS bootstrap
- Responsibilities: Imports all feature modules, registers global guards (`AuthGuard`, `AccessGuard`) and `LoggingInterceptor` as app-level providers

## Error Handling

**Strategy:**

- API: All errors thrown as `CustomHttpException` (typed, auto-logged); global exception filters catch unhandled errors
- Frontend: All store API calls wrapped in try/catch calling `handleApiError(e, set)` which shows a `sonner` toast and sets `error` in the store

**API Patterns:**

- `throw new CustomHttpException(ErrorMessage, HttpStatus, data?, context?)` — for expected errors in services/guards
- Global filters at `apps/api/src/filters/` handle: `HttpException`, Express HTTP errors, Multer errors, 404s, payload-too-large
- Errors < 500 are logged as `debug` in production; >= 500 as `warn`

**Frontend Patterns:**

- `handleApiError(e, set)` at `apps/frontend/src/utils/handleApiError.ts` — call in every store catch block
- Deduplicates toast messages using a `Set` to prevent duplicate error popups
- `LazyErrorBoundary` at `apps/frontend/src/components/LazyErrorBoundary.tsx` wraps the entire app as last resort

## Cross-Cutting Concerns

**Logging:** NestJS static `Logger` calls with service class name as context. Log level controlled by `EDUI_LOG_LEVEL` env var (warn/debug/verbose). `LoggingInterceptor` logs all HTTP requests/responses at configurable verbosity.

**Validation:** API uses `ValidatePathPipe` for file paths. Frontend uses zod schemas in settings forms (e.g., `apps/frontend/src/pages/Settings/AppConfig/schemas/`).

**Authentication:** JWT RS256 verified on every request by `AuthGuard`. App-level access controlled by `AccessGuard` reading user LDAP groups vs. `AppConfigService.appAccessMap`. Admin status checked via `getIsAdmin()` from `@libs/user/utils/getIsAdmin`.

**Migrations:** Per-module migration lists (e.g., `apps/api/src/bulletinboard/migrations/`) run via `MigrationService.runMigrations()` in `OnModuleInit`. Schema version is tracked per document; migrations must increase `schemaVersion`.

---

_Architecture analysis: 2026-02-26_
