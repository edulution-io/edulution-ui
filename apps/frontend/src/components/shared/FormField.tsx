import React from 'react';
import { ControllerRenderProps, FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { cva, type VariantProps } from 'class-variance-authority';
import cn from '@/lib/utils';
import Input from '@/components/shared/Input';
import Switch from '@/components/ui/Switch';
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
  type?: React.HTMLInputTypeAttribute;
  defaultValue?: PathValue<T, Path<T>> | string;
  value?: string | number | boolean;
  onChange?: (e: string | number | boolean | React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
} & VariantProps<typeof variants>;

const FormField = <T extends FieldValues>({
  form,
  disabled,
  name,
  isLoading,
  labelTranslationId,
  type,
  defaultValue,
  value,
  onChange,
  variant = 'lightGray',
  readOnly = false,
}: FormFieldProps<T>) => {
  const { t } = useTranslation();

  const getInputComponent = (field: ControllerRenderProps<T, Path<T>>) => {
    switch (type) {
      case 'boolean': {
        return (
          <Switch
            checked={value as boolean}
            onCheckedChange={onChange}
            disabled={readOnly || disabled || isLoading}
          />
        );
      }
      case 'number': {
        return (
          <Input
            {...field}
            type="number"
            defaultValue={defaultValue as string}
            value={value as number}
            onChange={onChange}
            disabled={disabled || isLoading}
            readOnly={readOnly}
            variant={variant}
          />
        );
      }
      // TODO: extend type with dropdown to enable the selection of choices
      case 'text':
      default: {
        return (
          <Input
            {...field}
            type={type}
            defaultValue={defaultValue as string}
            value={value as string}
            onChange={onChange}
            disabled={disabled || isLoading}
            readOnly={readOnly}
            variant={variant}
          />
        );
      }
    }
  };

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
          <FormControl>{getInputComponent(field)}</FormControl>
          <FormMessage className={cn(variants({ variant }), 'text-p')} />
        </FormItem>
      )}
    />
  );
};

export default FormField;
