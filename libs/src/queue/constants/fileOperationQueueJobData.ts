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

import CollectFileJobData from '@libs/queue/types/collectFileJobData';
import FileJobData from '@libs/queue/types/fileJobData';
import DeleteFileJobData from '@libs/queue/types/deleteFileJobData';
import MoveOrRenameJobData from '@libs/queue/types/moveOrRenameJobData';
import UploadFileJobData from '@libs/queue/types/uploadFileJobData';
import CreateFolderJobData from '@libs/queue/types/createFolderJobData';

type FileOperationQueueJobData =
  | CollectFileJobData
  | FileJobData
  | DeleteFileJobData
  | MoveOrRenameJobData
  | CreateFolderJobData
  | UploadFileJobData;

export default FileOperationQueueJobData;
