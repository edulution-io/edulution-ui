# External Integrations

**Analysis Date:** 2026-03-09

## APIs & External Services

**Keycloak (Identity Provider):**

- Purpose: User authentication via OIDC, user/group management, realm administration
- SDK/Client: `keycloak-js` ^26.2.0 (frontend), `oidc-client-ts` ^3.1.0 (frontend), direct Axios calls (API)
- Auth flow: OIDC Authorization Code via `react-oidc-context` on frontend, JWT validation on API
- API service: `apps/api/src/auth/auth.service.ts` - creates Axios instance against Keycloak realm
- Env vars: `KEYCLOAK_API`, `KEYCLOAK_EDU_UI_REALM`, `KEYCLOAK_EDU_UI_CLIENT_ID`, `KEYCLOAK_EDU_UI_SECRET`, `KEYCLOAK_EDU_API_CLIENT_ID`, `KEYCLOAK_EDU_API_CLIENT_SECRET`, `KEYCLOAK_ADMIN`, `KEYCLOAK_ADMIN_PASSWORD`
- Frontend env: `VITE_KEYCLOAK_URL`
- Frontend proxies `/auth` to Keycloak URL in dev mode (`apps/frontend/vite.config.mts`)

**linuxmuster.net (LMN) API:**

- Purpose: School network management - user provisioning, class management, network control
- Client: Axios via `apps/api/src/lmnApi/lmnApi.service.ts`
- Queue: `apps/api/src/lmnApi/queue/lmn-api-request.queue.ts` - rate-limited request queue
- Env vars: `LMN_API_BASE_URL`
- Frontend env: `VITE_LMN_URL`, `VITE_LMN_API_URL`
- Frontend proxies `/api` to LMN API URL in dev mode

**BigBlueButton (BBB):**

- Purpose: Video conferencing
- Client: Direct HTTP calls with XML response parsing (`xml2js`) in `apps/api/src/conferences/conferences.service.ts`
- Auth: Checksum-based API authentication (BBB API pattern)
- Polling: Configurable interval via `BBB_POLL_INTERVAL`
- Data: Conference state stored in MongoDB (`apps/api/src/conferences/conference.schema.ts`)

**Apache Guacamole:**

- Purpose: Remote desktop access (RDP/VNC) via browser
- Frontend client: `@glokon/guacamole-common-js` ^1.6.0
- API service: `apps/api/src/vdi/vdi.service.ts` - manages Guacamole connections and RDP sessions
- Env vars: `EDULUTION_GUACAMOLE_ADMIN_USER`, `EDULUTION_GUACAMOLE_ADMIN_PASSWORD`, `EDULUTION_GUACAMOLE_MYSQL_ROOT_PASSWORD`, `EDULUTION_GUACAMOLE_MYSQL_PASSWORD`
- Frontend env: `VITE_GUACAMOLE_URL`
- Frontend proxies `/guacamole` in dev mode

**LMN-VDI (Virtual Desktop Infrastructure):**

- Purpose: Virtual machine management for education
- Client: Axios in `apps/api/src/vdi/vdi.service.ts`
- Env vars: `LMN_VDI_API_URL`, `LMN_VDI_API_SECRET`

**OnlyOffice:**

- Purpose: Collaborative document editing (Word, Excel, PowerPoint)
- Frontend component: `@onlyoffice/document-editor-react` ^2.1.1
- Env vars: `EDULUTION_ONLYOFFICE_JWT_SECRET`, `EDULUTION_ONLYOFFICE_POSTGRES_PASSWORD`
- Frontend env: `VITE_ONLYOFFICE_URL`
- Frontend proxies `/docservice` to OnlyOffice URL in dev mode

**Veyon:**

- Purpose: Classroom computer monitoring and control
- Client: Axios in `apps/api/src/veyon/veyon.service.ts`
- Features: Screen monitoring (framebuffer), feature control, user sessions
- Auth: Veyon API authentication methods
- Config loaded dynamically via `AppConfigService`

**Mailcow:**

- Purpose: Email server management, sync job creation
- Client: Axios in `apps/api/src/mails/mails.service.ts`
- Env vars: `MAILCOW_API_URL`, `MAILCOW_API_TOKEN`, `KEYCLOAK_EDU_MAILCOW_SYNC_SECRET`

**edulution-wireguard:**

- Purpose: VPN peer/site management
- Client: Axios in `apps/api/src/wireguard/wireguard.service.ts`
- Default URL: `http://edulution-wireguard:8000/api/wireguard`
- Auth: API key header (`EDU_WG_API_KEY`)
- Env vars: `EDU_WG_API_URL`, `EDU_WG_API_KEY`

**Expo Push Notifications:**

- Purpose: Mobile app push notifications
- SDK: `expo-server-sdk` ^3.15.0
- Used in: `apps/api/src/notifications/queue/push-notification.queue.ts`, `apps/api/src/users/users.service.ts`

**Sentry:**

