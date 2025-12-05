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

import SUPPORTED_AI_PROVIDER from '@libs/ai/types/supportedAiProvider';

const aiApiConfigs = {
  [SUPPORTED_AI_PROVIDER.OpenAI]: (url: string, apiKey: string, model: string) => ({
    endpoint: `${url}/v1/chat/completions`,
    headers: { Authorization: `Bearer ${apiKey}` },
    body: { model, messages: [{ role: 'user', content: 'Hi' }], max_tokens: 5 },
  }),
  [SUPPORTED_AI_PROVIDER.OpenAICompatible]: (url: string, apiKey: string, model: string) => ({
    endpoint: `${url}/v1/chat/completions`,
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    body: { model, messages: [{ role: 'user', content: 'Hi' }], max_tokens: 5 },
  }),
  [SUPPORTED_AI_PROVIDER.Anthropic]: (url: string, apiKey: string, model: string) => ({
    endpoint: `${url}/v1/messages`,
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: { model, messages: [{ role: 'user', content: 'Hi' }], max_tokens: 5 },
  }),
  [SUPPORTED_AI_PROVIDER.Google]: (url: string, apiKey: string, model: string) => ({
    endpoint: `${url}/v1/models/${model}:generateContent?key=${apiKey}`,
    headers: {},
    body: { contents: [{ parts: [{ text: 'Hi' }] }], generationConfig: { maxOutputTokens: 5 } },
  }),
};

export default aiApiConfigs;
