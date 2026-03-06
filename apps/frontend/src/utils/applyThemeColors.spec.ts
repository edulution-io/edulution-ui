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

import type ThemeColors from '@libs/global-settings/types/themeColors';
import applyThemeColors from './applyThemeColors';

describe('applyThemeColors', () => {
  const mockTheme: ThemeColors = {
    primary: '#ff0000',
    secondary: '#00ff00',
    ciLightGreen: '#33cc33',
    ciLightBlue: '#3366ff',
  };

  it('sets all CSS custom properties on root element', () => {
    const mockRoot = {
      style: {
        setProperty: vi.fn(),
      },
    } as unknown as HTMLElement;

    applyThemeColors(mockTheme, mockRoot);

    expect(mockRoot.style.setProperty).toHaveBeenCalledWith('--primary', '#ff0000');
    expect(mockRoot.style.setProperty).toHaveBeenCalledWith('--secondary', '#00ff00');
    expect(mockRoot.style.setProperty).toHaveBeenCalledWith('--ci-light-green', '#33cc33');
    expect(mockRoot.style.setProperty).toHaveBeenCalledWith('--ci-dark-blue', '#3366ff');
  });

  it('calls setProperty exactly 4 times', () => {
    const mockRoot = {
      style: {
        setProperty: vi.fn(),
      },
    } as unknown as HTMLElement;

    applyThemeColors(mockTheme, mockRoot);

    expect(mockRoot.style.setProperty).toHaveBeenCalledTimes(4);
  });

  it('uses document.documentElement as default root', () => {
    const spy = vi.spyOn(document.documentElement.style, 'setProperty').mockImplementation(() => {});

    applyThemeColors(mockTheme);

    expect(spy).toHaveBeenCalledWith('--primary', '#ff0000');
    spy.mockRestore();
  });
});
