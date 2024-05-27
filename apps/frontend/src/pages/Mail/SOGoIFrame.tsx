import React from 'react';
import IframeLayout from '@/components/layout/IframeLayout';
import useUserStore from '@/store/userStore';
import { useEncryption } from '@/hooks/mutations';

const SOGoIFrame: React.FC = () => {
  const { user, webdavKey } = useUserStore();

  const decryptedPassword = useEncryption({
    mode: 'decrypt',
    data: webdavKey,
    key: `${import.meta.env.VITE_WEBDAV_KEY}`,
  });

  const styleString = `
    <style>
      a[aria-label="Beenden"] {
        display: none;
      }
    </style>
  `;

  const loginScript = `
    ${styleString}
    function fillAndSubmitLoginForm() {
      console.info('fillAndSubmitLoginForm');
      const usernameField = document.getElementById('input_1');
      const passwordField = document.getElementById('passwordField');

      console.info('usernameField', usernameField);
      console.info('passwordField', passwordField);
      if (usernameField && passwordField) {
        usernameField.value = '${user}';
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
    console.info('logoutButton', logoutButton);
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
