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
