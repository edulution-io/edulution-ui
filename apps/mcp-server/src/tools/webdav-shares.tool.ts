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
class WebdavSharesTool extends BaseTool {
  @Tool({
    name: 'webdav_shares_list',
    description: 'List WebDAV shares',
    parameters: z.object({
      isRootServer: z.boolean().optional().describe('Filter by root server status'),
    }),
  })
  async listShares(params: { isRootServer?: boolean }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const queryParams: Record<string, unknown> = {};
      if (params.isRootServer !== undefined) queryParams.isRootServer = params.isRootServer;
      const result = await this.callApi('/webdav-shares', { params: queryParams });
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
    name: 'webdav_shares_create',
    description: 'Create a new WebDAV share (Admin only)',
    parameters: z.object({
      name: z.string().describe('Name of the share'),
      path: z.string().describe('Path on the server'),
      server: z.string().describe('WebDAV server URL'),
      username: z.string().optional().describe('Username for authentication'),
      password: z.string().optional().describe('Password for authentication'),
      isRootServer: z.boolean().optional().describe('Whether this is a root server'),
    }),
  })
  async createShare(params: {
    name: string;
    path: string;
    server: string;
    username?: string;
    password?: string;
    isRootServer?: boolean;
  }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    if (!this.isAdmin) {
      return {
        content: [{ type: 'text', text: 'Error: Admin access required' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/webdav-shares', { method: 'POST', data: params });
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
    name: 'webdav_shares_update',
    description: 'Update a WebDAV share (Admin only)',
    parameters: z.object({
      webdavShareId: z.string().describe('ID of the share to update'),
      name: z.string().optional().describe('New name'),
      path: z.string().optional().describe('New path'),
      server: z.string().optional().describe('New server URL'),
      username: z.string().optional().describe('New username'),
      password: z.string().optional().describe('New password'),
      isRootServer: z.boolean().optional().describe('New root server status'),
    }),
  })
  async updateShare(params: {
    webdavShareId: string;
    name?: string;
    path?: string;
    server?: string;
    username?: string;
    password?: string;
    isRootServer?: boolean;
  }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    if (!this.isAdmin) {
      return {
        content: [{ type: 'text', text: 'Error: Admin access required' }],
        isError: true,
      };
    }

    try {
      const { webdavShareId, ...body } = params;
      const result = await this.callApi(`/webdav-shares/${webdavShareId}`, { method: 'PATCH', data: body });
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
    name: 'webdav_shares_delete',
    description: 'Delete a WebDAV share (Admin only)',
    parameters: z.object({
      webdavShareId: z.string().describe('ID of the share to delete'),
    }),
  })
  async deleteShare(params: { webdavShareId: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    if (!this.isAdmin) {
      return {
        content: [{ type: 'text', text: 'Error: Admin access required' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi(`/webdav-shares/${params.webdavShareId}`, { method: 'DELETE' });
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

export default WebdavSharesTool;
