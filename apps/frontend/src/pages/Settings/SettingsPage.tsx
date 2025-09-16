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
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '@/components/structure/layout/PageLayout';
import useLdapGroups from '@/hooks/useLdapGroups';
import ROOT_ROUTE from '@libs/common/constants/rootRoute';
import AppConfigPage from './AppConfig/AppConfigPage';
import SettingsOverviewPage from './components/SettingsOverviewPage';

const SettingsPage: React.FC = () => {
  const { settingLocation } = useParams();
  const { isSuperAdmin } = useLdapGroups();
  const navigate = useNavigate();
  const isAnAppConfigSelected = !!settingLocation;

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate(ROOT_ROUTE);
    }
  }, [isSuperAdmin]);

  return isAnAppConfigSelected ? (
    <AppConfigPage settingLocation={settingLocation} />
  ) : (
    <PageLayout>
      <SettingsOverviewPage />
    </PageLayout>
  );
};

export default SettingsPage;
