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

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@edulution-io/ui-kit';
import ChatView from '@/pages/Chat/components/ChatView';
import useAiChat from '@/pages/Chat/hooks/useAiChat';
import useAiChatStore from '@/store/useAiChatStore';

interface AiChatContentProps {
  chatId: string;
}

const AiChatContent: React.FC<AiChatContentProps> = ({ chatId }) => {
  const { t } = useTranslation();
  const adapter = useAiChat(chatId);
  const conversations = useAiChatStore((state) => state.conversations);
  const availableModels = useAiChatStore((state) => state.availableModels);
  const selectedModelId = useAiChatStore((state) => state.selectedModelId);
  const setSelectedModelId = useAiChatStore((state) => state.setSelectedModelId);
  const fetchAvailableModels = useAiChatStore((state) => state.fetchAvailableModels);
  const title = conversations.find((conversation) => conversation.id === chatId)?.title ?? t('chat.newChat');
  const selectedModel = availableModels.find((model) => model.id === selectedModelId);
  const isPrivacyCompliant = selectedModel?.isDataPrivacyCompliant ?? true;

  useEffect(() => {
    void fetchAvailableModels();
  }, [fetchAvailableModels]);

  return (
    <>
      <div className="flex w-full flex-col px-6 pb-2 pt-2">
        <p className="text-background">{title}</p>
        {selectedModel && (
          <div
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium',
              isPrivacyCompliant ? 'text-green-700' : 'text-red-700',
            )}
          >
            <FontAwesomeIcon
              icon={faShieldHalved}
              className="h-3 w-3"
            />
            <span>
              {isPrivacyCompliant
                ? t('settings.aiServices.dataPrivacyCompliant')
                : t('settings.aiServices.dataPrivacyNotCompliant')}
            </span>
          </div>
        )}
      </div>
      <ChatView
        adapter={adapter}
        models={availableModels}
        selectedModelId={selectedModelId}
        onModelChange={setSelectedModelId}
        showTypingIndicator
      />
    </>
  );
};

export default AiChatContent;
