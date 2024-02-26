import React from 'react';
import { CardContent, Card } from '@/components/shared/Card';

const Groups = () => (
  <Card
    variant="primary"
    className="h-full"
  >
    <CardContent>
      <div className="flex flex-col gap-1">
        <p className="text-md font-bold text-white">GRUPPEN</p>

        <p>Lehrer</p>
        <p>1b</p>
        <p>3b</p>
      </div>
    </CardContent>
  </Card>
);

export default Groups;
