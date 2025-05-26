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
import { Link } from 'react-router-dom';
import DesktopLogo from '@/assets/logos/edulution.io_USER INTERFACE.svg';
import MobileLogo from '@/assets/logos/edulution.io_USER INTERFACE-small.svg';
import { useTranslation } from 'react-i18next';
import useMedia from '@/hooks/useMedia';
import useUserStore from '@/store/UserStore/UserStore';
import PageTitle from '@/components/PageTitle';
import APPLICATION_NAME from '@libs/common/constants/applicationName';
import DASHBOARD_ROUTE from '@libs/dashboard/constants/dashboardRoute';

interface HeaderProps {
  hideHeadingText?: boolean;
}

const Header: React.FC<HeaderProps> = ({ hideHeadingText = false }: HeaderProps) => {
  const { isMobileView } = useMedia();
  const { t } = useTranslation();
  const { user } = useUserStore();

  const getHeadingText = () => {
    if (isMobileView || hideHeadingText) return null;
    return (
      <div className="ml-4 flex flex-col">
        <h3>
          {t('heading', {
            givenName: user?.firstName || '-',
            familyName: user?.lastName || '-',
          })}
        </h3>
        <p>{t('content', { applicationName: APPLICATION_NAME })}</p>
      </div>
    );
  };

  return (
    <div className="ml-2 flex items-center pb-1 md:mb-3 md:ml-7">
      <PageTitle translationId="dashboard.pageTitle" />
      <div className={`rounded-b-[8px] ${isMobileView ? 'mt-3 w-[150px]' : 'mt-0 w-[250px] bg-white'}`}>
        <Link to={DASHBOARD_ROUTE}>
          <img
            src={isMobileView ? MobileLogo : DesktopLogo}
            alt="edulution"
            className={isMobileView ? 'm-1' : 'm-4'}
          />
        </Link>
      </div>
      {getHeadingText()}
    </div>
  );
};

export default Header;
