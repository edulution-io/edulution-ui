import React from 'react';
import { useTranslation } from 'react-i18next';
import { Control, FieldValues, Path } from 'react-hook-form';
import { z } from 'zod';
import AppConfigFormField from '@/pages/Settings/AppConfig/components/textField/AppConfigFormField';
import formSchema from '@/pages/Settings/AppConfig/appConfigSchema';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import AppConfigTable from '@/pages/Settings/AppConfig/components/table/AppConfigTable';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';
import { type AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import type AppConfigExtendedOptionsBySections from '@libs/appconfig/types/appConfigExtendedOptionsBySections';
import type TApps from '@libs/appconfig/types/appsType';

type ExtendedOptionsFormProps<T extends FieldValues> = {
  extendedOptions: AppConfigExtendedOptionsBySections | undefined;
  control: Control<z.infer<typeof formSchema>, T>;
  settingLocation: TApps;
};

const ExtendedOptionsForm: React.FC<ExtendedOptionsFormProps<FieldValues>> = <T extends FieldValues>({
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
            <AccordionItem value={section}>
              <AccordionTrigger className="flex text-xl font-bold">
                <h4>{t(`settings.appconfig.sections.${section}.title`)}</h4>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-base">{t(`settings.appconfig.sections.${section}.description`)}</div>
                <div className="flex flex-col gap-4">
                  {options?.map((option: AppConfigExtendedOption) => renderComponent(option))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </AccordionSH>
        ))}
    </div>
  );
};

export default ExtendedOptionsForm;
