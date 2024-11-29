import React from 'react';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import { ButtonSH } from '@/components/ui/ButtonSH';
import { useTranslation } from 'react-i18next';
import getTableConfig from '@/pages/Settings/AppConfig/components/table/getTableConfig';

interface AppConfigTablesProps {
  applicationName: string;
}

const AppConfigTables = ({ applicationName }: AppConfigTablesProps) => {
  const { t } = useTranslation();
  const configs = getTableConfig(applicationName);

  if (!configs) {
    return <div>{t('common.error')}</div>;
  }

  return (
    <div>
      {configs.map((config) => {
        const { columns, useStore } = config;
        const store = typeof useStore === 'function' ? useStore() : null;
        const { getData, openCreateCategoryDialog } = store || {};

        return (
          <div
            key={columns.keys().next().value}
            className="mb-8"
          >
            <ScrollableTable
              columns={columns}
              data={getData()}
              applicationName={applicationName}
            />
            {openCreateCategoryDialog && (
              <div className="flex justify-end pt-4">
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
      })}
    </div>
  );
};

export default AppConfigTables;
