import React from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import formSchema from '@/pages/Settings/AppConfig/appConfigSchema';
import { FormControl, FormDescription, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import Switch from '@/components/ui/Switch';

type AppConfigSwitchProps<T extends FieldValues> = {
  fieldPath: Path<T>;
  control: Control<z.infer<typeof formSchema>, T>;
  option: AppConfigExtendedOption;
};

const AppConfigSwitch = <T extends FieldValues>({ fieldPath, control, option }: AppConfigSwitchProps<T>) => {
  const { t } = useTranslation();

  return (
    <FormFieldSH
      control={control}
      name={fieldPath}
      render={({ field }) => (
        <FormItem>
          <div>{t(option.title)}</div>
          <FormControl>
            <div className="flex h-9 items-center">
              <Switch
                {...field}
                checked={field.value as boolean}
                onCheckedChange={() => field.onChange(!(field.value as boolean))}
                disabled={field.disabled}
              />
            </div>
          </FormControl>
          <FormDescription>{t(option.description)}</FormDescription>
          <FormMessage className="text-p" />
        </FormItem>
      )}
    />
  );
};

export default AppConfigSwitch;
