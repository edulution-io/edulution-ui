import UserDto from '@libs/user/types/user.dto';

type AttendeeDto = Pick<UserDto, 'firstName' | 'lastName' | 'username'> & {
  label: string;
  value: string;
};

export default AttendeeDto;
