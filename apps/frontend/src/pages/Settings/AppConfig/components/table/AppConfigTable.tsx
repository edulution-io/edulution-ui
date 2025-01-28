import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IoAdd } from 'react-icons/io5';
import { type ContainerInfo } from 'dockerode';
import { AppConfigTableConfig } from '@/pages/Settings/AppConfig/components/table/types/appConfigTableConfig';
import getAppConfigTableConfig from '@/pages/Settings/AppConfig/components/table/getAppConfigTableConfig';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import { Button } from '@/components/shared/Button';
import type BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import type TApps from '@libs/appconfig/types/appsType';

interface AppConfigTableProps {
  applicationName: TApps;
}

const AppConfigTable: React.FC<AppConfigTableProps> = ({ applicationName }) => {
  const { t } = useTranslation();

  const configs = getAppConfigTableConfig(applicationName) as AppConfigTableConfig[];

  if (!configs) {
    return <div>{t('common.error')}</div>;
  }

  const renderConfig = (config: AppConfigTableConfig) => {
    const { columns, useStore, showAddButton, dialogBody, filterPlaceHolderText, filterKey, type } = config;
    const { tableContentData, fetchTableContent } = useStore();
    const { setDialogOpen, isDialogOpen } = useAppConfigTableDialogStore();

    useEffect(() => {
      const fetchDataAsync = async () => {
        if (fetchTableContent) {
          await fetchTableContent(applicationName);
        }
      };

      void fetchDataAsync();
    }, [fetchTableContent, isDialogOpen]);

    const handleAddClick = () => {
      setDialogOpen(true);
    };

    const getScrollableTable = () => {
      switch (type) {
        case 'bulletin': {
          return (
            <ScrollableTable
              columns={columns}
              data={tableContentData as BulletinCategoryResponseDto[]}
              filterKey={filterKey}
              filterPlaceHolderText={filterPlaceHolderText}
              applicationName={applicationName}
              enableRowSelection={false}
              tableIsUsedOnAppConfigPage
            />
          );
        }
        case 'docker': {
          return (
            <ScrollableTable
              columns={columns}
              data={tableContentData as ContainerInfo[]}
              filterKey={filterKey}
              filterPlaceHolderText={filterPlaceHolderText}
              applicationName={applicationName}
              enableRowSelection={false}
              tableIsUsedOnAppConfigPage
            />
          );
        }
        default:
          return null;
      }
    };

    return (
      <div
        key={config.type}
        className="mb-8"
      >
        {getScrollableTable()}
        {showAddButton && (
          <div className="flex w-full">
            <Button
              className="flex h-2 w-full items-center justify-center rounded-md border border-gray-500 hover:bg-accent"
              onClick={handleAddClick}
              type="button"
            >
              <IoAdd className="text-xl text-background" />
            </Button>
          </div>
        )}
        {dialogBody}
      </div>
    );
  };

  return <div>{configs.map((config) => renderConfig(config))}</div>;
};

export default AppConfigTable;
