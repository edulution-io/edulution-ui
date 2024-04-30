import React from 'react';
import { useTranslation } from 'react-i18next';
import { TableCell, TableRow } from '@/components/ui/Table';
import { PollSelection, PollType } from '@/pages/Survey/Poll/poll-types';
import Input from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import SelectionRow from '@/pages/Survey/Poll/components/TableBody/SelectionRow';

interface TableRowCurrentParticipantProps {
  pollType: PollType;
  pollName: string;

  currentSelection: PollSelection[];
  setCurrentSelection: (selection: PollSelection[]) => void;

  currentParticipantName: string;
  setCurrentParticipantName: (currentParticipantName: string) => void;

  canParticipantSelectMultipleOptions: boolean;
}

const CurrentParticipantRow = (props: TableRowCurrentParticipantProps) => {
  const {
    pollType,
    pollName,

    currentSelection,
    setCurrentSelection,

    currentParticipantName,
    setCurrentParticipantName,

    canParticipantSelectMultipleOptions,
  } = props;

  const { t } = useTranslation();

  return (
    <TableRow
      key="poll_table_row_new_participant"
      className="rounded-lg bg-blue-400 hover:bg-gray-300"
    >
      <TableCell className="ml-2 mr-2 h-12 min-w-[80px] max-w-[80px] pb-2 pl-4 pr-4 pt-2">
        <Input
          className="h-8 rounded bg-gray-100 py-0 text-black"
          type="text"
          // value is a Date since the poll type is "Text"
          value={currentParticipantName}
          onChange={(e) => setCurrentParticipantName(e.target.value || e.currentTarget.value)}
        />

        <Button
          variant="btn-outline"
          className="ml-3 h-8 rounded border bg-blue-600 py-0 text-gray-900 hover:bg-gray-100 hover:text-gray-600"
          onClick={() => {}}
        >
          {t('survey.poll.save')}
        </Button>
      </TableCell>
      <SelectionRow
        pollType={pollType}
        pollName={pollName}
        currentSelection={currentSelection}
        setCurrentSelection={setCurrentSelection}
        canParticipantSelectMultipleOptions={canParticipantSelectMultipleOptions}
      />
    </TableRow>
  );
};

export default CurrentParticipantRow;
