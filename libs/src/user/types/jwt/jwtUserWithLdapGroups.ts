import JwtUser from '@libs/user/types/jwt/jwtUser';

export interface JwtUserWithLdapGroups extends Omit<JwtUser, 'ldapGroups'> {
  ldapGroups: {
    school: string;
    projects: string[];
    projectPaths: string[];
    classes: string[];
    classPaths: string[];
    role: string;
    others: string[];
  };
}
