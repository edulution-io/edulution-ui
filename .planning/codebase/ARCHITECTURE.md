# Architecture

**Analysis Date:** 2026-03-09

## Pattern Overview

**Overall:** Nx Monorepo with separate Frontend (React SPA) and Backend (NestJS REST API) applications, sharing types, constants, and utilities through a `libs/` package.

**Key Characteristics:**

- Two-app monorepo: `apps/frontend` (React + Vite) and `apps/api` (NestJS + Webpack)
- Shared library layer (`libs/`) for types, constants, and utility functions consumed by both apps
- NestJS modular architecture on the backend with domain-based modules
- Frontend uses Zustand for state management with co-located stores per page/feature
- OIDC-based authentication with JWT tokens verified via RS256 public key
- MongoDB (Mongoose) for persistence, Redis for caching and job queues (BullMQ)
- Server-Sent Events (SSE) for real-time server-to-client communication
- WebSocket support for collaborative features (tldraw whiteboard sync)

## Layers

**Frontend Presentation Layer:**

- Purpose: Renders the UI, handles user interaction, manages routing
- Location: `apps/frontend/src/`
- Contains: React components, pages, router, hooks
- Depends on: Zustand stores, `libs/` shared types/constants, `eduApi` (axios)
- Used by: End users via browser

**Frontend State Layer (Zustand Stores):**

- Purpose: Manages application state and API communication
- Location: `apps/frontend/src/store/` (global stores) and co-located `use*Store.ts` files within page directories
- Contains: Zustand stores with slices pattern, API calls via `eduApi`
- Depends on: `apps/frontend/src/api/eduApi.ts`, `libs/` types
- Used by: React components and hooks

**API Controller Layer:**

- Purpose: HTTP request handling, input validation, route definition
- Location: `apps/api/src/<module>/<module>.controller.ts`
- Contains: NestJS controllers with decorators for auth, Swagger, file upload
- Depends on: Service layer, guards, decorators, interceptors
- Used by: Frontend via HTTP requests

**API Service Layer:**

- Purpose: Business logic, data access, external service integration
- Location: `apps/api/src/<module>/<module>.service.ts`
- Contains: NestJS injectable services with Mongoose model injection
- Depends on: Mongoose models/schemas, external APIs (LMN, Keycloak, WebDAV)
- Used by: Controllers, other services, queue processors

**API Infrastructure Layer:**

- Purpose: Cross-cutting concerns (auth, logging, error handling, caching)
- Location: `apps/api/src/common/`, `apps/api/src/auth/`, `apps/api/src/filters/`
- Contains: Guards, decorators, interceptors, exception filters, pipes
- Depends on: JWT, Redis cache, Mongoose
- Used by: All controllers via global registration or decorator application

**Shared Library Layer:**

- Purpose: Types, constants, and utilities shared between frontend and API
- Location: `libs/src/`
- Contains: TypeScript types/interfaces, constant values, pure utility functions
- Depends on: Nothing (leaf dependency)
- Used by: Both `apps/frontend` and `apps/api` via `@libs/*` path alias

**UI Kit Layer:**

- Purpose: Shared low-level UI primitives
- Location: `libs/ui-kit/src/`
- Contains: Base components (e.g., `Button.tsx`), utility functions (e.g., `cn()` for classNames)
- Depends on: shadcn/radix-ui primitives
- Used by: Frontend components via `@edulution-io/ui-kit` alias

## Data Flow

**Authenticated API Request:**

1. Frontend component calls a Zustand store action
2. Store action uses `eduApi` (axios) with JWT bearer token to call `EDU_API_URL/<endpoint>`
3. Request hits NestJS with global `AuthGuard` verifying JWT via RS256 public key (`data/edulution.pem`)
4. `AccessGuard` checks user's LDAP groups against app access configuration (with in-memory cache)
5. Controller delegates to service, which queries MongoDB via Mongoose or calls external APIs
6. Response flows back through interceptors (LoggingInterceptor) to the frontend
7. Store updates state, React re-renders

**Real-Time Updates (SSE):**

1. Frontend establishes SSE connection via `useSseStore`
2. `apps/api/src/sse/sse.controller.ts` holds the connection open
3. Backend services emit events through `apps/api/src/sse/sse.service.ts`
4. Frontend `useSseEventListener` hook processes incoming events and updates relevant stores

**WebSocket Collaboration (tldraw):**

1. Frontend connects via WebSocket for whiteboard sync
2. `apps/api/src/tldraw-sync/tldraw-sync.gateway.ts` handles WebSocket connections
3. Room-based sync with MongoDB persistence via `tldraw-sync-room.schema.ts`

**Background Job Processing:**

1. Service enqueues a job via BullMQ (Redis-backed)
2. Queue processors in `apps/api/src/<module>/queue/` consume jobs asynchronously
3. Results stored in MongoDB or communicated via SSE

- Used in: `apps/api/src/groups/queue/`, `apps/api/src/lmnApi/queue/`, `apps/api/src/notifications/queue/`

**State Management:**

- Zustand stores with `persist` middleware for critical state (user session persisted to localStorage)
- Stores are co-located with their page/feature (e.g., `apps/frontend/src/pages/FileSharing/useFileSharingStore.ts`)
- Global stores in `apps/frontend/src/store/` (UserStore, SseStore, ThemeStore, etc.)
- All stores must implement a `reset()` method and be registered in `apps/frontend/src/store/utils/cleanAllStores.ts`
- Composite stores use slice pattern (e.g., `useUserStore` combines `createUserSlice`, `createTotpSlice`, etc.)

## Key Abstractions

**NestJS Module:**

