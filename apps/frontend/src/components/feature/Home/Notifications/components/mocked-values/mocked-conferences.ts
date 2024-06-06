import Conference from '@/pages/ConferencePage/dto/conference.dto';

const mockedConferences: Conference[] = [
  {
    name: 'Lernhilfe',
    meetingID: '006654',
    creator: {
      label: '',
      value: 'Yuki Grün',
      username: 'yukigrun',
    },
    password: undefined,
    isRunning: false,
    invitedAttendees: [
      {
        label: 'Lea Lopez',
        value: 'agy-netzint-teacher',
        username: 'agy-netzint-teacher',
      },
      {
        label: 'Mia Kim',
        value: 'agy-netzint-student',
        username: 'agy-netzint-student',
      },
      {
        label: 'Emma Williams',
        value: 'agy-netzint1',
        username: 'agy-netzint1',
      },
      {
        label: 'Julia King',
        value: 'agy-netzint2',
        username: 'agy-netzint2',
      },
    ],
    joinedAttendees: [],
  },
  {
    name: 'Besprechung Klassenfahrt',
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
        label: 'Emma Williams',
        value: 'willemm',
        username: 'willemm',
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
        label: 'Emma Williams',
        value: 'Emma',
        username: 'agy-netzint1',
      },
      {
        label: 'Leon Li',
        value: 'agy-netzint2',
        username: 'agy-netzint2',
      },
    ],
  },
];

export default mockedConferences;
