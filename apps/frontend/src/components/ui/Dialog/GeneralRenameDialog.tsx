import React, { FC, ReactNode, useEffect, useState } from 'react';
import {
  DialogContentSH,
  DialogDescriptionSH,
  DialogSH,
  DialogTitleSH,
  DialogTriggerSH,
} from '@/components/ui/DialogSH.tsx';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/Sheet';
import { useMediaQuery } from 'usehooks-ts';
import InputSH from '@/components/ui/InputSH';
import { Button } from '@/components/shared/Button';
import { useTranslation } from 'react-i18next';

interface GeneralDialogProps {
  trigger?: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  title: string;
  placeholder: string;
  isValidInput: (input: string) => boolean;
  onSubmit: (input: string) => Promise<void>;
}

const GeneralDialog: FC<GeneralDialogProps> = ({
  trigger,
  isOpen: externalIsOpen,
  onOpenChange,
  title,
  placeholder,
  isValidInput,
  onSubmit,
}) => {
  const [isOpen, setIsOpen] = useState(externalIsOpen || false);
  const [inputValue, setInputValue] = useState('');
  const [isInputValid, setIsInputValid] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { t } = useTranslation();

  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    setInputValue('');
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    setIsInputValid(isValidInput(value));
  };

  const handleSubmit = async () => {
    await onSubmit(inputValue);
    setIsOpen(false);
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const mobileContent = (
    <Sheet
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <SheetDescription>
          <InputSH
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
          />
        </SheetDescription>
        <div className="mt-4 flex justify-end px-6">
          <Button
            variant="btn-collaboration"
            disabled={!isInputValid}
            onClick={handleSubmit}
          >
            {t('common.submit')}
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
      {trigger && <DialogTriggerSH asChild>{trigger}</DialogTriggerSH>}
      <DialogContentSH>
        <DialogTitleSH>{title}</DialogTitleSH>
        <DialogDescriptionSH className="text-black">
          <InputSH
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
          />
        </DialogDescriptionSH>
        <div className="flex flex-row justify-end space-x-4 pt-3 text-black">
          <Button
            variant="btn-collaboration"
            disabled={!isInputValid}
            onClick={handleSubmit}
          >
            {t('common.rename')}
          </Button>
        </div>
      </DialogContentSH>
    </DialogSH>
  );

  return isMobile ? mobileContent : desktopContent;
};

export default GeneralDialog;
