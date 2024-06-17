const logoutScript = `
    const logoutButton = document.querySelector('a[aria-label="Beenden"]');

    if (logoutButton) {
      logoutButton.click();
    }
  `;

export default logoutScript;
