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

const CreateAndUpdateBulletinCategoryDialog = () => {
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

  const initialFormValues = selectedCategory || {
    name: '',
    isActive: true,
    visibleForUsers: [],
    visibleForGroups: [],
    editableByUsers: [],
    editableByGroups: [],
    position: 1,
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
    setDialogOpen(false);
    setSelectedCategory(null);
    reset();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCategory) {
      const { name, isActive, visibleForUsers, visibleForGroups, editableByUsers, editableByGroups } = getValues();
      await updateCategory(selectedCategory?.id || '', {
        name: name?.trim() !== '' ? name : selectedCategory.name,
        isActive,
        visibleForUsers,
        visibleForGroups,
        editableByUsers,
        editableByGroups,
        position: selectedCategory.position,
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
        setDialogOpen(false);
        setIsDeleteDialogOpen(true);
      }}
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
        isOpen={isDialogOpen}
        handleOpenChange={() => {
          setDialogOpen(false);
          setSelectedCategory(null);
        }}
        title={selectedCategory ? t('bulletinboard.editCategory') : t('bulletinboard.createNewCategory')}
        body={getDialogBody()}
        footer={getFooter()}
        mobileContentClassName="bg-black h-fit h-max-1/2"
      />
      <DeleteBulletinsCategoriesDialog />
    </>
  );
};

export default CreateAndUpdateBulletinCategoryDialog;
