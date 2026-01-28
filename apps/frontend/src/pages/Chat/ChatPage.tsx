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
import PageLayout from '@/components/structure/layout/PageLayout';

const ChatPage = () => {
  const { t } = useTranslation();
  const { groupType, groupName } = useParams();

  return (
    <PageLayout>
      <div className="flex h-full flex-col">
        <div className="mb-4 pt-2">
          <h1 className="text-xl font-bold text-background">
            {groupName ? `${t('chat.conversationWith')} ${groupName}` : t('chat.selectConversation')}
          </h1>
        </div>

        <div className="bg-glass flex flex-1 items-center justify-center rounded-xl p-6 backdrop-blur-lg">
          {groupName ? (
            <div className="text-center text-background">
              <p className="text-lg">
                {t('chat.chatWith')} <span className="font-bold">{groupName}</span>
              </p>
              <p className="mt-2 text-sm opacity-70">
                {groupType === 'classes' ? t('chat.schoolClass') : t('chat.project')}
              </p>
            </div>
          ) : (
            <p className="text-background opacity-70">{t('chat.selectFromSidebar')}</p>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ChatPage;
