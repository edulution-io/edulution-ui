import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import AppExtendedForm from '@libs/appconfig/types/appExtendedForm';
import AppConfigExtendedOption from '@libs/appconfig/extensions/types/appConfigExtendedOption';
import FormField from '@/components/shared/FormField';

interface ExtendedOnlyOfficeOptionsFormProps {
  form: UseFormReturn<AppExtendedForm>;
  appName: string;
  appExtensionName: string;
  appExtensionOptions: AppConfigExtendedOption[];
}

const ExtendedOptionsForm: React.FC<ExtendedOnlyOfficeOptionsFormProps> = ({
  form,
  appName,
  appExtensionName,
  appExtensionOptions,
}) => (
  <div>
    {form && (
      <div className="space-y-10 text-foreground">
        {appExtensionOptions.map((option) => (
          <FormField
            form={form}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            defaultValue={option.value || option.defaultValue}
            type={option.type}
            key={`${appName}${appExtensionName}${option.name}`}
            name={`${appName}${appExtensionName}${option.name}`}
            labelTranslationId={`appExtendedOptions.${appName}.${appExtensionName}.${option.name}`}
            variant="lightGray"
          />
        ))}
      </div>
    )}
  </div>
);

export default ExtendedOptionsForm;
