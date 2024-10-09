import useLdapGroups from '@/hooks/useLdapGroups';
import useLmnApiStore from '@/store/useLmnApiStore';

const useUserPath = () => {
  const { user: lmnUser } = useLmnApiStore();
  const { isSuperAdmin } = useLdapGroups();
  const homePath = isSuperAdmin
    ? `/global/${lmnUser?.sophomorixIntrinsic2[0]}`
    : lmnUser?.sophomorixIntrinsic2[0] || '';

  return { homePath };
};

export default useUserPath;
