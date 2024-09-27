import React, { HTMLInputTypeAttribute } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
import { cva, type VariantProps } from 'class-variance-authority';
import cn from '@/lib/utils';
import useIsMobileView from '@/hooks/useIsMobileView';
import Input from '@/components/shared/Input';
import { FormControl, FormFieldSH, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';

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
  type?: HTMLInputTypeAttribute;
  defaultValue?: PathValue<T, Path<T>> | string;
  readonly?: boolean;
  value?: string | string[] | number;
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
  const isMobileView = useIsMobileView();

  const { t } = useTranslation();

  return (
    <FormFieldSH
      control={form.control}
      disabled={disabled}
      name={name as Path<T>}
      defaultValue={defaultValue as PathValue<T, Path<T>>}
      render={({ field }) => (
        <FormItem>
          <div className={cn({ 'flex flex-row gap-2': !isMobileView }, { 'space-y-2': isMobileView }, 'items-center')}>
            <FormLabel className={cn({ 'flex-0 w-[200px]': !isMobileView }, variants({ variant }))}>
              <p className="font-bold">{t(labelTranslationId)}:</p>
            </FormLabel>
            <div className={cn({ 'flex-1 flex-wrap gap-2': !isMobileView })}>
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
            </div>
          </div>
          <FormMessage className={cn('text-p', variants({ variant }))} />
        </FormItem>
      )}
    />
  );
};

export default FormField;
