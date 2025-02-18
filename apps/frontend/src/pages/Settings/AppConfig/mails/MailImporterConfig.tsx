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

import React, { useEffect, useState } from 'react';
import { DropdownSelect } from '@/components';
import { Button } from '@/components/shared/Button';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import useMailsStore from '@/pages/Mail/useMailsStore';
import { MailProviderConfigDto } from '@libs/mail/types';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import MailEncryption from '@libs/mail/constants/mailEncryption';
import type MailProviderConfig from '@libs/appconfig/types/mailProviderConfig';
import MailImporterConfigForm from './MailImporterConfigForm';

type MailsConfigProps = {
  form: UseFormReturn<MailProviderConfig>;
};

const MailImporterConfig: React.FC<MailsConfigProps> = ({ form }) => {
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
      form.setValue('mail.mailProviderId', mailProvider.id);
      form.setValue('mail.configName', mailProvider.name);
      form.setValue('mail.hostname', mailProvider.host);
      form.setValue('mail.port', mailProvider.port);
      form.setValue('mail.encryption', mailProvider.encryption);
    }

    if (option === t('common.custom')) {
      form.setValue('mail.mailProviderId', '');
      form.setValue('mail.configName', '');
      form.setValue('mail.hostname', '');
      form.setValue('mail.port', '');
      form.setValue('mail.encryption', MailEncryption.SSL);
    }
  }, [option]);

  const handleDeleteMailProviderConfig = async (mailProviderId: string) => {
    await deleteExternalMailProviderConfig(mailProviderId).finally(() => {
      setOption(t('common.custom'));
    });
  };

  return (
    <AccordionSH type="multiple">
      <AccordionItem value="mails">
        <AccordionTrigger className="flex text-h4">
          <h4>{t(`mail.importer.title`)}</h4>
        </AccordionTrigger>
        <AccordionContent className="space-y-2 px-1">
          <div className="flex gap-4">
            <DropdownSelect
              options={mailProviderDropdownOptions}
              selectedVal={t(option)}
              handleChange={setOption}
              classname="md:w-1/3"
              variant="default"
            />
            {option !== t('common.custom') ? (
              <Button
                variant="btn-collaboration"
                size="lg"
                type="button"
                onClick={() => handleDeleteMailProviderConfig(form.getValues('mail.mailProviderId'))}
              >
                {t('common.delete')}
              </Button>
            ) : null}
          </div>
          <MailImporterConfigForm form={form} />
        </AccordionContent>
      </AccordionItem>
    </AccordionSH>
  );
};

export default MailImporterConfig;
