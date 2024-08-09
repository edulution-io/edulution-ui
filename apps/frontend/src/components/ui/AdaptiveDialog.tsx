/* eslint-disable react/require-default-props */
import React, { FC } from 'react';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import useIsMobileView from '@/hooks/useIsMobileView';

interface AdaptiveDialogProps {
  isOpen: boolean;
  handleOpenChange: () => void;
  title: string;
  trigger?: React.ReactNode;
  body: React.ReactNode;
  footer?: React.ReactNode;
  mobileContentClassName?: string;
  desktopContentClassName?: string;
  showCloseButton?: boolean;
}

const AdaptiveDialog: FC<AdaptiveDialogProps> = ({
  isOpen,
  handleOpenChange,
  title,
  trigger,
  body,
  footer,
  mobileContentClassName,
  desktopContentClassName,
  showCloseButton = true,
}) => {
  const isMobileView = useIsMobileView();

  return isMobileView ? (
    <Sheet
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        className={mobileContentClassName}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        {body}
        <SheetFooter>{footer}</SheetFooter>
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={desktopContentClassName}
        showCloseButton={showCloseButton}
      >
        <DialogTitle>{title}</DialogTitle>
        {body}
        <DialogFooter>{footer}</DialogFooter>
        <DialogDescription aria-disabled />
      </DialogContent>
    </Dialog>
  );
};

export default AdaptiveDialog;
