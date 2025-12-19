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

interface Conference {
  meetingID: string;
  name: string;
  isRunning: boolean;
  isPublic: boolean;
  password?: string;
  invitedAttendees?: AttendeeDto[];
  invitedGroups?: MultipleSelectorGroup[];
}

interface AttendeeDto {
  username: string;
  firstName: string;
  lastName: string;
  label: string;
  value: string;
}

interface MultipleSelectorGroup {
  id: string;
  name: string;
  path: string;
  label: string;
  value: string;
}

@Injectable()
class ConferenceTool extends BaseTool {
  private formatConference(conf: Conference): string {
    const status = conf.isRunning ? '🟢 Running' : '⚪ Not running';
    const visibility = conf.isPublic ? 'Public' : 'Private';
    return `- ${conf.name} (ID: ${conf.meetingID}) | ${status} | ${visibility}`;
  }

  /**
   * Convert simple attendee input to full AttendeeDto
   */
  private toAttendeeDto(attendee: { username: string; firstName?: string; lastName?: string }): AttendeeDto {
    const firstName = attendee.firstName || '';
    const lastName = attendee.lastName || '';
    const displayName = firstName && lastName ? `${firstName} ${lastName}` : attendee.username;

    return {
      username: attendee.username,
      firstName,
      lastName,
      label: displayName,
      value: attendee.username,
    };
  }

  /**
   * Convert simple group input to full MultipleSelectorGroup
   */
  private toGroupDto(group: { id: string; name: string; path: string }): MultipleSelectorGroup {
    return {
      id: group.id,
      name: group.name,
      path: group.path,
      label: group.name,
      value: group.id,
    };
  }

