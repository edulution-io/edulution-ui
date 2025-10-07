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

import { HttpMethods } from '@libs/common/types/http-methods';
import ContentType from '@libs/filesharing/types/contentType';
import eduApi from '@/api/eduApi';

const handleFileOrCreateFile = async (
  endpoint: string,
  httpMethod: HttpMethods,
  type: ContentType,
  originalFormData: FormData,
  webdavShare: string | undefined,
) => {
  const path = String(originalFormData.get('path') ?? '');

  const file = originalFormData.get('file') as File | null;
  const filenameFromForm =
    (originalFormData.get('name') as string) || (originalFormData.get('filename') as string) || file?.name || '';

  await eduApi[httpMethod](endpoint, originalFormData, {
    params: {
      share: webdavShare,
      type,
      path,
      name: filenameFromForm,
    },
    withCredentials: true,
  });
};

export default handleFileOrCreateFile;
