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

import { FieldValues, Path, PathValue, RegisterOptions, UseFormReturn } from 'react-hook-form';
import React, { HTMLInputTypeAttribute } from 'react';
import { useTranslation } from 'react-i18next';
import cn from '@libs/common/utils/className';
import Input from '@/components/shared/Input';
import { FormControl, FormDescription, FormFieldSH, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';

type FormFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  disabled?: boolean;
  name: Path<T> | string;
  isLoading?: boolean;
  labelTranslationId?: string;
  type?: HTMLInputTypeAttribute;
  defaultValue?: string | number | boolean;
  readonly?: boolean;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  rules?: Omit<RegisterOptions<T, Path<T>>, 'disabled' | 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
  className?: string;
  description?: string;
  variant?: 'dialog' | 'default';
};

const FormField = <T extends FieldValues>({
  form,
  disabled,
  name,
  isLoading,
  labelTranslationId,
  type,
  defaultValue,
  readonly = false,
  value,
  onChange,
  placeholder,
  rules,
  className,
  description,
  variant = 'default',
}: FormFieldProps<T>) => {
  const { t } = useTranslation();

  return (
    <FormFieldSH
      control={form.control}
      disabled={disabled}
      name={name as Path<T>}
      defaultValue={defaultValue as PathValue<T, Path<T>>}
      rules={rules}
      render={({ field }) => (
        <FormItem>
          {labelTranslationId && (
            <FormLabel>
              <p className="font-bold text-background">{t(labelTranslationId)}</p>
            </FormLabel>
          )}
          <FormControl>
            <Input
              {...field}
              autoComplete="new-password"
              type={type}
              disabled={disabled || isLoading}
              placeholder={placeholder}
              readOnly={readonly}
              value={value}
              defaultValue={defaultValue as string}
              onChange={(e) => {
                field.onChange(e);
                if (onChange) onChange(e);
              }}
              className={className}
              variant={variant}
            />
          </FormControl>
          <FormMessage className={cn('text-p text-destructive')} />
          {description ? <FormDescription>{description}</FormDescription> : null}
        </FormItem>
      )}
    />
  );
};

export default FormField;
