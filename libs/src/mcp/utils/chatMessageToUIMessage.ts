import { UIMessage } from 'ai';
import ChatMessageData from '@libs/chat/types/chatMessageData';
import ChatMessageRole from '@libs/chat/constants/chatMessageRole';

const chatMessageToUIMessage = (msg: ChatMessageData): UIMessage => ({
  id: msg.id,
  role: msg.role === ChatMessageRole.USER ? ChatMessageRole.USER : ChatMessageRole.ASSISTANT,
  parts: [{ type: 'text', text: msg.text }],
});

export default chatMessageToUIMessage;
