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

import React, { useEffect, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDebounceValue } from 'usehooks-ts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import DialogSwitch from '@/components/shared/DialogSwitch';
import { Textarea } from '@/components/ui/Textarea';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import useGroupStore from '@/store/GroupStore';
import useAiServiceTableStore from '@/pages/Settings/AIService/useAiServiceTableStore';
import useAiAssistantTableStore from '@/pages/Settings/AppConfig/chat/useAiAssistantTableStore';
import { DropdownSelect } from '@/components';
import CreateAiAssistantDto from '@libs/aiAssistant/types/createAiAssistantDto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';

interface CreateAndUpdateAiAssistantBodyProps {
  handleFormSubmit: (e: React.FormEvent) => void;
  form: UseFormReturn<CreateAiAssistantDto>;
  isCurrentNameEqualToSelected: () => boolean;
}

const CreateAndUpdateAiAssistantBody = ({
  handleFormSubmit,
  form,
  isCurrentNameEqualToSelected,
}: CreateAndUpdateAiAssistantBodyProps) => {
  const { t } = useTranslation();
  const { searchGroups } = useGroupStore();
  const { tableContentData: aiServices, fetchTableContent: fetchAiServices } = useAiServiceTableStore();
  const { nameExistsAlready, isNameCheckingLoading, checkIfNameAllReadyExists } = useAiAssistantTableStore();

  const { setValue, watch } = form;

  const [isActivelyTyping, setIsActivelyTyping] = useState(false);
  const [isNameChecked, setIsNameChecked] = useState(false);

  const watchedName = watch('name', '');
  const [debouncedName] = useDebounceValue(watchedName ?? '', 500);
  const lastNameRef = useRef('');

  useEffect(() => {
    void fetchAiServices();
  }, [fetchAiServices]);

  useEffect(() => {
    setIsActivelyTyping(true);
    setIsNameChecked(false);
  }, [watchedName]);

  useEffect(() => {
    const trimmedValue = debouncedName.trim();
    if (trimmedValue && trimmedValue !== lastNameRef.current) {
      lastNameRef.current = trimmedValue;
      void (async () => {
        await checkIfNameAllReadyExists(trimmedValue);
        setIsActivelyTyping(false);
        setIsNameChecked(true);
      })();
    } else {
      setIsActivelyTyping(false);
      setIsNameChecked(false);
    }
  }, [debouncedName, checkIfNameAllReadyExists]);

  const shouldAvailabilityStatusShow = form.formState.isValid && !isCurrentNameEqualToSelected();

  const renderAvailabilityStatus = () => {
    if ((isActivelyTyping && !isNameChecked) || isNameCheckingLoading) {
      return <span className="text-sm text-gray-500">{t('common.checking')}...</span>;
    }

    if (isNameChecked) {
      if (!nameExistsAlready) {
        return (
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="text-ciGreen"
          />
        );
      }
      return (
        <FontAwesomeIcon
          icon={faCircleExclamation}
          className="text-ciRed"
        />
      );
    }

    return null;
  };

  const aiServiceOptions = aiServices
    .filter((s) => s.isActive)
    .map((s) => ({
      id: s.id,
      name: `${s.name} (${s.model})`,
    }));

  const handleAiServiceChange = (serviceId: string) => {
    setValue('aiServiceId', serviceId, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleFormSubmit}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2">
          <FormField
            name="name"
            form={form}
            defaultValue={form.getValues('name')}
            variant="dialog"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setValue('name', e.target.value, { shouldValidate: true });
            }}
          />
          {shouldAvailabilityStatusShow && renderAvailabilityStatus()}
        </div>

        <div className="mb-1 font-bold">{t('chat.assistant.aiService')}</div>
        <DropdownSelect
          options={aiServiceOptions}
          selectedVal={watch('aiServiceId') || ''}
          handleChange={handleAiServiceChange}
          variant="dialog"
          placeholder={t('chat.assistant.selectAiService')}
        />

        <div className="mb-1 font-bold">{t('chat.assistant.systemPrompt')}</div>
        <FormFieldSH
          control={form.control}
          name="systemPrompt"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t('chat.assistant.systemPromptPlaceholder')}
                  className="min-h-32"
                  onChange={(e) => {
                    field.onChange(e);
                    setValue('systemPrompt', e.target.value, { shouldValidate: true });
                  }}
                />
              </FormControl>
              <FormMessage className="text-p text-destructive" />
            </FormItem>
          )}
        />

        <DialogSwitch
          translationId="bulletinboard.isActive"
          checked={watch('isActive')}
          onCheckedChange={(isChecked) => {
            setValue('isActive', isChecked);
          }}
        />

        <p className="pt-4 text-lg font-bold text-background">{t('chat.assistant.accessUsersAndGroupsTitle')}</p>
        <p className="text-background">{t('chat.assistant.accessUsersAndGroups')}:</p>
        <AsyncMultiSelect<MultipleSelectorGroup>
          value={watch('accessGroups')}
          onSearch={searchGroups}
          onChange={(groups) => setValue('accessGroups', groups, { shouldValidate: true })}
          placeholder={t('search.type-to-search')}
          variant="dialog"
        />
      </form>
    </Form>
  );
};

export default CreateAndUpdateAiAssistantBody;
