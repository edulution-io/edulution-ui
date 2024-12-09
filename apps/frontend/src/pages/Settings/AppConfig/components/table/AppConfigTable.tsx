import React, { useEffect } from 'react';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import { useTranslation } from 'react-i18next';
import { AppConfigTableEntryUnion } from '@/pages/Settings/AppConfig/components/table/appConfigTableComponent';
import getTableConfig from '@/pages/Settings/AppConfig/components/table/getTableConfig';
import useAppConfigDialogStore from '@/pages/Settings/AppConfig/components/table/appConfigDialogStore';
import { Button } from '@/components/shared/Button';

const AppConfigTables = ({ applicationName }: { applicationName: string }) => {
  const { t } = useTranslation();

  const configs = getTableConfig(applicationName);

  if (!configs) {
    return <div>{t('common.error')}</div>;
  }

  const renderConfig = (config: AppConfigTableEntryUnion, index: number) => {
    const { columns, useStore, showAddButton, dialogBody, filterPlaceHolderText, filterKey } = config;
    const { data, fetchData } = useStore();
    const { setDialogOpen, isDialogOpen } = useAppConfigDialogStore();

    useEffect(() => {
      const fetchDataAsync = async () => {
        if (fetchData) {
          await fetchData();
        }
      };

      void fetchDataAsync();
    }, [fetchData, isDialogOpen]);

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
          data={data}
          applicationName={applicationName}
          enableRowSelection={false}
        />
        {showAddButton && (
          <div className="flex justify-end pt-4">
            <Button
              className="h-8"
              variant="btn-outline"
              onClick={handleAddClick}
            >
              {t('common.add')}
            </Button>
          </div>
        )}
        {dialogBody}
      </div>
    );
  };

  return <div>{configs.map((config, index) => renderConfig(config, index))}</div>;
};

export default AppConfigTables;
