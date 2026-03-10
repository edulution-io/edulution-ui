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

const { mockUseMediaQuery } = vi.hoisted(() => ({
  mockUseMediaQuery: vi.fn(),
}));

vi.mock('usehooks-ts', () => ({
  useMediaQuery: mockUseMediaQuery,
}));

import { renderHook } from '@testing-library/react';
import useMedia from './useMedia';

describe('useMedia', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns isMobileView true and isTabletView false for mobile viewport', () => {
    mockUseMediaQuery.mockImplementation((query: string) => {
      if (query === '(max-width: 767px)') return true;
      return false;
    });

    const { result } = renderHook(() => useMedia());

    expect(result.current.isMobileView).toBe(true);
    expect(result.current.isTabletView).toBe(false);
  });

  it('returns isMobileView false and isTabletView true for tablet viewport', () => {
    mockUseMediaQuery.mockImplementation((query: string) => {
      if (query === '(min-width: 768px) and (max-width: 1023px)') return true;
      return false;
    });

    const { result } = renderHook(() => useMedia());

    expect(result.current.isMobileView).toBe(false);
    expect(result.current.isTabletView).toBe(true);
  });

  it('returns both false for desktop viewport', () => {
    mockUseMediaQuery.mockReturnValue(false);

    const { result } = renderHook(() => useMedia());

    expect(result.current.isMobileView).toBe(false);
    expect(result.current.isTabletView).toBe(false);
  });
});
