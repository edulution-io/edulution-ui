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
import { EDU_APP_APPSTORE_URL } from '@libs/common/constants';

type MobileFileAccessSetupDialogProps = {
  isOpen: boolean;
  setIsOpen: (isMobileAccessOpen: boolean) => void;
};

const MobileFileAccessSetupDialog: React.FC<MobileFileAccessSetupDialogProps> = ({ isOpen, setIsOpen }) => {
  const isMobileView = useIsMobileView();
  const { user } = useUserStore();
  const [isStepOne, setIsStepOne] = useState(true);

  const webdavAccessDetails = {
    displayName: `${window.document.title}`,
    url: `${window.location.origin}/webdav`,
    username: user?.username,
    password: '',
    token: '',
  };
  const webdavAccessJson = JSON.stringify(webdavAccessDetails);

  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8 m-5' }), []);

  const loginDataTable = () => (
    <>
      {isMobileView ? null : <p className="mt-4">{t('dashboard.mobileAccess.copyCredentials')}</p>}
      <div className="mt-4 overflow-auto">
        {t('form.url')}:
        <Card variant="text">
          <pre className="m-2 text-background">{webdavAccessDetails.url}</pre>
        </Card>
        {t('common.username')}:
        <Card variant="text">
          <pre className="m-2 text-background">{user?.username}</pre>
        </Card>
      </div>
    </>
  );

  const navToAppStoreButton = () => (
    <div className="flex items-center justify-center">
      <Button
        variant="btn-outline"
        className="flex items-center justify-center"
      >
        <NavLink
          to={EDU_APP_APPSTORE_URL}
          target="_blank"
          className="flex flex-col items-center"
        >
          <IconContext.Provider value={iconContextValue}>
            <MdOutlineFileDownload className="text-background" />
          </IconContext.Provider>
        </NavLink>
      </Button>
    </div>
  );

  const getDialogBody = () => (
    <div className={`${isStepOne ? '' : 'min-w-[85%]'} text-background`}>
      <p className="flex justify-center">
        {t(isStepOne ? 'dashboard.mobileAccess.scanAppStoreLink' : 'dashboard.mobileAccess.scanAccessInfo')}
      </p>
      <div className="mt-4 justify-center">
        <QRCodeDisplay value={isStepOne ? EDU_APP_APPSTORE_URL : webdavAccessJson} />
      </div>
      <Button
        type="button"
        variant="btn-outline"
        onClick={() => setIsStepOne(!isStepOne)}
        className={`absolute top-1/2 text-background ${isStepOne ? 'right-0  mr-4' : 'left-0 ml-4'}`}
      >
        {isStepOne ? <MdArrowForwardIos /> : <MdArrowBackIosNew />}
      </Button>
      {isStepOne ? (
        <>
          <p className="my-4">{t('dashboard.mobileAccess.downloadDirect')}</p>
          {navToAppStoreButton()}
        </>
      ) : (
        loginDataTable()
      )}
      <p className="mt-4">{isStepOne && t('dashboard.mobileAccess.nextStepPreview')}</p>
    </div>
  );

  const getSheetBody = () => (
    <div className="text-background">
      <p className="my-4">{t('dashboard.mobileAccess.downloadApp')}</p>
      {navToAppStoreButton()}
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
