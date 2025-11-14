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

import { Theme, ThemeType } from '@libs/common/constants/theme';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';

const getAppLogoServeUrl = (appName: string, theme?: ThemeType) =>
  `/${EDU_API_ROOT}/${EDU_API_CONFIG_ENDPOINTS.FILES}/public/logo/${appName}/${theme || Theme.dark}`;

export default getAppLogoServeUrl;
