import React, { useState } from 'react';
import mongoose from 'mongoose';
import { ColumnDef, OnChangeFn, RowSelectionState, SortingState } from '@tanstack/react-table';
import APPS from '@libs/appconfig/constants/apps';
import SURVEYS_PAGE_TABLE_HEADER_ID from '@libs/survey/constants/pageElementIds';
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID, NATIVE_APP_HEADER_ID } from '@libs/common/constants/pageElementIds';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';

interface MongoId {
  id: mongoose.Types.ObjectId;
}

interface DataTableProps<TData extends MongoId, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: Array<TData>;
  isLoading?: boolean;
}

const SurveyTable = <TData extends MongoId, TValue>({
  columns,
  data,
  isLoading = false,
}: DataTableProps<TData, TValue>) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const { selectedRows, setSelectedRows } = useSurveyTablesPageStore();

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  return (
    <ScrollableTable
      columns={columns}
      data={data}
      onRowSelectionChange={handleRowSelectionChange}
      selectedRows={selectedRows}
      isLoading={isLoading}
      sorting={sorting}
      getRowId={(originalRow: TData) => originalRow.id.toString('hex')}
      setSorting={setSorting}
      applicationName={APPS.SURVEYS}
      scrollContainerOffsetElementIds={{
        tableHeaderId: SURVEYS_PAGE_TABLE_HEADER_ID,
        others: [NATIVE_APP_HEADER_ID, FLOATING_BUTTONS_BAR_ID, FOOTER_ID],
      }}
    />
  );
};

export default SurveyTable;
