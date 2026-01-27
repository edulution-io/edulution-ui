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
import { TFunction } from 'i18next';
import BULLETIN_SAVE_MODE from '@libs/bulletinBoard/constants/bulletinSaveMode';
import CUSTOM_PUSH_BODY_MAX_LENGTH from '@libs/bulletinBoard/constants/customPushBodyMaxLength';

const getBulletinFormSchema = (t: TFunction<'translation', undefined>) =>
  z
    .object({
      title: z
        .string()
        .max(255, { message: t('common.max_chars', { count: 255 }) })
        .optional()
        .or(z.literal('')),
      content: z.string().optional().or(z.literal('')),
      isActive: z.boolean(),
      category: z
        .object({
          id: z.string().min(1, { message: t('common.required') }),
          name: z.string().min(1, { message: t('common.required') }),
        })
        .optional()
        .refine((val) => val !== undefined, { message: t('bulletinboard.categoryIsRequired') }),

      isVisibleStartDate: z.date().nullable().optional(),
      isVisibleEndDate: z.date().nullable().optional(),

      customPushTitle: z.string().max(255).optional().or(z.literal('')),
      customPushBody: z.string().max(CUSTOM_PUSH_BODY_MAX_LENGTH).optional().or(z.literal('')),
      saveMode: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.saveMode === BULLETIN_SAVE_MODE.PUSH_ONLY) {
        if (!data.customPushTitle) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('common.required'),
            path: ['customPushTitle'],
          });
        }
        if (!data.customPushBody) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('common.required'),
            path: ['customPushBody'],
          });
        }
      } else {
        if (!data.title || data.title.length < 3) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('common.min_chars', { count: 3 }),
            path: ['title'],
          });
        }
        if (!data.content || data.content.length < 17) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('common.min_chars', { count: 10 }),
            path: ['content'],
          });
        }
      }

      const startDate = data.isVisibleStartDate ? new Date(data.isVisibleStartDate) : null;
      const endDate = data.isVisibleEndDate ? new Date(data.isVisibleEndDate) : null;

      if (startDate && endDate && startDate > endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('common.errors.startDateBeforeEndDate'),
          path: ['isVisibleStartDate'],
        });
      }
    });

export default getBulletinFormSchema;
