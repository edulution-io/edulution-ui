import { FormControl, FormFieldSH, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import Input from '@/components/shared/Input';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { cva, type VariantProps } from 'class-variance-authority';

import cn from '@/lib/utils';

const variants = cva([], {
  variants: {
    variant: {
      default: 'text-black',
      white: 'text-white',
    },
    inputVariant: {
      default: 'text-black',
    },
  },
});

type FormFieldProps = {
  form: UseFormReturn;
  name: string;
  isLoading: boolean;
  labelTranslationId: string;
  type?: 'password';
} & VariantProps<typeof variants>;

const FormField = ({ form, name, isLoading, labelTranslationId, type, variant, inputVariant }: FormFieldProps) => {
  const { t } = useTranslation();

  return (
    <FormFieldSH
      control={form.control}
      name={name}
      defaultValue=""
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
              variant={inputVariant}
            />
          </FormControl>
          <FormMessage className={cn('text-p', variants({ variant }))} />
        </FormItem>
      )}
    />
  );
};

export default FormField;