/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
import VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';

interface AppConfigTableProps {
  applicationName: TApps;
  tableId: string;
}

const AppConfigTable: React.FC<AppConfigTableProps> = ({ applicationName, tableId }) => {
  const { t } = useTranslation();

  const appConfigTableConfig = getAppConfigTableConfig(applicationName, tableId) as AppConfigTableConfig;

  if (!appConfigTableConfig) {
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
      setDialogOpen(tableId);
    };

    const getScrollableTable = () => {
      switch (type) {
        case ExtendedOptionKeys.BULLETIN_BOARD_CATEGORY_TABLE: {
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
        case ExtendedOptionKeys.DOCKER_CONTAINER_TABLE: {
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
        case ExtendedOptionKeys.VEYON_PROXYS: {
          return (
            <ScrollableTable
              columns={columns}
              data={tableContentData as VeyonProxyItem[]}
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
      <div className="mb-8">
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

  return <div>{renderConfig(appConfigTableConfig)}</div>;
};

export default AppConfigTable;
