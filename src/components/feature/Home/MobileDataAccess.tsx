import React from 'react';
import { Button } from '@/components/shared/Button';
import Cloud from '@/assets/icons/cloud-dark.svg';
import { CardContent, Card } from '@/components/shared/Card';

const MobileDataAccess = () => (
  <Card variant="infrastructure">
    <CardContent>
      <div className="flex flex-col gap-6">
        <h4 className="text-md font-bold">MOBILER DATENZUGRIFF</h4>
        <p>
          You can access the school server from many mobile devices. Select your ope- rating system to see how it works.
        </p>
        <Button
          variant="btn-info"
          className="flex w-fit justify-between gap-2"
        >
          <img
            src={Cloud}
            alt="Cloud"
            width="40px"
            height="40px"
          />
          Anleitung
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default MobileDataAccess;
