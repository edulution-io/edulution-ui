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
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import APPS from '@libs/appconfig/constants/apps';
import TApps from '@libs/appconfig/types/appsType';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';

const appIntegrationEnum = z.enum(Object.values(APP_INTEGRATION_VARIANT) as [string, ...string[]]);
const forbiddenRouts = [...Object.values(APPS), 'auth', 'edu-api'];

const getAppConfigFormSchema = (t: TFunction<'translation', undefined>) =>
  z.record(
    z.object({
      appType: appIntegrationEnum,
      accessGroups: z.array(z.object({})).optional(),
      options: z.object({
        url: z.string().optional(),
        apiKey: z.string().optional(),
      }),
      proxyConfig: z.string().optional(),
      proxyPath: z
        .string()
        .refine((val) => !forbiddenRouts.includes(val as TApps), {
          message: t('settings.errors.forbiddenProxyPath'),
        })
        .optional(),
      proxyDestination: z
        .string()
        .optional()
        .refine((value) => !value || z.string().url().safeParse(value).success, {
          message: t('settings.appconfig.sections.veyon.invalidUrlFormat'),
        }),
      stripPrefix: z.boolean().optional(),
      extendedOptions: z
        .object({
          [ExtendedOptionKeys.MAIL_IMAP_URL]: z.string().optional(),
          [ExtendedOptionKeys.MAIL_IMAP_PORT]: z.number().optional(),
        })
        .optional(),
      mailProviderId: z.string().optional(),
      configName: z.string().optional(),
      hostname: z.string().optional(),
      port: z.string().optional(),
      encryption: z.string().optional(),
    }),
  );

export default getAppConfigFormSchema;
