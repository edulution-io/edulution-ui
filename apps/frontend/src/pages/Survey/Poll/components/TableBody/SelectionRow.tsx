import React from 'react';
import { PollSelection, PollSelectionCellState, PollType } from '@/pages/Survey/Poll/poll-types';
import SelectionCell from '@/pages/Survey/Poll/components/TableBody/SelectionCell';

interface SelectionRowProps {
  pollType: PollType;
  pollName: string;
  currentSelection: PollSelection[];
  setCurrentSelection: (selection: PollSelection[]) => void;
  canParticipantSelectMultipleOptions?: boolean;
}

const SelectionRow = (props: SelectionRowProps) => {
  const { pollType, pollName, currentSelection, setCurrentSelection, canParticipantSelectMultipleOptions } = props;

  const deselectOldSelectionInFavorOfNewSelection = (option: string | Date | number) => {
    const newSelection = currentSelection.map((select: PollSelection) => {
      if (select.option === option) {
        return { option, state: PollSelectionCellState.ACCEPTED };
      }
      return { option: select.option, state: PollSelectionCellState.DENIED };
    });
    setCurrentSelection(newSelection);
  };

  const updateSelection = (select: PollSelection, id: number) => {
    const isSingleSelection = pollType === PollType.RATING || !canParticipantSelectMultipleOptions;
    if (isSingleSelection) {
      if (select.state === PollSelectionCellState.ACCEPTED) {
        deselectOldSelectionInFavorOfNewSelection(select.option);
        return;
      }
    }

    const updatedSelectionArray = currentSelection;
    updatedSelectionArray[id] = select;
    setCurrentSelection(updatedSelectionArray);
  };

  return currentSelection.map((select: PollSelection, index) => (
    <SelectionCell
      key={`poll_${pollName}_table_row_new-participant_select_cell_option-${select.option.toString()}`}
      currentSelection={select}
      setSelection={(selection: PollSelection) => {
        updateSelection(selection, index);
      }}
      disabled={false}
    />
  ));
};

export default SelectionRow;
