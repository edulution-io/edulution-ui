import { RadioGroupItemSH, RadioGroupSH } from '@/components/ui/RadioGroupSH';
import { FormControl, FormFieldSH, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import React from 'react';
import { Control, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import cn from '@/lib/utils';
import type RadioGroupItem from '@libs/ui/types/radioGroupItem';

interface RadioGroupProps {
  control: Control<FieldValues>;
  name: string;
  titleTranslationId: string;
  defaultValue?: string;
  items: RadioGroupItem[];
  formClassname?: string;
  labelClassname?: string;
}

const RadioGroupFormField: React.FC<RadioGroupProps> = ({
  control,
  name,
  titleTranslationId,
  defaultValue,
  items,
  formClassname,
  labelClassname,
}: RadioGroupProps) => {
  const { t } = useTranslation();

  return (
    <FormFieldSH
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('space-y-3', formClassname)}>
          <h4 className={labelClassname}>{t(titleTranslationId)}</h4>
          <FormControl>
            <RadioGroupSH
              onValueChange={field.onChange}
              defaultValue={defaultValue}
              className="flex flex-row flex-wrap"
            >
              {items.map((item) => (
                <FormItem key={`${item.value}`}>
                  <FormLabel className="flex cursor-pointer flex-col items-center space-x-3 space-y-0 text-base">
                    <FormControl>
                      <>
                        <RadioGroupItemSH
                          value={item.value}
                          disabled={item.disabled}
                          checked={field.value === item.value}
                          className={item.icon ? 'hidden' : ''}
                        />
                        {item.icon ? (
                          <div
                            className={cn(
                              'opacity-60',
                              item.disabled ? 'cursor-not-allowed opacity-20' : 'hover:opacity-100',
                              { 'opacity-100': field.value === item.value },
                            )}
                          >
                            <img
                              src={item.icon}
                              width="200px"
                              aria-label={item.value}
                              onClickCapture={() => (item.disabled ? {} : field.onChange(item.value))}
                            />
                          </div>
                        ) : null}
                        <p
                          className={cn('cursor-default opacity-60', {
                            'font-bold opacity-100': field.value === item.value,
                          })}
                        >
                          {t(item.translationId)}
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
