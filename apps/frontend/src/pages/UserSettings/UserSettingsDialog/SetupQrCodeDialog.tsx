import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/shared/Button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { DialogFooter, DialogHeader } from '@/components/ui/Dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { useOnClickOutside } from 'usehooks-ts';
import { QRCodeSVG } from 'qrcode.react';
import OtpInput from '@/pages/LoginPage/OtpInput';
import useUserStore from '@/store/userStore';
import { UserInfo } from '@/datatypes/types';

const SetupQrCodeDialog: React.FC<{
  isOpen: boolean;
  user: string;
  setSearchParams: (setParams: URLSearchParams | ((prevParams: URLSearchParams) => URLSearchParams)) => void;
}> = ({ isOpen, user, setSearchParams }) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const { postSetupTotp, getQrCode, updateUserInfo } = useUserStore();
  const [qrcode, setQrcode] = useState('');
  const [totp, setTotp] = useState<string>('');

  useOnClickOutside(dialogRef, () => setSearchParams(new URLSearchParams('')));

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        const qrCodeQuery = (await getQrCode(user)) ?? '';
        setQrcode(qrCodeQuery);
      } catch (error) {
        console.error(error);
      }
    };
    // eslint-disable-next-line no-void
    void fetchQrCode();
  }, [isOpen]);

  const handleSetMfaEnabled = async (otp: string) => {
    try {
      const totpValid = await postSetupTotp(otp);

      if (!totpValid) return;
      await updateUserInfo(user, { mfaEnabled: true } as UserInfo)
        .then(() => setSearchParams(new URLSearchParams('')))
        .catch((error) => console.error(error));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog
      modal
      open={isOpen}
    >
      <DialogContent
        ref={dialogRef}
        className="data-[state=open]:animate-contentShow fixed left-[50%] top-[40%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] text-black shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none"
      >
        <DialogHeader>
          <DialogTitle>{t('usersettings.addTotp.title')}</DialogTitle>
          <DialogDescription>{t('usersettings.addTotp.description')}</DialogDescription>
          <DialogClose asChild>
            <button
              type="button"
              className="absolute right-5 top-5 text-black"
              onClick={() => setSearchParams(new URLSearchParams(''))}
            >
              <Cross2Icon />
            </button>
          </DialogClose>
        </DialogHeader>
        <div className="my-4 flex justify-center">
          <QRCodeSVG value={qrcode} />
        </div>
        <div className="my-5">
          <OtpInput
            length={6}
            onComplete={(otp) => {
              handleSetMfaEnabled(otp).catch((e) => console.error(e));
              setTotp(otp);
            }}
          />
        </div>
        <DialogFooter className="justify-center pt-4 text-white">
          <DialogClose asChild>
            <Button
              type="button"
              variant="btn-collaboration"
              size="lg"
              onClick={() => handleSetMfaEnabled(totp)}
            >
              {t('common.save')}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SetupQrCodeDialog;
