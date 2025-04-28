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
import useLmnApiStore from '@/store/useLmnApiStore';
import { useTranslation } from 'react-i18next';
import useQuotaInfo from '@/hooks/useQuotaInfo';

const Quota: React.FC = () => {
  const { t } = useTranslation();
  const { user: lmnUser, lmnApiToken } = useLmnApiStore();

  const { quotaUsed, quotaHardLimit, mailQuota, percentageUsed, refetch } = useQuotaInfo();

  useEffect(() => {
    refetch();
  }, [lmnApiToken]);

  const getSeparatorColor = () => {
    if (percentageUsed <= 75) {
      return 'bg-ciLightGreen';
    }
    if (percentageUsed <= 90) {
      return 'bg-yellow-500';
    }
    return 'bg-ciRed';
  };

  return (
    <>
      <p className="text-background">{lmnUser?.school}</p>
      <div className="relative my-1 h-1 w-full bg-gray-300">
        <div
          className={`absolute left-0 top-0 h-1 ${getSeparatorColor()}`}
          style={{ width: `${percentageUsed}%` }}
        />
      </div>
      <div color="white">
        <p className="text-background">
          {quotaUsed} / {quotaHardLimit} {t('dashboard.quota.mibibyte')}
        </p>
      </div>
      <div color="background">
        <p className=" font-bold text-background">
          {t('dashboard.quota.globalQuota')}: {quotaHardLimit} {t('dashboard.quota.mibibyte')}
        </p>
        <p className="font-bold text-background">
          {t('dashboard.quota.mailQuota')}: {mailQuota} {t('dashboard.quota.mibibyte')}
        </p>
      </div>
    </>
  );
};

export default Quota;
