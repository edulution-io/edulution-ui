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

interface Bulletin {
  id: string;
  title: string;
  content?: string;
  category?: string;
  isActive?: boolean;
  createdAt?: string;
}

interface BulletinCategory {
  id: string;
  name: string;
  bulletins?: Bulletin[];
}

@Injectable()
class BulletinTool extends BaseTool {
  @Tool({
    name: 'bulletin_list_by_category',
    description: 'Get all bulletins grouped by category',
    parameters: z.object({}),
  })
  async listByCategory() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi<BulletinCategory[]>('/bulletin-board');

      if (!result || result.length === 0) {
        return {
          content: [{ type: 'text', text: 'No bulletin categories found.' }],
        };
      }

      const categoryLines = result.map((cat) => {
        const bulletinLines =
          cat.bulletins && cat.bulletins.length > 0
            ? cat.bulletins.map((b) => `  ${b.isActive ? '🟢' : '⚪'} ${b.title} (ID: ${b.id})`).join('\n')
            : '  (empty)';
        return `📂 ${cat.name} (ID: ${cat.id})\n${bulletinLines}`;
      });
      const output = `Found ${result.length} category(ies):\n\n${categoryLines.join('\n\n')}\n`;

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

  @Tool({
    name: 'bulletin_list_all',
    description: 'Get all bulletins as a flat list',
    parameters: z.object({}),
  })
  async listAll() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi<Bulletin[]>('/bulletin-board/bulletins');

      if (!result || result.length === 0) {
        return {
          content: [{ type: 'text', text: 'No bulletins found.' }],
        };
      }

      const formatted = result
        .map((b) => {
          const status = b.isActive ? '🟢 Active' : '⚪ Inactive';
          return `- ${b.title} (ID: ${b.id}) | ${status}`;
        })
        .join('\n');

