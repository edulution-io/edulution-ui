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
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import PageLayout from '@/components/structure/layout/PageLayout';
import ChatView from './components/ChatView';
import useGroupChat from './hooks/useGroupChat';

type GroupType = 'classes' | 'projects';

interface ChatContentProps {
  groupName: string;
  groupType: GroupType;
}

const ChatContent: React.FC<ChatContentProps> = ({ groupName, groupType }) => {
  const { t } = useTranslation();
  const adapter = useGroupChat(groupName, groupType);
  const title = `${groupType === 'classes' ? t('chat.schoolClass') : t('chat.project')}: ${groupName}`;

  return (
    <ChatView
      adapter={adapter}
      title={title}
    />
  );
};

const ChatPage = () => {
  const { t } = useTranslation();
  const { groupType, groupName } = useParams<{ groupType: string; groupName: string }>();

  const isValidGroupType = groupType === 'classes' || groupType === 'projects';

  return (
    <PageLayout>
      <div className="flex h-full flex-col">
        {groupName && isValidGroupType ? (
          <ChatContent
            groupName={groupName}
            groupType={groupType}
          />
        ) : (
          <div className="bg-glass flex flex-1 flex-col items-center justify-center rounded-xl p-6 backdrop-blur-lg">
            <FontAwesomeIcon
              icon={faComments}
              className="mb-4 h-16 w-16 text-muted-foreground opacity-30"
            />
            <p className="text-lg text-muted-foreground">{t('chat.selectConversation')}</p>
            <p className="mt-2 text-sm text-muted-foreground opacity-70">{t('chat.selectFromSidebar')}</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ChatPage;
