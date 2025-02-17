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
import { Button } from '@/components/shared/Button';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import CircleLoader from '@/components/ui/CircleLoader';

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

  const dialogFooter = (
    <div className="mt-4 flex justify-end text-background">
      <Button
        type="button"
        variant="btn-collaboration"
        size="lg"
        onClick={handleDelete}
        disabled={isLoading}
      >
        {t('common.delete')}
      </Button>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isDeleteAppConfigDialogOpen}
      handleOpenChange={() => setIsDeleteAppConfigDialogOpen(false)}
      title={t('settings.deleteApp.title')}
      body={getDialogBody()}
      footer={dialogFooter}
    />
  );
};

export default DeleteAppConfigDialog;
