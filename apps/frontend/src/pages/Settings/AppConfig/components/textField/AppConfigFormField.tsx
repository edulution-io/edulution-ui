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

import React, { HTMLInputTypeAttribute } from 'react';
import { useTranslation } from 'react-i18next';
import { Control, FieldValues, Path, PathValue } from 'react-hook-form';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import { FormControl, FormDescription, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import Input from '@/components/shared/Input';

type AppConfigFormFieldProps<T extends FieldValues> = {
  fieldPath: Path<T>;
  control: Control<T>;
  option: AppConfigExtendedOption;
  type?: HTMLInputTypeAttribute;
};

const AppConfigFormField = <T extends FieldValues>({
  fieldPath,
  control,
  option,
  type = 'text',
}: AppConfigFormFieldProps<T>) => {
  const { t } = useTranslation();

  return (
    <FormFieldSH
      control={control}
      name={fieldPath}
      defaultValue={'' as PathValue<T, Path<T>>}
      render={({ field }) => (
        <FormItem>
          {option.title && <p className="font-bold">{t(option.title)}</p>}
          <FormControl>
            <Input
              autoComplete="new-password"
              {...field}
              type={type}
            />
          </FormControl>
          <FormDescription>{t(option.description)}</FormDescription>
          <FormMessage className="text-p" />
        </FormItem>
      )}
    />
  );
};

export default AppConfigFormField;
