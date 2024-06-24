import React from 'react';
import { useEncryption } from '@/hooks/mutations';
import { APPS } from '@/datatypes/types';
import useUserStore from '@/store/UserStore/UserStore';
import NativeIframeLayout from '@/components/framing/NativeIframeLayout';

const LinuxmusterPage: React.FC = () => {
  const { username, webdavKey } = useUserStore();

  const decryptedPassword = useEncryption({
    mode: 'decrypt',
    data: webdavKey,
    key: `${import.meta.env.VITE_WEBDAV_KEY}`,
  });

  const loginScript = `
    function fillAndSubmitLoginForm() {
      const usernameField = document.querySelector('input[placeholder="Benutzername"]');
      const passwordField = document.querySelector('input[placeholder="Passwort"]');;

      if (usernameField && passwordField) {
        usernameField.value = '${username}';
        usernameField.dispatchEvent(new Event('input', { bubbles: true }));

        passwordField.value = '${decryptedPassword}';
        passwordField.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const submitButton = document.querySelector('a.btn.btn-primary.btn-block');
      if (submitButton && !submitButton.disabled) {
        submitButton.click();
      }
    }
    
    document.addEventListener('DOMContentLoaded', function() {
      fillAndSubmitLoginForm();
    });

    // If DOMContentLoaded has already fired
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      fillAndSubmitLoginForm();
    }
  `;

  const logoutScript = `
    const logoutButton = document.querySelector('a[ng\\\\:click="identity.logout()"]');
    if (logoutButton) {
      logoutButton.click();
    }
  `;

  return (
    <NativeIframeLayout
      scriptOnStartUp={loginScript}
      scriptOnStop={logoutScript}
      appName={APPS.LINUXMUSTER}
    />
  );
};

export default LinuxmusterPage;
