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

const { mockGetPublicTheme, mockApplyThemeColors, mockApplyBackgroundImage, mockGetThemeWithDefaults } = vi.hoisted(
  () => ({
    mockGetPublicTheme: vi.fn(),
    mockApplyThemeColors: vi.fn(),
    mockApplyBackgroundImage: vi.fn(),
    mockGetThemeWithDefaults: vi.fn().mockReturnValue({
      primary: '#000',
      secondary: '#111',
      ciLightGreen: '#222',
      ciLightBlue: '#333',
    }),
  }),
);

vi.mock('@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore', () => {
  const store = vi.fn(() => ({
    publicTheme: null,
    getPublicTheme: mockGetPublicTheme,
  }));
  store.getState = () => ({
    publicTheme: null,
    getPublicTheme: mockGetPublicTheme,
  });
  store.setState = vi.fn();
  store.subscribe = vi.fn();
  return { default: store };
});

vi.mock('@/store/useThemeStore', () => {
  const store = vi.fn((selector: (s: Record<string, unknown>) => unknown) =>
    selector({ getResolvedTheme: () => 'dark' }),
  );
  store.getState = () => ({ getResolvedTheme: () => 'dark' });
  store.setState = vi.fn();
  store.subscribe = vi.fn();
  return { default: store };
});

vi.mock('@/utils/applyThemeColors', () => ({ default: mockApplyThemeColors }));
vi.mock('@/utils/applyBackgroundImage', () => ({ default: mockApplyBackgroundImage }));
vi.mock('@/utils/getThemeWithDefaults', () => ({ default: mockGetThemeWithDefaults }));

import { renderHook } from '@testing-library/react';
import useThemeColors from './useThemeColors';

describe('useThemeColors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls getPublicTheme on mount', () => {
    renderHook(() => useThemeColors());

    expect(mockGetPublicTheme).toHaveBeenCalled();
  });

  it('calls applyThemeColors with theme defaults', () => {
    renderHook(() => useThemeColors());

    expect(mockGetThemeWithDefaults).toHaveBeenCalledWith(null);
    expect(mockApplyThemeColors).toHaveBeenCalledWith({
      primary: '#000',
      secondary: '#111',
      ciLightGreen: '#222',
      ciLightBlue: '#333',
    });
  });

  it('calls applyBackgroundImage with resolved theme', () => {
    renderHook(() => useThemeColors());

    expect(mockApplyBackgroundImage).toHaveBeenCalledWith('dark');
  });
});
