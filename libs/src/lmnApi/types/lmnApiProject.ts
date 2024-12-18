// This type is based on a third-party object definition from the LDAP API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import LmnApiProjectQuota from '@libs/lmnApi/types/lmnApiProjectQuota';

interface LmnApiProject {
  cn: string;
  description: string;
  distinguishedName: string;
  displayName: string;
  mail: string[];
  member: string[];
  members: UserLmnInfo[];
  quota?: LmnApiProjectQuota[];
  proxyAddresses: string[];
  name: string;
  sAMAccountName: string;
  sAMAccountType: string;
  sophomorixAddMailQuota: string[];
  sophomorixAddQuota: string[];
  sophomorixAdminGroups: string[];
  sophomorixAdmins: string[];
  sophomorixCreationDate: string;
  sophomorixHidden: boolean;
  sophomorixJoinable: boolean;
  sophomorixMailAlias: boolean;
  sophomorixMailList: boolean;
  sophomorixMailQuota: string[];
  sophomorixMaxMembers: number;
  sophomorixMemberGroups: string[];
  sophomorixMembers: string[];
  sophomorixQuota: string[];
  sophomorixSchoolname: string;
  sophomorixStatus: string;
  sophomorixType: string;
  dn: string;
  all_members: string[];
  all_admins: string[];
  membersCount: number;
  adminsCount: number;
}

export default LmnApiProject;
