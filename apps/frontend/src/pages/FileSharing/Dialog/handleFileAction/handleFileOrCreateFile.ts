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
  formData: FormData,
) => {
  if (
    action === FileActionType.UPLOAD_FILE ||
    action === FileActionType.CREATE_FILE ||
    action === FileActionType.SAVE_EXTERNAL_FILE
  ) {
    await eduApi[httpMethod](
      buildApiFileTypePathUrl(endpoint, type, getPathWithoutWebdav(formData.get('path') as string)),
      formData,
    );
  }
};

export default handleFileOrCreateFile;
