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

import { useState } from 'react';
import eduApi from '@/api/eduApi';
import type AiConfigDto from '@libs/ai/types/aiConfigDto';
import AITestResult from '@libs/ai/types/aiTestResult';
import { AI_CONFIGS_TEST_EDU_API_ENDPOINT } from '@libs/ai/constants/aiEndpoints';

const useTestAiConnection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AITestResult | null>(null);

  const testConnection = async (config: Partial<AiConfigDto>): Promise<AITestResult> => {
    const { url, apiKey, aiModel, apiStandard } = config;

    if (!url || !aiModel || !apiStandard) {
      const res = { success: false, message: 'Missing required fields' };
      setResult(res);
      return res;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await eduApi.post<AITestResult>(AI_CONFIGS_TEST_EDU_API_ENDPOINT, {
        url,
        apiKey: apiKey || '',
        aiModel,
        apiStandard,
      });

      setResult(response.data);
      return response.data;
    } catch (error) {
      const res = { success: false, message: 'Connection test failed' };
      setResult(res);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const resetResult = () => setResult(null);

  return { testConnection, isLoading, result, resetResult };
};

export default useTestAiConnection;
