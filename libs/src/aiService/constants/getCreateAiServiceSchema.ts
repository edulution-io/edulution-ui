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
import AI_PROVIDERS from '@libs/aiService/constants/aiProviders';
import AI_SERVICE_CAPABILITIES from '@libs/aiService/constants/aiServiceCapabilities';
import AI_SERVICE_PURPOSES from '@libs/aiService/constants/aiServicePurposes';

const getCreateAiServiceSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    name: z
      .string()
      .min(3, { message: t('common.min_chars', { count: 3 }) })
      .max(50, { message: t('common.max_chars', { count: 50 }) }),
    provider: z.enum([
      AI_PROVIDERS.OLLAMA,
      AI_PROVIDERS.OPENAI,
      AI_PROVIDERS.ANTHROPIC,
      AI_PROVIDERS.GOOGLE,
      AI_PROVIDERS.CUSTOM,
    ]),
    baseUrl: z.string().min(1, { message: t('common.required') }),
    apiKey: z.string().min(1, { message: t('common.required') }),
    model: z.string().min(1, { message: t('common.required') }),
    purpose: z.enum([AI_SERVICE_PURPOSES.CHAT]),
    isActive: z.boolean().default(true),
    isDataPrivacyCompliant: z.boolean().default(false),
    capabilities: z
      .array(
        z.enum([
          AI_SERVICE_CAPABILITIES.TOOL_EXECUTION,
          AI_SERVICE_CAPABILITIES.VISION,
          AI_SERVICE_CAPABILITIES.IMAGE_GENERATION,
        ]),
      )
      .default([]),
  });

export default getCreateAiServiceSchema;
