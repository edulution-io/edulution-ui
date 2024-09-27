import React from 'react';
import Quota from '@/pages/UserSettings/Details/Quota';
import { CardContent, Card } from '@/components/shared/Card';

const QuotaCard = () => (
  <Card variant="security">
    <CardContent>
      <div className="flex flex-col gap-1">
        <h4 className="text-md font-bold">QUOTAS</h4>
        <Quota />
      </div>
    </CardContent>
  </Card>
);

export default QuotaCard;
