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
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

interface AddAppConfigDialogProps {
  handleDeleteSettingsItem: () => void;
}

const DeleteAppConfigDialog: React.FC<AddAppConfigDialogProps> = ({ handleDeleteSettingsItem }) => {
  const { t } = useTranslation();
  const { isDeleteAppConfigDialogOpen, setIsDeleteAppConfigDialogOpen, isLoading } = useAppConfigsStore();

  const getDialogBody = () => {
    if (isLoading) return <CircleLoader className="mx-auto mt-5" />;
    return <p>{t('settings.deleteApp.description')}</p>;
  };

  const handleDelete = () => {
    handleDeleteSettingsItem();
    setIsDeleteAppConfigDialogOpen(false);
  };

  const handleClose = () => setIsDeleteAppConfigDialogOpen(false);

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      submitButtonText="common.delete"
      handleSubmit={handleDelete}
      disableSubmit={isLoading}
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isDeleteAppConfigDialogOpen}
      handleOpenChange={handleClose}
      title={t('settings.deleteApp.title')}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default DeleteAppConfigDialog;
