/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Control, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';
import { type AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import type AppConfigExtendedOptionsBySections from '@libs/appconfig/types/appConfigExtendedOptionsBySections';
import EmbeddedPageEditorForm from '@libs/appconfig/types/embeddedPageEditorForm';
import ThemedFile from '@libs/common/types/themedFile';
import cn from '@libs/common/utils/className';
import AppConfigFormField from '@/pages/Settings/AppConfig/components/textField/AppConfigFormField';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import AppConfigTable from '@/pages/Settings/AppConfig/components/table/AppConfigTable';
import AppConfigLogo from '@/pages/Settings/AppConfig/components/AppConfigLogo';
import AppConfigDropdownSelect from '@/pages/Settings/AppConfig/components/dropdown/AppConfigDropdownSelect';
import AppConfigSwitch from './booleanField/AppConfigSwitch';
import EmbeddedPageEditor from './EmbeddedPageEditor';

type ExtendedOptionsFormProps<T extends FieldValues> = {
  extendedOptions: AppConfigExtendedOptionsBySections | undefined;
  control: Control<T>;
  settingLocation: string;
  form: UseFormReturn<T>;
};

const ExtendedOptionsForm: React.FC<ExtendedOptionsFormProps<FieldValues>> = <T extends FieldValues>({
  extendedOptions,
  form,
  control,
  settingLocation,
}: ExtendedOptionsFormProps<T>) => {
  const { t } = useTranslation();

  const renderComponent = (option: AppConfigExtendedOption) => {
    const fieldPath = (settingLocation ? `${settingLocation}.extendedOptions.${option.name}` : option.name) as Path<T>;

    switch (option.type) {
      case ExtendedOptionField.logo:
        return (
          <AppConfigLogo
            key={fieldPath}
            fieldPath={fieldPath}
            settingLocation={settingLocation}
            form={form as unknown as UseFormReturn<ThemedFile>}
          />
        );
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
            option={option}
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
      case ExtendedOptionField.textarea:
        return (
          // TODO: Rework this component to be a generic textarea for reusablity
          // https://github.com/edulution-io/edulution-ui/issues/724
          <EmbeddedPageEditor
            name={settingLocation}
            form={form as unknown as UseFormReturn<EmbeddedPageEditorForm>}
          />
        );
      case ExtendedOptionField.dropdown:
        return (
          <AppConfigDropdownSelect
            key={fieldPath}
            control={control as unknown as Control<FieldValues>}
            fieldPath={fieldPath as string}
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
