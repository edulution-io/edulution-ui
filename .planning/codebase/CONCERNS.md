# Codebase Concerns

**Analysis Date:** 2026-03-09

## Tech Debt

**Oversized Service Files (God Objects):**

- Issue: Several API services exceed 500 lines, concentrating too many responsibilities in single files. The worst offender is `lmnApi.service.ts` at 1180 lines with 30+ repetitive try/catch methods following an identical pattern.
- Files:
  - `apps/api/src/lmnApi/lmnApi.service.ts` (1180 lines)
  - `apps/api/src/ldap-keycloak-sync/ldap-keycloak-sync.service.ts` (863 lines)
  - `apps/api/src/notifications/notifications.service.ts` (721 lines)
  - `apps/api/src/surveys/survey-answers.service.ts` (626 lines)
  - `apps/api/src/docker/docker.service.ts` (607 lines)
  - `apps/api/src/mails/mail-idle.service.ts` (600 lines)
  - `apps/api/src/groups/groups.service.ts` (555 lines)
  - `apps/api/src/bulletinboard/bulletinboard.service.ts` (527 lines)
  - `apps/api/src/mails/mails.service.ts` (526 lines)
  - `apps/api/src/filesharing/filesharing.service.ts` (515 lines)
  - `apps/api/src/conferences/conferences.service.ts` (508 lines)
  - `apps/api/src/filesystem/filesystem.service.ts` (489 lines)
  - `apps/api/src/webdav/webdav.service.ts` (463 lines)
  - `apps/api/src/parent-child-pairing/parent-child-pairing.service.ts` (451 lines)
- Impact: Hard to test, hard to reason about, high risk when making changes
- Fix approach: Extract repeated patterns (e.g., the LMN API try/catch wrapper) into a decorator or shared utility. Split large services by subdomain.

**Oversized Frontend Components and Stores:**

- Issue: Several React components and Zustand stores exceed 300 lines
- Files:
  - `apps/frontend/src/components/ui/MultipleSelectorSH.tsx` (598 lines, with a broad eslint-disable at top)
  - `apps/frontend/src/pages/ClassManagement/useClassManagementStore.ts` (438 lines)
  - `apps/frontend/src/pages/LoginPage/LoginPage.tsx` (430 lines)
  - `apps/frontend/src/pages/Settings/AppConfig/wireguard/AddWireguardPeerDialog.tsx` (398 lines)
  - `apps/frontend/src/pages/FileSharing/Table/FileSharingTable.tsx` (377 lines)
  - `apps/frontend/src/pages/FileSharing/Dialog/upload/useHandleUploadFileStore.ts` (352 lines)
  - `apps/frontend/src/pages/LinuxmusterPage/UserManagement/useUserManagementStore.ts` (345 lines)
- Impact: Difficult to maintain, test, or refactor
- Fix approach: Break large components into smaller sub-components. Extract store logic into separate action files.

**Zustand Stores Not Registered in cleanAllStores:**

- Issue: 25+ Zustand stores are missing from the cleanup registry at `apps/frontend/src/store/utils/cleanAllStores.ts`. This means user state persists across logouts, potentially leaking data between users.
- Files: `apps/frontend/src/store/utils/cleanAllStores.ts`
- Missing stores include:
  - `useDockerApplicationStore`
  - `useDownloadAcknowledgedStore`
  - `useExportSurveyToPdfStore`
  - `useFileContentPreviewStore`
  - `useFileEditorContentStore`
  - `useFileSharingMoveDialogStore`
  - `useHandleUploadFileStore`
  - `usePlatformStore`
  - `useReplaceFilesDialogStore`
  - `useSentryStore`
  - `useSharePublicConferenceStore`
  - `useSubMenuStore`
  - `useTableViewSettingsStore`
  - `useThemeStore`
  - `useUserPreferencesStore`
  - `useUserSettingsPageStore`
  - `useUserWireguardStore`
  - `useWebdavServerConfigTableStore`
  - `useWebhookClientsStore`
  - `useWhiteboardEditorStore`
  - `useWireguardConfigTableStore`
  - `useUserStore` (uses UserStore combined store but individual reset may be handled differently)
