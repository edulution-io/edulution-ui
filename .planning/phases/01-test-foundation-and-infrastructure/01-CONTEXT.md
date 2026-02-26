# Phase 1: Test Foundation and Infrastructure - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Shared test infrastructure that all subsequent phases build on. Delivers: Vitest 3.2.x upgrade, MSW 2.x setup with handler structure, shared test factories, Proxy-based Mongoose mock, mock consolidation, renderWithProviders utility, TestingModuleBuilder preset, cleanAllStores validation, and CI frontend test job running in parallel. No actual feature tests are written — only the infrastructure and sample tests proving it works.

</domain>

<decisions>
## Implementation Decisions

### Factory data design

- Realistic German domain data: school names (e.g., "Realschule Musterstadt"), LDAP groups (e.g., "cn=teachers,ou=groups,dc=schule,dc=de"), plausible AppConfigs
- Simple functions with partial overrides: `createUser({ isAdmin: true, school: 'Gymnasium Beispiel' })` — no builder pattern
- Complete valid defaults: `createUser()` returns a fully populated, valid object; tests only override fields they care about
- Single shared location: all factories in `libs/` (e.g., `libs/test-utils/factories/`) — both API and frontend import from the same place

### MSW handler strategy

- Fail loudly on unmocked calls: `onUnhandledRequest: 'error'` — any API call without a handler throws immediately
- Per-module handler files: `surveyHandlers.ts`, `mailHandlers.ts`, `fileSharingHandlers.ts` — mirrors API module structure
- Shared happy-path defaults loaded in `vitest.setup.ts`: auth always succeeds, appConfigs returns standard set, user profile available
- Test-specific overrides via `server.use()`: runtime handler overrides within individual tests, auto-reset via `afterEach`

### Migration approach

- Big-bang Vitest 1.6 → 3.2.x upgrade: single PR, fix all breaking changes in existing tests at once (feasible given small existing test count)
- Delete inline mock duplicates immediately: replace with imports from shared location in one pass, no transition aliases
- Proxy-based Mongoose query builder mock: dynamic chaining via JavaScript Proxy, auto-handles any `.find().sort().limit().exec()` combination
- renderWithProviders wraps ALL providers by default (i18n, router, OIDC, theme) — tests can pass options for specific router state or auth overrides

### CI strictness

- Frontend test job blocks PR merges immediately: required status check from day one
- Parallel CI jobs: `test-frontend` and `test-api` run simultaneously as separate jobs
- Coverage reporting enabled in Phase 1: generate reports and establish baselines, no enforcement gates yet (deferred to Phase 5)
- cleanAllStores validation test fails the suite: automated test scans for all Zustand stores and asserts registration — adding a store without registration breaks CI

### Claude's Discretion

- Exact directory structure within libs/test-utils/
- TestingModuleBuilder preset API design
- MSW handler internal implementation details
- Coverage report format and storage
- Vitest configuration specifics beyond the upgrade itself

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User consistently chose the recommended patterns, indicating preference for industry-standard, low-ceremony tooling.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 01-test-foundation-and-infrastructure_
_Context gathered: 2026-02-26_
