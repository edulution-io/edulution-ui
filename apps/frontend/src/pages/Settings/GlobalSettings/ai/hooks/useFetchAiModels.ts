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
import FetchModelsResult from '@libs/ai/types/fetchModelsResult';
import { AI_CONFIGS_MODELS_EDU_API_ENDPOINT } from '@libs/ai/constants/aiEndpoints';

const useFetchAiModels = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async (url: string, apiKey: string, apiStandard: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await eduApi.post<FetchModelsResult>(AI_CONFIGS_MODELS_EDU_API_ENDPOINT, {
        url,
        apiKey,
        apiStandard,
      });
      if (response.data.success) {
        setModels(response.data.models);
      } else {
        setError(response.data.message || 'Failed to fetch models');
        setModels([]);
      }
      return response.data;
    } catch (err) {
      console.error('Failed to fetch models:', err);
      setError('Failed to fetch models');
      setModels([]);
      return { success: false, models: [], message: 'Failed to fetch models' };
    } finally {
      setIsLoading(false);
    }
  };

  const resetModels = () => {
    setModels([]);
    setError(null);
  };

  return { fetchModels, models, isLoading, error, resetModels };
};

export default useFetchAiModels;
