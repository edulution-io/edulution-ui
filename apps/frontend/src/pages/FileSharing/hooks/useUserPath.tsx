import { useMemo } from 'react';
import useLmnApiStore from '@/store/useLmnApiStore';
import useUserStore from '@/store/UserStore/UserStore';
import buildUserPath from '@libs/filesharing/utils/buildUserPath'; // Neue zentrale Funktion

const useUserPath = () => {
  const { user } = useUserStore();
  const { user: lmnUser } = useLmnApiStore();
  const schoolClass = lmnUser?.schoolclasses[0] || '';
  const userRole = user?.ldapGroups?.roles[0] || '';
  const username = user?.username || '';

  const homePath = useMemo(() => buildUserPath(userRole, schoolClass, username), [userRole, schoolClass, username]);
  const basePath = useMemo(() => buildUserPath(userRole, schoolClass), [userRole, schoolClass]);

  return { homePath, basePath };
};

export default useUserPath;
