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

import { ColumnDef } from '@tanstack/react-table';
import { StoreApi, UseBoundStore } from 'zustand';
import React from 'react';
import AppConfigTable from '@libs/bulletinBoard/types/appConfigTable';
import { ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';

interface AppConfigTableEntry<DataType, StoreType extends AppConfigTable<DataType>> {
  columns: ColumnDef<DataType>[];
  useStore: UseBoundStore<StoreApi<StoreType>>;
  dialogBody: React.JSX.Element;
  showAddButton: boolean;
  filterKey: string;
  filterPlaceHolderText: string;
  type: ExtendedOptionKeysType;
  hideColumnsInMobileView: string[];
  hideColumnsInTabletView: string[];
}

export default AppConfigTableEntry;
