import { Sheet, SheetContent, SheetHeader } from '@/components/ui/Sheet';
import { DialogSH, DialogContentSH } from '@/components/ui/DialogSH';
import React, { FC, useEffect, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import QRCodeDisplay from '@/components/feature/Home/QRCode/QRCodeDisplay';
import { t } from 'i18next';
import useUserStore from '@/store/userStore';

interface MobileAccessIntroductionProps {
  isMobileAccessIntroductionOpen: boolean;
  setIsMobileAccessIntroductionOpen: (open: boolean) => void;
}

const MobileAccessIntroduction: FC<MobileAccessIntroductionProps> = ({
  isMobileAccessIntroductionOpen,
  setIsMobileAccessIntroductionOpen,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user } = useUserStore();
  const [qrCodeContent, setQrCodeContent] = useState<string>();

  useEffect(() => {
    if (isMobileAccessIntroductionOpen) {
      const qrData = {
        displayName: 'edulution UI',
        url: `${window.location.origin}/webdav`,
        username: user,
        password: '',
        token: '',
      };
      const qrContent = JSON.stringify(qrData);
      setQrCodeContent(qrContent);
    }
  }, [isMobileAccessIntroductionOpen]);

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
          <h3>{t('filesharingMobile.scanQRCode')}</h3>
          <div className="flex justify-center">{qrCodeContent && <QRCodeDisplay value={qrCodeContent} />}</div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );

  const desktopContent = (
    <div className="flex-col">
      <h3 className="flex justify-center text-black">{t('filesharingMobile.scanQRCode')}</h3>
      <div className="justify-center">{qrCodeContent && <QRCodeDisplay value={qrCodeContent} />}</div>
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
