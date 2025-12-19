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

  protected get isStudent(): boolean {
    return this.user?.ldapGroups?.some((group) => group.includes('student')) ?? false;
  }

  protected get userSchool(): string {
    return this.user?.school ?? 'default-school';
  }

  protected get username(): string {
    return this.user?.preferred_username ?? '';
  }

  protected get userRole(): 'admin' | 'teacher' | 'student' | 'unknown' {
    if (this.isAdmin) return 'admin';
    if (this.isTeacher) return 'teacher';
    if (this.isStudent) return 'student';
    return 'unknown';
  }

  protected get userHomePath(): string {
    const school = this.userSchool;
    const name = this.username;

    switch (this.userRole) {
      case 'teacher':
        return `/${school}/teachers/${name}/`;
      case 'student':
        return `/${school}/students/${name}/`;
      case 'admin':
        return `/${school}/`;
      default:
        return `/${school}/`;
    }
  }

  protected get schoolRootPath(): string {
    return `/${this.userSchool}/`;
  }

  protected resolveFilePath(relativePath = ''): string {
    if (!relativePath || relativePath === '/' || relativePath === '.') {
      return this.userHomePath;
    }

    const cleanPath = relativePath.replace(/^\.?\/?/, '').replace(/\/+$/, '');

    if (cleanPath.startsWith(this.userSchool)) {
      return `/${cleanPath}/`;
    }

    return `${this.userHomePath}${cleanPath}/`;
  }

  protected get token(): string | undefined {
    const authHeader = this.request.headers?.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return undefined;
  }

  protected get apiBaseUrl(): string {
    if (process.env.EDU_API_URL) {
      return process.env.EDU_API_URL;
    }

    const origin = this.request.headers?.origin as string | undefined;
    if (origin) {
      return `${origin}/edu-api`;
    }

    const host = this.request.headers?.host as string | undefined;
    if (host) {
      const protocol = (this.request.headers?.['x-forwarded-proto'] as string) || 'https';
      return `${protocol}://${host}/edu-api`;
    }

    return 'http://localhost:3001/edu-api';
  }

  protected async callApi<T = unknown>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      params?: Record<string, unknown>;
      data?: unknown;
    } = {},
  ): Promise<T> {
    const { method = 'GET', params, data } = options;

    const url = new URL(endpoint.startsWith('/') ? endpoint.slice(1) : endpoint, `${this.apiBaseUrl}/`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API ${response.status}: ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return (await response.json()) as T;
    }
    return (await response.text()) as T;
  }

  protected async callApiRaw<T = unknown>(
    endpoint: string,
    content: string,
    params?: Record<string, unknown>,
    contentType = 'text/plain',
  ): Promise<T> {
    const url = new URL(endpoint.startsWith('/') ? endpoint.slice(1) : endpoint, `${this.apiBaseUrl}/`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': contentType,
      },
      body: content,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API ${response.status}: ${errorText}`);
    }

    const respContentType = response.headers.get('content-type');
    if (respContentType?.includes('application/json')) {
      return (await response.json()) as T;
    }
    return (await response.text()) as T;
  }

  protected async callApiFormData<T = unknown>(
    endpoint: string,
    formData: FormData,
    params?: Record<string, unknown>,
  ): Promise<T> {
    const url = new URL(endpoint.startsWith('/') ? endpoint.slice(1) : endpoint, `${this.apiBaseUrl}/`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API ${response.status}: ${errorText}`);
    }

    const respContentType = response.headers.get('content-type');
    if (respContentType?.includes('application/json')) {
      return (await response.json()) as T;
    }
    return (await response.text()) as T;
  }
}

export default BaseTool;
