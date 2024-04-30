import { PollSelectionCellState } from '@/pages/Survey/Poll/poll-types';

export const mockedOptions = ['a', 'b', 'c', 'd', 'e'];
export const mockedParticipants = [
  {
    displayText: 'A',
    selection: [
      { option: 'a', state: PollSelectionCellState.ACCEPTED },
      { option: 'b', state: PollSelectionCellState.UNSEEN },
      { option: 'c', state: PollSelectionCellState.DENIED },
      { option: 'd', state: PollSelectionCellState.UNCERTAIN },
      { option: 'e', state: PollSelectionCellState.ACCEPTED },
    ],
  },
  {
    displayText: 'B',
    selection: [
      { option: 'a', state: PollSelectionCellState.UNCERTAIN },
      { option: 'b', state: PollSelectionCellState.ACCEPTED },
      { option: 'c', state: PollSelectionCellState.UNSEEN },
      { option: 'd', state: PollSelectionCellState.DENIED },
      { option: 'e', state: PollSelectionCellState.UNCERTAIN },
    ],
  },
  {
    displayText: 'C',
    selection: [
      { option: 'a', state: PollSelectionCellState.DENIED },
      { option: 'b', state: PollSelectionCellState.UNSEEN },
      { option: 'c', state: PollSelectionCellState.UNCERTAIN },
      { option: 'd', state: PollSelectionCellState.ACCEPTED },
      { option: 'e', state: PollSelectionCellState.DENIED },
    ],
  },
];
