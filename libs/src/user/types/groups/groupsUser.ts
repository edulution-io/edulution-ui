import { LDAPUser } from '@libs/user/types/groups/ldapUser';

export interface GroupsUser extends LDAPUser {
  ldapGroups: string[];
}
