import React from 'react';
import { useTranslation } from 'react-i18next';
import { TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Participant, PollSelection, PollSelectionCellState, PollType } from '@/pages/Survey/Poll/poll-types';
import OptionHead from '@/pages/Survey/Poll/components/TableHeader/OptionHead';
import AddOptionButton from '@/pages/Survey/Poll/components/AddOptionButton';

interface TableHeaderDynamicOptionsProps {
  pollType: PollType;
  pollName: string;

  currentOptions: string[] | Date[] | number[];
  setCurrentOptions: (options: string[] | Date[] | number[]) => void;

  newOption: string | Date[] | undefined;
  setNewOption: (option: string | Date[] | undefined) => void;

  participants: Participant[];

  currentSelection: PollSelection[];
  setCurrentSelection: (selection: PollSelection[]) => void;
}

const DynamicHeader = (props: TableHeaderDynamicOptionsProps) => {
  const {
    pollType,
    pollName,

    currentOptions = [],
    setCurrentOptions,

    newOption,
    setNewOption,

    participants,

    currentSelection,
    setCurrentSelection,
  } = props;

  const { t } = useTranslation();

  const updateCurrentOptionsArrayOnAdd = (option: string | Date) => {
    const updatedOptionsArray = currentOptions;
    // @ts-expect-error - the option type corresponds to the type of the poll ("Text" | "Date" | "Rating")
    updatedOptionsArray.push(option);
    setCurrentOptions(updatedOptionsArray);
  };

  const updatePreviousParticipantSelectionsForAddedOption = (option: string | Date) => {
    participants.forEach((participant) => {
      participant.selection.push({
        option,
        state: PollSelectionCellState.UNSEEN,
      });
    });
  };

  const updateCurrentParticipantSelectionsForAddedOption = (option: string | Date) => {
    const updatedCurrentSelectionArray = currentSelection;
    updatedCurrentSelectionArray.push({
      option,
      state: PollSelectionCellState.DENIED,
    });
    setCurrentSelection(updatedCurrentSelectionArray);
  };

  const addOption = (option?: string | Date) => {
    if (!option || pollType === PollType.RATING) {
      return;
    }
    // @ts-expect-error - the option type corresponds to the type of the poll ("Text" | "Date" | "Rating")
    if (currentOptions.includes(option)) {
      throw new Error('Option already exists');
      return;
    }

    updatePreviousParticipantSelectionsForAddedOption(option);
    updateCurrentParticipantSelectionsForAddedOption(option);

    updateCurrentOptionsArrayOnAdd(option);
  };

  const addNewOption = (option?: string | Date[]) => {
    if (Array.isArray(option)) {
      option.forEach((date) => addOption(date));
      return;
    }
    addOption(option);
  };

  const copyOption = (option: string) => {
    if (pollType !== PollType.TEXT) {
      return;
    }
    addOption(`${option} (${t('copy')})`);
  };

  const updateCurrentOptionsOnOptionRemoval = (option: string | Date | number) => {
    const updatedOptionsArray = currentOptions.filter((currentOption) => currentOption !== option);
    // @ts-expect-error - the option type corresponds to the type of the poll ("Text" | "Date" | "Rating")
    setCurrentOptions(updatedOptionsArray);
  };

  const updatePreviousParticipantSelectionsOnOptionRemoval = (option: string | Date | number) => {
    participants.forEach((participant) => {
      const selectionIndex = participant.selection.findIndex((selection) => selection.option === option);
      if (selectionIndex > -1) {
        participant.selection.splice(selectionIndex, 1);
      }
    });
  };

  const updateCurrentParticipantSelectionsOnOptionRemoval = (option: string | Date | number) => {
    const selectionIndex = currentSelection.findIndex((selection) => selection.option === option);
    if (selectionIndex > -1) {
      const updatedCurrentSelectionArray = currentSelection;
      updatedCurrentSelectionArray.splice(selectionIndex, 1);
      setCurrentSelection(updatedCurrentSelectionArray);
    }
  };

  const removeOption = (option: string | Date | number) => {
    if (pollType === PollType.RATING) {
      return;
    }
    updatePreviousParticipantSelectionsOnOptionRemoval(option);
    updateCurrentParticipantSelectionsOnOptionRemoval(option);

    updateCurrentOptionsOnOptionRemoval(option);
  };

  return (
    <TableHeader>
      <TableRow className="text-white">
        <TableHead
          key={`poll_${pollName}_table_header_participant`}
          className="min-w-[250px] rounded-xl bg-gray-900 p-4 text-center"
        >
          {t('survey.poll.participants')}
        </TableHead>
        {currentOptions.map((header) => (
          <OptionHead
            key={`poll_${pollName}_table_header_${header.toString()}`}
            pollType={pollType}
            option={header}
            removeOption={removeOption}
            copyOption={copyOption}
          />
        ))}
        <TableHead
          key={`poll_${pollName}_table_header_add_option`}
          className="max-w-[300px]"
        >
          <AddOptionButton
            type={pollType}
            option={newOption}
            setOption={setNewOption}
            addOption={addNewOption}
          />
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default DynamicHeader;
