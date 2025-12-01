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

import React from 'react';

const ChatTypingIndicator = () => (
  <div className="flex justify-start duration-300 animate-in fade-in slide-in-from-bottom-2">
    <div className="rounded-2xl rounded-bl-sm bg-accent px-4 py-3 shadow-md">
      <div className="flex gap-1">
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-white/60"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-white/60"
          style={{ animationDelay: '150ms' }}
        />
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-white/60"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  </div>
);

export default ChatTypingIndicator;
