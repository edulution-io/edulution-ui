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
class AiTool extends BaseTool {
  @Tool({
    name: 'ai_get_config',
    description: 'Get AI configuration for the current user',
    parameters: z.object({
      purpose: z.string().optional().describe('Filter by purpose (e.g., TRANSLATION, CHAT)'),
    }),
  })
  async getConfig(params: { purpose?: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const queryParams: Record<string, unknown> = {};
      if (params.purpose) queryParams.purpose = params.purpose;
      const result = await this.callApi('/ai/config', { params: queryParams });
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
    name: 'ai_get_available',
    description: 'Get available AI models by purpose',
    parameters: z.object({
      purposes: z.array(z.string()).optional().describe('Array of purposes to filter by'),
    }),
  })
  async getAvailable(params: { purposes?: string[] }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/ai/available', { params: { purposes: params.purposes } });
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
    name: 'ai_configs_list',
    description: 'List all AI configurations (Admin only)',
    parameters: z.object({}),
  })
  async listConfigs() {
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
      const result = await this.callApi('/ai/configs');
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
    name: 'ai_config_get',
    description: 'Get a specific AI configuration (Admin only)',
    parameters: z.object({
      id: z.string().describe('ID of the AI configuration'),
    }),
  })
  async getConfigById(params: { id: string }) {
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
      const result = await this.callApi(`/ai/configs/${params.id}`);
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
    name: 'ai_config_create',
    description: 'Create a new AI configuration (Admin only)',
    parameters: z.object({
      name: z.string().describe('Name of the configuration'),
      url: z.string().describe('API endpoint URL'),
      apiKey: z.string().describe('API key for authentication'),
      aiModel: z.string().describe('AI model identifier'),
      apiStandard: z.enum(['ANTHROPIC', 'OPENAI', 'GOOGLE', 'OPENAI_COMPATIBLE']).describe('API standard'),
      purposes: z.array(z.string()).optional().describe('Purposes this config can be used for'),
      allowedUsers: z.array(z.string()).optional().describe('User IDs allowed to use this config'),
      allowedGroups: z.array(z.string()).optional().describe('Group IDs allowed to use this config'),
    }),
  })
  async createConfig(params: {
    name: string;
    url: string;
    apiKey: string;
    aiModel: string;
    apiStandard: 'ANTHROPIC' | 'OPENAI' | 'GOOGLE' | 'OPENAI_COMPATIBLE';
    purposes?: string[];
    allowedUsers?: string[];
    allowedGroups?: string[];
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
      const result = await this.callApi('/ai/configs', { method: 'POST', data: params });
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
    name: 'ai_config_update',
    description: 'Update an AI configuration (Admin only)',
    parameters: z.object({
      id: z.string().describe('ID of the configuration to update'),
      name: z.string().optional().describe('New name'),
      url: z.string().optional().describe('New API endpoint URL'),
      apiKey: z.string().optional().describe('New API key'),
      aiModel: z.string().optional().describe('New AI model identifier'),
      apiStandard: z
        .enum(['ANTHROPIC', 'OPENAI', 'GOOGLE', 'OPENAI_COMPATIBLE'])
        .optional()
        .describe('New API standard'),
      purposes: z.array(z.string()).optional().describe('New purposes'),
      allowedUsers: z.array(z.string()).optional().describe('New allowed users'),
      allowedGroups: z.array(z.string()).optional().describe('New allowed groups'),
    }),
  })
  async updateConfig(params: {
    id: string;
    name?: string;
    url?: string;
    apiKey?: string;
    aiModel?: string;
    apiStandard?: 'ANTHROPIC' | 'OPENAI' | 'GOOGLE' | 'OPENAI_COMPATIBLE';
    purposes?: string[];
    allowedUsers?: string[];
    allowedGroups?: string[];
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
      const { id, ...body } = params;
      const result = await this.callApi(`/ai/configs/${id}`, { method: 'PATCH', data: body });
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
    name: 'ai_config_delete',
    description: 'Delete an AI configuration (Admin only)',
    parameters: z.object({
      id: z.string().describe('ID of the configuration to delete'),
    }),
  })
  async deleteConfig(params: { id: string }) {
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
      const result = await this.callApi(`/ai/configs/${params.id}`, { method: 'DELETE' });
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
    name: 'ai_test_connection',
    description: 'Test connection to an AI provider (Admin only)',
    parameters: z.object({
      url: z.string().describe('API endpoint URL'),
      apiKey: z.string().describe('API key'),
      aiModel: z.string().describe('AI model to test'),
      apiStandard: z.enum(['ANTHROPIC', 'OPENAI', 'GOOGLE', 'OPENAI_COMPATIBLE']).describe('API standard'),
    }),
  })
  async testConnection(params: {
    url: string;
    apiKey: string;
    aiModel: string;
    apiStandard: 'ANTHROPIC' | 'OPENAI' | 'GOOGLE' | 'OPENAI_COMPATIBLE';
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
      const result = await this.callApi('/ai/configs/test', { method: 'POST', data: params });
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

export default AiTool;
