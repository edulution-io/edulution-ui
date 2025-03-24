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

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Separator from '@/components/ui/Separator';
import { DropdownSelect } from '@/components';
import useMedia from '@/hooks/useMedia';
import DockerContainerTable from '../AppConfig/DockerIntegration/DockerContainerTable';
import LicenseOverview from './LicenseOverview';
import GlobalSettings from '../GlobalSettings/GlobalSettings';

const SettingsOverviewPage: React.FC = () => {
  const { t } = useTranslation();
  const { isMobileView } = useMedia();
  const location = useLocation();
  const navigate = useNavigate();

  const tabValue = location.pathname.split('/').pop() || 'container';
  const [option, setOption] = useState(tabValue);

  const handleTabClick = (to: string) => {
    navigate(`/settings/tabs/${to}`);
  };

  const tabOptions = [
    { id: 'container', name: t('dockerOverview.container-view') },
    { id: 'global-settings', name: t('settings.globalSettings.title') },
    { id: 'info', name: t('settings.info.title') },
  ];

  if (!isMobileView)
    return (
      <Tabs value={tabValue}>
        <TabsList className="grid grid-cols-3 sm:w-fit">
          {tabOptions.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              onClick={() => handleTabClick(item.id)}
              className="min-w-20 text-[clamp(0.65rem,2vw,0.8rem)] lg:min-w-64 lg:text-p"
            >
              {item.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={tabOptions[0].id}>
          <Separator />
          <DockerContainerTable />
        </TabsContent>
        <TabsContent value={tabOptions[1].id}>
          <Separator />
          <GlobalSettings />
        </TabsContent>
        <TabsContent value={tabOptions[2].id}>
          <Separator />
          <LicenseOverview />
        </TabsContent>
      </Tabs>
    );

  const handleDropdownSelect = (value: string) => {
    const selectedOption = tabOptions.find((opt) => opt.id === value);
    if (selectedOption) {
      setOption(selectedOption.id);
      navigate(`/settings/tabs/${selectedOption.id}`);
    }
  };

  return (
    <>
      <DropdownSelect
        options={tabOptions}
        selectedVal={option}
        handleChange={handleDropdownSelect}
        classname="w-[calc(100%-2.5rem)]"
      />
      <Separator className="my-2 " />
      {option === tabOptions[0].id && <DockerContainerTable />}
      {option === tabOptions[1].id && <GlobalSettings />}
      {option === tabOptions[2].id && <LicenseOverview />}
    </>
  );
};

export default SettingsOverviewPage;
