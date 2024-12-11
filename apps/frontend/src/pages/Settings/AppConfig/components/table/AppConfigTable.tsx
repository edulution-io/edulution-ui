import React, { useEffect } from 'react';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import { useTranslation } from 'react-i18next';
import { AppConfigTableEntryUnion } from '@/pages/Settings/AppConfig/components/table/appConfigTableComponent';
import getTableConfig from '@/pages/Settings/AppConfig/components/table/getTableConfig';
import useAppConfigDialogStore from '@/pages/Settings/AppConfig/components/table/appConfigDialogStore';
import { IoAdd } from 'react-icons/io5';
import { Button } from '@/components/shared/Button';

const AppConfigTable = ({ applicationName }: { applicationName: string }) => {
  const { t } = useTranslation();

  const configs = getTableConfig(applicationName);

  if (!configs) {
    return <div>{t('common.error')}</div>;
  }

  const renderConfig = (config: AppConfigTableEntryUnion, index: number) => {
    const { columns, useStore, showAddButton, dialogBody, filterPlaceHolderText, filterKey } = config;
    const { tableData, fetchGenericTableContent } = useStore();
    const { setDialogOpen, isDialogOpen } = useAppConfigDialogStore();

    useEffect(() => {
      const fetchDataAsync = async () => {
        if (fetchGenericTableContent) {
          await fetchGenericTableContent();
        }
      };

      void fetchDataAsync();
    }, [fetchGenericTableContent, isDialogOpen]);

    const handleAddClick = () => {
      setDialogOpen(true);
    };

    return (
      <div
        key={config.key || index}
        className="mb-8"
      >
        <ScrollableTable
          columns={columns}
          filterKey={filterKey}
          filterPlaceHolderText={filterPlaceHolderText}
          data={tableData}
          applicationName={applicationName}
          enableRowSelection={false}
          usedInAppConfig
        />
        {showAddButton && (
          <div className="flex w-full">
            <Button
              className="flex h-2 w-full items-center justify-center rounded-none border border-gray-400 hover:bg-ciDarkGrey"
              onClick={handleAddClick}
              type="button"
            >
              <IoAdd className="text-xl text-white" />
            </Button>
          </div>
        )}
        {dialogBody}
      </div>
    );
  };

  return <div>{configs.map((config, index) => renderConfig(config, index))}</div>;
};

export default AppConfigTable;
