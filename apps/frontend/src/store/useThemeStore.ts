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
import ThemeType, { ResolvedThemeType } from '@libs/common/types/themeType';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

interface ThemeStore {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  getResolvedTheme: () => ResolvedThemeType;
  applyTheme: () => void;
  initTheme: () => void;
}

type PersistedThemeStore = (
  config: StateCreator<ThemeStore>,
  options: PersistOptions<Partial<ThemeStore>>,
) => StateCreator<ThemeStore>;

const getSystemTheme = (): ResolvedThemeType =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? THEME.dark : THEME.light;

const applyThemeToDOM = (resolvedTheme: ResolvedThemeType) => {
  const root = document.documentElement;
  if (resolvedTheme === THEME.dark) {
    root.classList.add(THEME.dark);
    root.classList.remove(THEME.light);
  } else {
    root.classList.add(THEME.light);
    root.classList.remove(THEME.dark);
  }
};

const useThemeStore = create<ThemeStore>(
  (persist as PersistedThemeStore)(
    (set, get) => ({
      theme: THEME.dark,

      setTheme: (theme) => {
        set({ theme });
        const resolved = theme === THEME.system ? getSystemTheme() : theme;
        applyThemeToDOM(resolved);
      },

      getResolvedTheme: () => {
        const { theme } = get();
        if (theme === THEME.system) {
          return getSystemTheme();
        }
        return theme;
      },

      applyTheme: () => {
        const resolved = get().getResolvedTheme();
        applyThemeToDOM(resolved);
      },

      initTheme: () => {
        const { applyTheme } = get();
        applyTheme();

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
          if (get().theme === THEME.system) {
            applyTheme();
          }
        });
      },
    }),
    {
      name: 'theme',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);

export default useThemeStore;
