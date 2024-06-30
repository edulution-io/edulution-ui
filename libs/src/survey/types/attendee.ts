import ConferenceUser from '@libs/conferences/types/conferenceUser';

// TODO: NIEDUUI-288: replace with Attendee after attendee has moved in shared libs section
type Attendee = Pick<ConferenceUser, 'firstName' | 'lastName' | 'username'> & {
  label: string;
  value: string;
};

export default Attendee;
