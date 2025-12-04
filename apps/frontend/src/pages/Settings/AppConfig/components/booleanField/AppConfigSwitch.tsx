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
          {option.title && <p className="font-bold">{t(option.title)}</p>}
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
