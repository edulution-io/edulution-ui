import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import { ButtonSH } from '@/components/ui/ButtonSH';
import { useTranslation } from 'react-i18next';
import { BulletinBoardTableStore } from '@/pages/Settings/AppConfig/components/table/useAppConfigBulletinTable';
import { StoreApi, UseBoundStore } from 'zustand';

interface AppConfigTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  store?: UseBoundStore<StoreApi<BulletinBoardTableStore>>;
  applicationName: string;
}

const AppConfigTable = <TData,>({ columns, store, applicationName }: AppConfigTableProps<TData>) => {
  const { t } = useTranslation();
  if (!store) return null;

  const { getData, openCreateCategoryDialog } = store();

  return (
    <div className="relative w-full overflow-hidden ">
      <div className="overflow-auto">
        <ScrollableTable
          columns={columns}
          data={getData()}
          applicationName={applicationName}
        />
      </div>

      {openCreateCategoryDialog && (
        <div className="flex justify-end pt-8">
          <ButtonSH
            onClick={openCreateCategoryDialog}
            className="h-8 justify-start rounded py-0 text-left font-normal text-foreground"
            variant="outline"
          >
            {t('common.add')}
          </ButtonSH>
        </div>
      )}
    </div>
  );
};

export default AppConfigTable;
