import React from 'react';

const ChatSetup = () => {
  return (
    <div className="mb-4 rounded-lg p-6 shadow-lg">
      <h2 className="mb-4 text-2xl font-semibold">Chat Setup</h2>
      <ol className="list-inside list-decimal space-y-2">
        <li className="text-lg">
          <strong>Chat-Anwendung öffnen:</strong> Geben Sie die Domain in Ihren Webbrowser ein.
        </li>
        <li className="text-lg">
          <strong>Anmelden:</strong> Verwenden Sie Ihren LDAP-Benutzernamen und Ihr Passwort.
        </li>
        <li className="text-lg">
          <strong>Chat-Raum betreten:</strong> Wählen oder erstellen Sie einen Chat-Raum.
        </li>
        <li className="text-lg">
          <strong>Nachrichten senden:</strong> Geben Sie Ihre Nachricht ein und senden Sie sie.
        </li>
        <li className="text-lg">
          <strong>Benachrichtigungen:</strong> Achten Sie auf Hinweise über neue Nachrichten.
        </li>
      </ol>
    </div>
  );
};

export default ChatSetup;
