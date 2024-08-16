import { LDAPUser } from '@libs/groups/types/ldapUser';

interface LdapUserWithGroups extends LDAPUser {
  ldapGroups: string[];
}

export default LdapUserWithGroups;
