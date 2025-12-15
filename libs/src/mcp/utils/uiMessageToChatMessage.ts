/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

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
