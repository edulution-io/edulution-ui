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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn(),
  };
});

import { renderHook } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import useFooterColors from './useFooterColors';

const mockUseLocation = vi.mocked(useLocation);

describe('useFooterColors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFrameStore.setState({ footerColorsByAppName: {} });
  });

  it('returns footer colors for the current app based on pathname', () => {
    const colors = { color: '#fff', background: '#000' };
    useFrameStore.setState({ footerColorsByAppName: { mail: colors } as never });
    mockUseLocation.mockReturnValue({ pathname: '/mail/inbox', search: '', hash: '', state: null, key: '' });

    const { result } = renderHook(() => useFooterColors());

    expect(result.current).toEqual(colors);
  });

  it('returns null when no footer colors exist for the current app', () => {
    useFrameStore.setState({ footerColorsByAppName: {} });
    mockUseLocation.mockReturnValue({ pathname: '/chat', search: '', hash: '', state: null, key: '' });

    const { result } = renderHook(() => useFooterColors());

    expect(result.current).toBeNull();
  });

  it('extracts root path segment correctly from nested pathname', () => {
    const colors = { color: '#123', background: '#456' };
    useFrameStore.setState({ footerColorsByAppName: { conferences: colors } as never });
    mockUseLocation.mockReturnValue({
      pathname: '/conferences/room/123',
      search: '',
      hash: '',
      state: null,
      key: '',
    });

    const { result } = renderHook(() => useFooterColors());

    expect(result.current).toEqual(colors);
  });
});
