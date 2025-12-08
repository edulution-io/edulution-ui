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

import { RadioGroupItemSH, RadioGroupSH } from '@/components/ui/RadioGroupSH';
import { FormControl, FormFieldSH, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import React from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import cn from '@libs/common/utils/className';
import type RadioGroupItem from '@libs/ui/types/radioGroupItem';

interface RadioGroupProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  titleTranslationId?: string;
  items: RadioGroupItem[];
  formClassname?: string;
  labelClassname?: string;
  imageWidth?: 'small' | 'large';
  fixedImageSize?: boolean;
  disabled?: boolean;
}

const RadioGroupFormField = <T extends FieldValues>({
  control,
  name,
  titleTranslationId,
  items,
  formClassname,
  labelClassname,
  imageWidth = 'large',
  fixedImageSize = false,
  disabled = false,
}: RadioGroupProps<T>) => {
  const { t } = useTranslation();

  const imagePixelWidth = imageWidth === 'small' ? '100px' : '150px';

  return (
    <FormFieldSH
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('space-y-3 text-background', formClassname)}>
          <h3 className={labelClassname}>{titleTranslationId && t(titleTranslationId)}</h3>
          <FormControl>
            <RadioGroupSH
              value={field.value}
              onValueChange={disabled ? undefined : field.onChange}
              className="flex flex-row flex-wrap"
            >
              {items.map((item) => (
                <FormItem key={`${item.value}`}>
                  <FormLabel
                    htmlFor={`${name}-${titleTranslationId}-${item.value}`}
                    className={cn(
                      'flex flex-col items-center space-x-3 space-y-0 text-base text-background',
                      disabled || item.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                    )}
                  >
                    <FormControl>
                      <>
                        <RadioGroupItemSH
                          id={`${name}-${titleTranslationId}-${item.value}`}
                          value={item.value}
                          disabled={disabled || item.disabled}
                          checked={field.value === item.value}
                          className={item.icon ? 'hidden' : ''}
                        />
                        {item.icon ? (
                          <div
                            className={cn(
                              'pb-6 opacity-60',
                              disabled || item.disabled ? 'cursor-not-allowed opacity-20' : 'hover:opacity-100',
                              { 'opacity-100': field.value === item.value },
                            )}
                          >
                            <img
                              src={item.icon}
                              width={imagePixelWidth}
                              className={fixedImageSize ? 'h-24 w-24 object-contain' : ''}
                              aria-label={item.value}
                              alt={item.value}
                            />
                          </div>
                        ) : null}
                        <p
                          className={cn('opacity-60', {
                            'font-bold opacity-100': field.value === item.value,
                            'cursor-default': disabled,
                          })}
                          style={{ textRendering: 'optimizeLegibility' }}
                        >
                          {t(item.translationId)}
                        </p>
                        <p
                          className={cn('text-sm text-muted-foreground', {
                            'opacity-60': field.value !== item.value,
                          })}
                        >
                          {t(item?.descriptionTranslationId ?? '')}
                        </p>
                      </>
                    </FormControl>
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroupSH>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default RadioGroupFormField;
