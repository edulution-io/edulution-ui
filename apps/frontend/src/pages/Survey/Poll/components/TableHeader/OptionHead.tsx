import React from 'react';
import { IoTrashOutline } from 'react-icons/io5';
import { HiOutlineDocumentDuplicate } from 'react-icons/hi2';
import { Button } from '@/components/shared/Button';
import { TableHead } from '@/components/ui/Table';
import { PollType } from '@/pages/Survey/Poll/poll-types';

interface OptionHeaderProps {
  pollType: PollType;
  option: string | Date | number;
  removeOption?: (option: string | Date | number) => void;
  copyOption?: (option: string) => void;
}

const OptionHead = (props: OptionHeaderProps) => {
  const { pollType, option, removeOption, copyOption } = props;

  if (pollType === PollType.RATING) {
    return <>{option.toString()}</>;
  }

  const getOptionString = (opt: string | Date | number) => {
    if (opt instanceof Date) {
      // TODO: give user possibility to choose date format
      return opt.toLocaleDateString('de-DE', { year: 'numeric', month: 'numeric', day: 'numeric' });
    }
    return opt.toString();
  };

  const classNamesForTheButtons =
    'min-w-[40px] max-w-[40px] h-6 m-1 bg-gray-400 text-gray-600 text-sm justify-center border border-black hover:cursor-pointer';

  return (
    <TableHead className="min-w-[120px] max-w-[120px] rounded-xl bg-gray-200">
      <h4 className="h-12 rounded-xl p-2 text-center text-gray-900">{getOptionString(option)}</h4>
      <span className="flex justify-center">
        {removeOption ? (
          <Button
            className={classNamesForTheButtons}
            onClick={() => removeOption(option)}
          >
            <IoTrashOutline className="max-h-[20px] min-h-[20px] min-w-[20px] max-w-[20px]" />
          </Button>
        ) : null}
        {copyOption && pollType === PollType.TEXT ? (
          <Button
            className={classNamesForTheButtons}
            onClick={() => copyOption(option.toString())}
          >
            <HiOutlineDocumentDuplicate className="max-h-[20px] min-h-[20px] min-w-[20px] max-w-[20px]" />
          </Button>
        ) : null}
      </span>
    </TableHead>
  );
};

export default OptionHead;
