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
  const customConfigOption = {
    id: '0',
    name: t('common.custom'),
    label: '',
    host: '',
    port: '993',
    encryption: MailEncryption.SSL,
  };
  const [option, setOption] = useState(customConfigOption.id);

  useEffect(() => {
    void getExternalMailProviderConfig();
  }, []);

  const mailProviderDropdownOptions: MailProviderConfigDto[] = [customConfigOption, ...externalMailProviderConfig];

  useEffect(() => {
    setOption(customConfigOption.id);
  }, [externalMailProviderConfig]);

  useEffect(() => {
    if (option && option !== customConfigOption.id) {
      const mailProvider = mailProviderDropdownOptions.filter((itm) => itm.id === option)[0];
      form.setValue('mail.mailProviderId', mailProvider.id);
      form.setValue('mail.configName', mailProvider.name);
      form.setValue('mail.hostname', mailProvider.host);
      form.setValue('mail.port', mailProvider.port);
      form.setValue('mail.encryption', mailProvider.encryption);
    }

    if (option === customConfigOption.id) {
      form.setValue('mail.mailProviderId', '');
      form.setValue('mail.configName', '');
      form.setValue('mail.hostname', '');
      form.setValue('mail.port', '');
      form.setValue('mail.encryption', MailEncryption.SSL);
    }
  }, [option]);

  const handleDeleteMailProviderConfig = async (mailProviderId: string) => {
    await deleteExternalMailProviderConfig(mailProviderId).finally(() => {
      setOption(customConfigOption.id);
    });
  };

  return (
    <AccordionSH type="multiple">
      <AccordionItem value="mails">
        <AccordionTrigger className="flex text-h4">
          <h3>{t(`mail.importer.title`)}</h3>
        </AccordionTrigger>
        <AccordionContent className="space-y-2 px-1">
          <div className="flex gap-4">
            <DropdownSelect
              options={mailProviderDropdownOptions}
              selectedVal={option}
              handleChange={setOption}
              classname="md:w-1/3"
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
