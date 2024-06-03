import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import {
  DialogContentSH,
  DialogFooterSH,
  DialogHeaderSH,
  DialogSH,
  DialogTitleSH,
  DialogTriggerSH,
} from '@/components/ui/DialogSH.tsx';
import { Button } from '@/components/shared/Button';
import { useMediaQuery } from 'usehooks-ts';
import { useTranslation } from 'react-i18next';

interface GeneralDeleteDialogProps {
  trigger?: ReactNode;
  isOpen?: boolean;
  content: ReactNode;
  title: string;
  onConfirm: () => Promise<void>;
  onOpenChange?: (isOpen: boolean) => void;
}

const GeneralDeleteDialog: FC<GeneralDeleteDialogProps> = ({
  trigger,
  title,
  content,
  onConfirm,
  onOpenChange,
  isOpen: externalIsOpen,
}) => {
  const [isOpen, setIsOpen] = useState(externalIsOpen || false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { t } = useTranslation();

  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  const handleConfirm = async () => {
    await onConfirm();
    setIsOpen(false);
  };
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  const mobileContent = (
    <Sheet
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div>{content}</div>
        <div className="flex flex-row justify-end space-x-4 pt-3 text-black">
          <Button
            variant="btn-attention"
            onClick={handleConfirm}
          >
            {t('deleteDialog.continue')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );

  const desktopContent = (
    <DialogSH
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTriggerSH asChild>{trigger}</DialogTriggerSH>
      <DialogContentSH className="text-black">
        <DialogHeaderSH>
          <DialogTitleSH>{title}</DialogTitleSH>
        </DialogHeaderSH>
        {content}
        <DialogFooterSH>
          <Button
            variant="btn-attention"
            onClick={handleConfirm}
          >
            {t('deleteDialog.continue')}
          </Button>
        </DialogFooterSH>
      </DialogContentSH>
    </DialogSH>
  );

  return isMobile ? mobileContent : desktopContent;
};

export default GeneralDeleteDialog;
