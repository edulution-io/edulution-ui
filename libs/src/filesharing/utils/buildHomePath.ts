import UserDto from '@libs/user/types/user.dto';

const buildHomePath = (user: UserDto | null): string => {
  const role = user?.ldapGroups?.roles[0];
  const username = user?.username;
  const userClass = user?.ldapGroups?.classes[0];
  if (role === 'globaladministrator') {
    return 'global';
  }

  if (role === 'teacher') {
    return `${role}s/${username}`;
  }
  return `${role}s/${userClass}/${username}`;
};

export default buildHomePath;
