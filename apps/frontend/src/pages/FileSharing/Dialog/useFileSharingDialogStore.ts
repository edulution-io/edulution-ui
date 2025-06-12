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

import { AxiosError } from 'axios';
import { create } from 'zustand';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import React from 'react';
import handleApiError from '@/utils/handleApiError';
import { WebDavActionResult } from '@libs/filesharing/types/fileActionStatus';
import { t } from 'i18next';
import { HttpMethods } from '@libs/common/types/http-methods';
import FileActionType from '@libs/filesharing/types/fileActionType';
import { TAvailableFileTypes } from '@libs/filesharing/types/availableFileTypesType';
import ContentType from '@libs/filesharing/types/contentType';
import handleFileOrCreateFile from '@/pages/FileSharing/Dialog/handleFileAction/handleFileOrCreateFile';
import handleBulkFileOperations from '@/pages/FileSharing/Dialog/handleFileAction/handleBulkFileOperations';
import handleSingleData from '@/pages/FileSharing/Dialog/handleFileAction/handleSingleData';
import PathChangeOrCreateDto from '@libs/filesharing/types/pathChangeOrCreateProps';
import DeleteFileProps from '@libs/filesharing/types/deleteFileProps';
import FileUploadProps from '@libs/filesharing/types/fileUploadProps';
import eduApi from '@/api/eduApi';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import buildApiDeletePathUrl from '@libs/filesharing/utils/buildApiDeletePathUrl';
import DeleteTargetType from '@libs/filesharing/types/deleteTargetType';
import PublicShareFileLinkProps from '@libs/filesharing/types/publicShareFileLinkProps';
import usePublicShareFilesStore from '@/pages/FileSharing/publicShareFiles/usePublicShareFilesStore';

interface FileSharingDialogStore {
  isDialogOpen: boolean;
  openDialog: (action: FileActionType) => void;
  closeDialog: () => void;
  isLoading: boolean;
  userInput: string;
  filesToUpload: File[];
  moveOrCopyItemToPath: DirectoryFileDTO;
  selectedFileType: TAvailableFileTypes | '';
  setMoveOrCopyItemToPath: (item: DirectoryFileDTO) => void;
  setIsLoading: (isLoading: boolean) => void;
  error: AxiosError | null;
  fileOperationStatus: boolean | undefined;
  isSubmitButtonDisabled: boolean;
  setError: (error: AxiosError) => void;
  reset: () => void;
  setSelectedFileType: (fileType: TAvailableFileTypes | '') => void;
  handleItemAction: (
    action: FileActionType,
    endpoint: string,
    httpMethod: HttpMethods,
    type: ContentType,
    data: PathChangeOrCreateDto | PathChangeOrCreateDto[] | FileUploadProps[] | DeleteFileProps[] | FormData,
  ) => Promise<void>;
  setFilesToUpload: React.Dispatch<React.SetStateAction<File[]>>;
  action: FileActionType;
  setAction: (action: FileActionType) => void;
  fileOperationResult: WebDavActionResult | undefined;
  setFileOperationResult: (fileOperationSuccessful: boolean | undefined, message: string, status: number) => void;
  setSubmitButtonIsDisabled: (isSubmitButtonActive: boolean) => void;
  handleDeleteItems: (itemsToDelete: PathChangeOrCreateDto[], endpoint: string) => Promise<void>;
}

const initialState: Partial<FileSharingDialogStore> = {
  isDialogOpen: false,
  isLoading: false,
  error: null,
  userInput: '',
  moveOrCopyItemToPath: {} as DirectoryFileDTO,
  selectedFileType: '',
  filesToUpload: [],
  isSubmitButtonDisabled: false,
};

const useFileSharingDialogStore = create<FileSharingDialogStore>((set, get) => ({
  ...(initialState as FileSharingDialogStore),
  openDialog: (action: FileActionType) =>
    set(() => ({
      isDialogOpen: true,
      action,
    })),
  closeDialog: () => set({ isDialogOpen: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),
  setFilesToUpload: (files) => set({ filesToUpload: typeof files === 'function' ? files(get().filesToUpload) : files }),
  setMoveOrCopyItemToPath: (path) => set({ moveOrCopyItemToPath: path }),
  setSubmitButtonIsDisabled: (isSubmitButtonDisabled) => set({ isSubmitButtonDisabled }),
  setSelectedFileType: (fileType) => set({ selectedFileType: fileType }),
  setFileOperationResult: (success, message = t('unknownErrorOccurred'), status = 500) => {
    const result: WebDavActionResult = { success, message, status };
    set({ fileOperationResult: result });

    setTimeout(() => {
      set({ fileOperationResult: undefined });
    }, 4000);
  },

  handleItemAction: async (
    action: FileActionType,
    endpoint: string,
    httpMethod: HttpMethods,
    type: ContentType,
    bulkDtos:
      | PathChangeOrCreateDto
      | PathChangeOrCreateDto[]
      | FileUploadProps[]
      | DeleteFileProps[]
      | PublicShareFileLinkProps
      | FormData,
  ) => {
    set({ isLoading: true });
    try {
      if (bulkDtos instanceof FormData) {
        await handleFileOrCreateFile(action, endpoint, httpMethod, type, bulkDtos);
        get().setFileOperationResult(true, t('fileCreateNewContent.fileOperationSuccessful'), 200);
      } else if (Array.isArray(bulkDtos)) {
        const decodedFilenameDtos = (bulkDtos as PathChangeOrCreateDto[]).map((dto) => ({
          ...dto,
          path: decodeURIComponent(dto.path),
          newPath: decodeURIComponent(dto.newPath),
        }));

        await handleBulkFileOperations(
          action,
          endpoint,
          httpMethod,
          decodedFilenameDtos,
          get().setFileOperationResult,
          get().handleDeleteItems,
        );
      } else {
        await handleSingleData(action, endpoint, httpMethod, type, bulkDtos);
        if (action === FileActionType.SHARE_FILE_OR_FOLDER) {
          get().setFileOperationResult(true, t('filesharing.publicFileSharing.success.PublicFileLinkCreated'), 200);
          const { fetchPublicShareFiles } = usePublicShareFilesStore.getState();
          await fetchPublicShareFiles();
        } else {
          get().setFileOperationResult(true, t('fileOperationSuccessful'), 200);
        }
      }
    } catch (error) {
      handleApiError(error, set);
      set({ isLoading: false, isDialogOpen: false });
    } finally {
      set({ isLoading: false, isDialogOpen: false, error: null });
    }
  },

  async handleDeleteItems(itemsToDelete: PathChangeOrCreateDto[], endpoint: string): Promise<void> {
    const cleanPaths = itemsToDelete.map((item) => getPathWithoutWebdav(item.path));
    const url = buildApiDeletePathUrl(endpoint, DeleteTargetType.FILE_SERVER);
    await eduApi.delete(url, { data: { paths: cleanPaths } });
  },
}));

export default useFileSharingDialogStore;