      return {
        content: [{ type: 'text', text: `Found ${result.length} bulletin(s):\n\n${formatted}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'bulletin_create',
    description: 'Create a new bulletin. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      title: z.string().describe('Title of the bulletin'),
      content: z.string().describe('HTML content of the bulletin'),
      category: z.string().describe('Category ID for the bulletin'),
      isActive: z.boolean().optional().describe('Whether the bulletin is active'),
      isVisibleStartDate: z.string().optional().describe('Start date for visibility (ISO format)'),
      isVisibleEndDate: z.string().optional().describe('End date for visibility (ISO format)'),
      attachmentFileNames: z.array(z.string()).optional().describe('List of attachment filenames'),
    }),
  })
  async createBulletin(params: {
    title: string;
    content: string;
    category: string;
    isActive?: boolean;
    isVisibleStartDate?: string;
    isVisibleEndDate?: string;
    attachmentFileNames?: string[];
  }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi<Bulletin>('/bulletin-board', {
        method: 'POST',
        data: params,
      });

      return {
        content: [
          {
            type: 'text',
            text: `CREATED: Bulletin "${params.title}"\nID: ${result.id}\nCategory: ${params.category}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to create bulletin: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'bulletin_update',
    description: 'Update an existing bulletin. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      id: z.string().describe('ID of the bulletin to update'),
      title: z.string().optional().describe('New title'),
      content: z.string().optional().describe('New HTML content'),
      category: z.string().optional().describe('New category ID'),
      isActive: z.boolean().optional().describe('Whether the bulletin is active'),
      isVisibleStartDate: z.string().optional().describe('Start date for visibility'),
      isVisibleEndDate: z.string().optional().describe('End date for visibility'),
      attachmentFileNames: z.array(z.string()).optional().describe('List of attachment filenames'),
    }),
  })
  async updateBulletin(params: {
    id: string;
    title?: string;
    content?: string;
    category?: string;
    isActive?: boolean;
    isVisibleStartDate?: string;
    isVisibleEndDate?: string;
    attachmentFileNames?: string[];
  }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const { id, ...body } = params;
      await this.callApi(`/bulletin-board/${id}`, {
        method: 'PATCH',
        data: body,
      });

      return {
        content: [
          {
            type: 'text',
            text: `UPDATED: Bulletin ${id}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to update bulletin: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'bulletin_delete',
    description: 'Delete bulletins by IDs. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      ids: z.array(z.string()).describe('Array of bulletin IDs to delete'),
    }),
  })
  async deleteBulletins(params: { ids: string[] }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      await this.callApi('/bulletin-board', {
        method: 'DELETE',
        data: params.ids,
      });

      return {
        content: [
          {
            type: 'text',
            text: `DELETED: ${params.ids.length} bulletin(s)\nIDs: ${params.ids.join(', ')}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to delete bulletins: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'bulletin_category_list',
    description: 'Get all bulletin categories',
    parameters: z.object({
      permission: z.enum(['VIEW', 'EDIT']).optional().describe('Filter by permission type'),
    }),
  })
  async listCategories(params: { permission?: 'VIEW' | 'EDIT' }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const queryParams: Record<string, unknown> = {};
      if (params.permission) queryParams.permission = params.permission;

      const result = await this.callApi<BulletinCategory[]>('/bulletin-category', { params: queryParams });

      if (!result || result.length === 0) {
        return {
          content: [{ type: 'text', text: 'No categories found.' }],
        };
      }

      const formatted = result.map((c) => `- ${c.name} (ID: ${c.id})`).join('\n');
      return {
        content: [{ type: 'text', text: `Found ${result.length} category(ies):\n\n${formatted}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'bulletin_category_create',
    description: 'Create a new bulletin category (Admin only). Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      name: z.string().describe('Name of the category'),
      isActive: z.boolean().optional().describe('Whether the category is active'),
      position: z.number().optional().describe('Position in the list'),
      visibleForUsers: z.array(z.string()).optional().describe('User IDs who can view'),
      visibleForGroups: z.array(z.string()).optional().describe('Group IDs who can view'),
      editableByUsers: z.array(z.string()).optional().describe('User IDs who can edit'),
      editableByGroups: z.array(z.string()).optional().describe('Group IDs who can edit'),
      bulletinVisibility: z.enum(['FULLY_VISIBLE', 'ONLY_TITLE']).optional().describe('Visibility mode'),
    }),
  })
  async createCategory(params: {
    name: string;
    isActive?: boolean;
    position?: number;
    visibleForUsers?: string[];
    visibleForGroups?: string[];
    editableByUsers?: string[];
    editableByGroups?: string[];
    bulletinVisibility?: 'FULLY_VISIBLE' | 'ONLY_TITLE';
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
      const result = await this.callApi<BulletinCategory>('/bulletin-category', {
        method: 'POST',
        data: params,
      });

      return {
        content: [
          {
            type: 'text',
            text: `CREATED: Category "${params.name}"\nID: ${result.id}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to create category: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'bulletin_category_update',
    description: 'Update a bulletin category (Admin only). Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      id: z.string().describe('ID of the category to update'),
      name: z.string().optional().describe('New name'),
      isActive: z.boolean().optional().describe('Whether the category is active'),
      position: z.number().optional().describe('New position'),
      visibleForUsers: z.array(z.string()).optional().describe('User IDs who can view'),
      visibleForGroups: z.array(z.string()).optional().describe('Group IDs who can view'),
      editableByUsers: z.array(z.string()).optional().describe('User IDs who can edit'),
      editableByGroups: z.array(z.string()).optional().describe('Group IDs who can edit'),
      bulletinVisibility: z.enum(['FULLY_VISIBLE', 'ONLY_TITLE']).optional().describe('Visibility mode'),
    }),
  })
  async updateCategory(params: {
    id: string;
    name?: string;
    isActive?: boolean;
    position?: number;
    visibleForUsers?: string[];
    visibleForGroups?: string[];
    editableByUsers?: string[];
    editableByGroups?: string[];
    bulletinVisibility?: 'FULLY_VISIBLE' | 'ONLY_TITLE';
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
      await this.callApi(`/bulletin-category/${id}`, {
        method: 'PATCH',
        data: body,
      });

      return {
        content: [
          {
            type: 'text',
            text: `UPDATED: Category ${id}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to update category: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'bulletin_category_delete',
    description: 'Delete a bulletin category (Admin only). Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      id: z.string().describe('ID of the category to delete'),
    }),
  })
  async deleteCategory(params: { id: string }) {
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
      await this.callApi(`/bulletin-category/${params.id}`, {
        method: 'DELETE',
      });

      return {
        content: [
          {
            type: 'text',
            text: `DELETED: Category ${params.id}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to delete category: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }
}

export default BulletinTool;
