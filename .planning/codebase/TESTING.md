# Testing Patterns

**Analysis Date:** 2026-02-26

## Test Framework

**API (NestJS) — Runner:**

- Jest via `ts-jest`
- Config: `apps/api/jest.config.ts` (references `jest.preset.cjs` at root)
- Environment: `node`
- Coverage output: `coverage/apps/api`

**Frontend (React/Vite) — Runner:**

- Vitest (configured inside `apps/frontend/vite.config.mts` under `test:`)
- Environment: `jsdom`
- Globals: enabled (no explicit `import { describe, it, expect }` needed)
- Setup file: `apps/frontend/test/vitest.setup.ts` (imports `@testing-library/jest-dom`)
- Coverage provider: `v8`
- Coverage output: `coverage/apps/frontend`
- Config: `vitest.workspace.ts` at root references `**/*/vitest.config.mts` (none currently exist separately)

**Assertion Library:**

- Jest matchers (API) and Vitest + `@testing-library/jest-dom` (frontend)

**Run Commands:**

```bash
npm run test:api          # Run API tests (Jest, with detectOpenHandles)
npm run test:frontend     # Run frontend tests (Vitest)
npm run test              # Run API tests only (nx run-many)
npm run coverage          # Run vitest coverage
```

## Test File Organization

**Location:** Co-located with source files in the same directory

**API naming pattern:** `[source-name].spec.ts`

- `users.service.ts` → `users.service.spec.ts`
- `users.controller.ts` → `users.controller.spec.ts`
- `sanitizePath.ts` → `sanitizePath.spec.ts` (for utilities)
- `multer.utilities.ts` → `multer.utilities.spec.ts`

**Mock files:** Co-located with the service they mock, named `[service].mock.ts` or `[service].service.mock.ts`

- `apps/api/src/groups/groups.service.mock.ts`
- `apps/api/src/filesystem/filesystem.service.mock.ts`
- `apps/api/src/appconfig/appconfig.mock.ts`
- `apps/api/src/common/mocks/cacheManagerMock.ts` (shared infrastructure mock)
- `apps/api/src/common/cache-manager.mock.ts` (alternative location pattern — duplicate)

**Fixture directories:** For complex domain data, a `mocks/` subdirectory is used:

- `apps/api/src/surveys/mocks/` — contains `surveys/`, `user/`, `index.ts`
- `apps/api/src/common/mocks/` — contains `cacheManagerMock.ts`, `index.ts`

**Frontend tests:** No frontend test files exist yet (0 `.spec.tsx` or `.test.tsx` files in `apps/frontend/src/`). The test infrastructure (Vitest + jsdom + `@testing-library/jest-dom`) is fully set up.

**Directory pattern:**

```
apps/api/src/users/
├── users.service.ts
├── users.service.spec.ts        # Unit tests for service
├── users.controller.ts
├── users.controller.spec.ts     # Unit tests for controller
├── users.service.mock.ts        # Not present here — but pattern exists per domain
└── user.schema.ts

apps/api/src/surveys/
├── surveys.service.ts
├── surveys.service.spec.ts
├── surveys.controller.spec.ts
├── survey-answers.service.spec.ts
├── mocks/
│   ├── index.ts                 # Re-exports all mocks
│   ├── surveys/                 # Survey fixture data
│   └── user/                   # User fixture data

apps/api/src/common/
├── mocks/
│   ├── cacheManagerMock.ts
│   └── index.ts
└── cache-manager.mock.ts        # Duplicate pattern
```

## Test Structure

**API service test suite organization:**

```typescript
describe(UsersService.name, () => {
  // Use ClassName.name as suite label
  let service: UsersService;
  let model: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: modelMock },
        { provide: GroupsService, useValue: mockGroupsService },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks(); // Standard teardown in most suites
  });

  describe('methodName', () => {
    it('should do the expected behavior', async () => {
      const result = await service.methodName(input);
      expect(result).toEqual(expected);
      expect(dependency.method).toHaveBeenCalledWith(expectedArgs);
    });
  });
});
```

**API controller test suite organization:**

```typescript
describe(UsersController.name, () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('endpointMethod', () => {
    it('should call service method with correct arguments', async () => {
      await controller.endpointMethod(arg);
      expect(service.serviceMethod).toHaveBeenCalledWith(arg);
    });
  });
});
```

**Patterns:**

- Always use `describe(ClassName.name, ...)` for the top-level suite (uses `.name` property, not string literals)
- `beforeEach`: create fresh NestJS `TestingModule` per test (no shared module state)
- `afterEach`: `jest.clearAllMocks()` — clears call counts and return values, does not restore implementations
- `afterAll`: used sparingly when cleanup of stateful mocks is needed (e.g., scheduler mocks)
- One `describe` block per method/behavior
- Controller tests verify delegation to service (not business logic)
- Service tests verify business logic and database interactions

## Mocking

**Framework:** Jest (API), with `jest.fn()`, `jest.spyOn()`, `jest.mock()`

**NestJS Dependency Injection mock pattern:**
Providers are replaced inline in `createTestingModule`:

```typescript
{ provide: DependencyService, useValue: mockDependencyService }
{ provide: getModelToken(ModelName.name), useValue: modelMock }
{ provide: CACHE_MANAGER, useValue: cacheManagerMock }
{ provide: EventEmitter2, useValue: { emit: jest.fn() } }
```

**Shared mock objects (reused across test files):**

