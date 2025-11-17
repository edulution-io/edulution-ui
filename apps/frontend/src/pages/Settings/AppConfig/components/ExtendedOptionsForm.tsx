/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
import AppLogo from '@/pages/Settings/AppConfig/components/AppLogo';
import AppConfigDropdownSelect from '@/pages/Settings/AppConfig/components/dropdown/AppConfigDropdownSelect';
import AppConfigSwitch from './booleanField/AppConfigSwitch';
import EmbeddedPageEditor from './EmbeddedPageEditor';
import AppConfigUpdateChecker from './updateChecker/AppConfigUpdateChecker';

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
          <AppLogo
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
      case ExtendedOptionField.updateChecker:
        return (
          <AppConfigUpdateChecker
            key={`${option.name}_updateChecker`}
            option={option}
          />
        );
      default:
        return null;
    }
  };

  return (
    extendedOptions &&
    Object.entries(extendedOptions).map(([section, options]) => (
      <AccordionSH
        type="multiple"
        key={section}
        defaultValue={[section]}
      >
        <AccordionItem value={section}>
          <AccordionTrigger className="flex text-xl font-bold">
            <h3 className="text-background">{t(`settings.appconfig.sections.${section}.title`)}</h3>
          </AccordionTrigger>
          <AccordionContent className="mx-1 flex flex-wrap justify-between gap-4 text-p">
            <div className="text-base text-background">{t(`settings.appconfig.sections.${section}.description`)}</div>
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
    ))
  );
};

export default ExtendedOptionsForm;
