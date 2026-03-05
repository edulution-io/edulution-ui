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

import React, { useRef, useEffect, KeyboardEvent } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Textarea } from '@/components/ui/Textarea';
import { Button, cn } from '@edulution-io/ui-kit';
import { Form, FormControl, FormFieldSH, FormMessage } from '@/components/ui/Form';
import { inputVariants } from '@libs/ui/constants/commonClassNames';
import CHAT_MESSAGE_MAX_LENGTH from '@libs/chat/constants/chatMessageMaxLength';
import ChatInputFormValues from '@libs/chat/types/chatInputFormValues';

interface ChatInputProps {
  form: UseFormReturn<ChatInputFormValues>;
  onSubmit: (data: ChatInputFormValues) => Promise<void>;
  isLoading: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ form, onSubmit, isLoading, placeholder }) => {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageValue = form.watch('message');

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
  }, [messageValue]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void form.handleSubmit(onSubmit)();
    }
  };

  const isMaxLength = messageValue.length >= CHAT_MESSAGE_MAX_LENGTH;
  const isDisabled = !messageValue.trim() || isLoading || isMaxLength;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-background/80 flex flex-col border-t border-muted p-4 backdrop-blur-sm"
      >
        <div className="flex items-end gap-2">
          <FormFieldSH
            control={form.control}
            name="message"
            rules={{
              required: true,
              maxLength: {
                value: CHAT_MESSAGE_MAX_LENGTH,
                message: t('chat.messageTooLong'),
              },
            }}
            render={({ field }) => (
              <div className="flex-1">
                <FormControl>
                  <Textarea
                    {...field}
                    ref={(e) => {
                      field.ref(e);
                      (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = e;
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder || t('chat.inputPlaceholder')}
                    className={cn(inputVariants(), 'max-h-32 min-h-10 resize-none overflow-y-auto py-2')}
                    rows={1}
                    maxLength={CHAT_MESSAGE_MAX_LENGTH}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="mt-1" />
              </div>
            )}
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
          {messageValue.length} / {CHAT_MESSAGE_MAX_LENGTH}
        </div>
      </form>
    </Form>
  );
};

export default ChatInput;
