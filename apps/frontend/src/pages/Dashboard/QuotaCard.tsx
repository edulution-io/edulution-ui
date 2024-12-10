import React from 'react';
import { useTranslation } from 'react-i18next';
import Quota from '@/pages/Dashboard/Quota';
import { CardContent, Card } from '@/components/shared/Card';

const QuotaCard = () => {
  const { t } = useTranslation();

  return (
    <Card variant="security">
      <CardContent>
        <div className="flex flex-col gap-2">
          <h4 className="text-md mb-4 font-bold">{t('dashboard.quota.title')}</h4>
          <Quota />
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotaCard;
