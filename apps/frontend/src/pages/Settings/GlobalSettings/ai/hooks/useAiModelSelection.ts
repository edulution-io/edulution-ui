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

import { useCallback, useEffect, useRef } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type AiConfigDto from '@libs/ai/types/aiConfigDto';
import AI_CONFIG_TABLE_COLUMNS from '@libs/ai/constants/aiConfigTableColumns';
import useFetchAiModels from '@/pages/Settings/GlobalSettings/ai/hooks/useFetchAiModels';
import useTestAiConnection from '@/pages/Settings/GlobalSettings/ai/hooks/useTestAiConnection';

interface UseAiModelSelectionProps {
  watch: UseFormWatch<AiConfigDto>;
  setValue: UseFormSetValue<AiConfigDto>;
}

const useAiModelSelection = ({ watch, setValue }: UseAiModelSelectionProps) => {
  const { fetchModels, models, isLoading: isLoadingModels, error: modelsError, resetModels } = useFetchAiModels();
  const { testConnection, isLoading: isTesting, result: testResult, resetResult } = useTestAiConnection();

  const watchedUrl = watch(AI_CONFIG_TABLE_COLUMNS.URL);
  const watchedApiKey = watch(AI_CONFIG_TABLE_COLUMNS.API_KEY);
  const watchedModel = watch(AI_CONFIG_TABLE_COLUMNS.AI_MODEL);
  const watchedApiStandard = watch(AI_CONFIG_TABLE_COLUMNS.API_STANDARD);

  const fetchModelsRef = useRef(fetchModels);
  const resetModelsRef = useRef(resetModels);
  const testConnectionRef = useRef(testConnection);
  const resetResultRef = useRef(resetResult);

  useEffect(() => {
    fetchModelsRef.current = fetchModels;
    resetModelsRef.current = resetModels;
    testConnectionRef.current = testConnection;
    resetResultRef.current = resetResult;
  });

  useEffect(() => {
    if (!watchedUrl || !watchedApiStandard) {
      resetModelsRef.current();
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      void fetchModelsRef.current(watchedUrl, watchedApiKey || '', watchedApiStandard);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedUrl, watchedApiKey, watchedApiStandard]);

  useEffect(() => {
    if (!watchedUrl || !watchedModel || !watchedApiStandard) {
      resetResultRef.current();
      return;
    }

    void testConnectionRef.current({
      url: watchedUrl,
      apiKey: watchedApiKey || '',
      aiModel: watchedModel,
      apiStandard: watchedApiStandard,
    });
  }, [watchedUrl, watchedApiKey, watchedModel, watchedApiStandard]);

  useEffect(() => {
    if (models.length > 0 && watchedModel && !models.includes(watchedModel)) {
      setValue(AI_CONFIG_TABLE_COLUMNS.AI_MODEL, '');
    }
  }, [models, watchedModel, setValue]);

  const resetAll = useCallback(() => {
    resetModels();
    resetResult();
  }, [resetModels, resetResult]);

  return {
    models,
    isLoadingModels,
    modelsError,
    isTesting,
    testResult,
    resetAll,
  };
};

export default useAiModelSelection;
