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

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { faBan, faCheck } from '@fortawesome/free-solid-svg-icons';
import type PairingDto from '@libs/pairing/types/pairingDto';
import type TableAction from '@libs/common/types/tableAction';
import PAIRING_STATUS from '@libs/pairing/constants/pairingStatus';
import sortString from '@libs/common/utils/sortString';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import TableActionCell from '@/components/ui/Table/TableActionCell';

const PAIRING_STATUS_CLASS_MAP: Record<string, string> = {
  [PAIRING_STATUS.PENDING]: 'bg-yellow-500',
  [PAIRING_STATUS.ACCEPTED]: 'bg-green-500',
  [PAIRING_STATUS.REJECTED]: 'bg-red-500',
};

const PAIRING_STATUS_TRANSLATION_MAP: Record<string, string> = {
  [PAIRING_STATUS.PENDING]: 'pairing.statusPending',
  [PAIRING_STATUS.ACCEPTED]: 'pairing.statusAccepted',
  [PAIRING_STATUS.REJECTED]: 'pairing.statusRejected',
};

const COLUMN_IDS = {
  PARENT: 'parent',
  STUDENT: 'student',
  STATUS: 'status',
  CREATED_AT: 'createdAt',
  ACTIONS: 'actions',
} as const;

interface PairingAssignmentColumnsProps {
  onAccept: (pairing: PairingDto) => void;
  onReject: (pairing: PairingDto) => void;
}

const getPairingAssignmentColumns = ({
  onAccept,
  onReject,
}: PairingAssignmentColumnsProps): ColumnDef<PairingDto>[] => [
  {
    id: COLUMN_IDS.PARENT,
    meta: { translationId: 'pairing.parent' },
    header: ({ column }) => <SortableHeader<PairingDto, unknown> column={column} />,
    accessorFn: (row) => row.parent,
    cell: ({ row }) => row.original.parent,
    enableSorting: true,
    sortingFn: (rowA, rowB) => sortString(rowA.original.parent, rowB.original.parent),
  },
  {
    id: COLUMN_IDS.STUDENT,
    meta: { translationId: 'pairing.student' },
    header: ({ column }) => <SortableHeader<PairingDto, unknown> column={column} />,
    accessorFn: (row) => row.student,
    cell: ({ row }) => row.original.student,
    enableSorting: true,
    sortingFn: (rowA, rowB) => sortString(rowA.original.student, rowB.original.student),
  },
  {
    id: COLUMN_IDS.STATUS,
    meta: { translationId: 'pairing.statusColumn' },
    header: ({ column }) => <SortableHeader<PairingDto, unknown> column={column} />,
    accessorFn: (row) => row.status,
    size: 120,
    cell: ({ row }) => {
      const { t } = useTranslation();
      const { status } = row.original;
      const statusClass = PAIRING_STATUS_CLASS_MAP[status] || 'bg-gray-500';
      const translationKey = PAIRING_STATUS_TRANSLATION_MAP[status] || status;
      return <span className={`rounded px-2 py-1 text-xs text-white ${statusClass}`}>{t(translationKey)}</span>;
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => sortString(rowA.original.status, rowB.original.status),
  },
  {
    id: COLUMN_IDS.CREATED_AT,
    meta: { translationId: 'pairing.createdAt' },
    header: ({ column }) => <SortableHeader<PairingDto, unknown> column={column} />,
    accessorFn: (row) => row.createdAt,
    size: 160,
    cell: ({ row }) => {
      const dateStr = row.original.createdAt;
      if (!dateStr) return '-';
      return new Date(dateStr).toLocaleString();
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => sortString(rowA.original.createdAt, rowB.original.createdAt),
  },
  {
    id: COLUMN_IDS.ACTIONS,
    header: () => null,
    enableSorting: false,
    size: 50,
    cell: ({ row }) => {
      const { status } = row.original;
      const actions: TableAction<PairingDto>[] = [];

      if (status !== PAIRING_STATUS.ACCEPTED) {
        actions.push({
          icon: faCheck,
          translationId: 'pairing.accept',
          onClick: () => onAccept(row.original),
        });
      }

      if (status !== PAIRING_STATUS.REJECTED) {
        actions.push({
          icon: faBan,
          translationId: 'pairing.reject',
          onClick: () => onReject(row.original),
        });
      }

      if (actions.length === 0) return null;

      return (
        <TableActionCell
          actions={actions}
          row={row}
        />
      );
    },
  },
];

export default getPairingAssignmentColumns;
