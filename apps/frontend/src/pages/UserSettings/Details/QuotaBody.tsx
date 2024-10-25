import React, { useEffect } from 'react';
import useLmnApiStore from '@/store/useLmnApiStore';
import useUserStore from '@/store/UserStore/UserStore';
import { useTranslation } from 'react-i18next';
import { type QuotaInfo } from '@libs/lmnApi/types/lmnApiQuotas';

const Quota: React.FC = () => {
  const { t } = useTranslation();
  const { user: lmnUser, usersQuota, fetchUsersQuota } = useLmnApiStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (usersQuota === null) {
      void fetchUsersQuota(user?.username || '');
    }
  }, [user]);

  const quota = usersQuota?.[lmnUser?.school || 'default-school'] as QuotaInfo | undefined;
  const quotaUsed = quota?.used || '--';
  const quotaHardLimit = quota?.hard_limit || '--';
  const mailQuota = lmnUser?.sophomorixMailQuotaCalculated?.[0] || '--';
  const percentageUsed = quota ? (quota.used / quota.hard_limit) * 100 : 0;

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
      <p>{lmnUser?.school}</p>
      <div className="relative my-1 h-1 w-full bg-gray-300">
        <div
          className={`absolute left-0 top-0 h-1 ${getSeparatorColor()}`}
          style={{ width: `${percentageUsed}%` }}
        />
      </div>
      <div color="white">
        <p>
          {quotaUsed} / {quotaHardLimit} {t('dashboard.quota.mibibyte')}
        </p>
      </div>
      <div color="white">
        <p className="font-bold">
          {t('dashboard.quota.globalQuota')}: {quotaHardLimit} {t('dashboard.quota.mibibyte')}
        </p>
        <p className="font-bold">
          {t('dashboard.quota.mailQuota')}: {mailQuota} {t('dashboard.quota.mibibyte')}
        </p>
      </div>
    </>
  );
};

export default Quota;
