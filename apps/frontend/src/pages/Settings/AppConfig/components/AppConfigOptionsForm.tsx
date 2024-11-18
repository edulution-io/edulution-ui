import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AppConfigSection, AppConfigField } from '@libs/appconfig/types';
import TYPE_NAME_APP_CONFIG_FIELDS_PROXY_CONFIG from '@libs/appconfig/constants/typeNameAppConfigFieldsProxyConfig';
import ProxyConfigForm from '@/pages/Settings/AppConfig/components/ProxyConfigForm';
import FormField from '@/components/shared/FormField';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/AccordionSH';

interface AppConfigOptionsFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<{ [x: string]: any }, any, undefined>;
  settingLocation: string;
  options: AppConfigSection[];
  onChange: (options: AppConfigSection[]) => void;
}

const AppConfigOptionsForm: React.FC<AppConfigOptionsFormProps> = ({ form, settingLocation, options, onChange }) => {
  const { t } = useTranslation();

  const updateAppConfigField = (fields: AppConfigField[], fieldName: string, fieldValue: string | number | boolean) =>
    fields.map((field: AppConfigField) => (field.name === fieldName ? { ...field, value: fieldValue } : field));

  const updateAppConfigSection = (sectionName: string, fieldName: string, fieldValue: string | number | boolean) =>
    options.map((section: AppConfigSection) =>
      section.sectionName === sectionName
        ? { ...section, options: updateAppConfigField(section.options, fieldName, fieldValue) }
        : section,
    );

  const handleOptionsChange = (sectionName: string, fieldName: string, fieldValue: string | number | boolean) => {
    const updatedExtendedOptions = updateAppConfigSection(sectionName, fieldName, fieldValue);
    onChange(updatedExtendedOptions);
  };

  const handleFormFieldChange = (
    sectionName: string,
    fieldName: string,
    newFieldValue: string | number | boolean | React.ChangeEvent<HTMLInputElement>,
  ) =>
    typeof newFieldValue === 'string' || typeof newFieldValue === 'number' || typeof newFieldValue === 'boolean'
      ? handleOptionsChange(sectionName, fieldName, newFieldValue)
      : handleOptionsChange(sectionName, fieldName, newFieldValue.target.value);

  if (!options) return null;
  if (options.length === 0) return null;
  return options.map((option) => (
    <AccordionItem
      key={`app-extension-${settingLocation}.${option.sectionName}`}
      value={`app-extension-${settingLocation}`}
    >
      <AccordionTrigger className="flex text-xl font-bold">
        <h4>{t(`appExtendedOptions.${settingLocation}.${option.sectionName}.title`)}</h4>
      </AccordionTrigger>
      <AccordionContent className="mx-1 flex flex-wrap justify-between gap-4 text-p text-foreground">
        {option.options?.map((field: AppConfigField) => (
          <div
            key={`${settingLocation}${option.sectionName}${field.name}`}
            className={field.width === 'full' ? 'w-full' : 'w-[calc(50%-12px)]'}
          >
            {field.type === TYPE_NAME_APP_CONFIG_FIELDS_PROXY_CONFIG ? (
              <ProxyConfigForm
                key={`${field.name}.${TYPE_NAME_APP_CONFIG_FIELDS_PROXY_CONFIG}`}
                settingLocation={settingLocation}
                item={field}
                form={form}
              />
            ) : (
              <FormField
                form={form}
                onChange={(e: string | number | boolean | React.ChangeEvent<HTMLInputElement>) =>
                  handleFormFieldChange(option.sectionName, field.name, e)
                }
                value={field.value}
                defaultValue={field.defaultValue}
                type={field.type}
                key={`${settingLocation}${option.sectionName}${field.name}FormField`}
                name={`${settingLocation}${option.sectionName}${field.name}FormField`}
                labelTranslationId={`appExtendedOptions.${settingLocation}.${option.sectionName}.${field.name}`}
                variant="lightGray"
                className="text-p text-white"
              />
            )}
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  ));
};

export default AppConfigOptionsForm;
