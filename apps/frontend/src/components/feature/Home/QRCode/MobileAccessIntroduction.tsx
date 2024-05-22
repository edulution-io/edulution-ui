import { Sheet, SheetContent, SheetHeader } from '@/components/ui/Sheet';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import React, { FC, useEffect, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import useFileManagerStore from '@/store/fileManagerStore';
import QRCodeDisplay from '@/components/feature/Home/QRCode/QRCodeDisplay.tsx';
import { t } from 'i18next';

interface MobileAccessIntroductionProps {
  isMobileAccessIntroductionOpen: boolean;
  setIsMobileAccessIntroductionOpen: (open: boolean) => void;
}

const MobileAccessIntroduction: FC<MobileAccessIntroductionProps> = ({
  isMobileAccessIntroductionOpen,
  setIsMobileAccessIntroductionOpen,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { QRCode, fetchQRCode } = useFileManagerStore();
  const [qrCodeContent, setQrCodeContent] = useState<string>('');

  useEffect(() => {
    const getQrCode = async () => {
      await fetchQRCode().catch(console.error);
    };

    getQrCode().catch(console.error);
  }, []);

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
    console.log(qrContent);
    setQrCodeContent(qrContent);
  };

  useEffect(() => {
    generateQRCodeContent();
  }, [QRCode]);

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
          <p>{t('filesharingMobile.scanQRCode')}</p>
          <div className="flex justify-center">
            <QRCodeDisplay value={qrCodeContent} />
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );

  const desktopContent = (
    <div>
      <p className="text-black">
        <p>{t('filesharingMobile.scanQRCode')}</p>
      </p>
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
