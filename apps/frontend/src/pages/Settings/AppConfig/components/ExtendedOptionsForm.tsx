import React from 'react';
import { useTranslation } from 'react-i18next';
import { Control, FieldValues, Path } from 'react-hook-form';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import { AppConfigSectionsType } from '@libs/appconfig/types/appConfigSectionsType';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import AppConfigFormField from '@/pages/Settings/AppConfig/components/AppConfigFormField';
import { z } from 'zod';
import formSchema from '@/pages/Settings/AppConfig/appConfigSchema';

type ExtendedOptionsFormProps<T extends FieldValues> = {
  extendedOptions: AppConfigExtendedOption[] | undefined;
  control: Control<z.infer<typeof formSchema>, T>;
  baseName?: string;
};

const ExtendedOptionsForm = <T extends FieldValues>({
  extendedOptions,
  control,
  baseName,
}: ExtendedOptionsFormProps<T>) => {
  const { t } = useTranslation();

  const groupedComponentsBySections = extendedOptions?.reduce(
    (acc, option) => {
      const { section } = option;
      if (!acc[section]) acc[section] = [];
      acc[section].push(option);
      return acc;
    },
    {} as Record<AppConfigSectionsType, AppConfigExtendedOption[]>,
  );

  const renderComponent = (option: AppConfigExtendedOption) => {
    const fieldPath = (baseName ? `${baseName}.extendedOptions.${option.name}` : option.name) as Path<T>;

    switch (option.type) {
      case ExtendedOptionField.input:
        return (
          <AppConfigFormField
            fieldPath={fieldPath}
            control={control}
            option={option}
          />
        );
      case ExtendedOptionField.password:
        return (
          <AppConfigFormField
            fieldPath={fieldPath}
            control={control}
            option={option}
            type="password"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {groupedComponentsBySections &&
        Object.entries(groupedComponentsBySections).map(([section, options]) => (
          <AccordionSH
            type="multiple"
            key={section}
          >
            <AccordionItem value="onlyOffice">
              <AccordionTrigger className="flex text-xl font-bold">
                <h4>{t(`settings.appconfig.sections.${section}`)}</h4>
              </AccordionTrigger>
              <AccordionContent className="space-y-10 px-1 pt-4">
                <div className="space-y-4">{options.map((option) => renderComponent(option))}</div>
              </AccordionContent>
            </AccordionItem>
          </AccordionSH>
        ))}
    </div>
  );
};

export default ExtendedOptionsForm;
