import React, { useEffect } from 'react';
import { Button } from '@/components/shared/Button';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoardEditorial/useBulletinBoardEditorialPageStore';
import CircleLoader from '@/components/ui/CircleLoader';
import BulletinDialogForm from '@libs/bulletinBoard/types/bulletinDialogForm';
import useAppConfigBulletinTableStore from '@/pages/BulletinBoard/useAppConfigBulletinTableStore';
import getBulletinFormSchema from '@libs/bulletinBoard/constants/bulletinDialogFormSchema';
import CreateOrUpdateBulletinDialogBody from '@/pages/BulletinBoardEditorial/CreateOrUpdateBulletinDialogBody';

interface BulletinCreateDialogProps {
  trigger?: React.ReactNode;
}

const CreateOrUpdateBulletinDialog = ({ trigger }: BulletinCreateDialogProps) => {
  const { t } = useTranslation();
  const {
    isDialogLoading,
    isCreateBulletinDialogOpen,
    updateBulletin,
    getBulletins,
    createBulletin,
    selectedBulletinToEdit,
    setSelectedBulletinToEdit,
    setIsCreateBulletinDialogOpen,
  } = useBulletinBoardEditorialStore();
  const { categories, fetchCategories } = useAppConfigBulletinTableStore();

  useEffect(() => {
    void fetchCategories();
  }, []);

  const initialFormValues: BulletinDialogForm = selectedBulletinToEdit || {
    title: '',
    category: categories[0],
    attachmentFileNames: [],
    content: '',
    isActive: true,
    isVisibleEndDate: null,
    isVisibleStartDate: null,
  };

  const form = useForm<BulletinDialogForm>({
    mode: 'onChange',
    resolver: zodResolver(getBulletinFormSchema(t)),
    defaultValues: initialFormValues,
  });

  useEffect(() => {
    form.reset(initialFormValues);
  }, [selectedBulletinToEdit, categories, form]);

  const onSubmit = async () => {
    if (selectedBulletinToEdit) {
      await updateBulletin(selectedBulletinToEdit.id, form.getValues());
    } else {
      await createBulletin(form.getValues());
    }
    setIsCreateBulletinDialogOpen(false);
    setSelectedBulletinToEdit(null);
    await getBulletins();
    form.reset(initialFormValues);
  };

  const handleFormSubmit = form.handleSubmit(onSubmit);

  const getDialogBody = () => {
    if (isDialogLoading) return <CircleLoader />;
    return <CreateOrUpdateBulletinDialogBody form={form} />;
  };

  const getFooter = () => (
    <div className="mt-4 flex justify-end">
      <form onSubmit={handleFormSubmit}>
        <Button
          variant="btn-collaboration"
          disabled={isDialogLoading}
          size="lg"
          type="submit"
        >
          {t('common.save')}
        </Button>
      </form>
    </div>
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
      title={t(`bulletinboard.${selectedBulletinToEdit ? 'editBulletin' : 'createBulletin'}`)}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default CreateOrUpdateBulletinDialog;
