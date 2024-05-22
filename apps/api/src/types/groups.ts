export interface GroupInfo {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  subGroups: GroupInfo[];
  attributes?: any;
  realmRoles?: string[];
  clientRoles?: any;
}

export interface SchoolData {
  id: string;
  name: string;
  classes: GroupInfo[];
  printers: GroupInfo[];
  projects: GroupInfo[];
}
