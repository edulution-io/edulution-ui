import React from 'react';
import Separator from '@/components/ui/Separator';

const QuotaBody = () => (
  <>
    <p>sgm</p>
    <Separator className="my-1 bg-ciGrey" />
    <div color="white">
      <p>0.1 MiB / 2506 MiB</p>
      <p>linuxmuster-global</p>
    </div>
    <Separator className="my-1 bg-ciGrey" />
    <div color="white">
      <p>0 MiB / 2006 MiB</p>
      <p className="font-bold">Cloudquota berechnet in MB: 2506 MB</p>
      <p className="font-bold">Mailquota berechnet in MB: 5120 MB</p>
    </div>
  </>
);

export default QuotaBody;
