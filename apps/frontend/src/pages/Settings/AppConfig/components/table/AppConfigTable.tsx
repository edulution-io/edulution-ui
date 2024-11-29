import React, { useState } from 'react';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import { ButtonSH } from '@/components/ui/ButtonSH';
import { useTranslation } from 'react-i18next';
import getTableConfig from '@/pages/Settings/AppConfig/components/table/getTableConfig';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';

interface AppConfigTablesProps {
  applicationName: string;
}

const AppConfigTables = ({ applicationName }: AppConfigTablesProps) => {
  const { t } = useTranslation();
  const configs = getTableConfig(applicationName);

  if (!configs) {
    return <div>{t('common.error')}</div>;
  }

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div>
      {configs.map((config) => {
        const { columns, useStore, showAddButton, dialogBody } = config;
        const store = typeof useStore === 'function' ? useStore() : null;

        if (!store) {
          return null;
        }

        const { getData } = store;

        const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
          if (showAddButton) {
            console.log('store.openCreateCategoryDialog()');
            setDialogOpen(true);
          }
        };

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
            {showAddButton && (
              <div className="flex justify-end pt-4">
                <ButtonSH
                  onClick={handleButtonClick}
                  className="h-8 justify-start rounded py-0 text-left font-normal text-foreground"
                  variant="outline"
                >
                  {t('common.add')}
                </ButtonSH>
              </div>
            )}
            <AdaptiveDialog
              isOpen={dialogOpen}
              variant="primary"
              handleOpenChange={() => setDialogOpen(!dialogOpen)}
              title=""
              body={dialogBody()}
              mobileContentClassName="bg-black h-fit h-max-1/2"
            />
          </div>
        );
      })}
    </div>
  );
};

export default AppConfigTables;
