# Codebase Structure

**Analysis Date:** 2026-03-09

## Directory Layout

```
edulution-ui/
├── apps/
│   ├── api/                    # NestJS backend application
│   │   └── src/
│   │       ├── app/            # Root module (app.module.ts)
│   │       ├── auth/           # Authentication (guards, controller, service)
│   │       ├── common/         # Shared API utilities (guards, decorators, pipes, interceptors, cache)
│   │       ├── config/         # App configuration loader
│   │       ├── filters/        # Global exception filters
│   │       ├── logging/        # Logging interceptor and utilities
│   │       ├── migration/      # Database migration runner
│   │       ├── sentry/         # Sentry error tracking setup
│   │       ├── queue/          # Base queue service
│   │       ├── sse/            # Server-Sent Events module
│   │       ├── types/          # API-specific type extensions (express.d.ts)
│   │       └── <feature>/      # Feature modules (see Feature Module Pattern below)
│   └── frontend/               # React + Vite frontend application
│       ├── public/             # Static assets (icons, document templates)
│       └── src/
│           ├── api/            # Axios instance (eduApi.ts)
│           ├── assets/         # Images, icons, layout assets
│           ├── components/     # Shared and structural components
│           │   ├── shared/     # Reusable components (MenuBar, FloatingButtonsBar, PDFViewer, etc.)
│           │   ├── structure/  # Layout components (AppLayout, PageLayout, framing)
│           │   └── ui/         # UI primitives (shadcn wrappers, Table, Sidebar, etc.)
│           ├── hooks/          # Global custom React hooks
│           ├── locales/        # i18n translation files (de/, en/, fr/)
│           ├── pages/          # Page-level components organized by feature
│           ├── router/         # React Router configuration
│           └── store/          # Global Zustand stores
├── libs/
│   ├── src/                    # Shared types, constants, and utilities
│   │   ├── common/            # Cross-cutting shared code
│   │   │   ├── constants/     # Shared constants (API URLs, paths, config values)
│   │   │   ├── types/         # Shared TypeScript types/interfaces
│   │   │   └── utils/         # Pure utility functions
│   │   └── <domain>/          # Domain-specific shared code (per feature)
│   │       ├── constants/     # Domain constants and endpoint paths
│   │       ├── types/         # Domain DTOs, interfaces, type definitions
│   │       └── utils/         # Domain utility functions
│   └── ui-kit/                # Shared UI component library
│       └── src/
│           ├── components/    # Base UI components (Button.tsx)
│           ├── utils/         # UI utilities (cn() for classNames)
│           └── assets/        # UI kit assets
├── scripts/                   # Build and CI helper scripts
├── data/                      # Runtime data directory (mounted/generated)
├── docs/                      # Documentation
├── .github/                   # GitHub Actions workflows
├── .husky/                    # Git hooks (pre-commit)
├── docker-compose.yml         # Local dev infrastructure (MongoDB, Redis)
├── nx.json                    # Nx workspace configuration
├── package.json               # Root package.json (npm scripts, dependencies)
├── tsconfig.base.json         # Root TypeScript config with path aliases
├── .eslintrc.json             # ESLint configuration
├── prettier.config.js         # Prettier configuration
├── jest.config.ts             # Jest config (API tests)
├── vitest.workspace.ts        # Vitest workspace config (frontend tests)
└── swagger-spec.json          # Generated OpenAPI specification
```

## Directory Purposes

**`apps/api/src/<feature>/` (Feature Modules):**

- Purpose: Self-contained NestJS domain modules
- Contains: `<feature>.module.ts`, `<feature>.controller.ts`, `<feature>.service.ts`, `<feature>.schema.ts`, optional `migrations/`, `queue/`, `dto/`, `mocks/`
- Key examples:
  - `apps/api/src/surveys/` - Surveys with answers, templates, attachments
  - `apps/api/src/users/` - User management with schemas and DTOs
  - `apps/api/src/filesharing/` - File sharing with queue consumers
  - `apps/api/src/bulletinboard/` - Bulletin board with migrations
  - `apps/api/src/tldraw-sync/` - Whiteboard sync with WebSocket gateway

**`apps/frontend/src/pages/<Feature>/`:**

- Purpose: Page-level React components with co-located stores, hooks, and sub-components
- Contains: `<Feature>Page.tsx` (main page component), `use<Feature>Store.ts` (Zustand store), sub-directories for dialogs/components/hooks
- Key examples:
  - `apps/frontend/src/pages/FileSharing/` - File sharing with dialogs, table, hooks, utilities
  - `apps/frontend/src/pages/Surveys/` - Survey editor, participation, tables
  - `apps/frontend/src/pages/ClassManagement/` - Class lists, lesson management
  - `apps/frontend/src/pages/Dashboard/` - Dashboard with feed, quota, groups

