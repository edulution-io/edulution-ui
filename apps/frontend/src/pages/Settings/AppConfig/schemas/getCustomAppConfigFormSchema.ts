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
import AppConfigDto from '@libs/appconfig/types/appConfigDto';
import slugify from '@libs/common/utils/slugify';
import AUTH_PATHS from '@libs/auth/constants/auth-paths';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';

const forbiddenRoutes = [...Object.values(APPS), AUTH_PATHS.AUTH_ENDPOINT, EDU_API_ROOT];

const getCustomAppConfigFormSchema = (t: TFunction<'translation', undefined>, appConfigs: AppConfigDto[]) => {
  const existingAppNames = appConfigs.map((item) => item.name);
  const existingDisplayNames = appConfigs.flatMap((item) => Object.values(item.translations ?? {}));

  return z.object({
    customAppName: z
      .string()
      .min(1, { message: t('settings.errors.fieldRequired') })
      .max(20, { message: t('settings.errors.maxChars', { count: 20 }) })
      .refine((val) => !forbiddenRoutes.includes(val.toLowerCase()), { message: t('settings.errors.nameIsNotAllowed') })
      .refine((val) => !existingAppNames.includes(slugify(val)) && !existingDisplayNames.includes(val), {
        message: t('settings.errors.nameAlreadyExists'),
      }),
    customIcon: z.string().min(1, { message: t('settings.errors.fieldRequired') }),
  });
};

export default getCustomAppConfigFormSchema;
