import React, { useState, useEffect } from 'react';
import { DialogSH, DialogTriggerSH, DialogContentSH } from '@/components/ui/DialogSH';
import { Button } from '@/components/shared/Button';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '@/components/ui/Sheet';
import { useMediaQuery } from 'usehooks-ts';

interface CreateContentDialogProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  title: string;
  onSubmit: () => void;
  isDisabled: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

const CreateContentDialog: React.FC<CreateContentDialogProps> = ({
  children,
  trigger,
  title,
  onSubmit,
  isDisabled,
  isOpen: externalIsOpen,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    console.log('externalIsOpen:', externalIsOpen);
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  const content = (
    <>
      <SheetHeader>
        <p className={isMobile ? 'text-white' : 'text-black'}>{title}</p>
      </SheetHeader>
      {children}
      <div className="mt-4 flex justify-end px-6">
        <Button
          variant="btn-collaboration"
          disabled={isDisabled}
          onClick={() => {
            onSubmit();
          }}
        >
          Submit
        </Button>
      </div>
    </>
  );

  return isMobile ? (
    <Sheet
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="flex flex-col"
      >
        {content}
      </SheetContent>
    </Sheet>
  ) : (
    <DialogSH
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTriggerSH asChild>{trigger}</DialogTriggerSH>
      <DialogContentSH>{content}</DialogContentSH>
    </DialogSH>
  );
};

export default CreateContentDialog;