  @Tool({
    name: 'conference_list',
    description: 'List all conferences accessible to the current user',
    parameters: z.object({}),
  })
  async listConferences() {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const conferences = await this.callApi<Conference[]>('/conferences');

      if (!conferences || conferences.length === 0) {
        return {
          content: [{ type: 'text', text: 'No conferences found.' }],
        };
      }

      const formatted = conferences.map((c) => this.formatConference(c)).join('\n');
      return {
        content: [{ type: 'text', text: `Found ${conferences.length} conference(s):\n\n${formatted}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'conference_create',
    description:
      'Create a new video conference in the database. After creating, use conference_start to prepare it on BBB, then conference_join to get the join URL. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      name: z.string().describe('Name of the conference'),
      password: z.string().optional().describe('Optional password for the conference'),
      isPublic: z.boolean().optional().describe('Whether the conference is public (default: false)'),
      invitedAttendees: z
        .array(
          z.object({
            username: z.string().describe('Username of the attendee'),
            firstName: z.string().optional().describe('First name'),
            lastName: z.string().optional().describe('Last name'),
          }),
        )
        .optional()
        .describe('List of invited users'),
      invitedGroups: z
        .array(
          z.object({
            id: z.string().describe('Group ID'),
            name: z.string().describe('Group name'),
            path: z.string().describe('Group path (e.g., "/groups/teachers")'),
          }),
        )
        .optional()
        .describe('List of invited groups'),
    }),
  })
  async createConference(params: {
    name: string;
    password?: string;
    isPublic?: boolean;
    invitedAttendees?: { username: string; firstName?: string; lastName?: string }[];
    invitedGroups?: { id: string; name: string; path: string }[];
  }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      // Convert to proper DTO format with label/value fields
      const attendees = (params.invitedAttendees || []).map((a) => this.toAttendeeDto(a));
      const groups = (params.invitedGroups || []).map((g) => this.toGroupDto(g));

      const requestBody = {
        name: params.name,
        password: params.password || '',
        isPublic: params.isPublic ?? false,
        invitedAttendees: attendees,
        invitedGroups: groups,
      };

      const created = await this.callApi<Conference>('/conferences', {
        method: 'POST',
        data: requestBody,
      });

      // Verify by listing all conferences
      const conferences = await this.callApi<Conference[]>('/conferences');
      const verified = conferences?.find((c) => c.meetingID === created?.meetingID);

      if (verified) {
        return {
          content: [
            {
              type: 'text',
              text: `CREATED & VERIFIED: Conference "${params.name}"\nMeeting ID: ${created.meetingID}\nPublic: ${created.isPublic ? 'Yes' : 'No'}\n\nOperation complete. Do NOT call again.`,
            },
          ],
        };
      }

      // Created returned something but not found in list
      if (created?.meetingID) {
        return {
          content: [
            {
              type: 'text',
              text: `Conference "${params.name}" created (ID: ${created.meetingID}) but verification pending.\n\nDo NOT call again.`,
            },
          ],
        };
      }

      // No meetingID returned - something went wrong
      return {
        content: [
          {
            type: 'text',
            text: `Conference creation returned unexpected response. Please check manually.\nResponse: ${JSON.stringify(created)}`,
          },
        ],
        isError: true,
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to create conference: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'conference_join',
    description:
      'Get a join URL for a conference. Flow: 1) conference_create, 2) conference_start, 3) conference_join. The user must open the returned URL in their browser to enter the meeting.',
    parameters: z.object({
      meetingID: z.string().describe('The meeting ID of the conference'),
      password: z.string().optional().describe('Password if required'),
    }),
  })
  async joinConference(params: { meetingID: string; password?: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      const queryParams: Record<string, unknown> = {};
      if (params.password) queryParams.password = params.password;

      const result = await this.callApi<string>(`/conferences/join/${params.meetingID}`, {
        params: queryParams,
      });

      if (typeof result === 'string' && result.startsWith('http')) {
        return {
          content: [
            {
              type: 'text',
              text: `Here is your join link for the conference:\n\n${result}\n\nOpen this URL in your browser to join the meeting.`,
            },
          ],
        };
      }

      return {
        content: [{ type: 'text', text: `Conference join info: ${JSON.stringify(result)}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'conference_update',
    description: 'Update a conference. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      meetingID: z.string().describe('The meeting ID of the conference'),
      name: z.string().optional().describe('New name'),
      password: z.string().optional().describe('New password'),
      isPublic: z.boolean().optional().describe('Whether the conference is public'),
      invitedAttendees: z
        .array(
          z.object({
            username: z.string().describe('Username of the attendee'),
            firstName: z.string().optional().describe('First name'),
            lastName: z.string().optional().describe('Last name'),
          }),
        )
        .optional()
        .describe('Updated list of invited users'),
      invitedGroups: z
        .array(
          z.object({
            id: z.string().describe('Group ID'),
            name: z.string().describe('Group name'),
            path: z.string().describe('Group path'),
          }),
        )
        .optional()
        .describe('Updated list of invited groups'),
    }),
  })
  async updateConference(params: {
    meetingID: string;
    name?: string;
    password?: string;
    isPublic?: boolean;
    invitedAttendees?: { username: string; firstName?: string; lastName?: string }[];
    invitedGroups?: { id: string; name: string; path: string }[];
  }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      // Build update payload - only include fields that were provided
      const updateData: Record<string, unknown> = {
        meetingID: params.meetingID,
      };

      if (params.name !== undefined) updateData.name = params.name;
      if (params.password !== undefined) updateData.password = params.password;
      if (params.isPublic !== undefined) updateData.isPublic = params.isPublic;

      if (params.invitedAttendees !== undefined) {
        updateData.invitedAttendees = params.invitedAttendees.map((a) => this.toAttendeeDto(a));
      }

      if (params.invitedGroups !== undefined) {
        updateData.invitedGroups = params.invitedGroups.map((g) => this.toGroupDto(g));
      }

      await this.callApi<Conference>('/conferences', {
        method: 'PATCH',
        data: updateData,
      });

      const conferences = await this.callApi<Conference[]>('/conferences');
      const updated = conferences?.find((c) => c.meetingID === params.meetingID);

      if (updated) {
        return {
          content: [
            {
              type: 'text',
              text: `UPDATED & VERIFIED: Conference "${updated.name}" (ID: ${params.meetingID})\n\nOperation complete. Do NOT call again.`,
            },
          ],
        };
      }

      return {
        content: [{ type: 'text', text: `Conference ${params.meetingID} updated.\n\nDo NOT call again.` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to update conference: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'conference_start',
    description:
      'Prepare a conference on BBB server (creates the meeting room). Must be called after conference_create and before conference_join. The meeting becomes "running" when the first moderator opens the join URL. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      meetingID: z.string().describe('The meeting ID of the conference to start'),
    }),
  })
  async startConference(params: { meetingID: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      // Backend toggle logic: isRunning=false means "current state is not running, so START it"
      await this.callApi<Conference>('/conferences', {
        method: 'PUT',
        data: { meetingID: params.meetingID, isRunning: false },
      });

      return {
        content: [
          {
            type: 'text',
            text: `STARTED: Conference ${params.meetingID}\nThe meeting is now running on BBB server.\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `FAILED to start conference: ${(error as Error).message}\n\nDo NOT retry.`,
          },
        ],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'conference_stop',
    description: 'Stop a running conference (ends it on BBB server). Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      meetingID: z.string().describe('The meeting ID of the conference to stop'),
    }),
  })
  async stopConference(params: { meetingID: string }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      // Backend toggle logic: isRunning=true means "current state is running, so STOP it"
      await this.callApi<Conference>('/conferences', {
        method: 'PUT',
        data: { meetingID: params.meetingID, isRunning: true },
      });

      return {
        content: [
          {
            type: 'text',
            text: `STOPPED: Conference ${params.meetingID}\n\nOperation complete. Do NOT call again.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `FAILED to stop conference: ${(error as Error).message}\n\nDo NOT retry.`,
          },
        ],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'conference_delete',
    description: 'Delete one or more conferences. Call ONCE - do NOT repeat after success.',
    parameters: z.object({
      meetingIDs: z.array(z.string()).describe('Array of meeting IDs to delete'),
    }),
  })
  async deleteConferences(params: { meetingIDs: string[] }) {
    if (!this.token) {
      return {
        content: [{ type: 'text', text: 'Error: Not authenticated' }],
        isError: true,
      };
    }

    try {
      await this.callApi('/conferences', {
        method: 'DELETE',
        data: params.meetingIDs,
      });

      const conferences = await this.callApi<Conference[]>('/conferences');
      const stillExist = params.meetingIDs.filter((id) => conferences?.some((c) => c.meetingID === id));

      if (stillExist.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `DELETED & VERIFIED: ${params.meetingIDs.length} conference(s) removed.\nIDs: ${params.meetingIDs.join(', ')}\n\nOperation complete. Do NOT call again.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `DELETE partially complete. ${stillExist.length} conference(s) still exist: ${stillExist.join(', ')}\n\nDo NOT retry automatically.`,
          },
        ],
        isError: true,
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `FAILED to delete conferences: ${(error as Error).message}\n\nDo NOT retry.` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'conference_get_public',
    description: 'Get information about a public conference (no authentication required)',
    parameters: z.object({
      meetingID: z.string().describe('The meeting ID of the public conference'),
    }),
  })
  async getPublicConference(params: { meetingID: string }) {
    try {
      const conference = await this.callApi<Conference>(`/conferences/public/${params.meetingID}`);

      if (conference) {
        return {
          content: [
            {
              type: 'text',
              text: `Public Conference: ${conference.name}\nMeeting ID: ${conference.meetingID}\nRunning: ${conference.isRunning ? 'Yes' : 'No'}`,
            },
          ],
        };
      }

      return {
        content: [{ type: 'text', text: 'Conference not found or not public.' }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }

  @Tool({
    name: 'conference_join_public',
    description: 'Join a public conference as a guest',
    parameters: z.object({
      meetingID: z.string().describe('The meeting ID of the public conference'),
      name: z.string().describe('Display name for the guest'),
      password: z.string().optional().describe('Password if required'),
    }),
  })
  async joinPublicConference(params: { meetingID: string; name: string; password?: string }) {
    try {
      const result = await this.callApi<{ joinUrl?: string; url?: string }>('/conferences/public', {
        method: 'POST',
        data: {
          meetingID: params.meetingID,
          name: params.name,
          password: params.password || '',
        },
      });

      const joinUrl = result.joinUrl || result.url;
      if (joinUrl) {
        return {
          content: [{ type: 'text', text: `Join URL for public conference:\n${joinUrl}` }],
        };
      }

      return {
        content: [{ type: 'text', text: `Join result: ${JSON.stringify(result)}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${(error as Error).message}` }],
        isError: true,
      };
    }
  }
}

export default ConferenceTool;
