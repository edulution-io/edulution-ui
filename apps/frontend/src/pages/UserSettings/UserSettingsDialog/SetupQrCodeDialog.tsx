import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/shared/Button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { DialogFooterSH, DialogHeaderSH } from '@/components/ui/DialogSH';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { useOnClickOutside } from 'usehooks-ts';
import { QRCodeSVG } from 'qrcode.react';
import OtpInput from '@/pages/LoginPage/OtpInput';
import useUserStore from '@/store/userStore';

const SetupQrCodeDialog: React.FC<{
  isOpen: boolean;
  user: string;
  setSearchParams: (setParams: URLSearchParams | ((prevParams: URLSearchParams) => URLSearchParams)) => void;
  handleSetMfaEnabled: (otp: string) => void;
}> = ({ isOpen, user, setSearchParams, handleSetMfaEnabled }) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const { getQrCode } = useUserStore();
  const [qrcode, setQrcode] = useState('');
  const [totp, setTotp] = useState<string>('');

  useOnClickOutside(dialogRef, () => {
    if (isOpen) {
      setSearchParams(new URLSearchParams(''));
    }
  });

  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen, user, getQrCode]);

  return (
    <Dialog
      modal
      open={isOpen}
    >
      <DialogContent
        ref={dialogRef}
        className="data-[state=open]:animate-contentShow fixed left-[50%] top-[40%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] text-black shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none"
      >
        <DialogHeaderSH>
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
        </DialogHeaderSH>
        <div className="my-4 flex justify-center">
          <QRCodeSVG value={qrcode} />
        </div>
        <div className="my-5">
          <OtpInput
            length={6}
            onComplete={(otp) => {
              handleSetMfaEnabled(otp);
              setTotp(otp);
            }}
          />
        </div>
        <DialogFooterSH className="justify-center pt-4 text-white">
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
        </DialogFooterSH>
      </DialogContent>
    </Dialog>
  );
};

export default SetupQrCodeDialog;
