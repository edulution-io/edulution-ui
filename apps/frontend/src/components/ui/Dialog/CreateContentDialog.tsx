import React, { useEffect, useState } from 'react';
import { DialogContentSH, DialogSH, DialogTriggerSH } from '@/components/ui/DialogSH';
import { Button } from '@/components/shared/Button';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '@/components/ui/Sheet';
import { useMediaQuery } from 'usehooks-ts';
import { t } from 'i18next';
import { DropdownMenu } from '@/components';
import { DropdownOptions } from '@/components/ui/DropdownMenu/DropdownMenu.tsx';

interface CreateContentDialogProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  title: string;
  onSubmit: (selectedFileEnding: string) => void;
  isDisabled: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  fileEndings?: string[];
  showFileEndingsDropdown?: boolean;
  onFileEndingChange?: (fileEnding: string) => void;
}

const CreateContentDialog: React.FC<CreateContentDialogProps> = ({
  children,
  trigger,
  title,
  onSubmit,
  isDisabled,
  isOpen: externalIsOpen,
  onOpenChange,
  fileEndings = [],
  showFileEndingsDropdown = false,
  onFileEndingChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFileEnding, setSelectedFileEnding] = useState(fileEndings[0] || '');
  const [selectedOption, setSelectedOption] = useState<string>(fileEndings[0] || '');
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
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

  const handleFileEndingChange = (value: DropdownOptions) => {
    setSelectedFileEnding(value.id);
    setSelectedOption(value.name);
    if (onFileEndingChange) {
      onFileEndingChange(value.id);
    }
  };

  const content = (
    <>
      <SheetHeader>
        <p className={isMobile ? 'text-white' : 'text-black'}>{title}</p>
      </SheetHeader>
      <div className="mt-4 flex items-center gap-2 ">
        <div className="flex-grow">{children}</div>
        {showFileEndingsDropdown && (
          <div className="w-1/4 flex-grow-0">
            <label className="sr-only">{t('createContent.selectFileEnding')}</label>
            <DropdownMenu
              options={fileEndings.map((ending) => ({ id: ending, name: ending })) as DropdownOptions[]}
              selectedVal={selectedOption}
              handleChange={handleFileEndingChange}
            />
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-end px-6">
        <Button
          variant="btn-collaboration"
          disabled={isDisabled}
          onClick={() => {
            onSubmit(selectedFileEnding);
          }}
        >
          {t('createContent.submit')}
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
