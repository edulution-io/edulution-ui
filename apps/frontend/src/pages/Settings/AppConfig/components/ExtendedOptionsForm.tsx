import React from 'react';
import { useTranslation } from 'react-i18next';
import { Control, FieldValues, Path } from 'react-hook-form';
import AppConfigFormField from '@/pages/Settings/AppConfig/components/textField/AppConfigFormField';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import AppConfigTable from '@/pages/Settings/AppConfig/components/table/AppConfigTable';
import cn from '@libs/common/utils/className';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';
import { type AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import type AppConfigExtendedOptionsBySections from '@libs/appconfig/types/appConfigExtendedOptionsBySections';
import type TApps from '@libs/appconfig/types/appsType';
import AppConfigSwitch from './booleanField/AppConfigSwitch';

type ExtendedOptionsFormProps<T extends FieldValues> = {
  extendedOptions: AppConfigExtendedOptionsBySections | undefined;
  control: Control<T>;
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
            type="text"
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
      case ExtendedOptionField.table:
        return (
          <AppConfigTable
            key={fieldPath}
            applicationName={settingLocation || ''}
            tableId={option.name}
          />
        );
      case ExtendedOptionField.switch:
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
          >
            <AccordionItem value={section}>
              <AccordionTrigger className="flex text-xl font-bold">
                <h4 className="text-background">{t(`settings.appconfig.sections.${section}.title`)}</h4>
              </AccordionTrigger>
              <AccordionContent className="mx-1 flex flex-wrap justify-between gap-4 text-p">
                <div className="text-base text-background">
                  {t(`settings.appconfig.sections.${section}.description`)}
                </div>
                {options?.map((option: AppConfigExtendedOption) => (
                  <div
                    key={`key_${section}_${option.name}`}
                    className={cn(
                      { 'w-full': option.width === 'full' },
                      { 'w-[calc(50%-0.75rem)]': option.width === 'half' },
                      { 'w-[calc(33%-1.5rem)]': option.width === 'third' },
                      { 'w-[calc(25%-2.25rem)]': option.width === 'quarter' },
                    )}
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