**`apps/frontend/src/components/ui/`:**

- Purpose: UI primitive wrappers (shadcn/radix-ui components with custom styling)
- Contains: Components with `SH` suffix are shadcn wrappers (e.g., `AccordionSH.tsx`, `CardSH.tsx`, `DropdownMenuSH.tsx`)
- Key files: `Dialog.tsx`, `Table/`, `Sidebar/`, `Loading/`, `Launcher/`, `DateTimePicker/`

**`apps/frontend/src/store/`:**

- Purpose: Global application-level Zustand stores
- Contains: `UserStore/` (with slices), `EduApiStore/`, `FilesystemStore/`, and individual global stores
- Key files: `useUserStore.ts`, `useSseStore.ts`, `useThemeStore.ts`, `useNotificationStore.ts`
- Critical file: `utils/cleanAllStores.ts` - must register every new store's `reset()` method

**`libs/src/<domain>/`:**

- Purpose: Shared code for a specific domain, used by both frontend and API
- Contains: `constants/` (endpoint paths, enum-like const objects), `types/` (DTOs, interfaces), `utils/` (pure functions)
- Key domains: `common`, `user`, `auth`, `survey`, `filesharing`, `filesystem`, `groups`, `lmnApi`, `notification`, `webhook`

**`apps/api/src/common/`:**

- Purpose: API-specific shared infrastructure
- Contains: Guards (`admin.guard.ts`, `dynamicAppAccess.guard.ts`), decorators (`getCurrentUser.decorator.ts`, `public.decorator.ts`, `requireAppAccess.decorator.ts`), pipes, interceptors, cache utilities
- Key file: `CustomHttpException.ts` - standard error throwing mechanism
- Key file: `redis.connection.ts` - Redis connection configuration

## Key File Locations

**Entry Points:**

- `apps/api/src/main.ts`: API server bootstrap
- `apps/frontend/src/main.tsx`: Frontend React root
- `apps/frontend/src/App.tsx`: Root React component with providers
- `apps/api/src/app/app.module.ts`: NestJS root module registering all feature modules

**Configuration:**

- `tsconfig.base.json`: Path aliases (`@/*` -> frontend src, `@libs/*` -> libs src, `@edulution-io/ui-kit`)
- `nx.json`: Nx workspace config (Vite, Webpack, ESLint, Jest plugins)
- `.eslintrc.json`: ESLint rules
- `prettier.config.js`: Prettier settings (2 spaces, 120 cols, single quotes)
- `apps/api/src/config/configuration.ts`: Runtime API configuration loader
- `docker-compose.yml`: Local MongoDB and Redis

**Authentication:**

- `apps/api/src/auth/auth.guard.ts`: JWT verification guard (global)
- `apps/api/src/auth/access.guard.ts`: LDAP group-based access control (global)
- `apps/api/src/auth/auth.controller.ts`: Auth endpoints
- `apps/api/src/auth/auth.service.ts`: Auth business logic
- `apps/api/src/common/decorators/public.decorator.ts`: `@Public()` decorator to skip auth
- `apps/api/src/common/decorators/requireAppAccess.decorator.ts`: `@RequireAppAccess()` for domain-based access

**Routing:**

- `apps/frontend/src/router/createRouter.tsx`: Browser router factory
- `apps/frontend/src/router/routes/getPrivateRoutes.tsx`: Authenticated routes
- `apps/frontend/src/router/routes/getPublicRoutes.tsx`: Unauthenticated routes
- `apps/frontend/src/router/routes/ProtectedRoute.tsx`: Route guard component

**Layout:**

- `apps/frontend/src/components/structure/layout/AppLayout.tsx`: Root layout with sidebar, menu bar, outlet
- `apps/frontend/src/components/structure/layout/PageLayout.tsx`: Page wrapper with header, floating bar, footer

**API Communication:**

- `apps/frontend/src/api/eduApi.ts`: Axios instance creation
- `libs/src/common/constants/eduApiUrl.ts`: API base URL constant
- `libs/src/common/constants/eduApiRoot.ts`: API route prefix

**Error Handling:**

- `apps/api/src/common/CustomHttpException.ts`: Standard API error class
- `apps/api/src/filters/`: Global exception filters (5 filters)
- `libs/src/error/errorMessage.ts`: Error message type definitions

**Migrations:**

