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

import WEBDAV_SHARE_TYPE from '../constants/webdavShareType';
import { DirectoryFileDTO } from '../types/directoryFileDTO';
import WebdavShareType from '../types/webdavShareType';

const processWebdavResponse = (response: DirectoryFileDTO[], webdavShareType: WebdavShareType) => {
  let data = response;
  if (webdavShareType === WEBDAV_SHARE_TYPE.EDU_FILE_PROXY) {
    data = data.slice(1);
  }
  data = data.sort((a, b) => a.filename.localeCompare(b.filename));
  return data;
};

export default processWebdavResponse;
