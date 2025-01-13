import React from 'react';
import Input from '@/components/shared/Input';
import DropdownSelect from '@/components/ui/DropdownSelect/DropdownSelect';
import { FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import MailEncryption from '@libs/mail/constants/mailEncryption';
import { TMailEncryption } from '@libs/mail/types';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type MailsConfigProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
};

const encOptions = Object.entries(MailEncryption).map(([value], index) => ({
  id: index.toString(),
  name: value,
}));

const MailsConfigForm: React.FC<MailsConfigProps> = ({ form }) => {
  const { t } = useTranslation();
  return (
    <>
      <FormFieldSH
        control={form.control}
        name="configName"
        defaultValue=""
        render={({ field }) => (
          <FormItem>
            <p className="text-background">{t(`mail.importer.${field.name}`)}</p>
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
        name="hostname"
        defaultValue=""
        render={({ field }) => (
          <FormItem>
            <p className="text-background">{t(`mail.importer.${field.name}`)}</p>
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
          name="port"
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <p className="text-background">{t(`mail.importer.${field.name}`)}</p>
              <FormControl>
                <Input
                  placeholder={field.name}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-p" />
            </FormItem>
          )}
        />
        <FormFieldSH
          control={form.control}
          name="encryption"
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <p className="text-background">{t(`mail.importer.${field.name}`)}</p>
              <FormControl>
                <DropdownSelect
                  options={encOptions}
                  selectedVal={field.value as TMailEncryption}
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

export default MailsConfigForm;
