/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { useEffect, useState } from 'react';
import { Theme, ThemeType } from '@libs/common/types/theme';

const useTheme = (): ThemeType => {
  const readThemeFromDocument = (): ThemeType =>
    document.documentElement.classList.contains('dark') ? Theme.dark : Theme.light;

  const [theme, setTheme] = useState<ThemeType>(() => readThemeFromDocument());

  useEffect(() => {
    const mutationObserver = new MutationObserver(() => setTheme(readThemeFromDocument()));
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    const mediaQueryList = window.matchMedia?.('(prefers-color-scheme: dark)');

    const handlePrefersColorSchemeChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? Theme.dark : Theme.light);
    };

    if (mediaQueryList) {
      if (typeof mediaQueryList.addEventListener === 'function') {
        mediaQueryList.addEventListener('change', handlePrefersColorSchemeChange);
      } else if (typeof mediaQueryList.addListener === 'function') {
        mediaQueryList.addListener(handlePrefersColorSchemeChange);
      }
    }

    return () => {
      mutationObserver.disconnect();
      if (mediaQueryList) {
        if (typeof mediaQueryList.removeEventListener === 'function') {
          mediaQueryList.removeEventListener('change', handlePrefersColorSchemeChange);
        } else if (typeof mediaQueryList.removeListener === 'function') {
          mediaQueryList.removeListener(handlePrefersColorSchemeChange);
        }
      }
    };
  }, []);

  return theme;
};

export default useTheme;
