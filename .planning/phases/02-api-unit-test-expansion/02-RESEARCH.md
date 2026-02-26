# Phase 02: API Unit Test Expansion - Research

**Researched:** 2026-02-26
**Domain:** NestJS unit testing -- guards, pipes, filters, services, controllers
**Confidence:** HIGH

## Summary

This phase covers writing comprehensive unit tests for the entire NestJS API layer. The codebase currently has 31 spec files, but large swaths of the API remain untested: all 6 guards, all 3 pipes, all 5 exception filters, and 15+ services (mail, notifications, docker, LDAP-Keycloak sync, license, health, mobileApp, user-preferences, wireguard, webdav, filesharing, and more). Existing spec files predominantly test at the service and controller level, with survey-related tests being the most mature though still incomplete (many tests are commented out).

Phase 1 infrastructure provides `createTestingModule` (shared TestingModuleBuilder preset), `createMongooseModelMock` (proxy-based chainable Mongoose mock), and a consolidated `cacheManagerMock`. These are the building blocks for all Phase 2 tests. The testing stack is Jest 29 + ts-jest + @nestjs/testing 11 -- all already installed and configured.

**Primary recommendation:** Start with guards/pipes/filters (pure request-pipeline boundary tests, no Mongoose mocking needed), then move to services with their corresponding controllers, using `createTestingModule` and `createMongooseModelMock` from Phase 1 infrastructure consistently.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Guards, pipes, and filters first (security + request pipeline boundary) -- highest-risk surface
- Core platform services second: surveys (priority deepening target), file sharing, mail, conferences, notifications
- Infrastructure services third: docker, LDAP-Keycloak sync, license, health, mobileApp, user-preferences, wireguard, webdav
- Controller tests written alongside their corresponding service (same plan wave), not as a separate batch
- Extend existing 33 spec files in-place -- add behavioral tests below existing "should be defined" tests
- Keep "should be defined" tests as DI wiring sanity checks (success criteria only bans them as sole test)
- Upgrade all existing mock setups to use Phase 1 infrastructure (TestingModuleBuilder preset, Mongoose mock factory)
- Surveys service spec (APIT-06) is a priority deepening target -- most complex service with scoring, participation, results, permissions
- Complex services (surveys, file sharing, mail, conferences, notifications): every public method gets at least a happy-path and one error-path test
- Simple infrastructure services (health, license, mobileApp, user-preferences): happy path + basic error test per public method
- Guard tests include edge cases: malformed JWT structures, empty payloads, wrong algorithm tokens, oversized tokens -- beyond the standard valid/invalid/missing/expired matrix
- Controller tests verify delegation to correct service method with correct arguments, HTTP status codes, AND response DTO shape validation
- Mock at the service boundary (client/adapter level), not at the protocol level -- e.g., mock the IMAP client, not an IMAP server
- LDAP-Keycloak sync service exception: use stateful mocks that track sync state across calls to verify the full sync pipeline including state transitions
- Docker service: mock at the dockerode library level (container.start(), container.stop(), etc.)
- Notification service: mock Expo-specific error response types (DeviceNotRegistered, MessageTooBig, InvalidCredentials) -- not just generic HTTP errors

### Claude's Discretion

