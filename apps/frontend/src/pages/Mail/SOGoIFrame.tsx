import React from 'react';
import IframeLayout from '@/components/layout/IframeLayout';
import { useEncryption } from '@/hooks/mutations';
import useUserStore from '@/store/UserStore/UserStore';

const SOGoIFrame: React.FC = () => {
  const { username, webdavKey } = useUserStore();

  const decryptedPassword = useEncryption({
    mode: 'decrypt',
    data: webdavKey,
    key: `${import.meta.env.VITE_WEBDAV_KEY}`,
  });

  const loginScript = `
    function fillAndSubmitLoginForm() {
      const usernameField = document.getElementById('input_1');
      const passwordField = document.getElementById('passwordField');

      if (usernameField && passwordField) {
        usernameField.value = '${username}';
        usernameField.dispatchEvent(new Event('input', { bubbles: true }));

        passwordField.value = '${decryptedPassword}';
        passwordField.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const submitButton = document.querySelector('button[type="submit"]');
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
    const logoutButton = document.querySelector('a[aria-label="Beenden"]');
    if (logoutButton) {
      logoutButton.click();
    }
  `;

  return (
    <IframeLayout
      scriptOnStartUp={loginScript}
      scriptOnStop={logoutScript}
    />
  );
};

export default SOGoIFrame;
