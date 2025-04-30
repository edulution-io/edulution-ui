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

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoAdd, IoRemove } from 'react-icons/io5';
import { FiEdit } from 'react-icons/fi';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import APPS from '@libs/appconfig/constants/apps';
import { Button } from '@/components/shared/Button';
import useUserStore from '@/store/UserStore/UserStore';
import UserAccountsTableColumns from './UserAccountsTableColumns';
import AddUserAccount from './AddUserAccount';

const UserAccountsTable: React.FC = () => {
  const { t } = useTranslation();
  const { userAccounts, selectedRows, userAccountsIsLoading, setSelectedRows, getUserAccounts, deleteUserAccount } =
    useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const keys = Object.keys(selectedRows);
  const isOneRowSelected = keys.length === 1;

  useEffect(() => {
    void getUserAccounts();
  }, []);

  const handleAddClick = () => {
    setIsOpen(!isOpen);
  };

  const handleRemoveClick = async () => {
    await Promise.all(
      Object.entries(selectedRows)
        .filter(([_, isSelected]) => isSelected)
        .map(async ([rowId]) => {
          const idx = parseInt(rowId, 10);
          await deleteUserAccount(userAccounts[idx].accountId);
        }),
    );

    setSelectedRows({});
  };

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  const handleClose = () => {
    setIsOpen(!isOpen);
    setSelectedRows({});
  };

  return (
    <>
      <div>
        <h3>{t('usersettings.security.passwordSafe')}</h3>
        <p>{t('usersettings.security.passwordSafeInfo')}</p>
        <div>
          <ScrollableTable
            columns={UserAccountsTableColumns}
            data={userAccounts}
            filterKey="appName"
            filterPlaceHolderText="usersettings.security.filterPlaceHolderText"
            applicationName={APPS.USER_SETTINGS}
            enableRowSelection
            onRowSelectionChange={handleRowSelectionChange}
            selectedRows={selectedRows}
            isLoading={userAccountsIsLoading}
          />
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex w-full">
              <Button
                className="flex h-2 w-full items-center justify-center rounded-md border border-gray-500 hover:bg-accent"
                onClick={handleAddClick}
                type="button"
              >
                {isOneRowSelected ? (
                  <FiEdit className="text-xl text-background" />
                ) : (
                  <IoAdd className="text-xl text-background" />
                )}
              </Button>
            </div>
            <div className="flex w-full">
              <Button
                className="flex h-2 w-full items-center justify-center rounded-md border border-gray-500 hover:bg-accent"
                onClick={handleRemoveClick}
                type="button"
              >
                <IoRemove className="text-xl text-background" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <AddUserAccount
        isOpen={isOpen}
        isOneRowSelected={isOneRowSelected}
        keys={keys}
        handleOpenChange={handleClose}
      />
    </>
  );
};

export default UserAccountsTable;
