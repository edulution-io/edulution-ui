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

@Injectable()
class LmnTool extends BaseTool {
  @Tool({
    name: 'lmn_get_token',
    description: 'Get the LinuxMuster.net API token',
    parameters: z.object({}),
  })
  async getToken() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/lmn-api/auth');
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_get_user',
    description: 'Get user information from LinuxMuster.net',
    parameters: z.object({
      username: z.string().optional().describe('Username to look up (defaults to current user)'),
      checkFirstPassword: z.boolean().optional().describe('Check if first password is set'),
    }),
  })
  async getUser(params: { username?: string; checkFirstPassword?: boolean }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const endpoint = params.username ? `/lmn-api/user/${params.username}` : '/lmn-api/user';
      const queryParams: Record<string, unknown> = {};
      if (params.checkFirstPassword !== undefined) queryParams.checkFirstPassword = params.checkFirstPassword;
      const result = await this.callApi(endpoint, { params: queryParams });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_search',
    description: 'Search for users or groups in LinuxMuster.net',
    parameters: z.object({
      searchQuery: z.string().describe('Search query string'),
    }),
  })
  async search(params: { searchQuery: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/lmn-api/search', { params: { searchQuery: params.searchQuery } });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_get_school_classes',
    description: 'Get school classes for the current user',
    parameters: z.object({}),
  })
  async getSchoolClasses() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/lmn-api/school-classes');
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_get_school_class',
    description: 'Get details of a specific school class',
    parameters: z.object({
      schoolClassName: z.string().describe('Name of the school class'),
    }),
  })
  async getSchoolClass(params: { schoolClassName: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi(`/lmn-api/school-classes/${params.schoolClassName}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_toggle_school_class',
    description: 'Join or leave a school class',
    parameters: z.object({
      schoolClass: z.string().describe('Name of the school class'),
      action: z.enum(['join', 'unjoin']).describe('Action to perform'),
    }),
  })
  async toggleSchoolClass(params: { schoolClass: string; action: 'join' | 'unjoin' }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi(`/lmn-api/school-classes/${params.schoolClass}/${params.action}`, {
        method: 'POST',
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_get_sessions',
    description: 'Get teaching sessions for the current user',
    parameters: z.object({
      withMemberDetails: z.boolean().optional().describe('Include member details'),
    }),
  })
  async getSessions(params: { withMemberDetails?: boolean }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const queryParams: Record<string, unknown> = {};
      if (params.withMemberDetails !== undefined) queryParams.withMemberDetails = params.withMemberDetails;
      const result = await this.callApi('/lmn-api/sessions', { params: queryParams });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_get_session',
    description: 'Get a specific teaching session',
    parameters: z.object({
      sessionId: z.string().describe('ID of the session'),
    }),
  })
  async getSession(params: { sessionId: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi(`/lmn-api/sessions/${params.sessionId}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_delete_session',
    description: 'Delete a teaching session',
    parameters: z.object({
      sessionId: z.string().describe('ID of the session to delete'),
    }),
  })
  async deleteSession(params: { sessionId: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi(`/lmn-api/sessions/${params.sessionId}`, { method: 'DELETE' });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_get_projects',
    description: 'Get projects for the current user',
    parameters: z.object({}),
  })
  async getProjects() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/lmn-api/projects');
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_get_project',
    description: 'Get details of a specific project',
    parameters: z.object({
      projectName: z.string().describe('Name of the project'),
    }),
  })
  async getProject(params: { projectName: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi(`/lmn-api/projects/${params.projectName}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_delete_project',
    description: 'Delete a project',
    parameters: z.object({
      projectName: z.string().describe('Name of the project to delete'),
    }),
  })
  async deleteProject(params: { projectName: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi(`/lmn-api/projects/${params.projectName}`, { method: 'DELETE' });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_toggle_project',
    description: 'Join or leave a project',
    parameters: z.object({
      project: z.string().describe('Name of the project'),
      action: z.enum(['join', 'unjoin']).describe('Action to perform'),
    }),
  })
  async toggleProject(params: { project: string; action: 'join' | 'unjoin' }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi(`/lmn-api/projects/${params.project}/${params.action}`, { method: 'POST' });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_get_printers',
    description: 'Get available printers',
    parameters: z.object({}),
  })
  async getPrinters() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/lmn-api/printers');
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_toggle_printer',
    description: 'Join or leave a printer',
    parameters: z.object({
      project: z.string().describe('Name of the printer project'),
      action: z.enum(['join', 'unjoin']).describe('Action to perform'),
    }),
  })
  async togglePrinter(params: { project: string; action: 'join' | 'unjoin' }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi(`/lmn-api/printers/${params.project}/${params.action}`, { method: 'POST' });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_get_room',
    description: 'Get the current room of the user',
    parameters: z.object({}),
  })
  async getRoom() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/lmn-api/room');
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_get_quota',
    description: 'Get disk quota for a user',
    parameters: z.object({
      username: z.string().describe('Username to check quota for'),
    }),
  })
  async getQuota(params: { username: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi(`/lmn-api/user/${params.username}/quota`);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_start_exam',
    description: 'Start exam mode for users (Teacher only)',
    parameters: z.object({
      users: z.array(z.string()).describe('Array of usernames to put in exam mode'),
      groupType: z.string().optional().describe('Type of group'),
      groupName: z.string().optional().describe('Name of the group'),
    }),
  })
  async startExam(params: { users: string[]; groupType?: string; groupName?: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    if (!this.isTeacher && !this.isAdmin) {
      return {
        content: [{ type: 'text', text: 'Error: Teacher or admin access required' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/lmn-api/exam-mode/start', { method: 'POST', data: params });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_stop_exam',
    description: 'Stop exam mode for users (Teacher only)',
    parameters: z.object({
      users: z.array(z.string()).describe('Array of usernames to remove from exam mode'),
      groupType: z.string().describe('Type of group'),
      groupName: z.string().describe('Name of the group'),
    }),
  })
  async stopExam(params: { users: string[]; groupType: string; groupName: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    if (!this.isTeacher && !this.isAdmin) {
      return {
        content: [{ type: 'text', text: 'Error: Teacher or admin access required' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/lmn-api/exam-mode/stop', { method: 'POST', data: params });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_add_management_group',
    description: 'Add users to a management group',
    parameters: z.object({
      group: z.string().describe('Name of the management group'),
      users: z.array(z.string()).describe('Array of usernames to add'),
    }),
  })
  async addManagementGroup(params: { group: string; users: string[] }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/lmn-api/management-groups', { method: 'POST', data: params });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_remove_management_group',
    description: 'Remove users from a management group',
    parameters: z.object({
      group: z.string().describe('Name of the management group'),
      users: z.array(z.string()).describe('Array of usernames to remove'),
    }),
  })
  async removeManagementGroup(params: { group: string; users: string[] }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/lmn-api/management-groups', { method: 'DELETE', data: params });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_get_schools',
    description: 'Get list of schools',
    parameters: z.object({}),
  })
  async getSchools() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/lmn-api/schools');
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_change_password',
    description: 'Change the current user password',
    parameters: z.object({
      oldPassword: z.string().describe('Current password'),
      newPassword: z.string().describe('New password'),
    }),
  })
  async changePassword(params: { oldPassword: string; newPassword: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/lmn-api/password', { method: 'PATCH', data: params });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_set_password',
    description: 'Set password for another user (Admin only)',
    parameters: z.object({
      username: z.string().describe('Username to set password for'),
      password: z.string().describe('New password'),
    }),
  })
  async setPassword(params: { username: string; password: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    if (!this.isAdmin && !this.isTeacher) {
      return {
        content: [{ type: 'text', text: 'Error: Admin or teacher access required' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/lmn-api/password', { method: 'POST', data: params });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_set_first_password',
    description: 'Set first password for a user',
    parameters: z.object({
      username: z.string().describe('Username to set first password for'),
      password: z.string().describe('First password'),
    }),
  })
  async setFirstPassword(params: { username: string; password: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/lmn-api/first-password', { method: 'POST', data: params });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'lmn_get_version',
    description: 'Get LinuxMuster.net server version',
    parameters: z.object({}),
  })
  async getVersion() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/lmn-api/server/lmnversion');
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }
}

export default LmnTool;
