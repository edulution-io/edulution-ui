import React from 'react';
import IframeLayout from '@/components/layout/IframeLayout';
import useUserStore from '@/store/userStore';

const SOGoIFrame: React.FC = () => {
  const { user, webdavKey } = useUserStore();

  const loginScript = `
    function fillAndSubmitLoginForm() {
      const usernameField = document.getElementById('input_1');
      const passwordField = document.getElementById('passwordField');

      if (usernameField && passwordField) {
        usernameField.value = '${user}';
        usernameField.dispatchEvent(new Event('input', { bubbles: true }));

        passwordField.value = '${webdavKey}';
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
  `;

  const logoutScript = `
    const logoutButton = document.querySelector('a.md-icon-button.md-button.md-ink-ripple[ng-href="../logoff"][aria-label="Beenden"][href="../logoff"]');
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
