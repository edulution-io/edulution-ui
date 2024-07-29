import useUserStore from '@/store/UserStore/UserStore';
import { useAuth } from 'react-oidc-context';
import cleanAllStores from '@/store/utilis/cleanAllStores';

const useLogout = () => {
  const auth = useAuth();
  const { logout } = useUserStore();

  const handleLogout = async () => {
    await auth.removeUser();
    await logout();
    cleanAllStores();
  };

  return { handleLogout };
};

export default useLogout;
