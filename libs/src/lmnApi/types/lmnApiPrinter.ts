type LmnApiPrinter = {
  cn: string;
  displayName: string;
  distinguishedName: string;
  member: string[];
  memberOf: string[];
  name: string;
  proxyAddresses: string[];
  sAMAccountName: string;
  sAMAccountType: string;
  sophomorixAdminClass: string;
  sophomorixCreationDate: string;
  sophomorixHidden: boolean;
  sophomorixIntrinsicMulti1: string[];
  sophomorixJoinable: boolean;
  sophomorixMembers: string[];
  sophomorixRole: string;
  sophomorixSchoolname: string;
  sophomorixSchoolPrefix: string;
  sophomorixStatus: string;
  sophomorixType: string;
};

export default LmnApiPrinter;
