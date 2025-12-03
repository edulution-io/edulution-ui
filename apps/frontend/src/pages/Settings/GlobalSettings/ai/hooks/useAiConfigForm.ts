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

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import type AiConfigDto from '@libs/ai/types/aiConfigDto';
import AI_CONFIG_TABLE_COLUMNS from '@libs/ai/constants/aiConfigTableColumns';
import SUPPORTED_AI_PROVIDER from '@libs/ai/types/SupportedAiProvider';
import useAiConfigTableStore from '../useAiConfigTableStore';

const getEmptyFormValues = (): AiConfigDto => ({
  id: '',
  name: '',
  url: '',
  apiKey: '',
  aiModel: '',
  apiStandard: SUPPORTED_AI_PROVIDER.OpenAI,
  allowedUsers: [],
  allowedGroups: [],
  purposes: [],
});

const useAiConfigForm = (isOpen: boolean) => {
  const { t } = useTranslation();
  const { selectedRows, tableContentData, selectedConfig, setSelectedConfig } = useAiConfigTableStore();

  const form = useForm<AiConfigDto>({
    mode: 'onChange',
    defaultValues: getEmptyFormValues(),
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

  const { reset } = form;

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

    const selectedIds = Object.keys(selectedRows || {}).filter((key) => selectedRows?.[key]);

    if (selectedIds.length === 1) {
      const config = tableContentData.find((c) => c.id === selectedIds[0]);
      if (config) {
        setSelectedConfig(config);
        return;
      }
    }

    reset(getEmptyFormValues());
  }, [isOpen, selectedConfig, selectedRows, tableContentData, setSelectedConfig, reset]);

  const resetForm = () => reset(getEmptyFormValues());

  return { form, resetForm };
};

export default useAiConfigForm;
