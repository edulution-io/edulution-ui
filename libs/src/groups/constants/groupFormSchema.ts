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
import LmnApiProjectQuota from '@libs/lmnApi/types/lmnApiProjectQuota';
import EmailRegexPattern from '@libs/common/constants/emailRegexPattern';

const LmnApiProjectQuotaSchema = z.object({
  quota: z.number(),
  share: z.string(),
  comment: z.string().optional(),
});

const getGroupFormSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    displayName: z
      .string()
      .min(3, { message: t('common.min_chars', { count: 3 }) })
      .max(60, { message: t('common.max_chars', { count: 60 }) }),
    name: z
      .string()
      .min(3, { message: t('common.min_chars', { count: 3 }) })
      .max(60, { message: t('common.max_chars', { count: 60 }) }),
    description: z.string().max(160, { message: t('common.max_chars', { count: 160 }) }),
    join: z.boolean(),
    hide: z.boolean(),
    admins: z.array(z.any()),
    admingroups: z.array(z.any()),
    members: z.array(z.any()),
    membergroups: z.array(z.any()),
    mailquota: z
      .string()
      .refine((value) => !Number.isNaN(Number(value)), { message: t('classmanagement.invalidMailQuota') })
      .transform((value) => Number(value)),
    maillist: z.boolean(),
    mailalias: z.boolean(),
    quota: z.string().refine(
      (value) => {
        if (value === '') return true;
        try {
          const parsed = JSON.parse(value) as LmnApiProjectQuota[];
          return Array.isArray(parsed) && parsed.every((item) => LmnApiProjectQuotaSchema.safeParse(item).success);
        } catch {
          return false;
        }
      },
      { message: t('classmanagement.invalidQuota') },
    ),
    school: z.string(),
    proxyAddresses: z.string().refine((value) => value === '' || EmailRegexPattern.test(value), {
      message: t('classmanagement.invalidProxyAddresses'),
    }),
  });

export default getGroupFormSchema;
