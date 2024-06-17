import { User } from '@libs/conferences/types/user';

type Attendee = Pick<User, 'firstName' | 'lastName' | 'username'> & {
  label: string;
  value: string;
};

export default Attendee;
