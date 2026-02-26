---
phase: 02-api-unit-test-expansion
plan: 01
subsystem: testing
tags: [jest, guards, api-security, test-helpers]

requires:
  - phase: 01-test-foundation-and-infrastructure
    provides: createTestingModule, createMongooseModelMock, cacheManagerMock
provides:
  - createMockExecutionContext shared test helper
  - createMockArgumentsHost shared test helper
  - createJwtUser factory with German school domain defaults
  - 7 guard spec files with comprehensive behavioral assertions
affects: [02-02, 02-03, 02-04, 02-05, 02-06, 02-07]

tech-stack:
  added: []
  patterns:
    - 'Guard specs use createMockExecutionContext with overrides for user/token/ip/params/headers'
    - 'Filter specs will use createMockArgumentsHost returning host + mockResponse + mockRequest'
    - 'All test user fixtures use createJwtUser with German school domain defaults'

key-files:
  created:
    - libs/src/test-utils/api-mocks/createMockExecutionContext.ts
    - libs/src/test-utils/api-mocks/createMockArgumentsHost.ts
    - libs/src/test-utils/api-mocks/createJwtUser.ts
    - apps/api/src/auth/auth.guard.spec.ts
    - apps/api/src/auth/access.guard.spec.ts
    - apps/api/src/common/guards/admin.guard.spec.ts
    - apps/api/src/common/guards/dynamicAppAccess.guard.spec.ts
    - apps/api/src/common/guards/localhost.guard.spec.ts
    - apps/api/src/common/guards/isPublicApp.guard.spec.ts
    - apps/api/src/webhook/webhook.guard.spec.ts
  modified:
    - libs/src/test-utils/api-mocks/index.ts

key-decisions:
  - 'File names follow project convention: match default export name (createMockExecutionContext.ts, not executionContextMock.ts)'
  - 'eslint-disable for unsafe-any in test helper files follows existing pattern from cacheManagerMock.ts and createMongooseModelMock.ts'

patterns-established:
  - 'Guard spec pattern: describe(GuardName.name, () => { beforeEach with mock setup; happy-path + denial tests })'
  - 'AccessGuard/DynamicAppAccessGuard specs call clearAccessCache() in beforeEach to prevent state leaking'
  - "AuthGuard spec uses jest.mock('fs') to avoid RSA key file dependency"

requirements-completed: [APIT-01, APIT-02, APIT-03]

duration: 15min
completed: 2026-02-26
---

# Phase 02 Plan 01: Shared Test Helpers and Guard Specs Summary

**3 shared test helpers and 7 guard spec files with 51 behavioral tests covering valid access, denied access, edge cases, and caching**

## Performance

- **Duration:** 15 min
- **Started:** 2026-02-26T12:30:00Z
- **Completed:** 2026-02-26T12:45:00Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Created 3 reusable shared test helpers (createMockExecutionContext, createMockArgumentsHost, createJwtUser)
- All 7 guards have spec files: AuthGuard, AccessGuard, AdminGuard, DynamicAppAccessGuard, LocalhostGuard, IsPublicAppGuard, WebhookGuard
- 51 behavioral tests covering valid tokens, missing tokens, expired tokens, malformed JWTs, admin bypass, LDAP group matching, access cache hit/miss, localhost IP filtering, public app detection, webhook header validation
- Full API test suite passes with 414 tests total and no regressions

## Task Commits

Each task was committed atomically:

1. **Task 1 + Task 2: Shared test helpers + all 7 guard specs** - `d7c7a2f22` (test)

## Files Created/Modified

- `libs/src/test-utils/api-mocks/createMockExecutionContext.ts` - Mock ExecutionContext factory with user/token/ip/params/headers overrides
- `libs/src/test-utils/api-mocks/createMockArgumentsHost.ts` - Mock ArgumentsHost factory for exception filter tests
- `libs/src/test-utils/api-mocks/createJwtUser.ts` - JwtUser factory with German school domain defaults
- `libs/src/test-utils/api-mocks/index.ts` - Re-exports all 6 test helpers
- `apps/api/src/auth/auth.guard.spec.ts` - 9 tests: valid/missing/expired/malformed tokens, public route bypass
- `apps/api/src/auth/access.guard.spec.ts` - 9 tests: admin bypass, group match, 401/403, cache hit/miss
- `apps/api/src/common/guards/admin.guard.spec.ts` - 6 tests: admin/non-admin/no-user/public/empty-groups
- `apps/api/src/common/guards/dynamicAppAccess.guard.spec.ts` - 8 tests: admin bypass, group match, 401/403, cache, missing param
- `apps/api/src/common/guards/localhost.guard.spec.ts` - 6 tests: 127.0.0.1, ::1, ::ffff:127.0.0.1, remote IPs denied
- `apps/api/src/common/guards/isPublicApp.guard.spec.ts` - 4 tests: public app, non-public, undefined, param passing
- `apps/api/src/webhook/webhook.guard.spec.ts` - 9 tests: valid headers, missing headers, invalid key, expired/future/NaN timestamp

## Decisions Made

- File names match default export names per project convention (enforced by pre-commit hook)
- Used eslint-disable for unsafe-any in test helpers following existing api-mocks pattern

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] File names did not match default export names**

- **Found during:** Task 1 (shared test helpers)
- **Issue:** Pre-commit hook requires filename to match default export. Original names were executionContextMock.ts, argumentsHostMock.ts, jwtUserFactory.ts
- **Fix:** Renamed to createMockExecutionContext.ts, createMockArgumentsHost.ts, createJwtUser.ts
- **Files modified:** Three helper files renamed, index.ts import paths updated
- **Verification:** Pre-commit check-filenames passes
- **Committed in:** d7c7a2f22

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Filename convention enforcement. No scope creep.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Shared test helpers are ready for Wave 2 plans (02-02 through 02-07)
- createMockArgumentsHost will be used by Plan 02-02 (exception filter specs)
- createJwtUser will be used by all subsequent guard, service, and controller specs

---

_Phase: 02-api-unit-test-expansion_
_Completed: 2026-02-26_
