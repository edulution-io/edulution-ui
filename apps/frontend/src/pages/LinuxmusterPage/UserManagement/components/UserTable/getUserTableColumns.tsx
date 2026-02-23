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
import { faCog, faKey } from '@fortawesome/free-solid-svg-icons';
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import type UserType from '@libs/userManagement/types/userType';
import type TableAction from '@libs/common/types/tableAction';
import sortString from '@libs/common/utils/sortString';
import SOPHOMORIX_STATUS_CLASS_MAP from '@libs/userManagement/constants/sophomorixStatusClassMap';
import USER_TYPES_WITH_CLASS from '@libs/userManagement/constants/userTypesWithClass';
import USER_MANAGEMENT_COLUMN_IDS from '@libs/userManagement/constants/userManagementColumnIds';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import TableActionCell from '@/components/ui/Table/TableActionCell';

const getUserManagementActions = (
  user: LmnUserInfo,
  callbacks: { onShowDetails: (user: LmnUserInfo) => void; setCurrentUser: (user: LmnUserInfo) => void },
): TableAction<LmnUserInfo>[] => {
  const { onShowDetails, setCurrentUser } = callbacks;

  return [
    {
      icon: faKey,
      translationId: 'usermanagement.passwordActions',
      onClick: () => setCurrentUser(user),
    },
    {
      icon: faCog,
      translationId: 'usermanagement.details',
      onClick: () => onShowDetails(user),
    },
  ];
};

interface UserTableColumnsProps {
  userType: UserType;
  onShowDetails: (user: LmnUserInfo) => void;
  setCurrentUser: (user: LmnUserInfo) => void;
}

const getUserTableColumns = ({
  userType,
  onShowDetails,
  setCurrentUser,
}: UserTableColumnsProps): ColumnDef<LmnUserInfo>[] => {
  const columns: ColumnDef<LmnUserInfo>[] = [
    {
      id: USER_MANAGEMENT_COLUMN_IDS.CN,
      meta: { translationId: 'usermanagement.login' },
      header: ({ column }) => <SortableHeader<LmnUserInfo, unknown> column={column} />,
      accessorFn: (row) => row.cn,
      cell: ({ row }) => row.original.cn,
      enableSorting: true,
      sortingFn: (rowA, rowB) => sortString(rowA.original.cn, rowB.original.cn),
    },
  ];

  if ((USER_TYPES_WITH_CLASS as ReadonlyArray<string>).includes(userType)) {
    columns.push({
      id: USER_MANAGEMENT_COLUMN_IDS.CLASS,
      meta: { translationId: 'usermanagement.class' },
      header: ({ column }) => <SortableHeader<LmnUserInfo, unknown> column={column} />,
      accessorFn: (row) => row.sophomorixAdminClass,
      cell: ({ row }) => row.original.sophomorixAdminClass || '-',
      enableSorting: true,
      sortingFn: (rowA, rowB) => sortString(rowA.original.sophomorixAdminClass, rowB.original.sophomorixAdminClass),
    });
  }

  columns.push({
    id: USER_MANAGEMENT_COLUMN_IDS.DISPLAY_NAME,
    meta: { translationId: 'usermanagement.name' },
    header: ({ column }) => <SortableHeader<LmnUserInfo, unknown> column={column} />,
    accessorFn: (row) => row.displayName,
    cell: ({ row }) => row.original.displayName || '-',
    enableSorting: true,
    sortingFn: (rowA, rowB) => sortString(rowA.original.displayName, rowB.original.displayName),
  });

  columns.push({
    id: USER_MANAGEMENT_COLUMN_IDS.SOPHOMORIX_STATUS,
    meta: { translationId: 'usermanagement.status' },
    header: ({ column }) => <SortableHeader<LmnUserInfo, unknown> column={column} />,
    accessorFn: (row) => row.sophomorixStatus,
    size: 120,
    cell: ({ row }) => {
      const { t } = useTranslation();
      const status = row.original.sophomorixStatus || '';
      const statusClass = SOPHOMORIX_STATUS_CLASS_MAP[status] || 'bg-gray-500';
      const statusText = status ? t(`usermanagement.sophomorixStatusValues.${status}`) : '-';
      return <span className={`rounded px-2 py-1 text-xs text-white ${statusClass}`}>{statusText}</span>;
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => sortString(rowA.original.sophomorixStatus, rowB.original.sophomorixStatus),
  });

  columns.push({
    id: USER_MANAGEMENT_COLUMN_IDS.ACTIONS,
    header: () => null,
    enableSorting: false,
    size: 50,
    cell: ({ row }) => {
      const actions = getUserManagementActions(row.original, {
        onShowDetails,
        setCurrentUser,
      });
      return (
        <TableActionCell
          actions={actions}
          row={row}
        />
      );
    },
  });

  return columns;
};

export default getUserTableColumns;
