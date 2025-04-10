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

import TABLE_CONFIG_MAP from '@/pages/Settings/AppConfig/components/table/tableConfigMap';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import { FileTableStore } from '@libs/appconfig/types/fileTableStore';
import type FileInfoDto from '@libs/appconfig/types/fileInfo.dto';
import createAppConfigTableEntry from './createAppConfigTableEntry';
import useFileTableStore from '../useFileTableStore';
import FileTableColumns from '../FileTableColumns';

const dynamicConfigs = createAppConfigTableEntry<FileInfoDto, FileTableStore>({
  columns: FileTableColumns,
  useStore: useFileTableStore,
  dialogBody: null,
  showAddButton: false,
  filterKey: 'filename',
  filterPlaceHolderText: 'filesharing.filterPlaceHolderText',
  type: ExtendedOptionKeys.EMBEDDED_PAGE_HTML_CONTENT,
  hideColumnsInMobileView: [],
  hideColumnsInTabletView: [],
});

const getAppConfigTableConfig = (appName: string, tableId: string) => {
  if (!(appName in TABLE_CONFIG_MAP)) {
    return dynamicConfigs;
  }

  return TABLE_CONFIG_MAP[appName as keyof typeof TABLE_CONFIG_MAP].filter(
    (tableConfig) => tableConfig.type === tableId,
  )[0];
};

export default getAppConfigTableConfig;
