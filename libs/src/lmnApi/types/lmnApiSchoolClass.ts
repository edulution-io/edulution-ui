// This type is based on a third-party object definition from the LDAP API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.
interface LmnApiSchoolClass {
  cn: string;
  description: string;
  distinguishedName: string;
  displayName: string;
  mail: string[];
  member: string[];
  memberOf: string[];
  proxyAddresses: string[];
  name: string;
  sAMAccountName: string;
  sAMAccountType: string;
  sophomorixAddMailQuota: string[];
  sophomorixAddQuota: string[];
  sophomorixAdmins: string[];
  sophomorixCreationDate: string;
  sophomorixHidden: boolean;
  sophomorixJoinable: boolean;
  sophomorixMailAlias: boolean;
  sophomorixMailList: boolean;
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

export default LmnApiSchoolClass;
