import LdapGroups from './groups/ldapGroups';

export default interface User {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  ldapGroups: LdapGroups;
  mfaEnabled: boolean;
  isTotpSet: boolean;
}
