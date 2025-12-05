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

import { useCallback, useEffect, useState } from 'react';
import eduApi from '@/api/eduApi';
import AvailableAiModel from '@libs/ai/types/availableAiModel';
import PurposeFilterDto from '@libs/ai/types/purposeFilterDto';
import { AI_AVAILABLE_ENDPOINT } from '@libs/ai/constants/aiEndpoints';

interface UseAvailableAiModelsOptions {
  purpose?: string;
  autoFetch?: boolean;
}

const useAvailableAiModels = (options: UseAvailableAiModelsOptions = {}) => {
  const { purpose, autoFetch = true } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<AvailableAiModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AvailableAiModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableModels = useCallback(
    async (purposeFilter?: PurposeFilterDto) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await eduApi.post<AvailableAiModel[]>(AI_AVAILABLE_ENDPOINT, purposeFilter || { purpose });
        setModels(response.data);
        if (response.data.length > 0 && !selectedModel) {
          setSelectedModel(response.data[0]);
        }

        return response.data;
      } catch (err) {
        console.error('Failed to fetch available models:', err);
        setError('Failed to fetch available models');
        setModels([]);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [purpose, selectedModel],
  );

  useEffect(() => {
    if (autoFetch) {
      void fetchAvailableModels();
    }
  }, [autoFetch, fetchAvailableModels]);

  const selectModelById = useCallback(
    (modelId: string) => {
      const model = models.find((m) => m.configId === modelId);
      if (model) {
        setSelectedModel(model);
      }
    },
    [models],
  );

  return {
    models,
    selectedModel,
    setSelectedModel,
    selectModelById,
    isLoading,
    error,
    refetch: fetchAvailableModels,
  };
};

export default useAvailableAiModels;
