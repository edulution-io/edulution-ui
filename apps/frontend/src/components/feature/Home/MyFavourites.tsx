import React from 'react';
import { useTranslation } from 'react-i18next';
import { CardContent, Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import Printer from '@/assets/icons/edulution/Drucker.svg';
import RoomBooking from '@/assets/icons/edulution/Raumbuchung.svg';
import FileSharing from '@/assets/icons/edulution/Filesharing.svg';
import { FirewallIcon } from '@/assets/icons';

const MyFavourites = () => {
  const { t } = useTranslation();

  return (
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
            <p>{t('filesharing.sidebar')}</p>
            <img
              src={FileSharing}
              alt="Filesharing"
              className="w-[var(--icon-width-inside-of-a-button)]"
            />
          </Button>
          <Button variant="btn-organisation">
            <p>{t('roombooking.sidebar')}</p>
            <img
              src={RoomBooking}
              alt="Raumbuchung"
              className="w-[var(--icon-width-inside-of-a-button)]"
            />
          </Button>
          <Button variant="btn-infrastructure">
            <p>{t('printer.sidebar')}</p>
            <img
              src={Printer}
              alt="Drucker"
              className="w-[var(--icon-width-inside-of-a-button)]"
            />
          </Button>
          <Button variant="btn-security">
            <p>{t('firewall.sidebar')}</p>
            <img
              src={FirewallIcon}
              alt="Firewall"
              className="w-[var(--icon-width-inside-of-a-button)]"
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyFavourites;
