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

import { useEffect } from 'react';
import ThemeColors from '@libs/global-settings/types/themeColors';
import applyThemeColors from '@/utils/applyThemeColors';
import getThemeWithDefaults from '@/utils/getThemeWithDefaults';
import useGlobalSettingsApiStore from '@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore';

const useThemePreview = (previewTheme: ThemeColors | null) => {
  const { publicTheme } = useGlobalSettingsApiStore();

  useEffect(() => {
    if (!previewTheme) {
      return undefined;
    }

    const root = document.documentElement;
    applyThemeColors(previewTheme, root);

    return () => {
      const actualTheme = getThemeWithDefaults(publicTheme);
      applyThemeColors(actualTheme, root);
    };
  }, [previewTheme, publicTheme]);

  return null;
};

export default useThemePreview;
