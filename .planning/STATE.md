# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-26)

**Core value:** Catch regressions before they reach users -- every PR must pass automated tests across all layers before merge
**Current focus:** Phase 2 complete. Next: Phase 3 (Frontend Unit Tests)

## Current Position

Phase: 2 of 5 (API Unit Test Expansion) -- COMPLETE
Plan: 7 of 7 in phase 2 (all done)
Status: Phase 2 complete
Last activity: 2026-02-26 -- All 7 plans completed, 818 API tests across 74 suites

Progress: [####......] 40% (Phase 1 planned, Phase 2 complete)

## Performance Metrics

**Velocity:**

- Total plans completed: 7 (Phase 2)
- Average duration: ~12 min/plan
- Total execution time: ~1.5 hours

**By Phase:**

| Phase | Plans | Total   | Avg/Plan |
| ----- | ----- | ------- | -------- |
| 2     | 7/7   | ~90 min | ~12 min  |

**Recent Trend:**

- Last 7 plans: 02-01 (15m), 02-02 (10m), 02-03 (12m), 02-04 (12m), 02-05 (15m), 02-06 (10m), 02-07 (12m)
- Trend: Stable at ~12 min/plan

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

### Pending Todos

None yet.

### Blockers/Concerns

- [Research]: Vitest must stay at ^3.2.4 (4.x requires Vite 6+, project uses Vite 5)
- [Research]: 21 Zustand stores missing from cleanAllStores.ts -- must audit in Phase 1
- [Research]: E2E Keycloak auth storageState pattern needs validation against staging server behavior in Phase 4

## Session Continuity

Last session: 2026-02-26
Stopped at: Phase 2 fully complete (all 7 plans). Next phase: Phase 3 (Frontend Unit Tests)
Resume file: .planning/ROADMAP.md (Phase 3 planning)
