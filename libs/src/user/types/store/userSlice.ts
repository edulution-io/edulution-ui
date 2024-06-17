import { JwtUserWithLdapGroups } from '@libs/user/types/jwt/jwtUserWithLdapGroups';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import User from '@libs/user/types/user';

type UserSlice = {
  username: string;
  setUsername: (username: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  user: JwtUserWithLdapGroups | null;
  setUser: (user: JwtUser) => void;
  getUser: (username: string) => Promise<User | null>;
  updateUser: (username: string, user: User) => Promise<void>;
  isLoggedInInEduApi: boolean;
  setIsLoggedInInEduApi: (isLoggedIn: boolean) => void;
  eduApiToken: string;
  setEduApiToken: (eduApiToken: string) => void;
  webdavKey: string;
  setWebdavKey: (webdavKey: string) => void;
  isPreparingLogout: boolean;
  logout: () => Promise<void>;
  userIsLoading: boolean;
  userError: Error | null;
  resetUserSlice: () => void;
};

export default UserSlice;
