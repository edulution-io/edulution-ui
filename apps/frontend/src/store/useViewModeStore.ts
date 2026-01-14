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

import VIEW_MODE from '@libs/common/constants/viewMode';
import ViewModeType from '@libs/common/types/viewModeType';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

interface ViewModeStore {
  viewModes: Record<string, ViewModeType>;
  setViewMode: (key: string, mode: ViewModeType) => void;
  getViewMode: (key: string) => ViewModeType;
}

type PersistedViewModeStore = (
  config: StateCreator<ViewModeStore>,
  options: PersistOptions<Partial<ViewModeStore>>,
) => StateCreator<ViewModeStore>;

const useViewModeStore = create<ViewModeStore>(
  (persist as PersistedViewModeStore)(
    (set, get) => ({
      viewModes: {},

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
        return viewModes[key] || VIEW_MODE.table;
      },
    }),
    {
      name: 'view-mode',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ viewModes: state.viewModes }),
    },
  ),
);

export default useViewModeStore;
