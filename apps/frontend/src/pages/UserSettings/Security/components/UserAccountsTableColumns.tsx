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

import React, { useState } from 'react';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import { ColumnDef } from '@tanstack/react-table';
import type UserAccountDto from '@libs/user/types/userAccount.dto';
import copyToClipboard from '@/utils/copyToClipboard';
import { EyeLightIcon, EyeLightSlashIcon } from '@/assets/icons';

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
        row={row}
        className="max-w-0"
      />
    ),
  },
  {
    id: 'accountUrl',
    header: ({ column }) => <SortableHeader<UserAccountDto, unknown> column={column} />,
    meta: {
      translationId: 'form.url',
    },
    accessorFn: (row) => row.accountUrl,
    cell: ({ row }) => (
      <SelectableTextCell
        onClick={() => row.toggleSelected()}
        text={row.original.accountUrl}
      />
    ),
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
    cell: ({ row }) => {
      const [showPassword, setShowPassword] = useState(false);

      return (
        <div className="flex min-w-64 gap-4">
          <SelectableTextCell
            onClick={() => copyToClipboard(row.original.accountPassword)}
            text={showPassword ? row.original.accountPassword : '********'}
          />
          <button
            type="button"
            onClickCapture={() => setShowPassword((prevValue) => !prevValue)}
          >
            <img
              src={showPassword ? EyeLightIcon : EyeLightSlashIcon}
              alt="eye"
              width="25px"
            />
          </button>{' '}
        </div>
      );
    },
  },
];

export default UserAccountsTableColumns;
