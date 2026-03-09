# Testing Patterns

**Analysis Date:** 2026-03-09

## Test Framework

**API (NestJS) - Jest:**

- Jest 29.x with ts-jest transform
- Config: `apps/api/jest.config.ts`
- Preset: `jest.preset.cjs` (extends `@nx/jest/preset`)
- Environment: node
- Coverage directory: `coverage/apps/api`
- Collects coverage by default

**Frontend (React) - Vitest:**

- Vitest 3.x
- Config: embedded in `apps/frontend/vite.config.mts` under `test` key
- Environment: jsdom
- Setup file: `apps/frontend/test/vitest.setup.ts` (imports `@testing-library/jest-dom`)
- Globals enabled (`globals: true`)
- Coverage directory: `coverage/apps/frontend` (v8 provider)

**Run Commands:**

```bash
npm run test:api          # Run API tests (Jest, with --detectOpenHandles)
npm run test:frontend     # Run frontend tests (Vitest)
npm run test              # Run API tests only (nx run-many)
npm run coverage          # Run Vitest with coverage
npm run test-with-ui      # Vitest with UI mode
```

## Test File Organization

**Location:** Co-located with source files (same directory as the module being tested)

**Naming:** `{source-file-name}.spec.ts` (always `.spec.ts`, never `.test.ts`)

**API structure:**

```
apps/api/src/users/
  users.service.ts
  users.service.spec.ts
  users.controller.ts
  users.controller.spec.ts
  users.module.ts
  user.schema.ts
  dto/
    update-user.dto.ts
```

**Utility tests:**

```
apps/api/src/common/utils/
  sanitizePath.ts          # (actually in libs)
  sanitizePath.spec.ts
  validatePath.ts          # (actually in libs)
  validatePath.spec.ts
```

**Frontend:** Currently has zero test files (only `tsconfig.spec.json` exists). All 33 spec files are in the API.

## Test Structure

**API Service Tests:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Model } from 'mongoose';

// Mock data defined at module level
const mockUser: UserDocument = {
  username: 'testuser',
  email: 'testuser@example.com',
  // ... full mock object
} as UserDocument;

// Model mock object with chained methods
const userModelMock = {
  create: jest.fn().mockResolvedValue(mockUser),
  find: jest.fn().mockReturnValue({
    lean: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUser),
    }),
  }),
  findOne: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
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

describe(UsersService.name, () => {
  let service: UsersService;
  let model: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: userModelMock },
        { provide: GroupsService, useValue: mockGroupsService },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  describe('methodName', () => {
    it('should describe expected behavior', async () => {
      // Arrange, Act, Assert
      await service.someMethod('arg');
      expect(model.findOne).toHaveBeenCalledWith({ username: 'arg' });
    });
  });
});
```

**Utility Tests (pure function testing):**

```typescript
describe(sanitizePath.name, () => {
  it('should return a normal filename unchanged', () => {
    expect(sanitizePath('file.png')).toBe('file.png');
  });

  it('should remove .. sequences', () => {
    expect(sanitizePath('../../etc/passwd')).toBe('etc/passwd');
  });
});
```

**Patterns:**

- Use `describe(ClassName.name, ...)` for top-level suite (uses the class/function name dynamically)
- Nested `describe` blocks per method name
- `beforeEach` creates a fresh NestJS testing module
- Test descriptions start with "should"
- Use `async/await` for all async tests

## Mocking

**Framework:** Jest built-in (`jest.fn()`, `jest.mock()`, `jest.spyOn()`)

**Service Mock Files:**
Each NestJS service that is a dependency has a co-located mock file:

```
apps/api/src/groups/groups.service.mock.ts
apps/api/src/filesharing/filesharing.service.mock.ts
apps/api/src/filesystem/filesystem.service.mock.ts
apps/api/src/appconfig/appconfig.mock.ts
apps/api/src/lmnApi/lmnApi.service.mock.ts
apps/api/src/wireguard/wireguard.mock.ts
apps/api/src/common/mocks/cacheManagerMock.ts
apps/api/src/common/cache-manager.mock.ts
```

**Service Mock Pattern:**

```typescript
// apps/api/src/groups/groups.service.mock.ts
const mockGroupsService = {
  fetchUsers: jest.fn().mockResolvedValue([]),
  fetchGroupByPath: jest.fn().mockResolvedValue({}),
  fetchGroupMembers: jest.fn().mockResolvedValue([]),
  fetchAllUsers: jest.fn().mockResolvedValue([]),
  fetchUserById: jest.fn().mockResolvedValue({}),
  searchGroups: jest.fn().mockResolvedValue([]),
  getInvitedMembers: jest.fn().mockResolvedValue([]),
};

