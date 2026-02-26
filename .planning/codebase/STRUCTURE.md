# Codebase Structure

**Analysis Date:** 2026-02-26

## Directory Layout

```
edulution-ui/                          # Nx monorepo root
├── apps/
│   ├── frontend/                      # React + Vite SPA
│   │   ├── src/
│   │   │   ├── main.tsx               # App bootstrap entry point
│   │   │   ├── App.tsx                # Root component (providers)
│   │   │   ├── i18n.ts                # i18next configuration
│   │   │   ├── index.scss             # Global styles
│   │   │   ├── api/                   # Axios instance (eduApi)
│   │   │   ├── assets/                # Static images, icons
│   │   │   ├── components/            # Shared/global UI components
│   │   │   │   ├── shared/            # Reusable feature-agnostic components
│   │   │   │   ├── structure/         # Layout scaffolding (AppLayout, framing)
│   │   │   │   └── ui/                # Low-level shadcn wrapper components
│   │   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── locales/               # i18n translation files (de/en/fr)
│   │   │   ├── pages/                 # Feature pages (one directory per route/feature)
│   │   │   ├── router/                # React Router config and route factories
│   │   │   │   └── routes/            # Individual route-getter functions
│   │   │   ├── store/                 # Cross-feature Zustand stores
│   │   │   │   ├── EduApiStore/       # API health + platform detection
│   │   │   │   ├── FilesystemStore/   # Filesystem state
│   │   │   │   ├── UserStore/         # Auth state (persisted)
│   │   │   │   └── utils/             # cleanAllStores.ts
│   │   │   ├── theme/                 # Theme definitions
│   │   │   ├── types/                 # Frontend-only type augmentations
│   │   │   └── utils/                 # Frontend utility functions
│   │   ├── public/                    # Static assets served directly
│   │   ├── test/                      # Vitest setup files
│   │   ├── index.html                 # Vite HTML entry
│   │   ├── vite.config.mts            # Vite config
│   │   └── tailwind.config.ts         # Tailwind config
│   │
│   └── api/                           # NestJS REST API
│       └── src/
│           ├── main.ts                # NestJS bootstrap entry point
│           ├── app/                   # Root AppModule
│           ├── auth/                  # OIDC proxy + JWT + MFA/TOTP
│           ├── common/                # Cross-cutting infra (decorators, guards, pipes, utils)
│           │   ├── cache/             # Cache flush utilities
│           │   ├── decorators/        # @GetCurrentUser, @GetToken, @RequireAppAccess, etc.
│           │   ├── guards/            # AdminGuard, DynamicAppAccessGuard, accessCache
│           │   ├── interceptors/      # deploymentTarget, organizationType
│           │   ├── mocks/             # Shared test mocks
│           │   └── pipes/             # ValidatePathPipe
│           ├── config/                # NestJS ConfigService config loader
│           ├── filters/               # Global exception filters
│           ├── logging/               # LoggingInterceptor, log levels
│           ├── migration/             # MigrationService base class
│           ├── queue/                 # Shared QueueService
│           ├── sentry/                # Sentry integration for NestJS
│           ├── sse/                   # Server-Sent Events module
│           │
│           # Feature modules (each follows controller/service/schema pattern):
│           ├── appconfig/             # App configuration management
│           ├── bulletinboard/         # Bulletin board posts
│           ├── bulletin-category/     # Bulletin categories
│           ├── conferences/           # Video conferences (BigBlueButton)
│           ├── docker/                # Docker container management
│           ├── filesharing/           # File sharing with queues
│           ├── filesystem/            # Server filesystem operations
│           ├── global-settings/       # Global admin settings
│           ├── groups/                # LDAP group management
│           ├── health/                # Health check endpoint
│           ├── ldap-keycloak-sync/    # LDAP ↔ Keycloak sync
│           ├── license/               # License management
│           ├── lmnApi/                # LinuxMuster API proxy
│           ├── mails/                 # Email sending
│           ├── metrics/               # Prometheus metrics
│           ├── mobileAppModule/       # Mobile app (Expo) support
│           ├── notifications/         # Push notifications (BullMQ + Expo)
│           ├── parent-child-pairing/  # Parent-student account linking
│           ├── scripts/               # Keycloak admin scripts
│           ├── surveys/               # Survey creation and participation
│           ├── tldraw-sync/           # Whiteboard real-time sync (WebSocket)
│           ├── user-preferences/      # Per-user preferences
│           ├── users/                 # User accounts (MongoDB)
│           ├── vdi/                   # Virtual Desktop Infrastructure
│           ├── veyon/                 # Veyon classroom management
│           ├── webdav/                # WebDAV access
│           ├── webhook/               # Outgoing webhooks
│           ├── webhook-clients/       # Webhook client management
│           └── wireguard/             # WireGuard VPN
│
├── libs/
│   ├── src/                           # Shared TypeScript utilities (no React)
│   │   ├── common/                    # Cross-domain constants, types, utils
│   │   │   ├── constants/             # eduApiUrl, folderPaths, http-methods, etc.
│   │   │   ├── types/                 # Shared TS types (http-methods, patchConfigDto, etc.)
│   │   │   └── utils/                 # Pure utility functions
│   │   └── [domain]/                  # One directory per feature domain
│   │       ├── constants/             # Domain constants
│   │       ├── types/                 # Domain types (DTOs, interfaces)
│   │       └── utils/                 # Domain utility functions
│   └── ui-kit/                        # Minimal design-system primitives
│       └── src/
│           ├── components/            # Base components (Button)
│           ├── utils/                 # cn() classname utility
│           └── index.ts               # Package entry point
│
├── scripts/                           # Build/deployment helper scripts
├── docs/                              # Project documentation
├── traefik/                           # Traefik reverse-proxy config templates
├── nx.json                            # Nx workspace config
├── package.json                       # Root package manifest
├── tsconfig.base.json                 # Shared TypeScript config with path aliases
└── docker-compose.yml                 # Local dev infrastructure (MongoDB, Redis)
```

