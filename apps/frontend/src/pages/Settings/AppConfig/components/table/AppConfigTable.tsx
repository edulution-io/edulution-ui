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

import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IoAdd, IoRemove } from 'react-icons/io5';
import { type ContainerInfo } from 'dockerode';
import TableAction from '@libs/common/types/tableAction';
import { AppConfigTableConfig } from '@/pages/Settings/AppConfig/components/table/types/appConfigTableConfig';
import getAppConfigTableConfig from '@/pages/Settings/AppConfig/components/table/getAppConfigTableConfig';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import type BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import type TApps from '@libs/appconfig/types/appsType';
import useMedia from '@/hooks/useMedia';
import { OnChangeFn, RowSelectionState, VisibilityState } from '@tanstack/react-table';
import FileInfoDto from '@libs/appconfig/types/fileInfo.dto';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';

interface AppConfigTableProps {
  applicationName: string;
  option: AppConfigExtendedOption;
}

const AppConfigTable: React.FC<AppConfigTableProps> = ({ applicationName, option }) => {
  const { isMobileView, isTabletView } = useMedia();
  const { t } = useTranslation();

  const { name: tableId, title } = option;
  const appConfigTableConfig = getAppConfigTableConfig(applicationName, tableId) as AppConfigTableConfig;

  if (!appConfigTableConfig) {
    return <div>{t('common.error')}</div>;
  }

  const renderConfig = (config: AppConfigTableConfig) => {
    const {
      columns,
      hideColumnsInTabletView,
      hideColumnsInMobileView,
      useStore,
      showAddButton,
      showRemoveButton = false,
      dialogBody,
      filterPlaceHolderText,
      filterKey,
      type,
    } = config;
    const { tableContentData, fetchTableContent, selectedRows, setSelectedRows, deleteTableEntry } = useStore();
    const { setDialogOpen, isDialogOpen } = useAppConfigTableDialogStore();

    const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
      if (selectedRows && setSelectedRows) {
        const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
        setSelectedRows(newValue);
      }
    };

    useEffect(() => {
      const fetchDataAsync = async () => {
        if (fetchTableContent) {
          await fetchTableContent(applicationName as TApps);
        }
      };

      void fetchDataAsync();
    }, [fetchTableContent, isDialogOpen]);

    const handleAddClick = () => {
      setDialogOpen(tableId);
    };

    const handleRemoveClick = async () => {
      if (!selectedRows) return;

      const selectedIndices = Object.keys(selectedRows)
        .filter((key) => selectedRows[key])
        .map(Number);

      const deletePromises = selectedIndices.map((index) => {
        const row = tableContentData[index];
        if (row && 'filename' in row && row.filename && deleteTableEntry) {
          return deleteTableEntry(applicationName, row.filename);
        }

        if (row && 'webdavShareId' in row && row.webdavShareId && deleteTableEntry) {
          return deleteTableEntry(applicationName, row.webdavShareId);
        }

        return Promise.resolve();
      });

      await Promise.all(deletePromises);
      await fetchTableContent(applicationName as TApps);
    };

    const initialColumnVisibility = useMemo(() => {
      let columnsToHide: string[] = [];
      if (isMobileView) {
        columnsToHide = hideColumnsInMobileView;
      } else if (isTabletView) {
        columnsToHide = hideColumnsInTabletView;
      }

      const visibility: VisibilityState = {};
      columnsToHide.forEach((colKey) => {
        visibility[colKey] = false;
      });

      return visibility;
    }, [isMobileView, isTabletView, hideColumnsInMobileView, hideColumnsInTabletView]);

    const getScrollableTable = () => {
      const tableActions: TableAction<
        BulletinCategoryResponseDto | ContainerInfo | FileInfoDto | VeyonProxyItem | WebdavShareDto
      >[] = [];
      if (showAddButton) {
        tableActions.push({
          icon: IoAdd,
          translationId: 'common.add',
          onClick: handleAddClick,
        });
      }
      if (showRemoveButton) {
        tableActions.push({
          icon: IoRemove,
          translationId: 'common.remove',
          onClick: handleRemoveClick,
        });
      }

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
              initialColumnVisibility={initialColumnVisibility}
              actions={tableActions as TableAction<BulletinCategoryResponseDto>[]}
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
              initialColumnVisibility={initialColumnVisibility}
              actions={tableActions as TableAction<ContainerInfo>[]}
            />
          );
        }
        case ExtendedOptionKeys.EMBEDDED_PAGE_HTML_CONTENT: {
          return (
            <ScrollableTable
              columns={columns}
              data={tableContentData as FileInfoDto[]}
              filterKey={filterKey}
              filterPlaceHolderText={filterPlaceHolderText}
              applicationName="settings.appconfig.sections.files"
              enableRowSelection
              initialColumnVisibility={initialColumnVisibility}
              selectedRows={selectedRows}
              onRowSelectionChange={handleRowSelectionChange}
              actions={tableActions as TableAction<FileInfoDto>[]}
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
              initialColumnVisibility={initialColumnVisibility}
              actions={tableActions as TableAction<VeyonProxyItem>[]}
            />
          );
        }
        case ExtendedOptionKeys.WEBDAV_SERVER_TABLE: {
          return (
            <ScrollableTable
              columns={columns}
              data={tableContentData as WebdavShareDto[]}
              filterKey={filterKey}
              filterPlaceHolderText={filterPlaceHolderText}
              applicationName={applicationName}
              enableRowSelection
              initialColumnVisibility={initialColumnVisibility}
              selectedRows={selectedRows}
              onRowSelectionChange={handleRowSelectionChange}
              actions={tableActions as TableAction<WebdavShareDto>[]}
            />
          );
        }
        case ExtendedOptionKeys.WEBDAV_SHARE_TABLE: {
          return (
            <ScrollableTable
              columns={columns}
              data={tableContentData as WebdavShareDto[]}
              filterKey={filterKey}
              filterPlaceHolderText={filterPlaceHolderText}
              applicationName={applicationName}
              enableRowSelection
              initialColumnVisibility={initialColumnVisibility}
              selectedRows={selectedRows}
              onRowSelectionChange={handleRowSelectionChange}
              actions={tableActions as TableAction<WebdavShareDto>[]}
            />
          );
        }
        default:
          return null;
      }
    };

    return (
      <div className="mb-8">
        {title && <p className="font-bold">{t(title)}</p>}
        {getScrollableTable()}
        {dialogBody}
      </div>
    );
  };

  return <div>{renderConfig(appConfigTableConfig)}</div>;
};

export default AppConfigTable;
