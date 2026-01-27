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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form, FormControl, FormFieldSH, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { UseFormReturn } from 'react-hook-form';
import FormField from '@/components/shared/FormField';
import { DropdownSelect } from '@/components';
import { Textarea } from '@/components/ui/Textarea';
import WysiwygEditor from '@/components/shared/WysiwygEditor/WysiwygEditor';
import useBulletinBoardEditorialStore from '@/pages/BulletinBoard/BulletinBoardEditorial/useBulletinBoardEditorialStore';
import { BULLETIN_BOARD_ATTACHMENT_EDU_API_ENDPOINT } from '@libs/bulletinBoard/constants/apiEndpoints';
import DialogSwitch from '@/components/shared/DialogSwitch';
import CreateBulletinDto from '@libs/bulletinBoard/types/createBulletinDto';
import BULLETIN_SAVE_MODE from '@libs/bulletinBoard/constants/bulletinSaveMode';
import BulletinSaveModeType from '@libs/bulletinBoard/types/bulletinSaveModeType';
import CUSTOM_PUSH_BODY_MAX_LENGTH from '@libs/bulletinBoard/constants/customPushBodyMaxLength';
import DateTimePickerField from '@/components/ui/DateTimePicker/DateTimePickerField';

interface CreateOrUpdateBulletinDialogBodyProps {
  form: UseFormReturn<CreateBulletinDto>;
}

const CreateOrUpdateBulletinDialogBody = ({ form }: CreateOrUpdateBulletinDialogBodyProps) => {
  const { t } = useTranslation();
  const { uploadAttachment, categoriesWithEditPermission, isGetCategoriesLoading } = useBulletinBoardEditorialStore();
  const { setValue, watch, formState } = form;

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
  const saveMode = watch('saveMode');
  const watchedTitle = watch('title');
  const watchedCategory = watch('category');

  const saveModeOptions = [
    { id: BULLETIN_SAVE_MODE.PUSH_AND_BULLETIN, name: t('bulletinboard.saveModes.pushAndBulletin') },
    { id: BULLETIN_SAVE_MODE.BULLETIN_ONLY, name: t('bulletinboard.saveModes.bulletinOnly') },
    { id: BULLETIN_SAVE_MODE.PUSH_ONLY, name: t('bulletinboard.saveModes.pushOnly') },
  ];

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

        {saveMode !== BULLETIN_SAVE_MODE.PUSH_ONLY && (
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
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <DateTimePickerField
                    form={form}
                    path="isVisibleStartDate"
                    translationId="bulletinboard.activeFrom"
                    variant="dialog"
                    placeholder={t('bulletinboard.activeFromPlaceholder')}
                  />
                </div>
                <div className="w-full sm:w-1/2">
                  <DateTimePickerField
                    form={form}
                    path="isVisibleEndDate"
                    translationId="bulletinboard.activeUntil"
                    variant="dialog"
                    placeholder={t('bulletinboard.activeUntilPlaceholder')}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="font-bold">{t('bulletinboard.pushNotification')}</div>
          <div>
            <div className="mb-1">{t('bulletinboard.saveMode')}</div>
            <DropdownSelect
              options={saveModeOptions}
              selectedVal={saveMode || BULLETIN_SAVE_MODE.PUSH_AND_BULLETIN}
              handleChange={(value) => setValue('saveMode', value as BulletinSaveModeType)}
              variant="dialog"
            />
          </div>
          {saveMode !== BULLETIN_SAVE_MODE.BULLETIN_ONLY && (
            <>
              <FormField
                name="customPushTitle"
                form={form}
                labelTranslationId={t('bulletinboard.customPushTitle')}
                variant="dialog"
                placeholder={t('bulletinboard.customPushTitlePlaceholder', { title: watchedTitle || '{title}' })}
              />
              <FormFieldSH
                control={form.control}
                name="customPushBody"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-background">{t('bulletinboard.customPushBody')}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={(field.value as string) || ''}
                        maxLength={CUSTOM_PUSH_BODY_MAX_LENGTH}
                        className="min-h-20 bg-white text-background dark:border-none dark:bg-accent"
                        placeholder={t('bulletinboard.customPushBodyPlaceholder', {
                          category: watchedCategory?.name || '{category}',
                        })}
                      />
                    </FormControl>
                    <div className="flex justify-between">
                      <FormMessage className="text-[0.8rem] font-medium text-background" />
                      <span className="text-xs text-muted-foreground">
                        {((field.value as string) || '').length}/{CUSTOM_PUSH_BODY_MAX_LENGTH}
                      </span>
                    </div>
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        {saveMode !== BULLETIN_SAVE_MODE.PUSH_ONLY && (
          <>
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
                value={watch('content') || ''}
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
          </>
        )}
      </form>
    </Form>
  );
};

export default CreateOrUpdateBulletinDialogBody;
