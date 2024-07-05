import User from '@libs/user/types/user';

type AttendeeDto = Pick<User, 'firstName' | 'lastName' | 'username'> & {
  label: string;
  value: string;
};

export default AttendeeDto;
