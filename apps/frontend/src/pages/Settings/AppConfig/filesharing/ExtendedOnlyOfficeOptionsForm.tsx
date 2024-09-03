import React from 'react';
import getExtendedOptionValue from '@libs/appconfig/utils/getExtendedOptionValue';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import FormField from '@/components/shared/FormField';
import { UseFormReturn } from 'react-hook-form';
import AppExtendedForm from '@libs/appconfig/types/appExtendedForm';
import { AppConfigExtendedOption } from '@libs/appconfig/constants/appExtentionOptions';
import { appExtendedOptions } from '@libs/appconfig/constants/appExtentions';
import { ExtendedOptions_OnlyOffice } from '@libs/appconfig/constants/appConfig-OnlyOffice';

interface ExtendedOnlyOfficeOptionsFormProps {
  baseName: string;
  extendedOptions: AppConfigExtendedOption[];
  disabled?: boolean;
  isLoading?: boolean;
  form: UseFormReturn<AppExtendedForm>;
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
      getExtendedOptionValue(appConfigs, appExtendedOptions, ExtendedOptions_OnlyOffice.ONLY_OFFICE_URL) || '',
    ONLY_OFFICE_JWT_SECRET:
      getExtendedOptionValue(appConfigs, appExtendedOptions, ExtendedOptions_OnlyOffice.ONLY_OFFICE_JWT_SECRET) || '',
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
              variant="lightGray"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExtendedOnlyOfficeOptionsForm;
