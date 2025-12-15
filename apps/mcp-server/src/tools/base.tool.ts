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

import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { HttpRequest } from '@rekog/mcp-nest';
import JWTUser from '@libs/user/types/jwt/jwtUser';

interface McpRawRequest {
  user?: JWTUser;
}

@Injectable()
abstract class BaseTool {
  constructor(@Inject(REQUEST) protected request: HttpRequest) {}

  protected get user(): JWTUser | undefined {
    return (this.request.raw as McpRawRequest | undefined)?.user;
  }

  protected get isTeacher(): boolean {
    return this.user?.ldapGroups?.some((group) => group.includes('teacher')) ?? false;
  }

  protected get isAdmin(): boolean {
    return this.user?.ldapGroups?.some((group) => group.includes('admin')) ?? false;
  }

  protected get token(): string | undefined {
    const authHeader = this.request.headers?.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return undefined;
  }
}

export default BaseTool;
