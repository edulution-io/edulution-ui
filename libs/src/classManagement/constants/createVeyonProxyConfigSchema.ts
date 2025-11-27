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

import { TFunction } from 'i18next';
import { z } from 'zod';

const createVeyonProxyConfigSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    subnet: z
      .string()
      .regex(/^(([0-9]{1,3}\.){3}[0-9]{1,3}\/(3[0-2]|[1-2][0-9]|[0-9]))$/, {
        message: t('settings.appconfig.sections.veyon.invalidCidrFormat'),
      })
      .refine(
        (value) => {
          const [ip, prefix] = value.split('/');
          const octets = ip.split('.').map(Number);
          return (
            octets.length === 4 &&
            octets.every((octet) => octet >= 0 && octet <= 255) &&
            Number(prefix) >= 0 &&
            Number(prefix) <= 32
          );
        },
        { message: t('settings.appconfig.sections.veyon.invalidCidrFormat') },
      ),
    proxyAdress: z.string().url({ message: t('settings.appconfig.sections.veyon.invalidUrlFormat') }),
  });

export default createVeyonProxyConfigSchema;
