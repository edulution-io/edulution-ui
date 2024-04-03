import React, { useRef } from 'react';
import { Button } from '@/components/shared/Button';
import { SettingsDialogProps } from '@/pages/Settings/SettingsDialog/settingTypes';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { DialogFooter, DialogHeader } from '@/components/ui/Dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { DropdownMenu } from '@/components';
import { AppType } from '@/datatypes/types';

const DesktopSettingsDialog: React.FC<SettingsDialogProps> = ({
  isDialogOpen,
  option,
  setOption,
  filteredAppOptions,
  setSearchParams,
  setConfig,
  t,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  return (
    <Dialog
      modal
      open={isDialogOpen}
    >
      <DialogContent
        ref={dialogRef}
        className="data-[state=open]:animate-contentShow fixed left-[50%] top-[40%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] text-black shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none"
      >
        <DialogHeader>
          <DialogTitle>{t('settings.addApp.title')}</DialogTitle>
          <DialogDescription>{t('settings.addApp.description')}</DialogDescription>
          <DialogClose asChild>
            <button
              type="button"
              className="absolute right-5 top-5 text-black"
              onClick={() => setSearchParams(new URLSearchParams(''))}
            >
              <Cross2Icon />
            </button>
          </DialogClose>
        </DialogHeader>
        <DropdownMenu
          options={filteredAppOptions()}
          selectedVal={t(option)}
          handleChange={setOption}
        />
        <DialogFooter className="justify-center pt-4 text-white">
          <DialogClose asChild>
            <Button
              type="button"
              variant="btn-collaboration"
              size="lg"
              onClick={() => {
                setSearchParams(new URLSearchParams(''));
                setConfig((prevConfig) => ({
                  [option.toLowerCase().split('.')[0]]: {
                    linkPath: '',
                    icon: '',
                    appType: AppType.NATIVE,
                  },
                  ...prevConfig,
                }));
              }}
            >
              {t('common.add')}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DesktopSettingsDialog;
