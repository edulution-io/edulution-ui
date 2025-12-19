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

interface AppConfig {
  name: string;
  translations: Record<string, string>;
  appType: string;
  extendedOptions: Record<string, unknown>;
  icon: string;
  options: Record<string, unknown>;
  position: number;
  accessGroups: string[];
}

@Injectable()
class AppTool extends BaseTool {
  private generateDefaultHtml(title: string): string {
    return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: rgba(255,255,255,0.1);
      border-radius: 1rem;
      backdrop-filter: blur(10px);
    }
    h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    p { font-size: 1.2rem; opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p>Diese App wurde mit dem MCP Tool erstellt.</p>
  </div>
</body>
</html>`;
  }

  @Tool({
    name: 'app_create',
    description:
      'Create a custom embedded app with an HTML page. Admin only. Flow: 1) Creates app config, 2) Uploads HTML file. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      name: z
        .string()
        .regex(/^[a-z0-9-]+$/)
        .describe('App name (lowercase, alphanumeric with hyphens only, e.g., "my-custom-app")'),
      title: z.string().describe('Display title for the app (shown in UI)'),
      htmlContent: z.string().optional().describe('Custom HTML content. If not provided, a default template is used.'),
      icon: z.string().optional().describe('Icon path (default: /src/assets/icons/edulution/Anti_Malware.svg)'),
      accessGroups: z
        .array(z.string())
        .optional()
        .describe('LDAP group paths that can access this app (empty = all users)'),
    }),
  })
  async createApp(params: {
    name: string;
    title: string;
    htmlContent?: string;
    icon?: string;
    accessGroups?: string[];
  }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    if (!this.isAdmin) {
      return {
        content: [{ type: 'text', text: 'Error: Admin access required to create apps' }],
        isError: true,
      };
    }

    try {
      const appConfig: AppConfig = {
        name: params.name,
        translations: {
          de: params.title,
          en: params.title,
          fr: params.title,
        },
        appType: 'embedded',
        extendedOptions: {
          EMBEDDED_PAGE_HTML_CONTENT: '',
          EMBEDDED_PAGE_HTML_MODE: false,
        },
        icon: params.icon || '/src/assets/icons/edulution/Anti_Malware.svg',
        options: {
          proxyConfig: '""',
        },
        position: 0,
        accessGroups: params.accessGroups || [],
      };

      await this.callApi<AppConfig>('/appconfig', {
        method: 'POST',
        data: appConfig,
      });

      const htmlContent = params.htmlContent || this.generateDefaultHtml(params.title);
      const formData = new FormData();
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      formData.append('file', htmlBlob, 'index.html');

      await this.callApiFormData(`/files/${params.name}`, formData);

      return {
        content: [
          {
            type: 'text',
            text: `CREATED: App "${params.title}" (${params.name})\n\nThe app has been created with an HTML page.\nAccess it from the app menu after refreshing.\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to create app: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'app_list',
    description: 'List all available apps',
    parameters: z.object({}),
  })
  async listApps() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const apps = await this.callApi<AppConfig[]>('/appconfig');

      if (!apps || apps.length === 0) {
        return {
          content: [{ type: 'text', text: 'No apps found.' }],
        };
      }

      const appLines = apps.map((app) => {
        const title = app.translations?.de || app.translations?.en || app.name;
        return `- ${title} (${app.name}) [${app.appType}]`;
      });

      return {
        content: [{ type: 'text', text: `Found ${apps.length} app(s):\n\n${appLines.join('\n')}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'app_delete',
    description: 'Delete an app by name. Admin only. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      name: z.string().describe('The app name to delete'),
    }),
  })
  async deleteApp(params: { name: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    if (!this.isAdmin) {
      return {
        content: [{ type: 'text', text: 'Error: Admin access required to delete apps' }],
        isError: true,
      };
    }

    try {
      await this.callApi(`/appconfig/${params.name}`, { method: 'DELETE' });

      return {
        content: [
          {
            type: 'text',
            text: `DELETED: App "${params.name}"\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to delete app: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'app_update_html',
    description:
      'Update the HTML content of an existing embedded app. Admin only. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      name: z.string().describe('The app name to update'),
      htmlContent: z.string().describe('New HTML content for the app'),
    }),
  })
  async updateAppHtml(params: { name: string; htmlContent: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    if (!this.isAdmin) {
      return {
        content: [{ type: 'text', text: 'Error: Admin access required to update apps' }],
        isError: true,
      };
    }

    try {
      const formData = new FormData();
      const htmlBlob = new Blob([params.htmlContent], { type: 'text/html' });
      formData.append('file', htmlBlob, 'index.html');

      await this.callApiFormData(`/files/${params.name}`, formData);

      return {
        content: [
          {
            type: 'text',
            text: `UPDATED: HTML content for app "${params.name}"\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to update app HTML: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }
}

export default AppTool;
