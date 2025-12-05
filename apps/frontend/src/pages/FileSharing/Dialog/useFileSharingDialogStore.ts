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

import { AxiosError } from 'axios';
import { create } from 'zustand';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
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
import buildApiDeletePathUrl from '@libs/filesharing/utils/buildApiDeletePathUrl';
import DeleteTargetType from '@libs/filesharing/types/deleteTargetType';

interface FileSharingDialogStore {
  isDialogOpen: boolean;
  openDialog: (action: FileActionType) => void;
  closeDialog: () => void;
  isLoading: boolean;
  userInput: string;
  moveOrCopyItemToPath: DirectoryFileDTO;
  selectedFileType: TAvailableFileTypes | '';
  customExtension: string;
  setMoveOrCopyItemToPath: (item: DirectoryFileDTO) => void;
  setIsLoading: (isLoading: boolean) => void;
  error: AxiosError | null;
  fileOperationStatus: boolean | undefined;
  isSubmitButtonDisabled: boolean;
  setError: (error: AxiosError) => void;
  reset: () => void;
  setSelectedFileType: (fileType: TAvailableFileTypes | '') => void;
  setCustomExtension: (extension: string) => void;
  handleItemAction: (
    action: FileActionType,
    endpoint: string,
    httpMethod: HttpMethods,
    type: ContentType,
    data: PathChangeOrCreateDto | PathChangeOrCreateDto[] | FileUploadProps[] | DeleteFileProps[] | FormData,
    webdavShare: string | undefined,
  ) => Promise<void>;
  action: FileActionType;
  setAction: (action: FileActionType) => void;
  fileOperationResult: WebDavActionResult | undefined;
  setFileOperationResult: (fileOperationSuccessful: boolean | undefined, message: string, status: number) => void;
  setSubmitButtonIsDisabled: (isSubmitButtonActive: boolean) => void;
  handleDeleteItems: (
    itemsToDelete: PathChangeOrCreateDto[],
    endpoint: string,
    share: string | undefined,
  ) => Promise<void>;
}

const initialState: Partial<FileSharingDialogStore> = {
  isDialogOpen: false,
  isLoading: false,
  error: null,
  userInput: '',
  moveOrCopyItemToPath: {} as DirectoryFileDTO,
  selectedFileType: '',
  customExtension: '',
  isSubmitButtonDisabled: false,
};

const useFileSharingDialogStore = create<FileSharingDialogStore>((set, get) => ({
  ...(initialState as FileSharingDialogStore),
  openDialog: (action: FileActionType) =>
    set(() => ({
      isDialogOpen: true,
      action,
    })),
  closeDialog: () =>
    set({
      isDialogOpen: false,
    }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),
  setMoveOrCopyItemToPath: (path) => set({ moveOrCopyItemToPath: path }),
  setSubmitButtonIsDisabled: (isSubmitButtonDisabled) => set({ isSubmitButtonDisabled }),
  setSelectedFileType: (fileType) => set({ selectedFileType: fileType }),
  setCustomExtension: (extension) => set({ customExtension: extension }),
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
    bulkDtos: PathChangeOrCreateDto | PathChangeOrCreateDto[] | FileUploadProps[] | DeleteFileProps[] | FormData,
    webdavShare,
  ) => {
    set({ isLoading: true });
    try {
      if (bulkDtos instanceof FormData) {
        await handleFileOrCreateFile(endpoint, httpMethod, type, bulkDtos, webdavShare);
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
          webdavShare,
          get().setFileOperationResult,
          get().handleDeleteItems,
        );
      } else {
        await handleSingleData(action, endpoint, httpMethod, type, bulkDtos, webdavShare);
        get().setFileOperationResult(true, t('fileOperationSuccessful'), 200);
      }
    } catch (error) {
      handleApiError(error, set);
      set({ isLoading: false, isDialogOpen: false });
    } finally {
      set({ isLoading: false, isDialogOpen: false, error: null });
    }
  },

  async handleDeleteItems(
    itemsToDelete: PathChangeOrCreateDto[],
    endpoint: string,
    share: string | undefined,
  ): Promise<void> {
    const cleanPaths = itemsToDelete.map((item) => item.path);
    const url = buildApiDeletePathUrl(endpoint, DeleteTargetType.FILE_SERVER);
    await eduApi.delete(url, { data: { paths: cleanPaths }, params: { share } });
  },
}));

export default useFileSharingDialogStore;
