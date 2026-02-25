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
import useLmnApiStore from '@/store/useLmnApiStore';
import useQuotaInfo from '@/hooks/useQuotaInfo';
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import type QuotaResponse from '@libs/lmnApi/types/lmnApiQuotas';

interface QuotaProps {
  user?: LmnUserInfo;
  quotaData?: QuotaResponse;
}

const Quota: React.FC<QuotaProps> = ({ user, quotaData } = {}) => {
  const { t } = useTranslation();
  const { user: lmnUser } = useLmnApiStore();
  const { quotaUsedInGb, quotaHardLimitInGb, mailQuota, percentageUsed, progressBarColor } = useQuotaInfo(
    user,
    quotaData,
  );
  const displayUser = user ?? lmnUser;

  return (
    <>
      <p className="text-background">{displayUser?.school}</p>
      <div className="relative my-1 h-1 w-full bg-gray-300">
        <div
          className={`absolute left-0 top-0 h-1 ${progressBarColor}`}
          style={{ width: `${percentageUsed}%` }}
        />
      </div>
      <div color="white">
        <p className="text-background">
          {t('dashboard.quota.gbUsed', {
            used: quotaUsedInGb,
            total: quotaHardLimitInGb,
          })}
        </p>
      </div>
      <div color="background">
        <p className="font-bold text-background">
          {t('dashboard.quota.globalQuota')}: {quotaHardLimitInGb} GB
        </p>
        <p className="font-bold text-background">
          {t('dashboard.quota.mailQuota')}: {mailQuota} {t('dashboard.quota.mibibyte')}
        </p>
      </div>
    </>
  );
};

export default Quota;
