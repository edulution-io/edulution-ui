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

import React, { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HorizontalLoader from '@/components/ui/Loading/HorizontalLoader';
import useLmnApiStore from '@/store/useLmnApiStore';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import useLdapGroups from '@/hooks/useLdapGroups';
import type UserType from '@libs/userManagement/types/userType';
import type ListManagementRow from '@libs/userManagement/types/listManagementRow';
import USER_TYPE_TO_MANAGEMENT_LIST from '@libs/userManagement/constants/userTypeToManagementList';
import LIST_MANAGEMENT_COLUMNS from '@libs/userManagement/constants/listManagementColumns';
import { entriesToRows, rowsToEntries } from '@libs/userManagement/utils/csvUtils';
import EditableTable, { type CellCallbacks } from '@/pages/LinuxmusterPage/components/EditableTable';
import useUserManagementStore from '../../useUserManagementStore';
import getListManagementColumns from './getListManagementColumns';

interface ListManagementTabProps {
  userType: UserType;
}

const ListManagementTab: React.FC<ListManagementTabProps> = ({ userType }) => {
  const { t } = useTranslation();
  const { user } = useLmnApiStore();
  const { selectedSchool } = useClassManagementStore();
  const { isSuperAdmin, isAuthReady } = useLdapGroups();
  const effectiveSchool = isSuperAdmin ? selectedSchool : selectedSchool || user?.school || '';
  const {
    isLoadingList,
    isBackgroundFetchingList,
    fetchManagementList,
    getListData,
    setManagementListEntries,
    addDeletedEntryIndex,
  } = useUserManagementStore();

  const managementList = USER_TYPE_TO_MANAGEMENT_LIST[userType];
  const listData = getListData(managementList ?? '');
  const { managementListEntries, savedListEntries, deletedEntryIndices } = listData;

  const [rows, setRows] = useState<ListManagementRow[]>([]);
  const isInternalChange = useRef(false);
  const prevSchoolRef = useRef(effectiveSchool);

  useEffect(() => {
    if (!isAuthReady) return;
    if (effectiveSchool && managementList) {
      const schoolChanged = prevSchoolRef.current !== effectiveSchool;
      prevSchoolRef.current = effectiveSchool;
      if (schoolChanged) {
        setRows([]);
      }
      void fetchManagementList(effectiveSchool, managementList, schoolChanged || undefined);
    }
  }, [effectiveSchool, managementList, isAuthReady]);

  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (managementList && managementListEntries.length > 0) {
      setRows(entriesToRows(managementListEntries, managementList));
    } else {
      setRows([]);
    }
  }, [managementListEntries, managementList]);

  const handleRowsChange = useCallback(
    (newRows: ListManagementRow[]) => {
      if (!managementList) return;
      setRows(newRows);
      isInternalChange.current = true;
      const entries = rowsToEntries(newRows, managementListEntries, managementList);
      setManagementListEntries(managementList, entries);
    },
    [managementList, managementListEntries, setManagementListEntries],
  );

  const deletedIndexSet = useMemo(() => new Set(deletedEntryIndices), [deletedEntryIndices]);

  const deletedRowIds = useMemo(() => {
    const ids = new Set<string>();
    deletedEntryIndices.forEach((i) => {
      if (rows[i]) ids.add(rows[i].id);
    });
    return ids;
  }, [rows, deletedEntryIndices]);

  const handleDeleteRow = useCallback(
    (rowIndex: number) => {
      if (managementList) {
        addDeletedEntryIndex(managementList, rowIndex);
      }
    },
    [managementList, addDeletedEntryIndex],
  );

  const { newRowIds, changedCells } = useMemo(() => {
    if (!managementList) return { newRowIds: new Set<string>(), changedCells: new Set<string>() };
    const newIds = new Set<string>();
    const changed = new Set<string>();
    const columns = LIST_MANAGEMENT_COLUMNS[managementList];

    rows.forEach((row, index) => {
      if (deletedIndexSet.has(index)) return;
      if (index >= savedListEntries.length) {
        newIds.add(row.id);
      } else {
        const savedEntry = savedListEntries[index];
        const currentEntry = managementListEntries[index];
        if (currentEntry && savedEntry) {
          columns.forEach((col) => {
            const currentValue = currentEntry[col.entryKey] ?? '';
            const savedValue = savedEntry[col.entryKey] ?? '';
            if (currentValue !== savedValue) {
              changed.add(`${row.id}-${col.key}`);
            }
          });
        }
      }
    });

    return { newRowIds: newIds, changedCells: changed };
  }, [rows, managementListEntries, savedListEntries, managementList, deletedIndexSet]);

  const getColumns = useCallback(
    (callbacks: CellCallbacks) =>
      getListManagementColumns({
        managementList: managementList!,
        ...callbacks,
      }),
    [managementList],
  );

  if (!managementList) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        {t('usermanagement.noListAvailable')}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {isLoadingList || isBackgroundFetchingList ? <HorizontalLoader /> : <div className="h-1" />}
      <EditableTable<ListManagementRow>
        rows={rows}
        newRowIds={newRowIds}
        changedCells={changedCells}
        deletedRowIds={deletedRowIds}
        onRowsChange={handleRowsChange}
        onDeleteRow={handleDeleteRow}
        getColumns={getColumns}
        initialSorting={[{ id: LIST_MANAGEMENT_COLUMNS[managementList][0].key, desc: false }]}
      />
    </div>
  );
};

export default ListManagementTab;
