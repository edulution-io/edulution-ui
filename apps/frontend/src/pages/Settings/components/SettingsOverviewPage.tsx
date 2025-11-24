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

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SubmitHandler, useForm, UseFormReturn } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Separator from '@/components/ui/Separator';
import { DropdownSelect } from '@/components';
import useMedia from '@/hooks/useMedia';
import PageTitle from '@/components/PageTitle';
import { GlobalSettingsFormValues } from '@libs/global-settings/types/globalSettings.form';
import defaultValues from '@libs/global-settings/constants/defaultValues';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import GLOBAL_SETTINGS_TABS from '@libs/global-settings/constants/globalSettingsTabs';
import useDeploymentTarget from '@/hooks/useDeploymentTarget';
import { toast } from 'sonner';
import DockerContainerTable from '../AppConfig/DockerIntegration/DockerContainerTable';
import GlobalSettings from '../GlobalSettings/GlobalSettings';
import UserAdministration from './UserAdministration';
import useGlobalSettingsApiStore from '../GlobalSettings/useGlobalSettingsApiStore';
import GlobalSettingsFloatingButtons from '../GlobalSettings/GlobalSettingsFloatingButtons';
import InfoPage from '../Info/InfoPage';

interface TabOption {
  id: string;
  nameKey: string;
  component: (props: {
    form: UseFormReturn<GlobalSettingsFormValues>;
    onSubmit: SubmitHandler<GlobalSettingsDto>;
  }) => React.ReactNode;
}

const TAB_OPTIONS: TabOption[] = [
  {
    id: GLOBAL_SETTINGS_TABS.CONTAINER,
    nameKey: 'dockerOverview.container-view',
    component: () => <DockerContainerTable />,
  },
  {
    id: GLOBAL_SETTINGS_TABS.GLOBAL_SETTINGS,
    nameKey: 'settings.globalSettings.title',
    component: ({ form, onSubmit }) => (
      <GlobalSettings
        form={form}
        onSubmit={onSubmit}
      />
    ),
  },
  {
    id: GLOBAL_SETTINGS_TABS.USER_ADMINISTRATION,
    nameKey: 'settings.userAdministration.title',
    component: ({ form, onSubmit }) => (
      <UserAdministration
        form={form}
        onSubmit={onSubmit}
      />
    ),
  },
  { id: GLOBAL_SETTINGS_TABS.INFO, nameKey: 'settings.info.title', component: () => <InfoPage /> },
];

const showFloatingButtonsTabList: Set<string> = new Set([
  GLOBAL_SETTINGS_TABS.GLOBAL_SETTINGS,
  GLOBAL_SETTINGS_TABS.USER_ADMINISTRATION,
]);

const SettingsOverviewPage: React.FC = () => {
  const { t } = useTranslation();
  const { isMobileView, isTabletView } = useMedia();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { globalSettings, setGlobalSettings, getGlobalAdminSettings } = useGlobalSettingsApiStore();
  const { isGeneric } = useDeploymentTarget();

  const form = useForm<GlobalSettingsFormValues>({ defaultValues });

  const tabValue = pathname.split('/').pop() || GLOBAL_SETTINGS_TABS.CONTAINER;

  const showFloatingButtons = showFloatingButtonsTabList.has(tabValue);

  const [option, setOption] = useState(tabValue);

  const tabOptions = useMemo(() => TAB_OPTIONS.map((opt) => ({ ...opt, name: t(opt.nameKey) })), [t]);

  useEffect(() => {
    void getGlobalAdminSettings();
  }, [getGlobalAdminSettings]);

  useEffect(() => {
    setOption(tabValue);
  }, [tabValue]);

  useEffect(() => {
    if (!globalSettings) return;

    form.reset(
      {
        ...defaultValues,
        ...globalSettings,
        general: {
          ...defaultValues.general,
          ...(globalSettings.general ?? {}),
        },
        organisationInfo: {
          ...defaultValues.organisationInfo,
          ...(globalSettings.organisationInfo ?? {}),
        },
        auth: {
          mfaEnforcedGroups: globalSettings.auth?.mfaEnforcedGroups ?? [],
          adminGroups: globalSettings.auth?.adminGroups ?? [],
        },
        theme: {
          ...defaultValues.theme,
          ...(globalSettings.theme ?? {}),
        },
      },
      { keepDirtyValues: false },
    );
  }, [globalSettings, form.reset]);

  const onSubmit: SubmitHandler<GlobalSettingsDto> = (newGlobalSettings) => {
    if (isGeneric && newGlobalSettings.auth.adminGroups.length === 0) {
      toast.warning(t('settings.userAdministration.setAdminGroupWarning'));
      return;
    }
    void setGlobalSettings(newGlobalSettings);
  };

  const goToTab = (id: string) => navigate(`/settings/tabs/${id}`);

  if (!isMobileView && !isTabletView)
    return (
      <>
        <Tabs
          value={tabValue}
          className="flex h-full flex-col"
        >
          <div className="sticky top-0 z-20 backdrop-blur-xl">
            <TabsList
              className="grid sm:w-fit"
              style={{ gridTemplateColumns: `repeat(${TAB_OPTIONS.length}, minmax(0, 1fr))` }}
            >
              {tabOptions.map((item) => (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  onClick={() => goToTab(item.id)}
                  className="text-[clamp(0.65rem,2vw,0.8rem)] xl:min-w-64"
                >
                  {item.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <Separator className="my-2 bg-muted" />
          </div>
          {tabOptions.map((opt) => (
            <TabsContent
              key={opt.id}
              value={opt.id}
              className="flex-1 overflow-y-auto scrollbar-thin"
            >
              <PageTitle
                title={t('settings.sidebar')}
                translationId={opt.name}
              />
              {opt.component({ form, onSubmit })}
            </TabsContent>
          ))}
        </Tabs>
        {showFloatingButtons && <GlobalSettingsFloatingButtons handleSave={form.handleSubmit(onSubmit)} />}{' '}
      </>
    );

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-20">
        <DropdownSelect
          options={tabOptions}
          selectedVal={option}
          handleChange={goToTab}
        />
        <Separator className="my-2 bg-muted" />
      </div>
      <div className="flex-1 overflow-y-auto">
        {tabOptions.find((opt) => opt.id === option)?.component({ form, onSubmit })}
      </div>
      {showFloatingButtons && <GlobalSettingsFloatingButtons handleSave={form.handleSubmit(onSubmit)} />}
    </div>
  );
};

export default SettingsOverviewPage;
