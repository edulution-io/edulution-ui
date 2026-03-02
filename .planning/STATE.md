# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-26)

**Core value:** Catch regressions before they reach users -- every PR must pass automated tests across all layers before merge
**Current focus:** Phases 1-4 complete. E2E tests stabilized. Ready for Phase 5 (Advanced Quality and CI Hardening).

## Current Position

Phase: 5 of 5 (Advanced Quality and CI Hardening) -- COMPLETE
Plan: 3 of 3 in phase 5 complete
Status: ALL PHASES COMPLETE -- milestone finished
Last activity: 2026-03-02 -- Phase 5 complete (all 3 plans executed)

Progress: [##########] 100% (All 5 phases complete)

## Performance Metrics

**Velocity:**

- Total plans completed: 12 (Phase 2: 7, Phase 4: 5)
- Average duration: ~9 min/plan
- Total execution time: ~2 hours

**By Phase:**

| Phase | Plans | Total   | Avg/Plan |
| ----- | ----- | ------- | -------- |
| 2     | 7/7   | ~90 min | ~12 min  |
| 4     | 5/5   | ~20 min | ~4 min   |

**Recent Trend:**

- Last 3 plans (Phase 4): 04-03 (4m), 04-04 (4m), 04-05 (4m)
- Trend: Fast execution for test creation and gap closure plans

_Updated after each plan completion_

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: 5 phases ordered by dependency DAG -- foundation, API unit, frontend unit, components+E2E, advanced quality
- [Roadmap]: Phase 2 and Phase 3 can run in parallel (both depend only on Phase 1)
- [Roadmap]: E2E deferred to Phase 4 to build on verified unit test foundations
- [Phase 2]: AdminGuard depends on GlobalSettingsService -- must be provided in all controller test modules with admin endpoints
- [Phase 2]: DynamicAppAccessGuard depends on AppConfigService -- must be provided for controllers using this guard
- [Phase 2]: jest.mock hoisting prevents referencing module-scope const variables; use inline factory or spy on service methods
- [Phase 2]: WebDAV methods are lowercase (propfind, mkcol, etc.), ContentType.DIRECTORY = 'COLLECTION'
- [Phase 2]: CacheInterceptor requires CACHE_MANAGER provider in test modules
- [Phase 4]: E2E tests use test.skip() for feature detection when staging UI differs
- [Phase 4]: Serial describes share state via closure variables for CRUD workflow tests
- [Phase 4]: E2E CI job is non-blocking (continue-on-error: true) until tests stabilize
- [Phase 4]: Fixed .gitignore auth/ to /auth/ to scope ignore to root storage dir only
- [Phase 4]: Used renderWithProviders for AccessAndParticipateSurvey tests (simpler than manual wrapper)
- [Phase 4]: Documented FECP-08 iframe scope limitation as comment rather than skipped tests
- [Phase 4]: Mock complex child components (TotpInput) to avoid deep dependency chains in spec tests
- [Phase 4]: Double-click sort assertion pattern when initial data is already in ascending order

### Pending Todos

None yet.

### Blockers/Concerns

- [Research]: Vitest must stay at ^3.2.4 (4.x requires Vite 6+, project uses Vite 5)
- [Research]: 21 Zustand stores missing from cleanAllStores.ts -- must audit in Phase 1
- [Research]: E2E Keycloak auth storageState pattern needs validation against staging server behavior in Phase 4

## Session Continuity

Last session: 2026-03-02
Stopped at: Coverage expansion in progress. Stores + hooks + 6 components done.

Next session should:

1. Write specs for remaining 3 high-priority components: ResizableWindow, TableGridView, DesktopSidebar
2. Continue with remaining shared components (Task #13)
3. Then page components (Task #14)
4. Frontend coverage rose from 10.57% -> 16.29% statements, 40.69% -> 58.21% branches
