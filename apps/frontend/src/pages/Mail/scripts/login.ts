const getLoginScript = (user: string, password: string) => `
    function fillAndSubmitLoginForm() {
      const usernameField = document.getElementById('mx_LoginForm_username');
      const passwordField = document.getElementById('mx_LoginForm_password');

      if (usernameField && passwordField) {
        usernameField.value = '${user}';
        usernameField.dispatchEvent(new Event('input', { bubbles: true }));

        passwordField.value = '${password}';
        passwordField.dispatchEvent(new Event('input', { bubbles: true }));

        const submitButton = document.querySelector('.mx_Login_submit');
        if (submitButton && !submitButton.disabled) {
          submitButton.click();
        }
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
