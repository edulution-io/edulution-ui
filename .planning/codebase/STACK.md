# Technology Stack

**Analysis Date:** 2026-03-09

## Languages

**Primary:**

- TypeScript ^5.5.2 - Used across frontend, API, and shared libs
  - Target: ES2022
  - Strict mode enabled with `emitDecoratorMetadata` and `experimentalDecorators` for NestJS

**Secondary:**

- SCSS - Frontend styling (`apps/frontend/src/index.scss`)
- CSS (Tailwind) - Primary styling approach via utility classes

## Runtime

**Environment:**

- Node.js ^22.21.1 (pinned in `package.json` engines)
- Production API container: `node:22.21.1-alpine3.22` (`apps/api/Dockerfile`)
- Production frontend container: `nginx:1.29.2-alpine3.22` (`apps/frontend/Dockerfile`)

**Package Manager:**

- npm ^10.9.4 (pinned in `package.json` engines)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**

- React ^18.2.0 - Frontend SPA (`apps/frontend/`)
- NestJS ^11.0.15 - Backend API (`apps/api/`)
- Express (via `@nestjs/platform-express`) - HTTP server underlying NestJS

**Build/Monorepo:**

- Nx 22.3.0 - Monorepo orchestration (`nx.json`)
  - Plugins: `@nx/eslint`, `@nx/vite`, `@nx/webpack`, `@nx/jest`
  - Default base branch: `dev`
- Vite (rolldown-vite 7.3.1) - Frontend bundler (`apps/frontend/vite.config.mts`)
- Webpack (via `@nx/webpack`) - API bundler

**Testing:**

- Vitest ^3.2.2 - Frontend/libs tests
- Jest ^29.7.0 - API tests (`apps/api/jest.config.ts`)
- jsdom ^25.0.0 - Browser environment for frontend tests
- `@testing-library/jest-dom` ^6.4.6 - DOM assertions

**Linting/Formatting:**

- ESLint ^8.57.0 with Airbnb + TypeScript config
- Prettier ^3.2.5 with Tailwind CSS plugin
- Husky ^8.0.0 - Git hooks
- lint-staged ^16.1.2 - Pre-commit staged file linting
- pretty-quick ^4.0.0 - Staged formatting
- madge ^7.0.0 - Circular dependency detection

## Key Dependencies

**Critical (Frontend):**

- `react-router-dom` ^6.28.2 - Client-side routing
- `zustand` ^4.5.0 - State management (stores in `apps/frontend/src/store/`)
- `axios` ^1.7.4 - HTTP client (wrapped as `eduApi` in `apps/frontend/src/api/eduApi.ts`)
- `react-oidc-context` ^3.2.0 + `oidc-client-ts` ^3.1.0 - OIDC authentication flow
- `keycloak-js` ^26.2.0 - Keycloak JavaScript adapter
- `i18next` ^23.8.2 + `react-i18next` ^14.0.3 - Internationalization
- `react-hook-form` ^7.51.1 + `@hookform/resolvers` ^3.3.4 - Form management
- `zod` ^3.22.4 - Schema validation (used with react-hook-form resolvers)
- `@tanstack/react-table` ^8.11.8 - Data tables
- `tailwindcss` ^3.4.1 + `tailwind-merge` ^2.2.1 + `class-variance-authority` ^0.7.0 - Styling
- `@radix-ui/*` (multiple) - Headless UI primitives (accordion, dialog, dropdown, tabs, etc.)
- `framer-motion` ^11.0.3 - Animations
- `sonner` ^1.4.3 - Toast notifications
- `@sentry/react` ^10.21.0 - Error tracking (frontend)

**Critical (API):**

- `mongoose` ^8.9.5 + `@nestjs/mongoose` ^11.0.0 - MongoDB ODM
- `ioredis` ^5.6.0 + `@keyv/redis` ^4.3.4 - Redis client
- `bullmq` ^5.58.2 + `@nestjs/bullmq` ^11.0.2 - Job queue (Redis-backed)
- `cache-manager` ^6.4.2 + `@nestjs/cache-manager` ^3.0.1 - Caching layer (Redis store)
- `@nestjs/jwt` ^11.0.0 - JWT token handling
- `@nestjs/schedule` ^5.0.0 - Cron/interval scheduling
- `@nestjs/event-emitter` ^3.0.0 - Internal event bus
- `@nestjs/websockets` ^11.0.15 + `@nestjs/platform-ws` ^11.0.20 + `ws` ^8.18.1 - WebSocket support
- `ldapts` ^8.0.9 - LDAP client for directory sync
- `imapflow` ^1.0.164 - IMAP mail client
- `dockerode` ^4.0.3 - Docker API client
- `helmet` ^7.1.0 - HTTP security headers
- `class-validator` ^0.14.3 + `class-transformer` ^0.5.1 - DTO validation
- `@nestjs/swagger` ^11.1.3 - API documentation (dev only)
- `@sentry/nestjs` ^10.21.0 + `@sentry/profiling-node` ^10.41.0 - Error tracking (API)
- `multer` ^2.0.2 - File upload handling
- `sharp` ^0.34.5 - Image processing
- `got` ^11.8.6 - HTTP client (used in WebDAV service)
- `otpauth` ^9.3.3 - TOTP two-factor authentication
- `expo-server-sdk` ^3.15.0 - Push notifications to mobile app

