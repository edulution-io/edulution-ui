import { useState } from 'react';
import eduApi from '@/api/eduApi';
import FetchModelsResult from '@libs/ai/types/fetchModelsResult';

const useFetchAiModels = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async (url: string, apiKey: string, apiStandard: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await eduApi.post<FetchModelsResult>('global-settings/ai-configs/models', {
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
