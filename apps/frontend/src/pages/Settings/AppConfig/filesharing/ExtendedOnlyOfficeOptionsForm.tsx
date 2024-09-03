import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import getExtendedOptionValue from '@libs/appconfig/utils/getExtendedOptionValue';
import AppExtendedForm from '@libs/appconfig/types/appExtendedForm';
import AppConfigExtension from '@libs/appconfig/extensions/types/appConfigExtension';
import appExtension from '@libs/appconfig/extensions/constants/appExtension';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import FormField from '@/components/shared/FormField';
import FileSharingAppExtensions from '@libs/appconfig/extensions/types/file-sharing-app-extension-enum';

interface ExtendedOnlyOfficeOptionsFormProps {
  baseName: string;
  extendedOptions: AppConfigExtension[];
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
    ONLY_OFFICE_URL: getExtendedOptionValue(appConfigs, appExtension, FileSharingAppExtensions.ONLY_OFFICE_URL) || '',
    ONLY_OFFICE_JWT_SECRET:
      getExtendedOptionValue(appConfigs, appExtension, FileSharingAppExtensions.ONLY_OFFICE_JWT_SECRET) || '',
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
