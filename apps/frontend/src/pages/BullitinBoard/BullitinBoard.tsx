import React from 'react';
import { Accordion } from '@radix-ui/react-accordion';
import useIsMobileView from '@/hooks/useIsMobileView';
import BullitinBoardCategory from './BullitinBoardCategory';

const categories = [
  {
    value: '1',
    title: 'Schulveranstaltungen',
    content: [
      { id: '1', text: 'Jährlicher Sporttag: Nehmen Sie an einem Tag voller Spaß und Wettkampf teil.' },
      { id: '2', text: 'Wissenschaftsmesse: Präsentieren Sie Ihre Projekte und Experimente.' },
      { id: '3', text: 'Eltern-Lehrer-Treffen: Besprechen Sie den Fortschritt Ihres Kindes mit den Lehrern.' },
    ],
  },
  {
    value: '2',
    title: 'Akademische Programme',
    content: [
      {
        id: '4',
        text: 'Unsere Schule bietet eine Vielzahl von akademischen Programmen, die auf die unterschiedlichen Bedürfnisse unserer Schüler zugeschnitten sind. Von fortgeschrittenen Kursen bis hin zu speziellen Bildungsprogrammen bemühen wir uns, eine umfassende Ausbildung zu bieten, die die Schüler auf zukünftigen Erfolg vorbereitet. Unsere engagierten Lehrkräfte sind bestrebt, eine unterstützende und herausfordernde Lernumgebung zu schaffen.',
      },
      { id: '5', text: 'Außerschulische Aktivitäten: Nehmen Sie an Clubs, Sport und Kunst teil.' },
      { id: '6', text: 'Nachhilfeangebote: Erhalten Sie zusätzliche Hilfe in Fächern, die Sie herausfordernd finden.' },
    ],
  },
  {
    value: '3',
    title: 'Schulrichtlinien',
    content: [
      { id: '7', text: 'Anwesenheitspflicht: Regelmäßige Anwesenheit ist entscheidend für den akademischen Erfolg.' },
      { id: '8', text: 'Verhaltenskodex: Bewahren Sie respektvolles und verantwortungsbewusstes Verhalten.' },
      { id: '9', text: 'Kleiderordnung: Befolgen Sie die Richtlinien der Schule für angemessene Kleidung.' },
      {
        id: '10',
        text: 'Unsere Schulrichtlinien sind darauf ausgelegt, eine sichere und förderliche Lernumgebung für alle Schüler zu schaffen. Wir erwarten, dass die Schüler die Regeln und Vorschriften im Schülerhandbuch einhalten. Dazu gehören Richtlinien zur Anwesenheit, zum Verhalten, zur Kleiderordnung und zur akademischen Integrität. Durch die Einhaltung dieser Richtlinien können die Schüler zu einer positiven Schulkultur beitragen und ihr volles Potenzial ausschöpfen.',
      },
      { id: '11', text: 'Mobbingprävention: Melden Sie Vorfälle von Mobbing sofort.' },
      {
        id: '12',
        text: 'Gesundheit und Sicherheit: Befolgen Sie die Protokolle, um eine sichere Schulumgebung zu gewährleisten.',
      },
    ],
  },
  {
    value: '4',
    title: 'Schulressourcen',
    content: [
      { id: '13', text: 'Bibliothek: Greifen Sie auf eine Vielzahl von Büchern und digitalen Ressourcen zu.' },
      { id: '14', text: 'Beratungsdienste: Erhalten Sie Unterstützung bei akademischen und persönlichen Problemen.' },
      {
        id: '15',
        text: 'Ex ipsum sunt eiusmod sit deserunt irure non minim commodo culpa exercitation sint minim adipiscing velit commodo esse. Dolor ullamco aliquip excepteur consequat incididunt consectetur cupidatat commodo sunt fugiat magna cupidatat mollit. Laborum sint amet est nulla lorem ad lorem est lorem. Velit fugiat tempor laboris mollit labore sunt magna aliquip ad in consectetur amet ut quis proident minim amet adipiscing culpa. Cupidatat excepteur commodo voluptate voluptate minim velit incididunt irure qui enim officia veniam et ut ut. Aute id lorem ullamco ut enim fugiat veniam id consectetur incididunt ipsum aute reprehenderit velit. Nulla est ipsum magna aute ipsum do excepteur nulla est laboris irure fugiat incididunt cillum anim pariatur incididunt. Sint commodo cillum in sed ad adipiscing do fugiat minim non enim reprehenderit id eu ea proident dolor mollit sint. Consectetur esse labore labore anim velit sint adipiscing id eu qui dolore anim. Ipsum labore duis cillum ad culpa aliquip cillum labore cillum ex lorem pariatur nisi consectetur proident elit sint. Non amet eu voluptate excepteur non nulla aute eu sunt irure proident cupidatat nostrud. Voluptate ea ipsum culpa non cillum veniam excepteur irure et ipsum duis amet. Ut ipsum minim eu esse dolore reprehenderit cupidatat ea culpa consequat reprehenderit eiusmod commodo esse nulla. Magna nisi ipsum adipiscing eiusmod ea ut lorem dolore exercitation aliqua labore sunt exercitation consectetur labore. Laborum minim quis fugiat pariatur et dolor aute sint dolor officia proident minim nulla in. Velit adipiscing consectetur ea sit velit sunt dolor est et sunt labore reprehenderit sunt aliqua ullamco sit. Tempor labore pariatur do aute laboris cupidatat labore qui laboris elit dolore elit eu officia magna tempor sit occaecat. Nisi consectetur do aute ipsum ipsum proident tempor esse labore aliquip reprehenderit ea ad amet aliqua ea.',
      },
    ],
  },
  {
    value: '5',
    title: 'Gemeinschaftsbeteiligung',
    content: [
      { id: '16', text: 'Freiwilligenarbeit: Nehmen Sie an gemeinnützigen Projekten teil.' },
      { id: '17', text: 'Eltern-Lehrer-Vereinigung: Beteiligen Sie sich an Schulaktivitäten und Veranstaltungen.' },
      {
        id: '18',
        text: 'Fundraising-Veranstaltungen: Unterstützen Sie die Schule durch verschiedene Fundraising-Initiativen.',
      },
    ],
  },
];

const BullitinBoard: React.FC = () => {
  const isMobile = useIsMobileView();

  return (
    <div className="flex w-screen ">
      <Accordion
        type="multiple"
        className={`flex w-full space-x-8 ${isMobile ? 'flex-col items-start gap-4' : 'flex-row items-start justify-between'}`}
      >
        {categories.map((category) => (
          <div
            key={category.value}
            className="flex-shrink flex-grow p-4"
            style={{
              minWidth: `calc(100vw / ${categories.length} - 5vh)`,
              maxWidth: `calc(100vw / ${categories.length} - 5vh)`,
            }}
          >
            <BullitinBoardCategory
              value={category.value}
              title={category.title}
              content={category.content}
            />
          </div>
        ))}
      </Accordion>
    </div>
  );
};

export default BullitinBoard;
