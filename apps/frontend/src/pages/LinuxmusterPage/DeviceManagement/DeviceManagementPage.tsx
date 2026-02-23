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
import { faDesktop } from '@fortawesome/free-solid-svg-icons';
import PageLayout from '@/components/structure/layout/PageLayout';
import HorizontalLoader from '@/components/ui/Loading/HorizontalLoader';
import SchoolSelectorDropdown from '@/pages/ClassManagement/components/SchoolSelectorDropdown';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import useLmnApiStore from '@/store/useLmnApiStore';
import useLdapGroups from '@/hooks/useLdapGroups';
import useSubMenuStore from '@/store/useSubMenuStore';
import { DEVICE_MANAGEMENT_LOCATION } from '@libs/deviceManagement/constants/deviceManagementPaths';
import DEVICE_COLUMNS from '@libs/deviceManagement/constants/deviceColumns';
import { deviceEntriesToRows, deviceRowsToEntries } from '@libs/deviceManagement/utils/deviceCsvUtils';
import { findDuplicates } from '@libs/deviceManagement/utils/deviceValidation';
import type DeviceRow from '@libs/deviceManagement/types/deviceRow';
import EditableTable, { type CellCallbacks } from '@/pages/LinuxmusterPage/components/EditableTable';
import useDeviceManagementStore from './useDeviceManagementStore';
import getDeviceColumns from './components/getDeviceColumns';
import DeviceFloatingButtons from './components/DeviceFloatingButtons';

const DeviceManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useLmnApiStore();
  const { selectedSchool } = useClassManagementStore();
  const { isSuperAdmin, isAuthReady } = useLdapGroups();
  const { setSections } = useSubMenuStore();
  const effectiveSchool = isSuperAdmin ? selectedSchool : selectedSchool || user?.school || '';
  const {
    devices,
    savedDevices,
    deletedIndices,
    isLoading,
    isBackgroundFetching,
    fetchDevices,
    setDeviceEntries,
    addDeletedIndex,
  } = useDeviceManagementStore();

  const [rows, setRows] = useState<DeviceRow[]>([]);
  const isInternalChange = useRef(false);
  const prevSchoolRef = useRef(effectiveSchool);

  useEffect(() => {
    setSections([{ id: DEVICE_MANAGEMENT_LOCATION, label: t('deviceManagement.title') }]);
    return () => setSections([]);
  }, [setSections, t]);

  useEffect(() => {
    if (!isAuthReady) return;
    if (effectiveSchool) {
      const schoolChanged = prevSchoolRef.current !== effectiveSchool;
      prevSchoolRef.current = effectiveSchool;
      if (schoolChanged) {
        setRows([]);
      }
      void fetchDevices(effectiveSchool, schoolChanged || undefined);
    }
  }, [effectiveSchool, isAuthReady]);

  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (devices.length > 0) {
      setRows(deviceEntriesToRows(devices));
    } else {
      setRows([]);
    }
  }, [devices]);

  const handleRowsChange = useCallback(
    (newRows: DeviceRow[]) => {
      setRows(newRows);
      isInternalChange.current = true;
      const entries = deviceRowsToEntries(newRows, devices);
      setDeviceEntries(entries);
    },
    [devices, setDeviceEntries],
  );

  const deletedIndexSet = useMemo(() => new Set(deletedIndices), [deletedIndices]);

  const deletedRowIds = useMemo(() => {
    const ids = new Set<string>();
    deletedIndices.forEach((i) => {
      if (rows[i]) ids.add(rows[i].id);
    });
    return ids;
  }, [rows, deletedIndices]);

  const handleDeleteRow = useCallback(
    (rowIndex: number) => {
      addDeletedIndex(rowIndex);
    },
    [addDeletedIndex],
  );

  const handleDuplicateRow = useCallback(
    (rowIndex: number) => {
      const sourceRow = rows[rowIndex];
      if (!sourceRow) return;
      const newRow: DeviceRow = { ...sourceRow, id: crypto.randomUUID() };
      const newRows = [...rows, newRow];
      setRows(newRows);
      isInternalChange.current = true;
      const sourceEntry = devices[rowIndex];
      if (sourceEntry) {
        setDeviceEntries([...devices, { ...sourceEntry }]);
      }
    },
    [rows, devices, setDeviceEntries],
  );

  const { newRowIds, changedCells } = useMemo(() => {
    const newIds = new Set<string>();
    const changed = new Set<string>();

    rows.forEach((row, index) => {
      if (deletedIndexSet.has(index)) return;
      if (index >= savedDevices.length) {
        newIds.add(row.id);
      } else {
        const savedEntry = savedDevices[index];
        const currentEntry = devices[index];
        if (currentEntry && savedEntry) {
          DEVICE_COLUMNS.forEach((col) => {
            const currentValue = currentEntry[col.apiKey] ?? '';
            const savedValue = savedEntry[col.apiKey] ?? '';
            if (currentValue !== savedValue) {
              changed.add(`${row.id}-${col.key}`);
            }
          });
        }
      }
    });

    return { newRowIds: newIds, changedCells: changed };
  }, [rows, devices, savedDevices, deletedIndexSet]);

  const duplicateCells = useMemo(() => findDuplicates(rows, deletedRowIds), [rows, deletedRowIds]);

  const duplicateCellsRef = useRef(duplicateCells);
  duplicateCellsRef.current = duplicateCells;
  const handleDuplicateRowRef = useRef(handleDuplicateRow);
  handleDuplicateRowRef.current = handleDuplicateRow;

  const getColumns = useCallback(
    (callbacks: CellCallbacks) =>
      getDeviceColumns({
        ...callbacks,
        isDuplicate: (rowId: string, columnKey: string) => duplicateCellsRef.current.has(`${rowId}-${columnKey}`),
        onDuplicateRow: (rowIndex: number) => handleDuplicateRowRef.current(rowIndex),
      }),
    [],
  );

  const nativeAppHeader = {
    title: t('deviceManagement.title'),
    description: t('deviceManagement.description'),
    iconSrc: faDesktop,
  };

  return (
    <PageLayout nativeAppHeader={nativeAppHeader}>
      <div className="flex h-full flex-col pt-1">
        <div className="sticky top-0 z-20 backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-4">
            <div className="ml-auto">{isSuperAdmin && <SchoolSelectorDropdown />}</div>
          </div>
        </div>
        {isLoading || isBackgroundFetching ? <HorizontalLoader /> : <div className="h-1" />}
        <div className="flex-1 overflow-hidden">
          <EditableTable<DeviceRow>
            rows={rows}
            newRowIds={newRowIds}
            changedCells={changedCells}
            deletedRowIds={deletedRowIds}
            onRowsChange={handleRowsChange}
            onDeleteRow={handleDeleteRow}
            getColumns={getColumns}
            initialSorting={[{ id: DEVICE_COLUMNS[0].key, desc: false }]}
          />
        </div>
      </div>
      <DeviceFloatingButtons school={effectiveSchool} />
    </PageLayout>
  );
};

export default DeviceManagementPage;
