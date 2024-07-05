export interface Group {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  subGroups: Group[];
  attributes?: unknown;
  realmRoles?: string[];
  clientRoles?: unknown;
}
