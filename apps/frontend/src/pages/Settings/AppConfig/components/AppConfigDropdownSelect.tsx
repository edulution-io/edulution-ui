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
import { FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import AppConfigDto from '@libs/appconfig/types/appConfigDto';
import { UseFormReturn } from 'react-hook-form';
import type ProxyConfigFormType from '@libs/appconfig/types/proxyConfigFormType';
import type MailProviderConfig from '@libs/appconfig/types/mailProviderConfig';
import { useTranslation } from 'react-i18next';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import getDisplayName from '@/utils/getDisplayName';
import useLanguage from '@/hooks/useLanguage';
import DropdownSelect from '../../../../components/ui/DropdownSelect/DropdownSelect';

interface AppConfigFormProps {
  form: UseFormReturn<{ [settingLocation: string]: AppConfigDto } | ProxyConfigFormType | MailProviderConfig>;
  appConfig: AppConfigDto;
}

const AppConfigDropdownSelect = ({ form, appConfig }: AppConfigFormProps) => {
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
          <h4>{t('settings.appconfig.position.title')}</h4>
          <FormControl>
            <DropdownSelect
              options={Array.from({ length: appConfigs.length }).map((_, index) => ({
                id: `${index + 1}`,
                name: `${index + 1}. (${getDisplayName(appConfigs[index], language)})`,
              }))}
              selectedVal={getValues(`${appConfig.name}.position`)?.toString()}
              handleChange={(value: string) => setValue(`${appConfig.name}.position`, Number(value))}
              classname="z-50"
            />
          </FormControl>
          <p>{t('settings.appconfig.position.description')}</p>
          <FormMessage className="text-p" />
        </FormItem>
      )}
    />
  );
};

export default AppConfigDropdownSelect;
