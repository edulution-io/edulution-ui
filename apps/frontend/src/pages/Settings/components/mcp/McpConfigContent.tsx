import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OnChangeFn, Row, RowSelectionState, VisibilityState } from '@tanstack/react-table';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import useMedia from '@/hooks/useMedia';
import useTableActions from '@/hooks/useTableActions';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import MCP_CONFIG_TABLE_COLUMNS from '@libs/mcp/constants/mcpConfigTableColumns';
import McpConfigTableColumns from '@/pages/Settings/components/mcp/McpConfigTableColumns';
import MCP_CONFIG_DIALOG_KEY from '@libs/mcp/constants/mcpConfigDialogKey';
import type McpConfigDto from '@libs/mcp/types/mcpConfigDto';
import { TableActionsConfig } from '@libs/common/types/tableActionsConfig';
import STANDARD_ACTION_TYPES from '@libs/common/constants/standardActionTypes';
import DeleteAppConfigTableDialog from '@/pages/Settings/AppConfig/components/table/DeleteAppConfigTableDialog';
import useMcpConfigTableStore from '@/pages/Settings/components/mcp/hook/useMcpConfigTableStore';
import AddMcpConfigDialog from '@/pages/Settings/components/mcp/AddMcpConfigDialog';

const McpConfigContent: React.FC = () => {
  const { t } = useTranslation();
  const { isMobileView, isTabletView } = useMedia();
  const { tableContentData, fetchTableContent, selectedRows, setSelectedRows, deleteTableEntry, setSelectedConfig } =
    useMcpConfigTableStore();
  const { setDialogOpen, isDialogOpen } = useAppConfigTableDialogStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<Array<{ name: string; id: string }>>([]);
  const configsToDeleteRef = useRef<McpConfigDto[]>([]);

  useEffect(() => {
    void fetchTableContent();
  }, [fetchTableContent, isDialogOpen]);

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows || {}) : updaterOrValue;
    setSelectedRows(newValue);
  };

  const getSelectedConfigs = useCallback((): McpConfigDto[] => {
    if (!selectedRows || !tableContentData.length) return [];

    const selectedKeys = Object.keys(selectedRows).filter((key) => selectedRows[key]);
    if (selectedKeys.length === 0) return [];

    return selectedKeys
      .map((key) => {
        const found = tableContentData.find((row) => row.id === key);
        if (found) return found;

        const index = parseInt(key, 10);
        if (!Number.isNaN(index) && index >= 0 && index < tableContentData.length) {
          return tableContentData[index];
        }
        return null;
      })
      .filter((config): config is McpConfigDto => config !== null);
  }, [selectedRows, tableContentData]);

  const selectedConfigs = useMemo(() => getSelectedConfigs(), [getSelectedConfigs]);
  const hasSelection = selectedConfigs.length > 0;

  const handleAddClick = useCallback(() => {
    const configToEdit = selectedConfigs.length === 1 ? selectedConfigs[0] : null;
    setSelectedConfig(configToEdit);
    setDialogOpen(MCP_CONFIG_DIALOG_KEY);
  }, [selectedConfigs, setSelectedConfig, setDialogOpen]);

  const handleRemoveClick = useCallback(() => {
    if (selectedConfigs.length === 0) return;

    configsToDeleteRef.current = [...selectedConfigs];

    setItemsToDelete(
      selectedConfigs.map((row) => ({
        name: row.name || t('common.unknown'),
        id: row.id,
      })),
    );
    setIsDeleteDialogOpen(true);
  }, [selectedConfigs, t]);

  const handleConfirmDelete = async () => {
    const configsToDelete = configsToDeleteRef.current;

    if (configsToDelete.length === 0) return;

    await Promise.all(configsToDelete.map((row) => (row.id ? deleteTableEntry('', row.id) : Promise.resolve())));

    configsToDeleteRef.current = [];
    setSelectedRows({});
    setIsDeleteDialogOpen(false);
    await fetchTableContent();
  };

  const handleDeleteDialogClose = (open: boolean) => {
    if (!open) {
      configsToDeleteRef.current = [];
    }
    setIsDeleteDialogOpen(open);
  };

  const initialColumnVisibility = useMemo(() => {
    const hideColumnsInMobileView = [MCP_CONFIG_TABLE_COLUMNS.URL, MCP_CONFIG_TABLE_COLUMNS.ID];
    const hideColumnsInTabletView = [MCP_CONFIG_TABLE_COLUMNS.URL];

    let columnsToHide: string[] = [];
    if (isMobileView) columnsToHide = hideColumnsInMobileView;
    else if (isTabletView) columnsToHide = hideColumnsInTabletView;

    const visibility: VisibilityState = {};
    columnsToHide.forEach((colKey) => {
      visibility[colKey] = false;
    });
    return visibility;
  }, [isMobileView, isTabletView]);

  const selectedRowsArray = useMemo(
    () => selectedConfigs.map((config) => ({ original: config }) as Row<McpConfigDto>),
    [selectedConfigs],
  );

  const actionsConfig = useMemo<TableActionsConfig<McpConfigDto>>(
    () => [
      { type: STANDARD_ACTION_TYPES.ADD_OR_EDIT, onClick: handleAddClick },
      {
        type: STANDARD_ACTION_TYPES.DELETE,
        onClick: handleRemoveClick,
        visible: () => hasSelection,
      },
    ],
    [handleAddClick, handleRemoveClick, hasSelection],
  );

  const tableActions = useTableActions(actionsConfig, selectedRowsArray);

  return (
    <div className="space-y-4">
      <p className="text-background">{t('settings.globalSettings.mcpconfig.description')}</p>

      <ScrollableTable
        columns={McpConfigTableColumns}
        data={tableContentData}
        filterKey={MCP_CONFIG_TABLE_COLUMNS.NAME}
        filterPlaceHolderText={t('mcpconfig.filterPlaceHolderText')}
        applicationName="mcp"
        enableRowSelection
        showSelectedCount={false}
        selectedRows={selectedRows}
        onRowSelectionChange={handleRowSelectionChange}
        initialColumnVisibility={initialColumnVisibility}
        actions={tableActions}
        getRowId={(originalRow) => originalRow.id}
      />

      <AddMcpConfigDialog dialogKey={MCP_CONFIG_DIALOG_KEY} />

      <DeleteAppConfigTableDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={handleDeleteDialogClose}
        items={itemsToDelete}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default McpConfigContent;
