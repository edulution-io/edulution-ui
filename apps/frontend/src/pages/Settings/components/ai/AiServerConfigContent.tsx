import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OnChangeFn, Row, RowSelectionState, VisibilityState } from '@tanstack/react-table';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import useMedia from '@/hooks/useMedia';
import useTableActions from '@/hooks/useTableActions';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import AI_CONFIG_TABLE_COLUMNS from '@libs/ai/constants/aiConfigTableColumns';
import AiConfigTableColumns from '@/pages/Settings/components/ai/AiConfigTableColumns';
import AI_CONFIG_DIALOG_KEY from '@libs/ai/constants/aiConfigDialogKey';
import type AiConfigDto from '@libs/ai/types/aiConfigDto';
import { TableActionsConfig } from '@libs/common/types/tableActionsConfig';
import STANDARD_ACTION_TYPES from '@libs/common/constants/standardActionTypes';
import DeleteAppConfigTableDialog from '@/pages/Settings/AppConfig/components/table/DeleteAppConfigTableDialog';
import useAiConfigTableStore from '@/pages/Settings/components/ai/hook/useAiConfigTableStore';
import AddAiConfigDialog from '@/pages/Settings/components/ai/AddAiConfigDialog';

const AiServerConfigContent: React.FC = () => {
  const { t } = useTranslation();
  const { isMobileView, isTabletView } = useMedia();
  const { tableContentData, fetchTableContent, selectedRows, setSelectedRows, deleteTableEntry, setSelectedConfig } =
    useAiConfigTableStore();
  const { setDialogOpen, isDialogOpen } = useAppConfigTableDialogStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<Array<{ name: string; id: string }>>([]);

  useEffect(() => {
    void fetchTableContent();
  }, [fetchTableContent, isDialogOpen]);

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows || {}) : updaterOrValue;
    setSelectedRows(newValue);
  };

  const getSelectedConfigs = useCallback(() => {
    if (!selectedRows) return [];
    const selectedIds = Object.keys(selectedRows).filter((key) => selectedRows[key]);
    return selectedIds
      .map((id) => tableContentData.find((row) => row.id === id))
      .filter((row): row is AiConfigDto => row !== undefined);
  }, [selectedRows, tableContentData]);

  const handleAddClick = useCallback(() => {
    const selectedConfigs = getSelectedConfigs();
    setSelectedConfig(selectedConfigs.length === 1 ? selectedConfigs[0] : null);
    setDialogOpen(AI_CONFIG_DIALOG_KEY);
  }, [getSelectedConfigs, setSelectedConfig, setDialogOpen]);

  const handleRemoveClick = useCallback(() => {
    const selectedConfigs = getSelectedConfigs();
    if (selectedConfigs.length === 0) return;

    setItemsToDelete(
      selectedConfigs.map((row) => ({
        name: row.name || t('common.unknown'),
        id: row.id,
      })),
    );
    setIsDeleteDialogOpen(true);
  }, [getSelectedConfigs, t]);

  const handleConfirmDelete = async () => {
    const selectedConfigs = getSelectedConfigs();
    if (selectedConfigs.length === 0) return;

    await Promise.all(
      selectedConfigs.map((row) => (row.id && deleteTableEntry ? deleteTableEntry('', row.id) : Promise.resolve())),
    );

    setSelectedRows({});
    setIsDeleteDialogOpen(false);
    await fetchTableContent();
  };

  const initialColumnVisibility = useMemo(() => {
    const hideColumnsInMobileView = [
      AI_CONFIG_TABLE_COLUMNS.URL,
      AI_CONFIG_TABLE_COLUMNS.AI_MODEL,
      AI_CONFIG_TABLE_COLUMNS.ID,
    ];
    const hideColumnsInTabletView = [AI_CONFIG_TABLE_COLUMNS.URL];

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
    () => getSelectedConfigs().map((config) => ({ original: config }) as Row<AiConfigDto>),
    [getSelectedConfigs],
  );

  const actionsConfig = useMemo<TableActionsConfig<AiConfigDto>>(
    () => [
      { type: STANDARD_ACTION_TYPES.ADD_OR_EDIT, onClick: handleAddClick },
      { type: STANDARD_ACTION_TYPES.DELETE, onClick: handleRemoveClick, visible: ({ hasSelection }) => hasSelection },
    ],
    [handleAddClick, handleRemoveClick],
  );

  const tableActions = useTableActions(actionsConfig, selectedRowsArray);

  return (
    <div className="space-y-4">
      <p className="text-background">{t('settings.globalSettings.aiconfig.description')}</p>

      <ScrollableTable
        columns={AiConfigTableColumns}
        data={tableContentData}
        filterKey={AI_CONFIG_TABLE_COLUMNS.NAME}
        filterPlaceHolderText={t('aiconfig.filterPlaceHolderText')}
        applicationName="ai"
        enableRowSelection
        showSelectedCount={false}
        selectedRows={selectedRows}
        onRowSelectionChange={handleRowSelectionChange}
        initialColumnVisibility={initialColumnVisibility}
        actions={tableActions}
        getRowId={(row) => row.id}
      />

      <AddAiConfigDialog dialogKey={AI_CONFIG_DIALOG_KEY} />

      <DeleteAppConfigTableDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        items={itemsToDelete}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default AiServerConfigContent;
