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
import { FormControl, FormDescription, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import { Control, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import DropdownSelect from '@/components/ui/DropdownSelect/DropdownSelect';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import useRequiredContainers from '@/pages/Settings/AppConfig/hooks/useRequiredContainers';

type AppConfigDropdownSelectProps = {
  control: Control<FieldValues>;
  fieldPath: string;
  option: AppConfigExtendedOption;
};

const AppConfigDropdownSelect = (props: AppConfigDropdownSelectProps) => {
  const { t } = useTranslation();

  const { control, fieldPath, option } = props;

  const { hasFetched, isDisabled } = useRequiredContainers(option.requiredContainers);

  const computedWarning = hasFetched && isDisabled ? option.disabledWarningText : undefined;

  return (
    <FormFieldSH
      control={control}
      name={fieldPath}
      render={({ field }) => (
        <FormItem>
          {option.title && <p className="font-bold">{t(option.title)}</p>}
          <FormControl>
            <div className={isDisabled ? 'pointer-events-none opacity-60' : ''}>
              <DropdownSelect
                options={option.options || []}
                selectedVal={(field.value as string) || ''}
                handleChange={field.onChange}
                placeholder="common.select"
              />
            </div>
          </FormControl>

          {option.description && <FormDescription>{t(option.description)}</FormDescription>}

          {isDisabled && computedWarning && <div className="text-sm">{t(computedWarning)}</div>}

          <FormMessage className="text-p" />
        </FormItem>
      )}
    />
  );
};

export default AppConfigDropdownSelect;
