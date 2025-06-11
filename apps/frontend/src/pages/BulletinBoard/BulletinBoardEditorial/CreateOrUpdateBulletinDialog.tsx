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
import { Button } from '@/components/shared/Button';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoard/BulletinBoardEditorial/useBulletinBoardEditorialPageStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
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
    if (selectedBulletinToEdit?.id) {
      await updateBulletin(selectedBulletinToEdit.id, form.getValues());
    } else {
      await createBulletin(form.getValues());
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

  const getDialogBody = () => {
    if (isDialogLoading) return <CircleLoader className="mx-auto" />;
    return <CreateOrUpdateBulletinDialogBody form={form} />;
  };

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
