import React, { useRef } from 'react';
import { Button } from '@/components/shared/Button';
import { SettingsDialogProps } from '@/pages/Settings/SettingsDialog/settingTypes';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { DialogFooter, DialogHeader } from '@/components/ui/Dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { DropdownMenu } from '@/components';
import { AppType } from '@/datatypes/types';
import { useTranslation } from 'react-i18next';
import { useOnClickOutside } from 'usehooks-ts';
import useAppDataStore from '@/store/appDataStore';
import useEduApi from '@/api/useEduApiQuery';
import { SETTINGS_APPSELECT_OPTIONS } from '@/constants/settings';

const DesktopSettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  option,
  setOption,
  filteredAppOptions,
  setSearchParams,
}) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const { config, setConfig } = useAppDataStore();
  const { updateSettingsConfig } = useEduApi();

  useOnClickOutside(dialogRef, () => setSearchParams(new URLSearchParams('')));
  return (
    <Dialog
      modal
      open={isOpen}
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
                const selectedOption = option.toLowerCase().split('.')[0];
                const optionsConfig = SETTINGS_APPSELECT_OPTIONS.find((item) => item.id.includes(selectedOption));

                if (optionsConfig) {
                  const newConfig = {
                    name: selectedOption,
                    linkPath: '',
                    icon: optionsConfig.icon,
                    appType: AppType.FORWARDED,
                  };
                  const updatedConfig = [...config, newConfig];

                  setConfig(updatedConfig);
                  updateSettingsConfig(updatedConfig).catch(console.error);
                }
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
