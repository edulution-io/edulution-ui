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
