import React from 'react';
import { useTranslation } from 'react-i18next';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import { AppConfigSectionsType } from '@libs/appconfig/types/appConfigSectionsType';
import FormField from '@/components/shared/FormField';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';

type ExtendedOptionsFormProps<T extends FieldValues> = {
  extendedOptions: AppConfigExtendedOption[] | undefined;
  form: UseFormReturn<T>;
  baseName?: string;
};

const ExtendedOptionsForm = <T extends FieldValues>({
  extendedOptions,
  form,
  baseName,
}: ExtendedOptionsFormProps<T>) => {
  const { register } = form;
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
          <FormField
            defaultValue={form.getValues(fieldPath) as string}
            {...register(fieldPath)}
            form={form}
            labelTranslationId={t(option.title)}
            type="text"
            variant="light"
          />
        );
      case ExtendedOptionField.password:
        return (
          <FormField
            defaultValue={form.getValues(fieldPath) as string}
            {...register(fieldPath)}
            form={form}
            labelTranslationId={t(option.title)}
            type="password"
            variant="light"
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
