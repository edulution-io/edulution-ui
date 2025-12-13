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

import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChatType } from '@libs/chat/types/chatType';
import { ChatGroupType } from '@libs/chat/types/chatGroupType';
import ChatHeader from '@/pages/Chat/components/ChatHeader';
import useChatGroups from '@/pages/Chat/hooks/useChatGroups';
import useChatMembers from '@/pages/Chat/hooks/useChatMembers';

const ChatPage: React.FC = () => {
  const { t } = useTranslation();
  const { type, chatId } = useParams<{ type: ChatType; chatId?: string }>();

  const { schoolClasses, projects, groupsKey } = useChatGroups();
  const { members } = useChatMembers({ schoolClasses, projects, groupsKey });

  const getGroupType = (): ChatGroupType | undefined => {
    if (type !== 'groups' || !chatId) return undefined;
    return chatId.startsWith('p_') ? 'project' : 'class';
  };

  const groupType = getGroupType();
  const isGroupChat = type === 'groups' && chatId && groupType;
  const isUserChat = type === 'users' && chatId;

  const chatUser = isUserChat ? members.find((m) => m.cn === chatId) : undefined;

  if (!type) {
    return null;
  }

  return (
    <div className="flex h-full w-full flex-col">
      {isGroupChat && (
        <ChatHeader
          type="group"
          groupCn={chatId}
          groupType={groupType}
          groupName={chatId}
          maxMembers={10}
        />
      )}

      {isUserChat && chatUser && (
        <ChatHeader
          type="user"
          user={chatUser}
        />
      )}

      <div className="flex-1 overflow-hidden">
        {chatId ? (
          <Outlet />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            {t('chat.selectChat')}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
