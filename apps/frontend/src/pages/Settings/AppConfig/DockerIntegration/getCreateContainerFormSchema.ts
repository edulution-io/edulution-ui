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

const fqdnRegex = /^(?=.{1,253}$)(?:(?!-)[a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,}$/;

const getCreateContainerFormSchema = (
  t: TFunction<'translation', undefined>,
  envPlaceholders: Record<string, string>,
) => {
  if (Object.keys(envPlaceholders).length === 0) {
    return z.object({});
  }

  const schemaFields: Record<string, z.ZodString | z.ZodEffects<z.ZodString, string, string>> = {};

  Object.keys(envPlaceholders).forEach((placeholder) => {
    if (placeholder.includes('HOSTNAME')) {
      schemaFields[placeholder] = z.string({ message: t('common.required') }).refine((val) => fqdnRegex.test(val), {
        message: t('common.invalid_fqdn'),
      });
    } else {
      schemaFields[placeholder] = z.string({ message: t('common.required') }).min(1, t('common.required'));
    }
  });

  return z.object(schemaFields);
};

export default getCreateContainerFormSchema;
