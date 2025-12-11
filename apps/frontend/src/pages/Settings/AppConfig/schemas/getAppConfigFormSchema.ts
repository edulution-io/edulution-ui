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
import APPS from '@libs/appconfig/constants/apps';
import TApps from '@libs/appconfig/types/appsType';
import AUTH_PATHS from '@libs/auth/constants/auth-paths';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
// import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';

const forbiddenRouts = [...Object.values(APPS), AUTH_PATHS.AUTH_ENDPOINT, EDU_API_ROOT];

const getAppConfigFormSchema = (t: TFunction<'translation', undefined>) =>
  z.record(
    z.object({
      accessGroups: z.array(z.object({})).optional(),
      options: z
        .object({
          url: z
            .string()
            .refine((value) => !value || z.string().url().safeParse(value).success, {
              message: t('common.invalid_url'),
            })
            .optional(),
          apiKey: z.string().optional(),
        })
        .optional(),
      proxyConfig: z.string().optional(),
      proxyPath: z
        .string()
        .refine((val) => !forbiddenRouts.includes(val as TApps), {
          message: t('settings.errors.forbiddenProxyPath'),
        })
        .optional(),
      proxyDestination: z
        .string()
        .refine((value) => !value || z.string().url().safeParse(value).success, {
          message: t('common.invalid_url'),
        })
        .optional(),
      stripPrefix: z.boolean().optional(),
      // extendedOptions: z
      //   .object({
      //     [ExtendedOptionKeys.MAIL_IMAP_URL]: z.string().optional(),
      //     [ExtendedOptionKeys.MAIL_IMAP_PORT]: z.number().optional(),
      //   })
      //   .optional(),
      // mailProviderId: z.string().optional(),
      // configName: z.string().optional(),
      // hostname: z.string().optional(),
      // port: z.string().optional(),
      // encryption: z.string().optional(),
    }),
  );

export default getAppConfigFormSchema;
