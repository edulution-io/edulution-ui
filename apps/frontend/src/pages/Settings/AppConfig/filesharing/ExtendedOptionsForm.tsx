import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AppConfigExtendedOptions from '@libs/appconfig/types/appConfigExtendedOptions';
import { ValueTypes } from '@libs/appconfig/types/appConfigExtendedOption';
import FormField from '@/components/shared/FormField';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/AccordionSH';

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

  return extendedOptionsWatcher.map((option) => (
    <AccordionItem
      key={`app-extension-${settingLocation}.${option.name}`}
      value={`app-extension-${settingLocation}`}
    >
      <AccordionTrigger className="flex text-xl font-bold">
        <h4>{t(`appExtendedOptions.${settingLocation}.${option.name}.title`)}</h4>
      </AccordionTrigger>
      <AccordionContent className="flex flex-wrap justify-between gap-4 text-foreground">
        {option.extensions?.map((extension) => (
          <div
            key={`${settingLocation}${option.name}${extension.name}`}
            className={extension.width === 'full' ? 'w-full' : 'w-[calc(50%-12px)]'}
          >
            <FormField
              form={form}
              onChange={(e) => updateExtendedOptions(option.name, extension.name, e.target.value)}
              defaultValue={extension.value || extension.defaultValue}
              type={extension.type}
              key={`${settingLocation}${option.name}${extension.name}FormField`}
              name={`${settingLocation}${option.name}${extension.name}FormField`}
              labelTranslationId={`appExtendedOptions.${settingLocation}.${option.name}.${extension.name}`}
              variant="lightGray"
            />
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  ));
};

export default ExtendedOptionsForm;
