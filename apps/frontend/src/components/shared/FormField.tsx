import { FieldValues, Path, PathValue, RegisterOptions, UseFormReturn } from 'react-hook-form';
import React, { HTMLInputTypeAttribute } from 'react';
import { useTranslation } from 'react-i18next';
import cn from '@libs/common/utils/className';
import Input from '@/components/shared/Input';
import { FormControl, FormFieldSH, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';

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
          <FormMessage className={cn('text-p')} />
        </FormItem>
      )}
    />
  );
};

export default FormField;