- Exact plan wave grouping and task ordering within the priority tiers
- How many spec files per plan (batching strategy)
- Which specific edge cases to include beyond the decisions above
- Test file organization within existing project structure

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                                                                                       | Research Support                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| APIT-01 | AuthGuard unit tests: JWT verification, missing token, expired token, invalid signature           | AuthGuard reads RSA public key from file, uses JwtService.verifyAsync with RS256, checks Reflector for PUBLIC_ROUTE_KEY. Mock JwtService, Reflector, and fs.readFileSync. Test valid/expired/missing/malformed tokens + public route bypass.                                                                                                                                                                                                                                                                                                                                                                                              |
| APIT-02 | AccessGuard unit tests: LDAP group checks, admin bypass, missing groups                           | AccessGuard uses Reflector for APP_ACCESS_KEY, checks accessCache, calls GlobalSettingsService.getAdminGroupsFromCache and AppConfigService.appAccessMap. Mock these + clearAccessCache between tests. Test admin bypass, group matching, cache hit/miss, no-user throws 401, no-access throws 403.                                                                                                                                                                                                                                                                                                                                       |
| APIT-03 | AdminGuard and DynamicAppAccessGuard unit tests                                                   | AdminGuard checks getIsAdmin utility with ldapGroups vs adminGroups. DynamicAppAccessGuard resolves domain from route params via DYNAMIC_APP_ACCESS_PARAM_KEY, uses same accessCache pattern as AccessGuard. Both need mock Reflector, GlobalSettingsService, AppConfigService.                                                                                                                                                                                                                                                                                                                                                           |
| APIT-04 | ValidatePathPipe, ParseJsonPipe, FilterUserPipe unit tests                                        | ValidatePathPipe delegates to validatePath utility (already tested), test null/undefined returns undefined, string input returns sanitized. ParseJsonPipe: test valid JSON parsed, invalid throws BadRequestException. FilterUserPipe: test filters SyncJobDto array by user2 field, non-array returns empty array.                                                                                                                                                                                                                                                                                                                       |
| APIT-05 | All 5 exception filters unit tests                                                                | HttpExceptionFilter extends BaseExceptionFilter, logs and re-throws. PayloadTooLargeFilter distinguishes file_upload vs json_body. NotFoundFilter returns 404 JSON. MulterExceptionFilter handles LIMIT_UNEXPECTED_FILE (415), LIMIT_FILE_SIZE (422), other (400). ExpressHttpErrorFilter catches all non-HttpException, handles static file errors (404), PayloadTooLargeError, and generic errors. All need mock ArgumentsHost with switchToHttp().getResponse/getRequest.                                                                                                                                                              |
| APIT-06 | Expand survey service tests beyond shallow assertions                                             | SurveysService has 9 public methods; current spec has 2 active tests (should be defined + updateOrCreateSurvey create path). Many tests are commented out. Uncomment and fix existing tests, add missing tests for findSurvey, findPublicSurvey, throwErrorIfSurveyIsNotAccessible, throwErrorIfUserIsNotCreator, deleteSurveys. Use createMongooseModelMock instead of ad-hoc model mocks. Rich mock data already exists in surveys/mocks/.                                                                                                                                                                                              |
| APIT-07 | Mail service tests: IMAP flow, send, receive, folder management                                   | MailsService creates ImapFlow connections and a Mailcow Axios API client. Mock ImapFlow (connect, getMailboxLock, search, fetch, logout, close) and Axios. Test getMails happy path + IMAP errors, getSyncJobs with Mailcow API, create/delete sync jobs, get/post/delete external mail provider configs. FilterUserPipe is used internally.                                                                                                                                                                                                                                                                                              |
| APIT-08 | File sharing service tests: permissions, sharing rules, WebDAV operations                         | FilesharingService has heavy dependencies: WebdavService, OnlyofficeService, FilesystemService, QueueService, UsersService, WebdavSharesService, PublicShare Mongoose model. Mock all at service boundary. Test upload, delete, share (public share CRUD), collect operations, file access rights checking.                                                                                                                                                                                                                                                                                                                               |
| APIT-09 | Conference service tests: BBB integration, start/stop/join flows                                  | ConferencesService spec already has 13 tests covering create, findAll, findOne, update, remove, toggle, join, isCreator, start, stop. Existing tests are decent. Deepen with: error paths for BBB API failures (non-SUCCESS returncode), edge cases for join URL generation, findAll with no conferences. Use createTestingModule instead of raw Test.createTestingModule.                                                                                                                                                                                                                                                                |
| APIT-10 | Notification service tests: push notifications, DND window, expo integration                      | NotificationsService is complex (720 lines): 2 Mongoose models, PushNotificationQueue, UsersService, SseService. Test notifyUsernames (happy + rollback on error), upsertNotificationForSource (new vs existing), cascadeDeleteBySourceId, createUserNotifications (batching), markAsRead/markAllAsRead, deleteUserNotification with orphan cleanup, shouldSendPush debounce logic. Mock PushNotificationQueue.enqueue, not Expo directly.                                                                                                                                                                                                |
| APIT-11 | Docker, LDAP-Keycloak sync, license, health, mobileApp, user-preferences, wireguard, webdav tests | DockerService: mock dockerode (Docker class) with getContainer, listContainers, createContainer, pull. LdapKeycloakSyncService: stateful mocks for cache, GroupsService, KeycloakRequestQueue; test sync flow, group creation, member resolution. LicenseService: mock Mongoose model + licenseServerApi Axios. HealthService: mock @nestjs/terminus indicators. UserPreferencesService: simple Mongoose model mock. MobileAppService: mock UsersService, GlobalSettingsService, LmnApiService, WebdavSharesService. WireguardService: mock Axios API client. WebdavService: mock WebdavClientFactory, UsersService, WebdavSharesService. |
| APIT-12 | All API controller tests verify delegation, HTTP status codes, request validation                 | 30 controllers exist, 18 have spec files. Missing specs: auth, docker, health, license, mobileApp, user-preferences, mails, notifications, webdav-shares, webhook, webhook-clients, bulletin-category, parent-child-pairing, filesharing, metrics. Controller tests should use Test.createTestingModule with service mocks, verify service method called with correct args, and check response shape.                                                                                                                                                                                                                                     |
| APIT-13 | Existing 33 spec files deepened -- ban sole "should be defined" tests                             | Analysis shows 0 spec files have "should be defined" as sole test. All 19 files with "should be defined" also have behavioral tests. Some files are shallow (filesharing.service.spec.ts has only 2 tests total). Priority: deepen filesharing.service.spec.ts, surveys.service.spec.ts (many commented tests), groups.controller.spec.ts (only 3 tests), sse.controller.spec.ts (only 3 tests).                                                                                                                                                                                                                                          |

