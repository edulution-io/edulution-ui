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
import { faComments, faRotate } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@edulution-io/ui-kit';
import PageLayout from '@/components/structure/layout/PageLayout';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import useChatStore from '@/store/useChatStore';
import isValidGroupTypeLocation from '@libs/chat/utils/isValidGroupTypeLocation';
import ChatContent from './components/ChatContent';
import useRegisterChatSections from './useRegisterChatSections';

const ChatPage = () => {
  const { t } = useTranslation();
  const { groupType, groupName } = useParams<{ groupType: string; groupName: string }>();
  const { isLoadingGroups, fetchUserGroups } = useChatStore();
  useRegisterChatSections();

  return (
    <PageLayout hasFullWidthMain>
      <div className="flex h-full flex-col">
        {groupName && isValidGroupTypeLocation(groupType) ? (
          <ChatContent
            groupName={groupName}
            groupType={groupType}
          />
        ) : (
          <div className="bg-glass flex flex-1 flex-col items-center justify-center ">
            {isLoadingGroups ? (
              <CircleLoader />
            ) : (
              <>
                <FontAwesomeIcon
                  icon={faComments}
                  className="mb-4 h-16 w-16 text-muted-foreground opacity-30"
                />
                <p className="text-lg text-muted-foreground">{t('chat.selectConversation')}</p>
                <p className="mt-2 text-sm text-muted-foreground opacity-70">{t('chat.selectFromSidebar')}</p>
                <Button
                  type="button"
                  variant="btn-ghost"
                  disabled={isLoadingGroups}
                  onClick={() => fetchUserGroups()}
                  className="mt-4 flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted-background disabled:opacity-50"
                >
                  <FontAwesomeIcon
                    icon={faRotate}
                    className="h-4 w-4"
                    spin={isLoadingGroups}
                  />
                  <span className="text-sm">{t('chat.refreshGroups')}</span>
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ChatPage;
