import { Sheet, SheetContent, SheetHeader } from '@/components/ui/Sheet';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import React, { FC, useEffect, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import axios from 'axios';
import QRCodeDisplay from '@/components/feature/Home/QRCodeDisplay';

interface MobileAccessIntroductionProps {
  isMobileAccessIntroductionOpen: boolean;
  setIsMobileAccessIntroductionOpen: (open: boolean) => void;
}

interface QrCodeValues {
  displayName: string;
  url: string;
  username: string;
  password: string;
  token: string;
}

const MobileAccessIntroduction: FC<MobileAccessIntroductionProps> = ({
  isMobileAccessIntroductionOpen,
  setIsMobileAccessIntroductionOpen,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [qrCodeValue, setQrCodeValue] = useState<string>('');

  const getQrCodeValue = async (): Promise<string> => {
    const response = await axios.get<QrCodeValues>('http://localhost:3000/edu-api/filemanager/qrcode');
    const { displayName, url, username } = response.data;
    const structuredData = {
      displayName,
      url,
      username,
      password: '',
      token: '',
    };
    const parsedObject = JSON.parse(JSON.stringify(structuredData)) as string;
    console.log(parsedObject);
    return parsedObject;
  };

  const handleOpenChange = (open: boolean) => {
    setIsMobileAccessIntroductionOpen(open);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await getQrCodeValue();
        setQrCodeValue(resp);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData().catch(console.error);
  }, []);

  const mobileContent = (
    <Sheet
      open={isMobileAccessIntroductionOpen}
      onOpenChange={handleOpenChange}
    >
      <SheetContent
        side="bottom"
        className="flex flex-col"
      >
        <SheetHeader>
          <p>Hallo</p>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
  const desktopContent = (
    <div>
      <p className="text-black">Mobiler Datenzugriff</p>
      <div className="flex justify-center">
        <QRCodeDisplay value={JSON.stringify(qrCodeValue)} />
      </div>
    </div>
  );

  return isMobile ? (
    mobileContent
  ) : (
    <Dialog
      open={isMobileAccessIntroductionOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent>{desktopContent}</DialogContent>
    </Dialog>
  );
};

export default MobileAccessIntroduction;
