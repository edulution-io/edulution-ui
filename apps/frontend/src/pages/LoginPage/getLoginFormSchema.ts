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

const getLoginFormSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    username: z
      .string({ required_error: t('username.required') })
      .min(1, { message: t('common.required') })
      .max(32, { message: t('login.username_too_long') }),
    password: z
      .string({ required_error: t('common.required') })
      .min(1, { message: t('common.required') })
      .max(32, { message: t('login.password_too_long') }),
    totpValue: z.string().optional(),
  });

export default getLoginFormSchema;