</phase_requirements>

## Standard Stack

### Core

| Library         | Version  | Purpose                                       | Why Standard                                   |
| --------------- | -------- | --------------------------------------------- | ---------------------------------------------- |
| @nestjs/testing | ^11.0.17 | TestingModule builder for DI-aware unit tests | Official NestJS test module, already installed |
| jest            | ^29.7.0  | Test runner and assertion library             | Project standard, configured via @nx/jest      |
| ts-jest         | ^29.1.2  | TypeScript compilation for Jest               | Already configured in jest.config.ts           |
| @types/jest     | ^29.5.12 | TypeScript types for Jest                     | Already installed                              |

### Supporting

| Library                 | Version        | Purpose                                                                    | When to Use                                  |
| ----------------------- | -------------- | -------------------------------------------------------------------------- | -------------------------------------------- |
| createTestingModule     | Phase 1        | Preset wrapping Test.createTestingModule with Logger mocks + CACHE_MANAGER | Every service/controller test that needs DI  |
| createMongooseModelMock | Phase 1        | Proxy-based chainable Mongoose model mock                                  | Every test needing Mongoose model operations |
| cacheManagerMock        | Phase 1 (libs) | Shared CACHE_MANAGER mock with get/set/del/reset                           | Tests needing cache-manager                  |

### Alternatives Considered

| Instead of                   | Could Use                      | Tradeoff                                                                                                             |
| ---------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Manual jest.fn() model mocks | createMongooseModelMock        | Phase 1 proxy mock handles chainable calls (.find().lean().exec()); manual mocks require rebuilding chains each time |
| jest.mock() module mocking   | DI-based mocking via providers | DI mocking is more explicit, avoids module-level side effects, aligns with NestJS testing patterns                   |

**Installation:**
No additional packages needed. All testing dependencies are already installed.

## Architecture Patterns

### Recommended Test File Organization

```
apps/api/src/
├── auth/
│   ├── auth.guard.spec.ts         # NEW
│   ├── access.guard.spec.ts       # NEW
│   └── auth.service.spec.ts       # NEW (if needed)
├── common/
│   ├── guards/
│   │   ├── admin.guard.spec.ts    # NEW
│   │   ├── dynamicAppAccess.guard.spec.ts  # NEW
│   │   └── accessCache.spec.ts    # NEW
│   └── pipes/
│       ├── validatePath.pipe.spec.ts  # NEW
│       ├── parseJson.pipe.spec.ts     # NEW
│       └── filterUser.pipe.spec.ts    # NEW
├── filters/
│   ├── http-exception.filter.spec.ts      # NEW
│   ├── payload-too-large.filter.spec.ts   # NEW
│   ├── not-found.filter.spec.ts           # NEW
│   ├── multer-exception.filter.spec.ts    # NEW
│   └── express-http-error.filter.spec.ts  # NEW
├── mails/
│   ├── mails.service.spec.ts      # NEW
│   └── mails.controller.spec.ts   # NEW
├── notifications/
│   ├── notifications.service.spec.ts    # NEW
│   └── notifications.controller.spec.ts # NEW
└── [etc -- co-located with source]
```

### Pattern 1: Guard Testing Pattern

**What:** Testing NestJS guards requires creating a mock ExecutionContext with request data
**When to use:** All guard spec files (APIT-01, APIT-02, APIT-03)
**Example:**

```typescript
const createMockExecutionContext = (overrides: {
  user?: Partial<JWTUser>;
  token?: string;
  ip?: string;
  handler?: Record<string, unknown>;
  classMetadata?: Record<string, unknown>;
}): ExecutionContext => {
  const request = {
    user: overrides.user,
    token: overrides.token,
    headers: { authorization: overrides.token ? `Bearer ${overrides.token}` : undefined },
    query: {},
    ip: overrides.ip,
    socket: { remoteAddress: overrides.ip },
    params: {},
  } as unknown as Request;

  const mockHandler = jest.fn();
  const mockClass = jest.fn();

  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}) as Response,
    }),
    getHandler: () => mockHandler,
    getClass: () => mockClass,
  } as unknown as ExecutionContext;
};
```

