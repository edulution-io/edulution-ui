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

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, FormMessage } from '@/components/ui/Form';
import { UseFormReturn } from 'react-hook-form';
import FormField from '@/components/shared/FormField';
import { DropdownSelect } from '@/components';
import WysiwygEditor from '@/components/shared/WysiwygEditor/WysiwygEditor';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoard/BulletinBoardEditorial/useBulletinBoardEditorialStore';
import { BULLETIN_BOARD_ATTACHMENT_EDU_API_ENDPOINT } from '@libs/bulletinBoard/constants/apiEndpoints';
import DialogSwitch from '@/components/shared/DialogSwitch';
import CreateBulletinDto from '@libs/bulletinBoard/types/createBulletinDto';
import DateTimePickerField from '@/components/ui/DateTimePicker/DateTimePickerField';

interface CreateOrUpdateBulletinDialogBodyProps {
  form: UseFormReturn<CreateBulletinDto>;
}

const CreateOrUpdateBulletinDialogBody = ({ form }: CreateOrUpdateBulletinDialogBodyProps) => {
  const { t } = useTranslation();
  const { uploadAttachment, categoriesWithEditPermission, isGetCategoriesLoading } = useBulletinBoardEditorialStore();
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
    form.setValue(
      'category',
      categoriesWithEditPermission.find((c) => c.id === categoryName) || categoriesWithEditPermission[0],
    );
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
            options={categoriesWithEditPermission}
            selectedVal={isGetCategoriesLoading ? t('common.loading') : watch('category')?.id}
            handleChange={handleCategoryChange}
            variant="dialog"
          />
          <div>
            {formState.errors.category && (
              <FormMessage className="text-[0.8rem] font-medium text-background">
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
              <DateTimePickerField
                form={form}
                path="isVisibleStartDate"
                translationId="bulletinboard.activeFrom"
                variant="dialog"
              />
              <DateTimePickerField
                form={form}
                path="isVisibleEndDate"
                translationId="bulletinboard.activeUntil"
                variant="dialog"
              />
            </>
          )}
        </div>

        <FormField
          name="title"
          defaultValue={form.getValues('title')}
          form={form}
          labelTranslationId={t('bulletinboard.title')}
          variant="dialog"
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
              <FormMessage className="text-[0.8rem] font-medium text-background">
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
