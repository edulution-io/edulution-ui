import React from 'react';
import { CardContent, Card } from '@/components/shared/Card';

const Groups = () => (
  <Card
    variant="organisation"
    className="h-full"
  >
    <CardContent>
      <div className="flex flex-col gap-1">
        <h4 className="text-md font-bold">GRUPPEN</h4>

        <p>Lehrer</p>
        <p>1b</p>
        <p>3b</p>
      </div>
    </CardContent>
  </Card>
);

export default Groups;
