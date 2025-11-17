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

import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import { ThemeType } from '@libs/common/constants/theme';

type ResetAppLogoProps = {
  appName: string;
  variant: ThemeType;
};

const resetAppLogo = async ({ appName, variant }: ResetAppLogoProps) => {
  try {
    const url = `${EDU_API_CONFIG_ENDPOINTS.FILES}/public/logo/${appName}/${variant}`;
    await eduApi.delete<void>(url);
  } catch (err: unknown) {
    if (err instanceof Error) {
      handleApiError(err, () => {});
    } else {
      handleApiError(new Error('Unknown deletion error'), () => {});
    }
  }
};

export default resetAppLogo;
