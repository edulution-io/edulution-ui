import React from 'react';
import QuotaBody from '@/pages/UserSettings/Details/QuotaBody';
import { CardContent, Card } from '@/components/shared/Card';

const Quota = () => (
  <Card variant="security">
    <CardContent>
      <div className="flex flex-col gap-1">
        <h4 className="text-md font-bold">QUOTAS</h4>
        <QuotaBody />
      </div>
    </CardContent>
  </Card>
);

export default Quota;
