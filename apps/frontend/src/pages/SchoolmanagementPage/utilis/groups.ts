export interface GroupInfo {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  subGroups: GroupInfo[];
  attributes?: unknown;
  realmRoles?: string[];
  clientRoles?: unknown;
}

export interface SchoolData {
  id: string;
  name: string;
  classes: GroupInfo[];
  printers: GroupInfo[];
  projects: GroupInfo[];
}
