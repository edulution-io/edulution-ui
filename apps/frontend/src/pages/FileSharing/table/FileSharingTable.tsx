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

import React from 'react';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import FileSharingTableColumns from '@/pages/FileSharing/table/FileSharingTableColumns';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import useFileSharingMenuConfig from '@/pages/FileSharing/useMenuConfig';
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID } from '@libs/common/constants/pageElementIds';
import { BREADCRUMB_ID } from '@libs/ui/constants/defaultIds';

const FileSharingTable = () => {
  const { setSelectedRows, setSelectedItems, selectedRows, files, isLoading } = useFileSharingStore();
  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(useFileSharingStore.getState().selectedRows)
        : updaterOrValue;
    setSelectedRows(newValue);
    const selectedItemData = Object.keys(newValue)
      .filter((key) => newValue[key])
      .map((rowId) => files.find((file) => file.filename === rowId))
      .filter(Boolean) as DirectoryFileDTO[];
    setSelectedItems(selectedItemData);
  };

  const { appName } = useFileSharingMenuConfig();

  return (
    <ScrollableTable
      columns={FileSharingTableColumns}
      data={files}
      filterKey="select-filename"
      filterPlaceHolderText="filesharing.filterPlaceHolderText"
      onRowSelectionChange={handleRowSelectionChange}
      isLoading={isLoading}
      selectedRows={selectedRows}
      getRowId={(row) => row.filename}
      applicationName={appName}
      additionalScrollContainerOffset={20}
      scrollContainerOffsetElementIds={{
        others: [BREADCRUMB_ID, FLOATING_BUTTONS_BAR_ID, FOOTER_ID],
      }}
    />
  );
};

export default FileSharingTable;
