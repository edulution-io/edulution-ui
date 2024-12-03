import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import NativeAppHeader from '@/components/layout/NativeAppHeader';
import { BulletinBoardIcon } from '@/assets/icons';
import useUserStore from '@/store/UserStore/UserStore';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import CONFERENCES_PAGE_TABLE_HEADER from '@libs/conferences/constants/pageElementIds';
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID, NATIVE_APP_HEADER_ID } from '@libs/common/constants/pageElementIds';
import bulletinBoardEditorialTableColumns from '@/pages/BulletinBoardEditorial/BulletinBoardEditorialTableColumns';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoardEditorial/BulletinBoardEditorialPageStore';
import useBulletinBoardEditorialPageMenu from '@/pages/BulletinBoardEditorial/useBulletinBoardEditorialPageMenu';

const BulletinBoardEditorialPage = () => {
  const { t } = useTranslation();

  const { user } = useUserStore();
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
    <div className="p-5 lg:pr-20">
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
        enableRowSelection={(row) => row.original.creator.username === user?.username}
        scrollContainerOffsetElementIds={{
          tableHeaderId: CONFERENCES_PAGE_TABLE_HEADER,
          others: [NATIVE_APP_HEADER_ID, FLOATING_BUTTONS_BAR_ID, FOOTER_ID],
        }}
      />
    </div>
  );
};

export default BulletinBoardEditorialPage;