- Purpose: Error tracking and performance monitoring
- Frontend: `@sentry/react` ^10.21.0 (lazy-loaded, config stored in localStorage)
- API: `@sentry/nestjs` ^10.21.0 + `@sentry/profiling-node` ^10.41.0
- Setup: `apps/api/src/sentry/enableSentryForNest.ts` - conditionally enabled
- Frontend init: `apps/frontend/src/store/useSentryStore.ts`
- Env vars: `ENABLE_SENTRY`, `SENTRY_EDU_UI_DSN`, `SENTRY_EDU_API_DSN`

**tldraw (Collaborative Whiteboard):**

- Purpose: Real-time collaborative drawing/whiteboard
- Frontend: `tldraw` ^3.15.4
- Sync: `@tldraw/sync` ^3.15.4 + `@tldraw/sync-core` ^3.15.4
- API module: `apps/api/src/tldraw-sync/` - WebSocket-based sync server

**SurveyJS:**

- Purpose: Survey/form builder and renderer
- Packages: `survey-core`, `survey-creator-core`, `survey-creator-react`, `survey-react-ui`, `survey-analytics`, `survey-pdf`
- API module: `apps/api/src/surveys/`

## Data Storage

**Databases:**

- MongoDB 7 (primary data store)
  - Connection: `MONGODB_SERVER_URL` (default: `mongodb://localhost:27017/`)
  - Database: `MONGODB_DATABASE_NAME` (default: `edulution`)
  - Auth: `MONGODB_USERNAME`, `MONGODB_PASSWORD`
  - Client: Mongoose ^8.9.5 via `@nestjs/mongoose`
  - Connection config: `apps/api/src/app/app.module.ts` (minPoolSize: 10)
  - Schema files: `*.schema.ts` in each API module directory
  - Migration system: `apps/api/src/migration/migration.service.ts`

**Caching:**

- Redis 8.2
  - Connection: `apps/api/src/common/redis.connection.ts` (`REDIS_HOST`, `REDIS_PORT`)
  - Used for:
    - Cache layer via `@nestjs/cache-manager` with `@keyv/redis` store
    - Job queues via BullMQ (`@nestjs/bullmq`)
    - Webhook event deduplication via raw `ioredis` (`apps/api/src/webhook/webhook.service.ts`)
  - Dev docker: `docker-compose.yml` (no persistence, AOF disabled)

**File Storage:**

- Local filesystem
  - Paths configured in `@libs/common/constants/folderPaths`
  - Public downloads: served via `@nestjs/serve-static` at `/edu-api/downloads`
  - Public assets: served at `/edu-api/public/assets` with 24h cache
  - Directories created on startup in `apps/api/src/main.ts`

**WebDAV:**

- Purpose: File access for user home directories and shared resources
- Client factory: `apps/api/src/webdav/webdav.client.factory.ts`
- Service: `apps/api/src/webdav/webdav.service.ts`
- Shares: `apps/api/src/webdav/shares/` submodule
- Env var: `EDUI_WEBDAV_URL`
- Frontend proxies `/webdav` to LMN URL in dev mode

## Authentication & Identity

**Auth Provider:** Keycloak via OIDC

- Frontend: `react-oidc-context` wraps the entire app (`apps/frontend/src/App.tsx`)
- OIDC authority: proxied through the API at `EDU_API_URL/auth`
- Token storage: `localStorage` via `WebStorageStateStore`
- API guards: `apps/api/src/auth/auth.guard.ts` (JWT validation), `apps/api/src/auth/access.guard.ts` (role-based access)
- Both guards registered globally as `APP_GUARD` in `apps/api/src/app/app.module.ts`

**LDAP Sync:**

- Purpose: Sync users and groups from LDAP directory to Keycloak and local cache
- Client: `ldapts` ^8.0.9 in `apps/api/src/ldap-keycloak-sync/ldap-keycloak-sync.service.ts`
- Env vars: `LDAP_TUNNEL_URL`, `LDAP_EDULUTION_BINDUSER_DN`, `LDAP_EDULUTION_BINDUSER_PASSWORD`, `LDAP_SYNC_INTERVAL_MS`
- Scheduled sync with configurable interval
- Keycloak startup timeout: `KEYCLOAK_STARTUP_TIMEOUT_MS`

**Two-Factor Auth (TOTP):**

- Library: `otpauth` ^9.3.3
- Implementation: `apps/api/src/auth/auth.service.ts`

## Monitoring & Observability

**Error Tracking:**

- Sentry (conditionally enabled via `ENABLE_SENTRY`)
- API: `apps/api/src/sentry/enableSentryForNest.ts` - profiling integration, global error filter
- Frontend: `apps/frontend/src/store/useSentryStore.ts` - lazy initialization from localStorage

**Health Checks:**

- Module: `apps/api/src/health/` using `@nestjs/terminus`
- Disk space threshold: `EDUI_DISK_SPACE_THRESHOLD`

**Metrics:**

- Module: `apps/api/src/metrics/`

**Logging:**

