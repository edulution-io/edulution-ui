// This DTO is based on a third-party object definition from the LDAP API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.
type LDAPUserAttributes = {
  LDAP_ENTRY_DN: string[];
  LDAP_ID: string[];
  modifyTimestamp: string[];
  createTimestamp: string[];
};

type LDAPUserAccess = {
  manageGroupMembership: boolean;
  view: boolean;
  mapRoles: boolean;
  impersonate: boolean;
  manage: boolean;
};

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
