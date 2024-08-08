import React from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useFormContext } from 'react-hook-form';
import { FormControl, FormItem, FormMessage } from '@/components/ui/Form';
import Input from '@/components/shared/Input';
import {
  AppConfigExtendedOption,
  appExtendedOptions,
  AvailableAppExtendedOptions,
} from '@libs/appconfig/types/appExtendedType';
import getExtendedOptionValue from '@libs/appconfig/utils/getExtendedOptionValue';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';

interface ExtendedOptionsFormProps {
  baseName: string;
  extendedOptions: AppConfigExtendedOption[];
}

const ExtendedOptionsForm: React.FC<ExtendedOptionsFormProps> = ({ baseName, extendedOptions }) => {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const { appConfigs } = useAppConfigsStore();

  const documentServerURL = getExtendedOptionValue(
    appConfigs,
    appExtendedOptions,
    AvailableAppExtendedOptions.ONLY_OFFICE_URL,
  );

  const jwtSecret = getExtendedOptionValue(
    appConfigs,
    appExtendedOptions,
    AvailableAppExtendedOptions.ONLY_OFFICE_JWT_SECRET,
  );

  const defaultValues = {
    ONLY_OFFICE_URL: documentServerURL,
    ONLY_OFFICE_JWT_SECRET: jwtSecret,
  };

  return (
    <div className="space-y-10">
      {extendedOptions.map((option) => (
        <Controller
          key={`${baseName}.${option.name}`}
          name={`${baseName}.${option.name}`}
          control={control}
          defaultValue={defaultValues[option.name] || option.value}
          render={({ field }) => (
            <FormItem>
              <h4>{t(option.title)}</h4>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <p>{t(option.description)}</p>
              <FormMessage className="text-p" />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
};

export default ExtendedOptionsForm;
