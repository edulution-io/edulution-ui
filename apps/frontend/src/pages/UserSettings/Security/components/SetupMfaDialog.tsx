/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import useUserStore from '@/store/UserStore/UserStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Button } from '@/components/shared/Button';
import OtpInput from '@/components/shared/OtpInput';
import CircleLoader from '@/components/ui/Loading/CircleLoader';

type SetupMfaDialogProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const SetupMfaDialog: React.FC<SetupMfaDialogProps> = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  const { qrCode, qrCodeIsLoading, totpIsLoading, getQrCode, setupTotp } = useUserStore();
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

  const handleOpenChange = () => {
    setIsOpen(!isOpen);
    setTotp('');
  };

  const handleSetMfaEnabled = async () => {
    try {
      await setupTotp(totp, getTotpSecret());
    } catch (error) {
      console.error(error);
    } finally {
      handleOpenChange();
    }
  };

  const getDialogBody = () => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSetMfaEnabled();
      }}
    >
      <div className="mb-3">{t('usersettings.addTotp.qrCodeInstructions')}</div>
      <div className="flex justify-center rounded-xl bg-background p-2">
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
      <div className="mt-3">{t('usersettings.addTotp.totpCodeInstructions')}</div>
      <OtpInput
        totp={totp}
        setTotp={setTotp}
        onComplete={handleSetMfaEnabled}
      />
    </form>
  );

  const getDialogFooter = () => (
    <div className="mt-4 flex justify-center">
      <Button
        type="submit"
        variant="btn-collaboration"
        size="lg"
        onClick={handleSetMfaEnabled}
      >
        {totpIsLoading ? t('common.loading') : t('common.save')}
      </Button>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={handleOpenChange}
      title={t('usersettings.addTotp.title')}
      body={getDialogBody()}
      footer={getDialogFooter()}
    />
  );
};

export default SetupMfaDialog;
