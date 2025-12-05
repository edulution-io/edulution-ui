import type { UIMessage } from 'ai';
import AiChatMessageDto from '@libs/ai/types/aiChatMessageDto';

const toUIMessages = (messages: AiChatMessageDto[]): UIMessage[] => {
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    parts: msg.parts.map((part) => ({
      type: part.type as 'text',
      text: part.text ?? '',
    })),
  })) as UIMessage[];
};

export default toUIMessages;
