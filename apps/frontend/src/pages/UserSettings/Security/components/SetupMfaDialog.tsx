import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import useUserStore from '@/store/UserStore/UserStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Button } from '@/components/shared/Button';
import OtpInput from '@/components/shared/OtpInput';

const SetupMfaDialog: React.FC<{
  isOpen: boolean;
  handleSetMfaEnabled: (otp: string) => void;
}> = ({ isOpen, handleSetMfaEnabled }) => {
  const { t } = useTranslation();
  const { user, qrCode, getQrCode } = useUserStore();
  const [totp, setTotp] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      void getQrCode(user.username);
    }
  }, [isOpen, user]);

  const getDialogBody = () => (
    <div className="flex flex-col items-center space-y-4">
      <div className="my-4 flex justify-center">
        <QRCodeSVG
          value={qrCode}
          size={200}
        />
      </div>
      <OtpInput
        totp={totp}
        setTotp={setTotp}
      />
    </div>
  );

  const getDialogFooter = () => (
    <div className="flex justify-center">
      <Button
        variant="btn-collaboration"
        size="lg"
        onClick={() => {
          handleSetMfaEnabled(totp);
        }}
      >
        {t('common.save')}
      </Button>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={() => {
        handleSetMfaEnabled(totp);
      }}
      title={t('usersettings.addTotp.title')}
      body={getDialogBody()}
      footer={getDialogFooter()}
    />
  );
};

export default SetupMfaDialog;
