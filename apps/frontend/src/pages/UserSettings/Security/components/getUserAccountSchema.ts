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

const getUserAccountFormSchema = (t: TFunction<'translation', undefined>) =>
  z
    .object({
      appName: z.string({ message: t('common.required') }),
      accountUser: z.string().min(1, { message: t('common.required') }),
      accountPassword: z.string().optional(),
      masterPassword: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.accountPassword && !data.masterPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('common.required'),
          path: ['masterPassword'],
        });
      }
    });

export default getUserAccountFormSchema;
