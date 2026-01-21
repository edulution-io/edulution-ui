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

import THEME from '@libs/common/constants/theme';
import ThemeType from '@libs/common/types/themeType';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import ASSET_TYPES from '@libs/appconfig/constants/assetTypes';
import AssetType from '@libs/appconfig/types/assetType';

export const getAssetName = (appName: string, theme: ThemeType = THEME.dark, assetType: AssetType = ASSET_TYPES.logo) =>
  `${appName}-custom-${assetType}-${theme}.webp`;

export const getFallbackAssetName = (
  appName: string,
  theme: ThemeType = THEME.dark,
  assetType: AssetType = ASSET_TYPES.logo,
) => `${appName}-default-${assetType}-${theme}.webp`;

export const getAssetUrl = (appName: string, theme: ThemeType = THEME.dark, assetType: AssetType = ASSET_TYPES.logo) =>
  `/${EDU_API_ROOT}/${EDU_API_CONFIG_ENDPOINTS.FILES}/public/assets/${appName}/${getAssetName(appName, theme, assetType)}?fallback=${getFallbackAssetName(appName, theme, assetType)}`;
