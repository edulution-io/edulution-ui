import React, { FC } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/Sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import useIsMobileView from '@/hooks/useIsMobileView';
import useElementHeight from '@/hooks/useElementHeight';
import { LAYOUT_OPTIONS, LayoutOption } from '@libs/ui/constants/layout';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface AdaptiveDialogProps {
  isOpen: boolean;
  handleOpenChange: () => void;
  title: string;
  trigger?: React.ReactNode;
  body: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  layout?: LayoutOption;
  mobileContentClassName?: string;
  desktopContentClassName?: string;
  additionalScrollContainerOffset?: number;
}

const AdaptiveDialog: FC<AdaptiveDialogProps> = ({
  isOpen,
  handleOpenChange,
  title,
  trigger,
  body,
  footer,
  variant = 'primary',
  layout = LAYOUT_OPTIONS.ONE_COLUMN,
  mobileContentClassName,
  desktopContentClassName,
  additionalScrollContainerOffset = 0,
}) => {
  const isMobileView = useIsMobileView();

  const headerId = 'dialog-header';
  const footerId = 'dialog-footer';

  const pageBarsHeight = useElementHeight([headerId, footerId]) + additionalScrollContainerOffset;

  const bodyContent = <div style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}>{body}</div>;

  return isMobileView ? (
    <Sheet
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        variant={variant}
        className={mobileContentClassName}
      >
        <SheetHeader
          variant={variant}
          id={headerId}
        >
          <SheetTitle>{title}</SheetTitle>
          <VisuallyHidden>
            <SheetTitle>{title}</SheetTitle>
          </VisuallyHidden>
        </SheetHeader>
        {bodyContent}
        <SheetFooter id={footerId}>{footer}</SheetFooter>
        <SheetDescription aria-disabled />
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        variant={variant}
        className={desktopContentClassName}
      >
        <DialogTitle>{title}</DialogTitle>
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>
        {bodyContent}
        <DialogFooter
          layout={layout}
          id={footerId}
        >
          {footer}
        </DialogFooter>
        <DialogDescription aria-disabled />
      </DialogContent>
    </Dialog>
  );
};

export default AdaptiveDialog;
