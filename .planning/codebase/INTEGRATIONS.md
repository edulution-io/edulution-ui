# External Integrations

**Analysis Date:** 2026-02-26

## APIs & External Services

**Identity / Authentication:**

- Keycloak — OIDC provider for user auth (browser login flow) and API-level user/group management
  - SDK/Client (frontend): `react-oidc-context` + `oidc-client-ts`, config in `apps/frontend/src/App.tsx`
  - SDK/Client (API): `axios` instance against Keycloak REST API, `@nestjs/jwt` for RS256 JWT verification
  - Auth: `KEYCLOAK_API`, `KEYCLOAK_EDU_UI_REALM`, `KEYCLOAK_EDU_UI_CLIENT_ID`, `KEYCLOAK_EDU_UI_SECRET`, `KEYCLOAK_EDU_API_CLIENT_ID`, `KEYCLOAK_EDU_API_CLIENT_SECRET`, `KEYCLOAK_ADMIN`, `KEYCLOAK_ADMIN_PASSWORD`
  - Public key file for JWT: `data/edulution.pem` (referenced via `PUBLIC_KEY_FILE_PATH` constant)
  - Service: `apps/api/src/auth/auth.service.ts`, guard: `apps/api/src/auth/auth.guard.ts`

**Video Conferencing:**

- BigBlueButton (BBB) — virtual classroom integration
  - Client: plain `axios` with XML-based API (`xml2js` for parsing responses)
  - Auth: BBB API URL and secret stored in app config (loaded at module init)
  - Service: `apps/api/src/conferences/conferences.service.ts`

**File Access / Document Editing:**

- Nextcloud WebDAV — file storage and sharing
  - Client: `got` (streaming) + `axios` for WebDAV HTTP calls (PROPFIND, PUT, COPY, MOVE, etc.)
  - Auth: per-user credentials passed in request headers
  - URL config: `EDUI_WEBDAV_URL`
  - Service: `apps/api/src/webdav/webdav.service.ts`

- OnlyOffice — collaborative document editing
  - SDK/Client (frontend): `@onlyoffice/document-editor-react`
  - Auth: `EDULUTION_ONLYOFFICE_JWT_SECRET` (JWT-signed document tokens)
  - URL config: `VITE_ONLYOFFICE_URL` (frontend), proxied at `/docservice` in dev
  - Integration point: `apps/api/src/filesharing/`, `apps/frontend/src/pages/` (OnlyOffice page)

**Remote Desktop / VDI:**

- Apache Guacamole — browser-based RDP/VNC/SSH gateway
  - Client: `axios` instance against Guacamole REST API + `@glokon/guacamole-common-js` (frontend WebSocket tunnel)
  - Auth: `EDULUTION_GUACAMOLE_ADMIN_USER`, `EDULUTION_GUACAMOLE_ADMIN_PASSWORD`
  - URL config: `VITE_GUACAMOLE_URL`, proxied at `/guacamole` in dev
  - Service: `apps/api/src/vdi/vdi.service.ts`

- LMN-VDI API — virtual machine management (LinuxMuster-specific)
  - Client: `axios` instance
  - Auth: `LMN_VDI_API_URL`, `LMN_VDI_API_SECRET`
  - Service: `apps/api/src/vdi/vdi.service.ts`

**Classroom Management:**

- LMN API (LinuxMuster.net API) — school network management (users, classes, projects, sessions, quotas, devices, printers)
  - Client: `axios` with per-request auth token (base64-encoded)
  - Auth: token obtained via `lmnApiService.getLmnApiToken()`, URL: `LMN_API_BASE_URL`
  - URL config: `VITE_LMN_API_URL`, proxied at `/api` in dev
  - Service: `apps/api/src/lmnApi/lmnApi.service.ts`

- Veyon — classroom monitoring and control (screen view, feature control)
  - Client: `axios` instance against Veyon Proxy API
  - Auth: URL and credentials stored in app config
  - Service: `apps/api/src/veyon/veyon.service.ts`

**VPN:**

- WireGuard (custom edulution-wireguard microservice) — peer/site VPN management
  - Client: `axios` instance with custom API key header (`EDU_WG_API_KEY`)
  - Auth: `EDU_WG_API_URL`, `EDU_WG_API_KEY`
  - Default URL: `http://edulution-wireguard:8000/api/wireguard`
  - Service: `apps/api/src/wireguard/wireguard.service.ts`

