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

import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldValues, SubmitHandler, UseFormReturn } from 'react-hook-form';
import type MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import APPS from '@libs/appconfig/constants/apps';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';
import ASSET_TYPES from '@libs/appconfig/constants/assetTypes';
import { SectionAccordion, SectionAccordionItem } from '@/components/ui/SectionAccordion';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import useGroupStore from '@/store/GroupStore';
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import AppDropdownSelectFormField from '@/components/ui/DropdownSelect/AppDropdownSelectFormField';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import defaultValues from '@libs/global-settings/constants/defaultValues';
import { GLOBAL_SETTINGS_AUTH_MFA_ENFORCED_GROUPS } from '@libs/global-settings/constants/globalSettingsApiEndpoints';
import LdapSettings from '@/pages/Settings/components/LdapSettings';
import { GlobalSettingsFormValues } from '@libs/global-settings/types/globalSettings.form';
import AddOrganisationInfo from '@/pages/Settings/components/AddOrganisationInfo';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import ThemeSettings from '@/pages/Settings/components/ThemeSettings';
import AppConfigFormDarkAndLightAssetField from '@/pages/Settings/AppConfig/components/AppConfigFormDarkAndLightAssetField';
import AppConfigFormAssetField from '@/pages/Settings/AppConfig/components/AppConfigFormAssetField';
import applyBackgroundImage from '@/utils/applyBackgroundImage';
import useThemeStore from '@/store/useThemeStore';
import useDeploymentTarget from '@/hooks/useDeploymentTarget';
import DeploymentTargetDropdownSelectFormField from '../components/DeploymentTargetDropdownSelectFormField';

type GlobalSettingsProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<GlobalSettingsDto>;
};

const GlobalSettings = ({ form, onSubmit }: GlobalSettingsProps<GlobalSettingsFormValues>) => {
  const { t } = useTranslation();
  const { searchGroups } = useGroupStore();
  const { appConfigs } = useAppConfigsStore();
  const resolvedTheme = useThemeStore((s) => s.getResolvedTheme());
  const { isGeneric } = useDeploymentTarget();

  const {
    watch,
    setValue,
    control,
    handleSubmit,
    formState: { isDirty },
    getValues,
  } = form;

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

  const handleBackgroundUploadSuccess = useCallback(() => {
    applyBackgroundImage(resolvedTheme, Date.now());
  }, [resolvedTheme]);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <SectionAccordion defaultOpenAll>
          <SectionAccordionItem
            id="general"
            label={t('settings.globalSettings.general')}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xl font-bold">{t('settings.globalSettings.deploymentTarget')}</p>
                <DeploymentTargetDropdownSelectFormField form={form} />
              </div>

              <div className="space-y-2">
                <p className="text-xl font-bold">{t('settings.globalSettings.defaultLandingPageTitle')}</p>
                <p>{t('settings.globalSettings.defaultLandingPageDescription')}</p>
                <AppDropdownSelectFormField
                  appNamePath="general.defaultLandingPage.appName"
                  form={form}
                  variant="default"
                />
              </div>
            </div>
          </SectionAccordionItem>

          <SectionAccordionItem
            id="security"
            label={t('settings.globalSettings.multiFactorAuthentication')}
          >
            <div className="space-y-4">
              <p>{t('settings.globalSettings.mfaDescription')}</p>
              <FormFieldSH
                control={control}
                name={`auth.${GLOBAL_SETTINGS_AUTH_MFA_ENFORCED_GROUPS}`}
                render={() => (
                  <FormItem>
                    <p className="font-bold">{t('permission.groups')}</p>
                    <FormControl>
                      <AsyncMultiSelect<MultipleSelectorGroup>
                        value={getValues(`auth.${GLOBAL_SETTINGS_AUTH_MFA_ENFORCED_GROUPS}`) ?? []}
                        onSearch={searchGroups}
                        onChange={handleGroupsChange}
                        placeholder={t('search.type-to-search')}
                      />
                    </FormControl>
                    <p>{t('settings.globalSettings.selectUserGroups')}</p>
                    <FormMessage className="text-p" />
                  </FormItem>
                )}
              />
            </div>
          </SectionAccordionItem>

          <SectionAccordionItem
            id="ldap"
            label={t('settings.globalSettings.ldap.title')}
          >
            <LdapSettings form={form} />
          </SectionAccordionItem>

          <SectionAccordionItem
            id="branding"
            label={t('settings.globalSettings.branding.title')}
          >
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="font-bold">{t('settings.globalSettings.logo.title')}</p>
                <p>
                  {t(
                    isGeneric
                      ? 'settings.globalSettings.logo.descriptionGeneric'
                      : 'settings.globalSettings.logo.descriptionSchool',
                  )}
                </p>
                <AppConfigFormAssetField
                  settingLocation={APPS.GENERAL_SETTINGS}
                  fieldPath="brandingUploads.logo"
                  form={form}
                  assetType={ASSET_TYPES.logo}
                />
              </div>
              <div className="space-y-4">
                <p className="font-bold">{t('settings.globalSettings.background.title')}</p>
                <p>{t('settings.globalSettings.background.description')}</p>
                <AppConfigFormDarkAndLightAssetField
                  settingLocation={APPS.GENERAL_SETTINGS}
                  fieldPath="brandingUploads.background"
                  option={{
                    name: ExtendedOptionKeys.BACKGROUND,
                    title: 'settings.globalSettings.background.variant',
                    description: '',
                    type: ExtendedOptionField.appLogo,
                  }}
                  form={form}
                  assetType={ASSET_TYPES.background}
                  onUploadSuccess={handleBackgroundUploadSuccess}
                />
              </div>
            </div>
          </SectionAccordionItem>

          <SectionAccordionItem
            id="theme"
            label={t('settings.globalSettings.theme.title')}
          >
            <ThemeSettings form={form} />
          </SectionAccordionItem>

          <SectionAccordionItem
            id="organisationInfo"
            label={t('settings.globalSettings.organisationInfo.title')}
          >
            <AddOrganisationInfo form={form} />
          </SectionAccordionItem>
        </SectionAccordion>
      </form>
    </Form>
  );
};

export default GlobalSettings;
