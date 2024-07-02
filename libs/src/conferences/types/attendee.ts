import User from '@libs/user/types/user';

type Attendee = Pick<User, 'firstName' | 'lastName' | 'username'> & {
  label: string;
  value: string;
};

export default Attendee;
