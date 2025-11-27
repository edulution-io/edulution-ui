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

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OnChangeFn, Row, RowSelectionState } from '@tanstack/react-table';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import APPS from '@libs/appconfig/constants/apps';
import StandardActionTypes from '@libs/common/constants/standardActionTypes';
import { TableActionsConfig } from '@libs/common/types/tableActionsConfig';
import UserAccountDto from '@libs/user/types/userAccount.dto';
import useUserStore from '@/store/UserStore/useUserStore';
import useTableActions from '@/hooks/useTableActions';
import UserAccountsTableColumns from './UserAccountsTableColumns';
import AddUserAccountDialog from './AddUserAccountDialog';
import DeleteUserAccountsDialog from './DeleteUserAccountsDialog';

const UserAccountsTable: React.FC = () => {
  const { t } = useTranslation();
  const { userAccounts, selectedRows, userAccountsIsLoading, setSelectedRows, getUserAccounts, deleteUserAccount } =
    useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const keys = Object.keys(selectedRows);
  const isOneRowSelected = keys.length === 1;

  useEffect(() => {
    void getUserAccounts();
  }, []);

  const handleAddClick = () => {
    setIsOpen(!isOpen);
  };

  const handleRemoveClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
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

  const selectedRowsArray = useMemo(
    () =>
      Object.entries(selectedRows)
        .filter(([_, isSelected]) => isSelected)
        .map(([rowId]) => {
          const idx = parseInt(rowId, 10);
          return { original: userAccounts[idx] } as Row<UserAccountDto>;
        }),
    [selectedRows, userAccounts],
  );

  const actionsConfig = useMemo<TableActionsConfig<UserAccountDto>>(
    () => [
      {
        type: StandardActionTypes.ADD_OR_EDIT,
        onClick: handleAddClick,
      },
      {
        type: StandardActionTypes.REMOVE,
        onClick: handleRemoveClick,
        visible: ({ hasSelection }) => hasSelection,
      },
    ],
    [],
  );

  const tableActions = useTableActions(actionsConfig, selectedRowsArray);

  const selectedAccounts = Object.entries(selectedRows)
    .filter(([_, isSelected]) => isSelected)
    .map(([rowId]) => {
      const idx = parseInt(rowId, 10);
      return userAccounts[idx];
    });

  return (
    <>
      <div>
        <h2>{t('usersettings.security.passwordSafe')}</h2>
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
            actions={tableActions}
          />
        </div>
      </div>
      <AddUserAccountDialog
        isOpen={isOpen}
        isOneRowSelected={isOneRowSelected}
        keys={keys}
        handleOpenChange={handleClose}
      />
      <DeleteUserAccountsDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        selectedAccounts={selectedAccounts}
        onConfirmDelete={handleConfirmDelete}
        isLoading={userAccountsIsLoading}
      />
    </>
  );
};

export default UserAccountsTable;
