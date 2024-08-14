import React, { useEffect, useState } from 'react';
import { DropdownMenu } from '@/components';
import { Button } from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import useMailsStore from '@/pages/Mail/useMailsStore';
import { MailProviderConfigDto, TMailEncryption } from '@libs/mail/types';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import MailEncryption from '@libs/mail/constants/mailEncryption';

type MailsConfigProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
};

const encOptions = Object.entries(MailEncryption).map(([value], index) => ({
  id: index.toString(),
  name: value,
}));

const MailsConfig: React.FC<MailsConfigProps> = ({ form }) => {
  const { t } = useTranslation();
  const { externalMailProviderConfig, getExternalMailProviderConfig, deleteExternalMailProviderConfig } =
    useMailsStore();
  const [option, setOption] = useState('');

  useEffect(() => {
    void getExternalMailProviderConfig();
  }, []);

  const mailProviderDropdownOptions: MailProviderConfigDto[] = [
    {
      id: '0',
      name: t('common.custom'),
      label: '',
      host: '',
      port: '993',
      encryption: MailEncryption.SSL,
    },
    ...externalMailProviderConfig,
  ];

  useEffect(() => {
    setOption(mailProviderDropdownOptions[0].name);
  }, [externalMailProviderConfig]);

  useEffect(() => {
    if (option && option !== t('common.custom')) {
      const mailProvider = mailProviderDropdownOptions.filter((itm) => itm.name === option)[0];
      form.setValue('mailProviderId', mailProvider.id);
      form.setValue('configName', mailProvider.name);
      form.setValue('hostname', mailProvider.host);
      form.setValue('port', mailProvider.port);
      form.setValue('encryption', mailProvider.encryption);
    }

    if (option === t('common.custom')) {
      form.reset({
        ...form.getValues(),
        mailProviderId: '',
        configName: '',
        hostname: '',
        port: '',
        encryption: MailEncryption.SSL,
      });
    }
  }, [option]);

  const handleDeleteMailProviderConfig = async (mailProviderId: string) => {
    await deleteExternalMailProviderConfig(mailProviderId).finally(() => {
      setOption(t('common.custom'));
    });
  };

  return (
    <div className="space-y-4">
      <h4>{t(`mail.importer.title`)}</h4>
      <div className="flex gap-4">
        <DropdownMenu
          options={mailProviderDropdownOptions}
          selectedVal={t(option)}
          handleChange={setOption}
          classname="md:w-1/3"
        />
        {option !== t('common.custom') ? (
          <Button
            variant="btn-collaboration"
            size="lg"
            type="button"
            onClick={() => handleDeleteMailProviderConfig(form.getValues('mailProviderId') as string)}
          >
            {t('common.delete')}
          </Button>
        ) : null}
      </div>
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
              <p>{t(`mail.importer.${field.name}`)}</p>
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
              <p>{t(`mail.importer.${field.name}`)}</p>
              <FormControl>
                <DropdownMenu
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
    </div>
  );
};

export default MailsConfig;
