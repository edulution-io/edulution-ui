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

import THEME from '@libs/common/constants/theme';
import useThemeStore from './useThemeStore';

const mockClassList = {
  add: vi.fn(),
  remove: vi.fn(),
};

const mockAddEventListener = vi.fn();

const mockMatchMedia = vi.fn().mockReturnValue({
  matches: false,
  addEventListener: mockAddEventListener,
});

Object.defineProperty(window, 'matchMedia', { value: mockMatchMedia, writable: true });
Object.defineProperty(document.documentElement, 'classList', { value: mockClassList, writable: true });

const initialStoreState = useThemeStore.getState();

describe('useThemeStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useThemeStore.setState(initialStoreState, true);
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
    });
  });

  describe('initial state', () => {
    it('has system as default theme', () => {
      expect(useThemeStore.getState().theme).toBe(THEME.system);
    });
  });

  describe('setTheme', () => {
    it('sets theme to light', () => {
      useThemeStore.getState().setTheme(THEME.light);

      expect(useThemeStore.getState().theme).toBe(THEME.light);
      expect(mockClassList.add).toHaveBeenCalledWith(THEME.light);
      expect(mockClassList.remove).toHaveBeenCalledWith(THEME.dark);
    });

    it('sets theme to dark', () => {
      useThemeStore.getState().setTheme(THEME.dark);

      expect(useThemeStore.getState().theme).toBe(THEME.dark);
      expect(mockClassList.add).toHaveBeenCalledWith(THEME.dark);
      expect(mockClassList.remove).toHaveBeenCalledWith(THEME.light);
    });

    it('sets theme to system and resolves via matchMedia', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: mockAddEventListener,
      });

      useThemeStore.getState().setTheme(THEME.system);

      expect(useThemeStore.getState().theme).toBe(THEME.system);
      expect(mockClassList.add).toHaveBeenCalledWith(THEME.dark);
      expect(mockClassList.remove).toHaveBeenCalledWith(THEME.light);
    });

    it('resolves system to light when matchMedia prefers light', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: mockAddEventListener,
      });

      useThemeStore.getState().setTheme(THEME.system);

      expect(mockClassList.add).toHaveBeenCalledWith(THEME.light);
      expect(mockClassList.remove).toHaveBeenCalledWith(THEME.dark);
    });
  });

  describe('getResolvedTheme', () => {
    it('returns light when theme is light', () => {
      useThemeStore.setState({ theme: THEME.light });

      expect(useThemeStore.getState().getResolvedTheme()).toBe(THEME.light);
    });

    it('returns dark when theme is dark', () => {
      useThemeStore.setState({ theme: THEME.dark });

      expect(useThemeStore.getState().getResolvedTheme()).toBe(THEME.dark);
    });

    it('returns dark when theme is system and system prefers dark', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: mockAddEventListener,
      });
      useThemeStore.setState({ theme: THEME.system });

      expect(useThemeStore.getState().getResolvedTheme()).toBe(THEME.dark);
    });

    it('returns light when theme is system and system prefers light', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: mockAddEventListener,
      });
      useThemeStore.setState({ theme: THEME.system });

      expect(useThemeStore.getState().getResolvedTheme()).toBe(THEME.light);
    });
  });

  describe('applyTheme', () => {
    it('applies resolved theme to DOM', () => {
      useThemeStore.setState({ theme: THEME.dark });

      useThemeStore.getState().applyTheme();

      expect(mockClassList.add).toHaveBeenCalledWith(THEME.dark);
      expect(mockClassList.remove).toHaveBeenCalledWith(THEME.light);
    });
  });

  describe('initTheme', () => {
    it('applies theme and registers matchMedia listener', () => {
      useThemeStore.setState({ theme: THEME.light });

      useThemeStore.getState().initTheme();

      expect(mockClassList.add).toHaveBeenCalledWith(THEME.light);
      expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('matchMedia listener re-applies theme when theme is system', () => {
      useThemeStore.setState({ theme: THEME.system });
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: mockAddEventListener,
      });

      useThemeStore.getState().initTheme();

      const changeCallback = mockAddEventListener.mock.calls[0][1];
      mockClassList.add.mockClear();
      mockClassList.remove.mockClear();

      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: mockAddEventListener,
      });

      changeCallback();

      expect(mockClassList.add).toHaveBeenCalledWith(THEME.dark);
    });

    it('matchMedia listener does not re-apply when theme is not system', () => {
      useThemeStore.setState({ theme: THEME.light });
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: mockAddEventListener,
      });

      useThemeStore.getState().initTheme();

      const changeCallback = mockAddEventListener.mock.calls[0][1];
      mockClassList.add.mockClear();
      mockClassList.remove.mockClear();

      useThemeStore.setState({ theme: THEME.dark });

      changeCallback();

      expect(mockClassList.add).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('resets theme to system', () => {
      useThemeStore.setState({ theme: THEME.dark });

      useThemeStore.getState().reset();

      expect(useThemeStore.getState().theme).toBe(THEME.system);
    });
  });
});
