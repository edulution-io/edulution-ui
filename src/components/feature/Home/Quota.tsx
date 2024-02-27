import React from 'react';
import { CardContent, Card } from '@/components/shared/Card';
import Separator from '@/components/ui/separator';

const Quota = () => (
  <Card variant="info">
    <CardContent>
      <div className="flex flex-col gap-1">
        <p className="text-md font-bold text-white">QUOTAS</p>

        <p>sgm</p>
        <Separator className="my-1 bg-[#9E9E9D]" />
        <div color="white">
          <p>0.1 MiB / 2506 MiB</p>
          <p>linuxmuster-global</p>
        </div>
        <Separator className="my-1 bg-[#9E9E9D]" />
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
