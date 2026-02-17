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
import { DropdownSelect } from '@/components';
import { Button, cn } from '@edulution-io/ui-kit';
import AiChatModelUserDto from '@libs/aiChatModel/types/aiChatModelUserDto';
import CHAT_MESSAGE_MAX_LENGTH from '@libs/chat/constants/chatMessageMaxLength';

const TEXTAREA_MAX_HEIGHT_PX = 120;

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e?: FormEvent) => Promise<void>;
  isLoading: boolean;
  placeholder?: string;
  models?: AiChatModelUserDto[];
  selectedModelId?: string | null;
  onModelChange?: (id: string | null) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder,
  models,
  selectedModelId,
  onModelChange,
}) => {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasModels = models && models.length > 0;
  const modelOptions = hasModels ? models.map((model) => ({ id: model.id, name: model.name })) : [];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, TEXTAREA_MAX_HEIGHT_PX)}px`;
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

  const isDisabled = !value.trim() || isLoading;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-background/80 p-4 backdrop-blur-sm"
    >
      <div className="rounded-2xl border border-border bg-white shadow-sm dark:bg-accent">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t('chat.inputPlaceholder')}
          className="max-h-30 min-h-10 resize-none border-none bg-transparent px-4 pb-1 pt-3 shadow-none focus-visible:ring-0"
          rows={1}
          maxLength={CHAT_MESSAGE_MAX_LENGTH}
          disabled={isLoading}
        />
        <div className="flex items-center justify-end gap-2 px-3 pb-2">
          {hasModels && onModelChange && (
            <DropdownSelect
              options={modelOptions}
              selectedVal={selectedModelId ?? ''}
              handleChange={(selectedValue) => {
                if (selectedValue) onModelChange(selectedValue);
              }}
              placeholder={t('chat.aiChatModel.selectModel')}
              openToTop
              translate={false}
              classname="w-44"
            />
          )}
          <Button
            type="submit"
            variant="btn-collaboration"
            size="icon"
            disabled={isDisabled}
            className={cn('h-8 w-8 shrink-0 rounded-lg', isDisabled && 'opacity-50')}
          >
            <FontAwesomeIcon
              icon={faPaperPlane}
              className="h-3.5 w-3.5"
            />
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
