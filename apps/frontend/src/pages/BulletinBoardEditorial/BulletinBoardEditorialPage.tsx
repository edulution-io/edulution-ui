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

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { BulletinBoardIcon } from '@/assets/icons';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID, NATIVE_APP_HEADER_ID } from '@libs/common/constants/pageElementIds';
import bulletinBoardEditorialTableColumns from '@/pages/BulletinBoardEditorial/BulletinBoardEditorialTableColumns';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoardEditorial/useBulletinBoardEditorialPageStore';
import BULLETIN_BOARD_EDITORIAL_PAGE_TABLE_HEADER from '@libs/bulletinBoard/constants/pageElementIds';
import APPS from '@libs/appconfig/constants/apps';
import BulletinBoardEditorialFloatingButtonsBar from '@/pages/BulletinBoardEditorial/BulletinBoardEditorialFloatingButtonsBar';
import DeleteBulletinsDialog from '@/pages/BulletinBoardEditorial/DeleteBulletinsDialog';
import CreateOrUpdateBulletinDialog from '@/pages/BulletinBoardEditorial/CreateOrUpdateBulletinDialog';

const BulletinBoardEditorialPage = () => {
  const { t } = useTranslation();

  const { bulletins, getCategories, getBulletins, isLoading, selectedRows, setSelectedRows } =
    useBulletinBoardEditorialStore();

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  const fetchBulletinData = async () => {
    await getCategories();
    await getBulletins();
  };

  useEffect(() => {
    void fetchBulletinData();
  }, []);

  return (
    <div>
      <NativeAppHeader
        title={t('bulletinboard.appTitle')}
        description={t('bulletinboard.description')}
        iconSrc={BulletinBoardIcon}
      />
      <ScrollableTable
        columns={bulletinBoardEditorialTableColumns}
        data={bulletins}
        filterKey="name"
        filterPlaceHolderText="bulletinboard.filterPlaceHolderText"
        onRowSelectionChange={handleRowSelectionChange}
        isLoading={isLoading}
        selectedRows={selectedRows}
        getRowId={(originalRow) => originalRow.id}
        applicationName={APPS.BULLETIN_BOARD}
        additionalScrollContainerOffset={20}
        scrollContainerOffsetElementIds={{
          tableHeaderId: BULLETIN_BOARD_EDITORIAL_PAGE_TABLE_HEADER,
          others: [NATIVE_APP_HEADER_ID, FLOATING_BUTTONS_BAR_ID, FOOTER_ID],
        }}
      />

      <BulletinBoardEditorialFloatingButtonsBar />
      <CreateOrUpdateBulletinDialog />
      <DeleteBulletinsDialog />
    </div>
  );
};

export default BulletinBoardEditorialPage;
