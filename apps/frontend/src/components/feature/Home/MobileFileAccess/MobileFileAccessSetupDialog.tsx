import React, { useMemo, useState } from 'react';
import { t } from 'i18next';
import QRCodeDisplay from '@/components/ui/QRCodeDisplay';
import useUserStore from '@/store/UserStore/UserStore';
import { MdArrowBackIosNew, MdArrowForwardIos, MdOutlineFileDownload } from 'react-icons/md';
import { Button } from '@/components/shared/Button';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { NavLink } from 'react-router-dom';
import { IconContext } from 'react-icons';
import useIsMobileView from '@/hooks/useIsMobileView';
import { Card } from '@/components/shared/Card';

type MobileFileAccessSetupDialogProps = {
  isOpen: boolean;
  setIsOpen: (isMobileAccessOpen: boolean) => void;
};

const MobileFileAccessSetupDialog: React.FC<MobileFileAccessSetupDialogProps> = ({ isOpen, setIsOpen }) => {
  const isMobileView = useIsMobileView();
  const { username } = useUserStore();
  const [isStepOne, setIsStepOne] = useState(true);

  const urlAppStore = 'https://apps.apple.com/de/app/edulution-io/id6478116528';

  const qrCodeLoginData = {
    displayName: `${window.document.title}`,
    url: `${window.location.origin}/webdav`,
    username,
    password: '',
    token: '',
  };
  const qrCodeLogin = JSON.stringify(qrCodeLoginData);

  const loginDataTable = () => (
    <div className="mt-4">
      {t('form.url')}:
      <Card
        variant="text"
        className=""
      >
        <pre className="m-2  text-foreground">{urlAppStore}</pre>
      </Card>
      {t('common.username')}:
      <Card
        variant="text"
        className=""
      >
        <pre className="m-2 text-foreground">{username}</pre>
      </Card>
    </div>
  );

  const getDialogBody = () => (
    <div className="text-foreground">
      <p className="flex justify-center">
        {t(isStepOne ? 'dashboard.mobileAccess.scanAppStoreLink' : 'dashboard.mobileAccess.scanAccessInfo')}
      </p>
      <div className="mt-4 justify-center">
        <QRCodeDisplay value={isStepOne ? urlAppStore : qrCodeLogin} />
      </div>

      <Button
        type="button"
        variant="btn-outline"
        onClick={() => setIsStepOne(!isStepOne)}
        className={`absolute top-1/2 ${isStepOne ? 'right-0  mr-4' : 'left-0 ml-4'}`}
      >
        {isStepOne ? <MdArrowForwardIos /> : <MdArrowBackIosNew />}
      </Button>

      <p className="mt-4">
        {t(isStepOne ? 'dashboard.mobileAccess.nextStepPreview' : 'dashboard.mobileAccess.copyCredentials')}
      </p>
      {isStepOne ? null : loginDataTable()}
    </div>
  );

  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8 m-5' }), []);

  const getSheetBody = () => (
    <div className="text-foreground">
      <p className="my-4">{t('dashboard.mobileAccess.scanAppStoreLink')}</p>
      <NavLink
        to={urlAppStore}
        className="flex flex-col items-center"
      >
        <Button
          variant="btn-outline"
          className="flex items-center justify-center"
        >
          <IconContext.Provider value={iconContextValue}>
            <MdOutlineFileDownload className="text-foreground" />
          </IconContext.Provider>
        </Button>
      </NavLink>
      <p className="mt-4">{t('dashboard.mobileAccess.accessData')}:</p>
      {loginDataTable()}
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={() => setIsOpen(!isOpen)}
      title={t('dashboard.mobileAccess.title')}
      body={isMobileView ? getSheetBody() : getDialogBody()}
    />
  );
};

export default MobileFileAccessSetupDialog;
