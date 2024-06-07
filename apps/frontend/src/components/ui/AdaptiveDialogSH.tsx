/* eslint-disable react/require-default-props */
import React, { FC } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import { DialogContentSH, DialogFooterSH, DialogSH, DialogTitleSH, DialogTriggerSH } from '@/components/ui/DialogSH';

interface AdaptiveDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  handleOpenChange: (open: boolean) => void;
  title: string;
  trigger?: React.ReactNode;
  body: React.ReactNode;
  footer?: React.ReactNode;
}

const AdaptiveDialogSH: FC<AdaptiveDialogProps> = ({
  isOpen,
  onClose,
  handleOpenChange,
  title,
  trigger,
  body,
  footer,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleChange = (open: boolean) => {
    handleOpenChange(open);
    if (!open) {
      if (onClose) {
        onClose();
      }
    }
  };

  return isMobile ? (
    <Sheet
      open={isOpen}
      onOpenChange={handleChange}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        {body}
        <SheetFooter>{footer}</SheetFooter>
      </SheetContent>
    </Sheet>
  ) : (
    <DialogSH
      open={isOpen}
      onOpenChange={handleChange}
    >
      <DialogTriggerSH asChild>{trigger}</DialogTriggerSH>
      <DialogContentSH>
        <DialogTitleSH>{title}</DialogTitleSH>
        {body}
        <DialogFooterSH>{footer}</DialogFooterSH>
      </DialogContentSH>
    </DialogSH>
  );
};

export default AdaptiveDialogSH;
