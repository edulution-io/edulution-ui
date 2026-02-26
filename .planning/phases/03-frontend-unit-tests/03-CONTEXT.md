# Phase 3: Frontend Unit Tests - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Frontend utility functions, Zustand stores, and custom hooks are tested with pure unit tests. Utilities are verified without rendering, stores are tested against MSW-mocked API responses with realistic shapes, and hooks are tested via renderHook with full provider context. Component rendering and E2E testing belong to Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Store test patterns

- Shared MSW handler library in libs/src/test-utils/msw/ — reusable handlers that match real API response shapes
- MSW handlers return realistic full API response objects using factories from Phase 1 infrastructure — catches missing field bugs
- Every store test covers both success paths (correct state transitions) AND error paths (handleApiError called, error state set)
- All 8 stores in requirements (file sharing, mails, survey editor, conference, appConfigs, class management, user, SSE) get equal test depth — no prioritization

### Utility test scope

- Edge case strategy: boundary values (empty strings, null, undefined, special chars) plus invalid inputs — focus on what could break in production
- Browser API utilities (copyToClipboard, getCompressedImage): mock via jsdom stubs in vitest.setup.ts — tests run fast and verify utility logic
- Zod schema tests: test schemas in isolation with valid/invalid payloads in Phase 3, form integration tests deferred to Phase 4
- Route generation tests: assert against hardcoded expected route paths/configs — readable and catches unexpected changes

### Hook test isolation

- Hooks use real Zustand stores with MSW intercepting API calls — tests verify the full hook→store→API chain
- SSE hooks: use MSW SSE handlers to intercept the SSE endpoint and stream mock events
- Provider setup: full provider tree via renderWithProviders utility (router, i18n, OIDC) — consistent with future component tests
- Keyboard navigation hooks: simulate real keyboard events via fireEvent.keyDown / userEvent.keyboard — tests the full event handling chain

### Plan structure

- Split by type: Plan 1 = Utility functions (FEUT-01 to FEUT-04), Plan 2 = Zustand stores (FEST-01 to FEST-08), Plan 3 = Custom hooks (FEHK-01 to FEHK-05)
- Execution order: Plan 1 (utilities) runs first to establish patterns, then Plans 2 and 3 run in parallel
- Plans assume Phase 1 infrastructure is complete (MSW setup, factories, renderWithProviders, cleanAllStores validation)
- File organization: one spec file per module (e.g., useFileSharingStore.spec.ts, not individual function spec files)

### Claude's Discretion

- Internal organization of MSW handler files (grouping by API domain vs by store)
- Exact factory shapes for API responses (derived from real API types)
- Test helper utilities needed within Phase 3 (beyond Phase 1 infrastructure)
- Order of individual test cases within spec files

</decisions>

<specifics>
## Specific Ideas

- Zod schemas get dual coverage: isolation tests in Phase 3, form integration tests in Phase 4 — both phases build test value
- Route tests use hardcoded expectations to serve as living documentation of expected routes
- MSW handler library is shared infrastructure that Phase 4 component tests will also reuse

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 03-frontend-unit-tests_
_Context gathered: 2026-02-26_
