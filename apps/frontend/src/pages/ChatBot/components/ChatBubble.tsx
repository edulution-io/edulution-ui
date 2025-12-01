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

interface ChatBubbleProps {
  content: string;
  isUser: boolean;
}

const ChatBubble = ({ content, isUser }: ChatBubbleProps) => (
  <div
    className={`flex ${isUser ? 'justify-end' : 'justify-start'} duration-300 animate-in fade-in slide-in-from-bottom-2`}
  >
    <div
      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
        isUser ? 'rounded-br-sm bg-primary' : 'rounded-bl-sm bg-accent'
      }`}
    >
      <p className="break-words text-sm leading-relaxed text-white">{content}</p>
    </div>
  </div>
);

export default ChatBubble;
