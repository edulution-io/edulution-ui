import React from 'react';
import i1 from './chat-images/windows-1.png';
import i2 from './chat-images/windows-3.png';
import i3 from './chat-images/windows-5.png';
import a1 from './chat-images/android-1.jpg';
import a2 from './chat-images/android-2.jpg';
import a3 from './chat-images/android-3.jpg';

const ChatSetup = () => {
  return (
    <div className="mb-4 rounded-lg p-6 shadow-lg">
      <h2 className="mb-4 text-2xl font-semibold">Netzint Chat Matrix</h2>
      <p>
        Für die interne Kommunikation wird bei Netzint "Matrix" verwendet. Dabei gibt es folgende{' '}
        <strong>Spaces</strong>:
      </p>
      <ul className="mb-4 list-inside list-disc">
        <li>Netzint</li>
        <li>Events</li>
        <li>Arbeitskreise</li>
        <li>Standortbezogene Spaces</li>
      </ul>
      <p>
        Jeder Space ist untergliedert in verschiedene Räume zu speziellen Themen. Die meisten Räume sind für alle
        Space-Mitglieder frei zugänglich, es können jedoch auch private Räume erstellt werden. Die frei zugänglichen
        Räume im Space <strong>Netzint</strong> sind:
      </p>
      <ul className="mb-4 list-inside list-disc">
        <li>Open: Allgemeine Infos, interessante News zu betrieblichen Themen</li>
        <li>Important: Wichtige Infos, z.B. aktuelle Sicherheitslücken, wichtige Störungen</li>
        <li>Kaffeeküche: Alles ist erlaubt :-)</li>
        <li>Abwesenheit: Meldung von Abwesenheiten einzelner Personen, z.B. Krankheit, Urlaub</li>
      </ul>
      <p>
        Generell ist es sinnvoll eine Antwort auf eine Nachricht als "Thread" abzuspalten. Somit ist der Lesefluss in
        den einzelnen Räumen nicht gestört und andere Nutzer können auswählen, welche Themen bzw. Threads für sie
        interessant sind und welche nicht.
      </p>

      <h3 className="mt-4 text-xl font-semibold">Installation</h3>
      <p>
        Es gibt einige Clients zur Auswahl, sie sollten alle untereinander funktionieren.{' '}
        <a
          href="https://matrix.org/ecosystem/clients/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          Hier
        </a>{' '}
        gibt es eine Übersicht. In dieser Dokumentation wird die App "Element" verwendet. Auch "Cinny" ist bereits
        erfolgreich im Einsatz. Es ist möglich, sich auf mehreren Clients synchron einzuloggen (z.B. Smartphone und
        Desktop), dazu muss man diese aber immer wieder mit einem bereits eingeloggten Client freigeben - aufgrund der
        Verifizierung und Verschlüsselung. Der Key sollte an einem sicheren Ort abgespeichert werden (z.B.
        Passwort-Manager).
      </p>

      <h4 className="mt-4 text-lg font-semibold">Desktop-Client</h4>
      <p>
        <a
          href="https://packages.riot.im/desktop/install/win32/x64/Element%20Setup.exe"
          className="text-blue-500 underline"
        >
          Desktop-Client
        </a>{' '}
        herunterladen & installieren.
      </p>
      <p>Auf Einloggen / Sign in klicken. Der Account existiert bereits via AD.</p>
      <img
        src={i1}
        alt="Step 1"
        className="my-4"
      />
      <p>Den Homeserver "matrix.org" ändern via Edit.</p>
      <p>"matrix.netzint.de" als Homeserver eintragen und auf weiter / continue klicken.</p>
      <img
        src={i2}
        alt="Step 3"
        className="my-4"
      />
      <p>Einloggen mit AD-Login: vorname.nachname (ohne @netzint.de am Ende) + AD-Passwort.</p>
      <p>Willkommen im lokalen Client.</p>
      <img
        src={i3}
        alt="Step 5"
        className="my-4"
      />

      <h4 className="mt-4 text-lg font-semibold">Mobile-Client</h4>
      <p>
        Smartphone-Client für{' '}
        <a
          href="https://play.google.com/store/apps/details?id=im.vector.app"
          className="text-blue-500 underline"
        >
          Android
        </a>{' '}
        oder{' '}
        <a
          href="https://apps.apple.com/us/app/element-messenger/id1083446067"
          className="text-blue-500 underline"
        >
          iPhone
        </a>{' '}
        herunterladen und installieren. "Ich habe bereits ein Konto" wählen, da der Account bereits existiert via AD.
      </p>
      <img
        src={a1}
        alt="Step 1"
        className="my-4"
      />
      <p>"matrix.org" bearbeiten...</p>
      <p>"matrix.netzint.de" eintragen und weiter klicken.</p>
      <img
        src={a2}
        alt="Step 3"
        className="my-4"
      />
      <p>Einloggen mit AD-Login: vorname.nachname (ohne @netzint.de am Ende) + AD-Passwort.</p>
      <p>Willkommen im mobilen Client.</p>
      <img
        src={a3}
        alt="Step 5"
        className="my-4"
      />

      <h4 className="mt-4 text-lg font-semibold">Web-Client</h4>
      <p>
        Falls keine Client-Installation gewünscht ist, kann auch der{' '}
        <a
          href="https://chat.netzint.de"
          className="text-blue-500 underline"
        >
          Element-Webclient
        </a>{' '}
        (selfhosted) verwendet werden. Auf Einloggen / Sign in klicken, der Account existiert bereits via AD.
      </p>
    </div>
  );
};

export default ChatSetup;
