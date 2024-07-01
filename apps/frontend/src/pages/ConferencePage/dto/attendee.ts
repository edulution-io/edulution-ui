import ConferenceUser from '@libs/conferences/types/conferenceUser';

type Attendee = Pick<ConferenceUser, 'firstName' | 'lastName' | 'username'> & {
  label: string;
  value: string;
};

export default Attendee;
