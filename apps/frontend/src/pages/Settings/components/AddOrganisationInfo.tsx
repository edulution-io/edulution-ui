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
