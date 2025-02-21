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
