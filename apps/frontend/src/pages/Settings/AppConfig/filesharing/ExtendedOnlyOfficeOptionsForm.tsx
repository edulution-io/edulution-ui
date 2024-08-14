import React from 'react';
import getExtendedOptionValue from '@libs/appconfig/utils/getExtendedOptionValue';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import FormField from '@/components/shared/FormField';
import AppExtendedOnlyOfficeForm from '@libs/appconfig/types/filesharing/appExtendedOnlyOfficeForm';
import { UseFormReturn } from 'react-hook-form';
import {
  AppConfigOnlyOfficeExtendedOption,
  appExtendedOnyOfficeOptions,
  AppOnlyOfficeExtendedOptions,
} from '@libs/appconfig/constants/filesharing/appExtendedOnlyOfficeType';

interface ExtendedOnlyOfficeOptionsFormProps {
  baseName: string;
  extendedOptions: AppConfigOnlyOfficeExtendedOption[];
  disabled?: boolean;
  isLoading?: boolean;
  form: UseFormReturn<AppExtendedOnlyOfficeForm>;
}

const ExtendedOnlyOfficeOptionsForm: React.FC<ExtendedOnlyOfficeOptionsFormProps> = ({
  baseName,
  extendedOptions,
  disabled,
  isLoading,
  form,
}) => {
  const { appConfigs } = useAppConfigsStore();

  const defaultValues: Record<string, string> = {
    ONLY_OFFICE_URL:
      getExtendedOptionValue(appConfigs, appExtendedOnyOfficeOptions, AppOnlyOfficeExtendedOptions.ONLY_OFFICE_URL) ||
      '',
    ONLY_OFFICE_JWT_SECRET:
      getExtendedOptionValue(
        appConfigs,
        appExtendedOnyOfficeOptions,
        AppOnlyOfficeExtendedOptions.ONLY_OFFICE_JWT_SECRET,
      ) || '',
  };

  return (
    <div>
      {form && (
        <div className="space-y-10 text-foreground">
          {extendedOptions.map((option) => (
            <FormField
              key={`${baseName}.${option.name}`}
              name={`${baseName}.${option.name}`}
              form={form}
              disabled={disabled}
              isLoading={isLoading}
              defaultValue={defaultValues[option.name]}
              labelTranslationId={option.title}
              variant="light"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExtendedOnlyOfficeOptionsForm;
