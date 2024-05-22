'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import cn from '@/lib/utils';
import { translateKey } from '@/utils/common';

const DialogSH = DialogPrimitive.Root;

const DialogTriggerSH = DialogPrimitive.Trigger;

const DialogPortalSH = DialogPrimitive.Portal;

const DialogCloseSH = DialogPrimitive.Close;

const DialogOverlaySH = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
      'bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0',
    )}
    {...props}
  />
));
DialogOverlaySH.displayName = DialogPrimitive.Overlay.displayName;

const DialogContentSH = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { showCloseButton?: boolean }
>(({ className, children, showCloseButton = true, ...props }, ref) => (
  <DialogPortalSH>
    <DialogOverlaySH />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'max-width fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border bg-white p-6 shadow-lg duration-200',
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close className="absolute right-5 top-5">
          <Cross2Icon className="h-4 w-4 text-black" />
          <span className="sr-only">${translateKey('dialog.close')}</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortalSH>
));

DialogContentSH.defaultProps = {
  showCloseButton: true,
};
DialogContentSH.displayName = DialogPrimitive.Content.displayName;

const DialogHeaderSH = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
    {...props}
  />
);
DialogHeaderSH.displayName = 'DialogHeader';

const DialogFooterSH = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);
DialogFooterSH.displayName = 'DialogFooter';

const DialogTitleSH = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('rounded-xl text-lg font-semibold leading-none tracking-tight text-black', className)}
    {...props}
  />
));
DialogTitleSH.displayName = DialogPrimitive.Title.displayName;

const DialogDescriptionSH = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(' rounded-xl text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescriptionSH.displayName = DialogPrimitive.Description.displayName;

export {
  DialogSH,
  DialogPortalSH,
  DialogOverlaySH,
  DialogTriggerSH,
  DialogCloseSH,
  DialogContentSH,
  DialogHeaderSH,
  DialogFooterSH,
  DialogTitleSH,
  DialogDescriptionSH,
};
