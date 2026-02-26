# Technology Stack

**Analysis Date:** 2026-02-26

## Languages

**Primary:**

- TypeScript 5.5 - Used throughout all apps and libs (strict mode, ES2022 target)

**Secondary:**

- SCSS - Frontend styles (`apps/frontend/src/index.scss`, component-level styles)
- JavaScript - Config files (`prettier.config.js`, `lint-staged.config.js`, `jest.preset.cjs`)

## Runtime

**Environment:**

- Node.js ^22.21.1

**Package Manager:**

- npm ^10.9.4
- Lockfile: `package-lock.json` (present, root-level)

## Monorepo Tooling

**Workspace:**

- Nx 22.3.0 — task orchestration, project graph, build caching
- Config: `nx.json` (`neverConnectToCloud: true`, defaultBase: `dev`)

**Path Aliases:**

- `@/` → `apps/frontend/src/`
- `@libs/` → `libs/src/`
- `@edulution-io/ui-kit` → `libs/ui-kit/src/index.ts`

## Frameworks

**Frontend:**

- React 18.2 — UI library, function components as arrow functions
- React Router DOM 6.28 — client-side routing (`apps/frontend/src/router/`)
- Zustand 4.5 — global state management (`apps/frontend/src/store/`)
- React Hook Form 7.51 + Zod 3.22 + `@hookform/resolvers` — form validation
- i18next 23 + react-i18next + i18next-browser-languagedetector — i18n (EN, DE, FR)
- Tailwind CSS 3.4 — utility-first styling, config at `apps/frontend/tailwind.config.ts`
- shadcn/ui (New York style) + Radix UI — component primitives (config: `components.json`)
- Framer Motion 11 — animations
- TLDraw 3.15 — collaborative whiteboard component
- SurveyJS 1.12 — survey builder and analytics (`survey-core`, `survey-creator-react`, `survey-react-ui`, `survey-analytics`, `survey-pdf`)
- Tanstack Table 8.11 — data tables
- `react-oidc-context` 3.2 + `oidc-client-ts` 3.1 — OIDC auth flow in browser

**Backend (API):**

- NestJS 11.0 — framework (`apps/api/src/`)
- Express (via `@nestjs/platform-express`) — HTTP adapter
- WebSocket support via `@nestjs/platform-ws` + WsAdapter
- Mongoose 8.9 + `@nestjs/mongoose` — MongoDB ODM
- BullMQ 5.58 + `@nestjs/bullmq` — background job queues
- `@nestjs/cache-manager` + `@keyv/redis` / keyv 5 — Redis-backed caching
- `@nestjs/schedule` — cron jobs and scheduled tasks
- `@nestjs/event-emitter` — internal event bus
- `@nestjs/jwt` — JWT verification (RS256)
- `@nestjs/swagger` + Swagger UI — API docs (dev only, at `/docs`)
- `@nestjs/terminus` — health checks
- Helmet 7 — HTTP security headers
- class-validator + class-transformer — DTO validation

**Testing:**

- Vitest 1.6 — frontend/libs unit tests
- Jest 29.7 + ts-jest — API unit tests
- `@nestjs/testing` — NestJS test utilities
- `@testing-library/jest-dom` — DOM assertions
- jsdom 25 — browser environment simulation for Vitest

**Build/Dev:**

- Vite 5 + `@vitejs/plugin-react-swc` — frontend dev server and bundler
- Webpack 6 + `@nx/webpack` — API bundler (NxAppWebpackPlugin)
- SWC (`@swc/core`) — TypeScript transpilation (fast)
- `vite-plugin-svgr` — SVG as React components
- `vite-plugin-dts` — TypeScript declaration generation for ui-kit

## Key Dependencies

**UI Components:**

