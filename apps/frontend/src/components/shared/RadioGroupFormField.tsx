import { RadioGroupItemSH, RadioGroupSH } from '@/components/ui/RadioGroupSH';
import { FormControl, FormFieldSH, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import React from 'react';
import { Control, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import cn from '@/lib/utils';

export interface RadioGroupItem {
  value: string;
  translationId: string;
}

interface RadioGroupProps {
  control: Control<FieldValues>;
  name: string;
  titleTranslationId: string;
  defaultValue?: string;
  items: RadioGroupItem[];
  formClassname?: string;
  labelClassname?: string;
}

const RadioGroupFormField = ({
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
              className="flex flex-col space-y-1"
            >
              {items.map((item) => (
                <FormItem key={`${item.value}`}>
                  <FormLabel className="flex cursor-pointer items-center space-x-3 space-y-0 text-base">
                    <FormControl>
                      <RadioGroupItemSH value={item.value} />
                    </FormControl>
                    <span>{t(item.translationId)}</span>
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
