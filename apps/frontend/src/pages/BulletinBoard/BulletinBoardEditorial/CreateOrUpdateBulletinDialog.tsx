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

import React, { useEffect } from 'react';
import { Button } from '@/components/shared/Button';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoard/BulletinBoardEditorial/useBulletinBoardEditorialStore';
import getBulletinFormSchema from '@libs/bulletinBoard/constants/bulletinDialogFormSchema';
import CreateOrUpdateBulletinDialogBody from '@/pages/BulletinBoard/BulletinBoardEditorial/CreateOrUpdateBulletinDialogBody';
import { MdDelete } from 'react-icons/md';
import CreateBulletinDto from '@libs/bulletinBoard/types/createBulletinDto';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

interface BulletinCreateDialogProps {
  trigger?: React.ReactNode;
  onSubmit?: () => Promise<void>;
}

const CreateOrUpdateBulletinDialog = ({ trigger, onSubmit }: BulletinCreateDialogProps) => {
  const { t } = useTranslation();
  const {
    isDialogLoading,
    isCreateBulletinDialogOpen,
    updateBulletin,
    getBulletins,
    categoriesWithEditPermission,
    getCategoriesWithEditPermission,
    createBulletin,
    deleteBulletins,
    selectedBulletinToEdit,
    setSelectedBulletinToEdit,
    setIsCreateBulletinDialogOpen,
  } = useBulletinBoardEditorialStore();

  useEffect(() => {
    if (isCreateBulletinDialogOpen) {
      void getCategoriesWithEditPermission();
    }
  }, [isCreateBulletinDialogOpen]);

  const initialFormValues: CreateBulletinDto = {
    title: selectedBulletinToEdit?.title || '',
    category: selectedBulletinToEdit?.category || categoriesWithEditPermission[0],
    attachmentFileNames: selectedBulletinToEdit?.attachmentFileNames || [],
    content: selectedBulletinToEdit?.content || '',
    isActive: selectedBulletinToEdit?.isActive || true,
    isVisibleEndDate: selectedBulletinToEdit?.isVisibleEndDate
      ? new Date(selectedBulletinToEdit.isVisibleEndDate)
      : null,
    isVisibleStartDate: selectedBulletinToEdit?.isVisibleStartDate
      ? new Date(selectedBulletinToEdit.isVisibleStartDate)
      : null,
  };

  const form = useForm<CreateBulletinDto>({
    mode: 'onChange',
    resolver: zodResolver(getBulletinFormSchema(t)),
    defaultValues: initialFormValues,
  });

  useEffect(() => {
    form.reset(initialFormValues);
  }, [selectedBulletinToEdit, form]);

  const handleSubmit = async () => {
    let success: boolean;
    if (selectedBulletinToEdit?.id) {
      success = await updateBulletin(selectedBulletinToEdit.id, form.getValues());
    } else {
      success = await createBulletin(form.getValues());
    }
    if (!success) {
      return;
    }
    setIsCreateBulletinDialogOpen(false);
    setSelectedBulletinToEdit(null);
    form.reset(initialFormValues);
    if (onSubmit) {
      await onSubmit();
    } else {
      await getBulletins();
    }
  };

  const handleFormSubmit = form.handleSubmit(handleSubmit);

  const getDialogBody = () => <CreateOrUpdateBulletinDialogBody form={form} />;

  const handleClose = () => {
    setIsCreateBulletinDialogOpen(false);
    setSelectedBulletinToEdit(null);
  };

  const getFooter = () => (
    <form onSubmit={handleFormSubmit}>
      <div className="flex gap-4">
        {!isDialogLoading && selectedBulletinToEdit?.id && (
          <Button
            className="mt-4"
            variant="btn-attention"
            size="lg"
            type="button"
            onClick={async () => {
              await deleteBulletins([selectedBulletinToEdit]);
              if (onSubmit) {
                await onSubmit();
              }
              setIsCreateBulletinDialogOpen(false);
              setSelectedBulletinToEdit(null);
            }}
          >
            <MdDelete size={20} />
            {t('common.delete')}
          </Button>
        )}
        <DialogFooterButtons
          handleClose={handleClose}
          handleSubmit={handleFormSubmit}
          submitButtonText="common.save"
          disableSubmit={isDialogLoading}
        />
      </div>
    </form>
  );

  return (
    <AdaptiveDialog
      isOpen={isCreateBulletinDialogOpen}
      trigger={trigger}
      handleOpenChange={handleClose}
      desktopContentClassName="max-w-2xl"
      title={t(`bulletinboard.${selectedBulletinToEdit?.id ? 'editBulletin' : 'createBulletin'}`)}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default CreateOrUpdateBulletinDialog;
