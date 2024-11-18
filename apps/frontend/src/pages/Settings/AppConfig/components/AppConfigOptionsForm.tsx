import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AppConfigSection, AppConfigField } from '@libs/appconfig/types';
import TYPE_NAME_APP_CONFIG_FIELDS_PROXY_CONFIG from '@libs/appconfig/constants/typeNameAppConfigFieldsProxyConfig';
import TAppFieldType from '@libs/appconfig/types/tAppFieldType';
import ProxyConfigForm from '@/pages/Settings/AppConfig/components/ProxyConfigForm';
import FormField from '@/components/shared/FormField';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/AccordionSH';

interface AppConfigOptionsFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<{ [x: string]: any }, any, undefined>;
  settingLocation: string;
  sections: AppConfigSection[];
  onChange: (options: AppConfigSection[]) => void;
}

const AppConfigOptionsForm: React.FC<AppConfigOptionsFormProps> = ({ form, settingLocation, sections, onChange }) => {
  const { t } = useTranslation();

  // Update the fields within a section
  const updateFields = (fields: AppConfigField[], fieldName: string, fieldValue: TAppFieldType) =>
    fields.map((field) => (field.name === fieldName ? { ...field, value: fieldValue } : field));

  // Update the entire section with modified fields
  const updateSection = (sectionName: string, fieldName: string, fieldValue: TAppFieldType) =>
    sections.map((section) =>
      section.sectionName === sectionName
        ? { ...section, options: updateFields(section.options, fieldName, fieldValue) }
        : section,
    );

  // Handle changes in the configuration options
  const handleOptionsChange = (sectionName: string, fieldName: string, fieldValue: TAppFieldType) => {
    const updatedOptions = updateSection(sectionName, fieldName, fieldValue);
    onChange(updatedOptions);
  };

  // Centralized handler for form field changes
  const handleFieldChange = (
    sectionName: string,
    fieldName: string,
    newValue: TAppFieldType | React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = typeof newValue === 'object' ? newValue.target.value : newValue;
    handleOptionsChange(sectionName, fieldName, value);
  };

  // Render a single field
  const renderField = (sectionName: string, field: AppConfigField) => {
    const isProxyConfig = field.type === TYPE_NAME_APP_CONFIG_FIELDS_PROXY_CONFIG;

    return (
      <div
        key={`${settingLocation}${sectionName}${field.name}`}
        className={field.width === 'full' ? 'w-full' : 'w-[calc(50%-12px)]'}
      >
        {isProxyConfig ? (
          <ProxyConfigForm
            settingLocation={settingLocation}
            item={field}
            form={form}
          />
        ) : (
          <FormField
            form={form}
            onChange={(e) => handleFieldChange(sectionName, field.name, e)}
            value={field.value}
            defaultValue={field.defaultValue}
            type={field.type}
            name={`${settingLocation}${sectionName}${field.name}FormField`}
            labelTranslationId={`appExtendedOptions.${settingLocation}.${sectionName}.${field.name}`}
            variant="lightGray"
            className="text-p text-white"
          />
        )}
      </div>
    );
  };

  // Render the component
  if (!sections || sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => (
        <AccordionItem
          key={`app-extension-${settingLocation}.${section.sectionName}`}
          value={`app-extension-${settingLocation}`}
        >
          <AccordionTrigger className="flex text-xl font-bold">
            <h4>{t(`appExtendedOptions.${settingLocation}.${section.sectionName}.title`)}</h4>
          </AccordionTrigger>
          <AccordionContent className="mx-1 flex flex-wrap justify-between gap-4 text-p text-foreground">
            {section.options?.map((field) => renderField(section.sectionName, field))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </>
  );
};

export default AppConfigOptionsForm;