**Collaboration/Content:**

- `tldraw` ^3.15.4 + `@tldraw/sync` ^3.15.4 - Collaborative whiteboard
- `@onlyoffice/document-editor-react` ^2.1.1 - Document editing (OnlyOffice)
- `@glokon/guacamole-common-js` ^1.6.0 - Remote desktop (Apache Guacamole)
- `survey-core` ^1.12.51 + `survey-creator-react` ^1.12.51 + `survey-react-ui` ^1.12.51 - Survey builder/renderer
- `react-quill-new` ^3.3.3 - Rich text editor
- `@uiw/react-md-editor` ^4.0.11 - Markdown editor

**Document Generation:**

- `docx` ^8.5.0 - Word document generation
- `exceljs` ^4.4.0 - Excel file generation
- `pptxgenjs` ^3.12.0 - PowerPoint generation
- `survey-pdf` ^1.12.51 - Survey PDF export

**UI Utilities:**

- `@dnd-kit/core` ^6.3.1 - Drag and drop
- `react-dropzone` ^14.2.3 - File upload dropzone
- `react-day-picker` ^8.10.1 - Date picker
- `cmdk` ^0.2.0 - Command palette
- `vaul` ^0.9.0 - Drawer component
- `input-otp` ^1.2.4 - OTP input
- `qrcode.react` ^3.1.0 - QR code generation
- `react-rnd` ^10.4.13 - Resizable/draggable elements
- `@fortawesome/react-fontawesome` ^3.1.1 - Icons (only `free-solid-svg-icons`)
- `@fontsource/lato` ^5.2.6 - Lato font

**Utilities:**

- `date-fns` ^3.6.0 + `dayjs` ^1.11.12 - Date manipulation
- `crypto-js` ^4.2.0 - Cryptographic utilities
- `fflate` ^0.8.2 - Compression
- `fast-xml-parser` ^4.4.1 + `xml2js` ^0.6.2 + `xmlbuilder2` ^3.1.1 - XML processing
- `yaml` ^2.5.1 - YAML parsing
- `he` ^1.2.0 - HTML entity encoding
- `idb-keyval` ^6.2.2 - IndexedDB key-value store (frontend)
- `usehooks-ts` ^2.14.0 - React utility hooks

## Configuration

**Environment (API):**

- Config file: `apps/api/.env` (see `apps/api/.env.default` for all variables)
- Loaded via `@nestjs/config` with `ConfigModule.forRoot()` in `apps/api/src/app/app.module.ts`
- App config factory: `apps/api/src/config/configuration.ts` (version, commit SHA, build info)
- Key env groups: base config, MongoDB, Keycloak, Redis, LDAP, Sentry, Mailcow, Guacamole, OnlyOffice, Wireguard, VDI

**Environment (Frontend):**

- Config file: `apps/frontend/.env.development` (see `apps/frontend/.env.default`)
- VITE\_-prefixed variables: `VITE_LMN_URL`, `VITE_LMN_API_URL`, `VITE_EDU_API_URL`, `VITE_GUACAMOLE_URL`, `VITE_KEYCLOAK_URL`, `VITE_ONLYOFFICE_URL`

**TypeScript:**

- Root config: `tsconfig.base.json` (ES2022, strict, decorators enabled)
- Path aliases: `@/*` -> `apps/frontend/src/*`, `@libs/*` -> `libs/src/*`, `@edulution-io/ui-kit` -> `libs/ui-kit/src/index.ts`

**Build:**

- Frontend Vite config: `apps/frontend/vite.config.mts`
- Nx workspace config: `nx.json`
- Prettier config: `prettier.config.js`
- Lint-staged config: `lint-staged.config.js`
- Jest config (API): `apps/api/jest.config.ts`

## Platform Requirements

**Development:**

- Node.js 22.21.1+
- npm 10.9.4+
- Docker & Docker Compose (for MongoDB 7 and Redis 8.2 via `docker-compose.yml`)
- OIDC certificate file (`edulution.pem`) in repo root for Keycloak auth

**Production:**

- Docker containers deployed to GitHub Container Registry (`ghcr.io/edulution-io/`)
  - `ghcr.io/edulution-io/edulution-ui` (nginx serving static build)
  - `ghcr.io/edulution-io/edulution-api` (Node.js running NestJS)
- MongoDB 7+
- Redis 8+
- Keycloak instance for authentication
- External services: linuxmuster.net (LMN), OnlyOffice, Guacamole (depending on deployment)

**CI/CD:**

- GitHub Actions (`.github/workflows/`)
  - `build-and-test.yml` - Build and test pipeline
  - `container-build.yml` - Docker container builds
  - `api-tag.yml`, `frontend-tag.yml` - Release tagging
  - `bump-patch-version-tag.yml`, `bump-minor-version-tag.yml` - Version bumps
  - `publish-ui-kit.yml` - UI kit library publishing
  - `auto-merge-master-back-in-dev.yml` - Branch sync automation

---

_Stack analysis: 2026-03-09_
