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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { renderHook } from '@testing-library/react';
import useModKeyLabel from './useModKeyLabel';

describe('useModKeyLabel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns command symbol on Mac platform', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');

    const { result } = renderHook(() => useModKeyLabel());

    expect(result.current).toBe('\u2318');
  });

  it('returns translated ctrlKey on Windows platform', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Win32');

    const { result } = renderHook(() => useModKeyLabel());

    expect(result.current).toBe('ctrlKey');
  });

  it('returns translated ctrlKey on Linux platform', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Linux x86_64');

    const { result } = renderHook(() => useModKeyLabel());

    expect(result.current).toBe('ctrlKey');
  });
});
