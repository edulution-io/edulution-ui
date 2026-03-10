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

import CHAT_USER_COLORS from '@libs/chat/constants/chatUserColors';
import getChatUserColor from './getChatUserColor';

describe('getChatUserColor', () => {
  it('returns a color from the palette', () => {
    const color = getChatUserColor('testuser');
    expect(CHAT_USER_COLORS).toContain(color);
  });

  it('returns the same color for the same username', () => {
    expect(getChatUserColor('alice')).toBe(getChatUserColor('alice'));
  });

  it('returns different colors for different usernames', () => {
    const colors = new Set(['alice', 'bob', 'charlie', 'dave'].map(getChatUserColor));
    expect(colors.size).toBeGreaterThan(1);
  });

  it('handles empty string without throwing', () => {
    expect(() => getChatUserColor('')).not.toThrow();
    expect(CHAT_USER_COLORS).toContain(getChatUserColor(''));
  });

  it('handles single character usernames', () => {
    const color = getChatUserColor('a');
    expect(CHAT_USER_COLORS).toContain(color);
  });
});
