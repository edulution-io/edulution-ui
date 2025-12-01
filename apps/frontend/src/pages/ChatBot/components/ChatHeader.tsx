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

import React from 'react';
import { Bot, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ChatHeaderProps {
  title?: string;
  isTyping: boolean;
  onClose: () => void;
}

const ChatHeader = ({ title, isTyping, onClose }: ChatHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="gradient-box flex shrink-0 items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full
                        bg-gradient-to-br from-[var(--edulution-green)] to-[var(--edulution-blue)] shadow-md"
        >
          <Bot className="h-6 w-6 text-background" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-background">{t(title || '')}</h3>
          <div className="flex items-center gap-1.5">
            <div
              className={`h-2 w-2 rounded-full ${
                isTyping ? 'animate-pulse bg-[var(--edulution-green)]' : 'bg-[var(--edulution-green)]'
              }`}
            />
            <p className="text-background/80 text-xs">
              {isTyping ? t('chatBot.header.typing') : t('chatBot.header.online')}
            </p>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex h-9 w-9 items-center justify-center rounded-lg transition-all
                   duration-200 hover:rotate-90 hover:scale-110 hover:bg-white/10"
        aria-label={t('chatBot.header.closeLabel')}
      >
        <X className="h-5 w-5 text-background" />
      </button>
    </div>
  );
};

export default ChatHeader;
