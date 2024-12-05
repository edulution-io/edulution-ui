import React, { useEffect } from 'react';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import { ButtonSH } from '@/components/ui/ButtonSH';
import { useTranslation } from 'react-i18next';
import { AppConfigTableEntryUnion } from '@/pages/Settings/AppConfig/components/table/appConfigTableComponent';
import getTableConfig from '@/pages/Settings/AppConfig/components/table/getTableConfig';
import useAppConfigDialogStore from '@/pages/Settings/AppConfig/components/table/appConfigDialogStore';

const AppConfigTables = ({ applicationName }: { applicationName: string }) => {
  const { t } = useTranslation();

  const configs = getTableConfig(applicationName);

  if (!configs) {
    return <div>{t('common.error')}</div>;
  }

  const renderConfig = (config: AppConfigTableEntryUnion, index: number) => {
    const { columns, useStore, showAddButton, dialogBody } = config;
    const { data, fetchData } = useStore();
    const { setUpdateDeleteEntityDialogOpen, isUpdateDeleteEntityDialogOpen } = useAppConfigDialogStore();

    useEffect(() => {
      const fetchDataAsync = async () => {
        if (fetchData) {
          await fetchData();
        }
      };

      void fetchDataAsync();
    }, [fetchData, isUpdateDeleteEntityDialogOpen]);

    const handleAddClick = () => {
      setUpdateDeleteEntityDialogOpen(true);
    };

    return (
      <div
        key={config.key || index}
        className="mb-8"
      >
        <ScrollableTable
          columns={columns}
          data={data}
          applicationName={applicationName}
          enableRowSelection={false}
        />
        {showAddButton && (
          <div className="flex justify-end pt-4">
            <ButtonSH
              className="h-8"
              variant="outline"
              onClick={handleAddClick}
            >
              {t('common.add')}
            </ButtonSH>
          </div>
        )}
        {dialogBody}
      </div>
    );
  };

  return <div>{configs.map((config, index) => renderConfig(config, index))}</div>;
};

export default AppConfigTables;
