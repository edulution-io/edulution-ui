import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from '@/components/ui/Form';
import { UseFormReturn } from 'react-hook-form';
import FormField from '@/components/shared/FormField';
import BulletinDialogForm from '@libs/bulletinBoard/types/bulletinDialogForm';
import { DropdownMenu } from '@/components';
import useAppConfigBulletinTableStore from '@/pages/BulletinBoard/useAppConfigBulletinTableStore';
import WysiwygEditor from '@/components/shared/WysiwygEditor';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoardEditorial/useBulletinBoardEditorialPageStore';
import { BULLETIN_BOARD_ATTACHMENT_EDU_API_ENDPOINT } from '@libs/bulletinBoard/constants/apiEndpoints';
import DialogSwitch from '@/components/shared/DialogSwitch';

interface CreateOrUpdateBulletinDialogBodyProps {
  form: UseFormReturn<BulletinDialogForm>;
}

const CreateOrUpdateBulletinDialogBody = ({ form }: CreateOrUpdateBulletinDialogBodyProps) => {
  console.log(`form.getValues() ${JSON.stringify(form.getValues(), null, 2)}`);
  const { t } = useTranslation();
  const { uploadAttachment } = useBulletinBoardEditorialStore();
  const { categories, isLoading } = useAppConfigBulletinTableStore();

  const handleCategoryChange = (categoryName: string) => {
    form.setValue('category', categories.find((c) => c.name === categoryName) || categories[0]);
  };

  const handleUpload = async (file: File): Promise<string> => {
    const filePath = await uploadAttachment(file);
    const filenames = form.getValues('attachmentFileNames') || [];
    form.setValue('attachmentFileNames', [...filenames, filePath]);
    return `${BULLETIN_BOARD_ATTACHMENT_EDU_API_ENDPOINT}/${filePath}`;
  };

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div>{t('bulletinboard.category')}</div>
        <DropdownMenu
          options={categories}
          selectedVal={isLoading ? t('common.loading') : form.watch('category')?.name}
          handleChange={handleCategoryChange}
          variant="light"
        />

        <DialogSwitch
          translationId="bulletinboard.isActive"
          checked={form.watch('isActive')}
          onCheckedChange={(isChecked) => {
            form.setValue('isActive', isChecked);
          }}
        />

        <FormField
          name="title"
          form={form}
          labelTranslationId={t('bulletinboard.title')}
          variant="default"
        />
        <div>{t('bulletinboard.content')}</div>
        <WysiwygEditor
          value={form.watch('content')}
          onChange={(value) => form.setValue('content', value)}
          onUpload={handleUpload}
        />
      </form>
    </Form>
  );
};

export default CreateOrUpdateBulletinDialogBody;
