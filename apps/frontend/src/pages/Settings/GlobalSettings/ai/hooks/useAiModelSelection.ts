import { useEffect } from 'react';
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

  useEffect(() => {
    if (!watchedUrl || !watchedApiStandard) {
      resetModels();
      return;
    }

    try {
      new URL(watchedUrl);
    } catch {
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchModels(watchedUrl, watchedApiKey || '', watchedApiStandard);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedUrl, watchedApiKey, watchedApiStandard]);

  useEffect(() => {
    if (!watchedUrl || !watchedModel || !watchedApiStandard) {
      resetResult();
      return;
    }

    testConnection({
      url: watchedUrl,
      apiKey: watchedApiKey || '',
      aiModel: watchedModel,
      apiStandard: watchedApiStandard,
    });
  }, [watchedModel]);

  useEffect(() => {
    if (models.length > 0 && watchedModel && !models.includes(watchedModel)) {
      setValue(AI_CONFIG_TABLE_COLUMNS.AI_MODEL, '');
    }
  }, [models, watchedModel, setValue]);

  const resetAll = () => {
    resetModels();
    resetResult();
  };

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
