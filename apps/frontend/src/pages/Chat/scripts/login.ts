const getLoginScript = (user: string, password: string) => `
    function setNativeValue(element, value) {
      const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
      const prototype = Object.getPrototypeOf(element);
      const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
    
      if (valueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
      } else {
        valueSetter.call(element, value);
      }
    
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    function fillAndSubmitLoginForm() {
      const usernameField = document.getElementById('mx_LoginForm_username');
      const passwordField = document.getElementById('mx_LoginForm_password');
    
      if (usernameField && passwordField) {
        setNativeValue(usernameField, '${user}');
    
        setNativeValue(passwordField, '${password}');
      }
    
      const submitButton = document.querySelector('.mx_Login_submit');
      if (submitButton && !submitButton.disabled) {
        submitButton.click();
      }
    }
    
    document.addEventListener('DOMContentLoaded', function () {
      fillAndSubmitLoginForm();
    });
    
    // If DOMContentLoaded has already fired
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      fillAndSubmitLoginForm();
    }
  `;

export default getLoginScript;
