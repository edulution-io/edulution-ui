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

const getUserAccountFormSchema = (t: TFunction<'translation', undefined>) =>
  z
    .object({
      appName: z.string({ message: t('common.required') }),
      accountUser: z.string().min(1, { message: t('common.required') }),
      accountPassword: z.string().optional(),
      safePin: z
        .string({ message: t('common.required') })
        .min(5, { message: t('common.required') })
        .optional(),
    })
    .superRefine((data, ctx) => {
      if (data.accountPassword && !data.safePin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('common.required'),
          path: ['safePin'],
        });
      }
    });

export default getUserAccountFormSchema;
