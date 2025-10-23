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
import DockerContainerTable from '../AppConfig/DockerIntegration/DockerContainerTable';
import LicenseOverview from './LicenseOverview';
import GlobalSettings from '../GlobalSettings/GlobalSettings';
import UserAdministration from './UserAdministration';
import useGlobalSettingsApiStore from '../GlobalSettings/useGlobalSettingsApiStore';
import GlobalSettingsFloatingButtons from '../GlobalSettings/GlobalSettingsFloatingButtons';

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
  { id: GLOBAL_SETTINGS_TABS.INFO, nameKey: 'settings.info.title', component: () => <LicenseOverview /> },
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
      },
      { keepDirtyValues: false },
    );
  }, [globalSettings, form.reset]);

  const onSubmit: SubmitHandler<GlobalSettingsDto> = (newGlobalSettings) => {
    void setGlobalSettings(newGlobalSettings);
  };

  const goToTab = (id: string) => navigate(`/settings/tabs/${id}`);

  if (!isMobileView && !isTabletView)
    return (
      <>
        <Tabs value={tabValue}>
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
          </div>
          {tabOptions.map((opt) => (
            <TabsContent
              key={opt.id}
              value={opt.id}
            >
              <PageTitle
                title={t('settings.sidebar')}
                translationId={opt.name}
              />
              <Separator />
              {opt.component({ form, onSubmit })}
            </TabsContent>
          ))}
        </Tabs>
        {showFloatingButtons && <GlobalSettingsFloatingButtons handleSave={form.handleSubmit(onSubmit)} />}{' '}
      </>
    );

  return (
    <>
      <div className="sticky top-0 z-20 backdrop-blur-xl">
        <DropdownSelect
          options={tabOptions}
          selectedVal={option}
          handleChange={goToTab}
        />
      </div>
      <Separator className="my-2" />
      {tabOptions.find((opt) => opt.id === option)?.component({ form, onSubmit })}
      {showFloatingButtons && <GlobalSettingsFloatingButtons handleSave={form.handleSubmit(onSubmit)} />}
    </>
  );
};

export default SettingsOverviewPage;
