import ChatMessageData from '@libs/chat/types/chatMessageData';
import ChatMessageSender from '@libs/chat/types/chatMessageSender';
import { isTextUIPart, UIMessage } from 'ai';
import extractToolInvocations from '@libs/mcp/utils/extractToolInvocations';
import ChatMessageRole from '@libs/chat/constants/chatMessageRole';

const uiMessageToChatMessage = (
  msg: UIMessage,
  aiLabel?: string,
  chatMessageSender?: ChatMessageSender,
): ChatMessageData => {
  const isUser = msg.role === 'user';
  const textParts = msg.parts?.filter(isTextUIPart) || [];
  const text = textParts.map((p) => p.text).join('');
  const toolInvocations = extractToolInvocations(msg);

  return {
    id: msg.id,
    text,
    sender: {
      cn: isUser ? chatMessageSender?.displayName || ChatMessageRole.USER : ChatMessageRole.ASSISTANT,
      displayName: isUser ? chatMessageSender?.displayName : aiLabel,
      firstName: isUser ? chatMessageSender?.firstName : undefined,
      lastName: isUser ? chatMessageSender?.lastName : undefined,
      isAI: !isUser,
    },
    timestamp: new Date().toISOString(),
    isOwn: isUser,
    role: isUser ? ChatMessageRole.USER : ChatMessageRole.ASSISTANT,
    toolInvocations: toolInvocations.length > 0 ? toolInvocations : undefined,
  };
};

export default uiMessageToChatMessage;
