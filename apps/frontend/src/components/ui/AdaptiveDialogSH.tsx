/* eslint-disable react/require-default-props */
import React, { FC } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import { DialogSH, DialogContentSH, DialogFooterSH, DialogTitleSH, DialogTriggerSH } from '@/components/ui/DialogSH';

interface AdaptiveDialogProps {
  isOpen: boolean;
  handleOpenChange: () => void;
  title: string;
  trigger?: React.ReactNode;
  body: React.ReactNode;
  footer?: React.ReactNode;
}

const AdaptiveDialogSH: FC<AdaptiveDialogProps> = ({ isOpen, handleOpenChange, title, trigger, body, footer }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return isMobile ? (
    <Sheet
      open={isOpen}
      onOpenChange={handleOpenChange}
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
      onOpenChange={handleOpenChange}
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