### Pattern 2: Exception Filter Testing Pattern

**What:** Testing NestJS exception filters requires mocking ArgumentsHost
**When to use:** All filter spec files (APIT-05)
**Example:**

```typescript
const createMockArgumentsHost = (): {
  host: ArgumentsHost;
  mockResponse: { status: jest.Mock; json: jest.Mock };
  mockRequest: Partial<Request>;
} => {
  const mockJson = jest.fn().mockReturnThis();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
  const mockRequest = { method: 'GET', url: '/test?q=1' };

  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status: mockStatus, json: mockJson }),
      getRequest: () => mockRequest,
    }),
  } as unknown as ArgumentsHost;

  return { host, mockResponse: { status: mockStatus, json: mockJson }, mockRequest };
};
```

### Pattern 3: Service Testing with createTestingModule

**What:** Using Phase 1 shared preset for service DI setup
**When to use:** All service spec files
**Example:**

```typescript
import createTestingModule from '@libs/test-utils/api-mocks/createTestingModule';
import createMongooseModelMock from '@libs/test-utils/api-mocks/createMongooseModelMock';
import { getModelToken } from '@nestjs/mongoose';

const modelMock = createMongooseModelMock(defaultData);

const module = await createTestingModule({
  providers: [
    MyService,
    { provide: getModelToken(MySchema.name), useValue: modelMock },
    { provide: DependencyService, useValue: { method: jest.fn() } },
  ],
});

const service = module.get<MyService>(MyService);
```

### Pattern 4: Controller Delegation Testing

**What:** Verify controller calls correct service method with correct args
**When to use:** All controller spec files (APIT-12)
**Example:**

```typescript
describe('MyController', () => {
  let controller: MyController;
  let service: MyService;

  beforeEach(async () => {
    const module = await createTestingModule({
      providers: [
        {
          provide: MyService,
          useValue: {
            myMethod: jest.fn().mockResolvedValue(expectedResult),
          },
        },
      ],
    });
    // Note: for controllers, use Test.createTestingModule with controllers array
  });

  it('should delegate to service with correct args', async () => {
    const result = await controller.endpoint(inputDto, mockUser);
    expect(service.myMethod).toHaveBeenCalledWith(inputDto, mockUser);
    expect(result).toEqual(expectedResult);
  });
});
```

### Anti-Patterns to Avoid

- **Testing the mock, not the service:** The filesharing.service.spec.ts currently provides FilesharingService as both the service AND the mock (`provide: FilesharingService, useValue: mockFileSharingService`), meaning it tests the mock object, not the real service. Always let DI resolve the real service class.
- **Commented-out tests as documentation:** surveys.service.spec.ts has ~15 commented-out tests. These should be uncommented, fixed to work with current APIs, and updated to use createMongooseModelMock.
- **Instance loggers in tests:** The project convention is static Logger calls, but some filters use `private readonly logger = new Logger()`. Tests should account for both patterns when mocking Logger.
- **Mock chains instead of proxy mocks:** Old tests manually chain `.mockReturnValue({ exec: jest.fn().mockReturnValue(...) })`. Use createMongooseModelMock which handles chaining via Proxy.

## Don't Hand-Roll

| Problem                          | Don't Build                                                       | Use Instead                                                               | Why                                                                                                        |
| -------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Mongoose query chain mocking     | Manual `jest.fn().mockReturnValue({ lean: jest.fn()... })` chains | `createMongooseModelMock` from Phase 1                                    | Proxy handles any chain depth automatically; manual mocks break when service adds `.lean()` or `.select()` |
| Testing module setup boilerplate | Raw `Test.createTestingModule` in every file                      | `createTestingModule` from Phase 1                                        | Preset silences Logger, provides CACHE_MANAGER automatically                                               |
| JWT user fixtures                | Inline JWTUser objects in each test file                          | Shared fixture from `surveys/mocks/user/jwtUser.ts` or new shared factory | Already exists in surveys mocks; should be extracted to shared location                                    |
| Mock ExecutionContext            | One-off object literals                                           | Shared `createMockExecutionContext` helper                                | Guards all need the same shape; reduces duplication across 6+ guard spec files                             |
| Mock ArgumentsHost               | Inline mocks in each filter test                                  | Shared `createMockArgumentsHost` helper                                   | All 5 filters need identical ArgumentsHost structure                                                       |

**Key insight:** The Phase 1 infrastructure (createTestingModule, createMongooseModelMock, cacheManagerMock) already solves the hardest mocking problems. Phase 2 should consistently use these rather than ad-hoc alternatives, and only add guard/filter-specific helpers.

