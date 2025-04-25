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

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IoAdd, IoRemove } from 'react-icons/io5';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import APPS from '@libs/appconfig/constants/apps';
import { Button } from '@/components/shared/Button';
import useUserStore from '@/store/UserStore/UserStore';
import UserAccountsTableColumns from './UserAccountsTableColumns';

const UserAccountsTable: React.FC = () => {
  const { t } = useTranslation();
  const { user, userAccounts, getUserAccounts } = useUserStore();

  useEffect(() => {
    if (user) {
      void getUserAccounts(user?.username);
    }
  }, [user]);

  const handleAddClick = () => {};

  const handleRemoveClick = async () => {};

  return (
    <>
      <h3 className="text-background">{t('usersettings.config.mfa')}</h3>
      <ScrollableTable
        columns={UserAccountsTableColumns}
        data={userAccounts}
        filterKey="accountId"
        filterPlaceHolderText="test"
        applicationName={APPS.USER_SETTINGS}
        enableRowSelection
      />
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex w-full">
          <Button
            className="flex h-2 w-full items-center justify-center rounded-md border border-gray-500 hover:bg-accent"
            onClick={handleAddClick}
            type="button"
          >
            <IoAdd className="text-xl text-background" />
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
    </>
  );
};

export default UserAccountsTable;
