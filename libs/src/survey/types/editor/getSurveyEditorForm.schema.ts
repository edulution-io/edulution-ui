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

const getSurveyEditorFormSchema = () =>
  z.object({
    id: z.number(),
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
    backendLimiters: z
      .array(
        z.object({
          questionName: z.string().optional(),
          choices: z.array(
            z.object({
              name: z.string().optional(),
              title: z.string().optional(),
              limit: z.number().optional(),
            }),
          ),
        }),
      )
      .optional(),
    saveNo: z.number().optional(),
    creator: z.intersection(
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
    participatedAttendees: z.array(
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
    answers: z.any(),
    created: z.date().optional(),
    expires: z.date().nullable().optional(),
    isAnonymous: z.boolean().optional(),
    isPublic: z.boolean().optional(),
    canSubmitMultipleAnswers: z.boolean().optional(),
    canUpdateFormerAnswer: z.boolean().optional(),
  });

export default getSurveyEditorFormSchema;
