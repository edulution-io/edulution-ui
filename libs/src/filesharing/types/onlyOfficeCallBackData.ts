interface Action {
  type: 0 | 1 | 2;
  userid: string;
}

interface ChangeHistory {
  changeId: string;
  timestamp: string;
}

interface History {
  changes: ChangeHistory[];
  serverVersion: string;
}

interface OnlyOfficeCallbackData {
  actions?: Action[];
  changeshistory?: ChangeHistory[];
  changesurl?: string;
  filetype?: string;
  forcesavetype?: 0 | 1 | 2 | 3;
  formsdataurl?: string;
  history?: History;
  key: string;
  status: 1 | 2 | 3 | 4 | 6 | 7;
  url: string;
  userdata?: string;
  users?: string[];
}

export default OnlyOfficeCallbackData;
