import React, { useEffect, useState } from 'react';
import { CardContent, Card } from '@/components/shared/Card';
import Separator from '@/components/ui/Separator';
import useLmnApiStore from '@/store/useLmnApiStore';
import QuotaResponse from '@libs/lmnApi/types/lmnApiQuotas';
import useUserStore from '@/store/UserStore/UserStore';
import { useTranslation } from 'react-i18next';

const Quota: React.FC = () => {
  const { t } = useTranslation();
  const { user: lmnUser, fetchUsersQuota } = useLmnApiStore();
  const { user } = useUserStore();
  const [usersQuota, setUsersQuota] = useState<QuotaResponse | null>(null);

  useEffect(() => {
    if (usersQuota === null) {
      const fetchQuota = async () => {
        const usersQuotaResponse = await fetchUsersQuota(user?.username || '');
        setUsersQuota(usersQuotaResponse);
      };

      void fetchQuota();
    }
  }, [user]);

  const quota = usersQuota?.[lmnUser?.school || 'default-school'];

  return (
    <Card variant="security">
      <CardContent>
        <div className="flex flex-col gap-1">
          <h4 className="text-md font-bold">{t('dashboard.quota.title')}</h4>

          <p>{lmnUser?.school}</p>
          <Separator className="my-1 bg-ciGrey" />
          <div color="white">
            <p>
              {quota && 'used' in quota ? quota.used : '--'} / {quota && 'used' in quota ? quota.hard_limit : '--'}{' '}
              {t('dashboard.quota.mibibyte')}
            </p>
          </div>

          <Separator className="my-1 bg-ciGrey" />
          <div color="white">
            <p className="font-bold">
              {t('dashboard.quota.globalQuota')}: {quota && 'used' in quota ? quota.soft_limit : '--'}{' '}
              {t('dashboard.quota.mibibyte')}
            </p>
            <p className="font-bold">
              {t('dashboard.quota.mailQuota')}: {lmnUser?.sophomorixMailQuotaCalculated[0] || '--'}{' '}
              {t('dashboard.quota.mibibyte')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Quota;
