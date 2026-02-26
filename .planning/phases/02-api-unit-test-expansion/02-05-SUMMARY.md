---
phase: 02-api-unit-test-expansion
plan: 05
subsystem: testing
tags: [jest, docker, ldap-keycloak-sync, wireguard, webdav, service-specs, controller-specs]

requires:
  - phase: 02-api-unit-test-expansion
    plan: 01
    provides: createTestingModule, createMongooseModelMock
provides:
  - New docker.service.spec.ts (25 tests) + docker.controller.spec.ts (8 tests)
  - New ldap-keycloak-sync.service.spec.ts (19 tests)
  - New webdav.service.spec.ts (24 tests)
  - Wireguard specs already comprehensive (32+11 tests), no deepening needed
affects: []

duration: 15min
completed: 2026-02-26
---

# Phase 02 Plan 05: Docker + LDAP-Keycloak + Wireguard + Webdav Summary

**Created docker, ldap-keycloak-sync, and webdav specs -- 76 new tests across 4 files**

## Performance

- **Duration:** 15 min
- **Files created:** 4

## Accomplishments

- docker.service.spec.ts: 25 tests covering getContainers (happy, filtered, array filter, docker error), executeContainerCommand (start/stop/restart/kill, unknown op, protected container, operation failure), checkProtectedContainer (static), deleteContainer (happy, protected, error), getContainerStats (happy, error fallback), updateContainer (full flow, up-to-date skip, error), createContainer (happy, error), onModuleDestroy
- docker.controller.spec.ts: 8 tests verifying delegation for all 6 endpoints (getContainers with/without query, createContainer, executeContainerCommand, deleteContainer, updateContainer, updateEduManagerAgentContainer)
- ldap-keycloak-sync.service.spec.ts: 19 tests with stateful cache mocks covering onModuleInit, init (config found/not found), cache readiness handlers, sync guards (no config, caches not ready, already running, missing deployment target, failure recovery), updateGroupMembershipByNames (add/remove/create group), reconcileNamedGroupMembers (add missing + remove extra), static convertToGroupMemberDto, static extractGroupAttributes (with/without attrs), persistLastSync
- webdav.service.spec.ts: 24 tests covering invalidateClientCache, initializeClient, getClient caching, executeWebdavRequest (happy, transformer, error, non-2xx status), getFilesAtPath, getDirectoryAtPath, createFolder, deletePath, moveOrRenameResource, copyFileViaWebDAV, safeJoinUrl (4 edge cases), getPathUntilFolder (found/not found), copyCollectedItems (happy, error), getFileTypeFromWebdavPath (directory/file)
- Wireguard specs reviewed: already comprehensive (32 service tests + 11 controller tests), no deepening needed
- Full API test suite: 691 tests passing with no regressions

## Task Commits

1. **Task 1 + Task 2** - `6933f06ca` (test)

## Key Decisions

- DockerService tests mock at dockerode library level using jest.mock('dockerode') with a mock constructor returning an object with all Docker methods
- LdapKeycloakSyncService tests use stateful Map-based cache mocks (mockCacheStore) to simulate the full cache layer, with mockCache.get/set delegating to the Map
- Wireguard specs were reviewed and found already comprehensive (32+11 tests covering peer CRUD, QR code, status, sites, batch creation, service management, error handling, and config initialization) -- no deepening needed
- WebdavService tests mock at the getClient level (jest.spyOn) rather than mocking WebdavClientFactory at module level to avoid jest.mock hoisting issues with const declarations
- WebDAV HTTP methods are lowercase (propfind, mkcol, move, copy, delete) per HttpMethodsWebDav constants
- ContentType.DIRECTORY is 'COLLECTION' not 'directory'
- AdminGuard dependency on GlobalSettingsService required in docker.controller.spec.ts

---

_Phase: 02-api-unit-test-expansion_
_Completed: 2026-02-26_
