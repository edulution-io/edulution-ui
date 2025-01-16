import { useAuth } from 'react-oidc-context';
import GroupRoles from '@libs/groups/types/group-roles.enum';

const useLdapGroups = () => {
  const auth = useAuth();
  const ldapGroups = (auth.user?.profile.ldapGroups as string[]) || [];
  const authReady = !!auth.user;
  const isSuperAdmin = ldapGroups.includes(GroupRoles.SUPER_ADMIN);

  return { isSuperAdmin, ldapGroups, authReady };
};

export default useLdapGroups;
