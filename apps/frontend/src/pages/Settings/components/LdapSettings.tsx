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
import FormField from '@/components/shared/FormField';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { AccordionContent } from '@/components/ui/AccordionSH';
import { GlobalSettingsFormValues } from '@libs/global-settings/types/globalSettings.form';

type LdapSettingsProps = {
  form: UseFormReturn<GlobalSettingsFormValues>;
};

const LdapSettings = ({ form }: LdapSettingsProps) => {
  const { t } = useTranslation();

  return (
    <AccordionContent className="space-y-2 px-1">
      <p className="text-background">{t('settings.globalSettings.ldap.edulution-binduser-description')}</p>

      <FormField
        name="general.ldap.binduser.dn"
        form={form}
        value={form.watch('general.ldap.binduser.dn') || ''}
        labelTranslationId={t('settings.globalSettings.ldap.edulution-binduser-dn')}
        placeholder={t('not-set')}
      />

      <FormField
        name="general.ldap.binduser.password"
        form={form}
        value={form.watch('general.ldap.binduser.password') || ''}
        labelTranslationId={t('settings.globalSettings.ldap.edulution-binduser-password')}
        placeholder={t('not-set')}
        type="password"
      />
    </AccordionContent>
  );
};

export default LdapSettings;
