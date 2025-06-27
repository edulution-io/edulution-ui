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
import buildApiFileTypePathUrl from '@libs/filesharing/utils/buildApiFileTypePathUrl';
import eduApi from '@/api/eduApi';
import buildApiFilePathUrl from '@libs/filesharing/utils/buildApiFilePathUrl';
import PathChangeOrCreateProps from '@libs/filesharing/types/pathChangeOrCreateProps';

const handleSingleData = async (
  action: FileActionType,
  endpoint: string,
  httpMethod: HttpMethods,
  type: ContentType,
  data: PathChangeOrCreateProps,
) => {
  if (action === FileActionType.CREATE_FOLDER) {
    await eduApi[httpMethod](buildApiFileTypePathUrl(endpoint, type, data.path), data);
  } else if (action === FileActionType.MOVE_FILE_OR_FOLDER || action === FileActionType.RENAME_FILE_OR_FOLDER) {
    await eduApi[httpMethod](buildApiFilePathUrl(endpoint, data.path), data);
  }
};

export default handleSingleData;
