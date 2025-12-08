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
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import { ColumnDef } from '@tanstack/react-table';
import type UserAccountDto from '@libs/user/types/userAccount.dto';
import copyToClipboard from '@/utils/copyToClipboard';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useLanguage from '@/hooks/useLanguage';
import getDisplayName from '@/utils/getDisplayName';
import PasswordCell from './PasswordCell';

const UserAccountsTableColumns: ColumnDef<UserAccountDto>[] = [
  {
    id: 'accountId',
    header: () => {},
    meta: {
      translationId: 'usersettings.security.accountId',
    },
    accessorFn: (row) => row.accountId,
    cell: ({ row }) => (
      <SelectableTextCell
        isFirstColumn
        row={row}
        className="max-w-0"
      />
    ),
  },
  {
    id: 'appName',
    header: ({ column }) => <SortableHeader<UserAccountDto, unknown> column={column} />,
    meta: {
      translationId: 'common.application',
    },
    accessorFn: (row) => row.appName,
    cell: ({ row }) => {
      const { appConfigs } = useAppConfigsStore();
      const { language } = useLanguage();

      const displayName = () => {
        const appConfig = appConfigs.find((appCfg) => appCfg.name === row.original.appName);
        if (!appConfig) return row.original.appName;
        return getDisplayName(appConfig, language);
      };

      return (
        <SelectableTextCell
          onClick={() => row.toggleSelected()}
          text={displayName()}
        />
      );
    },
  },
  {
    id: 'accountUser',
    header: ({ column }) => <SortableHeader<UserAccountDto, unknown> column={column} />,
    meta: {
      translationId: 'common.username',
    },
    accessorFn: (row) => row.accountUser,
    cell: ({ row }) => (
      <SelectableTextCell
        onClick={() => copyToClipboard(row.original.accountUser)}
        text={row.original.accountUser}
      />
    ),
  },
  {
    id: 'accountPassword',
    header: ({ column }) => <SortableHeader<UserAccountDto, unknown> column={column} />,
    meta: {
      translationId: 'common.password',
    },
    accessorFn: (row) => row.accountPassword,
    cell: ({ row }) => <PasswordCell accountPassword={row.original.accountPassword} />,
  },
];

export default UserAccountsTableColumns;
