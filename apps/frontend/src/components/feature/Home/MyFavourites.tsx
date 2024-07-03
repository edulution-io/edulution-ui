import React from 'react';
import { CardContent, Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import WidgetLabelWithImageForTriggers from '@/components/feature/components/widgetLabelWithImageForTriggers';
import Printer from '@/assets/icons/edulution/Drucker.svg';
import RoomBooking from '@/assets/icons/edulution/Raumbuchung.svg';
import FileSharing from '@/assets/icons/edulution/Filesharing.svg';
import { FirewallIcon } from '@/assets/icons';

const MyFavourites = () => (
  <Card
    variant="collaboration"
    className="min-h-[100%]"
  >
    <CardContent>
      <h4
        color="white"
        className="font-bold"
      >
        MEINE FAVORITEN
      </h4>
      <div className="mt-4 flex flex-col justify-between gap-6">
        <Button variant="btn-collaboration">
          <WidgetLabelWithImageForTriggers
            src={FileSharing}
            alt="Filesharing"
            translationIdLabel="filesharing.sidebar"
          />
        </Button>
        <Button variant="btn-organisation">
          <WidgetLabelWithImageForTriggers
            src={RoomBooking}
            alt="Raumbuchung"
            translationIdLabel="roombooking.sidebar"
          />
        </Button>
        <Button variant="btn-infrastructure">
          <WidgetLabelWithImageForTriggers
            src={Printer}
            alt="Drucker"
            translationIdLabel="printer.sidebar"
          />
        </Button>
        <Button variant="btn-security">
          <WidgetLabelWithImageForTriggers
            src={FirewallIcon}
            alt="Firewall"
            translationIdLabel="firewall.sidebar"
          />
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default MyFavourites;
