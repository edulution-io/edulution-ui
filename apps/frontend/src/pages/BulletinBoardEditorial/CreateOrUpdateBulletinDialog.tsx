import React, { useEffect } from 'react';
import { Button } from '@/components/shared/Button';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoardEditorial/useBulletinBoardEditorialPageStore';
import CircleLoader from '@/components/ui/CircleLoader';
import useBulletinCategoryTableStore from '@/pages/Settings/AppConfig/bulletinboard/useBulletinCategoryTableStore';
import getBulletinFormSchema from '@libs/bulletinBoard/constants/bulletinDialogFormSchema';
import CreateOrUpdateBulletinDialogBody from '@/pages/BulletinBoardEditorial/CreateOrUpdateBulletinDialogBody';
import { MdDelete, MdUpdate } from 'react-icons/md';
import CreateBulletinDto from '@libs/bulletinBoard/types/createBulletinDto';

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
    deleteBulletins,
    selectedBulletinToEdit,
    setSelectedBulletinToEdit,
    setIsCreateBulletinDialogOpen,
  } = useBulletinBoardEditorialStore();
  const { tableContentData, fetchTableContent } = useBulletinCategoryTableStore();

  useEffect(() => {
    void fetchTableContent();
  }, []);

  const initialFormValues: CreateBulletinDto = selectedBulletinToEdit || {
    title: '',
    category: tableContentData[0],
    attachmentFileNames: [],
    content: '',
    isActive: true,
    isVisibleEndDate: null,
    isVisibleStartDate: null,
  };

  const form = useForm<CreateBulletinDto>({
    mode: 'onChange',
    resolver: zodResolver(getBulletinFormSchema(t)),
    defaultValues: initialFormValues,
  });

  useEffect(() => {
    form.reset(initialFormValues);
  }, [selectedBulletinToEdit, tableContentData, form]);

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
    <form onSubmit={handleFormSubmit}>
      <div className="mt-4 flex justify-end space-x-2">
        {selectedBulletinToEdit && (
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
      title={t(`bulletinboard.${selectedBulletinToEdit ? 'editBulletin' : 'createBulletin'}`)}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default CreateOrUpdateBulletinDialog;
