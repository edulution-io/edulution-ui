import { User } from '@/pages/ConferencePage/CreateConference/user';

type Attendee = Pick<User, 'firstName' | 'lastName' | 'username'> & {
  label: string;
  value: string;
};

export default Attendee;
