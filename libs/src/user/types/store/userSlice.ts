import AttendeeDto from '@libs/user/types/attendee.dto';
import UserLanguageType from '@libs/user/types/userLanguageType';
import UserDto from '../user.dto';

type UserSlice = {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  user: UserDto | null;
  getUser: (username: string) => Promise<void>;
  createOrUpdateUser: (user: UserDto) => Promise<UserDto | undefined>;
  updateUserLanguage: (language: UserLanguageType) => Promise<void>;
  updateUser: (user: Partial<UserDto>) => Promise<void>;
  eduApiToken: string;
  setEduApiToken: (eduApiToken: string) => void;
  getWebdavKey: () => Promise<string>;
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
