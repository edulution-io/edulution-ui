import React from 'react';
import { useTranslation } from 'react-i18next';
import QuotaBody from '@/pages/UserSettings/Details/QuotaBody';
import { CardContent, Card } from '@/components/shared/Card';

const Quota = () => {
  const { t } = useTranslation();

  return (
    <Card variant="security">
      <CardContent>
        <div className="flex flex-col gap-1">
          <h4 className="text-md font-bold">{t('dashboard.quota.title')}</h4>
          <QuotaBody />
        </div>
      </CardContent>
    </Card>
  );
};

export default Quota;
