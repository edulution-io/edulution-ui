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
