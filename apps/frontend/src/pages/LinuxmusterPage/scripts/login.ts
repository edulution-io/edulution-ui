const getLoginScript = (user: string, password: string) => `
    function fillAndSubmitLoginForm() {
      const usernameField = document.querySelector('input[ng\\:model="username"]');
      const passwordField = document.querySelector('input[ng\\:model="password"]');

      if (usernameField && passwordField) {
        usernameField.value = '${user}';
        usernameField.dispatchEvent(new Event('input', { bubbles: true }));

        passwordField.value = '${password}';
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

export default getLoginScript;
