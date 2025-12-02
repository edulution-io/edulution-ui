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

import React, { useMemo } from 'react';
import { ColumnDef, OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import APPS from '@libs/appconfig/constants/apps';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import useMedia from '@/hooks/useMedia';
import SURVEY_TABLE_COLUMNS from '@libs/survey/constants/surveyTableColumns';

interface DataTableProps<TData extends SurveyDto, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: Array<TData>;
  isLoading?: boolean;
  hiddenColumns?: string[];
}

const SurveyTable = <TData extends SurveyDto, TValue>({
  columns,
  data,
  isLoading = false,
  hiddenColumns = [],
}: DataTableProps<TData, TValue>) => {
  const { isMobileView, isTabletView } = useMedia();
  const { selectedRows, setSelectedRows } = useSurveyTablesPageStore();

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
      ...hiddenColumns.map((column) => ({ [column]: false })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
    }),
    [isMobileView, isTabletView, hiddenColumns],
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
