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
import CircleLoader from '@/components/ui/CircleLoader';
import getBulletinFormSchema from '@libs/bulletinBoard/constants/bulletinDialogFormSchema';
import CreateOrUpdateBulletinDialogBody from '@/pages/BulletinBoard/BulletinBoardEditorial/CreateOrUpdateBulletinDialogBody';
import { MdDelete, MdUpdate } from 'react-icons/md';
import CreateBulletinDto from '@libs/bulletinBoard/types/createBulletinDto';

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
    isVisibleEndDate: selectedBulletinToEdit?.isVisibleEndDate || null,
    isVisibleStartDate: selectedBulletinToEdit?.isVisibleStartDate || null,
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

  const getFooter = () => (
    <form onSubmit={handleFormSubmit}>
      <div className="mt-4 flex justify-end space-x-2">
        {!isDialogLoading && selectedBulletinToEdit?.id && (
          <Button
            variant="btn-attention"
            size="lg"
            type="button"
            onClick={async () => {
              await deleteBulletins([selectedBulletinToEdit]);
              setIsCreateBulletinDialogOpen(false);
              setSelectedBulletinToEdit(null);
            }}
          >
            <MdDelete size={20} />
            {t('common.delete')}
          </Button>
        )}

        <Button
          variant="btn-collaboration"
          disabled={isDialogLoading}
          size="lg"
          type="submit"
        >
          <MdUpdate size={20} />
          {t('common.save')}
        </Button>
      </div>
    </form>
  );

  return (
    <AdaptiveDialog
      isOpen={isCreateBulletinDialogOpen}
      trigger={trigger}
      handleOpenChange={() => {
        setIsCreateBulletinDialogOpen(false);
        setSelectedBulletinToEdit(null);
      }}
      desktopContentClassName="max-w-2xl"
      title={t(`bulletinboard.${selectedBulletinToEdit?.id ? 'editBulletin' : 'createBulletin'}`)}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default CreateOrUpdateBulletinDialog;
