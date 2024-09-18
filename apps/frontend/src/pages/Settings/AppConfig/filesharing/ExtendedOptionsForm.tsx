import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AppConfigExtendedOptions from '@libs/appconfig/extensions/types/appConfigExtendedOptions';
import FormField from '@/components/shared/FormField';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/AccordionSH';
import { ValueTypes } from '@libs/appconfig/extensions/types/appConfigExtendedOption';

interface ExtendedOptionsFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  settingLocation: string;
  extendedOptions: AppConfigExtendedOptions[];
}

const ExtendedOptionsForm: React.FC<ExtendedOptionsFormProps> = ({ form, settingLocation, extendedOptions }) => {
  const { t } = useTranslation();

  const updateExtendedOptions = (appExtension: string, appExtensionOption: string, value: ValueTypes) => {
    const appExtensionIndex = extendedOptions.findIndex((aExt) => aExt.name === appExtension);
    if (appExtensionIndex === -1) return;
    const appExtensionOptionIndex = extendedOptions[appExtensionIndex].extensions.findIndex(
      (aExtO) => aExtO.name === appExtensionOption,
    );
    if (appExtensionOptionIndex === -1) return;

    const extendedOptionsUpdate = form.getValues(`${settingLocation}.extendedOptions`) as AppConfigExtendedOptions[];
    extendedOptionsUpdate[appExtensionIndex].extensions[appExtensionOptionIndex].value = value;
    form.setValue(`${settingLocation}.extendedOptions`, extendedOptionsUpdate);
  };

  const extendedOptionsWatcher = (form.watch(`${settingLocation}.extendedOptions`) as AppConfigExtendedOptions[]) || [];

  return extendedOptionsWatcher.map((extension) => (
    <AccordionItem
      key={`app-extension-${settingLocation}.${extension.name}`}
      value={`app-extension-${settingLocation}`}
    >
      <AccordionTrigger className="flex text-xl font-bold">
        <h4>{t(`appExtendedOptions.${settingLocation}.${extension.name}.title`)}</h4>
      </AccordionTrigger>
      <AccordionContent className="flex flex-wrap justify-between gap-4 space-y-2 text-foreground">
        {extension.extensions.map((option) => (
          <div
            key={`${settingLocation}${extension.name}${option.name}`}
            className={option.width === 'full' ? 'w-full' : 'w-[calc(50%-12px)]'}
          >
            <FormField
              form={form}
              onChange={(e) => updateExtendedOptions(extension.name, option.name, e.target.value)}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              defaultValue={option.value || option.defaultValue}
              type={option.type}
              key={`${settingLocation}${extension.name}${option.name}FormField`}
              name={`${settingLocation}${extension.name}${option.name}FormField`}
              labelTranslationId={`appExtendedOptions.${settingLocation}.${extension.name}.${option.name}`}
              variant="lightGray"
            />
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  ));
};

export default ExtendedOptionsForm;
