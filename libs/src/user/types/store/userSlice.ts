import AttendeeDto from '@libs/user/types/attendee.dto';
import UserDto from '../user.dto';

type UserSlice = {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  user: UserDto | null;
  getUser: (username: string) => Promise<void>;
  fetchUserAndUpdateInDatabase: () => Promise<void>;
  createOrUpdateUser: (user: UserDto) => Promise<void>;
  updateUser: (user: Partial<UserDto>) => Promise<void>;
  eduApiToken: string;
  setEduApiToken: (eduApiToken: string) => void;
  webdavKey: string;
  setWebdavKey: (webdavKey: string) => void;
  getWebdavKey: () => string;
  isPreparingLogout: boolean;
  logout: () => Promise<void>;
  userIsLoading: boolean;
  userError: Error | null;
  searchAttendees: (searchQuery: string) => Promise<AttendeeDto[]>;
  searchError: Error | null;
  searchIsLoading: boolean;
  resetUserSlice: () => void;
};

export default UserSlice;
