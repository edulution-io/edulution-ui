export enum PollType {
  TEXT = 'Text',
  DATE = 'Date',
  RATING = 'Rating',
}

export interface Participant {
  displayText: string;
  selection: PollSelection[];
}

export interface PollSelection {
  state: PollSelectionCellState;
  option: string | Date | number;
}

export enum PollSelectionCellState {
  ACCEPTED = 'Accepted',
  UNCERTAIN = 'Uncertain',
  DENIED = 'Denied',
  UNSEEN = 'Unseen',
}
