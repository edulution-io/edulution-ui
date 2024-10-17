const logoutScript = `
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const cookieName = cookie.split("=")[0].trim();
        const domainParts = window.location.hostname.split(".");
        while (domainParts.length > 0) {
            const domain = domainParts.join(".");
            const cookieBase = \`\${encodeURIComponent(cookieName)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=\`;
            document.cookie = cookieBase + domain;
            document.cookie = cookieBase + "." + domain;
            domainParts.shift();
        }
        document.cookie = \`\${encodeURIComponent(cookieName)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/\`;
    }

    window.location.reload();
  `;

export default logoutScript;
