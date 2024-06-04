export interface SchoolclassInfoState {
  cn: string;
  description: string;
  distinguishedName: string;
  mail: string[];
  member: string[];
  memberOf: string[];
  name: string;
  sAMAccountName: string;
  sAMAccountType: string;
  sophomorixAddMailQuota: string[];
  sophomorixAddQuota: string[];
  sophomorixAdmins: string[];
  sophomorixCreationDate: string;
  sophomorixHidden: boolean;
  sophomorixJoinable: boolean;
  sophomorixMailAlias: string[];
  sophomorixMailList: string[];
  sophomorixMailQuota: string[];
  sophomorixMaxMembers: number;
  sophomorixMembers: string[];
  sophomorixQuota: string[];
  sophomorixSchoolname: string;
  sophomorixStatus: string;
  sophomorixType: string;
  membersCount: number;
  dn: string;
}

export interface MemberInfo {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  attributes: {
    LDAP_ENTRY_DN: string[];
    LDAP_ID: string[];
    modifyTimestamp: string[];
    createTimestamp: string[];
  };
  createdTimestamp: number;
  enabled: boolean;
  totp: boolean;
  federationLink: string;
  disableableCredentialTypes: string[];
  requiredActions: string[];
  notBefore: number;
  isWifiOn: boolean;
  isInternetOn: boolean;
  printerAccess: boolean;
  access: {
    manageGroupMembership: boolean;
    view: boolean;
    mapRoles: boolean;
    impersonate: boolean;
    manage: boolean;
  };
}
