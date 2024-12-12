import React from 'react';
import { useTranslation } from 'react-i18next';
import { Control, FieldValues, Path } from 'react-hook-form';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import AppConfigFormField from '@/pages/Settings/AppConfig/components/textField/AppConfigFormField';
import { z } from 'zod';
import formSchema from '@/pages/Settings/AppConfig/appConfigSchema';
import AppConfigExtendedOptionsBySections from '@libs/appconfig/types/appConfigExtendedOptionsBySections';
import AppConfigTable from '@/pages/Settings/AppConfig/components/table/AppConfigTable';

type ExtendedOptionsFormProps<T extends FieldValues> = {
  extendedOptions: AppConfigExtendedOptionsBySections | undefined;
  control: Control<z.infer<typeof formSchema>, T>;
  settingLocation?: string;
};

const ExtendedOptionsForm = <T extends FieldValues>({
  extendedOptions,
  control,
  settingLocation,
}: ExtendedOptionsFormProps<T>) => {
  const { t } = useTranslation();

  const renderComponent = (option: AppConfigExtendedOption) => {
    const fieldPath = (settingLocation ? `${settingLocation}.extendedOptions.${option.name}` : option.name) as Path<T>;

    switch (option.type) {
      case ExtendedOptionField.input:
        return (
          <AppConfigFormField
            key={fieldPath}
            fieldPath={fieldPath}
            control={control}
            option={option}
          />
        );
      case ExtendedOptionField.password:
        return (
          <AppConfigFormField
            key={fieldPath}
            fieldPath={fieldPath}
            control={control}
            option={option}
            type="password"
          />
        );
      case ExtendedOptionField.table:
        return (
          <AppConfigTable
            key={fieldPath}
            applicationName={settingLocation || ''}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-10">
      {extendedOptions &&
        Object.entries(extendedOptions).map(([section, options]) => (
          <AccordionSH
            type="multiple"
            key={section}
          >
            <AccordionItem value="onlyOffice">
              <AccordionTrigger className="flex text-xl font-bold">
                <h4>{t(`settings.appconfig.sections.${section}`)}</h4>
              </AccordionTrigger>
              <AccordionContent>
                {options?.map((option: AppConfigExtendedOption) => renderComponent(option))}
              </AccordionContent>
            </AccordionItem>
          </AccordionSH>
        ))}
    </div>
  );
};

export default ExtendedOptionsForm;
