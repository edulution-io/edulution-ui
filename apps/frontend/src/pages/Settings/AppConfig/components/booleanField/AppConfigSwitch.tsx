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

import React from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormControl, FormDescription, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import Switch from '@/components/ui/Switch';

type AppConfigSwitchProps<T extends FieldValues> = {
  fieldPath: Path<T>;
  control: Control<T>;
  option: {
    title?: string;
    description: string;
  };
};

const AppConfigSwitch = <T extends FieldValues>({ fieldPath, control, option }: AppConfigSwitchProps<T>) => {
  const { t } = useTranslation();

  return (
    <FormFieldSH
      control={control}
      name={fieldPath}
      render={({ field }) => (
        <FormItem>
          {option.title && <div>{t(option.title)}</div>}
          <FormControl>
            <div className="flex h-9 items-center">
              <Switch
                {...field}
                checked={field.value as boolean}
                onCheckedChange={() => field.onChange(!(field.value as boolean))}
                disabled={field.disabled}
              />
            </div>
          </FormControl>
          {option.description && <FormDescription>{t(option.description)}</FormDescription>}
          <FormMessage className="text-p" />
        </FormItem>
      )}
    />
  );
};

export default AppConfigSwitch;
