import React, { useEffect, useState } from 'react';
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

  // Extract all store hooks at the top level
  const stores = configs.map((config) => ({
    ...config,
    store: config.useStore ? config.useStore() : null,
  }));

  useEffect(() => {
    stores.forEach((config) => {
      if (config.store) {
        void config.store.getCategories();
      }
    });
  }, [dialogOpen]);

  return (
    <div>
      {stores.map((config, index) => {
        const { columns, store, showAddButton, dialogBody } = config;

        if (!store) {
          return null;
        }

        const { categories } = store;

        const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
          setDialogOpen((prevState) => !prevState);
        };

        return (
          <div
            key={config.key || index.toString()}
            className="mb-8"
          >
            <ScrollableTable
              columns={columns({
                onDelete: (dto: any) => console.log(`Delete action triggered${dto}`),
                onModify: (dto: any) => console.log(`Modify action triggered${dto}`),
              })}
              data={categories}
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
              body={dialogBody({ closeDialog: () => setDialogOpen(false) })}
              mobileContentClassName="bg-black h-fit h-max-1/2"
            />
          </div>
        );
      })}
    </div>
  );
};

export default AppConfigTables;
