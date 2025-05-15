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
import { useTranslation } from 'react-i18next';
import GROUPS_ID from '@libs/dashboard/constants/pageElementIds';
import useUserStore from '@/store/UserStore/UserStore';
import useMedia from '@/hooks/useMedia';
import Feed from '@/pages/Dashboard/Feed/Feed';
import PageLayout from '@/components/structure/layout/PageLayout';
import MobileFileAccessCard from './MobileFileAccess/MobileFileAccessCard';
import AccountInformation from './AccountInformation';
import QuotaCard from './QuotaCard';
import Groups from './Groups';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  const { isMobileView } = useMedia();

  const { user } = useUserStore();

  const column1 = (
    <div className="basis-1/4">
      <AccountInformation />
    </div>
  );

  const column2 = (
    <div className="flex basis-1/2 flex-col gap-8">
      <div className="flex flex-col justify-between gap-8 md:flex-row">
        <div
          id={GROUPS_ID}
          className="flex-1"
        >
          <Groups />
        </div>
        <div className="flex-1">
          <MobileFileAccessCard />
        </div>
      </div>

      <QuotaCard />
    </div>
  );

  const column3 = (
    <div className="basis-1/4">
      <Feed />
    </div>
  );

  return (
    <PageLayout>
      <div>
        {isMobileView ? (
          <h3>
            {t('heading', {
              givenName: user?.firstName || '-',
              familyName: user?.lastName || '-',
            })}
          </h3>
        ) : null}
      </div>

      <div className="md:my-17 my-10 flex flex-col-reverse gap-8 md:flex-row">
        {column1}
        {column2}
        {column3}
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
