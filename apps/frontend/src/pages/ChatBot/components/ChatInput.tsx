/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { forwardRef, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Textarea } from '@/components/ui/Textarea';
import { useTranslation } from 'react-i18next';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ value, onChange, onSend, disabled = false, placeholder }, ref) => {
    const { t } = useTranslation();
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px';
        const { scrollHeight } = textareaRef.current;
        textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
      }
    }, [value, textareaRef]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    };

    return (
      <div className="border-muted/30 bg-card/80 shrink-0 border-t-2 p-4 backdrop-blur-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
          className="flex items-end gap-2"
        >
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || t('chatBot.input.placeholder')}
            disabled={disabled}
            className="bg-input/50 border-muted/30 focus:ring-primary/20 max-h-[120px]
                       min-h-[44px] flex-1 resize-none
                       rounded-xl text-foreground backdrop-blur-sm
                       transition-all placeholder:text-muted-foreground
                       focus:border-primary focus:ring-2"
            rows={1}
          />
          <button
            type="submit"
            disabled={!value.trim() || disabled}
            aria-label={t('chatBot.input.sendLabel')}
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl
                       bg-gradient-to-br from-[var(--edulution-green)] to-[var(--edulution-blue)]
                       transition-all hover:scale-105
                       hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50
                       disabled:hover:scale-100"
          >
            <Send className="h-5 w-5 text-background" />
          </button>
        </form>
        <p className="mt-2 text-center text-xs text-muted-foreground">{t('chatBot.input.hint')}</p>
      </div>
    );
  },
);

ChatInput.displayName = 'ChatInput';

export default ChatInput;
