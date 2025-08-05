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

import { create, StoreApi, UseBoundStore } from 'zustand';
import { VeyonConfigTableStore } from '@libs/appconfig/types/veyonConfigTableStore';
import APPS from '@libs/appconfig/constants/apps';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import useAppConfigsStore from '../useAppConfigsStore';

const initialValues = {
  tableContentData: [],
  selectedConfig: null,
};

const useVeyonConfigTableStore: UseBoundStore<StoreApi<VeyonConfigTableStore>> = create<VeyonConfigTableStore>(
  (set) => ({
    ...initialValues,
    setSelectedConfig: (config) => set({ selectedConfig: config }),
    fetchTableContent: () => {
      const { appConfigs } = useAppConfigsStore.getState();
      const classMgmtConfig = appConfigs.find((config) => config.name === APPS.CLASS_MANAGEMENT);
      if (!classMgmtConfig || typeof classMgmtConfig.extendedOptions !== 'object') {
        set({ tableContentData: [] });
      } else {
        set({ tableContentData: classMgmtConfig.extendedOptions[ExtendedOptionKeys.VEYON_PROXYS] || [] });
      }
    },

    reset: () => set(initialValues),
  }),
);

export default useVeyonConfigTableStore;
