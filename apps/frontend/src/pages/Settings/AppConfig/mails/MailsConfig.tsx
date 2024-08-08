import { DropdownMenu } from '@/components';
import Input from '@/components/shared/Input';
import { FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import useMailsStore from '@/pages/Mail/useMailsStore';
import MailProviderConfigDto from '@libs/mail/types/mailProviderConfig.dto';
import React, { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type MailsConfigProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
};

const MailsConfig: React.FC<MailsConfigProps> = ({ form }) => {
  const { t } = useTranslation();
  const { externalMailProviderConfig, getExternalMailProviderConfig } = useMailsStore();
  const [option, setOption] = useState('');

  useEffect(() => {
    void getExternalMailProviderConfig();
  }, []);

  const mailProviderDropdownOptions: MailProviderConfigDto[] = [
    {
      id: '',
      name: t('common.custom'),
      label: '',
      host: '',
      port: null,
      secure: true,
    },
    ...externalMailProviderConfig,
  ];

  useEffect(() => {
    setOption(mailProviderDropdownOptions[0].name);
  }, [externalMailProviderConfig]);

  useEffect(() => {
    if (option && option !== t('common.custom')) {
      form.setValue('mailProviderId', mailProviderDropdownOptions.filter((itm) => itm.name === option)[0].id);
      form.setValue('configName', mailProviderDropdownOptions.filter((itm) => itm.name === option)[0].name);
      form.setValue('hostname', mailProviderDropdownOptions.filter((itm) => itm.name === option)[0].host);
      form.setValue('port', mailProviderDropdownOptions.filter((itm) => itm.name === option)[0].port);
    }

    if (option === t('common.custom')) {
      form.reset();
    }
  }, [option]);

  return (
    <div className="space-y-4">
      <h4>{t(`mail.importer.title`)}</h4>
      <DropdownMenu
        options={mailProviderDropdownOptions}
        selectedVal={t(option)}
        handleChange={setOption}
        classname="md:w-1/3"
      />
      <FormFieldSH
        control={form.control}
        name="configName"
        defaultValue=""
        render={({ field }) => (
          <FormItem>
            <p>{t(`mail.importer.${field.name}`)}</p>
            <FormControl>
              <Input
                placeholder=""
                {...field}
              />
            </FormControl>
            {/* <p>{t('mails.provider.description')}</p> */}
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
            <p>{t(`mail.importer.${field.name}`)}</p>
            <FormControl>
              <Input
                placeholder="https://"
                {...field}
              />
            </FormControl>
            {/* <p>{t('mails.provider.description')}</p> */}
            <FormMessage className="text-p" />
          </FormItem>
        )}
      />
      <FormFieldSH
        control={form.control}
        name="port"
        defaultValue=""
        render={({ field }) => (
          <FormItem>
            <p>{t(`mail.importer.${field.name}`)}</p>
            <FormControl>
              <Input
                placeholder={field.name}
                {...field}
              />
            </FormControl>
            {/* <p>{t('mails.provider.description')}</p> */}
            <FormMessage className="text-p" />
          </FormItem>
        )}
      />
    </div>
  );
};

export default MailsConfig;
