import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OnChangeFn, Row, RowSelectionState, VisibilityState } from '@tanstack/react-table';
import { AccordionContent } from '@/components/ui/AccordionSH';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import useMedia from '@/hooks/useMedia';
import useTableActions from '@/hooks/useTableActions';
import useAiConfigTableStore from '@/pages/Settings/GlobalSettings/ai/useAiConfigTableStore';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import AiConfigTableColumns from '@/pages/Settings/GlobalSettings/ai/AiConfigTableColumns';
import AddAiConfigDialog from '@/pages/Settings/GlobalSettings/ai/AddAiConfigDialog';
import DeleteAppConfigDialog from '@/pages/Settings/AppConfig/components/table/DeleteAppConfigDialog';
import AI_CONFIG_TABLE_COLUMNS from '@libs/ai/constants/aiConfigTableColumns';
import AI_CONFIG_DIALOG_KEY from '@libs/ai/constants/aiConfigDialogKey';
import type AiConfigDto from '@libs/ai/types/aiConfigDto';
import TableAction from '@libs/common/types/tableAction';
import { TableActionsConfig } from '@libs/common/types/tableActionsConfig';
import STANDARD_ACTION_TYPES from '@libs/common/constants/standardActionTypes';

const AiConfigSettings: React.FC = () => {
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
    if (selectedConfigs.length === 1) {
      setSelectedConfig(selectedConfigs[0]);
    } else {
      setSelectedConfig(null);
    }
    setDialogOpen(AI_CONFIG_DIALOG_KEY);
  }, [getSelectedConfigs, setSelectedConfig, setDialogOpen]);

  const handleRemoveClick = useCallback(() => {
    const selectedConfigs = getSelectedConfigs();
    if (selectedConfigs.length === 0) return;

    const items = selectedConfigs.map((row) => ({
      name: row.name || t('common.unknown'),
      id: row.id,
    }));

    setItemsToDelete(items);
    setIsDeleteDialogOpen(true);
  }, [getSelectedConfigs, t]);

  const handleConfirmDelete = async () => {
    const selectedConfigs = getSelectedConfigs();
    if (selectedConfigs.length === 0) return;

    await Promise.all(
      selectedConfigs.map((row) => {
        if (row.id && deleteTableEntry) {
          return deleteTableEntry('', row.id);
        }
        return Promise.resolve();
      }),
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
  }, [isMobileView, isTabletView]);

  const selectedRowsArray = useMemo(() => {
    const selectedConfigs = getSelectedConfigs();
    return selectedConfigs.map((config) => ({ original: config }) as Row<AiConfigDto>);
  }, [getSelectedConfigs]);

  const actionsConfig = useMemo<TableActionsConfig<AiConfigDto>>(
    () => [
      {
        type: STANDARD_ACTION_TYPES.ADD_OR_EDIT,
        onClick: handleAddClick,
      },
      {
        type: STANDARD_ACTION_TYPES.DELETE,
        onClick: handleRemoveClick,
        visible: ({ hasSelection }) => hasSelection,
      },
    ],
    [handleAddClick, handleRemoveClick],
  );

  const tableActions = useTableActions(actionsConfig, selectedRowsArray);

  return (
    <AccordionContent className="space-y-4 px-1">
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

      <DeleteAppConfigDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        items={itemsToDelete}
        onConfirmDelete={handleConfirmDelete}
      />
    </AccordionContent>
  );
};

export default AiConfigSettings;
