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
import APPS from '@libs/appconfig/constants/apps';
import TApps from '@libs/appconfig/types/appsType';

const forbiddenRouts = [...Object.values(APPS), 'auth', 'edu-api'];

const getCustomAppConfigFormSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    customAppName: z
      .string()
      .min(1, { message: t('settings.errors.fieldRequired') })
      .regex(/^[\p{L}\p{N}-]+$/u, { message: t('settings.errors.onlyAlphanumericAllowed') })
      .refine((val) => !forbiddenRouts.includes(val as TApps), { message: t('settings.errors.forbiddenProxyPath') }),
    customIcon: z.string().min(1, { message: t('settings.errors.fieldRequired') }),
  });
export default getCustomAppConfigFormSchema;
