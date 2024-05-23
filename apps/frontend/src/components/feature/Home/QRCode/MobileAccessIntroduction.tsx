import { Sheet, SheetContent, SheetHeader } from '@/components/ui/Sheet';
import { DialogSH, DialogContentSH } from '@/components/ui/DialogSH';
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
      <div className="text-black">
        <p>{t('filesharingMobile.scanQRCode')}</p>
      </div>
      <div className="flex justify-center">
        <QRCodeDisplay value={qrCodeContent} />
      </div>
    </div>
  );

  return isMobile ? (
    mobileContent
  ) : (
    <DialogSH
      open={isMobileAccessIntroductionOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContentSH>{desktopContent}</DialogContentSH>
    </DialogSH>
  );
};

export default MobileAccessIntroduction;
