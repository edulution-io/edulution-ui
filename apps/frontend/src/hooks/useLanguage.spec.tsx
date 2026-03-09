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

import { renderHook } from '@testing-library/react';
import useUserStore from '@/store/UserStore/useUserStore';
import useLanguage from './useLanguage';

describe('useLanguage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({ user: undefined as never });
  });

  it('returns user language when set and not "system"', () => {
    useUserStore.setState({ user: { language: 'fr' } as never });

    const { result } = renderHook(() => useLanguage());

    expect(result.current.language).toBe('fr');
  });

  it('returns navigator language prefix when user language is "system"', () => {
    useUserStore.setState({ user: { language: 'system' } as never });
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');

    const { result } = renderHook(() => useLanguage());

    expect(result.current.language).toBe('en');
  });

  it('returns navigator language prefix when user language is undefined', () => {
    useUserStore.setState({ user: {} as never });
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE');

    const { result } = renderHook(() => useLanguage());

    expect(result.current.language).toBe('de');
  });

  it('returns "de" as fallback when navigator.language is unavailable', () => {
    useUserStore.setState({ user: {} as never });
    vi.spyOn(navigator, 'language', 'get').mockReturnValue(undefined as never);

    const { result } = renderHook(() => useLanguage());

    expect(result.current.language).toBe('de');
  });

  it('returns user language when user is null', () => {
    useUserStore.setState({ user: null as never });
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('es-ES');

    const { result } = renderHook(() => useLanguage());

    expect(result.current.language).toBe('es');
  });
});
