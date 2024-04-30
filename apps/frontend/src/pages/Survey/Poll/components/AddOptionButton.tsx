import React from 'react';
import { useTranslation } from 'react-i18next';
import { PollType } from '@/pages/Survey/Poll/poll-types';

import DatePicker from '@/components/shared/DatePicker';
import Input from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';

interface AddOptionButtonProps {
  type: PollType;
  option: string | Date[] | undefined;
  setOption: (option: string | Date[] | undefined) => void;
  addOption: (option: string | Date[] | undefined) => void;
}

const AddOptionButton = (props: AddOptionButtonProps) => {
  const { type, option, setOption, addOption } = props;

  const { t } = useTranslation();

  const getInputType = () => {
    switch (type) {
      case PollType.TEXT:
        return (
          <Input
            type="text"
            value={option as string | undefined}
            onChange={(e) => setOption(e.target.value || e.currentTarget.value)}
          />
        );
      case PollType.DATE:
        return (
          <DatePicker
            selected={option as Date[] | undefined}
            onSelect={(days: Date[] | undefined) => setOption(days)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-xl bg-gray-100 p-2">
      {getInputType()}
      <Button
        variant="btn-outline"
        className="mt-2 h-8 rounded border bg-gray-300 py-0 text-black hover:bg-gray-100 hover:text-gray-600"
        onClick={() => addOption(option)}
      >
        {t('add')}
      </Button>
    </div>
  );
};

export default AddOptionButton;
