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
  handleOpenChange: () => void;
  title: string;
  trigger?: React.ReactNode;
  body: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  mobileContentClassName?: string;
  desktopContentClassName?: string;
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
}) => {
  const { isMobileView } = useMedia();

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
        <SheetHeader variant={variant}>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        {body}
        {footer ? <SheetFooter>{footer}</SheetFooter> : null}
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
        {body}
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
        <DialogDescription aria-disabled />
      </DialogContent>
    </Dialog>
  );
};

export default AdaptiveDialog;
