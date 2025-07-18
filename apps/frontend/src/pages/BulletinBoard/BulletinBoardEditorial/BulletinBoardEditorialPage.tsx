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

import React, { useEffect, useMemo } from 'react';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import bulletinBoardEditorialTableColumns from '@/pages/BulletinBoard/BulletinBoardEditorial/BulletinBoardEditorialTableColumns';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoard/BulletinBoardEditorial/useBulletinBoardEditorialStore';
import APPS from '@libs/appconfig/constants/apps';
import DeleteBulletinsDialog from '@/pages/BulletinBoard/BulletinBoardEditorial/DeleteBulletinsDialog';
import CreateOrUpdateBulletinDialog from '@/pages/BulletinBoard/BulletinBoardEditorial/CreateOrUpdateBulletinDialog';
import useMedia from '@/hooks/useMedia';
import BULLETIN_BOARD_EDITORIAL_TABLE_COLUMNS from '@libs/bulletinBoard/constants/bulletinBoardEditorialTableColumns';

const BulletinBoardEditorialPage = () => {
  const { isMobileView, isTabletView } = useMedia();
  const { bulletins, getBulletins, isLoading, selectedRows, setSelectedRows } = useBulletinBoardEditorialStore();

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  useEffect(() => {
    void getBulletins();
  }, []);

  const initialColumnVisibility = useMemo(
    () => ({
      [BULLETIN_BOARD_EDITORIAL_TABLE_COLUMNS.CATEGORY]: !isMobileView,
      [BULLETIN_BOARD_EDITORIAL_TABLE_COLUMNS.IS_VISIBLE_START_DATE]: !isMobileView,
      [BULLETIN_BOARD_EDITORIAL_TABLE_COLUMNS.IS_VISIBLE_END_DATE]: !(isMobileView || isTabletView),
    }),
    [isMobileView, isTabletView],
  );

  return (
    <>
      <ScrollableTable
        columns={bulletinBoardEditorialTableColumns}
        data={bulletins}
        filterKey={BULLETIN_BOARD_EDITORIAL_TABLE_COLUMNS.NAME}
        filterPlaceHolderText="bulletinboard.filterPlaceHolderText"
        onRowSelectionChange={handleRowSelectionChange}
        isLoading={isLoading}
        selectedRows={selectedRows}
        getRowId={(originalRow) => originalRow.id}
        applicationName={APPS.BULLETIN_BOARD}
        initialColumnVisibility={initialColumnVisibility}
      />

      <CreateOrUpdateBulletinDialog />
      <DeleteBulletinsDialog />
    </>
  );
};

export default BulletinBoardEditorialPage;
