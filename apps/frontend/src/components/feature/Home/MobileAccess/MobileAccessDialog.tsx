import React from 'react';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/Sheet';
import { useMediaQuery } from 'usehooks-ts';
import { t } from 'i18next';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import QRCodeDisplay from '@/components/ui/QRCodeDisplay';
import useUserStore from '@/store/UserStore/UserStore';

interface MobileAccessIntroductionProps {
  isMobileAccessIntroductionOpen: boolean;
  setIsMobileAccessIntroductionOpen: (open: boolean) => void;
}

const MobileAccessIntroduction: React.FC<MobileAccessIntroductionProps> = ({
  isMobileAccessIntroductionOpen,
  setIsMobileAccessIntroductionOpen,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user } = useUserStore();

  const qrData = {
    displayName: `${window.document.title}`,
    url: `${window.location.origin}/webdav`,
    username: user,
    password: '',
    token: '',
  };
  const qrContent = JSON.stringify(qrData);

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
          <h4>{t('dashboard.mobileAccess.scanAccessInfo')}</h4>
          <div className="flex justify-center">
            <QRCodeDisplay value={qrContent} />
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );

  const desktopContent = (
    <div className="flex-col">
      <h4 className="flex justify-center text-black">{t('dashboard.mobileAccess.scanAccessInfo')}</h4>
      <div className="justify-center">
        <QRCodeDisplay value={qrContent} />
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
