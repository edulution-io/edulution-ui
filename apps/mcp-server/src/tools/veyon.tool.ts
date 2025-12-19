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
class VeyonTool extends BaseTool {
  @Tool({
    name: 'veyon_authenticate',
    description: 'Authenticate with a Veyon client (classroom management)',
    parameters: z.object({
      ip: z.string().describe('IP address of the Veyon client'),
      veyonUser: z.string().describe('Veyon username for authentication'),
    }),
  })
  async authenticate(params: { ip: string; veyonUser: string }) {
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
      const result = await this.callApi(`/veyon/${params.ip}`, {
        method: 'POST',
        data: { veyonUser: params.veyonUser },
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
    name: 'veyon_get_features',
    description: 'Get available Veyon features for a connection',
    parameters: z.object({
      connectionUid: z.string().describe('Connection UID from authentication'),
    }),
  })
  async getFeatures(params: { connectionUid: string }) {
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
      const result = await this.callApi(`/veyon/feature/${params.connectionUid}`);
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
    name: 'veyon_set_feature',
    description: 'Set a Veyon feature (e.g., lock screen, message, power off)',
    parameters: z.object({
      featureUid: z.string().describe('Feature UID to set'),
      connectionUid: z.string().describe('Connection UID'),
      active: z.boolean().optional().describe('Whether to activate the feature'),
      arguments: z.record(z.unknown()).optional().describe('Additional arguments for the feature'),
    }),
  })
  async setFeature(params: {
    featureUid: string;
    connectionUid: string;
    active?: boolean;
    arguments?: Record<string, unknown>;
  }) {
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
      const { featureUid, ...body } = params;
      const result = await this.callApi(`/veyon/feature/${featureUid}`, { method: 'POST', data: body });
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

export default VeyonTool;
