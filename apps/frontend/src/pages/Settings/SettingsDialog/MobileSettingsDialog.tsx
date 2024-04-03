import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/shared/Button';
import { SettingsDialogProps } from '@/pages/Settings/SettingsDialog/settingTypes';
import { DropdownMenu } from '@/components';
import { AppType } from '@/datatypes/types';

const MobileSettingsDialog: React.FC<SettingsDialogProps> = ({
  isSheetOpen,
  handleSheetChange,
  option,
  setOption,
  filteredAppOptions,
  setSearchParams,
  setConfig,
  t,
}) => (
  <Sheet
    modal
    open={isSheetOpen}
    onOpenChange={handleSheetChange}
  >
    <SheetTrigger asChild />
    <SheetContent
      side="bottom"
      className="flex flex-col"
    >
      <SheetHeader>{t('settings.addApp.title')}</SheetHeader>
      <SheetDescription className="bg-transparent">{t('settings.addApp.description')}</SheetDescription>
      <div className="pb-10 pt-2">
        <DropdownMenu
          options={filteredAppOptions()}
          selectedVal={t(option)}
          handleChange={setOption}
        />
      </div>
      <div className="container mx-auto flex justify-end p-4 sm:pr-10 md:right-20">
        <Button
          type="button"
          variant="btn-collaboration"
          size="lg"
          onClick={() => {
            setSearchParams(new URLSearchParams(''));
            setConfig((prevConfig) => ({
              [option.toLowerCase().split('.')[0]]: { linkPath: '', icon: '', appType: AppType.NATIVE },
              ...prevConfig,
            }));
          }}
        >
          {t('common.add')}
        </Button>
      </div>
    </SheetContent>
  </Sheet>
);

export default MobileSettingsDialog;
