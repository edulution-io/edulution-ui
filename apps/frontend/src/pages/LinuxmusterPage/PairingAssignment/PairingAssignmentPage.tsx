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
import PAIRING_STATUS from '@libs/pairing/constants/pairingStatus';
import PAIRING_STATUS_FILTER_ALL from '@libs/pairing/constants/pairingStatusFilterAll';
import type PairingDto from '@libs/pairing/types/pairingDto';
import type FilterOption from '@libs/ui/types/filterOption';
import APPS from '@libs/appconfig/constants/apps';
import { LinuxmusterIcon } from '@/assets/icons';
import PageLayout from '@/components/structure/layout/PageLayout';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import TableFilterDropdown from '@/components/ui/Table/TableFilterDropdown';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import usePairingAssignmentStore from './usePairingAssignmentStore';
import getPairingAssignmentColumns from './getPairingAssignmentColumns';

const PairingAssignmentPage: React.FC = () => {
  const { t } = useTranslation();
  const { pairings, isLoading, statusFilter, fetchPairings, updateStatus, setStatusFilter } =
    usePairingAssignmentStore();

  useEffect(() => {
    void fetchPairings();
  }, [fetchPairings]);

  const handleAccept = useCallback(
    (pairing: PairingDto) => {
      void updateStatus(pairing.id, PAIRING_STATUS.ACCEPTED);
    },
    [updateStatus],
  );

  const handleReject = useCallback(
    (pairing: PairingDto) => {
      void updateStatus(pairing.id, PAIRING_STATUS.REJECTED);
    },
    [updateStatus],
  );

  const columns = useMemo(
    () => getPairingAssignmentColumns({ onAccept: handleAccept, onReject: handleReject }),
    [handleAccept, handleReject],
  );

  const filterOptions: FilterOption[] = useMemo(
    () => [
      {
        key: 'all',
        translationKey: 'pairing.statusAll',
        checked: statusFilter === PAIRING_STATUS_FILTER_ALL,
        onChange: (enabled: boolean) => {
          if (enabled) {
            setStatusFilter(PAIRING_STATUS_FILTER_ALL);
          }
        },
      },
      ...Object.values(PAIRING_STATUS).map((status) => ({
        key: status,
        translationKey: `pairing.status${status.charAt(0).toUpperCase()}${status.slice(1)}`,
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

  const activeFilterCount = statusFilter !== PAIRING_STATUS_FILTER_ALL ? 1 : 0;

  const handleResetFilters = useCallback(() => {
    setStatusFilter(PAIRING_STATUS.PENDING);
  }, [setStatusFilter]);

  const nativeAppHeader = {
    title: t('pairing.assignment'),
    description: t('pairing.assignmentDescription'),
    iconSrc: LinuxmusterIcon,
  };

  return (
    <PageLayout nativeAppHeader={nativeAppHeader}>
      <div className="relative flex h-full flex-col">
        {isLoading && (
          <div className="absolute right-0 top-0 z-10">
            <CircleLoader />
          </div>
        )}
        <ScrollableTable
          columns={columns}
          data={pairings}
          filterKey="parent"
          filterPlaceHolderText="pairing.filterPlaceholder"
          applicationName={APPS.LINUXMUSTER}
          getRowId={(row) => row.id}
          searchBarAdditionalComponent={
            <TableFilterDropdown
              filterOptions={filterOptions}
              activeFilterCount={activeFilterCount}
              onResetFilters={handleResetFilters}
            />
          }
          activeFilterCount={activeFilterCount}
        />
      </div>
    </PageLayout>
  );
};

export default PairingAssignmentPage;
