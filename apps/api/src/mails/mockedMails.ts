import MailDto from '@libs/dashboard/types/mail.dto';

const mockedMails: MailDto[] = [
  {
    id: '6c84fb90-12c4-11e1-840d-7b25c5ee775a',
    name: 'Emma Lee',
    email: 'leeem@demo.multi.schule',
    subject: 'Klassenarbeit',
    text: 'Hi zusammen, wann ist nochmals die Matherarbeit? Grüße Emma',
    date: '2023-10-22T09:00:00',
    read: false,
    labels: ['Klassen', 'Orga', 'Exkrusion'],
  },
  {
    id: '110e8400-e29b-11d4-a716-446655440000',
    name: 'Julia King',
    email: 'juliaking@demo.multi.schule',
    subject: 'Re: Ausflug',
    text: 'Hallo Herr Grün, wegen der Exkursion ins Schulmuseum. Ich hoffe, das klappt. Vielen Dank, Julia',
    date: '2023-10-22T10:30:00',
    read: true,
    labels: ['Klassenarbeit', 'Orga'],
  },
  {
    id: '17c0a96d-4415-42b1-8b4f-764efab57f66',
    name: 'Finn Schneider',
    email: 'schneifi@demo.multi.schule',
    subject: 'Schülervertretung',
    text: 'Sehr geehrter Frau Green, nächste Woche findet die Wahl zur Schülervertretung statt. Wäre schön wenn Sie dabei wären. Freundliche Grüsse, Finn Schneider',
    date: '2023-01-28T17:45:00',
    read: false,
    labels: ['Orga'],
  },
];

export default mockedMails;
