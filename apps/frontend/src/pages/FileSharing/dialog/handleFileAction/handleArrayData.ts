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
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import eduApi from '@/api/eduApi';
import buildApiFilePathUrl from '@libs/filesharing/utils/buildApiFilePathUrl';
import FileActionType from '@libs/filesharing/types/fileActionType';
import PathChangeOrCreateProps from '@libs/filesharing/types/pathChangeOrCreateProps';
import buildApiDeletePathUrl from '@libs/filesharing/utils/buildApiDeletePathUrl';
import DeleteTargetType from '@libs/filesharing/types/deleteTargetType';

const handleDeleteItems = async (data: PathChangeOrCreateProps[], endpoint: string, httpMethod: HttpMethods) => {
  const promises = data
    .map((item) => getPathWithoutWebdav(item.path))
    .filter((filename) => filename !== undefined)
    .map((filename) =>
      eduApi[httpMethod](`${buildApiDeletePathUrl(endpoint, filename, DeleteTargetType.FILE_SERVER)}`),
    );

  return Promise.all(promises);
};

const handleArrayActions = async (data: PathChangeOrCreateProps[], endpoint: string, httpMethod: HttpMethods) => {
  const promises = data.map((item) => eduApi[httpMethod](buildApiFilePathUrl(endpoint, item.path), item));
  return Promise.all(promises);
};

const handleArrayData = async (
  action: FileActionType,
  endpoint: string,
  httpMethod: HttpMethods,
  data: PathChangeOrCreateProps[],
) => {
  if (action === FileActionType.DELETE_FILE_FOLDER) {
    await handleDeleteItems(data, endpoint, httpMethod);
  } else if (action === FileActionType.MOVE_FILE_FOLDER || action === FileActionType.RENAME_FILE_FOLDER) {
    await handleArrayActions(data, endpoint, httpMethod);
  }
};

export default handleArrayData;
