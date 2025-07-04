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