- Purpose: Encapsulates a domain feature (controller + service + schema + migrations)
- Examples: `apps/api/src/surveys/surveys.module.ts`, `apps/api/src/users/users.module.ts`, `apps/api/src/filesharing/filesharing.module.ts`
- Pattern: Each module has `<name>.module.ts`, `<name>.controller.ts`, `<name>.service.ts`, `<name>.schema.ts` (optional migrations/ subdirectory)

**Mongoose Schema:**

- Purpose: Defines MongoDB document structure
- Examples: `apps/api/src/surveys/survey.schema.ts`, `apps/api/src/users/user.schema.ts`
- Pattern: Mongoose schemas with decorators, co-located with their module

**Migration:**

- Purpose: Schema evolution for MongoDB documents
- Examples: `apps/api/src/surveys/migrations/`, `apps/api/src/bulletinboard/migrations/`
- Pattern: Sequential migrations run via `apps/api/src/migration/migration.service.ts`, each module manages its own migrations directory

**CustomHttpException:**

- Purpose: Standardized error handling with logging
- Location: `apps/api/src/common/CustomHttpException.ts`
- Pattern: Wraps NestJS `HttpException` with automatic logging, uses `ErrorMessage` type from `@libs/error/errorMessage`

**PageLayout:**

- Purpose: Consistent page wrapper with header, floating buttons bar, and footer
- Location: `apps/frontend/src/components/structure/layout/PageLayout.tsx`
- Pattern: Each page wraps its content in `<PageLayout>` with optional `nativeAppHeader` props

**eduApi (axios instance):**

- Purpose: Centralized HTTP client for all frontend-to-API communication
- Location: `apps/frontend/src/api/eduApi.ts`
- Pattern: Pre-configured axios instance with base URL; authorization header set globally in `App.tsx`

## Entry Points

**API Server:**

- Location: `apps/api/src/main.ts`
- Triggers: `npm run api` (starts NestJS on port 3001 in dev)
- Responsibilities: Bootstrap NestJS app, configure CORS, Helmet, global filters, WebSocket adapter, Swagger (dev only), create required directories

**Frontend App:**

- Location: `apps/frontend/src/main.tsx`
- Triggers: `npm run dev` (Vite dev server on port 5173)
- Responsibilities: Initialize Sentry, theme, render React root with `<App />`

**App Component:**

- Location: `apps/frontend/src/App.tsx`
- Triggers: Rendered by `main.tsx`
- Responsibilities: OIDC AuthProvider setup, i18n language sync, axios auth header, render `<AppRouter />`

**Root Module:**

- Location: `apps/api/src/app/app.module.ts`
- Triggers: Imported by `main.ts` bootstrap
- Responsibilities: Registers all feature modules, configures MongoDB, Redis cache, BullMQ, scheduled tasks, event emitter, global guards (AuthGuard, AccessGuard), LoggingInterceptor

**Router:**

- Location: `apps/frontend/src/router/createRouter.tsx`
- Triggers: Rendered by `AppRouter.tsx`
- Responsibilities: Creates react-router browser router with public, private, and auth routes; private routes gated by `isAuthenticated` flag and app configs

## Error Handling

**Strategy:** Layered exception handling with global filters on the API and centralized error handling on the frontend.

**API Patterns:**

- `CustomHttpException` (`apps/api/src/common/CustomHttpException.ts`): Standard way to throw HTTP errors with automatic logging. Uses `ErrorMessage` constants from `@libs/error/errorMessage`.
- Global exception filters registered in `apps/api/src/main.ts`: `HttpExceptionFilter`, `PayloadTooLargeFilter`, `NotFoundFilter`, `MulterExceptionFilter`, `ExpressHttpErrorFilter`
- Client errors (4xx) logged at `debug` level in production, server errors (5xx) at `warn` level

**Frontend Patterns:**

- `LazyErrorBoundary` (`apps/frontend/src/components/LazyErrorBoundary.tsx`): React error boundary wrapping the entire app
- `handleApiError` utility for processing axios error responses in stores
- Toast notifications via `Toaster` component for user-facing error messages

## Cross-Cutting Concerns

**Logging:**

- API: NestJS `Logger` with static calls using service name as context (e.g., `Logger.log('message', ServiceName.name)`)
- `LoggingInterceptor` (`apps/api/src/logging/logging.interceptor.ts`) applied globally logs request/response details
- Log levels configurable via `EDUI_LOG_LEVEL` env var

**Validation:**

- API: NestJS pipes in `apps/api/src/common/pipes/`
- Frontend: Form schemas co-located with pages (e.g., `apps/frontend/src/pages/FileSharing/formSchema.ts`)

**Authentication:**

- OIDC via `react-oidc-context` on frontend, JWT RS256 verification on API
- Global `AuthGuard` (`apps/api/src/auth/auth.guard.ts`) verifies JWT on every request unless `@Public()` decorator is used
- Global `AccessGuard` (`apps/api/src/auth/access.guard.ts`) checks LDAP group-based access per app domain
- Custom decorators extract user info: `@GetCurrentUser()`, `@GetCurrentUsername()`, `@GetToken()` in `apps/api/src/common/decorators/`

**Internationalization:**

- i18next with locale files in `apps/frontend/src/locales/{de,en,fr}/`
- Language preference stored on user object and synced on login

**Caching:**

- Redis-backed NestJS CacheModule for server-side caching
- In-memory access cache for `AccessGuard` (`apps/api/src/common/guards/accessCache.ts`)
- Cache TTL constants in `libs/src/common/constants/cacheTtl.ts`

---

_Architecture analysis: 2026-03-09_
