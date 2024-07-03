// This DTO is based on a third-party object definition from the LDAP API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.
export type LDAPUserAccess = {
  manageGroupMembership: boolean;
  view: boolean;
  mapRoles: boolean;
  impersonate: boolean;
  manage: boolean;
};
