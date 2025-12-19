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

interface Mail {
  id: string;
  subject?: string;
  from?: string;
  date?: string;
  read?: boolean;
}

interface MailProvider {
  id: string;
  name: string;
  host?: string;
}

interface SyncJob {
  id: string;
  host1: string;
  user1: string;
  active?: boolean;
}

@Injectable()
class MailTool extends BaseTool {
  @Tool({
    name: 'mail_list',
    description: 'Get emails for the current user',
    parameters: z.object({}),
  })
  async listMails() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi<Mail[]>('/mail');

      if (!result || result.length === 0) {
        return {
          content: [{ type: 'text', text: 'No emails found.' }],
        };
      }

      const formatted = result
        .slice(0, 20)
        .map((m) => {
          const status = m.read ? '📭' : '📬';
          return `${status} ${m.subject || '(no subject)'} - from ${m.from || 'unknown'}`;
        })
        .join('\n');

      const more = result.length > 20 ? `\n\n... and ${result.length - 20} more emails` : '';

      return {
        content: [{ type: 'text', text: `Found ${result.length} email(s):\n\n${formatted}${more}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'mail_get_providers',
    description: 'Get configured mail provider configurations',
    parameters: z.object({}),
  })
  async getProviders() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi<MailProvider[]>('/mail/provider-config');

      if (!result || result.length === 0) {
        return {
          content: [{ type: 'text', text: 'No mail providers configured.' }],
        };
      }

      const formatted = result.map((p) => `- ${p.name} (${p.host || `ID: ${  p.id}`})`).join('\n');

      return {
        content: [{ type: 'text', text: `Mail providers:\n\n${formatted}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'mail_sync_jobs_list',
    description: 'Get mail sync jobs for the current user',
    parameters: z.object({}),
  })
  async listSyncJobs() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi<SyncJob[]>('/mail/sync-job');

      if (!result || result.length === 0) {
        return {
          content: [{ type: 'text', text: 'No sync jobs configured.' }],
        };
      }

      const formatted = result
        .map((j) => {
          const status = j.active ? '🟢 Active' : '⚪ Inactive';
          return `- ${j.user1}@${j.host1} (ID: ${j.id}) | ${status}`;
        })
        .join('\n');

      return {
        content: [{ type: 'text', text: `Sync jobs:\n\n${formatted}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'mail_sync_job_create',
    description:
      'Create a new mail sync job to import emails from another server. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      host1: z.string().describe('Source IMAP server hostname'),
      port1: z.number().describe('Source IMAP server port'),
      user1: z.string().describe('Username on source server'),
      password1: z.string().describe('Password on source server'),
      enc1: z.enum(['STARTTLS', 'TLS', 'NONE']).describe('Encryption method'),
      mins_interval: z.number().optional().describe('Sync interval in minutes'),
      active: z.boolean().optional().describe('Whether sync job is active'),
      delete1: z.boolean().optional().describe('Delete emails on source after sync'),
      delete2: z.boolean().optional().describe('Delete emails on destination not on source'),
      automap: z.boolean().optional().describe('Automatically map folders'),
      subscribeall: z.boolean().optional().describe('Subscribe to all folders'),
      subfolder2: z.string().optional().describe('Destination subfolder'),
      maxage: z.number().optional().describe('Maximum age of emails to sync in days'),
    }),
  })
  async createSyncJob(params: {
    host1: string;
    port1: number;
    user1: string;
    password1: string;
    enc1: 'STARTTLS' | 'TLS' | 'NONE';
    mins_interval?: number;
    active?: boolean;
    delete1?: boolean;
    delete2?: boolean;
    automap?: boolean;
    subscribeall?: boolean;
    subfolder2?: string;
    maxage?: number;
  }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi<SyncJob>('/mail/sync-job', {
        method: 'POST',
        data: params,
      });

      return {
        content: [
          {
            type: 'text',
            text: `CREATED: Sync job for ${params.user1}@${params.host1}\nID: ${result.id}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to create sync job: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'mail_sync_jobs_delete',
    description: 'Delete mail sync jobs. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      syncJobIds: z.array(z.string()).describe('Array of sync job IDs to delete'),
    }),
  })
  async deleteSyncJobs(params: { syncJobIds: string[] }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      await this.callApi('/mail/sync-job', {
        method: 'DELETE',
        data: params.syncJobIds,
      });

      return {
        content: [
          {
            type: 'text',
            text: `DELETED: ${params.syncJobIds.length} sync job(s)\nIDs: ${params.syncJobIds.join(', ')}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to delete sync jobs: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }
}

export default MailTool;
