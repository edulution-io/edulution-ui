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

const getBulletinFormSchema = (t: TFunction<'translation', undefined>) =>
  z
    .object({
      title: z
        .string()
        .min(3, { message: t('common.min_chars', { count: 3 }) })
        .max(255, { message: t('common.max_chars', { count: 100 }) }),
      content: z.string().min(17, { message: t('common.min_chars', { count: 10 }) }),
      isActive: z.boolean(),
      category: z
        .object({
          id: z.string().min(1, { message: t('common.required') }),
          name: z.string().min(1, { message: t('common.required') }),
        })
        .optional()
        .refine((val) => val !== undefined, { message: t('bulletinboard.categoryIsRequired') }),

      isVisibleStartDate: z.date().optional(),
      isVisibleEndDate: z.date().optional(),
    })
    .refine(
      (data) => {
        const startDate = data.isVisibleStartDate ? new Date(data.isVisibleStartDate) : null;
        const endDate = data.isVisibleEndDate ? new Date(data.isVisibleEndDate) : null;

        if (!startDate || !endDate) {
          return true;
        }

        return startDate <= endDate;
      },
      {
        message: t('common.errors.startDateBeforeEndDate'),
        path: ['isVisibleStartDate'],
      },
    );

export default getBulletinFormSchema;
