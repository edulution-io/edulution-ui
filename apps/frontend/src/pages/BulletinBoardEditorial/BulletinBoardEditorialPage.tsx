import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { BulletinBoardIcon } from '@/assets/icons';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID, NATIVE_APP_HEADER_ID } from '@libs/common/constants/pageElementIds';
import bulletinBoardEditorialTableColumns from '@/pages/BulletinBoardEditorial/BulletinBoardEditorialTableColumns';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoardEditorial/BulletinBoardEditorialPageStore';
import useBulletinBoardEditorialPageMenu from '@/pages/BulletinBoardEditorial/useBulletinBoardEditorialPageMenu';
import BULLETIN_BOARD_EDITORIAL_PAGE_TABLE_HEADER from '@libs/bulletinBoard/constants/pageElementIds';

const BulletinBoardEditorialPage = () => {
  const { t } = useTranslation();

  const { bulletins, getBulletins, isLoading, selectedRows, setSelectedRows } = useBulletinBoardEditorialStore();

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  useEffect(() => {
    void getBulletins();
  }, []);

  const { appName } = useBulletinBoardEditorialPageMenu();

  return (
    <div>
      <NativeAppHeader
        title={t('bulletinboard.title')}
        description={t('bulletinboard.description')}
        iconSrc={BulletinBoardIcon}
      />
      <ScrollableTable
        columns={bulletinBoardEditorialTableColumns}
        data={bulletins}
        onRowSelectionChange={handleRowSelectionChange}
        isLoading={isLoading}
        selectedRows={selectedRows}
        getRowId={(originalRow) => originalRow.id}
        applicationName={appName}
        additionalScrollContainerOffset={20}
        scrollContainerOffsetElementIds={{
          tableHeaderId: BULLETIN_BOARD_EDITORIAL_PAGE_TABLE_HEADER,
          others: [NATIVE_APP_HEADER_ID, FLOATING_BUTTONS_BAR_ID, FOOTER_ID],
        }}
      />
    </div>
  );
};

export default BulletinBoardEditorialPage;
