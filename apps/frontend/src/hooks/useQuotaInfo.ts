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

import { useEffect, useMemo } from 'react';
import useLmnApiStore from '@/store/useLmnApiStore';
import useUserStore from '@/store/UserStore/useUserStore';
import formatQuotaInGb from '@libs/common/utils/formatQuotaInGb';
import getProgressBarColor from '@libs/common/utils/getProgressBarColor';
import type QuotaResponse, { QuotaInfo } from '@libs/lmnApi/types/lmnApiQuotas';
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import DEFAULT_SCHOOL from '@libs/lmnApi/constants/defaultSchool';

interface UseQuotaInfoResult {
  quotaUsed: number | string;
  quotaHardLimit: number | string;
  quotaUsedInGb: string;
  quotaHardLimitInGb: string;
  mailQuota: string;
  percentageUsed: number;
  progressBarColor: string;
  isLoading: boolean;
}

const useQuotaInfo = (externalUser?: LmnUserInfo, externalQuota?: QuotaResponse): UseQuotaInfoResult => {
  const { user: lmnUser, lmnApiToken, usersQuota, fetchUsersQuota } = useLmnApiStore();
  const { user } = useUserStore();

  const effectiveUser = externalUser ?? lmnUser;
  const effectiveQuota = externalQuota ?? usersQuota;
  const school = effectiveUser?.school ?? DEFAULT_SCHOOL;

  useEffect(() => {
    if (!externalUser && !externalQuota && lmnApiToken && user?.username) {
      void fetchUsersQuota(user.username);
    }
  }, [lmnApiToken, user?.username, externalUser, externalQuota]);

  return useMemo(() => {
    const quota = effectiveQuota?.[effectiveUser?.school || DEFAULT_SCHOOL] as QuotaInfo | undefined;
    const quotaUsed = quota?.used ?? '--';
    const quotaHardLimit = quota?.hard_limit ?? '--';
    const mailQuota = effectiveUser?.sophomorixMailQuotaCalculated?.[0] ?? '--';

    const percentageUsed =
      typeof quotaUsed === 'number' && typeof quotaHardLimit === 'number' ? (quotaUsed / quotaHardLimit) * 100 : 0;

    return {
      quotaUsed,
      quotaHardLimit,
      quotaUsedInGb: formatQuotaInGb(quotaUsed),
      quotaHardLimitInGb: formatQuotaInGb(quotaHardLimit),
      mailQuota,
      percentageUsed,
      progressBarColor: getProgressBarColor(percentageUsed),
      isLoading: !quota,
    };
  }, [effectiveQuota, school, effectiveUser, lmnApiToken]);
};

export default useQuotaInfo;
