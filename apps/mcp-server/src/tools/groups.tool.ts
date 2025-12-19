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

interface Group {
  id: string;
  name: string;
  cn?: string;
  path?: string;
  memberCount?: number;
}

interface UserWithGroups {
  username: string;
  groups?: Group[];
}

@Injectable()
class GroupsTool extends BaseTool {
  @Tool({
    name: 'groups_search',
    description: 'Search for groups by name',
    parameters: z.object({
      groupName: z.string().optional().describe('The group name to search for (optional, returns all if empty)'),
    }),
  })
  async searchGroups(params: { groupName?: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const queryParams: Record<string, unknown> = {};
      if (params.groupName) {
        queryParams.groupName = params.groupName;
      }

      const result = await this.callApi<Group[]>('/groups', { params: queryParams });

      if (!result || result.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: params.groupName ? `No groups found matching "${params.groupName}".` : 'No groups found.',
            },
          ],
        };
      }

      const formatted = result
        .map((g) => {
          const members = g.memberCount !== undefined ? ` (${g.memberCount} members)` : '';
          return `- ${g.name} (ID: ${g.id})${members}`;
        })
        .join('\n');

      return {
        content: [{ type: 'text', text: `Found ${result.length} group(s):\n\n${formatted}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'groups_get_current_user',
    description: 'Get the current user with their group memberships',
    parameters: z.object({}),
  })
  async getCurrentUserGroups() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi<UserWithGroups>('/groups/user');

      let output = `User: ${result.username}\n\nGroup memberships:\n`;
      if (result.groups && result.groups.length > 0) {
        output += result.groups.map((g) => `- ${g.name}`).join('\n');
      } else {
        output += '(no groups)';
      }

      return {
        content: [{ type: 'text', text: output }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }
}

export default GroupsTool;
