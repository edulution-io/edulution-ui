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

import { useMemo } from 'react';
import useLmnApiStore from '@/store/useLmnApiStore';
import useUserStore from '@/store/UserStore/useUserStore';
import type { QuotaInfo } from '@libs/lmnApi/types/lmnApiQuotas';

const useQuotaInfo = (): {
  quotaUsed: number | string;
  quotaHardLimit: number | string;
  mailQuota: string;
  percentageUsed: number;
  isLoading: boolean;
  refetchUsersQuota: () => void;
} => {
  const { user: lmnUser, lmnApiToken, usersQuota, fetchUsersQuota } = useLmnApiStore();

  const { user } = useUserStore();
  const school = lmnUser?.school ?? 'default-school';

  const refetch = () => {
    if (lmnApiToken && user?.username) {
      void fetchUsersQuota(user.username);
    }
  };

  return useMemo(() => {
    const quota = usersQuota?.[lmnUser?.school || 'default-school'] as QuotaInfo | undefined;
    const quotaUsed = quota?.used ?? '--';
    const quotaHardLimit = quota?.hard_limit ?? '--';
    const mailQuota = lmnUser?.sophomorixMailQuotaCalculated?.[0] ?? '--';

    const percentageUsed =
      typeof quotaUsed === 'number' && typeof quotaHardLimit === 'number' ? (quotaUsed / quotaHardLimit) * 100 : 0;

    return {
      quotaUsed,
      quotaHardLimit,
      mailQuota,
      percentageUsed,
      isLoading: !quota,
      refetchUsersQuota: refetch,
    };
  }, [usersQuota, school, lmnUser, lmnApiToken]);
};

export default useQuotaInfo;
