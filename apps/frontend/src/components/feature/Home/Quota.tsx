import React from 'react';
import { Card, CardContent } from '@/components/shared/Card';
import Separator from '@/components/ui/Separator';
import ProgressSH from '@/components/ui/ProgessSH.tsx';
import useUserStore from '@/store/userStore.ts';

const Quota = () => {
  const { userInfo } = useUserStore();
  return (
    <Card variant="security">
      <CardContent>
        <div className="flex flex-col gap-1">
          <h4 className="text-md font-bold">QUOTAS</h4>

          <p>sgm</p>
          <Separator className="my-1 bg-ciLightGrey" />
          <div color="white">
            <p>0.1 MiB / 2506 MiB</p>
            <p>{userInfo.ldapGroups.school}</p>
            <div className="mb-2 h-0.5 w-full rounded-full bg-gray-200">
              <ProgressSH
                value={78}
                className="h-0.5"
              />
            </div>
          </div>
          <div color="white">
            <p>0 MiB / 2006 MiB</p>
            <div className="mb-2 h-0.5 w-full rounded-full bg-gray-200">
              <ProgressSH
                value={26}
                className="h-0.5"
              />
            </div>
            <p className="font-bold">Cloudquota berechnet in MB: 2506 MB</p>
            <p className="font-bold">Mailquota berechnet in MB: 5120 MB</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Quota;
