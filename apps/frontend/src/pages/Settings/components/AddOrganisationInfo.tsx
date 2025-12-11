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
import { Path, UseFormReturn } from 'react-hook-form';
import { AccordionContent } from '@/components/ui/AccordionSH';
import FormField from '@/components/shared/FormField';
import { GlobalSettingsFormValues } from '@libs/global-settings/types/globalSettings.form';
import useDeploymentTarget from '@/hooks/useDeploymentTarget';

type AddOrganisationInfoProps = {
  form: UseFormReturn<GlobalSettingsFormValues>;
};

type FieldDef = {
  name: Path<GlobalSettingsFormValues>;
  labelKey: string;
  placeholder?: string;
};

const AddOrganisationInfo: React.FC<AddOrganisationInfoProps> = ({ form }) => {
  const { t } = useTranslation();
  const { isGeneric } = useDeploymentTarget();

  const fields: FieldDef[] = [
    {
      name: 'organisationInfo.name',
      labelKey: 'settings.globalSettings.organisationInfo.name',
      placeholder: t('settings.globalSettings.organisationInfo.namePlaceholder'),
    },
    {
      name: 'organisationInfo.street',
      labelKey: 'settings.globalSettings.organisationInfo.street',
      placeholder: t('settings.globalSettings.organisationInfo.streetPlaceholder'),
    },
    {
      name: 'organisationInfo.postalCode',
      labelKey: 'settings.globalSettings.organisationInfo.postalCode',
      placeholder: t('settings.globalSettings.organisationInfo.postalCodePlaceholder'),
    },
    {
      name: 'organisationInfo.city',
      labelKey: 'settings.globalSettings.organisationInfo.city',
      placeholder: t('settings.globalSettings.organisationInfo.postalCityPlaceholder'),
    },
    {
      name: 'organisationInfo.website',
      labelKey: 'settings.globalSettings.organisationInfo.website',
      placeholder: 'https://example.edu',
    },
  ];

  return (
    <AccordionContent className="space-y-2 px-1">
      <p>
        {t(
          isGeneric
            ? 'settings.globalSettings.organisationInfo.descriptionGeneric'
            : 'settings.globalSettings.organisationInfo.descriptionSchool',
        )}
      </p>
      {fields.map(({ name, labelKey, placeholder }) => (
        <FormField
          key={name}
          name={name}
          form={form}
          labelTranslationId={labelKey}
          placeholder={placeholder}
          value={(form.watch(name) as string) ?? ''}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => form.setValue(name, event.target.value)}
        />
      ))}
    </AccordionContent>
  );
};

export default AddOrganisationInfo;
