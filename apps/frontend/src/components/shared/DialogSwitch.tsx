import Switch from '@/components/ui/Switch';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

const DialogSwitch = ({
  checked,
  onCheckedChange,
  translationId,
}: {
  checked: boolean;
  translationId: string;
  onCheckedChange: (isChecked: boolean) => void;
}) => {
  const { t } = useTranslation();

  const switchId = uuidv4();

  return (
    <div className="flex justify-between">
      <div>{t(translationId)}</div>
      <div>
        <label
          htmlFor={switchId}
          className="mr-2 cursor-pointer"
        >
          {t(`common.${checked ? 'yes' : 'no'}`)}
        </label>
        <Switch
          id={switchId}
          checked={checked}
          defaultChecked
          onCheckedChange={onCheckedChange}
        />
      </div>
    </div>
  );
};

export default DialogSwitch;
