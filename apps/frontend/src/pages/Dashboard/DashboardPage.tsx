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

import React from 'react';
import { useTranslation } from 'react-i18next';
import GROUPS_ID from '@libs/dashboard/constants/pageElementIds';
import Feed from '@/pages/Dashboard/Feed/Feed';
import PageLayout from '@/components/structure/layout/PageLayout';
import { Dashboard } from '@/assets/icons';
import APPLICATION_NAME from '@libs/common/constants/applicationName';
import PageTitle from '@/components/PageTitle';
import MobileFileAccessCard from './MobileFileAccess/MobileFileAccessCard';
import AccountInformation from './AccountInformation';
import QuotaCard from './QuotaCard';
import Groups from './Groups';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

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
    <PageLayout
      nativeAppHeader={{
        title: t('dashboard.pageTitle'),
        description: t('dashboard.description', { applicationName: APPLICATION_NAME }),
        iconSrc: Dashboard,
      }}
    >
      <PageTitle translationId="dashboard.pageTitle" />

      <div className="mt-3 flex flex-col-reverse gap-8 md:flex-row">
        {column1}
        {column2}
        {column3}
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
