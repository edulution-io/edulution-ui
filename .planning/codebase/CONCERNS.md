# Codebase Concerns

**Analysis Date:** 2026-02-26

---

## Tech Debt

**TLS Certificate Verification Disabled Across Multiple Services:**

- Issue: `rejectUnauthorized: false` is hardcoded in many HTTPS agents, bypassing TLS certificate validation entirely.
- Files:
  - `apps/api/src/lmnApi/lmnApi.service.ts:80`
  - `apps/api/src/lmnApi/queue/lmn-api-request.queue.ts:50`
  - `apps/api/src/mails/mails.service.ts:86`
  - `apps/api/src/mails/mail-idle.service.ts:82`
  - `apps/api/src/webdav/webdav.service.ts:287`
  - `apps/api/src/webdav/webdav.client.factory.ts:29`
  - `apps/api/src/ldap-keycloak-sync/ldap-keycloak-sync.service.ts:465`
  - `apps/api/src/health/health.module.ts:32`
- Impact: Man-in-the-middle attacks are possible on all connections to LMN API, mail (IMAP/SMTP), WebDAV, and LDAP. This is a systematic pattern, not a one-off exception.
- Fix approach: Introduce environment-configurable CA bundles or per-integration flags. Only the mail IMAP has a config-driven opt-out (`MAIL_IMAP_TLS_REJECT_UNAUTHORIZED`); apply the same pattern to the others.

**LMN API Quota Error Handling Commented Out:**

- Issue: Error handling for quota fetch is intentionally suppressed pending LMN API 7.3 support.
- Files: `apps/frontend/src/store/useLmnApiStore.ts:156`
- Impact: Quota fetch failures are silently swallowed. Users and developers get no indication when quota data is unavailable.
- Fix approach: Re-enable `handleApiError(error, set)` once LMN API 7.3 is the minimum required version. Tracked at https://github.com/edulution-io/edulution-ui/issues/1331.

**LMN API Token Persisted in localStorage:**

- Issue: `lmnApiToken` is stored in `localStorage` via Zustand persist (`lmn-user-storage` key) and survives page reloads.
- Files: `apps/frontend/src/store/useLmnApiStore.ts:204-211`
- Impact: The LMN API bearer token is exposed to any JavaScript running in the same origin (XSS risk). An attacker gaining script execution can exfiltrate the token.
- Fix approach: Store only in memory (Zustand state without persist), or use `sessionStorage` at minimum, and re-acquire on page reload via a silent authentication flow.

**`eduApiToken` (Access Token) Persisted in localStorage:**

- Issue: The OIDC access token is stored in `localStorage` via Zustand persist (`user-storage` key).
- Files: `apps/frontend/src/store/UserStore/useUserStore.ts:42-43`
- Impact: Same XSS exfiltration risk as above for the primary API access token.
- Fix approach: Do not persist access tokens to `localStorage`. Use in-memory storage and let the OIDC library handle silent renewal. If persistence is needed, use `sessionStorage`.

**Docker Integration Only Supports Unix Socket (No TCP):**

- Issue: Docker access is hardcoded to `/var/run/docker.sock` with no support for the Docker API over TCP/TLS.
- Files: `apps/api/src/docker/docker.service.ts:55-58`
- Impact: Cannot connect to remote Docker daemons or Docker over TCP. Limits deployment flexibility.
- Fix approach: Tracked at https://github.com/edulution-io/edulution-ui/issues/396. Accept a `DOCKER_HOST` env var falling back to socket path.

**UserSettings Details Form is Hardcoded for Teacher Role Only:**

- Issue: The user detail fields are only populated for `SOPHOMORIX_GROUP_TYPES.TEACHER` and are statically defined rather than derived from the user object.
- Files: `apps/frontend/src/pages/UserSettings/Details/UserSettingsDetailsForm.tsx:36-66`
- Impact: Students, admins, and other roles see empty user settings. Tracked as NIEDUUI-417.
- Fix approach: Derive fields dynamically from the user's role and the user object schema.

**Surveys: Missing Validation Test and Backendlimiters Not Updated on Question Changes:**

- Issue: Two survey-related correctness gaps are deferred with TODO markers:
  1. NIEDUUI-404: Invalid survey answers can be added without validation failure (test is commented out).
  2. NIEDUUI-405: Backend rate limiters are not updated when a survey question is removed or renamed.
- Files:
  - `apps/api/src/surveys/public-surveys.controller.spec.ts:171`
  - `apps/api/src/surveys/surveys.service.spec.ts:193`
