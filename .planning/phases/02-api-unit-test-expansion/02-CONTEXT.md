# Phase 2: API Unit Test Expansion - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Write comprehensive unit tests for every API module in the NestJS backend. Guards enforce security boundaries, pipes validate inputs, filters handle errors, services implement business logic, and controllers delegate correctly. This phase covers APIT-01 through APIT-13: guards, pipes, filters, 15+ previously untested services, controller delegation, and deepening 33 existing shallow spec files. Integration tests and contract validation belong in Phase 5.

</domain>

<decisions>
## Implementation Decisions

### Module prioritization

- Guards, pipes, and filters first (security + request pipeline boundary) — highest-risk surface
- Core platform services second: surveys (priority deepening target), file sharing, mail, conferences, notifications
- Infrastructure services third: docker, LDAP-Keycloak sync, license, health, mobileApp, user-preferences, wireguard, webdav
- Controller tests written alongside their corresponding service (same plan wave), not as a separate batch

### Existing spec file handling

- Extend existing 33 spec files in-place — add behavioral tests below existing "should be defined" tests
- Keep "should be defined" tests as DI wiring sanity checks (success criteria only bans them as sole test)
- Upgrade all existing mock setups to use Phase 1 infrastructure (TestingModuleBuilder preset, Mongoose mock factory)
- Surveys service spec (APIT-06) is a priority deepening target — most complex service with scoring, participation, results, permissions

### Test depth per module

- Complex services (surveys, file sharing, mail, conferences, notifications): every public method gets at least a happy-path and one error-path test
- Simple infrastructure services (health, license, mobileApp, user-preferences): happy path + basic error test per public method
- Guard tests include edge cases: malformed JWT structures, empty payloads, wrong algorithm tokens, oversized tokens — beyond the standard valid/invalid/missing/expired matrix
- Controller tests verify delegation to correct service method with correct arguments, HTTP status codes, AND response DTO shape validation

### External service mocking

- Mock at the service boundary (client/adapter level), not at the protocol level — e.g., mock the IMAP client, not an IMAP server
- LDAP-Keycloak sync service exception: use stateful mocks that track sync state across calls to verify the full sync pipeline including state transitions (user created in LDAP → synced to Keycloak → groups mapped)
- Docker service: mock at the dockerode library level (container.start(), container.stop(), etc.)
- Notification service: mock Expo-specific error response types (DeviceNotRegistered, MessageTooBig, InvalidCredentials) — not just generic HTTP errors

### Claude's Discretion

- Exact plan wave grouping and task ordering within the priority tiers
- How many spec files per plan (batching strategy)
- Which specific edge cases to include beyond the decisions above
- Test file organization within existing project structure

</decisions>

<specifics>
## Specific Ideas

- Guards/pipes/filters grouped together as "request pipeline boundary" tests in the first wave
- Each module tested as a cohesive unit: service spec + controller spec in the same effort
- Surveys service gets special treatment as the most complex deepening target
- LDAP sync mocks should be stateful enough to verify the complete sync orchestration flow

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 02-api-unit-test-expansion_
_Context gathered: 2026-02-26_
