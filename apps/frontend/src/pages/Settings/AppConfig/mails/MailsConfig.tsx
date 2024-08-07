import { DropdownMenu } from '@/components';
import Input from '@/components/shared/Input';
import { FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import useMailsStore from '@/pages/Mail/useMailsStore';
import { AppConfigOption } from '@libs/appconfig/types';
import MailProviderConfigDto from '@libs/mails/types/mailProviderConfig.dto';
import React, { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type MailsConfigProps = {
  item: AppConfigOption;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
};

const MailsConfig: React.FC<MailsConfigProps> = ({ item, form }) => {
  const { t } = useTranslation();
  const { externalMailProviderConfig, getExternalMailProviderConfig } = useMailsStore();
  const [option, setOption] = useState('');

  useEffect(() => {
    void getExternalMailProviderConfig();
  }, []);

  useEffect(() => {
    if (externalMailProviderConfig.length > 0) {
      setOption(externalMailProviderConfig[0].name);
    }
  }, [externalMailProviderConfig]);

  const mailProviderDropdownOptions: MailProviderConfigDto[] = [
    {
      id: '0',
      name: t('common.custom'),
      label: '',
      host: '',
      port: null,
      secure: true,
    },
    ...externalMailProviderConfig,
  ];

  return (
    <div className="space-y-4">
      <h4>{t(`usersettings.mails.importer.title`)}</h4>
      <DropdownMenu
        options={mailProviderDropdownOptions}
        selectedVal={t(option)}
        handleChange={setOption}
        classname="md:w-1/3"
      />
      <FormFieldSH
        key={item.id}
        control={form.control}
        name={item.id}
        defaultValue=""
        render={({ field }) => (
          <FormItem>
            <h4>{t('common.test')}</h4>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <p>{t('common.testDescription')}</p>
            <FormMessage className="text-p" />
          </FormItem>
        )}
      />
    </div>
  );
};

export default MailsConfig;
