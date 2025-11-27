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
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import ItemDialogList from '@/components/shared/ItemDialogList';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import UserAccountDto from '@libs/user/types/userAccount.dto';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import getDisplayName from '@/utils/getDisplayName';
import useLanguage from '@/hooks/useLanguage';

interface DeleteUserAccountsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAccounts: UserAccountDto[];
  onConfirmDelete: () => Promise<void>;
  isLoading?: boolean;
}

const DeleteUserAccountsDialog: React.FC<DeleteUserAccountsDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedAccounts,
  onConfirmDelete,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const appConfigs = useAppConfigsStore((s) => s.appConfigs);
  const isMultiDelete = selectedAccounts.length > 1;

  const handleClose = () => onOpenChange(false);

  const handleSubmit = async () => {
    await onConfirmDelete();
    handleClose();
  };

  const displayName = (appName: string) => {
    const appConfig = appConfigs.find((appCfg) => appCfg.name === appName);
    if (!appConfig) return appName;
    return getDisplayName(appConfig, language);
  };

  const getDialogBody = () => {
    if (isLoading) return <CircleLoader className="mx-auto" />;

    return (
      <div className="text-background">
        <ItemDialogList
          deleteWarningTranslationId={
            isMultiDelete
              ? 'usersettings.security.confirmMultiDeleteAccount'
              : 'usersettings.security.confirmSingleDeleteAccount'
          }
          items={selectedAccounts
            .filter((account) => account?.accountId)
            .map((account) => ({ name: displayName(account.appName) || '', id: account.accountId }))}
        />
      </div>
    );
  };

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      handleSubmit={handleSubmit}
      submitButtonText="common.delete"
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={handleClose}
      title={t(isMultiDelete ? 'usersettings.security.deleteUserAccounts' : 'usersettings.security.deleteUserAccount', {
        count: selectedAccounts.length,
      })}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default DeleteUserAccountsDialog;