- `@radix-ui/*` (accordion, avatar, checkbox, dialog, dropdown-menu, label, popover, progress, radio-group, scroll-area, separator, slot, switch, tabs, tooltip) — headless primitives
- `class-variance-authority` + `clsx` + `tailwind-merge` — className utilities
- `sonner` 1.4 — toast notifications
- `@fortawesome/react-fontawesome` + `@fortawesome/free-solid-svg-icons` — icons (only free-solid allowed)
- `react-quill-new` 3.3 — rich text editor
- `@uiw/react-md-editor` — Markdown editor
- `react-dropzone` — file upload
- `react-day-picker` — date picker
- `@dnd-kit/core` — drag and drop
- `react-rnd` — resizable/draggable windows
- `input-otp` — OTP input

**Document Generation:**

- `docx` 8.5 — Word documents
- `exceljs` 4.4 — Excel spreadsheets
- `pptxgenjs` 3.12 — PowerPoint presentations
- `tabulator-tables` 6.2 — tabular data export

**Data/Utilities:**

- `axios` 1.7 — HTTP client (both frontend via `eduApi`, and API-side service calls)
- `date-fns` 3.6 + `dayjs` 1.11 — date manipulation
- `zod` 3.22 — schema validation (shared types)
- `fast-xml-parser` 4.4 + `xml2js` 0.6 + `xmlbuilder2` 3.1 — XML parsing/building (WebDAV, BBB API)
- `crypto-js` 4.2 — client-side encryption
- `otpauth` 9.3 — TOTP/OTP generation (2FA)
- `yaml` 2.5 — YAML parsing (Docker Compose files)
- `fflate` 0.8 — zip compression
- `mime` / `mime-types` — MIME type resolution
- `sharp` 0.34 — image processing
- `fs-extra` 11.2 — enhanced filesystem utilities

**Infrastructure (API):**

- `ioredis` 5.6 — Redis client (webhooks, BullMQ)
- `imapflow` 1.0 — IMAP client (mail module)
- `ldapts` 8.0 — LDAP client (LDAP sync)
- `dockerode` 4.0 — Docker Engine API client
- `got` 11.8 — HTTP client for streaming WebDAV
- `multer` 2.0 — multipart/file uploads
- `ws` 8.18 — WebSocket server (TLDraw sync)
- `expo-server-sdk` 3.15 — push notifications via Expo

## Configuration

**Environment:**

- API: `apps/api/.env` (see `apps/api/.env.default` for all variables)
- Frontend: `apps/frontend/.env.development` (see `apps/frontend/.env.default`)
- Key frontend variables: `VITE_LMN_URL`, `VITE_LMN_API_URL`, `VITE_EDU_API_URL`, `VITE_GUACAMOLE_URL`, `VITE_KEYCLOAK_URL`, `VITE_ONLYOFFICE_URL`
- Key API variables: MongoDB, Redis, Keycloak, LDAP, LMN API, Sentry, Wireguard (see `apps/api/.env.default`)

**TypeScript:**

- Base config: `tsconfig.base.json` (strict, ES2022, `emitDecoratorMetadata: true`, `experimentalDecorators: true`)
- App-specific configs extend base: `apps/frontend/tsconfig.app.json`, `apps/api/tsconfig.app.json`

**Build:**

- Frontend: `apps/frontend/vite.config.mts` — Vite, dev proxy, chunk splitting (surveyjs, sentry)
- API: `apps/api/webpack.config.js` — NxAppWebpackPlugin, Node target, tsc compiler

## Platform Requirements

**Development:**

- Node.js 22.x, npm 10.x
- Docker + Docker Compose (MongoDB 7, Redis 8.2 via `docker-compose.yml`)
- OIDC certificate file `edulution.pem` in repo root (for dev token verification)

**Production:**

- Docker images: `ghcr.io/edulution-io/edulution-ui` and `ghcr.io/edulution-io/edulution-api`
- Dockerfiles: `apps/frontend/Dockerfile`, `apps/api/Dockerfile`
- Reverse proxy: Nginx (config: `nginx.conf`) + Traefik (config: `traefik/`)
- Deployment targets: `linuxmuster` (default) or `generic`

---

_Stack analysis: 2026-02-26_
