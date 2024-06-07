export interface SessionInfo {
  sid: string;
  name: string;
  members: string[];
  membersCount: number;
}

export interface SessionInfoState {
  sid: string;
  name: string;
  membersCount: number;
  members: string[];
}
