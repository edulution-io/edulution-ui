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

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ChatView from '@/pages/Chat/components/ChatView';
import useGroupChat from '@/pages/Chat/hooks/useGroupChat';
import GroupTypeLocation from '@libs/chat/types/groupTypeLocation';
import { CHAT_GROUP_TYPE_LOCATIONS } from '@libs/chat/constants/chatPaths';

interface ChatContentProps {
  groupName: string;
  groupType: GroupTypeLocation;
}

const ChatContent: React.FC<ChatContentProps> = ({ groupName, groupType }) => {
  const { t } = useTranslation();
  const adapter = useGroupChat(groupName, groupType);
  const groupTypeLabel = useMemo(() => {
    const groupTypeLabelMap: Record<string, string> = {
      [CHAT_GROUP_TYPE_LOCATIONS.CLASSES]: t('chat.schoolClass'),
      [CHAT_GROUP_TYPE_LOCATIONS.PROJECTS]: t('chat.project'),
      [CHAT_GROUP_TYPE_LOCATIONS.GROUPS]: t('chat.group'),
    };
    return groupTypeLabelMap[groupType] ?? t('chat.group');
  }, [groupType, t]);

  return (
    <ChatView
      adapter={adapter}
      title={groupName}
      subtitle={groupTypeLabel}
    />
  );
};

export default ChatContent;
