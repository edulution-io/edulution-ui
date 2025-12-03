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

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { FormControl, FormDescription, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import { DropdownSelect } from '@/components';
import Input from '@/components/shared/Input';
import MultipleSelectorSH from '@/components/ui/MultipleSelectorSH';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import useGroupStore from '@/store/GroupStore';
import useUserStore from '@/store/UserStore/useUserStore';
import type AiConfigDto from '@libs/ai/types/aiConfigDto';
import AI_CONFIG_TABLE_COLUMNS from '@libs/ai/constants/aiConfigTableColumns';
import AI_CONFIG_PURPOSES from '@libs/ai/constants/aiConfigPurposes';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import AttendeeDto from '@libs/user/types/attendee.dto';
import AIConnectionStatus from '@/pages/Settings/GlobalSettings/ai/components/AIConnectionStatus';
import SupportedAiProvider from '@libs/ai/types/SupportedAiProvider';

interface AiConfigFormFieldsProps {
  control: Control<AiConfigDto>;
  watch: UseFormWatch<AiConfigDto>;
  setValue: UseFormSetValue<AiConfigDto>;
  models: string[];
  isLoadingModels: boolean;
  modelsError: string | null;
  isTesting: boolean;
  testResult: { success: boolean; message: string } | null;
  existingConfigs: AiConfigDto[];
  currentConfigId?: string;
}

const AiConfigFormFields: React.FC<AiConfigFormFieldsProps> = ({
  control,
  watch,
  setValue,
  models,
  isLoadingModels,
  modelsError,
  isTesting,
  testResult,
  existingConfigs,
  currentConfigId,
}) => {
  const { t } = useTranslation();
  const { searchGroups } = useGroupStore();
  const { searchAttendees } = useUserStore();

  const apiStandardOptions = useMemo(
    () =>
      Object.values(SupportedAiProvider).map((standard) => ({
        id: standard,
        name: t(`aiconfig.apiStandards.${standard}`),
      })),
    [t],
  );

  const isTranslationUsedByOther = useMemo(
    () => existingConfigs.some((c) => c.id !== currentConfigId && c.purposes.includes('translation')),
    [existingConfigs, currentConfigId],
  );

  const purposeOptions = useMemo(
    () =>
      Object.values(AI_CONFIG_PURPOSES)
        .filter((purpose) => purpose !== 'translation' || !isTranslationUsedByOther)
        .map((purpose) => ({
          value: purpose,
          label: t(`aiconfig.purposes.${purpose}`),
        })),
    [t, isTranslationUsedByOther],
  );

  const modelOptions = useMemo(() => models.map((model) => ({ id: model, name: model })), [models]);

  const handleUsersChange = (users: AttendeeDto[]) => {
    setValue(AI_CONFIG_TABLE_COLUMNS.ALLOWED_USERS, users, { shouldValidate: true });
  };

  const handleGroupsChange = (groups: MultipleSelectorGroup[]) => {
    setValue(AI_CONFIG_TABLE_COLUMNS.ALLOWED_GROUPS, groups, { shouldValidate: true });
  };

  const onUsersSearch = async (value: string): Promise<AttendeeDto[]> => searchAttendees(value);

  const modelPlaceholder = useMemo(() => {
    if (isLoadingModels) {
      return t('common.loading');
    }
    if (models.length === 0) {
      return t('aiconfig.settings.enterUrlFirst');
    }
    return t('aiconfig.settings.selectModel');
  }, [isLoadingModels, models.length, t]);

  return (
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
              <DropdownSelect
                options={modelOptions}
                selectedVal={field.value}
                translate={false}
                handleChange={field.onChange}
                variant="dialog"
                placeholder={modelPlaceholder}
              />
            </FormControl>
            {modelsError && <p className="text-sm text-red-500">{modelsError}</p>}
            <AIConnectionStatus
              isTesting={isTesting}
              testResult={testResult}
            />
            <FormMessage className="text-p" />
          </FormItem>
        )}
      />

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
};

export default AiConfigFormFields;
