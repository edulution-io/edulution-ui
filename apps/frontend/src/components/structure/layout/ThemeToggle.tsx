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
import { createPortal } from 'react-dom';
import useThemeStore from '@/store/useThemeStore';
import { Button } from '@edulution-io/ui-kit';
import isDev from '@libs/common/constants/isDev';
import THEME from '@libs/common/constants/theme';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ThemeToggle: React.FC = () => {
  const theme = useThemeStore((s) => s.theme);
  const resolvedTheme = useThemeStore((s) => s.getResolvedTheme());
  const setTheme = useThemeStore((s) => s.setTheme);

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (theme === THEME.system) {
      setTheme(resolvedTheme === THEME.dark ? THEME.light : THEME.dark);
    } else {
      setTheme(theme === THEME.dark ? THEME.light : THEME.dark);
    }
  };

  if (!isDev) {
    return null;
  }

  return createPortal(
    <Button
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      variant="btn-outline"
      size="sm"
      className="fixed right-20 top-2 z-[9999] rounded-full border-none bg-accent p-2 shadow-lg"
    >
      {resolvedTheme === THEME.dark ? (
        <FontAwesomeIcon
          icon={faSun}
          className="h-5 w-5"
        />
      ) : (
        <FontAwesomeIcon
          icon={faMoon}
          className="h-5 w-5"
        />
      )}
    </Button>,
    document.body,
  );
};

export default ThemeToggle;
