# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-26)

**Core value:** Catch regressions before they reach users -- every PR must pass automated tests across all layers before merge
**Current focus:** Phase 4 gap closure complete. All 5 plans executed (components, E2E infra, E2E journeys, 2 gap closures)

## Current Position

Phase: 4 of 5 (Frontend Components and E2E) -- COMPLETE
Plan: 5 of 5 in phase 4 (all done)
Status: Phase 4 complete (including verification gap closure)
Last activity: 2026-03-02 -- Plans 04-04 and 04-05 gap closures completed

Progress: [########..] 80% (Phases 1-4 complete)

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

### Pending Todos

None yet.

### Blockers/Concerns

- [Research]: Vitest must stay at ^3.2.4 (4.x requires Vite 6+, project uses Vite 5)
- [Research]: 21 Zustand stores missing from cleanAllStores.ts -- must audit in Phase 1
- [Research]: E2E Keycloak auth storageState pattern needs validation against staging server behavior in Phase 4

## Session Continuity

Last session: 2026-03-02
Stopped at: Completed 04-05-PLAN.md -- Phase 4 fully complete (all 5 plans including gap closures). Next: Phase 5 (Advanced Quality)
Resume file: .planning/ROADMAP.md (Phase 5 planning)