## Common Pitfalls

### Pitfall 1: AuthGuard reads filesystem in constructor

**What goes wrong:** AuthGuard constructor calls `readFileSync(PUBLIC_KEY_FILE_PATH, 'utf8')` to read the RSA public key. If the file does not exist in the test environment, instantiation fails.
**Why it happens:** Guard is designed for production where the key file is always present.
**How to avoid:** Use `jest.mock('fs', () => ({ readFileSync: jest.fn().mockReturnValue('mock-public-key') }))` or create a test RSA key pair. Alternatively, mock the entire module.
**Warning signs:** `ENOENT` errors when constructing the guard in tests.

### Pitfall 2: Services accessing process.env in module scope

**What goes wrong:** MailsService, WireguardService, LicenseService, DockerService all read `process.env` at the module level (outside constructor). These values are undefined in tests.
**Why it happens:** Environment variables are destructured at import time: `const { MAILCOW_API_URL } = process.env;`
**How to avoid:** Set required env vars in `beforeAll`/`beforeEach`, or test behavior when env vars are missing (service should handle gracefully). For MailsService, test that `getMails` returns `[]` when IMAP config is missing.
**Warning signs:** Undefined axios base URLs, NaN timeouts.

### Pitfall 3: OnModuleInit side effects

**What goes wrong:** Services with `OnModuleInit` (MailsService, DockerService, HealthService, LicenseService, LdapKeycloakSyncService) automatically run initialization logic when the TestingModule compiles.
**Why it happens:** NestJS TestingModule calls lifecycle hooks by default.
**How to avoid:** Either mock the external calls made in `onModuleInit`, or use `jest.spyOn(service, 'onModuleInit').mockImplementation(() => {})` before `module.init()`. For services with `@Interval` or `@Timeout` decorators, these are handled by the ScheduleModule which should not be imported in unit tests.
**Warning signs:** Unexpected network calls, LDAP connection attempts, Docker socket connections during tests.

### Pitfall 4: Access cache leaking between tests

**What goes wrong:** The `accessCache` module (`apps/api/src/common/guards/accessCache.ts`) uses a module-level Map. If not cleared between tests, cached access decisions from one test affect subsequent tests.
**Why it happens:** Module-level state persists across tests in the same Jest worker.
**How to avoid:** Call `clearAccessCache()` in `beforeEach` for all AccessGuard and DynamicAppAccessGuard tests. Import it from the actual module.
**Warning signs:** Tests pass individually but fail when run together; access decisions appear cached.

### Pitfall 5: Testing mock objects instead of real services

**What goes wrong:** The current filesharing.service.spec.ts provides `{ provide: FilesharingService, useValue: mockFileSharingService }` which makes the test verify the mock, not the real service logic.
**Why it happens:** Copy-paste error or misunderstanding of NestJS DI testing pattern.
**How to avoid:** Always provide the real service class in providers, and mock only its dependencies. The service under test must be resolved from DI as the real class.
**Warning signs:** Test passes but service code has a bug; assertions match mock return values exactly.

### Pitfall 6: HttpExceptionFilter extends BaseExceptionFilter

**What goes wrong:** HttpExceptionFilter extends `BaseExceptionFilter` from `@nestjs/core`, which requires `HttpAdapterHost` in its constructor. This makes it harder to instantiate in tests than the other filters.
**Why it happens:** BaseExceptionFilter needs the HTTP adapter to forward unhandled exceptions.
**How to avoid:** Provide a mock `HttpAdapterHost` with a mock `httpAdapter` that has the necessary methods (reply, isHeadersSent, etc.). Or mock `super.catch()` on the prototype.
**Warning signs:** "Cannot read property 'httpAdapter' of undefined" errors.

## Code Examples

### Guard Test: AuthGuard with valid token

```typescript
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import AuthGuard from './auth.guard';

jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue('mock-public-key'),
}));

describe(AuthGuard.name, () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() } as unknown as JwtService;
    reflector = { get: jest.fn().mockReturnValue(false) } as unknown as Reflector;
    guard = new AuthGuard(jwtService, reflector);
  });

  it('should allow access with a valid token', async () => {
    const mockUser = { preferred_username: 'testuser', ldapGroups: [] };
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockUser);

    const context = createMockExecutionContext({ token: 'valid-jwt-token' });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-jwt-token', {
      publicKey: 'mock-public-key',
      algorithms: ['RS256'],
    });
  });

  it('should throw UNAUTHORIZED when no token is provided on protected route', async () => {
    const context = createMockExecutionContext({});
    await expect(guard.canActivate(context)).rejects.toThrow();
  });

  it('should allow access on public route without token', async () => {
    (reflector.get as jest.Mock).mockReturnValue(true);
    const context = createMockExecutionContext({});
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });
});
```

