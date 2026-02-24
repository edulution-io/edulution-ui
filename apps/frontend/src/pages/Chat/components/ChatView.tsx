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

import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import ChatAdapter from '@/pages/Chat/types/chatAdapter';
import AiChatModelUserDto from '@libs/aiChatModel/types/aiChatModelUserDto';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface ChatViewProps {
  adapter: ChatAdapter;
  models?: AiChatModelUserDto[];
  selectedModelId?: string | null;
  onModelChange?: (id: string | null) => void;
  showTypingIndicator?: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({
  adapter,
  models,
  selectedModelId,
  onModelChange,
  showTypingIndicator = false,
}) => {
  const { t } = useTranslation();
  const { messages, input, setInput, handleSubmit, isLoading, error, selectedFile, setSelectedFile } = adapter;
  const selectedModel = models?.find((model) => model.id === selectedModelId);
  const isPrivacyCompliant = selectedModel?.isDataPrivacyCompliant ?? true;
  const prevErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (error && error.message !== prevErrorRef.current) {
      prevErrorRef.current = error.message;
      const isContextWindowError =
        error.message.toLowerCase().includes('context') && error.message.toLowerCase().includes('window');
      const translationKey = isContextWindowError ? 'chat.errors.contextWindowExceeded' : 'chat.errors.aiRequestFailed';
      toast.error(t(translationKey));
    }
    if (!error) {
      prevErrorRef.current = null;
    }
  }, [error, t]);

  return (
    <div className="bg-glass flex h-full flex-col">
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        showTypingIndicator={showTypingIndicator}
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
        isPrivacyCompliant={isPrivacyCompliant}
      />
      {models && models.length > 0 && (
        <p className="pb-2 text-center text-xs font-light text-muted-foreground">{t('chat.aiDisclaimer')}</p>
      )}
    </div>
  );
};

export default ChatView;