## Directory Purposes

**`apps/frontend/src/pages/`:**

- Purpose: Feature pages — each major feature gets its own directory
- Contains: Page components, feature-specific sub-components, feature Zustand stores, feature hooks
- Key files: `[Feature]Page.tsx` (main page component), `use[Feature]Store.ts` (Zustand store for this feature)
- Pattern: Stores are co-located inside the feature directory (not in `src/store/`)

**`apps/frontend/src/components/`:**

- Purpose: Reusable UI components not tied to a single feature
- Sub-directories:
  - `shared/` — Components used across multiple features (Card, WysiwygEditor, PDFViewer, MenuBar)
  - `structure/` — App-level layout: `AppLayout`, framing components (ResizableWindow, Native app frame)
  - `ui/` — Low-level shadcn/Radix wrappers (Sidebar, Table, Launcher, DateTimePicker, Loading)

**`apps/frontend/src/store/`:**

- Purpose: Global Zustand stores shared across features
- Contains: `UserStore` (auth, JWT, persisted), `EduApiStore` (health check), `FilesystemStore`, `useSseStore`, `useNotificationStore`, `useThemeStore`
- All new stores must also be registered in `apps/frontend/src/store/utils/cleanAllStores.ts`

**`apps/frontend/src/hooks/`:**

- Purpose: Custom React hooks used by multiple pages/components
- Key hooks: `useInitialAppData` (bootstrap API fetches), `useSseEventListener` (SSE dispatch), `useLogout`, `useMedia`, `useMenuBarConfig`

**`apps/api/src/common/`:**

- Purpose: Infrastructure shared across all NestJS feature modules
- Key files:
  - `CustomHttpException.ts` — typed error with auto-logging
  - `decorators/getCurrentUser.decorator.ts` — inject JWT user into controller params
  - `decorators/requireAppAccess.decorator.ts` — mark a controller with app-level access requirement
  - `guards/admin.guard.ts` — restrict endpoints to admin users
  - `pipes/validatePath.pipe.ts` — prevent path traversal in file endpoints

**`libs/src/[domain]/`:**

- Purpose: Shared code for each domain — consumed by both `apps/frontend` and `apps/api`
- Domains mirror feature modules: `appconfig`, `auth`, `bulletinBoard`, `classManagement`, `common`, `conferences`, `filesharing`, `groups`, `notification`, `survey`, `user`, `userManagement`, etc.
- Rule: Only types, constants, and pure utils here. No React components, no NestJS decorators.

## Key File Locations

**Entry Points:**

- `apps/frontend/src/main.tsx`: Frontend bootstrap
- `apps/frontend/src/App.tsx`: React root component with all providers
- `apps/api/src/main.ts`: NestJS bootstrap, global filters, Swagger setup
- `apps/api/src/app/app.module.ts`: Root NestJS module, all feature modules imported here

**Configuration:**

- `tsconfig.base.json`: Path aliases `@/*` → `apps/frontend/src/*`, `@libs/*` → `libs/src/*`, `@edulution-io/ui-kit` → `libs/ui-kit/src/index.ts`
- `apps/frontend/vite.config.mts`: Vite build config, proxy setup
- `apps/frontend/tailwind.config.ts`: Tailwind config
- `apps/api/src/config/configuration.ts`: NestJS ConfigService loader
- `nx.json`: Nx project graph config

**Core Logic:**

