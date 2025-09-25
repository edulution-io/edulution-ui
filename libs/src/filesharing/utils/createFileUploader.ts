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

import { AxiosInstance, AxiosProgressEvent } from 'axios';
import { UploadFile } from '@libs/filesharing/types/uploadFile';
import UploadResult from '@libs/filesharing/types/uploadResult';
import buildOctetStreamUrl from '@libs/filesharing/utils/buildOctetStreamUrl';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import createProgressHandler from '@libs/filesharing/utils/createProgressHandler';
import uploadOctetStream from '@libs/filesharing/utils/uploadOctetStream';
import FileProgress from '@libs/filesharing/types/fileProgress';

export interface CreateFileUploaderDependencies {
  httpClient: AxiosInstance;
  uploadEndpointPath?: string;
  destinationPath: string;
  onProgressUpdate: (fileName: string, next: FileProgress) => void;
  onUploadingChange?: (fileName: string, uploading: boolean) => void;
}

const createFileUploader = (dependencies: CreateFileUploaderDependencies) => {
  const {
    httpClient,
    destinationPath,
    onProgressUpdate,
    onUploadingChange,
    uploadEndpointPath = `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.UPLOAD}`,
  } = dependencies;

  return async function uploadSingleFile(fileItem: UploadFile): Promise<UploadResult> {
    const fileName = fileItem.name;

    const url = buildOctetStreamUrl(uploadEndpointPath, destinationPath, fileItem);

    const progress = createProgressHandler({
      fileSize: fileItem.size,
      setProgress: (next) => onProgressUpdate(fileName, next),
    });

    onUploadingChange?.(fileName, true);

    try {
      progress.markStart();
      await uploadOctetStream(httpClient, url, fileItem, (event: AxiosProgressEvent) => {
        progress.onUploadProgress(event);
      });
      progress.markDone();
      return { name: fileName, success: true };
    } catch (error) {
      progress.markError();
      return {
        name: fileName,
        success: false,
      };
    } finally {
      onUploadingChange?.(fileName, false);
    }
  };
};

export default createFileUploader;
