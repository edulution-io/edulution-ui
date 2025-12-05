import type { UIMessage } from 'ai';
import AiChatMessageDto from '@libs/ai/types/aiChatMessageDto';
import { AiRole } from '../types/aiRoleType';

const toAiChatMessages = (messages: UIMessage[]): AiChatMessageDto[] =>
  messages.map((msg) => ({
    id: msg.id,
    role: msg.role as AiRole,
    parts: msg.parts
      .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
      .map((part) => ({
        type: part.type,
        text: part.text,
      })),
  }));

export default toAiChatMessages;