**Email:**

- Mailcow — mail server sync job API
  - Client: `axios` with API token header
  - Auth: `MAILCOW_API_URL`, `MAILCOW_API_TOKEN`
  - Service: `apps/api/src/mails/mails.service.ts`

- SOGo (webmail) — mail client integration (theme management, mail sync)
  - Client: `axios` against SOGo API within Mailcow container
  - Auth: `KEYCLOAK_EDU_MAILCOW_SYNC_SECRET` (Keycloak-Mailcow sync secret)
  - Service: `apps/api/src/mails/mails.service.ts`

- IMAP (generic) — real-time mail notifications
  - SDK: `imapflow` 1.0
  - Config: per-user IMAP credentials
  - Env: `EDUI_MAIL_IMAP_TIMEOUT`, `EDUI_MAIL_IDLE_MAX_CONNECTIONS`
  - Service: `apps/api/src/mails/mails.service.ts`

**Push Notifications:**

- Expo Push Notification Service — mobile app push notifications
  - SDK: `expo-server-sdk` 3.15
  - Client: `new Expo()` instance in BullMQ worker
  - No separate API key needed (uses Expo token on device side)
  - Queue: `apps/api/src/notifications/queue/push-notification.queue.ts`

**Collaborative Whiteboard:**

- TLDraw Sync — real-time multi-user whiteboard
  - SDK: `@tldraw/sync-core` (server), `tldraw` + `@tldraw/sync` (frontend)
  - Transport: WebSocket (NestJS WebSocket gateway)
  - Persistence: MongoDB (TLDrawSyncRoom schema)
  - Gateway: `apps/api/src/tldraw-sync/tldraw-sync.gateway.ts`
  - Service: `apps/api/src/tldraw-sync/tldraw-sync.service.ts`

**Container Management:**

- Docker Engine — manage application containers/compose stacks
  - SDK: `dockerode` 4.0 (connects to `/var/run/docker.sock`)
  - Used to manage edulution application containers (Mailcow, Guacamole, OnlyOffice, Moodle, etc.)
  - Service: `apps/api/src/docker/docker.service.ts`

**Directory Services:**

- LDAP — user/group synchronization into Keycloak
  - SDK: `ldapts` 8.0
  - Auth: `LDAP_TUNNEL_URL`, `LDAP_EDULUTION_BINDUSER_DN`, `LDAP_EDULUTION_BINDUSER_PASSWORD`
  - Sync interval: `LDAP_SYNC_INTERVAL_MS`
  - Service: `apps/api/src/ldap-keycloak-sync/ldap-keycloak-sync.service.ts`

## Data Storage

**Databases:**

- MongoDB 7 — primary persistent data store
  - ORM: Mongoose 8.9 via `@nestjs/mongoose`
  - Connection: `MONGODB_SERVER_URL`, `MONGODB_DATABASE_NAME`, `MONGODB_USERNAME`, `MONGODB_PASSWORD`
  - Schemas: User, Conference, Notification, TLDrawSyncRoom, BulletinBoard, Survey, WebdavShare, and many more (one schema file per entity)
  - Local dev: Docker container `mongoEdu` (port 27017)

**File Storage:**

- Local filesystem under `data/` directory — stores uploaded files, certificates, public assets
  - Folder paths defined in `libs/src/common/constants/folderPaths.ts`
  - Served statically via `@nestjs/serve-static` at `/edu-api/downloads` and `/edu-api/public/assets`

**Caching:**

- Redis 8.2 — cache layer and BullMQ job queue backend
  - Client: `@keyv/redis` (for `@nestjs/cache-manager`), `ioredis` 5.6 (for BullMQ and webhook deduplication)
  - Connection: `REDIS_HOST`, `REDIS_PORT`
  - Local dev: Docker container `redisEdu` (port 6379)

## Authentication & Identity

**Auth Provider:**

