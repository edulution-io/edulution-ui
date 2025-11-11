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