### Filter Test: NotFoundFilter

```typescript
import { NotFoundException, HttpStatus } from '@nestjs/common';
import NotFoundFilter from './not-found.filter';

describe(NotFoundFilter.name, () => {
  let filter: NotFoundFilter;

  beforeEach(() => {
    filter = new NotFoundFilter();
  });

  it('should return 404 JSON response', () => {
    const { host, mockResponse } = createMockArgumentsHost();
    const exception = new NotFoundException();

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Not Found',
      error: 'Not Found',
    });
  });
});
```

### Service Test: UserPreferencesService (simple service)

```typescript
import { getModelToken } from '@nestjs/mongoose';
import createTestingModule from '@libs/test-utils/api-mocks/createTestingModule';
import createMongooseModelMock from '@libs/test-utils/api-mocks/createMongooseModelMock';
import UserPreferencesService from './user-preferences.service';
import { UserPreferences } from './user-preferences.schema';

describe(UserPreferencesService.name, () => {
  let service: UserPreferencesService;
  const modelMock = createMongooseModelMock({ collapsedBulletins: {}, bulletinBoardGridRows: '2' });

  beforeEach(async () => {
    const module = await createTestingModule({
      providers: [UserPreferencesService, { provide: getModelToken(UserPreferences.name), useValue: modelMock }],
    });
    service = module.get(UserPreferencesService);
  });

  it('should return default values when no preferences exist', async () => {
    modelMock.findOne.mockImplementation(() => ({
      select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }),
    }));

    const result = await service.getForUser('testuser', 'collapsedBulletins,bulletinBoardGridRows');
    expect(result).toEqual({ collapsedBulletins: {}, bulletinBoardGridRows: '1' });
  });
});
```

## State of the Art

| Old Approach                          | Current Approach                                                 | When Changed      | Impact                                                                     |
| ------------------------------------- | ---------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------- |
| Manual Mongoose chain mocks           | createMongooseModelMock (Proxy-based)                            | Phase 1 (current) | All new service tests should use proxy mock                                |
| Raw Test.createTestingModule          | createTestingModule preset                                       | Phase 1 (current) | Silences Logger, provides CACHE_MANAGER automatically                      |
| Duplicate cacheManagerMock per module | Single shared cacheManagerMock at libs/src/test-utils/api-mocks/ | Phase 1 (current) | Old mock at apps/api/src/common/mocks/ still exists but should be replaced |

**Deprecated/outdated:**

- `apps/api/src/common/mocks/cacheManagerMock.ts`: Old location, missing `del` and `reset` methods. Replace with `@libs/test-utils/api-mocks/cacheManagerMock`.
- `apps/api/src/common/cache-manager.mock.ts`: Another duplicate mock. Replace with shared version.

## Codebase Inventory

### Guards (6 total, 0 tested)

| Guard                 | File                                      | Dependencies                                                    | Complexity                                |
| --------------------- | ----------------------------------------- | --------------------------------------------------------------- | ----------------------------------------- |
| AuthGuard             | `auth/auth.guard.ts`                      | JwtService, Reflector, fs.readFileSync                          | Medium -- JWT verify + public route check |
| AccessGuard           | `auth/access.guard.ts`                    | Reflector, AppConfigService, GlobalSettingsService, accessCache | High -- cache, group checks, admin bypass |
| AdminGuard            | `common/guards/admin.guard.ts`            | Reflector, GlobalSettingsService                                | Low -- getIsAdmin check                   |
| DynamicAppAccessGuard | `common/guards/dynamicAppAccess.guard.ts` | Reflector, AppConfigService, GlobalSettingsService, accessCache | High -- dynamic param + cache             |
| LocalhostGuard        | `common/guards/localhost.guard.ts`        | None                                                            | Low -- IP check only                      |
| IsPublicAppGuard      | `common/guards/isPublicApp.guard.ts`      | AppConfigService                                                | Low                                       |
| WebhookGuard          | `webhook/webhook.guard.ts`                | WebhookClientsService                                           | Medium -- header validation + timestamp   |

### Pipes (3 total, 0 tested directly)

| Pipe             | File                                | Complexity                                 |
| ---------------- | ----------------------------------- | ------------------------------------------ |
| ValidatePathPipe | `common/pipes/validatePath.pipe.ts` | Low -- delegates to validatePath utility   |
| ParseJsonPipe    | `common/pipes/parseJson.pipe.ts`    | Low -- JSON.parse with BadRequestException |
| FilterUserPipe   | `common/pipes/filterUser.pipe.ts`   | Low -- array filter by emailAddress        |

### Exception Filters (5 total, 0 tested)

