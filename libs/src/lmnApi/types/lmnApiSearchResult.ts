// This type is based on a third-party object definition from the LDAP API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.
import LmnApiGroupTypes from '@libs/lmnApi/types/lmnApiGroupTypes';

interface LmnApiSearchResult {
  cn: string;
  description: string;
  displayName: string;
  distinguishedName: string;
  givenName: string;
  mail: string;
  sAMAccountName: string;
  sAMAccountType: number;
  sn: string;
  sophomorixAddMailQuota: string;
  sophomorixAddQuota: string[];
  sophomorixCreationDate: string;
  sophomorixHidden: boolean;
  sophomorixJoinable: boolean;
  sophomorixMailAlias: boolean;
  sophomorixMailList: boolean;
  sophomorixMailQuota: string;
  sophomorixQuota: string;
  sophomorixRole: string;
  sophomorixSchoolname: string;
  sophomorixSchoolPrefix: string;
  sophomorixStatus: string;
  dn: string;
  type: LmnApiGroupTypes;
}

export default LmnApiSearchResult;
