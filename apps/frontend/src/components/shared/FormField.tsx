import { FormControl, FormFieldSH, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import Input from '@/components/shared/Input';
import React from 'react';
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { cva, type VariantProps } from 'class-variance-authority';

import cn from '@libs/common/utils/className';

const variants = cva([], {
  variants: {
    variant: {
      default: 'text-foreground',
      light: 'text-white',
      lightGray: 'text-ciLightGrey',
    },
  },
});

type FormFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  disabled?: boolean;
  name: Path<T> | string;
  isLoading?: boolean;
  labelTranslationId: string;
  type?: 'password';
  defaultValue?: PathValue<T, Path<T>> | string;
  readonly?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
} & VariantProps<typeof variants>;

const FormField = <T extends FieldValues>({
  form,
  disabled,
  name,
  isLoading,
  labelTranslationId,
  type,
  variant,
  defaultValue,
  readonly = false,
  value,
  onChange,
}: FormFieldProps<T>) => {
  const { t } = useTranslation();

  return (
    <FormFieldSH
      control={form.control}
      disabled={disabled}
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
              disabled={disabled || isLoading}
              variant={variant}
              readOnly={readonly}
              value={value}
              defaultValue={defaultValue as string}
              onChange={(e) => {
                field.onChange(e);
                if (onChange) onChange(e);
              }}
            />
          </FormControl>
          <FormMessage className={cn('text-p', variants({ variant }))} />
        </FormItem>
      )}
    />
  );
};

export default FormField;
