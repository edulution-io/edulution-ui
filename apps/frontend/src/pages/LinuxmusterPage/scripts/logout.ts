const logoutScript = `
    const logoutButton = document.querySelector('a[ng\\:click="identity.logout()"]');
    if (logoutButton) {
      logoutButton.click();
    }
  `;

export default logoutScript;
