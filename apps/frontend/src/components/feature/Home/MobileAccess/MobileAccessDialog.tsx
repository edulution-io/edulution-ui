import React, { useMemo, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { t } from 'i18next';
import QRCodeDisplay from '@/components/ui/QRCodeDisplay';
import useUserStore from '@/store/UserStore/UserStore';
import { MdArrowBackIosNew, MdArrowForwardIos, MdOutlineFileDownload } from 'react-icons/md';
import { Button } from '@/components/shared/Button';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { NavLink } from 'react-router-dom';
import { IconContext } from 'react-icons';

type MobileAccessDialogProps = {
  isMobileAccessIntroductionOpen: boolean;
  setIsMobileAccessIntroductionOpen: (open: boolean) => void;
};

const MobileAccessDialog: React.FC<MobileAccessDialogProps> = ({
  isMobileAccessIntroductionOpen,
  setIsMobileAccessIntroductionOpen,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user } = useUserStore();
  const [isStepOne, setIsStepOne] = useState(true);

  const urlAppStore = 'https://apps.apple.com/de/app/edulution-io/id6478116528';

  const qrCodeLoginData = {
    displayName: `${window.document.title}`,
    url: `${window.location.origin}/webdav`,
    username: user,
    password: '',
    token: '',
  };
  const qrCodeLogin = JSON.stringify(qrCodeLoginData);

  const getDialogBody = () => (
    <>
      <p className="flex justify-center text-black">
        {t(isStepOne ? 'dashboard.mobileAccess.scanAppStoreLink' : 'dashboard.mobileAccess.scanAccessInfo')}
      </p>
      <div className="mt-4 justify-center">
        <QRCodeDisplay value={isStepOne ? urlAppStore : qrCodeLogin} />
      </div>

      <Button
        type="button"
        variant="btn-outline"
        onClick={() => setIsStepOne(!isStepOne)}
        className={`absolute top-1/2 text-black ${isStepOne ? 'right-0  mr-4' : 'left-0 ml-4'}`}
      >
        {isStepOne ? <MdArrowForwardIos /> : <MdArrowBackIosNew />}
      </Button>
    </>
  );

  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8 m-5' }), []);

  const getSheetBody = () => (
    <NavLink
      to={urlAppStore}
      className="flex flex-col items-center"
    >
      <p className="my-4 text-black">{t('dashboard.mobileAccess.scanAppStoreLink')}</p>
      <Button
        variant="btn-outline"
        className="flex items-center justify-center"
      >
        <IconContext.Provider value={iconContextValue}>
          <MdOutlineFileDownload className="text-black" />
        </IconContext.Provider>
      </Button>
    </NavLink>
  );

  return (
    <AdaptiveDialog
      isOpen={isMobileAccessIntroductionOpen}
      handleOpenChange={() => setIsMobileAccessIntroductionOpen(!isMobileAccessIntroductionOpen)}
      title={t('dashboard.mobileAccess.title')}
      body={isMobile ? getSheetBody() : getDialogBody()}
    />
  );
};

export default MobileAccessDialog;
