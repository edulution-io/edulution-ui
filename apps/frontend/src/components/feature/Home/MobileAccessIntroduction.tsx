import { Sheet, SheetContent, SheetHeader } from '@/components/ui/Sheet';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import React, { FC, useEffect, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import QRCodeDisplay from '@/components/feature/Home/QRCodeDisplay';
import useFileManagerActions from '@/api/axios/filemanager/useFileManagerActions.ts';
import useFileManagerStore from '@/store/fileManagerStore.ts';

interface MobileAccessIntroductionProps {
  isMobileAccessIntroductionOpen: boolean;
  setIsMobileAccessIntroductionOpen: (open: boolean) => void;
}

const MobileAccessIntroduction: FC<MobileAccessIntroductionProps> = ({
  isMobileAccessIntroductionOpen,
  setIsMobileAccessIntroductionOpen,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { fetchQrCode } = useFileManagerActions();
  const { QRCode } = useFileManagerStore();
  const [qrCodeContent, setQrCodeContent] = useState<string>('');

  useEffect(() => {
    const getQrCode = async () => {
      await fetchQrCode().catch(console.error);
    };

    getQrCode().catch(console.error);
  }, []);

  useEffect(() => {
    generateQRCodeContent();
  }, [QRCode]);

  const generateQRCodeContent = () => {
    const { displayName, url, username } = QRCode;
    const structuredData = {
      displayName,
      url,
      username,
      password: '',
      token: '',
    };
    const qrContent = JSON.stringify(structuredData);
    setQrCodeContent(qrContent);
  };

  const handleOpenChange = (open: boolean) => {
    setIsMobileAccessIntroductionOpen(open);
  };

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
        <QRCodeDisplay value={qrCodeContent} />
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
