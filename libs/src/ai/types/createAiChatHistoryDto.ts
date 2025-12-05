import AiChatMessageDto from '@libs/ai/types/aiChatMessageDto';

interface CreateAiChatHistoryDto {
  title?: string;
  messages: AiChatMessageDto[];
}

export default CreateAiChatHistoryDto;