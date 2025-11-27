/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type ContainerInfo } from 'dockerode';
import { OnChangeFn, Row, RowSelectionState, VisibilityState } from '@tanstack/react-table';
import StandardActionTypes from '@libs/common/constants/standardActionTypes';
import TableAction from '@libs/common/types/tableAction';
import { TableActionsConfig } from '@libs/common/types/tableActionsConfig';
import { AppConfigTableConfig } from '@/pages/Settings/AppConfig/components/table/types/appConfigTableConfig';
import getAppConfigTableConfig from '@/pages/Settings/AppConfig/components/table/getAppConfigTableConfig';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import type BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import type TApps from '@libs/appconfig/types/appsType';
import useMedia from '@/hooks/useMedia';
import useTableActions from '@/hooks/useTableActions';
import FileInfoDto from '@libs/appconfig/types/fileInfo.dto';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import DeleteAppConfigDialog from './DeleteAppConfigDialog';

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
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemsToDelete, setItemsToDelete] = useState<Array<{ name: string; id: string }>>([]);

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

    const handleRemoveClick = () => {
      if (!selectedRows) return;

      const selectedIndices = Object.keys(selectedRows)
        .filter((key) => selectedRows[key])
        .map(Number);

      const items = selectedIndices.map((index) => {
        const row = tableContentData[index];
        if (row && 'filename' in row && row.filename) {
          return { name: row.filename, id: String(index) };
        }
        if (row && 'webdavShareId' in row && row.webdavShareId) {
          return { name: row.displayName, id: String(index) };
        }
        return { name: t('common.entry', { index: index + 1 }), id: String(index) };
      });

      setItemsToDelete(items);
      setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
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

    type TableDataType = BulletinCategoryResponseDto | ContainerInfo | FileInfoDto | VeyonProxyItem | WebdavShareDto;

    const selectedRowsArray = useMemo(
      () =>
        selectedRows
          ? Object.entries(selectedRows)
              .filter(([_, isSelected]) => isSelected)
              .map(([rowId]) => {
                const idx = parseInt(rowId, 10);
                return { original: tableContentData[idx] } as Row<TableDataType>;
              })
          : [],
      [selectedRows, tableContentData],
    );

    const actionsConfig = useMemo<TableActionsConfig<TableDataType>>(() => {
      const configs: TableActionsConfig<TableDataType> = [];
      if (showAddButton) {
        configs.push({
          type: StandardActionTypes.ADD_OR_EDIT,
          onClick: handleAddClick,
        });
      }
      if (showRemoveButton) {
        configs.push({
          type: StandardActionTypes.REMOVE,
          onClick: handleRemoveClick,
          visible: ({ hasSelection }) => hasSelection,
        });
      }
      return configs;
    }, [showAddButton, showRemoveButton]);

    const tableActions = useTableActions(actionsConfig, selectedRowsArray);

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
        <DeleteAppConfigDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          items={itemsToDelete}
          onConfirmDelete={handleConfirmDelete}
        />
      </div>
    );
  };

  return <div>{renderConfig(appConfigTableConfig)}</div>;
};

export default AppConfigTable;
