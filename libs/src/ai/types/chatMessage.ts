import ChatRole from '@libs/ai/types/chatRole';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

export default ChatMessage;
