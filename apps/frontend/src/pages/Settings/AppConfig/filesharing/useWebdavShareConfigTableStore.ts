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
import { WebdavShareTableStore } from '@libs/appconfig/types/webdavShareTableStore';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';

const initialValues = {
  tableContentData: [
    {
      url: 'https://server.73.dev.multi.schule/webdav',
      accessGroups: [{ name: 'role-teachers' }] as MultipleSelectorGroup[],
    },
    { url: 'http://10.0.0.29/webdav', accessGroups: [{ name: 'role-teachers' }] as MultipleSelectorGroup[] },
  ],
  selectedConfig: null,
};

const useWebdavShareConfigTableStore: UseBoundStore<StoreApi<WebdavShareTableStore>> = create<WebdavShareTableStore>(
  (set) => ({
    ...initialValues,
    setSelectedConfig: (config) => set({ selectedConfig: config }),
    fetchTableContent: () => {},

    reset: () => set(initialValues),
  }),
);

export default useWebdavShareConfigTableStore;
