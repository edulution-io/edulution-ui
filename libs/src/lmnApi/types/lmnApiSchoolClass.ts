import UserLmnInfo from '@libs/lmnApi/types/userInfo';

interface LmnApiSchoolClass {
  cn: string;
  description: string;
  distinguishedName: string;
  mail: string[];
  member: UserLmnInfo[];
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

export default LmnApiSchoolClass;