- Impact: Malformed answers can pollute survey results; stale limiters may accept or reject requests incorrectly after survey edits.
- Fix approach: Implement the missing logic in `survey-answers.service.ts` and `surveys.service.ts` and uncomment/add the corresponding tests.

**Admin-Only Survey Answer View Is Not Implemented:**

- Issue: Admins cannot select a specific user to view their submitted answers; only the current user's answers are shown.
- Files: `apps/frontend/src/pages/Surveys/Tables/dialogs/SubmittedAnswersDialog.tsx:59`
- Impact: Admins reviewing survey responses must rely on workarounds. Tracked as NIEDUUI-222.
- Fix approach: Add a user-selection dropdown in `SubmittedAnswersDialog` that is visible when the current user has admin privileges.

**Mail Sync Job Delete Has No Permission Check:**

- Issue: `deleteSyncJobs` in `MailsService` includes a comment noting permission checks are not implemented (NIEDUUI-374).
- Files: `apps/api/src/mails/mails.service.ts:511-512`
- Impact: A user who knows another user's sync job IDs can delete them.
- Fix approach: Verify the requesting user's `emailAddress` owns each `syncJobId` before deleting.

**ExtendedOptionsForm Uses `unknown as` Type Casts:**

- Issue: Multiple unsafe type casts (`as unknown as UseFormReturn<...>`, `as unknown as Control<FieldValues>`) are used because the form type is too generic.
- Files: `apps/frontend/src/pages/Settings/AppConfig/components/ExtendedOptionsForm.tsx:126-133`
- Impact: Type errors are hidden; incorrect form instances could be passed, causing runtime failures in config forms.
- Fix approach: Tracked in https://github.com/edulution-io/edulution-ui/issues/724. Refactor `EmbeddedPageEditor` and `AppConfigDropdownSelect` to accept properly typed generics.

**Absolute Import Paths Inside `apps/` Instead of Aliases:**

- Issue: Several survey-related files use full absolute paths starting with `apps/api/src/` in import statements instead of relative paths or configured path aliases.
- Files:
  - `apps/api/src/surveys/surveys-template.service.ts:28-30`
  - `apps/api/src/surveys/surveys.module.ts:22`
  - `apps/api/src/surveys/public-surveys.controller.ts:48-49`
  - `apps/api/src/surveys/survey-answer-attachments.service.ts:34`
  - `apps/api/src/surveys/migrations/surveyTemplatesMigrationsList.ts:20-21`
  - `apps/api/src/common/decorators/getCurrentUsername.decorator.ts:22`
- Impact: Imports break if the repository root changes; editors may show spurious errors in some setups.
- Fix approach: Replace `apps/api/src/...` imports with relative imports (`../../migration/migration.service`) or add a `@api/` tsconfig path alias.

**Migration Service Has No Idempotency Guard at the Runner Level:**

- Issue: `MigrationService.runMigrations` executes all listed migrations on every `onModuleInit`. Each individual migration must defensively filter already-migrated documents (which they do via `schemaVersion` checks), but the runner has no record of "already completed" migrations. Adding a migration twice to the list would run it again.
- Files: `apps/api/src/migration/migration.service.ts`
- Impact: If a developer accidentally duplicates a migration in a list, or if a migration's idempotency guard fails, data corruption can result.
- Fix approach: Store a migration log collection (name + timestamp) in MongoDB and skip migrations already recorded as completed.

---

## Known Bugs

**Survey Answer Validation Not Enforced on Public Surveys (NIEDUUI-404):**

- Symptoms: Invalid answers can be submitted to public surveys without error.
- Files: `apps/api/src/surveys/public-surveys.controller.spec.ts:171-189`
- Trigger: Posting an answer that fails backend validation constraints to a public survey endpoint.
- Workaround: None currently.

---

## Security Considerations

**Widespread TLS Verification Bypass:**

- Risk: Man-in-the-middle interception is possible on all internal service communication (LMN API, WebDAV, IMAP, LDAP). Credentials and data transiting over these connections can be read or modified.
- Files: See "TLS Certificate Verification Disabled" section above.
- Current mitigation: Services are typically on an internal network; this reduces (but does not eliminate) attack surface.
- Recommendations: Use properly signed certificates for internal services, or at minimum provide a configurable CA bundle per integration.

**Access Tokens Stored in localStorage:**

- Risk: Any XSS vulnerability in the frontend can exfiltrate `eduApiToken` (OIDC access token) and `lmnApiToken` (LMN API bearer token) from `localStorage`.
- Files:
  - `apps/frontend/src/store/UserStore/useUserStore.ts:38-44`
  - `apps/frontend/src/store/useLmnApiStore.ts:204-211`
