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

import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import { Textarea } from '@/components/ui/Textarea';
import { DropdownSelect } from '@/components';
import DialogSwitch from '@/components/shared/DialogSwitch';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import useGroupStore from '@/store/GroupStore';
import useAiChatModelTableStore from '@/pages/Settings/AppConfig/chat/useAiChatModelTableStore';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import CreateAiChatModelDto from '@libs/aiChatModel/types/createAiChatModelDto';

interface CreateAndUpdateAiChatModelBodyProps {
  handleFormSubmit: (e: React.FormEvent) => void;
  form: UseFormReturn<CreateAiChatModelDto>;
}

const CreateAndUpdateAiChatModelBody = ({ handleFormSubmit, form }: CreateAndUpdateAiChatModelBodyProps) => {
  const { t } = useTranslation();
  const { searchGroups } = useGroupStore();
  const { setValue, watch, control } = form;
  const aiServiceOptions = useAiChatModelTableStore((state) => state.aiServiceOptions);
  const fetchAiServiceOptions = useAiChatModelTableStore((state) => state.fetchAiServiceOptions);

  useEffect(() => {
    void fetchAiServiceOptions();
  }, [fetchAiServiceOptions]);

  return (
    <Form {...form}>
      <form
        onSubmit={handleFormSubmit}
        className="space-y-4"
      >
        <FormField
          name="name"
          form={form}
          labelTranslationId={t('chat.aiChatModel.name')}
          placeholder={t('chat.aiChatModel.name')}
          variant="dialog"
        />

        <FormFieldSH
          control={control}
          name="aiServiceId"
          render={({ field }) => (
            <FormItem>
              <p className="font-bold">{t('chat.aiChatModel.aiService')}</p>
              <FormControl>
                <DropdownSelect
                  options={aiServiceOptions}
                  selectedVal={field.value}
                  handleChange={field.onChange}
                  variant="dialog"
                  translate={false}
                />
              </FormControl>
              <FormMessage className="text-p" />
            </FormItem>
          )}
        />

        <FormFieldSH
          control={control}
          name="systemPrompt"
          render={({ field }) => (
            <FormItem>
              <p className="font-bold">{t('chat.aiChatModel.systemPrompt')}</p>
              <FormControl>
                <Textarea
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={t('chat.aiChatModel.systemPrompt')}
                  className="bg-white text-background dark:border-none dark:bg-accent"
                />
              </FormControl>
              <FormMessage className="text-p" />
            </FormItem>
          )}
        />

        <div>
          <p className="mb-2 font-bold">{t('chat.aiChatModel.accessGroups')}</p>
          <AsyncMultiSelect<MultipleSelectorGroup>
            value={watch('accessGroups') || []}
            onSearch={searchGroups}
            onChange={(selected) => setValue('accessGroups', selected, { shouldValidate: true })}
            placeholder={t('search.type-to-search')}
          />
        </div>

        <DialogSwitch
          translationId="chat.aiChatModel.isActive"
          checked={watch('isActive')}
          onCheckedChange={(isChecked) => setValue('isActive', isChecked)}
        />
      </form>
    </Form>
  );
};

export default CreateAndUpdateAiChatModelBody;
