# Phase 4: Frontend Components and E2E - Context

**Gathered:** 2026-02-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Critical UI components are tested with React Testing Library (behavioral assertions, not snapshots) and complete user journeys are verified end-to-end with Playwright against a dedicated persistent test server with Keycloak authentication. Component tests cover MenuBar, Sidebar, AppLayout, LoginPage, Table, survey forms, file browser, and mail compose. E2E tests cover login/logout, survey workflow, file sharing, mail, conferences, AppStore, and settings.

</domain>

<decisions>
## Implementation Decisions

### Staging Environment

- Dedicated persistent test server (already exists, not spun up per-run)
- Pre-provisioned Keycloak accounts for 4 roles: Admin, Teacher, Student, Parent
- Credentials stored in environment variables: `.env.e2e` (gitignored) locally, GitHub Actions secrets in CI
- User will provide staging URL and credentials before execution begins
- E2E tests target this server on every PR run

### E2E Data Management

- Tests create their own data through the UI — no API seeding, each test is a self-contained journey
- Tests clean up after themselves (afterAll/afterEach deletes created entities)
- Fully independent tests — any test can run in isolation, no shared state between tests
- Unique identifiers (timestamps/UUIDs) appended to all created entities to prevent parallel collisions

### Component Test Depth

- Full tree rendering — no mocking of child components, render the complete component tree
- Component-specific MSW handlers — each component test defines its own MSW responses rather than importing shared handlers from Phase 1/3
- Accessibility checks deferred entirely to Phase 5 (axe-core) — component tests focus on functional behavior
- LoginPage tests mock the OIDC provider and test the full auth callback handling, not just trigger verification

### Playwright CI Setup

- All three browsers: Chromium, Firefox, and WebKit
- 1 automatic retry on test failure before marking as failed
- E2E runs on every PR as part of the CI pipeline
- E2E job starts as non-blocking (warning/informational) — promote to required status check once the suite proves stable
- Playwright HTML report uploaded as CI artifact on failure (per CICD-03 requirement)

### Claude's Discretion

- Number of parallel Playwright workers (based on runner capacity and test count)
- Page Object Model class hierarchy and design patterns
- Playwright configuration details (timeouts, viewport sizes, screenshot-on-failure settings)
- Component test file organization and naming
- Exact storageState implementation for Keycloak auth reuse

</decisions>

<specifics>
## Specific Ideas

- StorageState pattern for Keycloak: authenticate once in globalSetup, reuse auth state across all tests (no per-test login)
- Component tests use RTL user-event for interactions (not fireEvent) — behavioral testing
- E2E journeys should be complete workflows (e.g., survey: create → participate → view results → delete) within a single test
- Start with Chromium-only during development, enable all three browsers when suite is stable

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 04-frontend-components-and-e2e_
_Context gathered: 2026-02-27_
