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

import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import BaseTool from './base.tool';

interface User {
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

interface UserAccount {
  type: string;
  email?: string;
  provider?: string;
}

@Injectable()
class UsersTool extends BaseTool {
  @Tool({
    name: 'users_get_current',
    description: 'Get the current authenticated user information',
    parameters: z.object({}),
  })
  async getCurrentUser() {
    if (!this.token || !this.user?.preferred_username) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi<User>(`/users/${this.user.preferred_username}`);

      return {
        content: [
          {
            type: 'text',
            text: `Current User:\n- Username: ${result.username}\n- Name: ${result.firstName || ''} ${result.lastName || ''}\n- Email: ${result.email || 'N/A'}\n- Role: ${this.userRole}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'users_search',
    description: 'Search for users by username, first name, or last name',
    parameters: z.object({
      searchString: z.string().describe('The search string to find users'),
    }),
  })
  async searchUsers(params: { searchString: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi<User[]>(`/users/search/${encodeURIComponent(params.searchString)}`);

      if (!result || result.length === 0) {
        return {
          content: [{ type: 'text', text: `No users found matching "${params.searchString}".` }],
        };
      }

      const formatted = result.map((u) => `- ${u.username} (${u.firstName || ''} ${u.lastName || ''})`).join('\n');

      return {
        content: [{ type: 'text', text: `Found ${result.length} user(s):\n\n${formatted}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'users_get_accounts',
    description: 'Get external accounts (e.g., email, cloud services) for the current user',
    parameters: z.object({}),
  })
  async getUserAccounts() {
    if (!this.token || !this.user?.preferred_username) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi<UserAccount[]>(`/users/${this.user.preferred_username}/user-accounts`);

      if (!result || result.length === 0) {
        return {
          content: [{ type: 'text', text: 'No external accounts configured.' }],
        };
      }

      const formatted = result.map((a) => `- ${a.type}: ${a.email || a.provider || 'configured'}`).join('\n');

      return {
        content: [{ type: 'text', text: `External accounts:\n\n${formatted}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }
}

export default UsersTool;
