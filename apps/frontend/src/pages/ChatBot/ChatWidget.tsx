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

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import ChatMessageList from '@/pages/ChatBot/components/ChatMessageList';
import ChatHeader from '@/pages/ChatBot/components/ChatHeader';
import ChatFloatingButton from '@/pages/ChatBot/components/ChatFloatingButton';
import useChatMessages from '@/pages/ChatBot/hooks/useChatMessages';

const ChatWidget = () => {
  const { t } = useTranslation();
  const { messages, isTyping, sendMessage } = useChatMessages();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const floatingButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        chatContainerRef.current &&
        floatingButtonRef.current &&
        !chatContainerRef.current.contains(event.target as Node) &&
        !floatingButtonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    await sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <>
      <ChatFloatingButton
        ref={floatingButtonRef}
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-20 bg-overlay-transparent backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            ref={chatContainerRef}
            className="bg-global fixed bottom-20 z-30
                     flex h-[600px]
                     max-h-[calc(100vh-8rem)] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl
                     border-4 border-transparent bg-card
                     shadow-2xl
                     md:bottom-24 md:w-96"
            style={{
              right: 'calc(var(--sidebar-width) + 1rem)',
              backgroundImage: 'var(--background-image)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <ChatHeader
              isTyping={isTyping}
              onClose={() => setIsOpen(false)}
            />

            <ChatMessageList
              messages={messages}
              isTyping={isTyping}
            />

            <div className="border-t border-border p-4">
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping}
                  placeholder={t('chatBot.input.placeholder')}
                  className="max-h-32 flex-1 resize-none rounded-lg bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  rows={1}
                  style={{
                    minHeight: '44px',
                    maxHeight: '128px',
                  }}
                />

                <button
                  onClick={handleSend}
                  type="button"
                  disabled={isTyping || !input.trim()}
                  className="hover:bg-primary/90 rounded-full bg-primary p-2 text-primary-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  title="Senden"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ChatWidget;
