import React from 'react';
import { FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import Input from '@/components/shared/Input';
import { Control, FieldValues, Path } from 'react-hook-form';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import formSchema from '@/pages/Settings/AppConfig/appConfigSchema';

type AppConfigFormFieldProps<T extends FieldValues> = {
  fieldPath: Path<T>;
  control: Control<z.infer<typeof formSchema>, T>;
  option: AppConfigExtendedOption;
  type?: 'password' | 'text';
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
      render={({ field }) => (
        <FormItem>
          <div>{t(option.title)}</div>
          <FormControl>
            <Input
              {...field}
              type={type}
              variant="lightGray"
            />
          </FormControl>
          <FormMessage className="text-p" />
        </FormItem>
      )}
    />
  );
};

export default AppConfigFormField;
