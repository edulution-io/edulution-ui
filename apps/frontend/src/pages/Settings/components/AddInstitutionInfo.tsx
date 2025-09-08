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
import { UseFormReturn } from 'react-hook-form';
import { AccordionContent } from '@/components/ui/AccordionSH';
import FormField from '@/components/shared/FormField';
import { GlobalSettingsFormValues } from '@libs/global-settings/types/globalSettings.form';

type AddSchoolInfoProps = {
  form: UseFormReturn<GlobalSettingsFormValues>;
};

const AddInstitutionInfo: React.FC<AddSchoolInfoProps> = ({ form }) => {
  const { t } = useTranslation();

  return (
    <AccordionContent className="space-y-2 px-1">
      <p>{t('settings.globalSettings.organisationInfo.description')}</p>
      <FormField
        name="organisationInfo.name"
        form={form}
        value={form.watch('organisationInfo.name') || ''}
        labelTranslationId={t('settings.globalSettings.organisationInfo.name')}
        placeholder={t('settings.globalSettings.organisationInfo.namePlaceholder')}
      />
      <FormField
        name="organisationInfo.street"
        form={form}
        value={form.watch('organisationInfo.street') || ''}
        labelTranslationId={t('settings.globalSettings.organisationInfo.street')}
        placeholder={t('settings.globalSettings.organisationInfo.streetPlaceholder')}
      />
      <FormField
        name="organisationInfo.postalCode"
        form={form}
        value={form.watch('organisationInfo.postalCode') || ''}
        labelTranslationId={t('settings.globalSettings.organisationInfo.postalCode')}
        placeholder={t('settings.globalSettings.organisationInfo.postalCodePlaceholder')}
      />

      <FormField
        name="organisationInfo.city"
        form={form}
        value={form.watch('organisationInfo.city')}
        labelTranslationId={t('settings.globalSettings.organisationInfo.city')}
        placeholder={t('settings.globalSettings.organisationInfo.postalCityPlaceholder')}
      />

      <FormField
        name="organisationInfo.website"
        form={form}
        value={form.watch('organisationInfo.website')}
        labelTranslationId={t('settings.globalSettings.organisationInfo.website')}
        placeholder="https://example.edu"
      />
    </AccordionContent>
  );
};

export default AddInstitutionInfo;
