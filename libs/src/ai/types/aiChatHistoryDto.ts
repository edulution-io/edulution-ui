import AiChatMessageDto from '@libs/ai/types/aiChatMessageDto';

interface AiChatHistoryDto {
  _id: string;
  title: string;
  userId: string;
  messages: AiChatMessageDto[];
  createdAt: string;
  updatedAt: string;
}

export default AiChatHistoryDto;
