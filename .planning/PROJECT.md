# edulution-ui Comprehensive Test Suite

## What This Is

A project to take edulution-ui from near-zero test coverage to a production-ready test suite spanning unit tests, integration tests, E2E tests, visual regression, and accessibility checks. The platform is an educational SPA (React + NestJS) with ~7,100 commits and 170+ open issues but minimal test coverage — 33 API spec files, zero frontend tests, no E2E, no visual regression. This project adds tests at every layer, sets up AI-assisted test generation tooling, and enforces quality gates in CI.

## Core Value

Catch regressions before they reach users — every PR must pass automated tests across all layers before merge.

## Requirements

### Validated

- ✓ API unit test infrastructure (Jest + @nestjs/testing) — existing
- ✓ Frontend test infrastructure (Vitest + jsdom + @testing-library/jest-dom) — existing
- ✓ 33 API spec files covering service/controller pairs — existing
- ✓ Coverage tooling configured (v8 frontend, Jest API) — existing
- ✓ CI pipeline running API tests on PRs (GitHub Actions) — existing
- ✓ Established mocking patterns (Mongoose model mocks, service mocks, shared fixtures) — existing

### Active

- [ ] Frontend unit tests for custom hooks, utility functions, and Zustand stores
- [ ] Frontend component tests using React Testing Library for critical UI flows
- [ ] MSW (Mock Service Worker) setup for frontend API mocking at network level
- [ ] Expand API service test coverage to all modules (surveys, files, mail, conferences, etc.)
- [ ] Expand API controller test coverage to all modules
- [ ] API guard and middleware tests (AuthGuard, AccessGuard, validation pipes)
- [ ] Playwright E2E setup with NX integration
- [ ] E2E auth strategy using staging Keycloak server
- [ ] E2E tests for critical user journeys (login, surveys, file sharing, mail, AppStore, settings, navigation)
- [ ] Page Object Model pattern for E2E test organization
- [ ] API integration tests (full request/response contract testing)
- [ ] Visual regression testing (Playwright screenshots, light/dark themes, menubar states)
- [ ] Accessibility testing with axe-core/playwright
- [ ] Playwright MCP server setup for AI-assisted test generation
- [ ] CI pipeline enhancement: parallel test jobs, coverage reporting, PR blocking
- [ ] Coverage reporting integration (Codecov or Coveralls) with PR comments
- [ ] Shared test utilities and factories (test user provisioning, fixture data)

### Out of Scope

- Custom MCP server for test environment management — complexity doesn't justify value yet, revisit after baseline coverage achieved
- Storybook / Chromatic — no Storybook in project, visual regression via Playwright screenshots instead
- Local Keycloak/LDAP/Mailcow containers — E2E tests use staging server
- Performance / load testing — separate concern, not part of this test coverage initiative
- Mobile app testing — web-only platform

## Context

**Current test state (from codebase analysis):**

- `npm test` only runs API tests (`nx run-many --target=test --projects=api`)
- `npm run test:frontend` exists but zero test files in `apps/frontend/src/`
- No E2E tests, component tests, or visual regression tests
- 33 API spec files with established patterns (TestingModule, mock DI, Mongoose query mocks)

**Key modules needing coverage:** Surveys (SurveyJS), File Sharing (WebDAV), Mail (IMAP/Mailcow), AppStore, User Settings, Menubar/Navigation, Whiteboard (TLDraw), Push Notifications (Expo), Wireguard config, Session Management, Conferences (BBB)

**E2E infrastructure:** Mongo + Redis available locally via docker-compose. Keycloak, LDAP, Mailcow, OnlyOffice available on staging server. E2E tests will target staging for auth flows.

**Test strategy reference:** `edulution-ui-test-strategy.md.pdf` in repo root — detailed 5-phase plan with tooling recommendations

**Existing patterns to follow:**

- API: Jest, `describe(ClassName.name, ...)`, `Test.createTestingModule()`, co-located `*.spec.ts`
- Frontend: Vitest with globals, jsdom, `@testing-library/jest-dom` setup ready
- Mocks: Co-located `*.mock.ts`, shared fixtures in `mocks/` directories

## Constraints

- **Testing framework (API)**: Jest — already in use, keep for consistency with existing 33 spec files
- **Testing framework (Frontend)**: Vitest — already configured, Vite-native
- **E2E framework**: Playwright — best AI/MCP integration, NX support, multi-browser
- **E2E auth**: Must use staging Keycloak server (no local Keycloak container)
- **CI policy**: Tests must block PR merges (required checks)
- **Icons**: Only `@fortawesome/free-solid-svg-icons` (project constraint)
- **No comments in code**: Project convention — tests should be self-documenting via descriptive test names

## Key Decisions

| Decision                             | Rationale                                                                                   | Outcome   |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | --------- |
| Playwright for E2E over Cypress      | Best AI/MCP support, native NX integration, fastest, multi-browser                          | — Pending |
| MSW for frontend API mocking         | Network-level mocking, works with any HTTP client (axios/fetch), no implementation coupling | — Pending |
| Staging server for E2E auth          | Avoids complexity of local Keycloak setup, tests against real auth flow                     | — Pending |
| Maximize coverage (no fixed targets) | Starting from near-zero, fixed targets could limit ambition                                 | — Pending |
| Block PRs on test failure            | Strong quality gate from day one, prevents regression                                       | — Pending |
| AI-assisted test generation tooling  | Playwright MCP + Claude Code for bulk test generation, 2-3x speedup                         | — Pending |

---

_Last updated: 2026-02-26 after initialization_
