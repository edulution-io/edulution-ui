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
import handleFileOrCreateFile from '@/pages/FileSharing/dialog/handleFileAction/handleFileOrCreateFile';
import handleArrayData from '@/pages/FileSharing/dialog/handleFileAction/handleArrayData';
import handleSingleData from '@/pages/FileSharing/dialog/handleFileAction/handleSingleData';
import PathChangeOrCreateProps from '@libs/filesharing/types/pathChangeOrCreateProps';
import DeleteFileProps from '@libs/filesharing/types/deleteFileProps';
import FileUploadProps from '@libs/filesharing/types/fileUploadProps';

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
  isSubmitButtonInActive: boolean;
  setError: (error: AxiosError) => void;
  reset: () => void;
  setSelectedFileType: (fileType: TAvailableFileTypes | '') => void;
  handleItemAction: (
    action: FileActionType,
    endpoint: string,
    httpMethod: HttpMethods,
    type: ContentType,
    data: PathChangeOrCreateProps | PathChangeOrCreateProps[] | FileUploadProps[] | DeleteFileProps[] | FormData,
  ) => Promise<void>;
  setFilesToUpload: React.Dispatch<React.SetStateAction<File[]>>;
  action: FileActionType;
  setAction: (action: FileActionType) => void;
  fileOperationResult: WebDavActionResult | undefined;
  setFileOperationResult: (fileOperationSuccessful: boolean, message: string, status: number) => void;
  setSubmitButtonIsInActive: (isSubmitButtonActive: boolean) => void;
}

const initialState: Partial<FileSharingDialogStore> = {
  isDialogOpen: false,
  isLoading: false,
  error: null,
  userInput: '',
  moveOrCopyItemToPath: {} as DirectoryFileDTO,
  selectedFileType: '',
  filesToUpload: [],
  isSubmitButtonInActive: false,
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
  setSubmitButtonIsInActive: (isSubmitButtonInActive) => set({ isSubmitButtonInActive }),
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
    data: PathChangeOrCreateProps | PathChangeOrCreateProps[] | FileUploadProps[] | DeleteFileProps[] | FormData,
  ) => {
    set({ isLoading: true });

    try {
      if (data instanceof FormData) {
        await handleFileOrCreateFile(action, endpoint, httpMethod, type, data);
        get().setFileOperationResult(true, t('fileOperationSuccessful'), 200);
      } else if (Array.isArray(data)) {
        await handleArrayData(action, endpoint, httpMethod, data as PathChangeOrCreateProps[]);
        get().setFileOperationResult(true, t('fileOperationSuccessful'), 200);
      } else {
        await handleSingleData(action, endpoint, httpMethod, type, data);
        get().setFileOperationResult(true, t('fileOperationSuccessful'), 200);
      }
    } catch (error) {
      handleApiError(error, set);
      set({ isLoading: false, isDialogOpen: false });
    } finally {
      set({ isLoading: false, isDialogOpen: false, error: null });
    }
  },
}));

export default useFileSharingDialogStore;