```typescript
// apps/api/src/groups/groups.service.mock.ts
const mockGroupsService = {
  fetchUsers: jest.fn().mockResolvedValue([]),
  fetchGroupByPath: jest.fn().mockResolvedValue({}),
  fetchAllUsers: jest.fn().mockResolvedValue([]),
};
export default mockGroupsService;
```

**Mongoose model mock pattern (chained query builder):**

```typescript
const userModelMock = {
  findOne: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(mockUser),
    exec: jest.fn().mockResolvedValue(mockUser),
  }),
  findOneAndUpdate: jest.fn().mockReturnValue({
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(mockUser),
  }),
  deleteOne: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  }),
};
```

**Module-level mocking with `jest.mock()`:**

```typescript
jest.mock('axios'); // Mock external HTTP library
jest.mock('fs'); // Mock Node fs module
jest.mock('@libs/user/utils/getIsAdmin', () => ({
  __esModule: true,
  default: jest.fn(),
}));
```

**Spy pattern for method override within same test:**

```typescript
jest.spyOn(service, 'methodName').mockResolvedValue(returnValue);
jest.spyOn(service as any, 'privateMethod').mockResolvedValue(returnValue);
jest.spyOn(ServiceClass, 'staticMethod').mockReturnValue(returnValue);
```

**What to Mock:**

- All external HTTP calls (axios, got)
- All Mongoose model methods
- All NestJS cache manager (`CACHE_MANAGER`)
- All dependent services (inject mock object via DI, not real service)
- Node built-ins when testing filesystem logic (`fs`, `multer`)
- Utility functions from `@libs` when they depend on environment

**What NOT to Mock:**

- The class under test (service or controller being tested)
- Pure utility functions being tested directly (e.g., `sanitizePath.spec.ts` tests the real function)
- NestJS framework itself (`TestingModule`, `Test`)

## Fixtures and Factories

**Inline fixtures:** Most tests define mock data at module scope as `const` objects:

```typescript
const mockUser: UserDocument = {
  username: 'testuser',
  email: 'testuser@example.com',
  // ...
} as UserDocument;
```

**Shared fixture files:** For complex domains, fixtures live in `mocks/` directories with an `index.ts` barrel export:

```typescript
// apps/api/src/surveys/mocks/index.ts
export { createdSurvey01, createSurvey01, ... } from './surveys';
export { firstMockJWTUser, secondMockJWTUser, ... } from './user';
```

**Factory helper pattern:**

```typescript
// Reusable query builder factory
const makeMockQuery = <T>(result: T) => ({
  sort: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(result),
});

export const mockAppConfigModel = {
  find: jest.fn().mockImplementation(() => makeMockQuery([mockAppConfig])),
};
```

**Location:**

- Small mock data: inline in spec file
- Reused service mocks: `[service].mock.ts` next to the service
- Complex domain fixtures: `[domain]/mocks/` directory with `index.ts`
- Shared infra mocks: `apps/api/src/common/mocks/`

## Coverage

**Requirements:** No minimum enforced in config

**View Coverage:**

```bash
npm run coverage          # Vitest coverage for frontend
# API coverage auto-collected: collectCoverage: true in apps/api/jest.config.ts
# Output: coverage/apps/api and coverage/apps/frontend
```

## Test Types

**Unit Tests (API — primary):**

- Scope: Single NestJS service or controller in isolation
- All dependencies mocked via DI
- 33 spec files covering all service/controller pairs in `apps/api/src/`

**Utility Tests (API):**

- Scope: Pure functions without side effects
- No mocking needed
- Examples: `sanitizePath.spec.ts`, `validatePath.spec.ts`, `multer.utilities.spec.ts`

**Integration Tests:**

- Not present — no separate integration test layer

**E2E Tests:**

- Not used

**Frontend Tests:**

- Infrastructure fully configured (Vitest + jsdom + `@testing-library/jest-dom`)
- Zero test files currently exist in `apps/frontend/src/`
- No lib tests in `libs/src/`

## Common Patterns

**Async Testing:**

```typescript
it('should return expected value', async () => {
  const result = await service.asyncMethod(input);
  expect(result).toEqual(expectedValue);
});
```

**Error Testing:**

```typescript
// Async method that throws
await expect(service.methodThatThrows(input)).rejects.toThrow(CustomHttpException);

// With specific error message
await expect(service.toggleConferenceIsRunning(id, flag, username)).rejects.toThrow(
  ConferencesErrorMessage.YouAreNotTheCreator,
);

// Sync method that throws
expect(() => pipe.transform('')).toThrow(BadRequestException);
```

**Testing negative/not-called:**

```typescript
expect(service.stopConference).not.toHaveBeenCalled();
expect(configs[0].extendedOptions).not.toHaveProperty('secretKey');
```

**Testing call arguments precisely:**

```typescript
expect(model.findOneAndUpdate).toHaveBeenCalledWith(
  { username: userDto.username },
  { $set: { email: userDto.email, ... } },
  { new: true, upsert: true, projection: USER_DB_PROJECTION },
);

// Partial object matching
expect(service.update).toHaveBeenCalledWith(
  expect.objectContaining({ isRunning: true }),
);

// Array subset matching
expect(model.bulkWrite).toHaveBeenCalledWith(
  expect.arrayContaining([{ updateOne: { ... } }]),
  { ordered: true },
);
```

**Testing with `jest.spyOn` for per-test overrides:**

```typescript
beforeEach(() => {
  jest.spyOn(service, 'startConference').mockResolvedValue(undefined);
  jest.spyOn(service, 'checkConferenceIsRunningWithBBB').mockResolvedValue(false);
});
```

---

_Testing analysis: 2026-02-26_
