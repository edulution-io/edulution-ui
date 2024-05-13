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
