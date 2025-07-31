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

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SubmitHandler, useForm } from 'react-hook-form';
import type MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import useGroupStore from '@/store/GroupStore';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import AppConfigSwitch from '@/pages/Settings/AppConfig/components/booleanField/AppConfigSwitch';
import AppDropdownSelectFormField from '@/components/ui/DropdownSelect/AppDropdownSelectFormField';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import defaultValues from '@libs/global-settings/constants/defaultValues';
import { GLOBAL_SETTINGS_AUTH_MFA_ENFORCED_GROUPS } from '@libs/global-settings/constants/globalSettingsApiEndpoints';
import LdapSettings from '@/pages/Settings/components/LdapSettings';
import useGlobalSettingsApiStore from './useGlobalSettingsApiStore';
import GlobalSettingsFloatingButtons from './GlobalSettingsFloatingButtons';
import DeploymentTargetDropdownSelectFormField from '../components/DeploymentTargetDropdownSelectFormField';

const GlobalSettings: React.FC = () => {
  const { t } = useTranslation();
  const { searchGroups } = useGroupStore();
  const { appConfigs } = useAppConfigsStore();
  const { globalSettings, getGlobalAdminSettings, setGlobalSettings } = useGlobalSettingsApiStore();

  const form = useForm<GlobalSettingsDto>({ defaultValues });

  const {
    watch,
    setValue,
    reset,
    control,
    handleSubmit,
    formState: { isDirty },
    getValues,
  } = form;

  useEffect(() => {
    void getGlobalAdminSettings();
  }, [getGlobalAdminSettings]);

  useEffect(() => {
    if (globalSettings) {
      reset({
        ...defaultValues,
        ...globalSettings,
        auth: {
          mfaEnforcedGroups: globalSettings.auth?.mfaEnforcedGroups || [],
        },
      });
    }
  }, [globalSettings, reset]);

  const defaultLandingPageAppName = watch('general.defaultLandingPage.appName');
  const isCustomLandingPageEnabled = watch('general.defaultLandingPage.isCustomLandingPageEnabled');

  useEffect(() => {
    if (!isDirty || !appConfigs.length) return;

    if (isCustomLandingPageEnabled && !defaultLandingPageAppName) {
      setValue('general.defaultLandingPage.appName', appConfigs[0].name);
    } else if (!isCustomLandingPageEnabled) {
      setValue('general.defaultLandingPage', defaultValues.general.defaultLandingPage);
    }
  }, [defaultLandingPageAppName, isCustomLandingPageEnabled, appConfigs, setValue]);

  const handleGroupsChange = (newGroups: MultipleSelectorGroup[]) => {
    const uniqueGroups = newGroups.reduce<MultipleSelectorGroup[]>((acc, g) => {
      if (!acc.some((x) => x.value === g.value)) acc.push(g);
      return acc;
    }, []);
    setValue(`auth.${GLOBAL_SETTINGS_AUTH_MFA_ENFORCED_GROUPS}`, uniqueGroups, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<GlobalSettingsDto> = (newGlobalSettings) => {
    void setGlobalSettings(newGlobalSettings);
  };

  return (
    <>
      <AccordionSH
        type="multiple"
        defaultValue={['general', 'security', 'ldap']}
      >
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <AccordionItem value="general">
              <AccordionTrigger className="flex">
                <h4>{t('settings.globalSettings.general')}</h4>
              </AccordionTrigger>

              <AccordionContent className="space-y-2 px-1 text-p">
                <p className="text-xl font-bold">{t('settings.globalSettings.deploymentTarget')}</p>
                <DeploymentTargetDropdownSelectFormField form={form} />
              </AccordionContent>

              <AccordionContent className="space-y-2 px-1 text-p">
                <p className="text-xl font-bold">{t('settings.globalSettings.defaultLandingPageTitle')}</p>
                <AppConfigSwitch
                  fieldPath="general.defaultLandingPage.isCustomLandingPageEnabled"
                  control={control}
                  option={{
                    title: t('settings.globalSettings.defaultLandingPageDescription'),
                    description: t('settings.globalSettings.defaultLandingPageSwitchDescription'),
                  }}
                />
                {isCustomLandingPageEnabled && (
                  <AppDropdownSelectFormField
                    appNamePath="general.defaultLandingPage.appName"
                    form={form}
                    variant="default"
                  />
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="security">
              <AccordionTrigger className="flex">
                <h4>{t('settings.globalSettings.multiFactorAuthentication')}</h4>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 px-1">
                <p className="text-background">{t('settings.globalSettings.mfaDescription')}</p>
                <FormFieldSH
                  control={control}
                  name={`auth.${GLOBAL_SETTINGS_AUTH_MFA_ENFORCED_GROUPS}`}
                  render={() => (
                    <FormItem>
                      <p className="font-bold">{t('permission.groups')}</p>
                      <FormControl>
                        <AsyncMultiSelect<MultipleSelectorGroup>
                          value={getValues(`auth.${GLOBAL_SETTINGS_AUTH_MFA_ENFORCED_GROUPS}`)}
                          onSearch={searchGroups}
                          onChange={handleGroupsChange}
                          placeholder={t('search.type-to-search')}
                        />
                      </FormControl>
                      <p className="text-background">{t('settings.globalSettings.selectUserGroups')}</p>
                      <FormMessage className="text-p" />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ldap">
              <AccordionTrigger className="flex">
                <h4>{t('settings.globalSettings.ldap.title')}</h4>
              </AccordionTrigger>
              <LdapSettings form={form} />
            </AccordionItem>
          </form>
        </Form>
      </AccordionSH>
      <GlobalSettingsFloatingButtons handleSave={handleSubmit(onSubmit)} />
    </>
  );
};

export default GlobalSettings;
