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

const AddSchoolInfo: React.FC<AddSchoolInfoProps> = ({ form }) => {
  const { t } = useTranslation();

  return (
    <AccordionContent className="space-y-2 px-1">
      <p>{t('settings.globalSettings.schoolInfo.description')}</p>
      <FormField
        name="schoolInfo.name"
        form={form}
        value={form.watch('schoolInfo.name') || ''}
        labelTranslationId={t('settings.globalSettings.schoolInfo.name')}
        placeholder={t('settings.globalSettings.schoolInfo.namePlaceholder')}
      />
      <FormField
        name="schoolInfo.street"
        form={form}
        value={form.watch('schoolInfo.street') || ''}
        labelTranslationId={t('settings.globalSettings.schoolInfo.street')}
        placeholder={t('settings.globalSettings.schoolInfo.streetPlaceholder')}
      />
      <FormField
        name="schoolInfo.postalCode"
        form={form}
        value={form.watch('schoolInfo.postalCode') || ''}
        labelTranslationId={t('settings.globalSettings.schoolInfo.postalCode')}
        placeholder={t('settings.globalSettings.schoolInfo.postalCodePlaceholder')}
      />
      <FormField
        name="schoolInfo.website"
        form={form}
        value={form.watch('schoolInfo.website') || ''}
        labelTranslationId={t('settings.globalSettings.schoolInfo.website')}
        placeholder="https://example.edu"
        type="url"
      />
    </AccordionContent>
  );
};

export default AddSchoolInfo;
