/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
