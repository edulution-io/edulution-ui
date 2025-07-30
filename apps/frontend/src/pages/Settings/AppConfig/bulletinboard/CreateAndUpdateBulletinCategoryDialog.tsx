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
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import useBulletinCategoryTableStore from '@/pages/Settings/AppConfig/bulletinboard/useBulletinCategoryTableStore';
import { useTranslation } from 'react-i18next';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import CreateAndUpdateBulletinCategoryFooter from '@/pages/Settings/AppConfig/bulletinboard/components/CreateAndUpdateBulletinCategoryFooter';
import { useForm } from 'react-hook-form';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';
import { zodResolver } from '@hookform/resolvers/zod';
import getCreateNewCategorieSchema from '@libs/bulletinBoard/constants/createNewCategorieSchema';
import CreateAndUpdateBulletinCategoryBody from '@/pages/Settings/AppConfig/bulletinboard/components/CreateAndUpdateBulletinCategoryBody';
import DeleteBulletinsCategoriesDialog from '@/pages/Settings/AppConfig/bulletinboard/components/DeleteBulletinCategoriesDialog';
import { ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';
import BULLETIN_VISIBILITY_STATES from '@libs/bulletinBoard/constants/bulletinVisibilityStates';

interface CreateAndUpdateBulletinCategoryDialogProps {
  tableId: ExtendedOptionKeysType;
}

const CreateAndUpdateBulletinCategoryDialog: React.FC<CreateAndUpdateBulletinCategoryDialogProps> = ({ tableId }) => {
  const {
    selectedCategory,
    setSelectedCategory,
    updateCategory,
    addNewCategory,
    nameExistsAlready,
    isNameCheckingLoading,
    setIsDeleteDialogOpen,
    tableContentData,
  } = useBulletinCategoryTableStore();

  const { t } = useTranslation();

  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();
  const isOpen = isDialogOpen === tableId;

  const initialFormValues = selectedCategory || {
    name: '',
    isActive: true,
    visibleForUsers: [],
    visibleForGroups: [],
    editableByUsers: [],
    editableByGroups: [],
    position: 1,
    bulletinVisibility: BULLETIN_VISIBILITY_STATES.FULLY_VISIBLE,
  };

  const form = useForm<CreateBulletinCategoryDto>({
    mode: 'onChange',
    resolver: zodResolver(getCreateNewCategorieSchema(t)),
    defaultValues: initialFormValues,
  });

  const { reset, watch, getValues } = form;

  useEffect(() => {
    reset(initialFormValues);
  }, [selectedCategory, reset]);

  const closeDialog = () => {
    setDialogOpen('');
    setSelectedCategory(null);
    reset();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCategory) {
      const {
        name,
        isActive,
        visibleForUsers,
        visibleForGroups,
        editableByUsers,
        editableByGroups,
        bulletinVisibility,
      } = getValues();
      await updateCategory(selectedCategory?.id || '', {
        name: name?.trim() !== '' ? name : selectedCategory.name,
        isActive,
        visibleForUsers,
        visibleForGroups,
        editableByUsers,
        editableByGroups,
        position: selectedCategory.position,
        bulletinVisibility,
      });
    } else {
      await addNewCategory({ ...getValues(), position: tableContentData.length + 1 });
    }
    closeDialog();
  };

  const isCurrentNameEqualToSelected = () =>
    watch('name').trim() === (selectedCategory?.name || '').trim() && watch('name').trim() !== '';

  const isNameValidationFailed = () => isNameCheckingLoading || (!isCurrentNameEqualToSelected() && nameExistsAlready);

  const isSaveButtonDisabled = () => isNameValidationFailed() || !form.formState.isValid;

  const getFooter = () => (
    <CreateAndUpdateBulletinCategoryFooter
      handleFormSubmit={(e: React.FormEvent) => handleFormSubmit(e)}
      isCurrentNameEqualToSelected={isCurrentNameEqualToSelected}
      isSaveButtonDisabled={isSaveButtonDisabled}
      handleDeleteCategory={() => {
        setDialogOpen('');
        setIsDeleteDialogOpen(true);
      }}
      handleClose={closeDialog}
    />
  );

  const getDialogBody = () => (
    <CreateAndUpdateBulletinCategoryBody
      handleFormSubmit={(e: React.FormEvent) => handleFormSubmit(e)}
      form={form}
      isCurrentNameEqualToSelected={isCurrentNameEqualToSelected}
    />
  );

  return (
    <>
      <AdaptiveDialog
        isOpen={isOpen}
        handleOpenChange={() => {
          closeDialog();
        }}
        title={selectedCategory ? t('bulletinboard.editCategory') : t('bulletinboard.createNewCategory')}
        body={getDialogBody()}
        footer={getFooter()}
      />
      <DeleteBulletinsCategoriesDialog />
    </>
  );
};

export default CreateAndUpdateBulletinCategoryDialog;
