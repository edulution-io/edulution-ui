import { useCallback, useEffect, useState } from 'react';
import eduApi from '@/api/eduApi';
import { AI_HISTORY_EDU_API_ENDPOINT } from '@libs/ai/constants/aiEndpoints';
import AiChatHistoryListItemDto from '@libs/ai/types/aiChatHistoryListItemDto';
import AiChatHistoryDto from '@libs/ai/types/aiChatHistoryDto';
import AiChatMessageDto from '@libs/ai/types/aiChatMessageDto';

const useChatHistory = () => {
  const [history, setHistory] = useState<AiChatHistoryListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await eduApi.get<AiChatHistoryListItemDto[]>(AI_HISTORY_EDU_API_ENDPOINT);
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadChat = useCallback(async (chatId: string): Promise<AiChatHistoryDto | null> => {
    try {
      const response = await eduApi.get<AiChatHistoryDto>(`${AI_HISTORY_EDU_API_ENDPOINT}/${chatId}`);
      setSelectedChatId(chatId);
      return response.data;
    } catch (error) {
      console.error('Failed to load chat:', error);
      return null;
    }
  }, []);

  const createChat = useCallback(
    async (title: string, messages: unknown[]): Promise<AiChatHistoryDto | null> => {
      try {
        const response = await eduApi.post<AiChatHistoryDto>(AI_HISTORY_EDU_API_ENDPOINT, {
          title,
          messages,
        });
        setSelectedChatId(response.data._id);
        await fetchHistory();
        return response.data;
      } catch (error) {
        console.error('Failed to create chat:', error);
        return null;
      }
    },
    [fetchHistory],
  );

  const updateChat = useCallback(
    async (chatId: string, messages: AiChatMessageDto[]): Promise<void> => {
      try {
        await eduApi.put(`${AI_HISTORY_EDU_API_ENDPOINT}/${chatId}`, { messages });
        await fetchHistory();
      } catch (error) {
        console.error('Failed to update chat:', error);
      }
    },
    [fetchHistory],
  );

  const deleteChat = useCallback(
    async (chatId: string): Promise<void> => {
      try {
        await eduApi.delete(`${AI_HISTORY_EDU_API_ENDPOINT}/${chatId}`);
        if (selectedChatId === chatId) {
          setSelectedChatId(null);
        }
        await fetchHistory();
      } catch (error) {
        console.error('Failed to delete chat:', error);
      }
    },
    [fetchHistory, selectedChatId],
  );

  const newChat = useCallback(() => {
    setSelectedChatId(null);
  }, []);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    isLoading,
    selectedChatId,
    setSelectedChatId,
    loadChat,
    createChat,
    updateChat,
    deleteChat,
    newChat,
    fetchHistory,
  };
};

export default useChatHistory;
