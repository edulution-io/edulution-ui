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

import { ThemeType } from '@libs/common/constants/theme';
import APPS from '@libs/appconfig/constants/apps';
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import FILE_ENDPOINTS from '@libs/filesystem/constants/endpoints';
import getSurveysDefaultLogoFilename from '@libs/survey/utils/getSurveysDefaultLogoFilename';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';

const getSurveysDefaultLogoUrl = (theme?: ThemeType) => {
  const fileName = getSurveysDefaultLogoFilename(theme || 'dark');
  return `${EDU_API_URL}/${EDU_API_CONFIG_ENDPOINTS.FILES}/public/${FILE_ENDPOINTS.FILE}/${APPS.SURVEYS}/${fileName}`;
};

export default getSurveysDefaultLogoUrl;