| Filter                 | File                                   | Complexity                                 |
| ---------------------- | -------------------------------------- | ------------------------------------------ |
| HttpExceptionFilter    | `filters/http-exception.filter.ts`     | Medium -- extends BaseExceptionFilter      |
| PayloadTooLargeFilter  | `filters/payload-too-large.filter.ts`  | Low -- file vs JSON body                   |
| NotFoundFilter         | `filters/not-found.filter.ts`          | Low -- static 404 response                 |
| MulterExceptionFilter  | `filters/multer-exception.filter.ts`   | Low -- 3 error code branches               |
| ExpressHttpErrorFilter | `filters/express-http-error.filter.ts` | Medium -- catch-all with multiple branches |

### Services needing new spec files (15+)

| Service                 | Lines | External Deps                          | Mongoose Models                |
| ----------------------- | ----- | -------------------------------------- | ------------------------------ |
| MailsService            | 527   | ImapFlow, Mailcow Axios, Docker        | MailProvider                   |
| NotificationsService    | 720   | PushNotificationQueue, Expo            | Notification, UserNotification |
| DockerService           | 607   | dockerode (Docker)                     | None                           |
| LdapKeycloakSyncService | 865   | LDAP Client, Keycloak API              | LdapKeycloakSync               |
| LicenseService          | 217   | License server Axios, JwtService       | License                        |
| HealthService           | 148   | @nestjs/terminus indicators            | None                           |
| MobileAppService        | 100   | None (delegates to other services)     | None                           |
| UserPreferencesService  | 84    | None                                   | UserPreferences                |
| WireguardService        | 300+  | Wireguard Axios API                    | None                           |
| WebdavService           | 465   | WebdavClientFactory, got               | None                           |
| WebdavSharesService     | ~200  | None                                   | WebdavShare                    |
| FilesharingService      | 400+  | WebdavService, OnlyofficeService, etc. | PublicShare                    |
| AuthService             | ~100  | JwtService, UsersService               | None                           |
| WebhookClientsService   | ~100  | None                                   | WebhookClient                  |

### Existing spec files needing deepening

| File                        | Current Tests           | Needs                                              |
| --------------------------- | ----------------------- | -------------------------------------------------- |
| surveys.service.spec.ts     | 2 active (15 commented) | Uncomment + fix all tests, add scoring/permissions |
| filesharing.service.spec.ts | 2 (tests the mock!)     | Complete rewrite with real service                 |
| groups.controller.spec.ts   | 3                       | Add tests for remaining endpoints                  |
| sse.controller.spec.ts      | 3                       | Add SSE event tests                                |

### Controllers needing new spec files (12+)

auth, docker, health, license, mobileApp, user-preferences, mails, notifications, webdav-shares, webhook, webhook-clients, bulletin-category, parent-child-pairing, filesharing, metrics

## Open Questions

1. **Shared JWTUser mock factory location**
   - What we know: A JWTUser mock exists at `apps/api/src/surveys/mocks/user/jwtUser.ts` and is also duplicated in conferences.service.spec.ts
   - What's unclear: Whether Phase 1 created a shared factory for API tests (Phase 1 creates factories in `libs/src/test-utils/factories/` but those may be frontend-focused)
   - Recommendation: Create a shared JWTUser factory at `libs/src/test-utils/api-mocks/` or verify Phase 1 already handled this. If not, create one in the first plan wave.

2. **Guard test helper placement**
   - What we know: createMockExecutionContext and createMockArgumentsHost are needed by multiple test files
   - What's unclear: Whether these should live in `libs/src/test-utils/api-mocks/` or in `apps/api/src/common/test-helpers/`
   - Recommendation: Place in `libs/src/test-utils/api-mocks/` alongside existing shared mocks, since they are reusable across the entire API test suite.

## Validation Architecture

### Test Framework

| Property           | Value                                                                              |
| ------------------ | ---------------------------------------------------------------------------------- |
| Framework          | Jest 29.7.0 + ts-jest 29.1.2                                                       |
| Config file        | `apps/api/jest.config.ts` (extends `jest.preset.cjs`)                              |
| Quick run command  | `npx jest --config apps/api/jest.config.ts --testPathPattern <file> --no-coverage` |
| Full suite command | `npm run test`                                                                     |

### Phase Requirements -> Test Map

