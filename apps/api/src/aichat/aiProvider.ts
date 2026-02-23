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

import { createOpenAI } from '@ai-sdk/openai';
import { customProvider } from 'ai';

const OLLAMA_DEFAULT_BASE_URL = 'http://localhost:11434/v1';
const OLLAMA_DEFAULT_MODEL = 'llama3.2:latest';

const getOllamaBaseUrl = () => process.env.OLLAMA_BASE_URL || OLLAMA_DEFAULT_BASE_URL;
const getOllamaModel = () => process.env.OLLAMA_MODEL || OLLAMA_DEFAULT_MODEL;

const createAiProvider = () => {
  const ollama = createOpenAI({
    baseURL: getOllamaBaseUrl(),
    apiKey: 'ollama',
  });

  const modelId = getOllamaModel();

  return customProvider({
    languageModels: {
      chat: ollama.chat(modelId),
    },
  });
};

const AI_PROVIDER_MODEL_ID = 'chat';

export { createAiProvider, AI_PROVIDER_MODEL_ID };