- Current mitigation: None explicitly; tokens are protected only by same-origin policy.
- Recommendations: Remove `localStorage` persistence for tokens. Use in-memory Zustand state only; let OIDC silent renewal handle re-authentication after page load.

**Mail Sync Job Delete Without Authorization (NIEDUUI-374):**

- Risk: A user with knowledge of another user's sync job IDs can delete their sync jobs.
- Files: `apps/api/src/mails/mails.service.ts:511-523`
- Current mitigation: None.
- Recommendations: Filter sync job IDs by the authenticated user's email address before deleting.

---

## Performance Bottlenecks

**LDAP/Keycloak Sync Service Loads All Users and Groups into In-Process Memory:**

- Problem: `LdapKeycloakSyncService` maintains `userCache` (`Map<string, GroupMemberDto>`) and `groupCache` (`Map<string, Group>`) in the NestJS process memory and rebuilds them on each periodic sync cycle.
- Files: `apps/api/src/ldap-keycloak-sync/ldap-keycloak-sync.service.ts:82-84`
- Cause: Large LDAP directories with thousands of users and groups will consume significant heap memory and increase sync duration linearly.
- Improvement path: Batch-process entries in chunks instead of loading all at once; rely primarily on Redis cache (`ALL_USERS_CACHE_KEY`, `ALL_GROUPS_CACHE_KEY`) rather than in-process Maps, or implement a streaming LDAP search.

**Group Member Cache Batching Still Serializes at Batch Boundaries:**

- Problem: `tryUpdateGroupsWithMembersInCache` processes groups in batches of 20, but uses `await` between each batch (sequential batches, parallel within a batch).
- Files: `apps/api/src/groups/groups.service.ts:230-241`
- Cause: `eslint-disable no-await-in-loop` comment signals sequential awaiting in a loop.
- Improvement path: Increase batch size or make the batch processing fully concurrent using a semaphore/p-limit pattern.

**`MultipleSelectorSH` Component is 586 Lines:**

- Problem: The `MultipleSelectorSH` component is a direct copy/paste of the `cmdk`-based multiple selector, maintained in-tree without vendoring or abstraction.
- Files: `apps/frontend/src/components/ui/MultipleSelectorSH.tsx`
- Cause: External UI library copied locally rather than consumed as a dependency.
- Improvement path: Replace with the official `shadcn/ui` multiple selector package or reduce the component to a thin wrapper.

---

## Fragile Areas

**`cleanAllStores.ts` Must Be Manually Kept in Sync with Store Registry:**

- Files: `apps/frontend/src/store/utils/cleanAllStores.ts`
- Why fragile: There are 72 store files but only ~51 are listed in `cleanAllStores`. Stores added to the codebase but omitted from this file will retain stale state between sessions. Known missing stores include: `useDockerApplicationStore`, `useSharePublicConferenceStore`, `useWhiteboardEditorStore`, `useWireguardConfigTableStore`, `useWebhookClientsStore`, `useUserSettingsPageStore`, and others.
- Safe modification: Every new Zustand store that holds session state must be added to `cleanAllStores` (as required by `AGENTS.md`). This dependency is not enforced by the compiler or a test.
- Test coverage: No test validates that all stores are present in `cleanAllStores`.

**Migration Runner Has No Rollback Mechanism:**

- Files: `apps/api/src/migration/migration.service.ts`
- Why fragile: Migrations run sequentially on startup with no rollback. A failure mid-migration leaves the database in a partially migrated state. No version tracking at the runner level means re-running a broken migration requires manual DB intervention.
- Safe modification: Always make migrations idempotent (guarded by `schemaVersion` checks). Never modify previously released migrations; only add new ones.
- Test coverage: Individual migrations have no dedicated tests. Only a subset of service integration tests cover the effect of migrations indirectly.

**`LoginPage.tsx` Combines Authentication, QR Code, TOTP, SSE, and Password Encryption Logic (430 lines):**

- Files: `apps/frontend/src/pages/LoginPage/LoginPage.tsx`
- Why fragile: The login page mixes OIDC flow, password hashing/encryption (via CryptoJS), QR code SSE stream, TOTP handling, and webdav key derivation in a single 430-line component.
- Safe modification: Each concern is partially extracted to custom hooks (`useSilentLoginWithPassword`, `useAuthErrorHandler`), but the component itself still orchestrates all flows and carries mutable state for `webdavKey` and `encryptKey`. Changes to the authentication flow risk breaking adjacent features.
- Test coverage: No unit or integration tests for `LoginPage.tsx`.

**`LmnApiService` is 1153 Lines With Direct HTTP Proxy Pattern:**

