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
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@edulution-io/ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import { DropdownSelect } from '@/components';
import DialogSwitch from '@/components/shared/DialogSwitch';
import useAiServiceTableStore from '@/pages/Settings/AIService/useAiServiceTableStore';
import CreateAiServiceDto from '@libs/aiService/types/createAiServiceDto';
import AiProviderType from '@libs/aiService/types/aiProviderType';
import AiServicePurposeType from '@libs/aiService/types/aiServicePurposeType';
import AI_PROVIDER_OPTIONS from '@libs/aiService/constants/aiProviderOptions';
import AI_SERVICE_PURPOSE_OPTIONS from '@libs/aiService/constants/aiServicePurposeOptions';

interface CreateAndUpdateAiServiceBodyProps {
  handleFormSubmit: (e: React.FormEvent) => void;
  form: UseFormReturn<CreateAiServiceDto>;
  initialFormValues: CreateAiServiceDto;
}

const CreateAndUpdateAiServiceBody = ({
  handleFormSubmit,
  form,
  initialFormValues,
}: CreateAndUpdateAiServiceBodyProps) => {
  const { t } = useTranslation();
  const { availableModels, isModelsLoading, fetchAvailableModels } = useAiServiceTableStore();
  const { setValue, watch, getValues, control } = form;

  const modelOptions = availableModels.map((model) => ({
    id: model,
    name: model,
  }));

  const baseUrl = watch('baseUrl');
  const canFetchModels = baseUrl.trim().length > 0;

  const handleFetchModels = () => {
    const { provider, baseUrl: url, apiKey } = getValues();
    void fetchAvailableModels({ provider, baseUrl: url, apiKey });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleFormSubmit}
        className="space-y-4"
      >
        <FormField
          name="name"
          defaultValue={initialFormValues.name}
          form={form}
          labelTranslationId={t('common.name')}
          placeholder={t('settings.aiServices.namePlaceholder')}
          variant="dialog"
        />

        <FormFieldSH
          control={control}
          name="purpose"
          defaultValue={initialFormValues.purpose}
          render={({ field }) => (
            <FormItem>
              <p className="font-bold">{t('settings.aiServices.purpose')}</p>
              <FormControl>
                <DropdownSelect
                  options={AI_SERVICE_PURPOSE_OPTIONS}
                  selectedVal={field.value}
                  handleChange={(value) => field.onChange(value as AiServicePurposeType)}
                  variant="dialog"
                />
              </FormControl>
              <FormMessage className="text-p" />
            </FormItem>
          )}
        />

        <FormFieldSH
          control={control}
          name="provider"
          defaultValue={initialFormValues.provider}
          render={({ field }) => (
            <FormItem>
              <p className="font-bold">{t('settings.aiServices.provider')}</p>
              <FormControl>
                <DropdownSelect
                  options={AI_PROVIDER_OPTIONS}
                  selectedVal={field.value}
                  handleChange={(value) => {
                    field.onChange(value as AiProviderType);
                    setValue('model', '', { shouldValidate: true });
                  }}
                  variant="dialog"
                />
              </FormControl>
              <FormMessage className="text-p" />
            </FormItem>
          )}
        />

        <FormField
          name="baseUrl"
          defaultValue={initialFormValues.baseUrl}
          form={form}
          labelTranslationId={t('settings.aiServices.baseUrl')}
          placeholder={t('settings.aiServices.baseUrlPlaceholder')}
          variant="dialog"
        />

        <FormField
          name="apiKey"
          defaultValue={initialFormValues.apiKey}
          form={form}
          labelTranslationId={t('settings.aiServices.apiKey')}
          placeholder={t('settings.aiServices.apiKeyPlaceholder')}
          variant="dialog"
        />

        <FormFieldSH
          control={control}
          name="model"
          defaultValue={initialFormValues.model}
          render={({ field }) => (
            <FormItem>
              <p className="font-bold">{t('settings.aiServices.model')}</p>
              <FormControl>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <DropdownSelect
                      options={modelOptions}
                      selectedVal={field.value}
                      handleChange={field.onChange}
                      variant="dialog"
                      translate={false}
                      placeholder={
                        isModelsLoading
                          ? t('settings.aiServices.loadingModels')
                          : t('settings.aiServices.modelPlaceholder')
                      }
                    />
                  </div>
                  <Button
                    variant="btn-collaboration"
                    size="lg"
                    type="button"
                    disabled={!canFetchModels || isModelsLoading}
                    onClick={handleFetchModels}
                  >
                    <FontAwesomeIcon
                      icon={faSync}
                      spin={isModelsLoading}
                    />
                  </Button>
                </div>
              </FormControl>
              <FormMessage className="text-p" />
            </FormItem>
          )}
        />

        <DialogSwitch
          translationId="settings.aiServices.isActive"
          checked={watch('isActive')}
          onCheckedChange={(isChecked) => setValue('isActive', isChecked)}
        />

        <DialogSwitch
          translationId="settings.aiServices.isDataPrivacyCompliant"
          checked={watch('isDataPrivacyCompliant')}
          onCheckedChange={(isChecked) => setValue('isDataPrivacyCompliant', isChecked)}
        />
      </form>
    </Form>
  );
};

export default CreateAndUpdateAiServiceBody;
