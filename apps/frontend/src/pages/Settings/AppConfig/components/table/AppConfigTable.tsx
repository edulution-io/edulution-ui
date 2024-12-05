import React, { useEffect } from 'react';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import { ButtonSH } from '@/components/ui/ButtonSH';
import { useTranslation } from 'react-i18next';
import getTableConfig from '@/pages/Settings/AppConfig/components/table/getTableConfig';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import AppConfigEditBulletinCategorieDialog from '@/pages/BulletinBoard/AppConfigEditBulletinCategorieDialog';
import useAppConfigDialogStore from '@/pages/Settings/AppConfig/components/table/appConfigDialogStore';

interface AppConfigTablesProps {
  applicationName: string;
}

const AppConfigTables = ({ applicationName }: AppConfigTablesProps) => {
  const { t } = useTranslation();
  const configs = getTableConfig(applicationName);

  if (!configs) {
    return <div>{t('common.error')}</div>;
  }

  const { isUpdateDeleteEntityDialogOpen, isAddEntityDialogOpen, setAddEntityDialogOpen } = useAppConfigDialogStore();

  const stores = configs.map((config) => ({
    ...config,
    store: config.useStore ? config.useStore() : null,
  }));

  useEffect(() => {
    stores.forEach((config) => {
      if (config.store) {
        void config.store.fetchCategories();
      }
    });
  }, [isUpdateDeleteEntityDialogOpen, isAddEntityDialogOpen]);

  const renderConfig = (config: any, index: number) => {
    const { columns, store, showAddButton, dialogBody } = config;

    if (!store) {
      return null;
    }

    const { categories } = store;

    const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setAddEntityDialogOpen((prevState) => !prevState);
    };

    return (
      <div
        key={config.key || index.toString()}
        className="mb-8"
      >
        <ScrollableTable
          columns={columns}
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
          isOpen={isAddEntityDialogOpen}
          variant="primary"
          handleOpenChange={() => setAddEntityDialogOpen(!isAddEntityDialogOpen)}
          title=""
          body={dialogBody({ closeDialog: () => setAddEntityDialogOpen(false) })}
          mobileContentClassName="bg-black h-fit h-max-1/2"
        />
        <AppConfigEditBulletinCategorieDialog />
      </div>
    );
  };

  return <div>{stores.map(renderConfig)}</div>;
};

export default AppConfigTables;
