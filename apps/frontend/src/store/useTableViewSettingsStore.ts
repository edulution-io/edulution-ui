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

import APPS from '@libs/appconfig/constants/apps';
import VIEW_MODE from '@libs/common/constants/viewMode';
import ViewModeType from '@libs/common/types/viewModeType';
import FILE_CATEGORIES from '@libs/filesharing/constants/fileCategories';
import type { FileCategory, FileCategoryFilters } from '@libs/filesharing/types/fileCategory';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

interface TableViewSettingsStore {
  viewModes: Record<string, ViewModeType>;
  showSystemFiles: Record<string, boolean>;
  showHiddenFiles: Record<string, boolean>;
  fileCategoryFilters: Record<string, FileCategoryFilters>;
  setViewMode: (key: string, mode: ViewModeType) => void;
  setShowSystemFiles: (key: string, enabled: boolean) => void;
  setShowHiddenFiles: (key: string, enabled: boolean) => void;
  setFileCategoryFilter: (appKey: string, category: FileCategory, enabled: boolean) => void;
  getFileCategoryFilters: (appKey: string) => FileCategoryFilters;
  getViewMode: (key: string) => ViewModeType;
  reset: () => void;
}

type PersistedTableViewSettingsStore = (
  config: StateCreator<TableViewSettingsStore>,
  options: PersistOptions<Partial<TableViewSettingsStore>>,
) => StateCreator<TableViewSettingsStore>;

const defaultFileCategoryFilters: FileCategoryFilters = {
  [FILE_CATEGORIES.FOLDER]: true,
  [FILE_CATEGORIES.DOCUMENT]: true,
  [FILE_CATEGORIES.SPREADSHEET]: true,
  [FILE_CATEGORIES.PRESENTATION]: true,
  [FILE_CATEGORIES.IMAGE]: true,
  [FILE_CATEGORIES.VIDEO]: true,
  [FILE_CATEGORIES.AUDIO]: true,
  [FILE_CATEGORIES.ACROBAT]: true,
  [FILE_CATEGORIES.COMPRESSED]: true,
  [FILE_CATEGORIES.CODE]: true,
  [FILE_CATEGORIES.VECTOR]: true,
};

const initialValues = {
  viewModes: {},
  showSystemFiles: { [APPS.FILE_SHARING]: false },
  showHiddenFiles: { [APPS.FILE_SHARING]: false },
  fileCategoryFilters: { [APPS.FILE_SHARING]: defaultFileCategoryFilters },
};

const useTableViewSettingsStore = create<TableViewSettingsStore>(
  (persist as PersistedTableViewSettingsStore)(
    (set, get) => ({
      ...initialValues,

      setViewMode: (key, mode) => {
        set((state) => ({
          viewModes: {
            ...state.viewModes,
            [key]: mode,
          },
        }));
      },

      getViewMode: (key) => {
        const { viewModes } = get();
        return viewModes[key] ?? VIEW_MODE.table;
      },

      setShowSystemFiles: (key, enabled) => {
        set((state) => ({
          showSystemFiles: {
            ...state.showSystemFiles,
            [key]: enabled,
          },
        }));
      },

      setShowHiddenFiles: (key, enabled) => {
        set((state) => ({
          showHiddenFiles: {
            ...state.showHiddenFiles,
            [key]: enabled,
          },
        }));
      },

      setFileCategoryFilter: (appKey, category, enabled) => {
        set((state) => ({
          fileCategoryFilters: {
            ...state.fileCategoryFilters,
            [appKey]: {
              ...(state.fileCategoryFilters[appKey] ?? defaultFileCategoryFilters),
              [category]: enabled,
            },
          },
        }));
      },

      getFileCategoryFilters: (appKey) => {
        const { fileCategoryFilters } = get();
        return fileCategoryFilters[appKey] ?? defaultFileCategoryFilters;
      },

      reset: () => set(initialValues),
    }),
    {
      name: 'view-mode',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        viewModes: state.viewModes,
        showSystemFiles: state.showSystemFiles,
        showHiddenFiles: state.showHiddenFiles,
        fileCategoryFilters: state.fileCategoryFilters,
      }),
    },
  ),
);

export default useTableViewSettingsStore;
