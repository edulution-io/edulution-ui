import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, FormMessage } from '@/components/ui/Form';
import { UseFormReturn } from 'react-hook-form';
import FormField from '@/components/shared/FormField';
import { DropdownSelect } from '@/components';
import useBulletinCategoryTableStore from '@/pages/Settings/AppConfig/bulletinboard/useBulletinCategoryTableStore';
import WysiwygEditor from '@/components/shared/WysiwygEditor';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoardEditorial/useBulletinBoardEditorialPageStore';
import { BULLETIN_BOARD_ATTACHMENT_EDU_API_ENDPOINT } from '@libs/bulletinBoard/constants/apiEndpoints';
import DialogSwitch from '@/components/shared/DialogSwitch';
import DateAndTimeInput from '@/components/shared/DateAndTimeInput';
import CreateBulletinDto from '@libs/bulletinBoard/types/createBulletinDto';

interface CreateOrUpdateBulletinDialogBodyProps {
  form: UseFormReturn<CreateBulletinDto>;
}

const CreateOrUpdateBulletinDialogBody = ({ form }: CreateOrUpdateBulletinDialogBodyProps) => {
  const { t } = useTranslation();
  const { uploadAttachment } = useBulletinBoardEditorialStore();
  const { tableContentData, isLoading } = useBulletinCategoryTableStore();
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
    form.setValue('category', tableContentData.find((c) => c.name === categoryName) || tableContentData[0]);
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
        <div>
          <div className="mb-1 font-bold">{t('bulletinboard.category')}</div>
          <DropdownSelect
            options={tableContentData}
            selectedVal={isLoading ? t('common.loading') : watch('category')?.name}
            handleChange={handleCategoryChange}
            variant="light"
          />
          <div>
            {formState.errors.category && (
              <FormMessage className="text-[0.8rem] font-medium text-foreground">
                {formState.errors.category.message?.toString()}
              </FormMessage>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="font-bold">{t('bulletinboard.settings')}</div>
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
        </div>

        <FormField
          name="title"
          defaultValue={form.getValues('title')}
          form={form}
          labelTranslationId={t('bulletinboard.title')}
          variant="default"
        />
        <div>
          <div className="mb-1 font-bold">{t('bulletinboard.content')}</div>
          <WysiwygEditor
            value={watch('content')}
            onChange={(value) => setValue('content', value)}
            onUpload={handleUpload}
          />
          <div>
            {formState.errors.content && (
              <FormMessage className="text-[0.8rem] font-medium text-foreground">
                {formState.errors.content.message?.toString()}
              </FormMessage>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
};

export default CreateOrUpdateBulletinDialogBody;