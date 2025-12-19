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
class DockerTool extends BaseTool {
  @Tool({
    name: 'docker_list_containers',
    description: 'List Docker containers (Admin only)',
    parameters: z.object({
      applicationNames: z.array(z.string()).optional().describe('Filter by application names'),
    }),
  })
  async listContainers(params: { applicationNames?: string[] }) {
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
      const queryParams: Record<string, unknown> = {};
      if (params.applicationNames) queryParams.applicationNames = params.applicationNames;
      const result = await this.callApi('/docker/containers', { params: queryParams });
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
    name: 'docker_create_container',
    description: 'Create a new Docker container (Admin only)',
    parameters: z.object({
      image: z.string().describe('Docker image name'),
      name: z.string().optional().describe('Container name'),
      ports: z.record(z.string()).optional().describe('Port mappings'),
      environment: z.record(z.string()).optional().describe('Environment variables'),
      volumes: z.array(z.string()).optional().describe('Volume mounts'),
    }),
  })
  async createContainer(params: {
    image: string;
    name?: string;
    ports?: Record<string, string>;
    environment?: Record<string, string>;
    volumes?: string[];
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
      const result = await this.callApi('/docker/containers', { method: 'POST', data: params });
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
    name: 'docker_execute_command',
    description: 'Execute a command on a Docker container (Admin only)',
    parameters: z.object({
      id: z.string().describe('Container ID'),
      operation: z.enum(['start', 'stop', 'restart', 'pause', 'unpause']).describe('Operation to execute'),
    }),
  })
  async executeCommand(params: { id: string; operation: 'start' | 'stop' | 'restart' | 'pause' | 'unpause' }) {
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
      const result = await this.callApi(`/docker/containers/${params.id}/${params.operation}`, { method: 'POST' });
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
    name: 'docker_delete_container',
    description: 'Delete a Docker container (Admin only)',
    parameters: z.object({
      id: z.string().describe('Container ID to delete'),
    }),
  })
  async deleteContainer(params: { id: string }) {
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
      const result = await this.callApi(`/docker/containers/${params.id}`, { method: 'DELETE' });
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
    name: 'docker_update_container',
    description: 'Update a Docker container (Admin only)',
    parameters: z.object({
      id: z.string().describe('Container ID to update'),
    }),
  })
  async updateContainer(params: { id: string }) {
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
      const result = await this.callApi(`/docker/containers/${params.id}`, { method: 'PATCH' });
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

export default DockerTool;
