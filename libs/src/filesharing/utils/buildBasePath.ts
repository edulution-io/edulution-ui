import UserDto from '@libs/user/types/user.dto';

const buildBasePath = (user: UserDto | null): string => {
  const role = user?.ldapGroups?.roles[0];

  if (role === 'teacher') {
    return `${role}s`;
  }
  const userClass = user?.ldapGroups?.classes[0];
  return `${role}s/${userClass}`;
};

export default buildBasePath;