- Files: `apps/api/src/lmnApi/lmnApi.service.ts`
- Why fragile: The service proxies every LMN API endpoint with individual methods. Each method duplicates the try/catch/throw pattern. Adding new LMN API endpoints requires adding boilerplate methods here.
- Safe modification: Changes to request/response types or error handling must be applied consistently across all methods.
- Test coverage: `lmnApi.service.spec.ts` (668 lines) covers many paths but relies on mocked queue responses.

---

## Scaling Limits

**TLDraw Sync Rooms Stored in a Single NestJS Process Memory Map:**

- Current capacity: All active whiteboard rooms are held in `roomsMap` (`Map<string, TLDrawRoomState>`) inside `TldrawSyncService`.
- Limit: Cannot scale horizontally; a second API instance would have no access to rooms created on the first. Also, a process restart loses all in-flight room data until rooms are reloaded from MongoDB.
- Files: `apps/api/src/tldraw-sync/tldraw-sync.service.ts`
- Scaling path: Persist rooms exclusively in MongoDB and remove the in-memory map, or use a Redis-backed room store shared across instances.

**SSE Connections Stored in a Single NestJS Process:**

- Current capacity: All active SSE connections (`Map<username, Response[]>`) live in `SseService` in-process memory.
- Limit: Cannot scale horizontally; events from one instance will not reach clients connected to another instance.
- Files: `apps/api/src/sse/sse.service.ts`
- Scaling path: Use Redis Pub/Sub to fan out SSE events across all API instances.

---

## Dependencies at Risk

**`crypto-js` Used for WebDAV Password Encryption in Frontend:**

- Risk: `CryptoJS` is deprecated and unmaintained. The specific usage (`CryptoJS.AES.encrypt(password, newEncryptKey)`) uses ECB-like key derivation from a hex string, not a proper KDF (PBKDF2/scrypt/Argon2).
- Impact: The WebDAV password stored in the user record may be weakly protected if the encrypt key is compromised.
- Files: `apps/frontend/src/pages/LoginPage/LoginPage.tsx:24,114-117`
- Migration plan: Replace with the Web Crypto API (`window.crypto.subtle`) and use a proper KDF.

---

## Missing Critical Features

**No Frontend Unit or Integration Tests:**

- Problem: Zero test files exist under `apps/frontend/src/` or `libs/`. All 31 spec files are located in `apps/api/`. The frontend has 712 source files with no test coverage.
- Blocks: Cannot verify UI behavior regressions during refactors. The `npm run test:frontend` command runs Vitest but has no tests to execute.
- Files: All `apps/frontend/src/**/*.{ts,tsx}` - none have `.spec.tsx?` counterparts.

---

## Test Coverage Gaps

**Frontend Has Zero Test Coverage:**

- What's not tested: All 712 frontend source files — React components, Zustand stores, hooks, utilities.
- Files: Entire `apps/frontend/src/` directory.
- Risk: Any UI bug, regression, or behavioral change goes undetected. Store state transitions, form validation, API call patterns, and component rendering are all untested.
- Priority: High.

**Libs Has Zero Test Coverage:**

- What's not tested: All shared utilities, types, and constants under `libs/src/`.
- Files: Entire `libs/` directory.
- Risk: Utility functions used across both frontend and API have no test protection; breakage only surfaces at runtime or in API integration tests indirectly.
- Priority: High.

**Survey Answer Attachment Processing Not Directly Tested:**

- What's not tested: `SurveyAnswerAttachmentsService.processSurveyAnswer` uses `as unknown as` casts to handle nested answer structures; the recursive traversal path is not covered.
- Files: `apps/api/src/surveys/survey-answer-attachments.service.ts:170-175`
- Risk: Malformed answer structures crash the attachment processor silently.
- Priority: Medium.

**LDAP/Keycloak Sync Service Has No Unit Tests:**

- What's not tested: `LdapKeycloakSyncService` (865 lines) — the most complex service — has no spec file.
- Files: `apps/api/src/ldap-keycloak-sync/ldap-keycloak-sync.service.ts`
- Risk: Sync logic errors (membership resolution, group cache updates, reconnect logic) are only caught in production.
- Priority: High.

**Mail Idle Service Has No Unit Tests:**

- What's not tested: `MailIdleService` (587 lines) handles IMAP IDLE reconnect logic, per-user connection state, and flag change notifications.
- Files: `apps/api/src/mails/mail-idle.service.ts`
- Risk: Reconnect/backoff logic bugs are invisible until a mail server disconnects in production.
- Priority: Medium.

---

_Concerns audit: 2026-02-26_
