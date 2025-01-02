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
import AppConfigSwitch from '@/pages/Settings/AppConfig/components/booleanField/AppConfigSwitch';

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
            type="text"
          />
        );
      case ExtendedOptionField.number:
        return (
          <AppConfigFormField
            key={fieldPath}
            fieldPath={fieldPath}
            control={control}
            option={option}
            type="number"
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
      case ExtendedOptionField.boolean:
        return (
          <AppConfigSwitch
            fieldPath={fieldPath}
            control={control}
            option={option}
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
            defaultValue={[section]}
          >
            <AccordionItem value={section}>
              <AccordionTrigger className="flex text-xl font-bold">
                <h4>{t(`settings.appconfig.sections.${section}.title`)}</h4>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-base">{t(`settings.appconfig.sections.${section}.description`)}</div>
                {options?.map((option: AppConfigExtendedOption) => (
                  <div
                    key={`key_${section}_${option.name}`}
                    className={option.width === 'full' ? 'w-full' : 'w-[calc(50%-12px)]'}
                  >
                    {renderComponent(option)}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </AccordionSH>
        ))}
    </div>
  );
};

export default ExtendedOptionsForm;
