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
class VdiTool extends BaseTool {
  @Tool({
    name: 'vdi_auth',
    description: 'Authenticate for VDI (Virtual Desktop Infrastructure) access',
    parameters: z.object({}),
  })
  async authenticate() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/vdi');
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
    name: 'vdi_get_connection',
    description: 'Get VDI connection details',
    parameters: z.object({
      connectionId: z.string().optional().describe('Connection ID'),
      protocol: z.string().optional().describe('Protocol (e.g., rdp, vnc)'),
      hostname: z.string().optional().describe('Hostname to connect to'),
      port: z.number().optional().describe('Port number'),
    }),
  })
  async getConnection(params: { connectionId?: string; protocol?: string; hostname?: string; port?: number }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/vdi/connections', { params });
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
    name: 'vdi_create_session',
    description: 'Create or update a VDI session',
    parameters: z.object({
      connectionId: z.string().optional().describe('Connection ID'),
      protocol: z.string().optional().describe('Protocol'),
      hostname: z.string().optional().describe('Hostname'),
      port: z.number().optional().describe('Port'),
      username: z.string().optional().describe('Username for the session'),
      password: z.string().optional().describe('Password for the session'),
    }),
  })
  async createSession(params: {
    connectionId?: string;
    protocol?: string;
    hostname?: string;
    port?: number;
    username?: string;
    password?: string;
  }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/vdi/sessions', { method: 'POST', data: params });
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
    name: 'vdi_request',
    description: 'Request a VDI instance',
    parameters: z.object({
      vmName: z.string().optional().describe('Virtual machine name'),
      template: z.string().optional().describe('Template to use'),
    }),
  })
  async requestVdi(params: { vmName?: string; template?: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/vdi', { method: 'POST', data: params });
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
    name: 'vdi_get_vms',
    description: 'Get available virtual machines',
    parameters: z.object({}),
  })
  async getVirtualMachines() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/vdi/virtualmachines');
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

export default VdiTool;
