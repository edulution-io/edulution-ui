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

import React, { useRef, useEffect, KeyboardEvent, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Textarea } from '@/components/ui/Textarea';
import { Button, cn } from '@edulution-io/ui-kit';
import { inputVariants } from '@libs/ui/constants/commonClassNames';
import CHAT_MESSAGE_MAX_LENGTH from '@libs/chat/constants/chatMessageMaxLength';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e?: FormEvent) => Promise<void>;
  isLoading: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSubmit, isLoading, placeholder }) => {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        void onSubmit();
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      void onSubmit(e);
    }
  };

  const isMaxLength = value.length >= CHAT_MESSAGE_MAX_LENGTH + 1;
  const isDisabled = !value.trim() || isLoading || isMaxLength;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-background/80 flex flex-col border-t border-muted p-4 backdrop-blur-sm"
    >
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t('chat.inputPlaceholder')}
          className={cn(inputVariants(), 'max-h-32 min-h-10 flex-1 resize-none overflow-y-auto py-2')}
          rows={1}
          maxLength={CHAT_MESSAGE_MAX_LENGTH}
          disabled={isLoading}
        />
        <Button
          type="submit"
          variant="btn-collaboration"
          size="icon"
          disabled={isDisabled}
          className={cn('h-10 w-10 shrink-0', isDisabled && 'opacity-50')}
        >
          <FontAwesomeIcon
            icon={faPaperPlane}
            className="h-4 w-4"
          />
        </Button>
      </div>
      <div
        className={cn(
          'mt-1 text-right text-xs',
          isMaxLength ? 'font-medium text-destructive' : 'text-muted-foreground',
        )}
      >
        {value.length} / {CHAT_MESSAGE_MAX_LENGTH}
      </div>
    </form>
  );
};

export default ChatInput;
