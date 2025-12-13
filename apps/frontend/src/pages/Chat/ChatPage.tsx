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

import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdInfoOutline } from 'react-icons/md';
import { CHAT_GROUPS_LOCATION } from '@libs/chat/chatPaths';
import { Button } from '@/components/shared/Button';
import { ChatType } from '@libs/chat/types/chatType';
import { ChatGroupType } from '@libs/chat/types/chatGroupType';
import ChatMembersPanel from './components/ChatMembersPanel';

const ChatPage: React.FC = () => {
  const { t } = useTranslation();
  const { type, chatId } = useParams<{ type: ChatType; chatId?: string }>();
  const navigate = useNavigate();
  const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(false);

  useEffect(() => {
    if (!type) {
      navigate(`/chat/${CHAT_GROUPS_LOCATION}`, { replace: true });
    }
  }, [type, navigate]);

  useEffect(() => {
    setIsMembersPanelOpen(false);
  }, [chatId]);

  const handleInfoClick = () => {
    setIsMembersPanelOpen(true);
  };

  const getGroupType = (): ChatGroupType | undefined => {
    if (type !== 'groups' || !chatId) return undefined;
    return chatId.startsWith('p_') ? 'project' : 'class';
  };

  if (!type) {
    return null;
  }

  const showInfoButton = type === 'groups' && chatId;

  return (
    <div className="relative flex h-full w-full">
      {showInfoButton && (
        <Button
          type="button"
          onClick={handleInfoClick}
          className="hover:bg-background/10 absolute right-4 top-4 z-10 rounded-full p-2 text-background"
        >
          <MdInfoOutline className="h-6 w-6" />
        </Button>
      )}

      {chatId ? (
        <Outlet />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          {t('chat.selectChat')}
        </div>
      )}

      <ChatMembersPanel
        isOpen={isMembersPanelOpen}
        onClose={() => setIsMembersPanelOpen(false)}
        groupCn={chatId}
        groupType={getGroupType()}
      />
    </div>
  );
};

export default ChatPage;
