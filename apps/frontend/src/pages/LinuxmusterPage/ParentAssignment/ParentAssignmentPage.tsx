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

import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import getTokenPayload from '@libs/common/utils/getTokenPayload';
import PARENT_CHILD_PAIRING_STATUS from '@libs/parent-child-pairing/constants/parentChildPairingStatus';
import PARENT_CHILD_PAIRING_STATUS_FILTER_ALL from '@libs/parent-child-pairing/constants/parentChildPairingStatusFilterAll';
import type ParentChildPairingDto from '@libs/parent-child-pairing/types/parentChildPairingDto';
import type FilterOption from '@libs/ui/types/filterOption';
import { cn } from '@edulution-io/ui-kit';
import { LinuxmusterIcon } from '@/assets/icons';
import { DropdownSelect } from '@/components';
import PageLayout from '@/components/structure/layout/PageLayout';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import TableFilterDropdown from '@/components/ui/Table/TableFilterDropdown';
import HorizontalLoader from '@/components/ui/Loading/HorizontalLoader';
import useLdapGroups from '@/hooks/useLdapGroups';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import useUserStore from '@/store/UserStore/useUserStore';
import useParentAssignmentStore from './useParentAssignmentStore';
import getParentAssignmentColumns from './getParentAssignmentColumns';
import ParentAssignmentFloatingButtons from './ParentAssignmentFloatingButtons';

const ParentAssignmentPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    pairings,
    isLoading,
    statusFilter,
    selectedRows,
    fetchPairings,
    updateStatus,
    setStatusFilter,
    setSelectedSchool,
    setSelectedRows,
  } = useParentAssignmentStore();
  const { isSuperAdmin, isAuthReady } = useLdapGroups();
  const { selectedSchool: classManagementSchool, schools, getSchools } = useClassManagementStore();
  const eduApiToken = useUserStore((s) => s.eduApiToken);

  const userSchool = useMemo(() => {
    if (!eduApiToken) return '';
    return getTokenPayload(eduApiToken).school;
  }, [eduApiToken]);

  useEffect(() => {
    if (!isAuthReady) return;
    if (isSuperAdmin) {
      void getSchools();
      if (classManagementSchool) {
        setSelectedSchool(classManagementSchool);
      }
    } else if (userSchool) {
      setSelectedSchool(userSchool);
    }
  }, [isSuperAdmin, isAuthReady, classManagementSchool, userSchool, setSelectedSchool, getSchools]);

  const schoolOptions = useMemo(() => {
    if (isSuperAdmin) {
      return schools
        .map((s) => ({ id: s.ou, name: s.displayName || s.ou }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    return userSchool ? [{ id: userSchool, name: userSchool }] : [];
  }, [isSuperAdmin, schools, userSchool]);

  useEffect(() => {
    void fetchPairings();
  }, [fetchPairings]);

  const handleAccept = useCallback(
    (pairing: ParentChildPairingDto) => {
      void updateStatus(pairing.id, PARENT_CHILD_PAIRING_STATUS.ACCEPTED);
    },
    [updateStatus],
  );

  const handleReject = useCallback(
    (pairing: ParentChildPairingDto) => {
      void updateStatus(pairing.id, PARENT_CHILD_PAIRING_STATUS.REJECTED);
    },
    [updateStatus],
  );

  const columns = useMemo(
    () => getParentAssignmentColumns({ onAccept: handleAccept, onReject: handleReject }),
    [handleAccept, handleReject],
  );

  const filterOptions: FilterOption[] = useMemo(
    () => [
      {
        key: 'all',
        translationKey: 'parentChildPairing.statusAll',
        checked: statusFilter === PARENT_CHILD_PAIRING_STATUS_FILTER_ALL,
        onChange: (enabled: boolean) => {
          if (enabled) {
            setStatusFilter(PARENT_CHILD_PAIRING_STATUS_FILTER_ALL);
          }
        },
      },
      ...Object.values(PARENT_CHILD_PAIRING_STATUS).map((status) => ({
        key: status,
        translationKey: `parentChildPairing.status${status.charAt(0).toUpperCase()}${status.slice(1)}`,
        checked: statusFilter === status,
        onChange: (enabled: boolean) => {
          if (enabled) {
            setStatusFilter(status);
          }
        },
      })),
    ],
    [statusFilter, setStatusFilter],
  );

  const statusFilterCount = statusFilter !== PARENT_CHILD_PAIRING_STATUS_FILTER_ALL ? 1 : 0;
  const activeFilterCount = statusFilterCount + 1;

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = useCallback(
    (updaterOrValue: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
      const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
      setSelectedRows(newValue);
    },
    [selectedRows, setSelectedRows],
  );

  const handleResetFilters = useCallback(() => {
    setStatusFilter(PARENT_CHILD_PAIRING_STATUS.PENDING);
  }, [setStatusFilter]);

  const nativeAppHeader = {
    title: t('parentChildPairing.assignment'),
    description: t('parentChildPairing.assignmentDescription'),
    iconSrc: LinuxmusterIcon,
  };

  return (
    <PageLayout nativeAppHeader={nativeAppHeader}>
      <div className="flex h-full flex-col">
        {isLoading ? <HorizontalLoader /> : <div className="h-1" />}
        <ScrollableTable
          columns={columns}
          data={pairings}
          filterKey="parent"
          filterPlaceHolderText="parentChildPairing.filterPlaceholder"
          applicationName="parentAssignment"
          getRowId={(row) => row.id}
          enableRowSelection
          selectedRows={selectedRows}
          onRowSelectionChange={handleRowSelectionChange}
          searchBarAdditionalComponent={
            <>
              <TableFilterDropdown
                filterOptions={filterOptions}
                activeFilterCount={activeFilterCount}
                onResetFilters={handleResetFilters}
              />
              <div className={cn('min-w-48', !isSuperAdmin && 'pointer-events-none opacity-70')}>
                <DropdownSelect
                  placeholder={t('classmanagement.selectSchool.placeholder')}
                  options={schoolOptions}
                  selectedVal={isSuperAdmin ? classManagementSchool : userSchool}
                  handleChange={(value) => {
                    if (isSuperAdmin) {
                      useClassManagementStore.getState().setSelectedSchool(value);
                    }
                  }}
                  translate={false}
                />
              </div>
            </>
          }
          activeFilterCount={activeFilterCount}
        />
        <ParentAssignmentFloatingButtons />
      </div>
    </PageLayout>
  );
};

export default ParentAssignmentPage;
