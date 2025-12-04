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

import { create, StateCreator } from 'zustand';
import eduApi from '@/api/eduApi';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import type { IConfig } from '@onlyoffice/document-editor-react';
import buildApiDeletePathUrl from '@libs/filesharing/utils/buildApiDeletePathUrl';
import DeleteTargetType from '@libs/filesharing/types/deleteTargetType';
import getLastPartOfUrl from '@libs/filesharing/utils/getLastPartOfUrl';
import handleApiError from '@/utils/handleApiError';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import delay from '@libs/common/utils/delay';

type FileEditorStore = {
  isFilePreviewDocked: boolean;
  setIsFilePreviewDocked: (isFilePreviewDocked: boolean) => void;
  isFilePreviewVisible: boolean;
  setIsFilePreviewVisible: (isVisible: boolean) => void;
  getOnlyOfficeJwtToken: (config: IConfig) => Promise<string>;
  deleteFileAfterEdit: (url: string) => Promise<void>;
  reset: () => void;
  error: Error | null;
  currentlyEditingFile: DirectoryFileDTO | null;
  filesToOpenInNewTab: DirectoryFileDTO[];
  addFileToOpenInNewTab: (fileToPreview: DirectoryFileDTO) => void;
  setCurrentlyEditingFile: (fileToPreview: DirectoryFileDTO | null) => void;
  resetCurrentlyEditingFile: (fileToPreview: DirectoryFileDTO | null) => Promise<void>;
};

const initialState = {
  isFilePreviewDocked: true,
  isFilePreviewVisible: false,
  currentlyEditingFile: null,
  filesToOpenInNewTab: [],
  error: null,
};

type PersistedFileEditorStore = (
  fileManagerData: StateCreator<FileEditorStore>,
  options: PersistOptions<Partial<FileEditorStore>>,
) => StateCreator<FileEditorStore>;

const useFileEditorStore = create<FileEditorStore>(
  (persist as PersistedFileEditorStore)(
    (set, get) => ({
      ...initialState,
      reset: () => set(initialState),

      setIsFilePreviewDocked: (isFilePreviewDocked) => set({ isFilePreviewDocked }),

      setIsFilePreviewVisible: (isFilePreviewVisible) => set({ isFilePreviewVisible }),

      deleteFileAfterEdit: async (url) => {
        try {
          await eduApi.delete(buildApiDeletePathUrl(FileSharingApiEndpoints.BASE, DeleteTargetType.LOCAL), {
            data: {
              paths: [getLastPartOfUrl(url)],
            },
          });
        } catch (error) {
          handleApiError(error, set);
        }
        return Promise.resolve();
      },

      getOnlyOfficeJwtToken: async (config) => {
        try {
          const response = await eduApi.post<string>(
            `${FileSharingApiEndpoints.FILESHARING_ACTIONS}/${FileSharingApiEndpoints.ONLY_OFFICE_TOKEN}`,
            JSON.stringify(config),
            {
              headers: {
                'Content-Type': RequestResponseContentType.APPLICATION_JSON,
              },
            },
          );
          return response.data;
        } catch (error) {
          handleApiError(error, set);
        }
        return Promise.resolve('');
      },

      addFileToOpenInNewTab: (file) => {
        const filteredFiles = get().filesToOpenInNewTab.filter((f) => f.etag !== file?.etag);
        set({ filesToOpenInNewTab: [...filteredFiles, file] });
      },

      setCurrentlyEditingFile: (file) => {
        set({ currentlyEditingFile: file });
      },

      resetCurrentlyEditingFile: async (file) => {
        set({ currentlyEditingFile: null });
        await delay(1);
        set({ currentlyEditingFile: file });
      },
    }),
    {
      name: 'filesharing-editor-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        filesToOpenInNewTab: state.filesToOpenInNewTab,
      }),
    },
  ),
);

export default useFileEditorStore;
