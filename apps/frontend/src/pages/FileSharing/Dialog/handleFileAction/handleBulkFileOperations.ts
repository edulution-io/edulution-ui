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
import FileActionType from '@libs/filesharing/types/fileActionType';
import PathChangeOrCreateDto from '@libs/filesharing/types/pathChangeOrCreateProps';
import buildApiDeletePathUrl from '@libs/filesharing/utils/buildApiDeletePathUrl';
import DeleteTargetType from '@libs/filesharing/types/deleteTargetType';
import { t } from 'i18next';

const handleDeleteItems = async (pathsToDelete: PathChangeOrCreateDto[], endpoint: string) => {
  await eduApi.delete(buildApiDeletePathUrl(endpoint, DeleteTargetType.FILE_SERVER), {
    data: {
      paths: pathsToDelete.map((item) => getPathWithoutWebdav(item.path)),
    },
  });
};

const sendBatchRequests = async (
  pathChangeOrCreateDtos: PathChangeOrCreateDto[],
  endpoint: string,
  httpMethod: HttpMethods,
) => {
  const promises = pathChangeOrCreateDtos.map((pathChangeOrCreateDto) =>
    eduApi[httpMethod](endpoint, pathChangeOrCreateDto),
  );
  return Promise.all(promises);
};

const handleBulkFileOperations = async (
  action: FileActionType,
  endpoint: string,
  httpMethod: HttpMethods,
  itemsToProcess: PathChangeOrCreateDto[],
  setFileOperationResult: (success: boolean | undefined, message: string, statusCode: number) => void,
) => {
  if (action === FileActionType.DELETE_FILE_FOLDER) {
    await handleDeleteItems(itemsToProcess, endpoint);
    setFileOperationResult(undefined, t('fileOperationSuccessful'), 200);
  } else if (action === FileActionType.MOVE_FILE_FOLDER || action === FileActionType.RENAME_FILE_FOLDER) {
    await sendBatchRequests(itemsToProcess, endpoint, httpMethod);
    setFileOperationResult(true, t('fileOperationSuccessful'), 200);
  }
};

export default handleBulkFileOperations;
