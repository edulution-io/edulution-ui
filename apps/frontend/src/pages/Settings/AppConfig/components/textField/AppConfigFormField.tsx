import React, { HTMLInputTypeAttribute } from 'react';
import { useTranslation } from 'react-i18next';
import { Control, FieldValues, Path, PathValue } from 'react-hook-form';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import { FormDescription, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import Input from '@/components/shared/Input';

type AppConfigFormFieldProps<T extends FieldValues> = {
  fieldPath: Path<T>;
  control: Control<T>;
  option: AppConfigExtendedOption;
  type?: HTMLInputTypeAttribute;
};

const AppConfigFormField = <T extends FieldValues>({
  fieldPath,
  control,
  option,
  type = 'text',
}: AppConfigFormFieldProps<T>) => {
  const { t } = useTranslation();

  return (
    <FormFieldSH
      control={control}
      name={fieldPath}
      defaultValue={'' as PathValue<T, Path<T>>}
      render={({ field }) => (
        <FormItem>
          <div>{t(option.title)}</div>
          <FormControl>
            <Input
              autoComplete="new-password"
              {...field}
              type={type}
              variant="lightGray"
            />
          </FormControl>
          <FormDescription>{t(option.description)}</FormDescription>
          <FormMessage className="text-p" />
        </FormItem>
      )}
    />
  );
};

export default AppConfigFormField;
