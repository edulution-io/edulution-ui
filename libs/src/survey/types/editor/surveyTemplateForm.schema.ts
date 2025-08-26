/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { z } from 'zod';

const getSurveyTemplateFormSchema = () =>
  z.object({
    template: z.object({
      formula: z.object({
        title: z.string(),
        description: z.string().optional(),
        pages: z.array(
          z.object({
            name: z.string(),
            description: z.string().optional(),
            elements: z.array(
            z.object({
              type: z.string(),
              name: z.string(),
              description: z.string().optional(),
              isRequired: z.boolean().optional(),
              choices: z
                .array(
                  z.object({
                    value: z.string(),
                    label: z.string(),
                  }),
                )
                .optional(),
              choicesByUrl: z
                .object({
                  url: z.string(),
                })
                .optional(),
            }),
          ),
        }),
        ),
      }),
      invitedAttendees: z.array(
        z.intersection(
          z.object({
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            username: z.string(),
          }),
          z.object({
            value: z.string(),
            label: z.string(),
          }),
        ),
      ),
      invitedGroups: z.array(z.object({})),
      isAnonymous: z.boolean().optional(),
      isPublic: z.boolean().optional(),
      canSubmitMultipleAnswers: z.boolean().optional(),
      canUpdateFormerAnswer: z.boolean().optional(),
    }).optional(),
    icon: z.string().optional(),
    title: z.string(),
    description: z.string(),
    isActive: z.boolean(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  });

export default getSurveyTemplateFormSchema;
