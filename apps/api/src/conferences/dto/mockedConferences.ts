import { Conference } from '../conference.schema';

const mockedConferences: Conference[] = [
  {
    name: 'Lernhilfe',
    meetingID: '006654',
    creator: {
      firstName: '',
      lastName: 'Yuki Grün',
      username: 'yukigrun',
    },
    password: undefined,
    isRunning: false,
    invitedAttendees: [
      {
        firstName: 'Lea Lopez',
        lastName: 'agy-netzint-teacher',
        username: 'agy-netzint-teacher',
      },
      {
        firstName: 'Mia Kim',
        lastName: 'agy-netzint-student',
        username: 'agy-netzint-student',
      },
      {
        firstName: 'Emma Williams',
        lastName: 'agy-netzint1',
        username: 'agy-netzint1',
      },
      {
        firstName: 'Julia King',
        lastName: 'agy-netzint2',
        username: 'agy-netzint2',
      },
    ],
    joinedAttendees: [],
  },
  {
    name: 'Besprechung Klassenfahrt',
    meetingID: '008944',
    creator: {
      firstName: 'agy-netzint1',
      lastName: 'agy-netzint1',
      username: 'agy-netzint1',
    },
    password: undefined,
    isRunning: true,
    invitedAttendees: [
      {
        firstName: 'Emma',
        lastName: 'williams',
        username: 'willemm',
      },
      {
        firstName: 'agy-netzint-student',
        lastName: 'agy-netzint-student',
        username: 'agy-netzint-student',
      },
      {
        firstName: 'agy-netzint1',
        lastName: 'agy-netzint1',
        username: 'agy-netzint1',
      },
      {
        firstName: 'agy-netzint2',
        lastName: 'agy-netzint2',
        username: 'agy-netzint2',
      },
    ],
    joinedAttendees: [
      {
        firstName: 'Emma',
        lastName: 'Williams',
        username: 'agy-netzint1',
      },
      {
        firstName: 'Leon',
        lastName: 'Li',
        username: 'agy-netzint2',
      },
    ],
  },
];

export default mockedConferences;
