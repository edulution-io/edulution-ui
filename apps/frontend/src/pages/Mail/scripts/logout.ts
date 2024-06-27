const logoutScript = `
    const logoutButton = document.querySelector('md-icon[aria-label="settings_power"]');

    if (logoutButton) {
      logoutButton.click();
    }
  `;

export default logoutScript;
