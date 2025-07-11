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

import React, { useMemo } from 'react';
import { ColumnDef, OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import APPS from '@libs/appconfig/constants/apps';
import useSurveysTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import useMedia from '@/hooks/useMedia';
import SURVEY_TABLE_COLUMNS from '@libs/survey/constants/surveyTableColumns';

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
  const { isMobileView, isTabletView } = useMedia();
  const { selectedRows, setSelectedRows } = useSurveysTablesPageStore();

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  const initialColumnVisibility = useMemo(
    () => ({
      [SURVEY_TABLE_COLUMNS.CREATED_AT]: !(isMobileView || isTabletView),
      [SURVEY_TABLE_COLUMNS.EXPIRES]: !isMobileView,
      [SURVEY_TABLE_COLUMNS.ANSWERS]: !(isMobileView || isTabletView),
      [SURVEY_TABLE_COLUMNS.INVITED_ATTENDEES]: !(isMobileView || isTabletView),
    }),
    [isMobileView, isTabletView],
  );

  return (
    <ScrollableTable
      columns={columns}
      data={data}
      filterKey={SURVEY_TABLE_COLUMNS.SELECT_SURVEY}
      filterPlaceHolderText="survey.filterPlaceHolderText"
      onRowSelectionChange={handleRowSelectionChange}
      selectedRows={selectedRows}
      isLoading={isLoading}
      getRowId={(originalRow: TData) => originalRow.id!}
      applicationName={APPS.SURVEYS}
      initialColumnVisibility={initialColumnVisibility}
    />
  );
};

export default SurveyTable;
