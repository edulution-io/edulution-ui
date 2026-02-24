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

import React, { useRef, useEffect, useCallback, ChangeEvent, KeyboardEvent, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faPaperPlane,
  faPaperclip,
  faScrewdriverWrench,
  faWandMagicSparkles,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { Textarea } from '@/components/ui/Textarea';
import { DropdownSelect } from '@/components';
import { Button, cn } from '@edulution-io/ui-kit';
import AiChatModelUserDto from '@libs/aiChatModel/types/aiChatModelUserDto';
import AI_SERVICE_CAPABILITIES from '@libs/aiService/constants/aiServiceCapabilities';
import AiServiceCapabilityType from '@libs/aiService/types/aiServiceCapabilityType';
import CHAT_MESSAGE_MAX_LENGTH from '@libs/chat/constants/chatMessageMaxLength';
import TEXTAREA_MAX_HEIGHT_PX from '@libs/chat/constants/textareaMaxHeightPx';

const CAPABILITY_ICONS: Record<AiServiceCapabilityType, typeof faScrewdriverWrench> = {
  [AI_SERVICE_CAPABILITIES.TOOL_EXECUTION]: faScrewdriverWrench,
  [AI_SERVICE_CAPABILITIES.VISION]: faEye,
  [AI_SERVICE_CAPABILITIES.IMAGE_GENERATION]: faWandMagicSparkles,
};

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e?: FormEvent) => Promise<void>;
  isLoading: boolean;
  placeholder?: string;
  models?: AiChatModelUserDto[];
  selectedModelId?: string | null;
  onModelChange?: (id: string | null) => void;
  selectedFile?: File | null;
  onFileSelect?: (file: File | null) => void;
  isPrivacyCompliant?: boolean;
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
  selectedFile,
  onFileSelect,
  isPrivacyCompliant = true,
}) => {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasModels = models && models.length > 0;
  const modelOptions = hasModels ? models.map((model) => ({ id: model.id, name: model.name })) : [];
  const selectedModel = models?.find((model) => model.id === selectedModelId);
  const selectedCapabilities = selectedModel?.capabilities ?? [];

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      onFileSelect?.(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onFileSelect],
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, TEXTAREA_MAX_HEIGHT_PX)}px`;
    }
  }, [value]);

  const canSubmit = (value.trim() || selectedFile) && !isLoading;

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) {
        void onSubmit();
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      void onSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-background/80 p-4 backdrop-blur-sm"
    >
      <div
        className={cn(
          'rounded-2xl border-2 bg-white shadow-sm dark:bg-accent',
          isPrivacyCompliant ? 'border-border' : 'border-red-500',
        )}
      >
        {selectedFile && (
          <div className="flex items-center gap-2 px-4 pt-3">
            <span className="truncate rounded-lg bg-muted px-3 py-1 text-xs">{selectedFile.name}</span>
            <button
              type="button"
              onClick={() => onFileSelect?.(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <FontAwesomeIcon
                icon={faXmark}
                className="h-3.5 w-3.5"
              />
            </button>
          </div>
        )}
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
        <div className="flex items-center justify-between px-3 pb-2">
          {onFileSelect && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="btn-ghost"
                size="icon"
                disabled={isLoading}
                className={cn('h-8 w-8 shrink-0 rounded-lg', isLoading && 'opacity-50')}
                onClick={() => fileInputRef.current?.click()}
              >
                <FontAwesomeIcon
                  icon={faPaperclip}
                  className="h-3.5 w-3.5"
                />
              </Button>
            </>
          )}
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            {hasModels && onModelChange && (
              <>
                {selectedCapabilities.length > 0 && (
                  <div className="flex gap-1.5">
                    {selectedCapabilities.map((cap) => (
                      <FontAwesomeIcon
                        key={cap}
                        icon={CAPABILITY_ICONS[cap]}
                        className="h-3.5 w-3.5 text-muted-foreground"
                      />
                    ))}
                  </div>
                )}
                <DropdownSelect
                  options={modelOptions}
                  selectedVal={selectedModelId ?? ''}
                  handleChange={(selectedValue) => {
                    if (selectedValue) onModelChange(selectedValue);
                  }}
                  placeholder={t('chat.aiChatModel.selectModel')}
                  openToTop
                  translate={false}
                  classname="min-w-0 max-w-72 flex-1"
                />
              </>
            )}
            <Button
              type="submit"
              variant="btn-collaboration"
              size="icon"
              disabled={!canSubmit}
              className={cn('h-8 w-8 shrink-0 rounded-lg', !canSubmit && 'opacity-50')}
            >
              <FontAwesomeIcon
                icon={faPaperPlane}
                className="h-3.5 w-3.5"
              />
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
