import GroupRoles from '@libs/user/types/groups/group-roles.enum';
import { useAuth } from 'react-oidc-context';

const useLdapGroups = () => {
  const auth = useAuth();
  const ldapGroups = (auth.user?.profile.ldapGroups as string[]) || [];
  const isSuperAdmin = ldapGroups.includes(GroupRoles.SUPER_ADMIN);

  return { isSuperAdmin, ldapGroups };
};

export default useLdapGroups;
