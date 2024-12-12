import React, { useEffect } from 'react';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import { useTranslation } from 'react-i18next';
import { AppConfigTableConfig } from '@/pages/Settings/AppConfig/components/table/types/appConfigTableConfig';
import getAppConfigTableConfig from '@/pages/Settings/AppConfig/components/table/getAppConfigTableConfig';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import { IoAdd } from 'react-icons/io5';
import { Button } from '@/components/shared/Button';

const AppConfigTable = ({ applicationName }: { applicationName: string }) => {
  const { t } = useTranslation();

  const configs = getAppConfigTableConfig(applicationName);

  if (!configs) {
    return <div>{t('common.error')}</div>;
  }

  const renderConfig = (config: AppConfigTableConfig, index: number) => {
    const { columns, useStore, showAddButton, dialogBody, filterPlaceHolderText, filterKey } = config;
    const { tableContentData, fetchTableContent } = useStore();
    const { setDialogOpen, isDialogOpen } = useAppConfigTableDialogStore();

    useEffect(() => {
      const fetchDataAsync = async () => {
        if (fetchTableContent) {
          await fetchTableContent();
        }
      };

      void fetchDataAsync();
    }, [fetchTableContent, isDialogOpen]);

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
          data={tableContentData}
          applicationName={applicationName}
          enableRowSelection={false}
          usedInAppConfig
        />
        {showAddButton && (
          <div className="flex w-full">
            <Button
              className="flex h-2 w-full items-center justify-center rounded-md border border-gray-500 hover:bg-ciDarkGrey"
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
