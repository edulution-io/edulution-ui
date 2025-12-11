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
import getDisplayName from '@/utils/getDisplayName';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useLanguage from '@/hooks/useLanguage';
import { FormControl, FormFieldSH, FormItem } from '@/components/ui/Form';
import { DropdownSelect } from '@/components';
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DropdownVariant from '@libs/ui/types/DropdownVariant';

type AppDropdownSelectFormFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  appNamePath?: Path<T>;
  initialValue?: PathValue<T, Path<T>>;
  variant: DropdownVariant;
};

const AppDropdownSelectFormField = <T extends FieldValues>({
  form,
  appNamePath = 'appName' as Path<T>,
  initialValue,
  variant,
}: AppDropdownSelectFormFieldProps<T>) => {
  const { getAppConfigs, appConfigs } = useAppConfigsStore();
  const { t } = useTranslation();
  const { language } = useLanguage();

  useEffect(() => {
    void getAppConfigs();
  }, []);

  const appNameOptions = appConfigs.map((appConfig) => ({
    id: appConfig.name,
    name: getDisplayName(appConfig, language),
  }));

  return (
    <FormFieldSH
      control={form.control}
      name={appNamePath}
      defaultValue={initialValue}
      render={({ field }) => (
        <FormItem>
          <p className="font-bold">{t('common.application')}</p>
          <FormControl>
            <DropdownSelect
              options={appNameOptions}
              selectedVal={field.value}
              handleChange={field.onChange}
              variant={variant}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default AppDropdownSelectFormField;
