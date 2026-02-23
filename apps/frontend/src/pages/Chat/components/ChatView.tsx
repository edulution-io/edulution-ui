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
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@edulution-io/ui-kit';
import ChatAdapter from '@/pages/Chat/types/chatAdapter';
import AiChatModelUserDto from '@libs/aiChatModel/types/aiChatModelUserDto';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface ChatViewProps {
  adapter: ChatAdapter;
  title?: string;
  models?: AiChatModelUserDto[];
  selectedModelId?: string | null;
  onModelChange?: (id: string | null) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ adapter, title, models, selectedModelId, onModelChange }) => {
  const { t } = useTranslation();
  const { messages, input, setInput, handleSubmit, isLoading, error, selectedFile, setSelectedFile } = adapter;
  const selectedModel = models?.find((model) => model.id === selectedModelId);
  const isPrivacyCompliant = selectedModel?.isDataPrivacyCompliant ?? true;

  return (
    <div
      className={cn(
        'bg-glass flex h-full flex-col',
        !isPrivacyCompliant && selectedModel && 'rounded-lg border-2 border-red-500',
      )}
    >
      {title && (
        <div className="flex items-center gap-4 border-b border-muted px-4 py-3">
          <h3 className="font-semibold text-background">{title}</h3>
          {selectedModel && (
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                isPrivacyCompliant ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
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
      )}

      {error && (
        <div className="bg-destructive/10 mx-4 mt-4 rounded-lg p-3 text-sm text-destructive">
          {t('chat.error')}: {error.message}
        </div>
      )}

      <ChatMessages
        messages={messages}
        isLoading={isLoading}
      />

      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        models={models}
        selectedModelId={selectedModelId}
        onModelChange={onModelChange}
        selectedFile={selectedFile}
        onFileSelect={setSelectedFile}
      />
    </div>
  );
};

export default ChatView;
