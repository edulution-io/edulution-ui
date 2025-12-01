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

import React, { forwardRef } from 'react';
import { Bot, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ChatFloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const ChatFloatingButton = forwardRef<HTMLButtonElement, ChatFloatingButtonProps>(({ isOpen, onClick }, ref) => {
  const { t } = useTranslation();

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={isOpen ? t('chatBot.button.close') : t('chatBot.button.open')}
      className="gradient-box fixed bottom-4 z-30 flex h-14 w-14 items-center
                   justify-center rounded-full bg-primary
                   shadow-lg transition-all duration-200 hover:scale-110"
      style={{
        right: 'calc(var(--sidebar-width) + 1rem)',
      }}
    >
      {isOpen ? <X className="h-6 w-6 text-background" /> : <Bot className="h-6 w-6 text-background" />}
    </button>
  );
});

ChatFloatingButton.displayName = 'ChatFloatingButton';

export default ChatFloatingButton;
