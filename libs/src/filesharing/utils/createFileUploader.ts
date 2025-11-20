/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { AxiosInstance, AxiosProgressEvent } from 'axios';
import { UploadItem } from '@libs/filesharing/types/uploadItem';
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
  onProgressUpdate: (fileItem: UploadItem, next: FileProgress) => void;
  onUploadingChange?: (fileItem: UploadItem, uploading: boolean) => void;
}

const createFileUploader = (createFileUploaderDependencies: CreateFileUploaderDependencies) => {
  const {
    httpClient,
    destinationPath,
    onProgressUpdate,
    onUploadingChange,
    uploadEndpointPath = `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.UPLOAD}`,
  } = createFileUploaderDependencies;

  return async function uploadSingleFile(fileItem: UploadItem): Promise<UploadResult> {
    const fileName = fileItem.name;

    let finalPath = destinationPath;

    if (fileItem.uploadPath) {
      const lastSlash = fileItem.uploadPath.lastIndexOf('/');
      finalPath = fileItem.uploadPath.substring(0, lastSlash + 1);
    }

    const url = buildOctetStreamUrl(uploadEndpointPath, finalPath, fileItem);

    const progress = createProgressHandler({
      fileSize: fileItem.size,
      setProgress: (next) => onProgressUpdate(fileItem, next),
    });

    onUploadingChange?.(fileItem, true);

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
      onUploadingChange?.(fileItem, false);
    }
  };
};

export default createFileUploader;
