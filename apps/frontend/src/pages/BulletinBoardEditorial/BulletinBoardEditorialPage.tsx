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
import useAppConfigBulletinTableStore from '@/pages/BulletinBoard/useAppConfigBulletinTableStore';
import CreateOrUpdateBulletinDialog from '@/pages/BulletinBoardEditorial/CreateOrUpdateBulletinDialog';

const BulletinBoardEditorialPage = () => {
  const { t } = useTranslation();

  const { bulletins, getBulletins, isLoading, selectedRows, setSelectedRows } = useBulletinBoardEditorialStore();
  const { fetchData } = useAppConfigBulletinTableStore();

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  const fetchBulletinData = async () => {
    await fetchData();
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
