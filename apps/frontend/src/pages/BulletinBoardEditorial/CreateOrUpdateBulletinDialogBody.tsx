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
import DatePicker from '@/components/shared/DatePicker';
import TimeInput from '@/components/shared/TimeInput';

interface CreateOrUpdateBulletinDialogBodyProps {
  form: UseFormReturn<BulletinDialogForm>;
}

const CreateOrUpdateBulletinDialogBody = ({ form }: CreateOrUpdateBulletinDialogBodyProps) => {
  const { t } = useTranslation();
  const { uploadAttachment } = useBulletinBoardEditorialStore();
  const { data, isLoading } = useAppConfigBulletinTableStore();
  const { setValue, watch } = form;

  const handleCategoryChange = (categoryName: string) => {
    form.setValue('category', data.find((c) => c.name === categoryName) || data[0]);
  };

  const handleUpload = async (file: File): Promise<string> => {
    const filePath = await uploadAttachment(file);
    const filenames = form.getValues('attachmentFileNames') || [];
    form.setValue('attachmentFileNames', [...filenames, filePath]);
    return `${BULLETIN_BOARD_ATTACHMENT_EDU_API_ENDPOINT}/${filePath}`;
  };

  const handleIsVisibleStartDateChange = (value: Date | undefined) => {
    setValue('isVisibleStartDate', value || null, { shouldValidate: true });
  };

  const handleIsVisibleEndDateChange = (value: Date | undefined) => {
    setValue('isVisibleEndDate', value || null, { shouldValidate: true });
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
          options={data}
          selectedVal={isLoading ? t('common.loading') : watch('category')?.name}
          handleChange={handleCategoryChange}
          variant="light"
        />

        <DialogSwitch
          translationId="bulletinboard.isActive"
          checked={watch('isActive')}
          onCheckedChange={(isChecked) => {
            setValue('isActive', isChecked);
          }}
        />

        <div className="flex items-center text-foreground">
          {t('bulletinboard.activeFrom')}
          <div className="ml-2">
            <DatePicker
              selected={watch('isVisibleStartDate') || undefined}
              onSelect={handleIsVisibleStartDateChange}
            />
          </div>
          <div className="flex items-center text-foreground">
            <TimeInput
              form={form}
              fieldName="isVisibleStartDate"
            />
          </div>
        </div>

        <div className="flex items-center text-foreground">
          {t('bulletinboard.activeUntil')}
          <div className="ml-2">
            <DatePicker
              selected={watch('isVisibleEndDate') || undefined}
              onSelect={handleIsVisibleEndDateChange}
            />
          </div>
          <div className="flex items-center text-foreground">
            <TimeInput
              form={form}
              fieldName="isVisibleEndDate"
            />
          </div>
        </div>

        <FormField
          name="title"
          form={form}
          labelTranslationId={t('bulletinboard.title')}
          variant="default"
        />
        <div>{t('bulletinboard.content')}</div>
        <WysiwygEditor
          value={watch('content')}
          onChange={(value) => setValue('content', value)}
          onUpload={handleUpload}
        />
      </form>
    </Form>
  );
};

export default CreateOrUpdateBulletinDialogBody;
