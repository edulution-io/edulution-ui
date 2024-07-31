import { FormControl, FormFieldSH, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import Input from '@/components/shared/Input';
import React from 'react';
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { cva, type VariantProps } from 'class-variance-authority';

import cn from '@/lib/utils';

const variants = cva([], {
  variants: {
    variant: {
      default: 'text-foreground',
    },
  },
});

type FormFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: Path<T> | string;
  isLoading: boolean;
  labelTranslationId: string;
  type?: 'password';
  defaultValue?: PathValue<T, Path<T>> | string;
} & VariantProps<typeof variants>;

const FormField = <T extends FieldValues>({
  form,
  name,
  isLoading,
  labelTranslationId,
  type,
  variant,
  defaultValue,
}: FormFieldProps<T>) => {
  const { t } = useTranslation();

  return (
    <FormFieldSH
      control={form.control}
      name={name as Path<T>}
      defaultValue={defaultValue as PathValue<T, Path<T>>}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={cn(variants({ variant }))}>
            <p className="font-bold">{t(labelTranslationId)}</p>
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              disabled={isLoading}
              variant={variant}
            />
          </FormControl>
          <FormMessage className={cn('text-p', variants({ variant }))} />
        </FormItem>
      )}
    />
  );
};

export default FormField;
