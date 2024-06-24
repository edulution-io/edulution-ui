import { User } from '@libs/conferences/types/user';

// TODO: NIEDUUI-288: replace with Attendee after attendee has moved in shared libs section
type Attendee = Pick<User, 'firstName' | 'lastName' | 'username'> & {
  label: string;
  value: string;
};

export default Attendee
