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
import { FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import AppConfigDto from '@libs/appconfig/types/appConfigDto';
import { UseFormReturn } from 'react-hook-form';
import type ProxyConfigFormType from '@libs/appconfig/types/proxyConfigFormType';
import type MailProviderConfig from '@libs/appconfig/types/mailProviderConfig';
import { useTranslation } from 'react-i18next';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import getDisplayName from '@/utils/getDisplayName';
import useLanguage from '@/hooks/useLanguage';
import DropdownSelect from '@/components/ui/DropdownSelect/DropdownSelect';

interface AppConfigFormProps {
  form: UseFormReturn<{ [settingLocation: string]: AppConfigDto } | ProxyConfigFormType | MailProviderConfig>;
  appConfig: AppConfigDto;
}

const AppConfigPositionSelect = ({ form, appConfig }: AppConfigFormProps) => {
  const { setValue, control, getValues } = form;
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { appConfigs } = useAppConfigsStore();

  return (
    <FormFieldSH
      control={control}
      name={`${appConfig.name}.position`}
      render={() => (
        <FormItem>
          <h3>{t('settings.appconfig.position.title')}</h3>
          <FormControl>
            <DropdownSelect
              options={Array.from({ length: appConfigs.length }).map((_, index) => ({
                id: `${index + 1}`,
                name: `${index + 1}. (${getDisplayName(appConfigs[index], language)})`,
              }))}
              selectedVal={getValues(`${appConfig.name}.position`)?.toString()}
              handleChange={(value: string) => setValue(`${appConfig.name}.position`, Number(value))}
            />
          </FormControl>
          <p>{t('settings.appconfig.position.description')}</p>
          <FormMessage className="text-p" />
        </FormItem>
      )}
    />
  );
};

export default AppConfigPositionSelect;