- API: NestJS `ConsoleLogger` with configurable log levels (`EDUI_LOG_LEVEL`: off, error, warn, log, debug, verbose)
- Interceptor: `apps/api/src/logging/logging.interceptor.ts` (global `APP_INTERCEPTOR`)
- Pattern: Static `Logger.log('message', ServiceName.name)` calls

**Real-time Events:**

- Server-Sent Events (SSE): `apps/api/src/sse/` module
- Frontend SSE store: `apps/frontend/src/store/useSseStore.ts`
- Used for: conference updates, mail notifications, Docker events, and more

## CI/CD & Deployment

**Hosting:**

- Docker containers published to GitHub Container Registry (`ghcr.io/edulution-io/`)
- Frontend: nginx serving static build (`apps/frontend/Dockerfile`)
- API: Node.js running compiled NestJS app (`apps/api/Dockerfile`)

**CI Pipeline:**

- GitHub Actions (`.github/workflows/`)
  - `build-and-test.yml` - PR validation (build + test)
  - `container-build.yml` - Docker image builds
  - `api-tag.yml` / `frontend-tag.yml` - Release tagging
  - `bump-patch-version-tag.yml` / `bump-minor-version-tag.yml` - Automated version bumps
  - `publish-ui-kit.yml` - Publish shared UI kit library
  - `auto-merge-master-back-in-dev.yml` - Keep dev branch up to date

**Pre-commit Hooks:**

- Husky + lint-staged: linting, formatting, circular dependency check, translation check, filename check, license header check
- Scripts in `scripts/`: `checkCircDeps.sh`, `checkTranslations.ts`, `checkFilenames.ts`, `addLicenseHeader.ts`

## Environment Configuration

**Required env vars (API - `apps/api/.env.default`):**

- Base: `EDUI_HOST`, `EDUI_PORT`, `EDUI_CORS_URL`, `EDULUTION_BASE_DOMAIN`
- MongoDB: `MONGODB_SERVER_URL`, `MONGODB_DATABASE_NAME`, `MONGODB_USERNAME`, `MONGODB_PASSWORD`
- Redis: `REDIS_HOST`, `REDIS_PORT`
- Keycloak: `KEYCLOAK_API`, `KEYCLOAK_EDU_UI_REALM`, `KEYCLOAK_EDU_UI_CLIENT_ID`, `KEYCLOAK_EDU_UI_SECRET`, `KEYCLOAK_EDU_API_CLIENT_ID`, `KEYCLOAK_EDU_API_CLIENT_SECRET`
- LDAP: `LDAP_TUNNEL_URL`, `LDAP_EDULUTION_BINDUSER_DN`, `LDAP_EDULUTION_BINDUSER_PASSWORD`

**Required env vars (Frontend - `apps/frontend/.env.default`):**

- `VITE_LMN_URL`, `VITE_LMN_API_URL`, `VITE_EDU_API_URL`
- `VITE_GUACAMOLE_URL`, `VITE_KEYCLOAK_URL`, `VITE_ONLYOFFICE_URL`

**Secrets location:**

- `.env` files per app (not committed, listed in `.gitignore`)
- OIDC certificate: `edulution.pem` in repo root (copied to `data/` in dev)

## Webhooks & Callbacks

**Incoming:**

- Webhook endpoint: `apps/api/src/webhook/webhook.controller.ts`
  - Protected by: `apps/api/src/webhook/webhook.guard.ts`
  - Event deduplication via Redis (`apps/api/src/webhook/webhook.service.ts`)
  - Webhook clients management: `apps/api/src/webhook-clients/`

**Outgoing:**

- Push notifications via Expo (`apps/api/src/notifications/queue/push-notification.queue.ts`)
- SSE events to connected frontend clients (`apps/api/src/sse/sse.service.ts`)

## Docker Management

**Docker API Integration:**

- Purpose: Manage Docker containers for educational applications (Moodle, OnlyOffice, etc.)
- Client: `dockerode` ^4.0.3 in `apps/api/src/docker/docker.service.ts`
- Features: Container lifecycle management, Docker event streaming via RxJS, compose file generation
- Protected containers list: prevents accidental deletion of system containers

## Internal Communication Patterns

**Event Bus:**

- `@nestjs/event-emitter` used extensively for cross-module communication
- Events defined in `@libs/appconfig/constants/eventEmitterEvents`
- Services use `@OnEvent()` decorators to react to configuration changes

**Job Queues:**

- BullMQ with Redis backend
- Queue instances: `apps/api/src/lmnApi/queue/lmn-api-request.queue.ts`, `apps/api/src/notifications/queue/push-notification.queue.ts`
- Default options: `removeOnComplete: true`, `removeOnFail: true`

**WebSocket:**

- Native WS adapter (`@nestjs/platform-ws`) configured in `apps/api/src/main.ts`
- Used for: tldraw real-time sync (`apps/api/src/tldraw-sync/`)

**IMAP IDLE:**

- Real-time mail monitoring: `apps/api/src/mails/mail-idle.service.ts`
- Max connections: `EDUI_MAIL_IDLE_MAX_CONNECTIONS` (default: 500)

---

_Integration audit: 2026-03-09_