export default mockGroupsService;
```

**Cache Manager Mock:**

```typescript
// apps/api/src/common/mocks/cacheManagerMock.ts
const cacheManagerMock = {
  get: jest.fn(),
  set: jest.fn(),
};

export default cacheManagerMock;
```

**Mongoose Model Mocking:**

- Models are mocked as plain objects with `jest.fn()` methods
- Chained Mongoose query methods (`.lean()`, `.exec()`, `.select()`) are mocked with `mockReturnThis()` and `mockResolvedValue()`
- Provided via `getModelToken(Model.name)` in the testing module

**External Library Mocking:**

```typescript
jest.mock('axios');
```

**What to Mock:**

- All NestJS injectable dependencies (services, models, cache manager, event emitter)
- External HTTP clients (axios)
- Mongoose models

**What NOT to Mock:**

- The service/controller under test
- Pure utility functions (test directly)
- DTOs and data types

## Fixtures and Factories

**Test Data:**

- Mock data is defined as `const` objects at the top of each spec file
- No shared fixture files or factory libraries
- Each test file defines its own mock data inline
- Complex test suites (e.g., `surveys.controller.spec.ts`) extract mock data to separate fixture files

```typescript
const mockUser: UserDocument = {
  username: 'testuser',
  email: 'testuser@example.com',
  firstName: 'Test',
  lastName: 'User',
  password: 'password123',
  ldapGroups: {
    /* ... */
  },
} as UserDocument;
```

**Location:** Inline in spec files or imported from module-specific mock files

## Coverage

**Requirements:** No enforced coverage threshold

**View Coverage:**

```bash
npm run coverage                           # Vitest coverage (frontend/libs)
# API coverage collected automatically via jest.config.ts (collectCoverage: true)
```

**Coverage Output:**

- API: `coverage/apps/api/`
- Frontend: `coverage/apps/frontend/`

## Test Types

**Unit Tests (API):**

- 33 spec files, all in `apps/api/src/`
- Test individual services and controllers in isolation
- Use NestJS `Test.createTestingModule()` for dependency injection
- Mock all external dependencies

**Utility Tests (API):**

- Pure function tests for utilities like `sanitizePath`, `validatePath`
- Located in `apps/api/src/common/utils/`
- Simple input/output assertions, no DI setup needed

**Integration Tests:**

- Not used (no database integration tests)

**E2E Tests:**

- Not used

**Frontend Tests:**

- Not present (no spec files exist in `apps/frontend/src/`)
- Vitest is configured and ready but no tests have been written

## Common Patterns

**Async Testing:**

```typescript
it('should return cached users if available', async () => {
  cacheManagerMock.get.mockResolvedValue(cachedUsers);

  const result = await service.findAllCachedUsers(school);

  expect(result).toEqual(cachedUsers);
  expect(cacheManagerMock.get).toHaveBeenCalledWith(ALL_USERS_CACHE_KEY + school);
});
```

**Error Testing:**

```typescript
it('should throw NoString for null input', () => {
  expect(() => validatePath(BASE_PATH, null)).toThrow(BadRequestException);
  expect(() => validatePath(BASE_PATH, null)).toThrow(PathValidationErrorMessages.NoString);
});
```

**Spying on Service Methods:**

```typescript
it('should return users matching the search string', async () => {
  jest.spyOn(service, 'findAllCachedUsers').mockResolvedValue(cachedUsers);

  const result = await service.searchUsersByName('agy', 'test');

  expect(result).toEqual(cachedUsers);
  expect(service.findAllCachedUsers).toHaveBeenCalledWith('agy');
});
```

**Chained Mongoose Mock Override:**

```typescript
jest.spyOn(model, 'findOne').mockReturnValueOnce({
  select: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(mockUser),
} as unknown as any);
```

## NestJS Testing Module Setup

Every API spec file follows this pattern for setting up the DI container:

```typescript
beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ServiceUnderTest,
      { provide: getModelToken(Schema.name), useValue: modelMock },
      { provide: DependencyService, useValue: mockDependencyService },
      { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      { provide: ConfigService, useValue: { get: jest.fn() } },
    ],
  }).compile();

  service = module.get<ServiceUnderTest>(ServiceUnderTest);
});
```

Key injection tokens used in tests:

- `getModelToken(Schema.name)` for Mongoose models
- `CACHE_MANAGER` for cache-manager
- `EventEmitter2` for event emitter
- `ConfigService` for environment config
- `SchedulerRegistry` for scheduled tasks

---

_Testing analysis: 2026-03-09_
