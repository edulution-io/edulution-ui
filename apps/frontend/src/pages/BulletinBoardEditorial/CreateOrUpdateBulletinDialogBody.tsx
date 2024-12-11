import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, FormMessage } from '@/components/ui/Form';
import { UseFormReturn } from 'react-hook-form';
import FormField from '@/components/shared/FormField';
import BulletinDialogForm from '@libs/bulletinBoard/types/bulletinDialogForm';
import { DropdownMenu } from '@/components';
import useAppConfigBulletinTableStore from '@/pages/BulletinBoard/useAppConfigBulletinTableStore';
import WysiwygEditor from '@/components/shared/WysiwygEditor';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoardEditorial/useBulletinBoardEditorialPageStore';
import { BULLETIN_BOARD_ATTACHMENT_EDU_API_ENDPOINT } from '@libs/bulletinBoard/constants/apiEndpoints';
import DialogSwitch from '@/components/shared/DialogSwitch';
import DateAndTimeInput from '@/components/shared/DateAndTimeInput';

interface CreateOrUpdateBulletinDialogBodyProps {
  form: UseFormReturn<BulletinDialogForm>;
}

const CreateOrUpdateBulletinDialogBody = ({ form }: CreateOrUpdateBulletinDialogBodyProps) => {
  const { t } = useTranslation();
  const { uploadAttachment } = useBulletinBoardEditorialStore();
  const { tableData, isLoading } = useAppConfigBulletinTableStore();
  const { setValue, watch, formState } = form;

  const isVisibilityDateSet = !!watch('isVisibleStartDate') || !!watch('isVisibleEndDate');
  const [isPermanentlyActive, setIsPermanentlyActive] = useState<boolean>(!isVisibilityDateSet);

  useEffect(() => {
    setIsPermanentlyActive(!isVisibilityDateSet);
  }, [isVisibilityDateSet]);

  useEffect(() => {
    if (isPermanentlyActive) {
      setValue('isVisibleStartDate', null);
      setValue('isVisibleEndDate', null);
    }
  }, [isPermanentlyActive]);

  const handleCategoryChange = (categoryName: string) => {
    form.setValue('category', tableData.find((c) => c.name === categoryName) || tableData[0]);
  };

  const handleUpload = async (file: File): Promise<string> => {
    const filePath = await uploadAttachment(file);
    const filenames = form.getValues('attachmentFileNames') || [];
    form.setValue('attachmentFileNames', [...filenames, filePath]);
    return `${BULLETIN_BOARD_ATTACHMENT_EDU_API_ENDPOINT}/${filePath}`;
  };

  const isActive = watch('isActive');

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
          options={tableData}
          selectedVal={isLoading ? t('common.loading') : watch('category')?.name}
          handleChange={handleCategoryChange}
          variant="light"
        />

        <DialogSwitch
          translationId="bulletinboard.isActive"
          checked={isActive}
          onCheckedChange={(isChecked) => {
            setValue('isActive', isChecked);
          }}
        />

        {isActive && (
          <DialogSwitch
            translationId="bulletinboard.isPermanentlyActive"
            checked={isPermanentlyActive}
            onCheckedChange={(isChecked) => {
              setIsPermanentlyActive(isChecked);
            }}
          />
        )}

        {isActive && !isPermanentlyActive && (
          <>
            <DateAndTimeInput
              form={form}
              name="isVisibleStartDate"
              translationId="bulletinboard.activeFrom"
            />
            <DateAndTimeInput
              form={form}
              name="isVisibleEndDate"
              translationId="bulletinboard.activeUntil"
            />
          </>
        )}

        <FormField
          name="title"
          defaultValue={form.getValues('title')}
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
        <div>
          {formState.errors.content && (
            <FormMessage className="text-p">{formState.errors.content.message?.toString()}</FormMessage>
          )}
        </div>
      </form>
    </Form>
  );
};

export default CreateOrUpdateBulletinDialogBody;
