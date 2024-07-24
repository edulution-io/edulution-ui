import UserLmnInfo from '@libs/lmnApi/types/userInfo';

interface LmnApiProject {
  cn: string;
  description: string;
  distinguishedName: string;
  mail: string[];
  member: UserLmnInfo[];
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
