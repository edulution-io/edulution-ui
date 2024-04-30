import React from 'react';

import { FaCheck, FaRegCheckCircle } from 'react-icons/fa';
import { FaXmark } from 'react-icons/fa6';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { MdReportGmailerrorred } from 'react-icons/md';

import cn from '@/lib/utils';
import { TableCell } from '@/components/ui/Table';
import { Button } from '@/components/shared/Button';
import { PollSelection, PollSelectionCellState } from '@/pages/Survey/Poll/poll-types';

interface SelectionCellProps {
  currentSelection: PollSelection;
  setSelection: (selection: PollSelection) => void;
  disabled: boolean;
  className?: string;
}

const SelectionCell = (props: SelectionCellProps) => {
  const { currentSelection, setSelection, disabled = true, className } = props;
  const { state, option } = currentSelection;

  const updateState = () => {
    switch (state) {
      case PollSelectionCellState.DENIED:
        setSelection({ option, state: PollSelectionCellState.UNCERTAIN });
        return;
      case PollSelectionCellState.UNCERTAIN:
        setSelection({ option, state: PollSelectionCellState.ACCEPTED });
        return;
      case PollSelectionCellState.ACCEPTED:
        setSelection({ option, state: PollSelectionCellState.DENIED });
        return;
      default:
        setSelection({ option, state: PollSelectionCellState.UNSEEN });
    }
  };

  const getButtonConfig = () => {
    switch (state) {
      case PollSelectionCellState.ACCEPTED:
        return {
          color: 'bg-green-300',
          icon: <FaCheck className="h-5 w-5 text-green-500 hover:text-green-700" />,
          text: 'Accepted',
        };
      case PollSelectionCellState.UNCERTAIN:
        return {
          color: 'bg-yellow-300',
          icon: <FaRegCheckCircle className="h-5 w-5 text-yellow-500 hover:text-yellow-700" />,
          text: 'Uncertain',
        };
      case PollSelectionCellState.DENIED:
        return {
          color: 'bg-red-300',
          icon: <FaXmark className="h-5 w-5 text-red-500 hover:text-red-700" />,
          text: 'Refused',
        };
      case PollSelectionCellState.UNSEEN:
        return {
          color: 'bg-blue-300',
          icon: <IoInformationCircleOutline className="h-5 w-5 text-blue-500 hover:text-blue-700" />,
          text: 'Unseen',
        };
      default:
        return {
          color: 'twilight-300',
          icon: <MdReportGmailerrorred className="h-5 w-5 text-red-700 hover:text-red-900" />,
          text: 'ERROR',
        };
    }
  };

  const baseClass =
    'h-12 min-w-[80px] max-w-[80px] rounded-xl bg-gray-400 p-2 items-center center text-center text-gray-900';

  const { color, icon, text } = getButtonConfig();

  return (
    <TableCell className={cn(className, 'center items-center justify-center text-center')}>
      <Button
        className={cn(baseClass, color)}
        onClick={() => updateState()}
        disabled={disabled}
      >
        {icon || text}
      </Button>
    </TableCell>
  );
};

export default SelectionCell;