- `apps/frontend/src/api/eduApi.ts`: Axios instance used for all API calls
- `apps/frontend/src/utils/handleApiError.ts`: Centralized frontend error handler for stores
- `apps/frontend/src/router/createRouter.tsx`: Route tree construction from app configs
- `apps/frontend/src/store/utils/cleanAllStores.ts`: Complete store reset on logout
- `apps/api/src/auth/auth.guard.ts`: JWT verification guard (applied globally)
- `apps/api/src/auth/access.guard.ts`: LDAP-group-based app access guard (applied globally)
- `apps/api/src/common/CustomHttpException.ts`: Typed API error base class
- `apps/api/src/migration/migration.service.ts`: Schema migration runner

**Testing:**

- `apps/frontend/test/vitest.setup.ts`: Vitest global setup
- `apps/api/jest.config.ts`: Jest config for API
- Test files co-located as `*.spec.ts(x)` next to source files

## Naming Conventions

**Files:**

- React components: PascalCase matching the default export, e.g., `BulletinBoardPage.tsx`, `AppLayout.tsx`
- Zustand stores: camelCase prefixed with `use`, e.g., `useFileSharingStore.ts`, `useUserStore.ts`
- NestJS files: kebab-case with type suffix, e.g., `bulletinboard.service.ts`, `bulletinboard.controller.ts`, `bulletinboard.module.ts`, `bulletin.schema.ts`
- Lib files: camelCase for utils/constants, PascalCase for type files, e.g., `eduApiUrl.ts`, `AppConfigDto.ts`
- Slice files (Zustand): camelCase prefixed with `create`, e.g., `createUserSlice.ts`

**Directories:**

- Frontend pages: PascalCase, e.g., `BulletinBoard/`, `FileSharing/`, `UserSettings/`
- API feature modules: kebab-case, e.g., `bulletin-category/`, `ldap-keycloak-sync/`, `tldraw-sync/`
- Lib domains: camelCase, e.g., `bulletinBoard/`, `classManagement/`, `userManagement/`

## Where to Add New Code

**New Feature Page (frontend):**

- Page component: `apps/frontend/src/pages/[FeatureName]/[FeatureName]Page.tsx`
- Zustand store: `apps/frontend/src/pages/[FeatureName]/use[FeatureName]Store.ts`
- Feature sub-components: `apps/frontend/src/pages/[FeatureName]/components/`
- Register store reset: Add `use[FeatureName]Store.getState().reset()` to `apps/frontend/src/store/utils/cleanAllStores.ts`

**New API Feature Module:**

- Create directory: `apps/api/src/[feature-name]/`
- Files: `[feature-name].module.ts`, `[feature-name].controller.ts`, `[feature-name].service.ts`, `[feature-name].schema.ts`
- Import module in: `apps/api/src/app/app.module.ts`

**New Route:**

- Add route to the appropriate factory function in `apps/frontend/src/router/routes/`
- Compose into `getPrivateRoutes.tsx`, `getPublicRoutes.tsx`, or `getAuthRoutes.tsx`

**New Shared Type, Constant, or Utility:**

- Create file under the matching domain in `libs/src/[domain]/types/`, `libs/src/[domain]/constants/`, or `libs/src/[domain]/utils/`
- If no domain exists yet, create `libs/src/[domain]/` with subdirectories

**New UI Component (reusable, not feature-specific):**

- `apps/frontend/src/components/shared/` for multi-feature shared components
- `apps/frontend/src/components/ui/` for primitive shadcn/Radix wrappers

**New Custom Hook (used across features):**

- `apps/frontend/src/hooks/use[HookName].ts(x)`

**Utilities (frontend-only):**

- `apps/frontend/src/utils/[utilName].ts`

## Special Directories

**`.planning/`:**

- Purpose: GSD planning documents and codebase analysis
- Generated: By GSD tooling
- Committed: Yes

**`dist/`:**

- Purpose: Build output for both apps
- Generated: Yes (via `npm run build`)
- Committed: No

**`coverage/`:**

- Purpose: Test coverage reports
- Generated: Yes (via `npm run coverage`)
- Committed: No

**`data/`:**

- Purpose: Runtime data directory for the API (certificates, uploads, public assets)
- Generated: Partially (created at runtime by `main.ts`)
- Committed: Certificate files `.pem` are present at root for dev

**`node_modules/`:**

- Purpose: NPM dependencies for entire monorepo
- Generated: Yes (via `npm install`)
- Committed: No

**`swagger-spec.json`:**

- Purpose: OpenAPI specification generated from NestJS Swagger decorators
- Generated: Yes (in development mode on API start)
- Committed: Yes (for API documentation reference)

---

_Structure analysis: 2026-02-26_
