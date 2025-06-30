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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Separator from '@/components/ui/Separator';
import { DropdownSelect } from '@/components';
import useMedia from '@/hooks/useMedia';
import { GLOBAL_SETTINGS_ROOT_ENDPOINT } from '@libs/global-settings/constants/globalSettingsApiEndpoints';
import CONTAINER from '@libs/docker/constants/container';
import PageTitle from '@/components/PageTitle';
import cn from '@libs/common/utils/className';
import DockerContainerTable from '../AppConfig/DockerIntegration/DockerContainerTable';
import LicenseOverview from './LicenseOverview';
import GlobalSettings from '../GlobalSettings/GlobalSettings';
import UserAdministration from './UserAdministration';

interface TabOption {
  id: string;
  nameKey: string;
  component: React.ReactNode;
}
const TAB_OPTIONS: TabOption[] = [
  { id: CONTAINER, nameKey: 'dockerOverview.container-view', component: <DockerContainerTable /> },
  { id: GLOBAL_SETTINGS_ROOT_ENDPOINT, nameKey: 'settings.globalSettings.title', component: <GlobalSettings /> },
  { id: 'user-administration', nameKey: 'settings.userAdministration.title', component: <UserAdministration /> },
  { id: 'info', nameKey: 'settings.info.title', component: <LicenseOverview /> },
];

const SettingsOverviewPage: React.FC = () => {
  const { t } = useTranslation();
  const { isMobileView, isTabletView } = useMedia();
  const location = useLocation();
  const navigate = useNavigate();

  const tabValue = location.pathname.split('/').pop() || CONTAINER;
  const [option, setOption] = useState(tabValue);

  const tabOptions = useMemo(() => TAB_OPTIONS.map((opt) => ({ ...opt, name: t(opt.nameKey) })), []);

  useEffect(() => {
    setOption(tabValue);
  }, [tabValue]);

  const goToTab = (id: string) => navigate(`/settings/tabs/${id}`);

  if (!isMobileView && !isTabletView)
    return (
      <Tabs value={tabValue}>
        <div className="sticky top-0 z-20 backdrop-blur-xl">
          <TabsList className={cn('grid sm:w-fit', `grid-cols-${TAB_OPTIONS.length}`)}>
            {tabOptions.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                onClick={() => goToTab(item.id)}
                className="min-w-20 text-[clamp(0.65rem,2vw,0.8rem)] lg:min-w-64 lg:text-p"
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
            {opt.component}
          </TabsContent>
        ))}
      </Tabs>
    );

  return (
    <>
      <div className="sticky top-0 z-20 backdrop-blur-xl">
        <DropdownSelect
          options={tabOptions}
          selectedVal={option}
          handleChange={goToTab}
          classname="w-[calc(100%-2.5rem)]"
        />
      </div>
      <Separator className="my-2" />
      {tabOptions.find((opt) => opt.id === option)?.component}
    </>
  );
};

export default SettingsOverviewPage;
