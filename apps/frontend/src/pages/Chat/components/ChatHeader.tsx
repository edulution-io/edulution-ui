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
import { TbLayoutSidebarRightCollapse } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';
import { ChatGroupType } from '@libs/chat/types/chatGroupType';
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import useChatStore from '@/pages/Chat/hooks/useChatStore';
import ChatHeaderUser from './ChatHeaderUser';
import ChatHeaderGroup from './ChatHeaderGroup';

interface ChatHeaderGroupProps {
  type: 'group';
  groupCn: string;
  groupType: ChatGroupType;
  groupName?: string;
  maxMembers?: number;
}

interface ChatHeaderUserProps {
  type: 'user';
  user: LmnUserInfo;
}

type ChatHeaderProps = ChatHeaderGroupProps | ChatHeaderUserProps;

const ChatHeader: React.FC<ChatHeaderProps> = (props) => {
  const { type } = props;
  const { t } = useTranslation();
  const { setCurrentlyOpenChat, setIsChatPopoutVisible, setIsChatDocked } = useChatStore();

  const handleUndock = () => {
    if (type === 'user') {
      const { user } = props;
      setCurrentlyOpenChat({
        chatId: user.cn,
        type: 'users',
        user,
      });
    } else {
      const { groupCn, groupType, groupName } = props;
      setCurrentlyOpenChat({
        chatId: groupCn,
        type: 'groups',
        groupType,
        groupName,
      });
    }
    setIsChatPopoutVisible(true);
    setIsChatDocked(false);
  };

  const UndockButton = (
    <button
      type="button"
      onClick={handleUndock}
      className="mr-2 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-background"
      title={t('chat.undock')}
    >
      <TbLayoutSidebarRightCollapse className="h-5 w-5" />
    </button>
  );

  if (type === 'user') {
    const { user } = props;
    return (
      <div className="flex items-center justify-between border-b border-muted">
        <ChatHeaderUser user={user} />
        {UndockButton}
      </div>
    );
  }

  const { groupCn, groupType, groupName, maxMembers } = props;
  return (
    <div className="flex items-center justify-between border-b border-muted">
      <ChatHeaderGroup
        groupCn={groupCn}
        groupType={groupType}
        groupName={groupName}
        maxMembers={maxMembers}
      />
      {UndockButton}
    </div>
  );
};

export default ChatHeader;
