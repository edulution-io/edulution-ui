// This DTO is based on a third-party object definition from the LDAP API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.
export type LDAPUserAttributes = {
  LDAP_ENTRY_DN: string[];
  school: string[];
  LDAP_ID: string[];
  modifyTimestamp: string[];
  createTimestamp: string[];
};
