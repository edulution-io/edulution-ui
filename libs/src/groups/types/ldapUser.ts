// This DTO is based on a third-party object definition from the LDAP API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.
import { LDAPUserAccess } from '@libs/groups/types/ldapUserAccess';
import { LDAPUserAttributes } from '@libs/groups/types/ldapUserAttributes';

export type LDAPUser = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  attributes: LDAPUserAttributes;
  createdTimestamp: number;
  enabled: boolean;
  totp: boolean;
  federationLink: string;
  disableableCredentialTypes: string[];
  requiredActions: string[];
  notBefore: number;
  access: LDAPUserAccess;
};
