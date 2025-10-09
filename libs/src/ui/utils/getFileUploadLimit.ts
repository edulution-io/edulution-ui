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

import WEBDAV_SHARE_TYPE from '@libs/filesharing/constants/webdavShareType';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import MAX_FILE_UPLOAD_SIZE from '../constants/maxFileUploadSize';

const getFileUploadLimit = (webdavShares: WebdavShareDto[], webdavShare?: string): number => {
  const share = webdavShare ? webdavShares.find((s) => s.displayName === webdavShare) : undefined;

  return share?.type === WEBDAV_SHARE_TYPE.EDU_FILE_PROXY ? Infinity : MAX_FILE_UPLOAD_SIZE;
};

export default getFileUploadLimit;
