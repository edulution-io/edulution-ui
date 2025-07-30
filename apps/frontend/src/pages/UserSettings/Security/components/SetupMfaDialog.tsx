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
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import useUserStore from '@/store/UserStore/useUserStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import OtpInput from '@/components/shared/OtpInput';
import QRCodeDisplay from '@/components/ui/QRCodeDisplay';
import useGlobalSettingsApiStore from '@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore';
import useLdapGroups from '@/hooks/useLdapGroups';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import LOGIN_ROUTE from '@libs/auth/constants/loginRoute';
import InputWithActionIcons from '@/components/shared/InputWithActionIcons';
import { MdFileCopy } from 'react-icons/md';
import copyToClipboard from '@/utils/copyToClipboard';

const SetupMfaDialog: React.FC = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { globalSettings } = useGlobalSettingsApiStore();
  const {
    qrCode,
    qrCodeIsLoading,
    totpIsLoading,
    isSetTotpDialogOpen,
    user,
    setIsSetTotpDialogOpen,
    getQrCode,
    setupTotp,
  } = useUserStore();
  const { ldapGroups } = useLdapGroups();
  const [totp, setTotp] = useState('');

  const isRightAfterLogin = pathname === LOGIN_ROUTE;

  useEffect(() => {
    const mfaGroups = globalSettings.auth?.mfaEnforcedGroups || [];
    const isMfaRequired = mfaGroups.some((g) => ldapGroups.includes(g.path));

    if (isMfaRequired && !user?.mfaEnabled && isRightAfterLogin) {
      setIsSetTotpDialogOpen(true);
    }
  }, [globalSettings.auth?.mfaEnforcedGroups, user?.mfaEnabled, isRightAfterLogin]);

  useEffect(() => {
    if (isSetTotpDialogOpen) {
      void getQrCode();
    }
  }, [isSetTotpDialogOpen]);

  const getTotpSecret = () => {
    if (!qrCode) return '';
    const urlObject = new URL(qrCode.replace('otpauth://', 'https://'));
    const secret = urlObject.searchParams.get('secret') || '';
    return secret;
  };

  const handleOpenChange = () => {
    setIsSetTotpDialogOpen(!isSetTotpDialogOpen);
    setTotp('');
  };

  const handleSetMfaEnabled = async () => {
    const setTotpSuccessful = await setupTotp(totp, getTotpSecret());

    if (setTotpSuccessful) {
      toast.success(t('usersettings.addTotp.mfaSetupSuccess'));
      handleOpenChange();
    }
  };

  const getDialogBody = () => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSetMfaEnabled();
      }}
      className="space-y-3"
    >
      {isRightAfterLogin && <p className="font-bold">{t('usersettings.addTotp.mfaSetupRequired')}</p>}
      <p>{t('usersettings.addTotp.qrCodeInstructions')}</p>
      <div className="flex justify-center">
        <QRCodeDisplay
          value={qrCode}
          size="lg"
          className="flex justify-center"
          isLoading={qrCodeIsLoading}
        />
      </div>
      <p>{t('usersettings.addTotp.copyTotpSecretInstructions')}</p>
      <InputWithActionIcons
        type="text"
        value={getTotpSecret()}
        readOnly
        className="cursor-pointer"
        variant="dialog"
        onMouseDown={(e) => {
          e.preventDefault();
          copyToClipboard(getTotpSecret());
        }}
        actionIcons={[
          {
            icon: MdFileCopy,
            onClick: () => copyToClipboard(getTotpSecret()),
          },
        ]}
      />
      <p>{t('usersettings.addTotp.totpCodeInstructions')}</p>
      <OtpInput
        totp={totp}
        variant="dialog"
        setTotp={setTotp}
        onComplete={handleSetMfaEnabled}
      />
    </form>
  );

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleOpenChange}
      handleSubmit={handleSetMfaEnabled}
      submitButtonText="common.save"
      submitButtonType="submit"
      disableSubmit={totpIsLoading}
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isSetTotpDialogOpen}
      handleOpenChange={handleOpenChange}
      title={t('usersettings.addTotp.title')}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default SetupMfaDialog;
