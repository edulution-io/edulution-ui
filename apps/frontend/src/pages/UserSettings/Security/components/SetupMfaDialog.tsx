import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import useUserStore from '@/store/UserStore/UserStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Button } from '@/components/shared/Button';
import OtpInput from '@/components/shared/OtpInput';
import CircleLoader from '@/components/ui/CircleLoader';

type SetupMfaDialogProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const SetupMfaDialog: React.FC<SetupMfaDialogProps> = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  const { qrCode, qrCodeIsLoading, getQrCode, setupTotp } = useUserStore();
  const [totp, setTotp] = useState('');

  useEffect(() => {
    if (isOpen) {
      void getQrCode();
    }
  }, [isOpen]);

  const getTotpSecret = () => {
    const urlObject = new URL(qrCode.replace('otpauth://', 'https://'));
    const secret = urlObject.searchParams.get('secret') || '';
    return secret;
  };

  const handleSetMfaEnabled = async () => {
    try {
      await setupTotp(totp, getTotpSecret());
    } catch (error) {
      console.error(error);
    } finally {
      setIsOpen(false);
    }
  };

  const getDialogBody = () => (
    <>
      <div className="flex justify-center">
        {qrCodeIsLoading ? (
          <div className="flex h-[200px] w-[200px] items-center justify-center">
            <CircleLoader />
          </div>
        ) : (
          <QRCodeSVG
            value={qrCode}
            size={200}
          />
        )}
      </div>
      <OtpInput
        totp={totp}
        setTotp={setTotp}
      />
    </>
  );

  const getDialogFooter = () => (
    <div className="my-4 flex justify-center">
      <Button
        variant="btn-collaboration"
        size="lg"
        onClick={handleSetMfaEnabled}
      >
        {t('common.save')}
      </Button>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={() => setIsOpen(!isOpen)}
      title={t('usersettings.addTotp.title')}
      body={getDialogBody()}
      footer={getDialogFooter()}
    />
  );
};

export default SetupMfaDialog;
