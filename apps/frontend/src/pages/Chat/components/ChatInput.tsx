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

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdSend, MdStop } from 'react-icons/md';
import cn from '@libs/common/utils/className';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/shared/Button';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, onStop, disabled, isStreaming, placeholder }) => {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="bg-accent/30 border-t border-muted p-4">
      <div className="flex w-full items-end gap-3">
        <div className="flex-1 rounded-xl border border-muted bg-foreground shadow-sm">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || t('chat.inputPlaceholder')}
            disabled={disabled}
            rows={1}
            className={cn(
              'max-h-[120px] min-h-[44px] w-full resize-none rounded-xl bg-transparent px-4 py-3 text-sm text-background',
              'placeholder:text-muted-foreground focus:outline-none',
              'scrollbar-thin',
            )}
          />
        </div>

        {isStreaming && onStop ? (
          <Button
            type="button"
            onClick={onStop}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-500 text-white transition-all hover:bg-red-600"
          >
            <MdStop className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all',
              canSend
                ? 'bg-ciGreenToBlue text-background shadow-md hover:opacity-90'
                : 'bg-muted text-muted-foreground',
            )}
          >
            <MdSend className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
