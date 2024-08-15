import UserDto from '@libs/user/types/user.dto';

const buildHomePath = (user: UserDto | null): string => {
  const role = user?.ldapGroups?.roles[0];
  const username = user?.username;

  if (role === 'teacher') {
    return `${role}s/${username}`;
  }
  const userClass = user?.ldapGroups?.classes[0];
  return `${role}s/${userClass}/${username}`;
};

export default buildHomePath;
