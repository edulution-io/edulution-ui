import { useState } from 'react';
import eduApi from '@/api/eduApi';
import type AiConfigDto from '@libs/ai/types/aiConfigDto';
import AITestResult from '@libs/ai/types/aiTestResult';

const useTestAiConnection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AITestResult | null>(null);

  const AI_CONFIG_ENDPOINT = 'global-settings/ai-configs';

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
      const response = await eduApi.post<AITestResult>(`${AI_CONFIG_ENDPOINT}/test-connection`, {
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
