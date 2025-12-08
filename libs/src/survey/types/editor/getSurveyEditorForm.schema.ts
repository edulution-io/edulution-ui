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