- Impact: Stale state after logout, potential data leakage between user sessions
- Fix approach: Add all stores to `cleanAllStores.ts`. Consider an automated check (pre-commit script) to ensure new stores get registered.

**Broad eslint-disable Directives:**

- Issue: Some files disable multiple rules with broad eslint-disable comments rather than fixing underlying issues
- Files:
  - `apps/frontend/src/components/ui/MultipleSelectorSH.tsx` - disables 6 rules at file level
  - `apps/api/jest.config.ts` - `/* eslint-disable */`
  - `apps/api/src/webdav/shares/webdav-shares.service.ts` - disables `no-restricted-syntax`
  - `apps/api/src/ldap-keycloak-sync/ldap-keycloak-sync.schema.ts` - disables `max-classes-per-file`
  - `apps/api/src/global-settings/schemas/global-settings.theme.schema.ts` - disables `max-classes-per-file`
- Impact: Bypasses type safety and code quality rules
- Fix approach: Address the underlying issues instead of suppressing rules. For `MultipleSelectorSH.tsx`, consider a rewrite.

**Open TODO Items with Tracked Issues:**

- Issue: 8 TODO comments reference open issues or planned improvements
- Files and references:
  - `apps/api/src/docker/docker.service.ts:55` - Docker API support (#396)
  - `apps/api/src/surveys/public-surveys.controller.spec.ts:171` - NIEDUUI-404: Survey answer validation
  - `apps/api/src/surveys/surveys.service.spec.ts:193` - NIEDUUI-405: Survey limiter updates
  - `apps/frontend/src/store/useLmnApiStore.ts:156` - LMN API 7.3 error handling (#1331)
  - `apps/frontend/src/pages/Surveys/Tables/dialogs/SubmittedAnswersDialog.tsx:59` - NIEDUUI-222: User answer selection
  - `apps/frontend/src/pages/UserSettings/Details/UserSettingsDetailsForm.tsx:36,55` - NIEDUUI-417: Dynamic user fields
  - `apps/frontend/src/pages/Settings/AppConfig/components/ExtendedOptionsForm.tsx:122` - Generic textarea rework
- Impact: Deferred functionality and missing validation
- Fix approach: Triage and schedule resolution as separate tasks

**DTOs Lack Validation Decorators:**

- Issue: DTO classes do not use `class-validator` decorators. No `ValidationPipe` usage detected. Input validation relies solely on TypeScript types, which are erased at runtime.
- Files:
  - `apps/api/src/users/dto/create-user.dto.ts`
  - `apps/api/src/users/dto/update-user.dto.ts`
- Impact: API accepts any shape of input at runtime without validation, risking malformed data in the database
- Fix approach: Add `class-validator` decorators to all DTOs and enable `ValidationPipe` globally in the NestJS bootstrap

**Scattered process.env Usage:**

- Issue: Environment variables are accessed directly via `process.env` across many files instead of being centralized through NestJS `ConfigService`
- Files:
  - `apps/api/src/lmnApi/lmnApi.service.ts:69,73`
  - `apps/api/src/lmnApi/queue/lmn-api-request.queue.ts:40,53`
  - `apps/api/src/app/app.module.ts:85`
  - `apps/api/src/common/redis.connection.ts:21-22`
  - `apps/api/src/ldap-keycloak-sync/ldap-keycloak-sync.service.ts:449`
  - `apps/api/src/sentry/enableSentryForNest.ts:28-29,45`
  - `apps/api/src/webdav/shares/webdav-shares.service.ts:65,79`
  - `apps/api/src/surveys/migrations/surveyTemplatesMigration001LoadDefaultTemplates.ts:41`
  - `apps/api/src/global-settings/migrations/migration004.ts:26`
  - `apps/api/src/filesharing/wopi.controller.ts:61`
  - `apps/api/src/common/CustomHttpException.ts:35`
- Impact: Hard to test (requires env manipulation), no startup validation that required vars exist, scattered config
- Fix approach: Centralize all env access through `apps/api/src/config/configuration.ts` and inject via `ConfigService`

## Security Considerations

**TLS Certificate Verification Disabled Globally:**

- Risk: `rejectUnauthorized: false` is used across 8 locations, meaning the API does not verify TLS certificates for any external connection (LMN API, LDAP, WebDAV, IMAP, health checks)
- Files:
  - `apps/api/src/lmnApi/lmnApi.service.ts:81`
  - `apps/api/src/lmnApi/queue/lmn-api-request.queue.ts:50`
  - `apps/api/src/ldap-keycloak-sync/ldap-keycloak-sync.service.ts:464`
  - `apps/api/src/webdav/webdav.service.ts:286`
  - `apps/api/src/webdav/webdav.client.factory.ts:29`
  - `apps/api/src/mails/mails.service.ts:86`
  - `apps/api/src/mails/mail-idle.service.ts:82`
  - `apps/api/src/health/health.module.ts:32`
- Current mitigation: Likely internal network assumption (school infrastructure)
- Recommendations: Allow configuring trusted CAs via environment. At minimum, make `rejectUnauthorized` configurable per service rather than hardcoded to `false`.

**dangerouslySetInnerHTML Without Sanitization:**

- Risk: Raw HTML is rendered without DOMPurify or equivalent sanitization
- Files:
  - `apps/frontend/src/pages/EmbeddedPage/EmbeddedPageContent.tsx:98`
  - `apps/frontend/src/pages/Settings/AppConfig/components/EmbeddedPageEditor.tsx:135`
- Current mitigation: The `htmlContent` appears to come from admin-configured app configs, not user input
- Recommendations: Add DOMPurify sanitization before rendering. Even admin-sourced HTML can contain XSS vectors if the admin account is compromised.

**LMN API Token Fallback to Space String:**

- Risk: When `getLmnApiToken()` gets empty/falsy data, it returns a single space `' '` instead of throwing an error. This truthy-but-invalid token propagates through the system.
- Files: `apps/api/src/lmnApi/lmnApi.service.ts:144`
- Current mitigation: None
- Recommendations: Throw an authentication error when the LMN API returns no token

**validateStatus: () => true Suppresses HTTP Errors:**

- Risk: Axios is configured to accept any HTTP status as success, meaning 401/403/500 responses are silently treated as valid
- Files: `apps/api/src/lmnApi/lmnApi.service.ts:141`
- Current mitigation: None visible
- Recommendations: Only suppress specific expected status codes, not all

**No Rate Limiting on API:**

- Risk: No `@Throttle` decorator or rate limiting middleware detected on any endpoint, including authentication and public routes
- Files: All controller files in `apps/api/src/`
- Current mitigation: Possibly handled at nginx/infrastructure level
- Recommendations: Add `@nestjs/throttler` for defense in depth, especially on `@Public()` endpoints

## Performance Bottlenecks

**LMN API Single-Threaded Queue:**

- Problem: All LMN API requests funnel through a single queue (`lmn-api-request.queue.ts`), serializing all requests to the external LMN API
- Files: `apps/api/src/lmnApi/queue/lmn-api-request.queue.ts`
- Cause: Queue ensures ordering but creates a bottleneck under concurrent users
- Improvement path: Consider parallel execution with concurrency limits, or separate queues per operation type

**77 Zustand Stores:**

- Problem: The frontend has 77 Zustand stores, all needing individual cleanup on logout
- Files: All `use*Store.ts` files under `apps/frontend/src/`
- Cause: Each feature/dialog gets its own store
- Improvement path: Consolidate related stores (e.g., merge all file-sharing dialog stores into a single slice-based store)

## Fragile Areas

**MultipleSelectorSH Component:**

- Files: `apps/frontend/src/components/ui/MultipleSelectorSH.tsx`
- Why fragile: 598 lines, 6 eslint rules disabled, uses `'use client'` directive (unusual in this Vite project), complex state management with refs and callbacks
- Safe modification: Test thoroughly in all usage contexts before changing
- Test coverage: None (0 frontend test files exist)

**Login Flow:**

- Files: `apps/frontend/src/pages/LoginPage/LoginPage.tsx` (430 lines), `apps/frontend/src/pages/LoginPage/useSilentLoginWithPassword.ts`
- Why fragile: Complex OIDC/Keycloak integration with silent login, multiple error paths with emoji-laden console logs, hardcoded timeouts
- Safe modification: Changes require testing against actual Keycloak instance
- Test coverage: None

**LDAP-Keycloak Sync:**

- Files: `apps/api/src/ldap-keycloak-sync/ldap-keycloak-sync.service.ts` (863 lines)
- Why fragile: Manages critical user provisioning, complex LDAP pagination, group membership resolution with recursive expansion, caching logic
- Safe modification: Must test with actual LDAP/Keycloak setup
- Test coverage: No spec file exists

## Test Coverage Gaps

**Zero Frontend Tests:**

- What's not tested: The entire React frontend (723 source files) has no test files whatsoever
- Files: All files under `apps/frontend/src/`
- Risk: UI regressions, store logic bugs, and component rendering issues go undetected
- Priority: High - especially for complex stores like `useClassManagementStore.ts`, `useHandleUploadFileStore.ts`, and critical flows like login

**API Service Test Coverage at ~30%:**

- What's not tested: 30 out of 43 service files lack spec files. 16 out of ~30 controller files lack spec files.
- Files: Key untested services:
  - `apps/api/src/auth/auth.service.ts` - authentication logic
  - `apps/api/src/docker/docker.service.ts` - container management
  - `apps/api/src/notifications/notifications.service.ts` - notification delivery
  - `apps/api/src/mails/mails.service.ts` - email handling
  - `apps/api/src/mails/mail-idle.service.ts` - IMAP idle connections
  - `apps/api/src/filesystem/filesystem.service.ts` - file operations
  - `apps/api/src/filesharing/filesharing.service.ts` (has spec but large untested surface)
  - `apps/api/src/webdav/webdav.service.ts` - WebDAV operations
  - `apps/api/src/bulletinboard/bulletinboard.service.ts` - bulletin board logic
  - `apps/api/src/ldap-keycloak-sync/ldap-keycloak-sync.service.ts` - LDAP sync
  - `apps/api/src/parent-child-pairing/parent-child-pairing.service.ts` - parent-child pairing
  - `apps/api/src/tldraw-sync/tldraw-sync.service.ts` - whiteboard sync
- Risk: Service-layer bugs in authentication, file operations, and external integrations go undetected
- Priority: High for auth, filesystem, and LDAP sync services

**Library Code Untested:**

- What's not tested: The shared `libs/` directory has no test files
- Files: All files under `libs/src/`
- Risk: Shared utilities used by both frontend and API lack validation
- Priority: Medium - especially for `libs/src/common/utils/` utilities

## Dependencies at Risk

**`as any` Usage in Test Files:**

- Risk: Test files use `as any` casts (6 occurrences in API specs) to bypass type checking, meaning tests may not catch type-related regressions
- Impact: False confidence in test results
- Migration plan: Use proper mock typing or `@ts-expect-error` with comments explaining why

## Missing Critical Features

**Input Validation Pipeline:**

- Problem: No `class-validator` or `ValidationPipe` usage detected across the entire API
- Blocks: Cannot guarantee API input correctness at runtime; any malformed request body is accepted as-is
- Fix: Add `class-validator` decorators to DTOs, enable global `ValidationPipe` in `apps/api/src/main.ts`

---

_Concerns audit: 2026-03-09_
