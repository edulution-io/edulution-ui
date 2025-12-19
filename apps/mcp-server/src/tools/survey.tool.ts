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
class SurveyTool extends BaseTool {
  @Tool({
    name: 'survey_list',
    description: 'List surveys by status',
    parameters: z.object({
      status: z.enum(['OPEN', 'ANSWERED', 'CREATED']).describe('Filter surveys by status'),
    }),
  })
  async listSurveys(params: { status: 'OPEN' | 'ANSWERED' | 'CREATED' }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/surveys', { params: { status: params.status } });
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
    name: 'survey_get',
    description: 'Get a specific survey by ID',
    parameters: z.object({
      surveyId: z.string().describe('The ID of the survey'),
    }),
  })
  async getSurvey(params: { surveyId: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi(`/surveys/find-one/${params.surveyId}`);
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
    name: 'survey_can_participate',
    description: 'Check if the current user can participate in a survey',
    parameters: z.object({
      surveyId: z.string().describe('The ID of the survey'),
    }),
  })
  async canParticipate(params: { surveyId: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi(`/surveys/can-participate/${params.surveyId}`);
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
    name: 'survey_has_answers',
    description: 'Check if a survey has any answers',
    parameters: z.object({
      surveyId: z.string().describe('The ID of the survey'),
    }),
  })
  async hasAnswers(params: { surveyId: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi(`/surveys/has-answers/${params.surveyId}`);
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
    name: 'survey_get_results',
    description: 'Get the results of a survey',
    parameters: z.object({
      surveyId: z.string().describe('The ID of the survey'),
    }),
  })
  async getResults(params: { surveyId: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi(`/surveys/result/${params.surveyId}`);
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
    name: 'survey_get_answers',
    description: 'Get submitted answers for a survey',
    parameters: z.object({
      surveyId: z.string().describe('The ID of the survey'),
      username: z.string().optional().describe('Optional username to get specific user answers'),
    }),
  })
  async getAnswers(params: { surveyId: string; username?: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const endpoint = params.username
        ? `/surveys/answer/${params.surveyId}/${params.username}`
        : `/surveys/answer/${params.surveyId}`;
      const result = await this.callApi(endpoint);
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
    name: 'survey_delete',
    description: 'Delete surveys',
    parameters: z.object({
      surveyIds: z.array(z.string()).describe('Array of survey IDs to delete'),
    }),
  })
  async deleteSurveys(params: { surveyIds: string[] }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/surveys', { method: 'DELETE', data: { surveyIds: params.surveyIds } });
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
    name: 'survey_templates_list',
    description: 'Get all survey templates',
    parameters: z.object({}),
  })
  async listTemplates() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi('/surveys/templates');
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
    name: 'survey_template_delete',
    description: 'Delete a survey template',
    parameters: z.object({
      name: z.string().describe('Name of the template to delete'),
    }),
  })
  async deleteTemplate(params: { name: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi(`/surveys/templates/${params.name}`, { method: 'DELETE' });
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
    name: 'survey_template_set_active',
    description: 'Set a survey template as active or inactive',
    parameters: z.object({
      name: z.string().describe('Name of the template'),
      isActive: z.boolean().describe('Whether the template should be active'),
    }),
  })
  async setTemplateActive(params: { name: string; isActive: boolean }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi(`/surveys/templates/${params.name}/${params.isActive}`, { method: 'PATCH' });
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
    name: 'survey_get_choices',
    description: 'Get available choices for a survey question',
    parameters: z.object({
      surveyId: z.string().describe('The ID of the survey'),
      questionId: z.string().describe('The ID of the question'),
    }),
  })
  async getChoices(params: { surveyId: string; questionId: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const result = await this.callApi(`/surveys/choices/${params.surveyId}/${params.questionId}`);
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

export default SurveyTool;
