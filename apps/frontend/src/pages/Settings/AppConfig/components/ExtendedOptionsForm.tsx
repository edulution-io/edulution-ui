import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AppConfigExtendedOptions from '@libs/appconfig/types/appConfigExtendedOptions';
import AppConfigExtendedOption from '@libs/appconfig/types/appConfigExtendedOption';
import FormField from '@/components/shared/FormField';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/AccordionSH';

interface ExtendedOptionsFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<{ [x: string]: any }, any, undefined>;
  settingLocation: string;
  extendedOptions: AppConfigExtendedOptions[];
  onExtendedOptionsChange: (extendedOptions: AppConfigExtendedOptions[]) => void;
}

const ExtendedOptionsForm: React.FC<ExtendedOptionsFormProps> = ({
  form,
  settingLocation,
  extendedOptions,
  onExtendedOptionsChange,
}) => {
  const { t } = useTranslation();

  const updateExtendedOption = (
    options: AppConfigExtendedOption[],
    appExtensionOption: string,
    value: string | number | boolean,
  ) =>
    options.map((option: AppConfigExtendedOption) =>
      option.name === appExtensionOption ? { ...option, value } : option,
    );

  const updateExtendedOptions = (appExtension: string, appExtensionOption: string, value: string | number | boolean) =>
    extendedOptions.map((extension: AppConfigExtendedOptions) =>
      extension.name === appExtension
        ? { ...extension, options: updateExtendedOption(extension.options, appExtensionOption, value) }
        : extension,
    );

  const handleExtendedOptionsChange = (
    appExtension: string,
    appExtensionOption: string,
    value: string | number | boolean,
  ) => {
    const updatedExtendedOptions = updateExtendedOptions(appExtension, appExtensionOption, value);
    onExtendedOptionsChange(updatedExtendedOptions);
  };

  const handleFormFieldChange = (
    optionName: string,
    extensionName: string,
    e: string | number | boolean | React.ChangeEvent<HTMLInputElement>,
  ) =>
    typeof e === 'string' || typeof e === 'number' || typeof e === 'boolean'
      ? handleExtendedOptionsChange(optionName, extensionName, e)
      : handleExtendedOptionsChange(optionName, extensionName, e.target.value);

  if (!extendedOptions) return null;
  if (extendedOptions.length === 0) return null;
  return extendedOptions.map((option) => (
    <AccordionItem
      key={`app-extension-${settingLocation}.${option.name}`}
      value={`app-extension-${settingLocation}`}
    >
      <AccordionTrigger className="flex text-xl font-bold">
        <h4>{t(`appExtendedOptions.${settingLocation}.${option.name}.title`)}</h4>
      </AccordionTrigger>
      <AccordionContent className="mx-1 flex flex-wrap justify-between gap-4 text-p text-foreground">
        {option.options?.map((extension) => (
          <div
            key={`${settingLocation}${option.name}${extension.name}`}
            className={extension.width === 'full' ? 'w-full' : 'w-[calc(50%-12px)]'}
          >
            <FormField
              form={form}
              onChange={(e: string | number | boolean | React.ChangeEvent<HTMLInputElement>) =>
                handleFormFieldChange(option.name, extension.name, e)
              }
              value={extension.value}
              defaultValue={extension.defaultValue}
              type={extension.type}
              key={`${settingLocation}${option.name}${extension.name}FormField`}
              name={`${settingLocation}${option.name}${extension.name}FormField`}
              labelTranslationId={`appExtendedOptions.${settingLocation}.${option.name}.${extension.name}`}
              variant="lightGray"
              className="text-p text-white"
            />
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  ));
};

export default ExtendedOptionsForm;
