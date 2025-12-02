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

import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useAppConfigTableDialogStore from '@/pages/Settings/AppConfig/components/table/useAppConfigTableDialogStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Form, FormControl, FormDescription, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import { Button } from '@/components/shared/Button';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import { DropdownSelect } from '@/components';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import useGroupStore from '@/store/GroupStore';
import useUserStore from '@/store/UserStore/useUserStore';
import type AiConfigDto from '@libs/ai/types/aiConfigDto';
import AI_CONFIG_TABLE_COLUMNS from '@libs/ai/constants/aiConfigTableColumns';
import AI_API_STANDARDS from '@libs/ai/constants/aiApiStandards';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import AttendeeDto from '@libs/user/types/attendee.dto';
import useAiConfigTableStore from './useAiConfigTableStore';
import MultipleSelectorSH from '@/components/ui/MultipleSelectorSH';
import AI_CONFIG_PURPOSES from '@libs/ai/constants/aiConfigPurposes';
import Input from '@/components/shared/Input';
import useTestAiConnection from '@/pages/Settings/AppConfig/ai/hooks/useTestAiConnection';

interface AddAiConfigDialogProps {
  dialogKey: string;
}

const AddAiConfigDialog: React.FC<AddAiConfigDialogProps> = ({ dialogKey }) => {
  const { t } = useTranslation();
  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();
  const {
    selectedRows,
    tableContentData,
    setSelectedRows,
    addOrUpdateConfig,
    deleteTableEntry,
    selectedConfig,
    setSelectedConfig,
  } = useAiConfigTableStore();
  const { searchGroups } = useGroupStore();
  const { searchAttendees } = useUserStore();
  const { testConnection, isLoading: isTesting, result: testResult, resetResult } = useTestAiConnection();

  const isOpen = isDialogOpen === dialogKey;

  const apiStandardOptions = useMemo(
    () =>
      Object.values(AI_API_STANDARDS).map((standard) => ({
        id: standard,
        name: t(`aiconfig.apiStandards.${standard}`),
      })),
    [t],
  );

  const purposeOptions = useMemo(
    () =>
      Object.values(AI_CONFIG_PURPOSES).map((purpose) => ({
        value: purpose,
        label: t(`aiconfig.purposes.${purpose}`),
      })),
    [t],
  );

  const form = useForm<AiConfigDto>({
    mode: 'onChange',
    defaultValues: {
      id: '',
      name: '',
      url: '',
      apiKey: '',
      aiModel: '',
      apiStandard: AI_API_STANDARDS.OPENAI,
      allowedUsers: [],
      allowedGroups: [],
      purposes: [],
    },
    resolver: zodResolver(
      z.object({
        [AI_CONFIG_TABLE_COLUMNS.NAME]: z
          .string()
          .min(1, { message: t('common.required') })
          .refine(
            (val) => {
              if (!selectedConfig) {
                return !tableContentData.some((c) => c.name?.toLowerCase() === val.toLowerCase());
              }
              return true;
            },
            { message: t('aiconfig.errors.nameAlreadyExists') },
          ),
        [AI_CONFIG_TABLE_COLUMNS.URL]: z
          .string()
          .min(1, { message: t('common.required') })
          .url({ message: t('common.invalidUrl') }),
        [AI_CONFIG_TABLE_COLUMNS.API_KEY]: z.string().optional(),
        [AI_CONFIG_TABLE_COLUMNS.AI_MODEL]: z.string().min(1, { message: t('common.required') }),
        [AI_CONFIG_TABLE_COLUMNS.API_STANDARD]: z.string().min(1, { message: t('common.required') }),
        [AI_CONFIG_TABLE_COLUMNS.ALLOWED_USERS]: z.array(z.any()).optional(),
        [AI_CONFIG_TABLE_COLUMNS.ALLOWED_GROUPS]: z.array(z.any()).optional(),
        [AI_CONFIG_TABLE_COLUMNS.PURPOSES]: z.array(z.string()).optional(),
      }),
    ),
  });

  const { reset, getValues, setValue, watch, control, formState } = form;

  const watchedUrl = watch(AI_CONFIG_TABLE_COLUMNS.URL);
  const watchedModel = watch(AI_CONFIG_TABLE_COLUMNS.AI_MODEL);
  const watchedApiStandard = watch(AI_CONFIG_TABLE_COLUMNS.API_STANDARD);

  const getEmptyFormValues = (): AiConfigDto => ({
    id: '',
    name: '',
    url: '',
    apiKey: '',
    aiModel: '',
    apiStandard: AI_API_STANDARDS.OPENAI,
    allowedUsers: [],
    allowedGroups: [],
    purposes: [],
  });

  useEffect(() => {
    if (!isOpen) return;

    if (selectedConfig) {
      reset({
        id: selectedConfig.id,
        name: selectedConfig.name,
        url: selectedConfig.url,
        apiKey: selectedConfig.apiKey,
        aiModel: selectedConfig.aiModel,
        apiStandard: selectedConfig.apiStandard,
        allowedUsers: selectedConfig.allowedUsers || [],
        allowedGroups: selectedConfig.allowedGroups || [],
        purposes: selectedConfig.purposes || [],
      });
      return;
    }

    const selectedIndices = Object.keys(selectedRows || {})
      .filter((key) => selectedRows?.[key])
      .map(Number);

    if (selectedIndices.length === 1) {
      const config = tableContentData[selectedIndices[0]];
      if (config) {
        setSelectedConfig(config);
        return;
      }
    }
    reset(getEmptyFormValues());
  }, [isOpen, selectedConfig, selectedRows, tableContentData, setSelectedConfig, reset]);

  const closeDialog = () => {
    setDialogOpen('');
    setSelectedConfig(null);
    if (setSelectedRows) {
      setSelectedRows({});
    }
    reset(getEmptyFormValues());
    resetResult();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const values = getValues();
    const configDto: AiConfigDto = {
      ...values,
      id: selectedConfig?.id || '',
    };

    void addOrUpdateConfig(configDto);
    closeDialog();
  };

  const handleDeleteConfig = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (selectedConfig?.id && deleteTableEntry) {
      void deleteTableEntry('', selectedConfig.id);
    }
    closeDialog();
  };

  const handleTestConnection = () => {
    testConnection(getValues());
  };

  const handleUsersChange = (users: AttendeeDto[]) => {
    setValue(AI_CONFIG_TABLE_COLUMNS.ALLOWED_USERS, users, { shouldValidate: true });
  };

  const onUsersSearch = async (value: string): Promise<AttendeeDto[]> => searchAttendees(value);

  const handleGroupsChange = (groups: MultipleSelectorGroup[]) => {
    setValue(AI_CONFIG_TABLE_COLUMNS.ALLOWED_GROUPS, groups, { shouldValidate: true });
  };

  const canTestConnection = Boolean(watchedUrl && watchedModel && watchedApiStandard);
  const canSave = formState.isValid && testResult?.success;

  const getFooter = () => (
    <form
      onSubmit={handleFormSubmit}
      className="flex gap-4"
    >
      {selectedConfig && (
        <div className="mt-4">
          <Button
            variant="btn-attention"
            size="lg"
            onClick={handleDeleteConfig}
          >
            {t('common.delete')}
          </Button>
        </div>
      )}
      <DialogFooterButtons
        handleClose={closeDialog}
        handleSubmit={() => {}}
        disableSubmit={!canSave}
        submitButtonText="common.save"
        submitButtonType="submit"
      />
    </form>
  );

  const renderFormFields = () => (
    <>
      <FormFieldSH
        control={control}
        name={AI_CONFIG_TABLE_COLUMNS.NAME}
        render={({ field }) => (
          <FormItem>
            <p className="font-bold">{t('aiconfig.settings.name')}</p>
            <FormControl>
              <Input
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                variant="dialog"
              />
            </FormControl>
            <FormMessage className="text-p" />
          </FormItem>
        )}
      />
      <FormFieldSH
        control={control}
        name={AI_CONFIG_TABLE_COLUMNS.API_STANDARD}
        render={({ field }) => (
          <FormItem>
            <p className="font-bold">{t('aiconfig.settings.apiStandard')}</p>
            <FormControl>
              <DropdownSelect
                options={apiStandardOptions}
                selectedVal={field.value}
                handleChange={field.onChange}
                variant="dialog"
              />
            </FormControl>
            <FormMessage className="text-p" />
          </FormItem>
        )}
      />
      <FormFieldSH
        control={control}
        name={AI_CONFIG_TABLE_COLUMNS.URL}
        render={({ field }) => (
          <FormItem>
            <p className="font-bold">{t('aiconfig.settings.serverUrl')}</p>
            <FormControl>
              <Input
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                variant="dialog"
                autoComplete="off"
              />
            </FormControl>
            <FormMessage className="text-p" />
          </FormItem>
        )}
      />
      <FormFieldSH
        control={control}
        name={AI_CONFIG_TABLE_COLUMNS.API_KEY}
        render={({ field }) => (
          <FormItem>
            <p className="font-bold">{t('aiconfig.settings.apiKey')}</p>
            <FormControl>
              <Input
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                type="password"
                variant="dialog"
                autoComplete="new-password"
              />
            </FormControl>
            <FormMessage className="text-p" />
          </FormItem>
        )}
      />
      <FormFieldSH
        control={control}
        name={AI_CONFIG_TABLE_COLUMNS.AI_MODEL}
        render={({ field }) => (
          <FormItem>
            <p className="font-bold">{t('aiconfig.settings.model')}</p>
            <FormControl>
              <Input
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                variant="dialog"
              />
            </FormControl>
            <FormMessage className="text-p" />
          </FormItem>
        )}
      />

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="btn-outline"
          onClick={handleTestConnection}
          disabled={isTesting || !canTestConnection}
        >
          {isTesting ? t('common.testing') : t('aiconfig.settings.testConnection')}
        </Button>
        {testResult && (
          <span className={`text-sm ${testResult.success ? 'text-green-500' : 'text-red-500'}`}>
            {testResult.success ? '✓' : '✗'} {testResult.message}
          </span>
        )}
      </div>

      <FormFieldSH
        control={control}
        name={AI_CONFIG_TABLE_COLUMNS.PURPOSES}
        render={({ field }) => (
          <FormItem>
            <p className="font-bold">{t('aiconfig.settings.purposes.title')}</p>
            <FormControl>
              <MultipleSelectorSH
                value={field.value?.map((p: string) => ({ value: p, label: t(`aiconfig.purposes.${p}`) })) || []}
                options={purposeOptions}
                onChange={(selected) => field.onChange(selected.map((s) => s.value))}
                placeholder={t('aiconfig.settings.purposes.placeholder')}
                variant="dialog"
              />
            </FormControl>
            <FormDescription>{t('aiconfig.settings.purposes.description')}</FormDescription>
            <FormMessage className="text-p" />
          </FormItem>
        )}
      />
      <SearchUsersOrGroups
        users={watch(AI_CONFIG_TABLE_COLUMNS.ALLOWED_USERS) || []}
        onSearch={onUsersSearch}
        onUserChange={handleUsersChange}
        groups={watch(AI_CONFIG_TABLE_COLUMNS.ALLOWED_GROUPS) || []}
        onGroupSearch={searchGroups}
        onGroupsChange={handleGroupsChange}
        variant="dialog"
      />
    </>
  );

  const getDialogBody = () => (
    <Form {...form}>
      <form
        className="space-y-4"
        key={selectedConfig?.id || 'new'}
        autoComplete="off"
      >
        {renderFormFields()}
      </form>
    </Form>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={closeDialog}
      title={selectedConfig ? t('aiconfig.settings.editConfig') : t('aiconfig.settings.createConfig')}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default AddAiConfigDialog;
