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
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoard/BulletinBoardEditorial/useBulletinBoardEditorialStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import ItemDialogList from '@/components/shared/ItemDialogList';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

interface DeleteBulletinsDialogProps {
  trigger?: React.ReactNode;
  onSubmit?: () => Promise<void>;
}

const DeleteBulletinsDialog = ({ trigger, onSubmit }: DeleteBulletinsDialogProps) => {
  const {
    selectedRows,
    isDialogLoading,
    error,
    deleteBulletins,
    bulletins,
    isDeleteBulletinDialogOpen,
    setIsDeleteBulletinDialogOpen,
  } = useBulletinBoardEditorialStore();
  const { t } = useTranslation();

  const selectedBulletinIds = Object.keys(selectedRows);
  const selectedBulletins = bulletins.filter((b) => selectedBulletinIds.includes(b.id));
  const isMultiDelete = selectedBulletins.length > 1;

  const handleSubmit = async () => {
    await deleteBulletins(selectedBulletins);
    setIsDeleteBulletinDialogOpen(false);
    if (onSubmit) {
      await onSubmit();
    }
  };

  const getDialogBody = () => {
    if (isDialogLoading) return <CircleLoader className="mx-auto" />;

    return (
      <div className="text-background">
        {error ? (
          <>
            {t('bulletinboard.error')}: {error.message}
          </>
        ) : (
          <ItemDialogList
            deleteWarningTranslationId={
              isMultiDelete ? 'bulletinboard.confirmMultiDelete' : 'bulletinboard.confirmSingleDelete'
            }
            items={selectedBulletins.map((b) => ({ name: b.title, id: b.id }))}
          />
        )}
      </div>
    );
  };

  const handleClose = () => setIsDeleteBulletinDialogOpen(false);

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      handleSubmit={handleSubmit}
      submitButtonText="common.delete"
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isDeleteBulletinDialogOpen}
      trigger={trigger}
      handleOpenChange={handleClose}
      title={t(isMultiDelete ? 'bulletinboard.deleteBulletins' : 'bulletinboard.deleteBulletin', {
        count: selectedBulletins.length,
      })}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default DeleteBulletinsDialog;