| Req ID  | Behavior                           | Test Type | Automated Command                                                                                                                                                  | File Exists?               |
| ------- | ---------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| APIT-01 | AuthGuard JWT verification         | unit      | `npx jest --config apps/api/jest.config.ts --testPathPattern auth.guard.spec -x`                                                                                   | No -- Wave 0               |
| APIT-02 | AccessGuard LDAP group checks      | unit      | `npx jest --config apps/api/jest.config.ts --testPathPattern access.guard.spec -x`                                                                                 | No -- Wave 0               |
| APIT-03 | AdminGuard + DynamicAppAccessGuard | unit      | `npx jest --config apps/api/jest.config.ts --testPathPattern "admin.guard.spec\|dynamicAppAccess.guard.spec" -x`                                                   | No -- Wave 0               |
| APIT-04 | Pipe validation tests              | unit      | `npx jest --config apps/api/jest.config.ts --testPathPattern "validatePath.pipe.spec\|parseJson.pipe.spec\|filterUser.pipe.spec" -x`                               | No -- Wave 0               |
| APIT-05 | Exception filter tests             | unit      | `npx jest --config apps/api/jest.config.ts --testPathPattern "filter.spec" -x`                                                                                     | No -- Wave 0               |
| APIT-06 | Survey service deepening           | unit      | `npx jest --config apps/api/jest.config.ts --testPathPattern surveys.service.spec -x`                                                                              | Yes -- extend              |
| APIT-07 | Mail service tests                 | unit      | `npx jest --config apps/api/jest.config.ts --testPathPattern mails.service.spec -x`                                                                                | No -- create               |
| APIT-08 | File sharing service tests         | unit      | `npx jest --config apps/api/jest.config.ts --testPathPattern filesharing.service.spec -x`                                                                          | Yes -- rewrite             |
| APIT-09 | Conference service tests           | unit      | `npx jest --config apps/api/jest.config.ts --testPathPattern conferences.service.spec -x`                                                                          | Yes -- extend              |
| APIT-10 | Notification service tests         | unit      | `npx jest --config apps/api/jest.config.ts --testPathPattern notifications.service.spec -x`                                                                        | No -- create               |
| APIT-11 | Infrastructure service tests       | unit      | `npx jest --config apps/api/jest.config.ts --testPathPattern "(docker\|ldap-keycloak\|license\|health\|mobileApp\|user-preferences\|wireguard\|webdav).*.spec" -x` | No -- create               |
| APIT-12 | Controller delegation tests        | unit      | `npx jest --config apps/api/jest.config.ts --testPathPattern controller.spec -x`                                                                                   | Partial -- extend + create |
| APIT-13 | Deepen existing shallow specs      | unit      | `npm run test`                                                                                                                                                     | Yes -- extend              |

### Sampling Rate

- **Per task commit:** `npx jest --config apps/api/jest.config.ts --testPathPattern <changed-spec-file> --no-coverage -x`
- **Per wave merge:** `npm run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `apps/api/src/auth/auth.guard.spec.ts` -- covers APIT-01
- [ ] `apps/api/src/auth/access.guard.spec.ts` -- covers APIT-02
- [ ] `apps/api/src/common/guards/admin.guard.spec.ts` -- covers APIT-03
- [ ] `apps/api/src/common/guards/dynamicAppAccess.guard.spec.ts` -- covers APIT-03
- [ ] `apps/api/src/common/pipes/validatePath.pipe.spec.ts` -- covers APIT-04
- [ ] `apps/api/src/common/pipes/parseJson.pipe.spec.ts` -- covers APIT-04
- [ ] `apps/api/src/common/pipes/filterUser.pipe.spec.ts` -- covers APIT-04
- [ ] `apps/api/src/filters/*.filter.spec.ts` (5 files) -- covers APIT-05
- [ ] Shared `createMockExecutionContext` helper -- shared by APIT-01/02/03 guard tests
- [ ] Shared `createMockArgumentsHost` helper -- shared by APIT-05 filter tests
- [ ] Shared JWTUser mock factory (verify Phase 1 or create) -- shared by most tests

## Sources

### Primary (HIGH confidence)

- Direct codebase analysis of all guard, pipe, filter, service, and controller source files
- Existing spec files analyzed for patterns, depth, and gaps
- Phase 1 infrastructure (`createTestingModule`, `createMongooseModelMock`) verified in source

### Secondary (MEDIUM confidence)

- NestJS 11 testing patterns based on @nestjs/testing 11.0.17 API (stable, well-documented)
- Jest 29 mocking patterns (stable, well-documented)

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - all dependencies already installed and configured, verified in package.json
- Architecture: HIGH - patterns directly derived from existing codebase spec files (surveys.controller.spec.ts is the gold standard)
- Pitfalls: HIGH - identified through direct code analysis (AuthGuard fs.readFileSync, process.env at module level, accessCache state leakage, filesharing mock-testing-mock antipattern)

**Research date:** 2026-02-26
**Valid until:** 2026-03-28 (stable NestJS testing patterns, unlikely to change)
