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

import FileActionType from '@libs/filesharing/types/fileActionType';
import { HttpMethods } from '@libs/common/types/http-methods';
import ContentType from '@libs/filesharing/types/contentType';
import eduApi from '@/api/eduApi';
import buildApiFileTypePathUrl from '@libs/filesharing/utils/buildApiFileTypePathUrl';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';

const handleFileOrCreateFile = async (
  action: FileActionType,
  endpoint: string,
  httpMethod: HttpMethods,
  type: ContentType,
  originalFormData: FormData,
) => {
  if (action !== FileActionType.UPLOAD_FILE && action !== FileActionType.CREATE_FILE) return;

  if (action === FileActionType.UPLOAD_FILE) {
    const file = originalFormData.get('file') as File;
    const path = originalFormData.get('path') as string;
    const uploadFileDto = originalFormData.get('uploadFileDto');

    const formData = new FormData();
    if (uploadFileDto) formData.append('uploadFileDto', uploadFileDto as string);
    formData.append('path', path);
    formData.append('size', String(file.size));
    formData.append('file', file, file.name);

    await eduApi[httpMethod](buildApiFileTypePathUrl(endpoint, type, path), formData, {
      params: { showUploadProgress: true },
      headers: { 'x-file-size': String(file.size) },
    });
  } else {
    await eduApi[httpMethod](
      buildApiFileTypePathUrl(endpoint, type, getPathWithoutWebdav(originalFormData.get('path') as string)),
      originalFormData,
    );
  }
};

export default handleFileOrCreateFile;
