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
import buildApiFileTypePathUrl from '@libs/filesharing/utils/buildApiFileTypePathUrl';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';

function withQuery(url: string, params: Record<string, string | number | boolean | undefined>) {
  const u = new URL(url, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
  });
  return u.toString();
}

const handleFileOrCreateFile = async (
  endpoint: string,
  httpMethod: HttpMethods,
  type: ContentType,
  originalFormData: FormData,
) => {
  const rawPath = String(originalFormData.get('path') ?? '');
  const sanitizedPath = getPathWithoutWebdav(rawPath);
  const baseUrl = buildApiFileTypePathUrl(`/edu-api/${  endpoint}`, type, sanitizedPath);

  const filename = (originalFormData.get('file') as File | null)?.name ?? '';

  const url = withQuery(baseUrl, {
    name: filename,
    declaredSize: (originalFormData.get('file') as File | null)?.size,
  });

  await eduApi[httpMethod](url, originalFormData);
};

export default handleFileOrCreateFile;
