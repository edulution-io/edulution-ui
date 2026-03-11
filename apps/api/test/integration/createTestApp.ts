/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

/* eslint-disable max-classes-per-file, import/no-extraneous-dependencies, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import request from 'supertest';
import type JWTUser from '@libs/user/types/jwt/jwtUser';

const TEST_USER: JWTUser = {
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000),
  jti: 'test-jti',
  iss: 'test-issuer',
  sub: 'test-sub',
  typ: 'Bearer',
  azp: 'edulution-ui',
  session_state: 'test-session',
  resource_access: {},
  scope: 'openid profile email',
  sid: 'test-sid',
  email_verified: true,
  name: 'Test User',
  preferred_username: 'testuser',
  given_name: 'Test',
  family_name: 'User',
  email: 'test@example.com',
  school: 'default-school',
  ldapGroups: ['/role-teacher'],
};

const TEST_ADMIN_USER: JWTUser = {
  ...TEST_USER,
  preferred_username: 'admin',
  name: 'Admin User',
  given_name: 'Admin',
  family_name: 'User',
  email: 'admin@example.com',
  ldapGroups: ['/role-globaladministrator'],
};

class MockAuthGuard implements CanActivate {
  private user: JWTUser | null;

  constructor(user: JWTUser | null = TEST_USER) {
    this.user = user;
  }

  canActivate(context: ExecutionContext): boolean {
    if (!this.user) {
      return false;
    }
    const req = context.switchToHttp().getRequest();
    req.user = this.user;
    req.token = 'test-token';
    return true;
  }
}

class MockAccessGuard implements CanActivate {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  canActivate(): boolean {
    return true;
  }
}

interface CreateTestAppOptions {
  modules: unknown[];
  user?: JWTUser | null;
  providers?: unknown[];
  overrides?: { provide: unknown; useValue: unknown }[];
}

const createTestApp = async (options: CreateTestAppOptions): Promise<INestApplication> => {
  const { modules, user = TEST_USER, providers = [], overrides = [] } = options;

  let builder = Test.createTestingModule({
    imports: modules as never[],
    providers: [
      { provide: APP_GUARD, useValue: new MockAuthGuard(user) },
      { provide: APP_GUARD, useValue: new MockAccessGuard() },
      ...(providers as never[]),
    ],
  });

  overrides.forEach((override) => {
    builder = builder.overrideProvider(override.provide).useValue(override.useValue);
  });

  const moduleFixture: TestingModule = await builder.compile();
  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('edu-api');
  await app.init();
  return app;
};

const getAgent = (app: INestApplication) => request(app.getHttpServer());

export { createTestApp, getAgent, MockAuthGuard, MockAccessGuard, TEST_USER, TEST_ADMIN_USER };
export type { CreateTestAppOptions };
export default createTestApp;
