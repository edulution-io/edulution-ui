import Conference from '@/pages/ConferencePage/dto/conference.dto';

const mockedConferences: Conference[] = [
  {
    name: 'Meeting 001',
    meetingID: '006654',
    creator: {
      label: 'agy-netzint-teacher',
      value: 'agy-netzint-teacher',
      username: 'agy-netzint-teacher',
    },
    password: undefined,
    isRunning: true,
    invitedAttendees: [
      {
        label: 'agy-netzint-teacher',
        value: 'agy-netzint-teacher',
        username: 'agy-netzint-teacher',
      },
      {
        label: 'agy-netzint-student',
        value: 'agy-netzint-student',
        username: 'agy-netzint-student',
      },
      {
        label: 'agy-netzint1',
        value: 'agy-netzint1',
        username: 'agy-netzint1',
      },
      {
        label: 'agy-netzint2',
        value: 'agy-netzint2',
        username: 'agy-netzint2',
      },
    ],
    joinedAttendees: [],
  },
  {
    name: 'Meeting 002',
    meetingID: '008944',
    creator: {
      label: 'agy-netzint1',
      value: 'agy-netzint1',
      username: 'agy-netzint1',
    },
    password: undefined,
    isRunning: true,
    invitedAttendees: [
      {
        label: 'agy-netzint-teacher',
        value: 'agy-netzint-teacher',
        username: 'agy-netzint-teacher',
      },
      {
        label: 'agy-netzint-student',
        value: 'agy-netzint-student',
        username: 'agy-netzint-student',
      },
      {
        label: 'agy-netzint1',
        value: 'agy-netzint1',
        username: 'agy-netzint1',
      },
      {
        label: 'agy-netzint2',
        value: 'agy-netzint2',
        username: 'agy-netzint2',
      },
    ],
    joinedAttendees: [
      {
        label: 'agy-netzint1',
        value: 'agy-netzint1',
        username: 'agy-netzint1',
      },
      {
        label: 'agy-netzint2',
        value: 'agy-netzint2',
        username: 'agy-netzint2',
      },
    ],
  },
];

export default mockedConferences;
