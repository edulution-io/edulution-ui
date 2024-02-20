import { CardContent, Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import Printer from '@/assets/icons/edulution/Drucker.svg';
import RoomBooking from '@/assets/icons/edulution/Raumbuchung.svg';
import FileSharing from '@/assets/icons/edulution/Filesharing.svg';

export const MyFavourites = () => {
  return (
    <Card
      variant="primary"
      className="min-h-[100%]"
    >
      <CardContent>
        <p
          color="white"
          className="font-bold"
        >
          MEINE FAVORITEN
        </p>
        <div className="mt-4 flex flex-col justify-between gap-6">
          <Button
            variant="btn-primary"
            className="w-fit"
          >
            Filesharing
            <img
              src={FileSharing}
              alt="Filesharing"
              width="40px"
              height="40px"
            />
          </Button>
          <Button
            variant="btn-secondary"
            className="flex w-fit justify-between gap-2"
          >
            Raumbuchung
            <img
              src={RoomBooking}
              alt="Raumbuchung"
              width="40px"
              height="40px"
            />
          </Button>
          <Button
            variant="btn-info"
            className="w-fit"
          >
            Drucker
            <img
              src={Printer}
              alt="Drucker"
              width="40px"
              height="40px"
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
