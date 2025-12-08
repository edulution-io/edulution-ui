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
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Input from '@/components/shared/Input';
import DropdownSelect from '@/components/ui/DropdownSelect/DropdownSelect';
import { FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import MailEncryption from '@libs/mail/constants/mailEncryption';
import type MailProviderConfig from '@libs/appconfig/types/mailProviderConfig';

type MailsConfigProps = {
  form: UseFormReturn<MailProviderConfig>;
};

const encOptions = Object.entries(MailEncryption).map(([value]) => ({
  id: value,
  name: value,
}));

const MailImporterConfigForm: React.FC<MailsConfigProps> = ({ form }) => {
  const { t } = useTranslation();
  return (
    <>
      <FormFieldSH
        control={form.control}
        name="mail.configName"
        defaultValue=""
        render={({ field }) => (
          <FormItem>
            <p>{t(field.name)}</p>
            <FormControl>
              <Input
                placeholder=""
                {...field}
              />
            </FormControl>
            <FormMessage className="text-p" />
          </FormItem>
        )}
      />
      <FormFieldSH
        control={form.control}
        name="mail.hostname"
        defaultValue=""
        render={({ field }) => (
          <FormItem>
            <p>{t(field.name)}</p>
            <FormControl>
              <Input
                placeholder="https://"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-p" />
          </FormItem>
        )}
      />
      <div className="flex flex-row justify-between gap-4">
        <FormFieldSH
          control={form.control}
          name="mail.port"
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <p>{t(field.name)}</p>
              <FormControl>
                <Input
                  placeholder={t('mail.portPlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-p" />
            </FormItem>
          )}
        />
        <FormFieldSH
          control={form.control}
          name="mail.encryption"
          defaultValue={MailEncryption.TLS}
          render={({ field }) => (
            <FormItem>
              <p>{t(field.name)}</p>
              <FormControl>
                <DropdownSelect
                  options={encOptions}
                  selectedVal={field.value}
                  handleChange={field.onChange}
                  classname="z-50"
                  openToTop
                />
              </FormControl>
              <FormMessage className="text-p" />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default MailImporterConfigForm;
