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
import { GoMoon, GoSun } from 'react-icons/go';
import useThemeStore from '@/store/useThemeStore';
import useMedia from '@/hooks/useMedia';

const ThemeToggle: React.FC = () => {
  const theme = useThemeStore((s) => s.theme);
  const resolvedTheme = useThemeStore((s) => s.getResolvedTheme());
  const setTheme = useThemeStore((s) => s.setTheme);
  const { isMobileView } = useMedia();

  if (isMobileView) {
    return null;
  }

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="absolute right-6 top-2 z-50 rounded-full bg-accent p-2 text-white shadow-xl transition hover:opacity-80 dark:text-secondary"
      aria-label="Toggle Theme"
    >
      {resolvedTheme === 'dark' ? <GoSun className="h-6 w-6" /> : <GoMoon className="h-6 w-6" />}
    </button>
  );
};

export default ThemeToggle;
