import JwtUser from '@libs/user/types/jwt/jwtUser';
import LdapGroups from '../groups/ldapGroups';

export interface JwtUserWithLdapGroups extends Omit<JwtUser, 'ldapGroups'> {
  ldapGroups: LdapGroups;
}
