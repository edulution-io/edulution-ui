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

import type { AxiosInstance, AxiosProgressEvent } from 'axios';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';

const uploadOctetStream = async (
  api: AxiosInstance,
  url: string,
  fileBody: Blob,
  onUploadProgress?: (e: AxiosProgressEvent) => void,
): Promise<void> => {
  await api.post(url, fileBody, {
    withCredentials: true,
    headers: {
      [HTTP_HEADERS.ContentType]: fileBody.type || RequestResponseContentType.APPLICATION_OCTET_STREAM,
    },
    onUploadProgress,
    timeout: Infinity,
    maxBodyLength: Infinity,
  });
};

export default uploadOctetStream;
