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
