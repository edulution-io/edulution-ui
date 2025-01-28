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

const encOptions = Object.entries(MailEncryption).map(([value], index) => ({
  id: index.toString(),
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
                variant="lightGray"
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
                variant="lightGray"
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
                  placeholder="993"
                  {...field}
                  variant="lightGray"
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
