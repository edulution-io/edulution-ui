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

import { TFunction } from 'i18next';
import { z } from 'zod';

const getCreateNewCategorieSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    name: z
      .string()
      .min(3, { message: t('common.min_chars', { count: 3 }) })
      .max(30, { message: t('common.max_chars', { count: 30 }) }),
  });

export default getCreateNewCategorieSchema;
