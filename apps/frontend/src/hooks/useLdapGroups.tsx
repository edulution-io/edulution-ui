import { useAuth } from 'react-oidc-context';

const useLdapGroups = () => {
  const auth = useAuth();
  const ldapGroups = (auth.user?.profile.ldapGroups as string[]) || [''];
  return ldapGroups;
};

export default useLdapGroups;
