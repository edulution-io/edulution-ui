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

import React from 'react';
import { ColumnDef, OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import APPS from '@libs/appconfig/constants/apps';
import SURVEYS_PAGE_TABLE_HEADER_ID from '@libs/survey/constants/pageElementIds';
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID, NATIVE_APP_HEADER_ID } from '@libs/common/constants/pageElementIds';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import SurveyDto from '@libs/survey/types/api/survey.dto';

interface DataTableProps<TData extends SurveyDto, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: Array<TData>;
  isLoading?: boolean;
}

const SurveyTable = <TData extends SurveyDto, TValue>({
  columns,
  data,
  isLoading = false,
}: DataTableProps<TData, TValue>) => {
  const { selectedRows, setSelectedRows } = useSurveyTablesPageStore();

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  return (
    <ScrollableTable
      columns={columns}
      data={data}
      filterKey="select-survey"
      filterPlaceHolderText="survey.filterPlaceHolderText"
      onRowSelectionChange={handleRowSelectionChange}
      selectedRows={selectedRows}
      isLoading={isLoading}
      getRowId={(originalRow: TData) => originalRow.id!.toString()}
      applicationName={APPS.SURVEYS}
      scrollContainerOffsetElementIds={{
        tableHeaderId: SURVEYS_PAGE_TABLE_HEADER_ID,
        others: [NATIVE_APP_HEADER_ID, FLOATING_BUTTONS_BAR_ID, FOOTER_ID],
      }}
    />
  );
};

export default SurveyTable;
