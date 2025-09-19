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

import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import getFrontEndUrl from '@libs/common/utils/URL/getFrontEndUrl';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';

interface CallbackBaseUrlProps {
  fileName: string;
  filePath: string;
  token: string;
  share: string | undefined;
}

const getCallbackBaseUrl = ({ fileName, filePath, token, share }: CallbackBaseUrlProps): string =>
  `${getFrontEndUrl()}/${EDU_API_ROOT}/${FileSharingApiEndpoints.BASE}/callback?path=${filePath}&filename=${fileName}&share=${share}&token=${token}`;

export default getCallbackBaseUrl;