- `apps/api/src/migration/migration.service.ts`: Migration runner
- Per-module migration directories: `apps/api/src/<module>/migrations/`

## Naming Conventions

**Files:**

- Components: PascalCase matching the default export (`AppLayout.tsx`, `PageLayout.tsx`)
- Zustand stores: `use<Name>Store.ts` (e.g., `useFileSharingStore.ts`, `useUserStore.ts`)
- Zustand slices: `create<Name>Slice.ts` (e.g., `createUserSlice.ts`)
- NestJS modules: `<name>.module.ts` (kebab-case, e.g., `bulletin-category.module.ts`)
- NestJS controllers: `<name>.controller.ts`
- NestJS services: `<name>.service.ts`
- Mongoose schemas: `<name>.schema.ts`
- Tests: `<name>.spec.ts` or `<name>.spec.tsx` (co-located with source)
- Constants: camelCase (`eduApiRoot.ts`, `cacheTtl.ts`)
- Types/interfaces: camelCase file, PascalCase export (`appConfigDto.ts` exports `AppConfigDto`)
- shadcn wrappers: PascalCase with `SH` suffix (`AccordionSH.tsx`, `CardSH.tsx`)

**Directories:**

- API feature modules: kebab-case (`bulletin-category/`, `global-settings/`, `tldraw-sync/`)
- Frontend pages: PascalCase (`BulletinBoard/`, `ClassManagement/`, `FileSharing/`)
- Libs domains: camelCase (`lmnApi/`, `userManagement/`, `filesharing/`)
- Libs subdirectories: lowercase (`constants/`, `types/`, `utils/`)

## Where to Add New Code

**New API Feature Module:**

1. Create directory: `apps/api/src/<feature-name>/`
2. Create files: `<feature-name>.module.ts`, `<feature-name>.controller.ts`, `<feature-name>.service.ts`
3. If using MongoDB: add `<feature-name>.schema.ts`
4. Register module in `apps/api/src/app/app.module.ts` imports array
5. Add shared types/constants to `libs/src/<featureName>/` with `constants/`, `types/`, `utils/` subdirectories

**New Frontend Page:**

1. Create directory: `apps/frontend/src/pages/<FeatureName>/`
2. Create main component: `<FeatureName>Page.tsx` wrapping content in `<PageLayout>`
3. Create Zustand store: `use<FeatureName>Store.ts` with `reset()` method
4. Register store reset in `apps/frontend/src/store/utils/cleanAllStores.ts`
5. Add route in appropriate file under `apps/frontend/src/router/routes/`

**New Shared UI Component:**

- Place in `apps/frontend/src/components/ui/` for app-specific primitives
- Place in `apps/frontend/src/components/shared/` for reusable feature components
- Place in `libs/ui-kit/src/components/` only for truly generic, cross-project components

**New Shared Types/Constants/Utils:**

- Place in `libs/src/<domain>/types/`, `libs/src/<domain>/constants/`, or `libs/src/<domain>/utils/`
- For cross-domain utilities: `libs/src/common/utils/`, `libs/src/common/constants/`, `libs/src/common/types/`
- Export from domain index files

**New Custom Hook:**

- Global hooks: `apps/frontend/src/hooks/`
- Feature-specific hooks: co-locate in page directory (e.g., `apps/frontend/src/pages/FileSharing/hooks/`)

**New API Guard/Decorator/Pipe:**

- Place in `apps/api/src/common/guards/`, `apps/api/src/common/decorators/`, or `apps/api/src/common/pipes/`

**New Database Migration:**

- Create in `apps/api/src/<module>/migrations/`
- Always increment the schema version number

## Special Directories

**`data/`:**

- Purpose: Runtime data storage for the API (PEM keys, uploads, generated files)
- Generated: Yes (created by API bootstrap)
- Committed: Partially (directory structure tracked, contents gitignored)

**`coverage/`:**

- Purpose: Test coverage reports
- Generated: Yes
- Committed: No

**`dist/`:**

- Purpose: Build output
- Generated: Yes
- Committed: No

**`.nx/`:**

- Purpose: Nx workspace cache
- Generated: Yes
- Committed: No

**`scripts/`:**

- Purpose: Build, CI, and utility scripts
- Generated: No
- Committed: Yes

**`.husky/`:**

- Purpose: Git hooks (pre-commit checks for circular deps, translations, filenames, license headers)
- Generated: No
- Committed: Yes

**`.github/`:**

- Purpose: GitHub Actions CI/CD workflows
- Generated: No
- Committed: Yes

---

_Structure analysis: 2026-03-09_
