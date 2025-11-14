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
