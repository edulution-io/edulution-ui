import React from 'react';
import { CardContent, Card } from '@/components/shared/Card';
import Separator from '@/components/ui/separator';

const Quota = () => (
  <Card variant="security">
    <CardContent>
      <div className="flex flex-col gap-1">
        <h4 className="text-md font-bold">QUOTAS</h4>

        <p>sgm</p>
        <Separator className="bg-ciLightGrey my-1" />
        <div color="white">
          <p>0.1 MiB / 2506 MiB</p>
          <p>linuxmuster-global</p>
        </div>
        <Separator className="bg-ciLightGrey my-1" />
        <div color="white">
          <p>0 MiB / 2006 MiB</p>
          <p className="font-bold">Cloudquota berechnet in MB: 2506 MB</p>
          <p className="font-bold">Mailquota berechnet in MB: 5120 MB</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Quota;
