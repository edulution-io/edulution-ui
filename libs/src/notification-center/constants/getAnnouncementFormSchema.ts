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

const getAnnouncementFormSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    title: z
      .string()
      .min(1, { message: t('notificationcenter.validation.titleRequired') })
      .max(65, { message: t('common.max_chars', { count: 65 }) }),
    pushMessage: z
      .string()
      .min(1, { message: t('notificationcenter.validation.messageRequired') })
      .max(150, { message: t('common.max_chars', { count: 150 }) }),
    extendedMessage: z.string().optional(),
    recipientGroups: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    ),
    recipientUsers: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    ),
    channels: z.array(z.string()).min(1, { message: t('notificationcenter.validation.channelRequired') }),
  });

export default getAnnouncementFormSchema;
