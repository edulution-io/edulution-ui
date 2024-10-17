const logoutScript = `
    function clearAllCookies() {
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
    }
    
    localStorage.clear();
    
    sessionStorage.clear();
    
    if ('caches' in window) {
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => caches.delete(key)));
        });
    }
    
    window.indexedDB.databases().then(databases => {
        databases.forEach(db => {
            window.indexedDB.deleteDatabase(db.name);
        });
    });
    
    clearAllCookies();
    
    window.location.reload();
  `;

export default logoutScript;
