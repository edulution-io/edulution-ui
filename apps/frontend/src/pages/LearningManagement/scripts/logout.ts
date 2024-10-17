const logoutScript = `
    const cookies = document.cookie.split(";");
  
    for (let cookie of cookies) {
      const cookieName = cookie.split("=")[0].trim();
      
      document.cookie = \`\${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/\`;
    }
  `;

export default logoutScript;
