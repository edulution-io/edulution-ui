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

  const renderTitleIcon = () => {
    if (!titleIcon || !React.isValidElement(titleIcon)) return null;
    const rawClass =
      typeof (titleIcon.props as { className?: unknown }).className === 'string'
        ? (titleIcon.props as { className?: unknown }).className
        : undefined;

    const hasSizeProp = Object.prototype.hasOwnProperty.call(titleIcon.props, 'size');
    const mergedClass = ['h-8 w-8 shrink-0', rawClass].filter(Boolean).join(' ');

    const nextProps: Record<string, unknown> = { className: mergedClass };
    if (hasSizeProp) nextProps.size = 32;

    return React.cloneElement(titleIcon, nextProps);
  };

  const dialogTitle = (
    <div className={`flex flex-row items-center gap-2 font-bold ${isMobileView && 'pb-4'}`}>
      {renderTitleIcon()}
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
        showCloseButton={closable}
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        {body}
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
        <DialogDescription aria-disabled />
      </DialogContent>
    </Dialog>
  );
};

export default AdaptiveDialog;
