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
import { HTTP_HEADERS, HttpMethods, RequestResponseContentType } from '@libs/common/types/http-methods';
import ContentType from '@libs/filesharing/types/contentType';
import eduApi from '@/api/eduApi';
import buildApiFileTypePathUrl from '@libs/filesharing/utils/buildApiFileTypePathUrl';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';

const handleFileOrCreateFile = async (
  endpoint: string,
  httpMethod: HttpMethods,
  type: ContentType,
  originalFormData: FormData,
) => {
  const rawPath = String(originalFormData.get('path') ?? originalFormData.get('currentPath') ?? '');
  const sanitizedPath = getPathWithoutWebdav(rawPath).replace(/^\/+/, ''); // "/a/b" -> "a/b"
  const encodedPath = encodeURIComponent(sanitizedPath);

  const file = originalFormData.get('file') as File | null;
  if (!file) throw new Error('No file provided for upload');

  const explicitName =
    (originalFormData.get('name') as string) ||
    (originalFormData.get('filename') as string) ||
    file.name ||
    'upload.bin';

  const originalFolderName = (originalFormData.get('originalFolderName') as string | null) || undefined;

  const baseUrl = buildApiFileTypePathUrl(`${endpoint}`, type, encodedPath);

  await eduApi[httpMethod](baseUrl, file, {
    withCredentials: true,
    params: {
      name: explicitName,
      isZippedFolder: false,
      ...(originalFolderName ? { originalFolderName } : {}),
      contentLength: file.size,
    },
    headers: {
      [HTTP_HEADERS.ContentType]: file.type || RequestResponseContentType.APPLICATION_OCTET_STREAM,
    },
  });
};

export default handleFileOrCreateFile;
