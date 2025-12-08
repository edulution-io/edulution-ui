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