- Keycloak — OAuth 2.0 / OIDC provider
  - Frontend flow: OIDC Authorization Code via `react-oidc-context`; config fetched from `VITE_KEYCLOAK_URL` (proxied through API in production)
  - API JWT verification: RS256 public key from `data/edulution.pem`
  - TOTP/2FA: `otpauth` (TOTP) + QR code (`qrcode.react`) for 2FA enrollment
  - API proxies OIDC discovery endpoint and token endpoint to Keycloak
  - LDAP users are synced into Keycloak via `apps/api/src/ldap-keycloak-sync/`

**Token Storage:**

- Frontend: JWT stored in Zustand store (`eduApiToken`), persisted to localStorage; set as default Authorization header on `eduApi` axios instance
- API: stateless JWT verification on every request via `AuthGuard`

## Monitoring & Observability

**Error Tracking:**

- Sentry — error tracking for both frontend and API
  - Frontend SDK: `@sentry/react` (lazy-initialized on first load from stored config)
  - API SDK: `@sentry/nestjs` + `@sentry/profiling-node`
  - Config: `ENABLE_SENTRY`, `SENTRY_EDU_UI_DSN` (frontend), `SENTRY_EDU_API_DSN` (API)
  - Sentry config is fetched by frontend from API and cached in localStorage (`sentryConfig`)
  - Frontend init: `apps/frontend/src/store/useSentryStore.ts`
  - API init: `apps/api/src/sentry/enableSentryForNest.ts`

**Health Checks:**

- `@nestjs/terminus` — `/edu-api/health` endpoint
  - Module: `apps/api/src/health/health.module.ts`

**Metrics:**

- Custom metrics endpoint — Docker container stats via dockerode
  - Module: `apps/api/src/metrics/metrics.module.ts`

**Logs:**

- NestJS ConsoleLogger with configurable log levels (`EDUI_LOG_LEVEL`: off, error, warn, log, debug, verbose)
- Static `Logger` calls with service name as context throughout API services

## CI/CD & Deployment

**Container Registry:**

- GitHub Container Registry (`ghcr.io/edulution-io/`) — Docker images for frontend and API

**CI Pipeline:**

- Not detected in repository (external CI assumed)

**Reverse Proxy:**

- Nginx: `nginx.conf` — static frontend serving + API proxying
- Traefik: `traefik/` — edge proxy (production routing)

## Server-Sent Events

**SSE:**

- Custom SSE module — real-time push from API to frontend
  - Module: `apps/api/src/sse/`
  - Used by: notifications, conference updates, mail notifications, Docker events, LDAP sync status, TLDraw state
  - Frontend consumes via `EventSource` / dedicated stores

## Webhooks & Callbacks

**Incoming:**

- Webhook endpoint — receives external events, deduplicates via Redis
  - Module: `apps/api/src/webhook/webhook.module.ts`
  - Service: `apps/api/src/webhook/webhook.service.ts`

**Outgoing:**

- Webhook clients — fires HTTP callbacks to configured external URLs
  - Module: `apps/api/src/webhook-clients/webhook-clients.module.ts`

## Environment Configuration

**Required env vars (API):**

- `MONGODB_SERVER_URL`, `MONGODB_DATABASE_NAME`, `MONGODB_USERNAME`, `MONGODB_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`
- `KEYCLOAK_API`, `KEYCLOAK_EDU_UI_REALM`, `KEYCLOAK_EDU_UI_CLIENT_ID`, `KEYCLOAK_EDU_UI_SECRET`
- `KEYCLOAK_EDU_API_CLIENT_ID`, `KEYCLOAK_EDU_API_CLIENT_SECRET`
- `KEYCLOAK_ADMIN`, `KEYCLOAK_ADMIN_PASSWORD`
- `EDUI_WEBDAV_URL` (WebDAV/OnlyOffice)
- `LMN_API_BASE_URL` (LinuxMuster)

**Required env vars (Frontend):**

- `VITE_EDU_API_URL` — edulution API base URL
- `VITE_KEYCLOAK_URL` — Keycloak base URL
- `VITE_LMN_URL` — LinuxMuster server URL
- `VITE_LMN_API_URL` — LMN API URL
- `VITE_ONLYOFFICE_URL` — OnlyOffice document server URL
- `VITE_GUACAMOLE_URL` — Guacamole URL

**Secrets location:**

- `.env` files per app (gitignored); certificate files (`*.pem`) committed to repo root for dev use only

---

_Integration audit: 2026-02-26_
