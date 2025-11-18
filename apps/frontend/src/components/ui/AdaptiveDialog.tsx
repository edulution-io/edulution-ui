/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

/* eslint-disable react/require-default-props */
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
import useMedia from '@/hooks/useMedia';

interface AdaptiveDialogProps {
  isOpen: boolean;
  handleOpenChange?: () => void;
  title: string;
  trigger?: React.ReactNode;
  body: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  mobileContentClassName?: string;
  desktopContentClassName?: string;
  titleIcon?: React.ReactNode;
}

const AdaptiveDialog: FC<AdaptiveDialogProps> = ({
  isOpen,
  handleOpenChange,
  title,
  trigger,
  body,
  footer,
  variant = 'primary',
  mobileContentClassName,
  desktopContentClassName,
  titleIcon,
}) => {
  const { isMobileView } = useMedia();
  const closable = !handleOpenChange;

  const dialogTitle = (
    <div className={`flex flex-row items-center gap-2 font-bold ${isMobileView && 'pb-4'}`}>
      {React.isValidElement(titleIcon) ? titleIcon : null}
      <p className="max-w-[80vw] truncate sm:max-w-none">{title}</p>
    </div>
  );

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
        showCloseButton={closable}
      >
        <SheetHeader variant={variant}>
          <SheetTitle>{dialogTitle}</SheetTitle>
        </SheetHeader>
        {body}
        {footer ? <SheetFooter>{footer}</SheetFooter> : null}
        <SheetDescription
          aria-disabled
          className="hidden"
        />
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
        showCloseButton={closable}
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        {body}
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
        <DialogDescription
          aria-disabled
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
};

export default AdaptiveDialog;
