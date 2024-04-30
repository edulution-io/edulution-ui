import React from 'react';
import { TableCell, TableRow } from '@/components/ui/Table';
import { PollSelection } from '@/pages/Survey/Poll/poll-types';
import SelectionCell from '@/pages/Survey/Poll/components/TableBody/SelectionCell';

interface TableRowPreviousParticipantsProps {
  displayText: string;
  selection: PollSelection[];
  className?: string;
}

const PreviousParticipantsRow = (props: TableRowPreviousParticipantsProps) => {
  const { displayText, selection = [], className = 'bg-gray-300 hover:bg-gray-400' } = props;

  return (
    <TableRow
      key={`poll_table_row_${displayText}`}
      className={className}
    >
      <TableCell
        key={`poll_table_cell_row_${displayText}_participant`}
        className="text-white"
      >
        {displayText}
      </TableCell>
      {selection.map((select: PollSelection) => (
        <SelectionCell
          key={`poll_table_row_cell_new-participant_select_options_${select.option.toString()}`}
          currentSelection={select}
          setSelection={() => {}}
          disabled
        />
      ))}
    </TableRow>
  );
};

export default PreviousParticipantsRow;
