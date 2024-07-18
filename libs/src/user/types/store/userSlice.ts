import UserDto from '../user.dto';

type UserSlice = {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  user: UserDto | null;
  getUser: (username: string) => Promise<void>;
  createOrUpdateUser: (user: UserDto) => Promise<void>;
  updateUser: (username: string, user: UserDto) => Promise<void>;
  eduApiToken: string;
  setEduApiToken: (eduApiToken: string) => void;
  webdavKey: string;
  setWebdavKey: (webdavKey: string) => void;
  getWebdavKey: () => string;
  isPreparingLogout: boolean;
  logout: () => Promise<void>;
  userIsLoading: boolean;
  userError: Error | null;
  resetUserSlice: () => void;
};

export default UserSlice;
