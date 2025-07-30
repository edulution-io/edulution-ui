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
