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
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Separator from '@/components/ui/Separator';
import DockerContainerTable from '../AppConfig/DockerIntegration/DockerContainerTable';
import LicenseOverview from './LicenseOverview';
import GlobalSettings from './GlobalSettings';

const SettingsOverviewPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const tabValue = location.pathname.split('/').pop() || 'container';

  const handleTabClick = (to: string) => {
    navigate(`/settings/tabs/${to}`);
  };

  return (
    <Tabs value={tabValue}>
      <TabsList className="grid w-fit grid-cols-3">
        <TabsTrigger
          value="container"
          onClick={() => handleTabClick('container')}
          className="w-64"
        >
          {t('dockerOverview.container-view')}
        </TabsTrigger>
        <TabsTrigger
          value="global-settings"
          onClick={() => handleTabClick('global-settings')}
          className="w-64"
        >
          {t('settings.globalSettings.title')}
        </TabsTrigger>
        <TabsTrigger
          value="info"
          onClick={() => handleTabClick('info')}
          className="w-64"
        >
          {t('settings.info.title')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="container">
        <Separator />
        <DockerContainerTable />
      </TabsContent>
      <TabsContent value="global-settings">
        <Separator />
        <GlobalSettings />
      </TabsContent>
      <TabsContent value="info">
        <Separator />
        <LicenseOverview />
      </TabsContent>
    </Tabs>
  );
};

export default SettingsOverviewPage;
